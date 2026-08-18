import { fail, redirect } from '@sveltejs/kit';
import { getDeal, saveQuoteVersion } from '$lib/server/deals';
import { activeQuoteOf, normalizeQuoteVersions } from '$lib/deals';
import { peekSequence, reserveInvoiceNumber } from '$lib/server/invoices';
import { INVOICE_PREFIX } from '$lib/admin/business';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const dealId = url.searchParams.get('deal') ?? '';
	if (!dealId) throw redirect(303, '/admin/aanvragen?add=1');
	const deal = dealId ? await getDeal(dealId) : null;
	if (!deal) throw redirect(303, '/admin/aanvragen');

	// De offerte waar de klant ja op zei is de bron voor de eerste factuur.
	const acceptedQuote = deal.acceptedTermsAt ? activeQuoteOf(deal) : null;

	return {
		deal,
		acceptedQuote,
		invoicePrefix: INVOICE_PREFIX,
		sequence: await peekSequence(INVOICE_PREFIX, new Date().getFullYear())
	};
};

export const actions: Actions = {
	saveQuote: async ({ request }) => {
		const fd = await request.formData();
		const dealId = String(fd.get('dealId') ?? '').trim();
		const raw = String(fd.get('quote') ?? '');
		if (!dealId || !raw) return fail(400, { error: 'Deal of offerte ontbreekt.' });

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return fail(400, { error: 'Offertegegevens konden niet gelezen worden.' });
		}

		const [quote] = normalizeQuoteVersions([parsed]);
		if (!quote) return fail(400, { error: 'Offertegegevens zijn niet geldig.' });

		const updated = await saveQuoteVersion(dealId, quote, true);
		if (!updated) return fail(404, { error: 'Aanvraag niet gevonden.' });
		return { savedQuote: true };
	},

	reserveNumber: async ({ request }) => {
		const fd = await request.formData();
		const prefix = String(fd.get('prefix') ?? '').trim();
		const dealId = String(fd.get('dealId') ?? '').trim();
		const year = new Date().getFullYear();

		const number = await reserveInvoiceNumber(prefix, year, dealId || null);
		if (!number) {
			return fail(400, {
				error:
					'Kon geen factuurnummer uitgeven. Controleer de letters (2-4 hoofdletters) en of de database bereikbaar is.'
			});
		}
		return { invoiceNumber: number, sequence: await peekSequence(prefix, year) };
	}
};
