import { ensureSchema } from '$lib/server/db';
import {
	activeQuoteOf,
	normalizeOpsAudit,
	normalizeOpsQuestions,
	normalizePaymentTerm,
	normalizeQuoteVersions,
	quoteDealFields,
	type Deal,
	type DealInput,
	type DealStatus,
	type OpsAuditEntry,
	type OpsQuestion,
	type QuoteVersion
} from '$lib/deals';

// Re-export the client-safe constants/types/helpers so existing server-side
// imports of `$lib/server/deals` keep working.
export {
	DEAL_STATUSES,
	STATUS_LABELS,
	activeQuoteOf,
	quoteDealFields,
	toDateOrNull,
	type Deal,
	type DealInput,
	type DealStatus,
	type OpsAuditEntry,
	type OpsQuestion,
	type QuoteVersion
} from '$lib/deals';

const asDateStr = (v: unknown): string | null => {
	if (v == null) return null;
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v).slice(0, 10);
};

const asIso = (v: unknown): string => {
	if (v instanceof Date) return v.toISOString();
	return String(v);
};

const asIsoOrNull = (v: unknown): string | null => {
	if (v == null) return null;
	if (v instanceof Date) return v.toISOString();
	const s = String(v);
	return s ? s : null;
};

const asNum = (v: unknown): number | null => (v == null ? null : Number(v));

const parseStringRecord = (v: unknown): Record<string, string> => {
	if (typeof v !== 'string' || !v) return {};
	try {
		const parsed = JSON.parse(v);
		if (!parsed || typeof parsed !== 'object') return {};
		const out: Record<string, string> = {};
		for (const [k, val] of Object.entries(parsed)) {
			out[k] = String(val ?? '').slice(0, 3000);
		}
		return out;
	} catch {
		return {};
	}
};

const parseJsonObject = (v: unknown): Record<string, unknown> => {
	if (typeof v !== 'string' || !v) return {};
	try {
		const parsed = JSON.parse(v);
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: {};
	} catch {
		return {};
	}
};

const parseOpsQuestions = (v: unknown): OpsQuestion[] => {
	if (typeof v !== 'string' || !v) return normalizeOpsQuestions(null);
	try {
		return normalizeOpsQuestions(JSON.parse(v));
	} catch {
		return normalizeOpsQuestions(null);
	}
};

const parseOpsAudit = (v: unknown): OpsAuditEntry[] => {
	if (typeof v !== 'string' || !v) return [];
	try {
		return normalizeOpsAudit(JSON.parse(v));
	} catch {
		return [];
	}
};

const parseQuoteVersions = (v: unknown) => {
	if (typeof v !== 'string' || !v) return [];
	try {
		return normalizeQuoteVersions(JSON.parse(v));
	} catch {
		return [];
	}
};

const parseTimeSpent = (v: unknown): Record<string, number> => {
	if (typeof v !== 'string' || !v) return {};
	try {
		const parsed = JSON.parse(v);
		if (!parsed || typeof parsed !== 'object') return {};
		const out: Record<string, number> = {};
		for (const [k, val] of Object.entries(parsed)) {
			const n = Number(val);
			if (Number.isFinite(n) && n > 0) out[k] = n;
		}
		return out;
	} catch {
		return {};
	}
};

