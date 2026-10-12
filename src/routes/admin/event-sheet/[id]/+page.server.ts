import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The event sheet moved under its aanvraag. Keep old links working.
export const load: PageServerLoad = ({ params }) => {
	redirect(308, `/admin/aanvragen/${params.id}/event-sheet`);
};
