import { json } from '@sveltejs/kit';
import { ServerClient } from 'postmark';
import * as v from 'valibot';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { notifyError } from '$lib/server/notify';
import { PayloadSchema, CallbackSchema, type Clean } from '$lib/server/contact-schema';
import { createDeal, toDateOrNull, type DealInput } from '$lib/server/deals';
import type { RequestHandler } from './$types';

const CONTACT_TO = 'info@hangendehapjes.nl';
const CONTACT_FROM = 'aanvragen@hangendehapjes.nl';
const RATE_LIMIT_MS = 60_000;
const INVALID_NOTIFY_THROTTLE_MS = 5 * 60_000;

const lastSubmission = new Map<string, number>();
const lastInvalidNotify = new Map<string, number>();

const serviceTypeLabel = (serviceType: Clean['serviceType'], isNl: boolean) =>
	serviceType === 'taart'
		? isNl
			? 'Dessert / taart'
			: 'Dessert / cake'
		: isNl
			? 'Hangende hapjes (live)'
			: 'Hanging snacks (live)';

const buildConfirmation = (clean: Clean) => {
	const isNl = clean.locale !== 'en';

	const labels = isNl
		? {
				phone: 'Telefoon',
				eventDate: 'Datum',
				location: 'Locatie',
				guests: 'Aantal gasten',
				choice: 'Wat je wilt',
				serving: 'Geserveerd',
				referral: 'Hoe ons gevonden',
				message: 'Bericht'
			}
		: {
				phone: 'Phone',
				eventDate: 'Date',
				location: 'Location',
				guests: 'Number of guests',
				choice: 'What you want',
				serving: 'Served',
				referral: 'How they found us',
				message: 'Message'
			};

	const serviceLabel = serviceTypeLabel(clean.serviceType, isNl);
	const serving = [clean.dagdeel, clean.servingTime].filter(Boolean).join(' — ');

	const summary = [
		clean.phone ? `${labels.phone}: ${clean.phone}` : null,
		clean.eventDate ? `${labels.eventDate}: ${clean.eventDate}` : null,
		clean.location ? `${labels.location}: ${clean.location}` : null,
		clean.guests ? `${labels.guests}: ${clean.guests}` : null,
		`${labels.choice}: ${serviceLabel} — ${clean.choice}`,
		serving ? `${labels.serving}: ${serving}` : null,
		clean.referral ? `${labels.referral}: ${clean.referral}` : null,
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

/**
 * Best-effort: record every genuine submission as a `nieuw` deal so the lead
 * lands in the pipeline and is never lost. Fire-and-forget — a missing or
 * broken DB must never block or slow the contact form. Email stays the source
 * of truth.
 */
const captureDeal = (clean: Clean, extra: Partial<DealInput> = {}) => {
	void (async () => {
		try {
			await createDeal({
				name: clean.name,
				email: clean.email,
				phone: clean.phone,
				source: clean.referral,
				eventDate: toDateOrNull(clean.eventDate),
				eventDateText: clean.eventDate,
				location: clean.location,
				guests: clean.guests,
				serviceType: clean.serviceType,
				choice: clean.choice,
				dagdeel: clean.dagdeel,
				servingTime: clean.servingTime,
				message: clean.message,
				status: 'nieuw',
				origin: 'contact_form',
				...extra
			});
		} catch (err) {
			void notifyError(err, {
				source: 'contact form — deal capture (non-fatal)',
				url: '/api/contact',
				method: 'POST',
				extra: { submitter: clean.email }
			});
		}
	})();
};

const buildCallbackConfirmation = (isNl: boolean) =>
	isNl
		? {
				subject: 'We hebben je bericht — Hangende Hapjes',
				text: [
					'Hi!',
					'',
					'Bedankt dat je contact opneemt. We hebben je gegevens ontvangen en nemen',
					'snel — meestal binnen 1–2 dagen — contact met je op om je verder te helpen.',
					'',
					'Tot snel!',
					'',
					'Charlotte & Gijs',
					'Hangende Hapjes',
					'info@hangendehapjes.nl'
				].join('\n')
			}
		: {
				subject: 'We got your message — Hangende Hapjes',
				text: [
					'Hi!',
					'',
					'Thanks for reaching out. We’ve received your details and will get back to',
					'you soon — usually within 1–2 days — to help you further.',
					'',
					'Talk soon!',
					'',
					'Charlotte & Gijs',
					'Hangende Hapjes',
					'info@hangendehapjes.nl'
				].join('\n')
			};

/**
 * "Reach out to me" path — visitor left only a phone number or email. We still
 * rate-limit, honeypot-guard and capture the lead, but the payload is minimal
 * and there are no event details to relay.
 */
const handleCallback = async (raw: unknown, ip: string, now: number): Promise<Response> => {
	const result = v.safeParse(CallbackSchema, raw);
	if (!result.success) {
		pruneOlderThan(lastInvalidNotify, now, INVALID_NOTIFY_THROTTLE_MS);
		const lastNotif = lastInvalidNotify.get(ip) ?? 0;
		if (now - lastNotif > INVALID_NOTIFY_THROTTLE_MS) {
			lastInvalidNotify.set(ip, now);
			void notifyError(new Error('callback request validation failed'), {
				source: 'contact form — callback validation',
				url: '/api/contact',
				method: 'POST',
				status: 400,
				extra: { ip, issues: result.issues.map((i) => i.message) }
			});
		}
		return json({ ok: false, error: 'invalid_input' }, { status: 400 });
	}

	const clean = result.output;
	const isNl = clean.locale !== 'en';
	const isEmail = clean.contact.includes('@');
	const email = isEmail ? clean.contact : '';
	const phone = isEmail ? '' : clean.contact;

	const captureCallback = (extra: Partial<DealInput> = {}) => {
		void createDeal({
			name: '',
			email,
			phone,
			message: isEmail
				? 'Terugbelverzoek via de site — wil graag gemaild worden met meer info.'
				: 'Terugbelverzoek via de site — wil graag teruggebeld worden met meer info.',
			status: 'nieuw',
			origin: 'callback_request',
			...extra
		}).catch((err) =>
			notifyError(err, {
				source: 'contact form — callback deal capture (non-fatal)',
				url: '/api/contact',
				method: 'POST',
				extra: { submitter: clean.contact }
			})
		);
	};

	// Honeypot tripped — capture flagged, ping us, but look like success.
	if (clean.subject) {
		captureCallback({
			origin: 'callback_request_suspect',
			notes: 'Honeypot getript bij terugbelverzoek — mogelijk spam. Controleer dit.'
		});
		void notifyError(
			new Error('Honeypot tripped on callback request — captured as suspected spam'),
			{
				source: 'contact form — callback honeypot',
				url: '/api/contact',
				method: 'POST',
				extra: { ip, submitter: clean.contact }
			}
		);
		return json({ ok: true });
	}

	pruneOlderThan(lastSubmission, now, RATE_LIMIT_MS);
	const last = lastSubmission.get(ip) ?? 0;
	if (now - last < RATE_LIMIT_MS) {
		return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}
	lastSubmission.set(ip, now);

	captureCallback();

	const adminLines = [
		'Terugbelverzoek via de site.',
		isEmail ? `E-mail: ${email}` : `Telefoon: ${phone}`,
		`Voorkeur: ${isEmail ? 'mailen' : 'bellen'}`,
		`Taal: ${clean.locale}`
	];

	const token = env.POSTMARK_TOKEN;
	if (!token) {
		if (dev) {
			console.log(
				'[contact] dev mode callback, no Postmark token — would have sent:\n',
				adminLines.join('\n')
			);
			return json({ ok: true });
		}
		void notifyError(new Error('POSTMARK_TOKEN is not configured'), {
			source: 'contact form — callback',
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
			ReplyTo: isEmail ? email : CONTACT_TO,
			Subject: `Terugbelverzoek — ${clean.contact}`,
			TextBody: adminLines.join('\n'),
			MessageStream: 'outbound'
		});
	} catch (err) {
		console.error('[contact] Postmark callback send failed', err);
		void notifyError(err, {
			source: 'contact form — callback admin email',
			url: '/api/contact',
			method: 'POST',
			status: 502,
			extra: { from: CONTACT_FROM, to: CONTACT_TO, submitter: clean.contact }
		});
		return json({ ok: false, error: 'send_failed' }, { status: 502 });
	}

	// Confirmation is only possible when they left an email address.
	if (isEmail) {
		const confirmation = buildCallbackConfirmation(isNl);
		try {
			await client.sendEmail({
				From: CONTACT_FROM,
				To: email,
				ReplyTo: CONTACT_TO,
				Subject: confirmation.subject,
				TextBody: confirmation.text,
				MessageStream: 'outbound'
			});
		} catch (err) {
			console.error('[contact] Postmark callback confirmation send failed', err);
			void notifyError(err, {
				source: 'contact form — callback confirmation (non-fatal)',
				url: '/api/contact',
				method: 'POST',
				extra: { from: CONTACT_FROM, to: email }
			});
		}
	}

	return json({ ok: true });
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

	// Branch off the minimal "just reach out to me" path before the full schema.
	if (raw && typeof raw === 'object' && (raw as { mode?: unknown }).mode === 'callback') {
		return handleCallback(raw, ip, now);
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
						received: typeof i.input === 'string' ? i.input.slice(0, 50) : typeof i.input
					}))
				}
			});
		}
		return json({ ok: false, error: 'invalid_input' }, { status: 400 });
	}

	const clean = result.output;

	// Honeypot tripped. Almost certainly a bot — but we no longer drop it
	// silently (the old code returned ok with no email AND no DB record, so a
	// real lead whose browser autofilled the hidden field vanished without a
	// trace). Instead: capture it flagged as suspected spam so it's reviewable
	// in the pipeline, and ping Telegram so we can eyeball bot-vs-human. The
	// submitter still gets a success response so a real bot learns nothing.
	if (clean.subject) {
		captureDeal(clean, {
			origin: 'contact_form_suspect',
			notes: 'Honeypot getript bij verzending — mogelijk spam. Controleer dit voor je reageert.'
		});
		void notifyError(new Error('Honeypot tripped on contact form — captured as suspected spam'), {
			source: 'contact form — honeypot',
			url: '/api/contact',
			method: 'POST',
			extra: { ip, submitter: clean.email, name: clean.name }
		});
		return json({ ok: true });
	}

	pruneOlderThan(lastSubmission, now, RATE_LIMIT_MS);
	const last = lastSubmission.get(ip) ?? 0;
	if (now - last < RATE_LIMIT_MS) {
		return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}
	lastSubmission.set(ip, now);

	captureDeal(clean);

	const serving = [clean.dagdeel, clean.servingTime].filter(Boolean).join(' — ');
	const lines = [
		`Naam: ${clean.name}`,
		`Email: ${clean.email}`,
		clean.phone ? `Telefoon: ${clean.phone}` : null,
		`Datum: ${clean.eventDate}`,
		`Locatie: ${clean.location}`,
		`Aantal gasten: ${clean.guests}`,
		`Wat: ${serviceTypeLabel(clean.serviceType, clean.locale !== 'en')} — ${clean.choice}`,
		serving ? `Geserveerd: ${serving}` : null,
		clean.referral ? `Hoe ons gevonden: ${clean.referral}` : null,
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
