import type { Handle, HandleServerError } from '@sveltejs/kit';
import { notifyError } from '$lib/server/notify';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.url.pathname.startsWith('/en') ? 'en' : 'nl';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};

const SILENT_STATUSES = new Set([404, 405]);

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	if (!SILENT_STATUSES.has(status)) {
		void notifyError(error, {
			source: 'unhandled server error',
			url: event.url.pathname + event.url.search,
			method: event.request.method,
			status
		});
	}
	return { message };
};
