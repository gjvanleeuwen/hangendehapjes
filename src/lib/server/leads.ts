import { ensureSchema } from './db';

/**
 * Half-finished contact forms. A row is saved (or refreshed) when a visitor
 * clicks "Volgende" on step 1 with a valid email, and marked completed once
 * they submit the full form. Open rows are people we can still follow up.
 *
 * Everything here is best-effort: a missing or broken DB must never break the
 * public contact form, so callers swallow errors.
 */

export type ContactLead = {
	id: string;
	createdAt: string;
	updatedAt: string;
	email: string;
	name: string;
	phone: string;
	serviceType: string;
	choice: string;
	locale: string;
};

export type LeadInput = {
	email: string;
	name: string;
	phone: string;
	serviceType: string;
	choice: string;
	locale: string;
};

/** Insert or refresh the lead for this email. Re-opens it if it was completed or dismissed. */
export async function upsertLead(input: LeadInput): Promise<void> {
	const sql = await ensureSchema();
	if (!sql) return;
	await sql`
		INSERT INTO contact_leads (email, name, phone, service_type, choice, locale)
		VALUES (${input.email}, ${input.name}, ${input.phone}, ${input.serviceType}, ${input.choice}, ${input.locale})
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			phone = EXCLUDED.phone,
			service_type = EXCLUDED.service_type,
			choice = EXCLUDED.choice,
			locale = EXCLUDED.locale,
			updated_at = now(),
			completed_at = NULL,
			dismissed_at = NULL
	`;
}

/** Called after a full submission: this person finished, so drop them from the follow-up list. */
export async function completeLead(email: string): Promise<void> {
	const sql = await ensureSchema();
	if (!sql) return;
	await sql`
		UPDATE contact_leads SET completed_at = now(), updated_at = now()
		WHERE lower(email) = lower(${email}) AND completed_at IS NULL
	`;
}

/** Leads that never finished step 2 and weren't dismissed, newest first. */
export async function listOpenLeads(): Promise<ContactLead[]> {
	const sql = await ensureSchema();
	if (!sql) return [];
	const rows = await sql`
		SELECT id, created_at, updated_at, email, name, phone, service_type, choice, locale
		FROM contact_leads
		WHERE completed_at IS NULL AND dismissed_at IS NULL
		ORDER BY updated_at DESC
		LIMIT 200
	`;
	return rows.map((r) => ({
		id: String(r.id),
		createdAt: new Date(r.created_at as string).toISOString(),
		updatedAt: new Date(r.updated_at as string).toISOString(),
		email: String(r.email ?? ''),
		name: String(r.name ?? ''),
		phone: String(r.phone ?? ''),
		serviceType: String(r.service_type ?? ''),
		choice: String(r.choice ?? ''),
		locale: String(r.locale ?? 'nl')
	}));
}

/** Hide a lead from the follow-up list (contacted, spam, not relevant). */
export async function dismissLead(id: string): Promise<void> {
	const sql = await ensureSchema();
	if (!sql) return;
	await sql`UPDATE contact_leads SET dismissed_at = now(), updated_at = now() WHERE id = ${id}`;
}