function rowToDeal(r: Record<string, unknown>): Deal {
	const prepaymentAmount = asNum(r.prepayment_amount);
	const prepaymentLink = (r.prepayment_link as string) ?? '';
	const prepaymentStatus = (r.prepayment_status as string) ?? 'not_sent';
	const depositAmount = asNum(r.deposit_amount) ?? prepaymentAmount;
	const depositLink = ((r.deposit_link as string) ?? '') || prepaymentLink;
	const depositStatus = ((r.deposit_status as string) ?? 'not_sent') || prepaymentStatus;
	const quoteVersions = parseQuoteVersions(r.quote_versions);
	const activeQuoteId = (r.active_quote_id as string) ?? '';
	const activeQuote = activeQuoteOf({ quoteVersions, activeQuoteId });
	const quoteFields = activeQuote ? quoteDealFields(activeQuote) : {};

	return {
		id: String(r.id),
		createdAt: asIso(r.created_at),
		updatedAt: asIso(r.updated_at),
		name: (r.name as string) ?? '',
		email: (r.email as string) ?? '',
		phone: (r.phone as string) ?? '',
		source: (r.source as string) ?? '',
		attribution: (r.attribution as string) ?? '',
		eventDate: quoteFields.eventDate ?? asDateStr(r.event_date),
		eventDateText: (r.event_date_text as string) ?? '',
		location: (r.location as string) ?? '',
		guests: (r.guests as string) ?? '',
		serviceType: (r.service_type as string) ?? '',
		choice: (r.choice as string) ?? '',
		dagdeel: (r.dagdeel as string) ?? '',
		servingTime: (r.serving_time as string) ?? '',
		status: (r.status as DealStatus) ?? 'nieuw',
		offerteAmount: quoteFields.offerteAmount ?? asNum(r.offerte_amount),
		btwAmount: quoteFields.btwAmount ?? asNum(r.btw_amount),
		costs: quoteFields.costs ?? asNum(r.costs),
		timeSpent: quoteFields.timeSpent ?? parseTimeSpent(r.time_spent),
		offerteVerstuurdOp: asDateStr(r.offerte_verstuurd_op),
		geldigTot: quoteFields.geldigTot ?? asDateStr(r.geldig_tot),
		geaccepteerdOp: asDateStr(r.geaccepteerd_op),
		acceptanceToken: (r.acceptance_token as string) ?? '',
		acceptanceEnabled: Boolean(r.acceptance_enabled),
		acceptanceExpiresAt: asIsoOrNull(r.acceptance_expires_at),
		acceptedTermsAt: asIsoOrNull(r.accepted_terms_at),
		acceptedTermsVersion: (r.accepted_terms_version as string) ?? '',
		acceptedByName: (r.accepted_by_name as string) ?? '',
		acceptedAtLocation: (r.accepted_at_location as string) ?? '',
		acceptedIp: (r.accepted_ip as string) ?? '',
		acceptedUserAgent: (r.accepted_user_agent as string) ?? '',
		acceptanceSnapshot: parseJsonObject(r.acceptance_snapshot),
		paymentTerm: normalizePaymentTerm(r.payment_term),
		prepaymentAmount: quoteFields.prepaymentAmount ?? prepaymentAmount,
		prepaymentLink,
		prepaymentStatus,
		depositAmount: quoteFields.depositAmount ?? depositAmount,
		depositLink,
		depositStatus,
		finalPaymentAmount: quoteFields.finalPaymentAmount ?? asNum(r.final_payment_amount),
		finalPaymentLink: (r.final_payment_link as string) ?? '',
		finalPaymentStatus: (r.final_payment_status as string) ?? 'not_sent',
		quoteVersions,
		activeQuoteId,
		portalQuestionsEnabled: r.portal_questions_enabled !== false,
		portalNote: (r.portal_note as string) ?? '',
		opsQuestions: parseOpsQuestions(r.ops_questions),
		opsJson: parseStringRecord(r.ops_json),
		opsCompletedAt: asIsoOrNull(r.ops_completed_at),
		opsAudit: parseOpsAudit(r.ops_audit),
		message: (r.message as string) ?? '',
		notes: (r.notes as string) ?? '',
		origin: (r.origin as string) ?? 'manual'
	};
}

