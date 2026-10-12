#!/usr/bin/env bun
/**
 * Pull Search Console data for the funnel report.
 *
 *   bun run gsc:pull                       # full history (from 2026-04-01) up to 3 days ago
 *   bun run gsc:pull -- --start 2026-08-01 --end 2026-09-30
 *   bun run gsc:pull -- --site sc-domain:hangendehapjes.nl
 *
 * Auth: Google Application Default Credentials via the gcloud CLI. One-time:
 *
 *   gcloud auth application-default login \
 *     --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly
 *
 * Log in with the Google account that owns the Search Console property.
 *
 * Output: data/gsc/gsc-<start>_<end>.json with daily totals, pages, queries
 * and per-page daily rows. scripts/funnel-report.ts merges every file in
 * data/gsc/, newest wins, so just re-run this whenever you want fresh data.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const flag = (name: string) => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
};

const ROOT = resolve(import.meta.dir, '..');
const OUT_DIR = join(ROOT, 'data', 'gsc');
const SITE = flag('site') ?? 'sc-domain:hangendehapjes.nl';
const START = flag('start') ?? '2026-04-01';
// GSC data is final after ~3 days; earlier rows come back incomplete.
const END = flag('end') ?? new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
const API = 'https://searchconsole.googleapis.com/webmasters/v3';

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

function accessToken(): string {
	const r = Bun.spawnSync(['gcloud', 'auth', 'application-default', 'print-access-token']);
	const token = r.stdout.toString().trim();
	if (r.exitCode !== 0 || !token) {
		console.error(r.stderr.toString());
		console.error(
			'\nNo Google credentials. Run:\n  gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly'
		);
		process.exit(1);
	}
	return token;
}

function quotaProject(): string | undefined {
	const adc = join(
		process.env.CLOUDSDK_CONFIG ?? join(homedir(), '.config', 'gcloud'),
		'application_default_credentials.json'
	);
	try {
		return JSON.parse(readFileSync(adc, 'utf8')).quota_project_id ?? undefined;
	} catch {
		return undefined;
	}
}

const token = accessToken();
const headers: Record<string, string> = {
	Authorization: `Bearer ${token}`,
	'Content-Type': 'application/json'
};
const qp = quotaProject();
if (qp) headers['x-goog-user-project'] = qp;

async function listSites(): Promise<string[]> {
	const res = await fetch(`${API}/sites`, { headers });
	const body = (await res.json()) as { siteEntry?: { siteUrl: string }[] };
	return (body.siteEntry ?? []).map((s) => s.siteUrl);
}

/** Search Analytics query with pagination (25k rows per page). */
async function query(dimensions: string[], extra: Record<string, unknown> = {}): Promise<Row[]> {
	const rows: Row[] = [];
	const url = `${API}/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
	for (let startRow = 0; ; startRow += 25000) {
		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				startDate: START,
				endDate: END,
				dimensions,
				type: 'web',
				dataState: 'final',
				rowLimit: 25000,
				startRow,
				...extra
			})
		});
		if (!res.ok) {
			const text = await res.text();
			if (res.status === 403) {
				const sites = await listSites().catch(() => []);
				console.error(
					`403 for ${SITE}. This Google account can see: ${sites.join(', ') || '(no properties)'}`
				);
				console.error(
					'Log in with the account that owns the property:\n  gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly'
				);
			}
			throw new Error(`GSC ${dimensions.join('+')} failed (${res.status}): ${text}`);
		}
		const page = ((await res.json()) as { rows?: Row[] }).rows ?? [];
		rows.push(...page);
		if (page.length < 25000) break;
	}
	return rows;
}

const pct = (r: Row) => ({ ...r, ctr: r.ctr * 100, position: Math.round(r.position * 10) / 10 });

async function main() {
	console.log(`Pulling ${SITE} ${START} → ${END}`);
	const [daily, pages, queries, pagesDaily, queryPage] = await Promise.all([
		query(['date']),
		query(['page']),
		query(['query']),
		query(['date', 'page']),
		query(['query', 'page'])
	]);

	const out = {
		site: SITE,
		start: START,
		end: END,
		pulledAt: new Date().toISOString(),
		daily: daily
			.map((r) => ({
				date: r.keys[0],
				clicks: r.clicks,
				impressions: r.impressions,
				ctr: r.ctr * 100,
				position: r.position
			}))
			.sort((a, b) => a.date.localeCompare(b.date)),
		pages: pages.map((r) => ({ page: r.keys[0], ...pct(r) })).map(({ keys: _k, ...r }) => r),
		queries: queries.map((r) => ({ query: r.keys[0], ...pct(r) })).map(({ keys: _k, ...r }) => r),
		pagesDaily: pagesDaily.map((r) => ({
			date: r.keys[0],
			page: r.keys[1],
			clicks: r.clicks,
			impressions: r.impressions
		})),
		queryPage: queryPage
			.map((r) => ({ query: r.keys[0], page: r.keys[1], ...pct(r) }))
			.map(({ keys: _k, ...r }) => r)
	};

	if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
	const file = join(OUT_DIR, `gsc-${START}_${END}.json`);
	writeFileSync(file, JSON.stringify(out, null, '\t'));

	const clicks = out.daily.reduce((s, d) => s + d.clicks, 0);
	const impressions = out.daily.reduce((s, d) => s + d.impressions, 0);
	console.log(`Saved ${file}`);
	console.log(
		`  ${out.daily.length} days · ${clicks} clicks · ${impressions} impressions · ${out.pages.length} pages · ${out.queries.length} queries`
	);
	if (out.daily.length === 0)
		console.warn('  ⚠ no daily rows: wrong property, or no data yet for this range');
}

main().catch((e) => {
	console.error(e.message ?? e);
	process.exit(1);
});
