import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { notifyError } from '$lib/server/notify';
import { ADMIN_COOKIE, verifyToken } from '$lib/server/admin-auth';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;

	if (path === '/blog/burrata-bruiloft') {
		throw redirect(301, '/blog/burrata-catering');
	}

	if (path.startsWith('/admin')) {
		const isLogin = path === '/admin/login';
		// The ICS calendar feed is token-gated in its own handler — calendar apps
		// can't send the admin cookie, so it must bypass the cookie auth gate.
		const isCalendarFeed = path === '/admin/calendar.ics';
		const token = event.cookies.get(ADMIN_COOKIE);
		const authed = await verifyToken(token);
		event.locals.adminAuthed = authed;
		if (!authed && !isLogin && !isCalendarFeed) {
			const next = encodeURIComponent(path + event.url.search);
			throw redirect(303, `/admin/login?next=${next}`);
		}
	}

	const lang = path.startsWith('/en') ? 'en' : 'nl';
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});

	if (path.startsWith('/images/optimized/')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	}

	return response;
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
