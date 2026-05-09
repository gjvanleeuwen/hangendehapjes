export type DocumentKind = 'offerte' | 'factuur' | 'kwitantie';

export type BtwRate = 0 | 9 | 21 | 'none';

export interface LineItem {
	description: string;
	qty: number;
	unitPrice: number;
	btwRate: BtwRate;
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
	notes: string;
}
