import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Half-finished aanvragen now live in the main list. Keep old links working.
export const load: PageServerLoad = () => {
	redirect(308, '/admin/aanvragen?filter=half');
};
