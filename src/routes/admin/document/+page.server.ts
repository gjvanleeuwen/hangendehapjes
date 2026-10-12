import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Offerte and factuur moved under their aanvraag:
// /admin/aanvragen/[id]/document?kind=…  Keep old links (and bookmarks) working.
export const load: PageServerLoad = ({ url }) => {
	const deal = url.searchParams.get('deal');
	if (!deal) redirect(303, '/admin/aanvragen/nieuw');
	const rest = new URLSearchParams(url.searchParams);
	rest.delete('deal');
	const qs = rest.toString();
	redirect(308, `/admin/aanvragen/${deal}/document${qs ? `?${qs}` : ''}`);
};
