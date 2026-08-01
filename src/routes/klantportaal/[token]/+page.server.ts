import { error, fail } from '@sveltejs/kit';
import { getDealByAcceptanceToken, updateDeal, type DealInput } from '$lib/server/deals';
import { TERMS_VERSION, toPublicQuote } from '$lib/deals';
import { sendPortalAcceptedEmails } from '$lib/server/portal-email';
import type { Actions, PageServerLoad } from './$types';

const tokenPattern = /^[A-Za-z0-9_-]{24,120}$/;

const str = (fd: FormData, key: string, max = 3000): string =>
	String(fd.get(key) ?? '')
		.trim()
		.slice(0, max);

const publicDeal = (deal: Awaited<ReturnType<typeof getDealByAcceptanceToken>>) => {
	if (!deal) throw error(404, 'Niet gevonden');
	return {
		name: deal.name,
		eventDate: deal.eventDate,
		eventDateText: deal.eventDateText,
		location: deal.location,
		guests: deal.guests,
		serviceType: deal.serviceType,
		choice: deal.choice,
		offerteAmount: deal.offerteAmount,
		geldigTot: deal.geldigTot,
		acceptedTermsAt: deal.acceptedTermsAt,
		acceptedByName: deal.acceptedByName,
		acceptedAtLocation: deal.acceptedAtLocation,
		depositAmount: deal.depositAmount,
		depositLink: deal.depositLink,
		depositStatus: deal.depositStatus,
		finalPaymentAmount: deal.finalPaymentAmount,
		finalPaymentLink: deal.finalPaymentLink,
		finalPaymentStatus: deal.finalPaymentStatus,
		quoteVersions: deal.quoteVersions.map(toPublicQuote),
		activeQuoteId: deal.activeQuoteId,
		portalQuestionsEnabled: deal.portalQuestionsEnabled,
		// `notes` is internal and deliberately absent here; `portalNote` is the
		// client-facing one.
		portalNote: deal.portalNote,
		opsQuestions: deal.opsQuestions.filter((q) => q.enabled),
		opsJson: deal.opsJson,
		opsCompletedAt: deal.opsCompletedAt
	};
};

export const load: PageServerLoad = async ({ params }) => {
	if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
	const deal = await getDealByAcceptanceToken(params.token);
	return { deal: publicDeal(deal), termsVersion: TERMS_VERSION, token: params.token };
};

export const actions: Actions = {
	save: async ({ params, request, url, getClientAddress }) => {
		if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
		const deal = await getDealByAcceptanceToken(params.token);
		if (!deal) throw error(404, 'Niet gevonden');

		const fd = await request.formData();

		// After the first accept the signature block is collapsed in the UI, so
		// the terms checkbox and signer fields are no longer submitted. Only
		// validate them on the run that actually captures the signature —
		// otherwise every later "save my answers" would fail on missing fields.
		const alreadySigned = Boolean(deal.acceptedTermsAt);
		const acceptedByName = alreadySigned ? deal.acceptedByName : str(fd, 'acceptedByName', 160);
		const acceptedAtLocation = alreadySigned
			? deal.acceptedAtLocation
			: str(fd, 'acceptedAtLocation', 160);

		if (!alreadySigned) {
			if (str(fd, 'terms', 10) !== 'yes') {
				return fail(400, {
					error: 'Je moet akkoord gaan met de offerte en voorwaarden voordat we dit kunnen opslaan.'
				});
			}
			if (!acceptedByName || !acceptedAtLocation) {
				return fail(400, {
					error:
						'Vul je volledige naam en plaats van ondertekening in voor de digitale handtekening.'
				});
			}
		}

		// Merge onto what is already stored instead of rebuilding from scratch: a
		// field that wasn't submitted at all (question disabled since the last
		// save, a partial post) must keep its previous answer rather than be
		// blanked. Keys that are present win, including deliberately cleared ones.
		const opsJson: Record<string, string> = { ...deal.opsJson };
		const enabledQuestions = deal.portalQuestionsEnabled
			? deal.opsQuestions.filter((question) => question.enabled)
			: [];
		for (const q of enabledQuestions) {
			if (!fd.has(q.key)) continue;
			opsJson[q.key] = str(fd, q.key);
		}

		const signedAt = new Date().toISOString();
		const activeQuote =
			deal.quoteVersions.find((q) => q.id === deal.activeQuoteId) ??
			deal.quoteVersions.find((q) => q.active);
		const termsSummary = [
			'Door dit formulier te verzenden en dit vakje aan te vinken plaats ik een digitale handtekening.',
			'Ik ga akkoord met de offerte, de algemene voorwaarden, de praktische afspraken en de aanbetaling.',
			'Ik begrijp dat de boeking pas definitief is nadat Hangende Hapjes de aanbetaling heeft ontvangen.',
			'De aanbetaling wordt verrekend met de eindfactuur.'
		];

		const acceptanceSnapshot = {
			signedAt,
			termsVersion: TERMS_VERSION,
			termsUrl: '/terms',
			termsSummary,
			signer: {
				fullName: acceptedByName,
				location: acceptedAtLocation
			},
			request: {
				ip: getClientAddress(),
				userAgent: request.headers.get('user-agent') ?? ''
			},
			quote: {
				name: deal.name,
				eventDate: deal.eventDate,
				eventDateText: deal.eventDateText,
				location: deal.location,
				guests: deal.guests,
				serviceType: deal.serviceType,
				choice: deal.choice,
				offerteAmount: deal.offerteAmount,
				geldigTot: deal.geldigTot,
				depositAmount: deal.depositAmount,
				depositStatus: deal.depositStatus,
				finalPaymentAmount: deal.finalPaymentAmount,
				finalPaymentStatus: deal.finalPaymentStatus,
				activeQuoteId: deal.activeQuoteId,
				activeQuote,
				quoteVersions: deal.quoteVersions,
				portalQuestionsEnabled: deal.portalQuestionsEnabled
			},
			questions: enabledQuestions.map((q) => ({
				key: q.key,
				label: q.label,
				answer: opsJson[q.key] ?? ''
			}))
		};

		// Practical answers stay editable so details can be completed later.
		const fields: Partial<DealInput> = {
			opsJson,
			opsCompletedAt: signedAt
		};

		// The signature is captured exactly once. After the first accept the
		// signer identity, terms version and snapshot are frozen: anyone who
		// still has the link can re-open the portal, but can no longer rewrite
		// who signed or the recorded evidence.
		if (!alreadySigned) {
			fields.acceptedTermsAt = signedAt;
			fields.acceptedTermsVersion = TERMS_VERSION;
			fields.acceptedByName = acceptedByName;
			fields.acceptedAtLocation = acceptedAtLocation;
			fields.acceptanceSnapshot = acceptanceSnapshot;
		}

		await updateDeal(deal.id, fields);

		// Confirmation goes out only on the run that captured the signature, so
		// re-saving practical details later never re-sends it. Fired after the
		// write succeeds and awaited-but-never-thrown inside, so a mail outage
		// can't undo an acceptance that is already stored.
		if (!alreadySigned) {
			await sendPortalAcceptedEmails(
				{
					name: deal.name,
					email: deal.email,
					eventDate: deal.eventDate,
					eventDateText: deal.eventDateText,
					location: deal.location,
					guests: deal.guests,
					offerteAmount: deal.offerteAmount,
					depositAmount: deal.depositAmount,
					acceptedByName,
					acceptedAtLocation
				},
				new URL(`/klantportaal/${params.token}`, url.origin).toString()
			);
		}

		return { saved: true, accepted: !alreadySigned };
	}
};
