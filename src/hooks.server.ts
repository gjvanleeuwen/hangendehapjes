import type { Handle, HandleServerError } from '@sveltejs/kit';
import { notifyError } from '$lib/server/notify';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.url.pathname.startsWith('/en') ? 'en' : 'nl';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	void notifyError(error, {
		source: 'unhandled server error',
		url: event.url.pathname + event.url.search,
		method: event.request.method,
		status
	});
	return { message };
};
