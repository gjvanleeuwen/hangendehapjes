import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// With ?deal=… the calculator belongs to that aanvraag: send old links there.
export const load: PageServerLoad = ({ url }) => {
	const deal = url.searchParams.get('deal');
	if (deal) redirect(308, `/admin/aanvragen/${deal}/calculator`);
	return {};
};
