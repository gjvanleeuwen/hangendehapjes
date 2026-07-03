import { error } from '@sveltejs/kit';
import { getDeal } from '$lib/server/deals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const deal = await getDeal(params.id);
	if (!deal) throw error(404, 'Aanvraag niet gevonden');
	return { deal };
};
