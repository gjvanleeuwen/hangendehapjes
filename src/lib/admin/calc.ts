import type { BtwRate, DiscountMode, LineItem } from './types';

export interface BtwGroup {
	rate: 0 | 9 | 21;
	base: number;
	tax: number;
}

export interface Totals {
	grossSubtotal: number;
	lineDiscountTotal: number;
	totalDiscount: number;
	subtotal: number;
	btwGroups: BtwGroup[];
	noVatBase: number;
	total: number;
}

/** Bruto regelbedrag, vóór korting. */
export function lineSubtotal(item: LineItem): number {
	return item.qty * item.unitPrice;
}

export function lineDiscountAmount(item: LineItem): number {
	const pct = Math.max(0, item.discountPct ?? 0);
	return round2(lineSubtotal(item) * (pct / 100));
}

/** Regelbedrag na regelkorting (vóór totaalkorting en BTW). */
export function lineNet(item: LineItem): number {
	return round2(lineSubtotal(item) - lineDiscountAmount(item));
}

export function calcTotals(
	items: LineItem[],
	discount: { mode: DiscountMode; value: number } = { mode: 'pct', value: 0 }
): Totals {
	let grossSubtotal = 0;
	let lineDiscountTotal = 0;
	let netSubtotal = 0;
	for (const item of items) {
		grossSubtotal += lineSubtotal(item);
		lineDiscountTotal += lineDiscountAmount(item);
		netSubtotal += lineNet(item);
	}
	grossSubtotal = round2(grossSubtotal);
	lineDiscountTotal = round2(lineDiscountTotal);
	netSubtotal = round2(netSubtotal);

	// Totaalkorting werkt op het bedrag ná regelkortingen.
	const rawDiscount =
		discount.mode === 'amount'
			? Math.max(0, discount.value)
			: netSubtotal * (Math.max(0, discount.value) / 100);
	const totalDiscount = round2(Math.min(rawDiscount, netSubtotal));

	// Verdeel de totaalkorting evenredig over de regels, zodat de BTW-grondslag klopt.
	const docFactor = netSubtotal > 0 ? (netSubtotal - totalDiscount) / netSubtotal : 0;

	const grouped = new Map<0 | 9 | 21, number>();
	let noVatBase = 0;
	for (const item of items) {
		const base = round2(lineNet(item) * docFactor);
		if (item.btwRate === 'none') {
			noVatBase += base;
		} else {
			grouped.set(item.btwRate, (grouped.get(item.btwRate) ?? 0) + base);
		}
	}
	const btwGroups: BtwGroup[] = Array.from(grouped.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([rate, base]) => ({ rate, base: round2(base), tax: round2(base * (rate / 100)) }));
	const totalTax = btwGroups.reduce((sum, g) => sum + g.tax, 0);
	const subtotal = round2(netSubtotal - totalDiscount);
	return {
		grossSubtotal,
		lineDiscountTotal,
		totalDiscount,
		subtotal,
		btwGroups,
		noVatBase: round2(noVatBase),
		total: round2(subtotal + totalTax)
	};
}

export function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function formatEUR(n: number): string {
	return new Intl.NumberFormat('nl-NL', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2
	}).format(n);
}

export function formatDateNL(iso: string): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long' }).format(d);
}

export function formatBtw(rate: BtwRate): string {
	return rate === 'none' ? 'n.v.t.' : `${rate}%`;
}
