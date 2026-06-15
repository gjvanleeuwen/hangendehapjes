import { ensureSchema } from '$lib/server/db';
import type { Deal, DealInput, DealStatus } from '$lib/deals';

// Re-export the client-safe constants/types/helpers so existing server-side
// imports of `$lib/server/deals` keep working.
export {
	DEAL_STATUSES,
	STATUS_LABELS,
	toDateOrNull,
	type Deal,
	type DealInput,
	type DealStatus
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

const asNum = (v: unknown): number | null => (v == null ? null : Number(v));

function rowToDeal(r: Record<string, unknown>): Deal {
	return {
		id: String(r.id),
		createdAt: asIso(r.created_at),
		updatedAt: asIso(r.updated_at),
		name: (r.name as string) ?? '',
		email: (r.email as string) ?? '',
		phone: (r.phone as string) ?? '',
		source: (r.source as string) ?? '',
		eventDate: asDateStr(r.event_date),
		eventDateText: (r.event_date_text as string) ?? '',
		location: (r.location as string) ?? '',
		guests: (r.guests as string) ?? '',
		serviceType: (r.service_type as string) ?? '',
		choice: (r.choice as string) ?? '',
		dagdeel: (r.dagdeel as string) ?? '',
		servingTime: (r.serving_time as string) ?? '',
		status: (r.status as DealStatus) ?? 'nieuw',
		offerteAmount: asNum(r.offerte_amount),
		offerteVerstuurdOp: asDateStr(r.offerte_verstuurd_op),
		geldigTot: asDateStr(r.geldig_tot),
		geaccepteerdOp: asDateStr(r.geaccepteerd_op),
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
		offerte_verstuurd_op: input.offerteVerstuurdOp ?? null,
		geldig_tot: input.geldigTot ?? null,
		geaccepteerd_op: input.geaccepteerdOp ?? null,
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
		WHERE event_date IS NOT NULL AND status IN ('geaccepteerd', 'afgerond')
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

export async function updateDeal(
	id: string,
	fields: Partial<DealInput>
): Promise<Deal | null> {
	const sql = await ensureSchema();
	if (!sql) return null;

	const map: Record<keyof DealInput, string> = {
		name: 'name',
		email: 'email',
		phone: 'phone',
		source: 'source',
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
		offerteVerstuurdOp: 'offerte_verstuurd_op',
		geldigTot: 'geldig_tot',
		geaccepteerdOp: 'geaccepteerd_op',
		message: 'message',
		notes: 'notes',
		origin: 'origin',
		createdAt: 'created_at'
	};

	const row: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined) continue;
		const col = map[key as keyof DealInput];
		if (col) row[col] = value;
	}

	if (Object.keys(row).length === 0) return getDeal(id);

	const [updated] = await sql`
		UPDATE deals SET ${sql(row)}, updated_at = now()
		WHERE id = ${id}
		RETURNING *
	`;
	return updated ? rowToDeal(updated) : null;
}

export async function deleteDeal(id: string): Promise<boolean> {
	const sql = await ensureSchema();
	if (!sql) return false;
	const result = await sql`DELETE FROM deals WHERE id = ${id}`;
	return result.count > 0;
}
