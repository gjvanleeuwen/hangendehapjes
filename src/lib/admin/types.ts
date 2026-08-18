export type DocumentKind = 'offerte' | 'factuur' | 'kwitantie';

export type BtwRate = 0 | 9 | 21 | 'none';

export type DiscountMode = 'pct' | 'amount';

/**
 * Wat voor factuur dit is. In Nederland is een aanbetalingsfactuur een gewone
 * factuur: hij moet aan dezelfde eisen voldoen en de btw wordt op dat moment
 * verschuldigd. Op de eindfactuur zet je daarom het volledige bedrag en trek je
 * de al gefactureerde aanbetaling er inclusief btw weer vanaf, met verwijzing
 * naar het eerdere factuurnummer. Zo betaalt de klant de btw niet twee keer.
 */
export type InvoiceType = 'volledig' | 'aanbetaling' | 'eind';

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

/** Onze eigen gegevens op het document. Per document aanpasbaar zodat een andere
 *  handelsnaam of adres geen codewijziging vraagt. */
export interface Issuer {
	/** Merknaam, staat als wordmark bovenaan het document. */
	name: string;
	/** Statutaire naam van de onderneming. Dit is de partij die factureert en die
	 *  op een factuur vermeld moet staan; de merknaam alleen volstaat niet. */
	legalName: string;
	addressLine1: string;
	addressLine2: string;
	email: string;
	iban: string;
	kvk: string;
	btwId: string;
}

export interface DocumentState {
	kind: DocumentKind;
	number: string;
	date: string;
	eventDate: string;
	validUntil: string;
	paidOn: string;
	issuer: Issuer;
	recipient: Recipient;
	lineItems: LineItem[];
	discountMode: DiscountMode;
	discountValue: number;
	notes: string;
	terms: string;
	footerNote: string;
	// --- alleen relevant bij kind === 'factuur' ---
	invoiceType: InvoiceType;
	/** Percentage van het totaal dat deze aanbetalingsfactuur in rekening brengt. */
	prepaymentPct: number;
	/** Eerdere aanbetalingsfactuur waar de eindfactuur naar terugverwijst. */
	priorInvoiceNumber: string;
	priorInvoiceDate: string;
	/** Al gefactureerd bedrag inclusief btw, wordt van het totaal afgetrokken. */
	priorInvoiceAmount: number;
	/** Betaalinstructie onderaan de factuur, vrij te bewerken. */
	paymentInstructions: string;
	paymentTermDays: number;
}
