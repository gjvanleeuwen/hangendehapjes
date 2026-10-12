import { error } from '@sveltejs/kit';
import { getDealByAcceptanceToken } from '$lib/server/deals';
import { invoicePaymentStatus } from '$lib/deals';
import type { PageServerLoad } from './$types';

const tokenPattern = /^[A-Za-z0-9_-]{24,120}$/;

// One factuur we put in the portal, exactly as it was saved.
export const load: PageServerLoad = async ({ params }) => {
	if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
	const deal = await getDealByAcceptanceToken(params.token);
	if (!deal) throw error(404, 'Niet gevonden');
	const invoice = deal.invoices.find((i) => i.id === params.invoiceId);
	if (!invoice) throw error(404, 'Factuur niet gevonden');
	return {
		doc: invoice.doc,
		number: invoice.number,
		paid: invoicePaymentStatus(invoice, deal) === 'paid',
		token: params.token
	};
};
