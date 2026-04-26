import { json } from '@sveltejs/kit';
import { ServerClient } from 'postmark';
import * as v from 'valibot';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { notifyError } from '$lib/server/notify';
import { PayloadSchema, type Clean } from '$lib/server/contact-schema';
import type { RequestHandler } from './$types';

const CONTACT_TO = 'info@hangendehapjes.nl';
const CONTACT_FROM = 'aanvragen@hangendehapjes.nl';
const RATE_LIMIT_MS = 60_000;
const INVALID_NOTIFY_THROTTLE_MS = 5 * 60_000;

const lastSubmission = new Map<string, number>();
const lastInvalidNotify = new Map<string, number>();

const buildConfirmation = (clean: Clean) => {
	const isNl = clean.locale !== 'en';

	const labels = isNl
		? {
				phone: 'Telefoon',
				eventDate: 'Datum',
				location: 'Locatie',
				guests: 'Aantal gasten',
				interests: 'Interesse',
				message: 'Bericht'
			}
		: {
				phone: 'Phone',
				eventDate: 'Date',
				location: 'Location',
				guests: 'Number of guests',
				interests: 'Interest',
				message: 'Message'
			};

	const summary = [
		clean.phone ? `${labels.phone}: ${clean.phone}` : null,
		clean.eventDate ? `${labels.eventDate}: ${clean.eventDate}` : null,
		clean.location ? `${labels.location}: ${clean.location}` : null,
		clean.guests ? `${labels.guests}: ${clean.guests}` : null,
		clean.interests.length ? `${labels.interests}: ${clean.interests.join(', ')}` : null,
		'',
		`${labels.message}:`,
		clean.message
	].filter((line): line is string => line !== null);

	if (isNl) {
		return {
			subject: 'Bedankt voor je aanvraag — Hangende Hapjes',
			text: [
				`Hi ${clean.name},`,
				'',
				'Bedankt voor je berichtje! We hebben je aanvraag goed ontvangen.',
				'',
				'Dit is wat je ons stuurde:',
				'',
				...summary,
				'',
				'—',
				'',
				'We reageren meestal binnen 1–2 dagen met een voorstel op maat. Tot snel!',
				'',
				'Charlotte & Gijs',
				'Hangende Hapjes',
				'info@hangendehapjes.nl'
			].join('\n')
		};
	}

	return {
		subject: 'Thanks for your inquiry — Hangende Hapjes',
		text: [
			`Hi ${clean.name},`,
			'',
			'Thanks for your note! We’ve received your inquiry.',
			'',
			'Here’s what you sent us:',
			'',
			...summary,
			'',
			'—',
			'',
			'We usually reply within 1–2 days with a tailored proposal. Talk soon!',
			'',
			'Charlotte & Gijs',
			'Hangende Hapjes',
			'info@hangendehapjes.nl'
		].join('\n')
	};
};

const pruneOlderThan = (map: Map<string, number>, now: number, ms: number) => {
	for (const [k, t] of map) if (now - t > ms) map.delete(k);
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress();
	const now = Date.now();

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_body' }, { status: 400 });
	}

	if (
		raw &&
		typeof raw === 'object' &&
		'website' in raw &&
		typeof (raw as { website: unknown }).website === 'string' &&
		(raw as { website: string }).website.length > 0
	) {
		return json({ ok: true });
	}

	const result = v.safeParse(PayloadSchema, raw);
	if (!result.success) {
		pruneOlderThan(lastInvalidNotify, now, INVALID_NOTIFY_THROTTLE_MS);
		const lastNotif = lastInvalidNotify.get(ip) ?? 0;
		if (now - lastNotif > INVALID_NOTIFY_THROTTLE_MS) {
			lastInvalidNotify.set(ip, now);
			void notifyError(new Error('contact form validation failed'), {
				source: 'contact form — validation',
				url: '/api/contact',
				method: 'POST',
				status: 400,
				extra: {
					ip,
					issues: result.issues.map((i) => ({
						path: i.path?.map((p) => String((p as { key: unknown }).key)).join('.') ?? '',
						message: i.message,
						received:
							typeof i.input === 'string' ? i.input.slice(0, 50) : typeof i.input
					}))
				}
			});
		}
		return json({ ok: false, error: 'invalid_input' }, { status: 400 });
	}

	const clean = result.output;

	pruneOlderThan(lastSubmission, now, RATE_LIMIT_MS);
	const last = lastSubmission.get(ip) ?? 0;
	if (now - last < RATE_LIMIT_MS) {
		return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}
	lastSubmission.set(ip, now);

	const lines = [
		`Naam: ${clean.name}`,
		`Email: ${clean.email}`,
		clean.phone ? `Telefoon: ${clean.phone}` : null,
		clean.eventDate ? `Datum: ${clean.eventDate}` : null,
		clean.location ? `Locatie: ${clean.location}` : null,
		clean.guests ? `Aantal gasten: ${clean.guests}` : null,
		clean.interests.length ? `Interesse: ${clean.interests.join(', ')}` : null,
		`Taal: ${clean.locale}`,
		'',
		'Bericht:',
		clean.message
	].filter(Boolean);

	const token = env.POSTMARK_TOKEN;
	const confirmation = buildConfirmation(clean);

	if (!token) {
		if (dev) {
			console.log('[contact] dev mode, no Postmark token — would have sent:\n', lines.join('\n'));
			console.log(
				'[contact] dev mode, would have sent confirmation to',
				clean.email,
				'\n',
				confirmation.text
			);
			return json({ ok: true });
		}
		console.error('[contact] POSTMARK_TOKEN is not configured');
		void notifyError(new Error('POSTMARK_TOKEN is not configured'), {
			source: 'contact form',
			url: '/api/contact',
			method: 'POST',
			status: 500
		});
		return json({ ok: false, error: 'not_configured' }, { status: 500 });
	}

	const client = new ServerClient(token);

	try {
		await client.sendEmail({
			From: CONTACT_FROM,
			To: CONTACT_TO,
			ReplyTo: `${clean.name} <${clean.email}>`,
			Subject: `Nieuwe aanvraag — ${clean.name}`,
			TextBody: lines.join('\n'),
			MessageStream: 'outbound'
		});
	} catch (err) {
		console.error('[contact] Postmark send failed', err);
		void notifyError(err, {
			source: 'contact form — admin email',
			url: '/api/contact',
			method: 'POST',
			status: 502,
			extra: { from: CONTACT_FROM, to: CONTACT_TO, submitter: clean.email }
		});
		return json({ ok: false, error: 'send_failed' }, { status: 502 });
	}

	try {
		await client.sendEmail({
			From: CONTACT_FROM,
			To: `${clean.name} <${clean.email}>`,
			ReplyTo: CONTACT_TO,
			Subject: confirmation.subject,
			TextBody: confirmation.text,
			MessageStream: 'outbound'
		});
	} catch (err) {
		console.error('[contact] Postmark confirmation send failed', err);
		void notifyError(err, {
			source: 'contact form — confirmation email (non-fatal)',
			url: '/api/contact',
			method: 'POST',
			extra: { from: CONTACT_FROM, to: clean.email }
		});
	}

	return json({ ok: true });
};
