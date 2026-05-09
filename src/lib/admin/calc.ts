import type { BtwRate, LineItem } from './types';

export interface BtwGroup {
	rate: 0 | 9 | 21;
	base: number;
	tax: number;
}

export interface Totals {
	subtotal: number;
	btwGroups: BtwGroup[];
	noVatBase: number;
	total: number;
}

export function lineSubtotal(item: LineItem): number {
	return item.qty * item.unitPrice;
}

export function calcTotals(items: LineItem[]): Totals {
	const grouped = new Map<0 | 9 | 21, number>();
	let subtotal = 0;
	let noVatBase = 0;
	for (const item of items) {
		const base = lineSubtotal(item);
		subtotal += base;
		if (item.btwRate === 'none') {
			noVatBase += base;
		} else {
			grouped.set(item.btwRate, (grouped.get(item.btwRate) ?? 0) + base);
		}
	}
	const btwGroups: BtwGroup[] = Array.from(grouped.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([rate, base]) => ({ rate, base, tax: round2(base * (rate / 100)) }));
	const totalTax = btwGroups.reduce((sum, g) => sum + g.tax, 0);
	return {
		subtotal: round2(subtotal),
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
