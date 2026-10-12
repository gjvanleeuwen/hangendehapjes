// Shared figures for an offerte / factuur / kwitantie: what the builder shows
// while you edit, and what the klantportaal shows once a factuur is sent. One
// place, so the document a client opens is the one you made.
import { calcTotals, formatEUR, round2 } from '$lib/admin/calc';
import type { DocumentState } from '$lib/admin/types';

export function docFigures(doc: DocumentState) {
	const totals = calcTotals(doc.lineItems, { mode: doc.discountMode, value: doc.discountValue });

	// What is actually due at the bottom. An aanbetalingsfactuur bills a share of
	// the total; an eindfactuur subtracts what was already invoiced (incl. btw,
	// otherwise the btw on that share would be paid twice).
	const prepaymentAmount = round2(
		totals.total * (Math.max(0, Math.min(100, doc.prepaymentPct)) / 100)
	);
	const amountDue =
		doc.kind !== 'factuur'
			? totals.total
			: doc.invoiceType === 'aanbetaling'
				? prepaymentAmount
				: doc.invoiceType === 'eind'
					? round2(Math.max(0, totals.total - Math.max(0, doc.priorInvoiceAmount)))
					: totals.total;

	const invoiceTypeLabel =
		doc.invoiceType === 'aanbetaling'
			? `Aanbetalingsfactuur (${doc.prepaymentPct}%)`
			: doc.invoiceType === 'eind'
				? 'Eindfactuur'
				: 'Factuur';

	// Placeholders so the payment line follows the amount, term and number.
	const paymentInstructionsText = doc.paymentInstructions
		.replaceAll('{IBAN}', doc.issuer.iban || '—')
		.replaceAll('{NAAM}', doc.issuer.legalName || doc.issuer.name || '—')
		.replaceAll('{MERK}', doc.issuer.name || '—')
		.replaceAll('{NUMMER}', doc.number || '—')
		.replaceAll('{BEDRAG}', formatEUR(amountDue))
		.replaceAll('{DAGEN}', String(doc.paymentTermDays));

	const headingLabel =
		doc.kind === 'offerte' ? 'Offerte' : doc.kind === 'factuur' ? 'Factuur' : 'Kwitantie';

	const allNoVat = doc.lineItems.every((l) => l.btwRate === 'none');
	const showBtwColumn = doc.kind !== 'kwitantie' && !allNoVat;
	const showBtwBreakdown = doc.kind !== 'kwitantie' && totals.btwGroups.length > 0;
	const hasDiscount = totals.lineDiscountTotal > 0 || totals.totalDiscount > 0;

	return {
		totals,
		prepaymentAmount,
		amountDue,
		invoiceTypeLabel,
		paymentInstructionsText,
		headingLabel,
		allNoVat,
		showBtwColumn,
		showBtwBreakdown,
		hasDiscount,
		showSummaryDetail: showBtwBreakdown || hasDiscount,
		totalDiscountLabel: doc.discountMode === 'pct' ? `Korting ${doc.discountValue}%` : 'Korting'
	};
}

/** Terms text split per line, with "algemene voorwaarden" turned into a link. */
export function termsParts(terms: string) {
	const phrase = 'algemene voorwaarden';
	return terms.split('\n').map((line) => {
		const index = line.toLowerCase().indexOf(phrase);
		return {
			before: index >= 0 ? line.slice(0, index) : line,
			link: index >= 0 ? line.slice(index, index + phrase.length) : '',
			after: index >= 0 ? line.slice(index + phrase.length) : ''
		};
	});
}
