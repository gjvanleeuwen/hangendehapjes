import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Renamed to Analytics.
export const load: PageServerLoad = () => {
	redirect(308, '/admin/analytics');
};
