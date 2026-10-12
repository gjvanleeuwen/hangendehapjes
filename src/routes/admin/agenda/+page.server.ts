import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The agenda lives on top of the aanvragen page now.
export const load: PageServerLoad = () => {
	redirect(308, '/admin/aanvragen');
};
