import { error, fail } from '@sveltejs/kit';
import { getDealByAcceptanceToken, updateDeal, type DealInput } from '$lib/server/deals';
import { TERMS_VERSION, toPublicQuote } from '$lib/deals';
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
	save: async ({ params, request, getClientAddress }) => {
		if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
		const deal = await getDealByAcceptanceToken(params.token);
		if (!deal) throw error(404, 'Niet gevonden');

		const fd = await request.formData();
		if (str(fd, 'terms', 10) !== 'yes') {
			return fail(400, {
				error: 'Je moet akkoord gaan met de offerte en voorwaarden voordat we dit kunnen opslaan.'
			});
		}

		const acceptedByName = str(fd, 'acceptedByName', 160);
		const acceptedAtLocation = str(fd, 'acceptedAtLocation', 160);
		if (!acceptedByName || !acceptedAtLocation) {
			return fail(400, {
				error: 'Vul je volledige naam en plaats van ondertekening in voor de digitale handtekening.'
			});
		}

		const opsJson: Record<string, string> = {};
		const enabledQuestions = deal.portalQuestionsEnabled
			? deal.opsQuestions.filter((question) => question.enabled)
			: [];
		for (const q of enabledQuestions) {
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
		if (!deal.acceptedTermsAt) {
			fields.acceptedTermsAt = signedAt;
			fields.acceptedTermsVersion = TERMS_VERSION;
			fields.acceptedByName = acceptedByName;
			fields.acceptedAtLocation = acceptedAtLocation;
			fields.acceptanceSnapshot = acceptanceSnapshot;
		}

		await updateDeal(deal.id, fields);
		return { saved: true };
	}
};
