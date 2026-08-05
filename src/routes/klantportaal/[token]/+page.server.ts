import { error, fail } from '@sveltejs/kit';
import { getDealByAcceptanceToken, updateDeal, type DealInput } from '$lib/server/deals';
import {
	OPS_AUDIT_LIMIT,
	TERMS_VERSION,
	clientVisibleQuotes,
	termsSummaryFor,
	toPublicQuote,
	type OpsAuditEntry
} from '$lib/deals';
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
		paymentTerm: deal.paymentTerm,
		acceptedTermsAt: deal.acceptedTermsAt,
		acceptedByName: deal.acceptedByName,
		acceptedAtLocation: deal.acceptedAtLocation,
		depositAmount: deal.depositAmount,
		depositLink: deal.depositLink,
		depositStatus: deal.depositStatus,
		finalPaymentAmount: deal.finalPaymentAmount,
		finalPaymentLink: deal.finalPaymentLink,
		finalPaymentStatus: deal.finalPaymentStatus,
		quoteVersions: clientVisibleQuotes(deal).map(toPublicQuote),
		activeQuoteId: deal.activeQuoteId,
		portalQuestionsEnabled: deal.portalQuestionsEnabled,
		// `notes` is internal and deliberately absent here; `portalNote` is the
		// client-facing one. So are the two audit trails — `acceptedIp`,
		// `acceptedUserAgent` and `opsAudit` are evidence we keep, not something
		// to hand back to the browser.
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

/**
 * Two independent actions on purpose.
 *
 * `accept` is a one-shot legal event: it records who signed, when, from where,
 * and a frozen snapshot of exactly what they agreed to. `saveOps` is ongoing
 * housekeeping that anyone holding the link may repeat any number of times.
 * Sharing one submit between them meant a practical-info edit re-ran the
 * acceptance code path and re-stamped `opsCompletedAt` as if it were a signing
 * timestamp. Split, neither can contaminate the other's record.
 */
export const actions: Actions = {
	accept: async ({ params, request, url, getClientAddress }) => {
		if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
		const deal = await getDealByAcceptanceToken(params.token);
		if (!deal) throw error(404, 'Niet gevonden');

		// The signature is captured exactly once. Anyone who still has the link
		// can re-open the portal, but can no longer rewrite who signed or the
		// recorded evidence.
		if (deal.acceptedTermsAt) {
			return fail(400, { error: 'Er is al akkoord gegeven op deze offerte.' });
		}

		const fd = await request.formData();
		const acceptedByName = str(fd, 'acceptedByName', 160);
		const acceptedAtLocation = str(fd, 'acceptedAtLocation', 160);

		if (str(fd, 'terms', 10) !== 'yes') {
			return fail(400, {
				error: 'Je moet akkoord gaan met de offerte en voorwaarden voordat we dit kunnen opslaan.'
			});
		}
		if (!acceptedByName || !acceptedAtLocation) {
			return fail(400, {
				error: 'Vul je volledige naam en plaats van ondertekening in voor de digitale handtekening.'
			});
		}

		const signedAt = new Date().toISOString();
		const signerIp = getClientAddress();
		const signerUserAgent = request.headers.get('user-agent') ?? '';
		const activeQuote =
			deal.quoteVersions.find((q) => q.id === deal.activeQuoteId) ??
			deal.quoteVersions.find((q) => q.active);
		// Exactly the lines the portal rendered next to the checkbox, taken from the
		// same helper, so the frozen evidence can never describe different terms
		// than the ones that were on screen.
		const termsSummary = termsSummaryFor(deal.paymentTerm);
		const enabledQuestions = deal.portalQuestionsEnabled
			? deal.opsQuestions.filter((question) => question.enabled)
			: [];

		const acceptanceSnapshot = {
			signedAt,
			termsVersion: TERMS_VERSION,
			termsUrl: '/terms',
			paymentTerm: deal.paymentTerm,
			termsSummary,
			signer: {
				fullName: acceptedByName,
				location: acceptedAtLocation
			},
			request: {
				ip: signerIp,
				userAgent: signerUserAgent
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
			// The answers as they stood at signing. Later edits go to opsJson and
			// this copy stays put, so we can always show what was agreed to.
			questions: enabledQuestions.map((q) => ({
				key: q.key,
				label: q.label,
				answer: deal.opsJson[q.key] ?? ''
			}))
		};

		// Note what is absent: no opsJson, no opsCompletedAt. Accepting does not
		// touch the practical answers.
		const fields: Partial<DealInput> = {
			acceptedTermsAt: signedAt,
			acceptedTermsVersion: TERMS_VERSION,
			acceptedByName,
			acceptedAtLocation,
			acceptedIp: signerIp,
			acceptedUserAgent: signerUserAgent,
			acceptanceSnapshot
		};

		await updateDeal(deal.id, fields);

		// Fired after the write succeeds, and awaited-but-never-thrown inside, so
		// a mail outage can't undo an acceptance that is already stored.
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

		return { accepted: true };
	},

	saveOps: async ({ params, request, getClientAddress }) => {
		if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
		const deal = await getDealByAcceptanceToken(params.token);
		if (!deal) throw error(404, 'Niet gevonden');

		if (!deal.portalQuestionsEnabled) {
			return fail(400, { error: 'De praktische vragen staan voor deze offerte uit.' });
		}

		const fd = await request.formData();

		// Merge onto what is already stored instead of rebuilding from scratch: a
		// field that wasn't submitted at all (question disabled since the last
		// save, a partial post) must keep its previous answer rather than be
		// blanked. Keys that are present win, including deliberately cleared ones.
		const opsJson: Record<string, string> = { ...deal.opsJson };
		const submittedKeys: string[] = [];
		for (const q of deal.opsQuestions.filter((question) => question.enabled)) {
			if (!fd.has(q.key)) continue;
			opsJson[q.key] = str(fd, q.key);
			submittedKeys.push(q.key);
		}

		const savedAt = new Date().toISOString();

		// Own trail, own session data. Whoever is filling in venue details weeks
		// after the signature is often not the person who signed.
		const entry: OpsAuditEntry = {
			savedAt,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent') ?? '',
			keys: submittedKeys
		};

		await updateDeal(deal.id, {
			opsJson,
			opsCompletedAt: savedAt,
			opsAudit: [...deal.opsAudit, entry].slice(-OPS_AUDIT_LIMIT)
		});

		return { savedOps: true };
	}
};
