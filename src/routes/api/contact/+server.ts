import { json } from '@sveltejs/kit';
import { ServerClient } from 'postmark';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { notifyError } from '$lib/server/notify';
import type { RequestHandler } from './$types';

const CONTACT_TO = 'info@hangendehapjes.nl';
const CONTACT_FROM = 'aanvragen@hangendehapjes.nl';
const RATE_LIMIT_MS = 60_000;

const lastSubmission = new Map<string, number>();

type Payload = {
	name?: string;
	email?: string;
	phone?: string;
	eventDate?: string;
	location?: string;
	guests?: string;
	interests?: string[];
	message?: string;
	website?: string;
	locale?: 'nl' | 'en';
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const safeName = (s: string) => s.replace(/[<>"\\\r\n]/g, '').trim().slice(0, 100);

const buildConfirmation = (
	locale: 'nl' | 'en',
	name: string,
	body: Payload,
	message: string
) => {
	const isNl = locale !== 'en';

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
		body.phone ? `${labels.phone}: ${body.phone}` : null,
		body.eventDate ? `${labels.eventDate}: ${body.eventDate}` : null,
		body.location ? `${labels.location}: ${body.location}` : null,
		body.guests ? `${labels.guests}: ${body.guests}` : null,
		body.interests?.length ? `${labels.interests}: ${body.interests.join(', ')}` : null,
		'',
		`${labels.message}:`,
		message
	].filter((line): line is string => line !== null);

	if (isNl) {
		return {
			subject: 'Bedankt voor je aanvraag — Hangende Hapjes',
			text: [
				`Hi ${name},`,
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
			`Hi ${name},`,
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

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: Payload;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_body' }, { status: 400 });
	}

	if (body.website && body.website.length > 0) {
		return json({ ok: true });
	}

	const name = safeName(body.name ?? '');
	const email = body.email?.trim() ?? '';
	const message = body.message?.trim() ?? '';

	if (!name || !email || !message || !isEmail(email)) {
		return json({ ok: false, error: 'invalid_input' }, { status: 400 });
	}

	const ip = getClientAddress();
	const last = lastSubmission.get(ip) ?? 0;
	if (Date.now() - last < RATE_LIMIT_MS) {
		return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}
	lastSubmission.set(ip, Date.now());

	const lines = [
		`Naam: ${name}`,
		`Email: ${email}`,
		body.phone ? `Telefoon: ${body.phone}` : null,
		body.eventDate ? `Datum: ${body.eventDate}` : null,
		body.location ? `Locatie: ${body.location}` : null,
		body.guests ? `Aantal gasten: ${body.guests}` : null,
		body.interests?.length ? `Interesse: ${body.interests.join(', ')}` : null,
		body.locale ? `Taal: ${body.locale}` : null,
		'',
		'Bericht:',
		message
	].filter(Boolean);

	const token = env.POSTMARK_TOKEN;
	const confirmation = buildConfirmation(body.locale === 'en' ? 'en' : 'nl', name, body, message);

	if (!token) {
		if (dev) {
			console.log('[contact] dev mode, no Postmark token — would have sent:\n', lines.join('\n'));
			console.log(
				'[contact] dev mode, would have sent confirmation to',
				email,
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
			ReplyTo: `${name} <${email}>`,
			Subject: `Nieuwe aanvraag — ${name}`,
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
			extra: { from: CONTACT_FROM, to: CONTACT_TO, submitter: email }
		});
		return json({ ok: false, error: 'send_failed' }, { status: 502 });
	}

	try {
		await client.sendEmail({
			From: CONTACT_FROM,
			To: `${name} <${email}>`,
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
			extra: { from: CONTACT_FROM, to: email }
		});
	}

	return json({ ok: true });
};
