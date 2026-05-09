import { fail, redirect, type Actions } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { ADMIN_COOKIE, tokenFor, verifyPassword } from '$lib/server/admin-auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.adminAuthed) {
		const next = url.searchParams.get('next') || '/admin';
		throw redirect(303, next);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const password = String(data.get('password') ?? '');
		if (!(await verifyPassword(password))) {
			return fail(401, { error: 'Onjuist wachtwoord.' });
		}
		const token = await tokenFor();
		if (!token) return fail(500, { error: 'ADMIN_PASSWORD niet ingesteld.' });
		cookies.set(ADMIN_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
		const next = url.searchParams.get('next') || '/admin';
		throw redirect(303, next);
	}
};
