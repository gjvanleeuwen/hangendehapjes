import { saveEventSheetAction } from '$lib/server/admin/deal-actions';
import type { Actions } from './$types';

// The deal comes from ../+layout.server.ts.
export const actions: Actions = {
	save: saveEventSheetAction
};