export async function createDeal(input: DealInput): Promise<Deal | null> {
	const sql = await ensureSchema();
	if (!sql) return null;

	const row: Record<string, unknown> = {
		name: input.name ?? '',
		email: input.email ?? '',
		phone: input.phone ?? '',
		source: input.source ?? '',
		attribution: input.attribution ?? '',
		event_date: input.eventDate ?? null,
		event_date_text: input.eventDateText ?? '',
		location: input.location ?? '',
		guests: input.guests ?? '',
		service_type: input.serviceType ?? '',
		choice: input.choice ?? '',
		dagdeel: input.dagdeel ?? '',
		serving_time: input.servingTime ?? '',
		status: input.status ?? 'nieuw',
		offerte_amount: input.offerteAmount ?? null,
		btw_amount: input.btwAmount ?? null,
		costs: input.costs ?? null,
		time_spent: JSON.stringify(input.timeSpent ?? {}),
		offerte_verstuurd_op: input.offerteVerstuurdOp ?? null,
		geldig_tot: input.geldigTot ?? null,
		geaccepteerd_op: input.geaccepteerdOp ?? null,
		acceptance_token: input.acceptanceToken ?? '',
		acceptance_enabled: input.acceptanceEnabled ?? false,
		acceptance_expires_at: input.acceptanceExpiresAt ?? null,
		accepted_terms_at: input.acceptedTermsAt ?? null,
		accepted_terms_version: input.acceptedTermsVersion ?? '',
		accepted_by_name: input.acceptedByName ?? '',
		accepted_at_location: input.acceptedAtLocation ?? '',
		accepted_ip: input.acceptedIp ?? '',
		accepted_user_agent: input.acceptedUserAgent ?? '',
		acceptance_snapshot: JSON.stringify(input.acceptanceSnapshot ?? {}),
		payment_term: normalizePaymentTerm(input.paymentTerm),
		prepayment_amount: input.prepaymentAmount ?? null,
		prepayment_link: input.prepaymentLink ?? '',
		prepayment_status: input.prepaymentStatus ?? 'not_sent',
		deposit_amount: input.depositAmount ?? input.prepaymentAmount ?? null,
		deposit_link: input.depositLink ?? input.prepaymentLink ?? '',
		deposit_status: input.depositStatus ?? input.prepaymentStatus ?? 'not_sent',
		final_payment_amount: input.finalPaymentAmount ?? null,
		final_payment_link: input.finalPaymentLink ?? '',
		final_payment_status: input.finalPaymentStatus ?? 'not_sent',
		quote_versions: JSON.stringify(normalizeQuoteVersions(input.quoteVersions)),
		active_quote_id: input.activeQuoteId ?? '',
		portal_questions_enabled: input.portalQuestionsEnabled ?? true,
		portal_note: input.portalNote ?? '',
		ops_questions: JSON.stringify(normalizeOpsQuestions(input.opsQuestions)),
		ops_json: JSON.stringify(input.opsJson ?? {}),
		ops_completed_at: input.opsCompletedAt ?? null,
		ops_audit: JSON.stringify(normalizeOpsAudit(input.opsAudit)),
		message: input.message ?? '',
		notes: input.notes ?? '',
		origin: input.origin ?? 'manual'
	};

	// Backfill: let callers stamp the real original date on imported aanvragen.
	if (input.createdAt) {
		row.created_at = input.createdAt;
		row.updated_at = input.createdAt;
	}

	const [created] = await sql`INSERT INTO deals ${sql(row)} RETURNING *`;
	return rowToDeal(created);
}

export async function listDeals(): Promise<Deal[]> {
	const sql = await ensureSchema();
	if (!sql) return [];
	const rows = await sql`SELECT * FROM deals ORDER BY created_at DESC`;
	return rows.map(rowToDeal);
}

/** Accepted/finished deals that have a real calendar date — for the ICS feed. */
export async function listEventDeals(): Promise<Deal[]> {
	const sql = await ensureSchema();
	if (!sql) return [];
	const rows = await sql`
		SELECT * FROM deals
		WHERE event_date IS NOT NULL AND status IN ('in_optie', 'geaccepteerd', 'afgerond')
		ORDER BY event_date
	`;
	return rows.map(rowToDeal);
}

export async function getDeal(id: string): Promise<Deal | null> {
	const sql = await ensureSchema();
	if (!sql) return null;
	const [row] = await sql`SELECT * FROM deals WHERE id = ${id}`;
	return row ? rowToDeal(row) : null;
}

export async function getDealByAcceptanceToken(token: string): Promise<Deal | null> {
	const sql = await ensureSchema();
	if (!sql || !token) return null;
	const [row] = await sql`
		SELECT * FROM deals
		WHERE acceptance_token = ${token}
			AND acceptance_token <> ''
			AND acceptance_enabled = true
			AND (acceptance_expires_at IS NULL OR acceptance_expires_at > now())
	`;
	return row ? rowToDeal(row) : null;
}

