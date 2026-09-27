import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import { LeadSchema } from '$lib/server/contact-schema';
import { upsertLead } from '$lib/server/leads';
import type { RequestHandler } from './$types';

/**
 * Saves the step-1 details of the contact form ("Volgende" click) so we can
 * still reach people who never finish step 2. Fire-and-forget from the client:
 * it always answers quickly and never blocks the form, even without a DB.
 */

// Light per-IP limit: people may click Volgende, go back and click again.
const RATE_LIMIT_MS = 5_000;
const lastLead = new Map<string, number>();

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const ip = getClientAddress();
	const now = Date.now();
	for (const [key, t] of lastLead) if (now - t > RATE_LIMIT_MS) lastLead.delete(key);
	if (now - (lastLead.get(ip) ?? 0) < RATE_LIMIT_MS) {
		return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_body' }, { status: 400 });
	}

	const parsed = v.safeParse(LeadSchema, raw);
	if (!parsed.success) return json({ ok: false, error: 'invalid_input' }, { status: 400 });
	const lead = parsed.output;

	// Honeypot filled: pretend it worked so bots learn nothing.
	if (lead.subject) return json({ ok: true });

	lastLead.set(ip, now);
	try {
		await upsertLead({
			email: lead.email,
			name: lead.name,
			phone: lead.phone,
			serviceType: lead.serviceType,
			choice: lead.choice,
			locale: lead.locale
		});
	} catch (err) {
		console.error('[contact/lead] could not save lead', err);
	}
	return json({ ok: true });
};
