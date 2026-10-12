import { error } from '@sveltejs/kit';
import { getDeal } from '$lib/server/deals';
import { addDays, todayStr } from '$lib/server/admin/deal-actions';
import type { LayoutServerLoad } from './$types';

// Everything under /admin/aanvragen/[id] (overzicht, portaal, calculator,
// offerte/factuur, event sheet) is a view of one aanvraag. Load it once here;
// every sub-page gets `deal`, `origin`, `today` and `soon` in its data.
export const load: LayoutServerLoad = async ({ params, url }) => {
	const deal = await getDeal(params.id);
	if (!deal) throw error(404, 'Aanvraag niet gevonden');
	const today = todayStr();
	return { deal, origin: url.origin, today, soon: addDays(today, 7) };
};
