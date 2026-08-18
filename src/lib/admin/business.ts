import type { Issuer } from './types';

export const BUSINESS: Issuer = {
	name: 'Hangende Hapjes',
	addressLine1: 'Hilvertsweg 128',
	addressLine2: '1214 JK Hilversum',
	email: 'info@hangendehapjes.nl',
	iban: 'NL18 BUNQ 2193 7422 35',
	kvk: '',
	btwId: ''
};

/**
 * Factuurnummers lopen per handelsnaam in een eigen reeks: HH-2026-0001. De
 * letters staan voor het bedrijfsonderdeel, zodat een tweede label binnen
 * dezelfde onderneming zijn eigen doorlopende nummering houdt zonder gaten in
 * die van Hangende Hapjes te slaan.
 */
export const INVOICE_PREFIX = 'HH';

/** Twee tot vier hoofdletters; de reeks in de database hangt aan deze sleutel. */
export const INVOICE_PREFIX_PATTERN = /^[A-Z]{2,4}$/;

export function formatInvoiceNumber(prefix: string, year: number, seq: number): string {
	return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
}
