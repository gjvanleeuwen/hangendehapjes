import { error } from '@sveltejs/kit';
import { getLocation } from '$lib/catering/content';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const content = getLocation('en', params.slug);
	if (!content) {
		throw error(404, 'This catering page does not exist.');
	}
	return { content };
};
