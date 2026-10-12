import { isActionFailure, redirect } from '@sveltejs/kit';
import {
	deleteDealAction,
	deleteQuoteAction,
	extendAcceptanceAction,
	generateAcceptanceAction,
	logFollowUpAction,
	setQuoteVisibilityAction,
	updateDealAction
} from '$lib/server/admin/deal-actions';
import type { Actions } from './$types';

// Data (deal, origin, today, soon) comes from ../+layout.server.ts.

export const actions: Actions = {
	update: updateDealAction,
	generateAcceptance: generateAcceptanceAction,
	setQuoteVisibility: setQuoteVisibilityAction,
	deleteQuote: deleteQuoteAction,
	logFollowUp: logFollowUpAction,
	extendAcceptance: extendAcceptanceAction,
	delete: async (event) => {
		const result = await deleteDealAction(event);
		if (isActionFailure(result)) return result;
		redirect(303, '/admin/aanvragen');
	}
};
