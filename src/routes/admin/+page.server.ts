import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The admin opens on the aanvragen list (agenda on top). Metrics live on /admin/analytics.
export const load: PageServerLoad = () => {
	redirect(303, '/admin/aanvragen');
};
