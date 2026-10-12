import {
	deleteInvoiceAction,
	deleteQuoteAction,
	extendAcceptanceAction,
	generateAcceptanceAction,
	setQuoteVisibilityAction,
	updateDealAction
} from '$lib/server/admin/deal-actions';
import type { Actions } from './$types';

// Data (deal, origin, today, soon) comes from ../+layout.server.ts.

export const actions: Actions = {
	update: updateDealAction,
	generateAcceptance: generateAcceptanceAction,
	extendAcceptance: extendAcceptanceAction,
	setQuoteVisibility: setQuoteVisibilityAction,
	deleteQuote: deleteQuoteAction,
	deleteInvoice: deleteInvoiceAction
};
