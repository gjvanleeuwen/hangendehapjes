import { fail } from '@sveltejs/kit';
import { listDeals, saveInvoice, saveQuoteVersion } from '$lib/server/deals';
import { activeQuoteOf, normalizeQuoteVersions } from '$lib/deals';
import { peekSequence, reserveInvoiceNumber } from '$lib/server/invoices';
import { INVOICE_PREFIX } from '$lib/admin/business';
import { docFigures } from '$lib/admin/document';
import type { DocumentState } from '$lib/admin/types';
import type { Actions, PageServerLoad } from './$types';

type DocTexts = {
	notes: string;
	terms: string;
	footerNote: string;
	paymentInstructions?: string;
	paymentTermDays?: number;
};

// The deal itself comes from ../+layout.server.ts.
export const load: PageServerLoad = async ({ parent }) => {
	const { deal } = await parent();

	// De offerte waar de klant ja op zei is de bron voor de eerste factuur.
	const acceptedQuote = deal.acceptedTermsAt ? activeQuoteOf(deal) : null;

	// Start every new document with the texts of the last one we actually
	// saved (any aanvraag), so a reworded "Betaling & voorwaarden" carries over
	// instead of being reset to a hardcoded default each time.
	const all = await listDeals();
	const newest = <T extends { createdAt: string }>(items: T[]) =>
		items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
	const lastQuote = newest(all.flatMap((d) => d.quoteVersions));
	const lastInvoice = newest(all.flatMap((d) => d.invoices));

	const latestTexts: { offerte: DocTexts | null; factuur: DocTexts | null } = {
		offerte: lastQuote
			? { notes: lastQuote.notes, terms: lastQuote.terms, footerNote: lastQuote.footerNote }
			: null,
		factuur: lastInvoice
			? {
					notes: lastInvoice.doc.notes,
					terms: lastInvoice.doc.terms,
					footerNote: lastInvoice.doc.footerNote,
					paymentInstructions: lastInvoice.doc.paymentInstructions,
					paymentTermDays: lastInvoice.doc.paymentTermDays
				}
			: null
	};

	return {
		acceptedQuote,
		latestTexts,
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

	/** Put this factuur in the klantportaal (same factuurnummer replaces it). */
	saveInvoice: async ({ request }) => {
		const fd = await request.formData();
		const dealId = String(fd.get('dealId') ?? '').trim();
		let doc: DocumentState;
		try {
			doc = JSON.parse(String(fd.get('doc') ?? ''));
		} catch {
			return fail(400, { error: 'Factuurgegevens konden niet gelezen worden.' });
		}
		if (!dealId || !doc || doc.kind !== 'factuur' || !Array.isArray(doc.lineItems)) {
			return fail(400, { error: 'Factuurgegevens zijn niet geldig.' });
		}
		const number = String(doc.number ?? '').trim();
		if (!number) {
			return fail(400, { error: 'Geef de factuur eerst een factuurnummer ("Volgend nummer").' });
		}

		const updated = await saveInvoice(dealId, {
			id: crypto.randomUUID(),
			number,
			createdAt: new Date().toISOString(),
			amountDue: docFigures(doc).amountDue,
			doc
		});
		if (!updated) return fail(404, { error: 'Aanvraag niet gevonden.' });
		return { savedInvoice: number };
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