export async function updateDeal(id: string, fields: Partial<DealInput>): Promise<Deal | null> {
	const sql = await ensureSchema();
	if (!sql) return null;

	const map: Record<keyof DealInput, string> = {
		name: 'name',
		email: 'email',
		phone: 'phone',
		source: 'source',
		attribution: 'attribution',
		eventDate: 'event_date',
		eventDateText: 'event_date_text',
		location: 'location',
		guests: 'guests',
		serviceType: 'service_type',
		choice: 'choice',
		dagdeel: 'dagdeel',
		servingTime: 'serving_time',
		status: 'status',
		offerteAmount: 'offerte_amount',
		btwAmount: 'btw_amount',
		costs: 'costs',
		timeSpent: 'time_spent',
		offerteVerstuurdOp: 'offerte_verstuurd_op',
		geldigTot: 'geldig_tot',
		geaccepteerdOp: 'geaccepteerd_op',
		acceptanceToken: 'acceptance_token',
		acceptanceEnabled: 'acceptance_enabled',
		acceptanceExpiresAt: 'acceptance_expires_at',
		acceptedTermsAt: 'accepted_terms_at',
		acceptedTermsVersion: 'accepted_terms_version',
		acceptedByName: 'accepted_by_name',
		acceptedAtLocation: 'accepted_at_location',
		acceptedIp: 'accepted_ip',
		acceptedUserAgent: 'accepted_user_agent',
		acceptanceSnapshot: 'acceptance_snapshot',
		paymentTerm: 'payment_term',
		prepaymentAmount: 'prepayment_amount',
		prepaymentLink: 'prepayment_link',
		prepaymentStatus: 'prepayment_status',
		depositAmount: 'deposit_amount',
		depositLink: 'deposit_link',
		depositStatus: 'deposit_status',
		finalPaymentAmount: 'final_payment_amount',
		finalPaymentLink: 'final_payment_link',
		finalPaymentStatus: 'final_payment_status',
		quoteVersions: 'quote_versions',
		activeQuoteId: 'active_quote_id',
		portalQuestionsEnabled: 'portal_questions_enabled',
		portalNote: 'portal_note',
		opsQuestions: 'ops_questions',
		opsJson: 'ops_json',
		opsCompletedAt: 'ops_completed_at',
		opsAudit: 'ops_audit',
		message: 'message',
		notes: 'notes',
		origin: 'origin',
		createdAt: 'created_at'
	};

	const row: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined) continue;
		const col = map[key as keyof DealInput];
		if (!col) continue;
		// JSON-encoded text columns.
		row[col] =
			key === 'timeSpent' ||
			key === 'opsJson' ||
			key === 'opsQuestions' ||
			key === 'quoteVersions' ||
			key === 'acceptanceSnapshot'
				? JSON.stringify(value)
				: key === 'opsAudit'
					? JSON.stringify(normalizeOpsAudit(value))
					: value;
	}

	if (Object.keys(row).length === 0) return getDeal(id);

	const [updated] = await sql`
		UPDATE deals SET ${sql(row)}, updated_at = now()
		WHERE id = ${id}
		RETURNING *
	`;
	return updated ? rowToDeal(updated) : null;
}

export async function saveQuoteVersion(
	id: string,
	quote: QuoteVersion,
	setActive = true
): Promise<Deal | null> {
	const deal = await getDeal(id);
	if (!deal) return null;

	// Visibility is managed in /admin/aanvragen, not in the document builder, so
	// the incoming quote never carries the flag. Re-saving a revision from the
	// builder must not quietly republish one we hid.
	const previous = deal.quoteVersions.find((q) => q.id === quote.id);

	const quoteVersions = normalizeQuoteVersions([
		...deal.quoteVersions.filter((q) => q.id !== quote.id),
		{ ...quote, active: setActive, hiddenForClient: previous?.hiddenForClient ?? false }
	]).map((q) => ({ ...q, active: setActive ? q.id === quote.id : q.active }));

	return updateDeal(id, {
		quoteVersions,
		activeQuoteId: setActive ? quote.id : deal.activeQuoteId,
		...(setActive ? quoteDealFields(quote) : {})
	});
}

/** Show or hide a single version in the client portal. */
export async function setQuoteVisibility(
	id: string,
	quoteId: string,
	hidden: boolean
): Promise<Deal | null> {
	const deal = await getDeal(id);
	if (!deal) return null;
	if (!deal.quoteVersions.some((q) => q.id === quoteId)) return null;

	return updateDeal(id, {
		quoteVersions: deal.quoteVersions.map((q) =>
			q.id === quoteId ? { ...q, hiddenForClient: hidden } : q
		)
	});
}

/**
 * Drop a version for good. The signed evidence lives in `acceptance_snapshot`
 * (which freezes its own copy of the versions at signing time), so deleting
 * here never destroys the record of what a client actually agreed to.
 */
export async function deleteQuoteVersion(id: string, quoteId: string): Promise<Deal | null> {
	const deal = await getDeal(id);
	if (!deal) return null;

	const remaining = deal.quoteVersions.filter((q) => q.id !== quoteId);
	if (remaining.length === deal.quoteVersions.length) return null;

	// Deleting the version currently on the table would leave the portal with a
	// dangling activeQuoteId and no offer to show, so clear the pointer too.
	const wasActive = activeQuoteOf(deal)?.id === quoteId;

	return updateDeal(id, {
		quoteVersions: remaining,
		...(wasActive ? { activeQuoteId: '' } : {})
	});
}

export async function deleteDeal(id: string): Promise<boolean> {
	const sql = await ensureSchema();
	if (!sql) return false;
	const result = await sql`DELETE FROM deals WHERE id = ${id}`;
	return result.count > 0;
}
