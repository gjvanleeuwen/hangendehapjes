import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { notifyError } from '$lib/server/notify';
import { ADMIN_COOKIE, verifyToken } from '$lib/server/admin-auth';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;

	if (path.startsWith('/admin')) {
		const isLogin = path === '/admin/login';
		const token = event.cookies.get(ADMIN_COOKIE);
		const authed = await verifyToken(token);
		event.locals.adminAuthed = authed;
		if (!authed && !isLogin) {
			const next = encodeURIComponent(path + event.url.search);
			throw redirect(303, `/admin/login?next=${next}`);
		}
	}

	const lang = path.startsWith('/en') ? 'en' : 'nl';
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
