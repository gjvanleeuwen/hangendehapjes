import { redirect } from '@sveltejs/kit';
import { isDbConfigured } from '$lib/server/db';
import { createDealAction } from '$lib/server/admin/deal-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ dbConfigured: isDbConfigured() });

export const actions = {
	create: async (event) => {
		const result = await createDealAction(event);
		// A failure carries no id: hand it back to the form as-is.
		if (!('id' in result)) return result;
		// Straight on to the new deal, so the next step (status, offerte) is one tab away.
		redirect(303, result.id ? `/admin/aanvragen/${result.id}` : '/admin/aanvragen');
	}
} satisfies Actions;
