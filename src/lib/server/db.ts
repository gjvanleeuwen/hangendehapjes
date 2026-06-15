import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { DEAL_STATUSES } from '$lib/deals';

/**
 * Single Postgres connection pool for the whole server (adapter-node is a
 * long-running process, so we keep one pool around). postgres.js connects
 * lazily — creating the client does not open a socket until the first query.
 *
 * If DATABASE_URL is unset (e.g. local dev without a DB, or before the Dokploy
 * Postgres app is wired up), getSql() returns null. Callers must treat the DB
 * as best-effort and never let a missing/broken DB break the public site.
 */

export type Sql = ReturnType<typeof postgres>;

/** Whether a DATABASE_URL is configured. Lets the admin UI show setup hints. */
export function isDbConfigured(): boolean {
	return !!env.DATABASE_URL;
}

let initialized = false;
let client: Sql | null = null;

export function getSql(): Sql | null {
	if (initialized) return client;
	initialized = true;

	const url = env.DATABASE_URL;
	if (!url) {
		client = null;
		return null;
	}

	client = postgres(url, {
		// Small pool — this is a low-traffic admin DB, not a hot path.
		max: 5,
		idle_timeout: 30,
		connect_timeout: 10
	});
	return client;
}

/**
 * Idempotent schema creation. Memoized so it runs at most once per process.
 * Called before any query so the table always exists without a separate
 * migration step. Returns the live client, or null if no DB is configured.
 */
let schemaPromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<Sql | null> {
	const sql = getSql();
	if (!sql) return null;

	if (!schemaPromise) {
		const statusList = DEAL_STATUSES.map((s) => `'${s}'`).join(', ');

		schemaPromise = (async () => {
			await sql`
				CREATE TABLE IF NOT EXISTS deals (
					id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
					created_at           timestamptz NOT NULL DEFAULT now(),
					updated_at           timestamptz NOT NULL DEFAULT now(),

					-- contact
					name                 text NOT NULL DEFAULT '',
					email                text NOT NULL DEFAULT '',
					phone                text NOT NULL DEFAULT '',
					source               text NOT NULL DEFAULT '',
					attribution          text NOT NULL DEFAULT '',

					-- event details
					event_date           date,
					event_date_text      text NOT NULL DEFAULT '',
					location             text NOT NULL DEFAULT '',
					guests               text NOT NULL DEFAULT '',
					service_type         text NOT NULL DEFAULT '',
					choice               text NOT NULL DEFAULT '',
					dagdeel              text NOT NULL DEFAULT '',
					serving_time         text NOT NULL DEFAULT '',

					-- pipeline
					status               text NOT NULL DEFAULT 'nieuw',
					offerte_amount       numeric(10,2),
					btw_amount           numeric(10,2),
					costs                numeric(10,2),
					offerte_verstuurd_op date,
					geldig_tot           date,
					geaccepteerd_op      date,

					-- effort: JSON object of phase key -> hours, e.g. {"inkoop": 2}
					time_spent           text NOT NULL DEFAULT '{}',

					-- meta
					message              text NOT NULL DEFAULT '',
					notes                text NOT NULL DEFAULT '',
					origin               text NOT NULL DEFAULT 'manual'
				);
			`;

			// Migrations for tables created by an earlier version of the schema.
			await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS attribution text NOT NULL DEFAULT ''`;
			await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS btw_amount numeric(10,2)`;
			await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS costs numeric(10,2)`;
			await sql`ALTER TABLE deals ADD COLUMN IF NOT EXISTS time_spent text NOT NULL DEFAULT '{}'`;

			// Keep the status whitelist in sync with DEAL_STATUSES (e.g. adds
			// 'in_optie'). Drop + re-add so new statuses are always accepted.
			await sql.unsafe('ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_status_check');
			await sql.unsafe(
				`ALTER TABLE deals ADD CONSTRAINT deals_status_check CHECK (status IN (${statusList}))`
			);
		})();

		// If the migration itself fails, reset so a later request can retry.
		schemaPromise.catch(() => {
			schemaPromise = null;
		});
	}

	await schemaPromise;
	return sql;
}
