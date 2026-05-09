import { env } from '$env/dynamic/private';

export const ADMIN_COOKIE = 'hh_admin';

async function sha256Hex(value: string): Promise<string> {
	const data = new TextEncoder().encode(value);
	const buf = await crypto.subtle.digest('SHA-256', data);
	const bytes = new Uint8Array(buf);
	let out = '';
	for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
	return out;
}

function constantTimeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let r = 0;
	for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return r === 0;
}

export async function tokenFor(): Promise<string | null> {
	const pw = env.ADMIN_PASSWORD;
	if (!pw) return null;
	return sha256Hex(pw);
}

export async function verifyPassword(submitted: string): Promise<boolean> {
	const pw = env.ADMIN_PASSWORD;
	if (!pw || !submitted) return false;
	const [a, b] = await Promise.all([sha256Hex(pw), sha256Hex(submitted)]);
	return constantTimeEqual(a, b);
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
	const expected = await tokenFor();
	if (!expected || !token) return false;
	return constantTimeEqual(expected, token);
}
