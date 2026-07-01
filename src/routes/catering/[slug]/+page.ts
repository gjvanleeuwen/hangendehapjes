import { error } from '@sveltejs/kit';
import { getLocation } from '$lib/catering/content';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const content = getLocation('nl', params.slug);
	if (!content) {
		throw error(404, 'Deze cateringpagina bestaat niet.');
	}
	return { content };
};
