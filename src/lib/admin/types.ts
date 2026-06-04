export type DocumentKind = 'offerte' | 'factuur' | 'kwitantie';

export type BtwRate = 0 | 9 | 21 | 'none';

export type DiscountMode = 'pct' | 'amount';

export interface LineItem {
	description: string;
	qty: number;
	unitPrice: number;
	btwRate: BtwRate;
	discountPct: number;
}

export interface Recipient {
	name: string;
	company: string;
	address: string;
}

export interface DocumentState {
	kind: DocumentKind;
	number: string;
	date: string;
	validUntil: string;
	paidOn: string;
	recipient: Recipient;
	lineItems: LineItem[];
	discountMode: DiscountMode;
	discountValue: number;
	notes: string;
}
