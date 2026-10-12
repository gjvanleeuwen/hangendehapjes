#!/usr/bin/env bun
/**
 * Funnel report: website traffic (Umami) + Google Search Console + aanvragen
 * pipeline (deals) → one self-contained HTML report + a JSON snapshot so runs
 * can be compared over time.
 *
 *   bun run report                      # auto-detects inputs under data/
 *   bun run report -- --deals data/deals-2026-10-08.json
 *   bun run report -- --db              # read deals from $DATABASE_URL instead of a JSON dump
 *   bun run report -- --since 2026-06-01 --until 2026-09-30
 *   bun run report -- --km 45           # one-way km assumed for cost estimates (default 30)
 *
 * Inputs (all optional, newest wins):
 *   data/<umami-export>/website_event.csv   Umami CSV export (a .zip in data/ is unzipped automatically)
 *   data/deals-*.json                       {deals:[...]} dump of the aanvragen table
 *   data/gsc/gsc-*.json                     output of `bun run gsc:pull`
 *   data/gsc-<date>/Dates.csv (+Pages.csv, Queries.csv)  Search Console UI export, EN or NL headers
 *   data/ad-spend.csv                       campaign,from,to,spend,clicks  (typed over from Ads Manager)
 *
 * Outputs: reports/funnel-<YYYY-MM-DD>.html and reports/funnel-<YYYY-MM-DD>.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import {
	isMetaAttribution,
	parseAttribution,
	sourceBucket,
	type Touch
} from '../src/lib/attribution';
import { adsRule, economics, LOST_REASON_LABEL, PRODUCT_LABEL } from './funnel-economics';

// ───────────────────────────── args ─────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string) => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
};
const has = (name: string) => argv.includes(`--${name}`);

const ROOT = resolve(import.meta.dir, '..');
const DATA_DIR = join(ROOT, 'data');
const GSC_DIR = join(DATA_DIR, 'gsc');
const OUT_DIR = resolve(ROOT, flag('out') ?? 'reports');
const TODAY = new Date().toISOString().slice(0, 10);
// Click-based metrics need (nearly) every day of the window in GSC. GSC lags
// ~3 days, so "complete" means 90%+ of the days.
const GSC_MIN_COVERAGE = 0.9;

const warnings: string[] = [];
const warn = (m: string) => {
	warnings.push(m);
	console.warn('⚠ ' + m);
};

// ───────────────────────────── helpers ─────────────────────────────
function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQ = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQ) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else inQ = false;
			} else field += c;
		} else if (c === '"') inQ = true;
		else if (c === ',') {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			field = '';
			if (row.length > 1 || row[0] !== '') rows.push(row);
			row = [];
		} else field += c;
	}
	if (field !== '' || row.length) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

function csvObjects(text: string): Record<string, string>[] {
	const rows = parseCsv(text);
	if (!rows.length) return [];
	const header = rows[0].map((h) => h.replace(/^﻿/, '').trim());
	return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const num = (v: unknown): number => {
	if (v == null) return 0;
	const s = String(v).replace(/[%\s]/g, '');
	// "1.234,5" (nl) vs "1,234.5" (en)
	const n = /,\d{1,2}$/.test(s)
		? Number(s.replace(/\./g, '').replace(',', '.'))
		: Number(s.replace(/,/g, ''));
	return Number.isFinite(n) ? n : 0;
};

const daysInMonth = (ym: string) => {
	const [y, m] = ym.split('-').map(Number);
	return new Date(Date.UTC(y, m, 0)).getUTCDate();
};
function monthsBetween(a: string, b: string): string[] {
	const out: string[] = [];
	let [y, m] = a.slice(0, 7).split('-').map(Number);
	const end = b.slice(0, 7);
	for (;;) {
		const ym = `${y}-${String(m).padStart(2, '0')}`;
		out.push(ym);
		if (ym >= end) break;
		m++;
		if (m > 12) {
			m = 1;
			y++;
		}
	}
	return out;
}
const dayDiff = (a: string, b: string) =>
	Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
const pagePath = (url: string) => {
	try {
		return url.startsWith('http') ? new URL(url).pathname : url;
	} catch {
		return url;
	}
};

function listDirs(dir: string): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.map((n) => join(dir, n))
		.filter((p) => statSync(p).isDirectory());
}
function findFiles(dir: string, pred: (name: string) => boolean, depth = 3): string[] {
	if (!existsSync(dir) || depth < 0) return [];
	const out: string[] = [];
	for (const n of readdirSync(dir)) {
		const p = join(dir, n);
		const st = statSync(p);
		if (st.isDirectory()) out.push(...findFiles(p, pred, depth - 1));
		else if (pred(n)) out.push(p);
	}
	return out;
}
function unzipAll(dir: string) {
	if (!existsSync(dir)) return;
	for (const n of readdirSync(dir)) {
		if (!n.toLowerCase().endsWith('.zip')) continue;
		const target = join(dir, n.slice(0, -4));
		if (existsSync(target)) continue;
		const r = Bun.spawnSync(['unzip', '-o', '-q', join(dir, n), '-d', target]);
		if (r.exitCode !== 0) warn(`could not unzip ${n}: ${r.stderr.toString()}`);
		else console.log(`unzipped ${n} → ${basename(target)}/`);
	}
}

// ───────────────────────────── sources ─────────────────────────────
// Channel labels come from src/lib/attribution.ts (same function the site uses
// for Umami event data), so the report and the site never disagree.
const SOURCE_ORDER = [
	'google',
	'google_ads',
	'instagram',
	'instagram_ads',
	'facebook',
	'facebook_ads',
	'tiktok',
	'tiktok_ads',
	'chatgpt',
	'direct',
	'email',
	'other_search',
	'word_of_mouth',
	'other',
	'unknown'
] as const;
type Source = (typeof SOURCE_ORDER)[number];
const SOURCE_LABEL: Record<Source, string> = {
	google: 'Google',
	google_ads: 'Google Ads',
	instagram: 'Instagram',
	instagram_ads: 'Instagram ads',
	facebook: 'Facebook',
	facebook_ads: 'Facebook ads',
	tiktok: 'TikTok',
	tiktok_ads: 'TikTok ads',
	chatgpt: 'ChatGPT',
	direct: 'Direct',
	email: 'Email',
	other_search: 'Other search',
	word_of_mouth: 'Word of mouth',
	other: 'Other',
	unknown: 'Unknown'
};
const asSource = (bucket: string): Source =>
	(SOURCE_ORDER as readonly string[]).includes(bucket) ? (bucket as Source) : 'other';

/** Bucket from free text ("via Google", "mond-tot-mond", our attribution field). */
function textBucket(text: string): Source | null {
	const s = text.toLowerCase();
	if (!s.trim()) return null;
	if (/ads|advert|betaald|paid/.test(s) && /insta|\big\b/.test(s)) return 'instagram_ads';
	if (s.includes('google')) return 'google'; // "tiktok, then googled" / "sister found you on google" count as google
	if (/chatgpt|gpt|\bai\b/.test(s)) return 'chatgpt';
	if (/insta/.test(s)) return 'instagram';
	if (/tiktok/.test(s)) return 'tiktok';
	if (/facebook/.test(s)) return 'facebook';
	if (/eigen|direct/.test(s)) return 'direct';
	if (/mond|vriend|famil|schoonzus|collega|aanbev|gast|bekende/.test(s)) return 'word_of_mouth';
	return 'other';
}

// ───────────────────────────── deals ─────────────────────────────
type Deal = {
	createdAt: string;
	name: string;
	email?: string;
	source?: string;
	attribution?: string;
	firstTouch?: string;
	metaConsentAt?: string | null; // ticked the Meta consent box on the form
	eventDate?: string | null;
	guests?: string;
	location?: string;
	serviceType?: string;
	choice?: string;
	status: string;
	offerteAmount?: number | null;
	btwAmount?: number | null;
	costs?: number | null;
	offerteVerstuurdOp?: string | null;
	geldigTot?: string | null;
	notes?: string;
	timeSpent?: Record<string, number>; // logged hours per phase (admin)
	firstReplyOn?: string | null;
	geaccepteerdOp?: string | null;
	afgewezenOp?: string | null;
	lostReason?: string;
};

const STATUS_LABELS: Record<string, string> = {
	nieuw: 'Nieuw',
	offerte_verstuurd: 'Offerte verstuurd',
	in_optie: 'In optie',
	geaccepteerd: 'Geaccepteerd',
	afgewezen: 'Afgewezen (klant)',
	afgewezen_intern: 'Afgewezen (wij)',
	geleverd: 'Geleverd',
	factuur_verstuurd: 'Factuur verstuurd',
	afgerond: 'Betaald (afgerond)'
};

// Booked, from yes to fully paid. Mirrors WON_STATUSES in src/lib/deals.ts.
const WON = ['geaccepteerd', 'geleverd', 'factuur_verstuurd', 'afgerond'];

// Offerte sent = a quote went out, whoever ended it. Unlike the admin dashboard
// this includes deals we declined ourselves after quoting (capacity / date), so
// the count matches reality; they are still kept out of the win rate because
// losing them was our choice. Hand-made JSON dumps have no "verstuurd op"
// date, so a quoted amount counts as sent too.
const isOfferteSent = (d: Deal) =>
	!!d.offerteVerstuurdOp ||
	(d.offerteAmount ?? 0) > 0 ||
	['offerte_verstuurd', 'in_optie', ...WON].includes(d.status);
const isWon = (d: Deal) => WON.includes(d.status);
const isPending = (d: Deal) => d.status === 'offerte_verstuurd' || d.status === 'in_optie';
const isLostClient = (d: Deal) => d.status === 'afgewezen';
const isDeclinedUs = (d: Deal) => d.status === 'afgewezen_intern';
const amount = (d: Deal) => d.offerteAmount ?? 0;

/** Our manual attribution wins, then what the site measured, then what the client typed. */
function dealSource(d: Deal): Source {
	const manual = textBucket(d.attribution ?? '');
	if (manual) return manual;
	const touch = parseAttribution(d.firstTouch)?.first;
	if (touch) return asSource(sourceBucket(touch));
	return textBucket(d.source ?? '') ?? 'unknown';
}
const dealTouch = (d: Deal): Touch | null => parseAttribution(d.firstTouch)?.first ?? null;

const parseTimeSpent = (v: unknown): Record<string, number> => {
	try {
		const o = typeof v === 'string' ? JSON.parse(v || '{}') : (v ?? {});
		return o && typeof o === 'object' ? (o as Record<string, number>) : {};
	} catch {
		return {};
	}
};

async function loadDeals(): Promise<{ deals: Deal[]; label: string }> {
	if (has('db')) {
		const url = process.env.DATABASE_URL;
		if (!url) throw new Error('--db given but DATABASE_URL is not set');
		const postgres = (await import('postgres')).default;
		const sql = postgres(url, { max: 1 });
		try {
			const rows = await sql`select * from deals order by created_at`;
			const deals = rows.map(
				(r): Deal => ({
					createdAt: new Date(r.created_at).toISOString(),
					name: r.name,
					email: r.email,
					source: r.source,
					attribution: r.attribution,
					firstTouch: r.first_touch ?? '',
					metaConsentAt: r.meta_consent_at ? new Date(r.meta_consent_at).toISOString() : null,
					eventDate: r.event_date ? String(r.event_date).slice(0, 10) : null,
					guests: r.guests,
					location: r.location,
					serviceType: r.service_type,
					choice: r.choice,
					status: r.status,
					offerteAmount: r.offerte_amount == null ? null : Number(r.offerte_amount),
					btwAmount: r.btw_amount == null ? null : Number(r.btw_amount),
					costs: r.costs == null ? null : Number(r.costs),
					offerteVerstuurdOp: r.offerte_verstuurd_op
						? String(r.offerte_verstuurd_op).slice(0, 10)
						: null,
					geldigTot: r.geldig_tot ? String(r.geldig_tot).slice(0, 10) : null,
					notes: r.notes,
					timeSpent: parseTimeSpent(r.time_spent),
					firstReplyOn: r.first_reply_on ? String(r.first_reply_on).slice(0, 10) : null,
					geaccepteerdOp: r.geaccepteerd_op ? String(r.geaccepteerd_op).slice(0, 10) : null,
					afgewezenOp: r.afgewezen_op ? String(r.afgewezen_op).slice(0, 10) : null,
					lostReason: r.lost_reason ?? ''
				})
			);
			return { deals, label: 'DATABASE_URL (deals table)' };
		} finally {
			await sql.end();
		}
	}
	const explicit = flag('deals');
	let file = explicit ? resolve(explicit) : undefined;
	if (!file) {
		const candidates = findFiles(DATA_DIR, (n) => /^deals.*\.json$/i.test(n), 1).sort();
		file = candidates.at(-1);
	}
	if (!file || !existsSync(file)) {
		warn('no deals file found (data/deals-*.json); pipeline metrics will be empty');
		return { deals: [], label: 'none' };
	}
	const raw = JSON.parse(readFileSync(file, 'utf8'));
	const deals: Deal[] = (Array.isArray(raw) ? raw : raw.deals) ?? [];
	return { deals, label: basename(file) };
}

// ───────────────────────────── umami ─────────────────────────────
type Visit = {
	id: string;
	date: string;
	source: Source | 'portal';
	campaign: string;
	landing: string;
	events: Set<string>;
	pageviews: number;
};

type Abandon = { date: string; surface: string; step: string; lastField: string };

/** contact_abandon events with their properties, from event_data.csv next to website_event.csv. */
function loadAbandons(eventFile: string): Abandon[] {
	const dataFile = join(resolve(eventFile, '..'), 'event_data.csv');
	if (!existsSync(dataFile)) return [];
	const byEvent = new Map<string, Abandon>();
	for (const r of csvObjects(readFileSync(dataFile, 'utf8'))) {
		if (r.event_name !== 'contact_abandon') continue;
		let a = byEvent.get(r.event_id);
		if (!a) {
			a = { date: r.created_at.slice(0, 10), surface: 'unknown', step: '?', lastField: 'none' };
			byEvent.set(r.event_id, a);
		}
		const value = r.string_value && r.string_value !== '\\N' ? r.string_value : r.number_value;
		if (r.data_key === 'surface') a.surface = value;
		if (r.data_key === 'lastField') a.lastField = value;
		if (r.data_key === 'step') a.step = String(Math.round(Number(value)) || value);
	}
	return [...byEvent.values()];
}

function loadUmami(): {
	visits: Visit[];
	abandons: Abandon[];
	label: string;
	range: [string, string] | null;
} {
	unzipAll(DATA_DIR);
	const explicit = flag('umami');
	const files = explicit
		? [
				existsSync(join(explicit, 'website_event.csv'))
					? join(explicit, 'website_event.csv')
					: explicit
			]
		: findFiles(DATA_DIR, (n) => n === 'website_event.csv');
	if (!files.length) {
		warn('no Umami export found (data/**/website_event.csv); traffic metrics will be empty');
		return { visits: [], abandons: [], label: 'none', range: null };
	}
	// newest export = the one whose last event is latest
	let best: { file: string; rows: Record<string, string>[]; last: string } | null = null;
	for (const f of files) {
		const rows = csvObjects(readFileSync(f, 'utf8'));
		const last = rows.reduce((m, r) => (r.created_at > m ? r.created_at : m), '');
		if (!best || last > best.last) best = { file: f, rows, last };
	}
	const rows = best!.rows.filter((r) => r.hostname === 'hangendehapjes.nl');
	rows.sort((a, b) => a.created_at.localeCompare(b.created_at));

	const visits = new Map<string, Visit>();
	for (const r of rows) {
		const id = r.visit_id || r.session_id;
		let v = visits.get(id);
		if (r.event_type === '1') {
			if (!v) {
				const landing = r.url_path;
				const portal = /^\/(klantportaal|admin|app\.html)/.test(landing);
				const ref = /hangendehapjes\.nl$/.test(r.referrer_domain) ? '' : r.referrer_domain;
				v = {
					id,
					date: r.created_at.slice(0, 10),
					source: portal
						? 'portal'
						: asSource(
								sourceBucket({
									src: r.utm_source,
									med: r.utm_medium,
									cmp: r.utm_campaign,
									cnt: r.utm_content,
									ref,
									land: landing
								})
							),
					campaign: r.utm_campaign ?? '',
					landing: landing.replace(/#.*$/, '') || '/',
					events: new Set(),
					pageviews: 0
				};
				visits.set(id, v);
			}
			v.pageviews++;
		} else if (r.event_type === '2') {
			if (!v) continue; // event without a pageview in this visit; ignore
			v.events.add(r.event_name);
		}
	}
	const all = [...visits.values()];
	const dates = all.map((v) => v.date).sort();
	return {
		visits: all,
		abandons: loadAbandons(best!.file),
		label: basename(resolve(best!.file, '..')),
		range: dates.length ? [dates[0], dates.at(-1)!] : null
	};
}

// ───────────────────────────── gsc ─────────────────────────────
type GscDay = { clicks: number; impressions: number };
type GscRow = { key: string; clicks: number; impressions: number; ctr: number; position: number };
type Gsc = {
	daily: Map<string, GscDay>;
	pagesDaily: Map<string, GscDay>; // `${date} ${path}`
	pages: { label: string; rows: GscRow[] } | null;
	queries: { label: string; rows: GscRow[] } | null;
	sources: string[];
};

function loadGsc(): Gsc {
	const gsc: Gsc = {
		daily: new Map(),
		pagesDaily: new Map(),
		pages: null,
		queries: null,
		sources: []
	};
	let tablesEnd = '';
	const setTables = (label: string, end: string, pages: GscRow[], queries: GscRow[]) => {
		if (end < tablesEnd) return;
		tablesEnd = end;
		gsc.pages = { label, rows: pages.sort((a, b) => b.clicks - a.clicks) };
		gsc.queries = { label, rows: queries.sort((a, b) => b.clicks - a.clicks) };
	};

	// 1. bun run gsc:pull output, oldest → newest so newer pulls overwrite
	const explicit = flag('gsc');
	const jsonFiles =
		explicit && explicit.endsWith('.json')
			? [resolve(explicit)]
			: findFiles(GSC_DIR, (n) => /^gsc-.*\.json$/.test(n), 0).sort();
	for (const f of jsonFiles) {
		try {
			const raw = JSON.parse(readFileSync(f, 'utf8'));
			for (const d of raw.daily ?? [])
				gsc.daily.set(d.date, { clicks: d.clicks, impressions: d.impressions });
			for (const r of raw.pagesDaily ?? [])
				gsc.pagesDaily.set(`${r.date} ${pagePath(r.page)}`, {
					clicks: r.clicks,
					impressions: r.impressions
				});
			const toRow =
				(keyField: string) =>
				(r: Record<string, number | string>): GscRow => ({
					key: String(r[keyField]),
					clicks: Number(r.clicks),
					impressions: Number(r.impressions),
					ctr: Number(r.ctr),
					position: Number(r.position)
				});
			setTables(
				`${raw.start} → ${raw.end}`,
				raw.end ?? '',
				(raw.pages ?? []).map(toRow('page')),
				(raw.queries ?? []).map(toRow('query'))
			);
			gsc.sources.push(`gsc/${basename(f)}`);
		} catch (e) {
			warn(`could not read ${f}: ${(e as Error).message}`);
		}
	}

	// 2. Search Console UI exports (data/gsc-<date>/Dates.csv etc.), EN or NL headers, positional parse
	const csvDirs =
		explicit && !explicit.endsWith('.json')
			? [resolve(explicit)]
			: listDirs(DATA_DIR).filter((d) =>
					readdirSync(d).some((n) => /^(dates|datums)\.csv$/i.test(n))
				);
	for (const dir of csvDirs.sort()) {
		const names = readdirSync(dir);
		const pick = (re: RegExp) => names.find((n) => re.test(n));
		const datesFile = pick(/^(dates|datums)\.csv$/i);
		if (!datesFile) continue;
		const dayRows = parseCsv(readFileSync(join(dir, datesFile), 'utf8')).slice(1);
		let end = '';
		for (const r of dayRows) {
			const d = r[0]?.trim();
			if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
			gsc.daily.set(d, { clicks: num(r[1]), impressions: num(r[2]) });
			if (d > end) end = d;
		}
		const table = (file: string): GscRow[] =>
			parseCsv(readFileSync(join(dir, file), 'utf8'))
				.slice(1)
				.filter((r) => r[0])
				.map((r) => ({
					key: r[0],
					clicks: num(r[1]),
					impressions: num(r[2]),
					ctr: num(r[3]),
					position: num(r[4])
				}));
		const pagesFile = pick(/^(pages|pagina.?s)\.csv$/i);
		const queriesFile = pick(/^(queries|zoekopdrachten)\.csv$/i);
		if (pagesFile && queriesFile)
			setTables(`export ${basename(dir)}`, end, table(pagesFile), table(queriesFile));
		gsc.sources.push(basename(dir) + '/');
	}

	if (!gsc.daily.size)
		warn('no Search Console data found; run `bun run gsc:pull` for click-based metrics');
	return gsc;
}

// ───────────────────────────── metrics ─────────────────────────────
type Bucket = {
	from: string;
	to: string;
	visits: number;
	bySource: Record<Source, number>;
	contactView: number;
	contactStart: number;
	contactSubmit: number;
	ctaClicks: number;
	gscClicks: number;
	gscImpressions: number;
	gscDays: number;
	leads: number;
	leadsGoogle: number;
	leadsBySource: Record<Source, number>;
	offersSent: number;
	won: number;
	wonValue: number;
	wonGoogle: number;
	wonGoogleValue: number;
	pending: number;
	pendingValue: number;
	lostClient: number;
	declinedUs: number;
	metaLeads: number; // leads whose site touch came from Instagram / Facebook
	metaConsent: number; // of those, how many ticked the Meta consent box
};

const emptyBySource = () =>
	Object.fromEntries(SOURCE_ORDER.map((s) => [s, 0])) as Record<Source, number>;
const emptyBucket = (from: string, to: string): Bucket => ({
	from,
	to,
	visits: 0,
	bySource: emptyBySource(),
	contactView: 0,
	contactStart: 0,
	contactSubmit: 0,
	ctaClicks: 0,
	gscClicks: 0,
	gscImpressions: 0,
	gscDays: 0,
	leads: 0,
	leadsGoogle: 0,
	leadsBySource: emptyBySource(),
	offersSent: 0,
	won: 0,
	wonValue: 0,
	wonGoogle: 0,
	wonGoogleValue: 0,
	pending: 0,
	pendingValue: 0,
	lostClient: 0,
	declinedUs: 0,
	metaLeads: 0,
	metaConsent: 0
});

function fill(b: Bucket, visits: Visit[], deals: Deal[], gsc: Gsc) {
	const inWindow = (d: string) => d >= b.from && d <= b.to;
	for (const v of visits) {
		if (v.source === 'portal' || !inWindow(v.date)) continue;
		b.visits++;
		b.bySource[v.source]++;
		if (v.events.has('contact_view')) b.contactView++;
		if (v.events.has('contact_start')) b.contactStart++;
		if (v.events.has('contact_submit')) b.contactSubmit++;
		if ([...v.events].some((e) => /_offerte|_whatsapp/.test(e))) b.ctaClicks++;
	}
	for (const [d, g] of gsc.daily) {
		if (!inWindow(d)) continue;
		b.gscClicks += g.clicks;
		b.gscImpressions += g.impressions;
		b.gscDays++;
	}
	for (const d of deals) {
		if (!inWindow(d.createdAt.slice(0, 10))) continue;
		const src = dealSource(d);
		b.leads++;
		b.leadsBySource[src]++;
		if (src === 'google') b.leadsGoogle++;
		if (isMetaAttribution(parseAttribution(d.firstTouch))) {
			b.metaLeads++;
			if (d.metaConsentAt) b.metaConsent++;
		}
		if (isOfferteSent(d)) b.offersSent++;
		if (isWon(d)) {
			b.won++;
			b.wonValue += amount(d);
			if (src === 'google') {
				b.wonGoogle++;
				b.wonGoogleValue += amount(d);
			}
		}
		if (isPending(d)) {
			b.pending++;
			b.pendingValue += amount(d);
		}
		if (isLostClient(d)) b.lostClient++;
		if (isDeclinedUs(d)) b.declinedUs++;
	}
	return b;
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);
const coverage = (b: Bucket) => b.gscDays / (dayDiff(b.from, b.to) + 1);

function kpis(b: Bucket) {
	const clickMetrics = coverage(b) >= GSC_MIN_COVERAGE;
	const decided = b.won + b.lostClient;
	const winRate = ratio(b.won, decided); // of offers that got a yes/no
	const winRateAll = ratio(b.won, b.offersSent); // of all offers sent (open ones count as not won yet)
	const avgWon = ratio(b.wonValue, b.won);
	const expectedPending = winRate != null ? b.pendingValue * winRate : null;
	const googleShare = ratio(b.leadsGoogle, b.leads) ?? 0;
	return {
		clickMetrics,
		gscCoverage: coverage(b),
		leadRate: ratio(b.leads, b.visits),
		googleLeadRate: ratio(b.leadsGoogle, b.bySource.google),
		leadsPerGscClick: clickMetrics ? ratio(b.leadsGoogle, b.gscClicks) : null,
		visitsPerLead: ratio(b.visits, b.leads),
		clicksPerLead: clickMetrics ? ratio(b.gscClicks, b.leadsGoogle) : null,
		offerRate: ratio(b.offersSent, b.leads),
		winRate,
		winRateAll,
		avgWon,
		valuePerVisit: ratio(b.wonValue, b.visits),
		valuePerClick: clickMetrics ? ratio(b.wonGoogleValue, b.gscClicks) : null,
		valuePerClickExpected:
			clickMetrics && expectedPending != null && b.gscClicks > 0
				? (b.wonGoogleValue + expectedPending * googleShare) / b.gscClicks
				: null,
		valuePerLead: ratio(b.wonValue, b.leads),
		expectedPending,
		umamiCoverage: clickMetrics ? ratio(b.bySource.google, b.gscClicks) : null
	};
}

// ───────────────────────────── html ─────────────────────────────
const esc = (s: unknown) =>
	String(s ?? '').replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);
const nf = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
const eur = (v: number | null | undefined, digits = 0) =>
	v == null
		? '–'
		: '€ ' +
			new Intl.NumberFormat('nl-NL', {
				minimumFractionDigits: digits,
				maximumFractionDigits: digits
			}).format(v);
const pct = (v: number | null | undefined, digits = 1) =>
	v == null ? '–' : (v * 100).toFixed(digits).replace('.', ',') + '%';
const n0 = (v: number | null | undefined) => (v == null ? '–' : nf.format(v));
const n1 = (v: number | null | undefined) => (v == null ? '–' : v.toFixed(1).replace('.', ','));

// Validated categorical palette (dataviz skill), fixed order.
const PALETTE = [
	'#2a78d6',
	'#eb6834',
	'#1baf7a',
	'#eda100',
	'#e87ba4',
	'#008300',
	'#4a3aa7',
	'#e34948'
];

/** Stacked / grouped bar chart as inline SVG with native hover titles. */
function barChart(opts: {
	months: string[];
	series: { label: string; values: number[] }[];
	stacked: boolean;
	title: string;
}) {
	const W = 720;
	const H = 260;
	const padL = 44;
	const padB = 36;
	const padT = 16;
	const plotW = W - padL - 12;
	const plotH = H - padT - padB;
	const totals = opts.months.map((_, i) =>
		opts.stacked
			? opts.series.reduce((s, x) => s + x.values[i], 0)
			: Math.max(...opts.series.map((x) => x.values[i]))
	);
	const max = Math.max(1, ...totals);
	const mag = Math.pow(10, Math.floor(Math.log10(max)));
	const niceMax = Math.ceil(max / mag) * mag;
	const y = (v: number) => padT + plotH - (v / niceMax) * plotH;
	const slot = plotW / opts.months.length;
	const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);
	let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.title)}" class="chart">`;
	for (const t of ticks) {
		s += `<line x1="${padL}" x2="${W - 12}" y1="${y(t)}" y2="${y(t)}" class="grid"/>`;
		s += `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" class="tick">${n0(t)}</text>`;
	}
	opts.months.forEach((m, i) => {
		const x0 = padL + i * slot;
		s += `<text x="${x0 + slot / 2}" y="${H - 12}" text-anchor="middle" class="tick">${m}</text>`;
		if (opts.stacked) {
			let acc = 0;
			const bw = Math.min(40, slot * 0.6);
			opts.series.forEach((ser, j) => {
				const v = ser.values[i];
				if (!v) return;
				const top = y(acc + v);
				const h = Math.max(0, y(acc) - top - 2);
				s += `<rect x="${x0 + (slot - bw) / 2}" y="${top}" width="${bw}" height="${h}" rx="2" fill="${PALETTE[j % PALETTE.length]}"><title>${m} · ${esc(ser.label)}: ${n0(v)}</title></rect>`;
				acc += v;
			});
			if (acc)
				s += `<text x="${x0 + slot / 2}" y="${y(acc) - 4}" text-anchor="middle" class="val">${n0(acc)}</text>`;
		} else {
			const n = opts.series.length;
			const bw = Math.min(22, (slot * 0.7) / n);
			const start = x0 + (slot - bw * n - 2 * (n - 1)) / 2;
			opts.series.forEach((ser, j) => {
				const v = ser.values[i];
				const top = y(v);
				const h = Math.max(0, y(0) - top);
				const x = start + j * (bw + 2);
				s += `<rect x="${x}" y="${top}" width="${bw}" height="${h}" rx="2" fill="${PALETTE[j % PALETTE.length]}"><title>${m} · ${esc(ser.label)}: ${n0(v)}</title></rect>`;
				if (v)
					s += `<text x="${x + bw / 2}" y="${top - 3}" text-anchor="middle" class="val">${n0(v)}</text>`;
			});
		}
	});
	s += `<line x1="${padL}" x2="${W - 12}" y1="${y(0)}" y2="${y(0)}" class="axis"/>`;
	s += '</svg>';
	const legend = opts.series
		.map(
			(ser, j) =>
				`<span class="lg"><i style="background:${PALETTE[j % PALETTE.length]}"></i>${esc(ser.label)}</span>`
		)
		.join('');
	return `<figure><figcaption>${esc(opts.title)}</figcaption>${s}<div class="legend">${legend}</div></figure>`;
}

/** Horizontal funnel: one bar per step, step-to-step conversion in between. */
function funnelChart(
	steps: { label: string; value: number; note?: string; ofFirst?: boolean }[],
	title: string
) {
	const W = 720;
	const rowH = 34;
	const padL = 150;
	const padR = 90;
	const H = steps.length * rowH + 12;
	const max = Math.max(1, ...steps.map((st) => st.value));
	const barW = (v: number) => Math.max(v > 0 ? 3 : 0, ((W - padL - padR) * v) / max);
	let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" class="chart funnel">`;
	steps.forEach((st, i) => {
		const y = 6 + i * rowH;
		const base = st.ofFirst ? steps[0].value : i > 0 ? steps[i - 1].value : 0;
		const conv = base ? ratio(st.value, base) : null;
		const convLabel = st.ofFirst ? ' of visits' : '';
		s += `<text x="${padL - 10}" y="${y + 17}" text-anchor="end" class="flabel">${esc(st.label)}</text>`;
		s += `<rect x="${padL}" y="${y + 4}" width="${barW(st.value)}" height="${rowH - 10}" rx="3" fill="${PALETTE[0]}"><title>${esc(st.label)}: ${n0(st.value)}${st.note ? ` · ${esc(st.note)}` : ''}</title></rect>`;
		s += `<text x="${padL + barW(st.value) + 8}" y="${y + 17}" class="fval">${n0(st.value)}${conv != null ? ` <tspan class="fconv">${pct(conv, conv < 0.1 ? 1 : 0)}${convLabel}</tspan>` : ''}</text>`;
	});
	s += '</svg>';
	return `<figure class="funnelfig"><figcaption>${esc(title)}</figcaption>${s}<p class="fnote">Percentages are step to step, unless marked "of visits". Pipeline leads include WhatsApp and mail, so they can exceed form submits.</p></figure>`;
}

function table(
	headers: string[],
	rows: (string | number)[][],
	opts: { numeric?: boolean[]; cls?: string } = {}
) {
	const th = headers
		.map((h, i) => `<th class="${opts.numeric?.[i] ? 'num' : ''}">${esc(h)}</th>`)
		.join('');
	const body = rows
		.map(
			(r) =>
				`<tr>${r.map((c, i) => `<td class="${opts.numeric?.[i] ? 'num' : ''}">${c}</td>`).join('')}</tr>`
		)
		.join('');
	return `<table class="${opts.cls ?? ''}"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}

/** Compact key/value list for the secondary numbers. */
const kv = (rows: [string, string, string?][]) =>
	`<dl class="kv">${rows.map(([k, v, note]) => `<div><dt>${esc(k)}</dt><dd>${v}${note ? ` <small>${esc(note)}</small>` : ''}</dd></div>`).join('')}</dl>`;

const tile = (label: string, value: string, sub = '') =>
	`<div class="tile"><div class="tl">${esc(label)}</div><div class="tv">${value}</div>${sub ? `<div class="ts">${sub}</div>` : ''}</div>`;

// ───────────────────────────── main ─────────────────────────────
async function main() {
	const { deals, label: dealsLabel } = await loadDeals();
	const umami = loadUmami();
	const gsc = loadGsc();

	const dealDates = deals.map((d) => d.createdAt.slice(0, 10)).sort();
	const since = flag('since') ?? umami.range?.[0] ?? dealDates[0] ?? TODAY;
	const until =
		flag('until') ?? [umami.range?.[1], dealDates.at(-1), TODAY].filter(Boolean).sort().at(-1)!;
	const inRange = (d: string) => d >= since && d <= until;

	const all = fill(emptyBucket(since, until), umami.visits, deals, gsc);
	const allK = kpis(all);

	const months = monthsBetween(since, until);
	const monthly = months.map((m) => ({
		month: m,
		b: fill(emptyBucket(`${m}-01`, `${m}-${daysInMonth(m)}`), umami.visits, deals, gsc)
	}));

	const dealsInRange = deals.filter((d) => inRange(d.createdAt.slice(0, 10)));
	const visitsInRange = umami.visits.filter((v) => v.source !== 'portal' && inRange(v.date));

	// Business economics: order values, guests, cost/margin estimates from the pricing model.
	const ONE_WAY_KM = Number(flag('km') ?? 30);
	const econ = economics(dealsInRange, ONE_WAY_KM);

	// ── snapshot for comparison across runs
	mkdirSync(OUT_DIR, { recursive: true });
	const snapshot = {
		generatedAt: new Date().toISOString(),
		range: [since, until],
		inputs: { deals: dealsLabel, umami: umami.label, gsc: gsc.sources },
		overall: { ...all, kpis: allK },
		economics: econ.summary,
		monthly: monthly.map(({ month: m, b }) => ({ month: m, ...b, kpis: kpis(b) }))
	};
	type Snapshot = typeof snapshot;
	const prior: Snapshot[] = readdirSync(OUT_DIR)
		.filter((n) => /^funnel-\d{4}-\d{2}-\d{2}\.json$/.test(n) && n !== `funnel-${TODAY}.json`)
		.sort()
		.flatMap((n) => {
			try {
				return [JSON.parse(readFileSync(join(OUT_DIR, n), 'utf8')) as Snapshot];
			} catch {
				return [];
			}
		});

	// ── charts
	const activeSources = SOURCE_ORDER.filter((s) => all.bySource[s] > 0);
	const chartSources = activeSources.slice(0, 6);
	const sourceSeries = chartSources.map((k) => ({
		label: SOURCE_LABEL[k],
		values: monthly.map(({ b }) => b.bySource[k])
	}));
	if (activeSources.length > 6)
		sourceSeries.push({
			label: 'Rest',
			values: monthly.map(({ b }) => activeSources.slice(6).reduce((s, k) => s + b.bySource[k], 0))
		});
	const funnelSeries = [
		{ label: 'Leads (aanvragen)', values: monthly.map(({ b }) => b.leads) },
		{ label: 'Offertes sent', values: monthly.map(({ b }) => b.offersSent) },
		{ label: 'Won', values: monthly.map(({ b }) => b.won) }
	];

	// ── per month
	const monthRows = monthly.map(({ month: m, b }) => {
		const k = kpis(b);
		const dim = daysInMonth(m);
		const gscCell = b.gscDays
			? `${n0(b.gscClicks)}${b.gscDays < dim ? ` <small>(${b.gscDays}/${dim} d)</small>` : ''}`
			: '–';
		return [
			m,
			n0(b.visits),
			n0(b.bySource.google),
			n0(b.bySource.instagram + b.bySource.instagram_ads),
			n0(b.bySource.direct),
			gscCell,
			n0(b.contactView),
			n0(b.contactSubmit),
			n0(b.leads),
			n0(b.leadsGoogle),
			pct(k.leadRate),
			n0(b.offersSent),
			n0(b.won),
			eur(b.wonValue),
			n0(b.pending),
			n0(b.lostClient),
			n0(b.declinedUs)
		];
	});

	// ── by source
	const sourceRows = SOURCE_ORDER.map((s) => {
		const leads = dealsInRange.filter((d) => dealSource(d) === s);
		const won = leads.filter(isWon);
		const sent = leads.filter(isOfferteSent);
		const lost = leads.filter(isLostClient);
		const pending = leads.filter(isPending);
		const visits = all.bySource[s];
		const wonValue = won.reduce((t, d) => t + amount(d), 0);
		const traffic = visits > 0;
		return {
			any: leads.length + visits > 0,
			row: [
				SOURCE_LABEL[s],
				traffic ? n0(visits) : '–',
				n0(leads.length),
				n0(sent.length),
				n0(won.length),
				pct(ratio(won.length, won.length + lost.length)),
				eur(wonValue),
				n0(pending.length),
				eur(pending.reduce((t, d) => t + amount(d), 0)),
				traffic ? pct(ratio(leads.length, visits)) : '–',
				traffic ? eur(ratio(wonValue, visits), 2) : '–'
			]
		};
	})
		.filter((r) => r.any)
		.map((r) => r.row);

	// ── by campaign (utm_campaign): the table that matters once ads run
	type CampaignStat = {
		visits: number;
		submits: number;
		leads: number;
		won: number;
		wonValue: number;
	};
	const campaigns = new Map<string, CampaignStat>();
	const camp = (c: string) => {
		let x = campaigns.get(c);
		if (!x) campaigns.set(c, (x = { visits: 0, submits: 0, leads: 0, won: 0, wonValue: 0 }));
		return x;
	};
	for (const v of visitsInRange) {
		if (!v.campaign) continue;
		const c = camp(v.campaign);
		c.visits++;
		if (v.events.has('contact_submit')) c.submits++;
	}
	for (const d of dealsInRange) {
		const t = dealTouch(d);
		if (!t?.cmp) continue;
		const c = camp(t.cmp);
		c.leads++;
		if (isWon(d)) {
			c.won++;
			c.wonValue += amount(d);
		}
	}
	// Ad spend typed over from Ads Manager: data/ad-spend.csv with
	// campaign,from,to,spend,clicks. Campaign must equal the utm_campaign.
	const spendByCampaign = new Map<string, { spend: number; clicks: number }>();
	const spendFile = join(DATA_DIR, 'ad-spend.csv');
	if (existsSync(spendFile)) {
		for (const r of csvObjects(readFileSync(spendFile, 'utf8'))) {
			const name = (r.campaign ?? '').trim();
			if (!name) continue;
			const to = (r.to ?? '').trim();
			const from = (r.from ?? '').trim();
			if ((from && from > until) || (to && to < since)) continue;
			const x = spendByCampaign.get(name) ?? { spend: 0, clicks: 0 };
			x.spend += num(r.spend);
			x.clicks += num(r.clicks);
			spendByCampaign.set(name, x);
		}
		for (const name of spendByCampaign.keys()) camp(name);
	}
	const rule = adsRule(econ.summary, allK.leadRate);
	const verdict = (actual: number | null, max: number | null) =>
		actual == null || max == null
			? '–'
			: actual <= max
				? '<span class="ok">ok</span>'
				: actual <= max * 1.5
					? '<span class="warnt">above</span>'
					: '<span class="bad">stop</span>';
	const campaignRows = [...campaigns.entries()]
		.sort((a, b) => b[1].visits - a[1].visits)
		.map(([name, c]) => {
			const sp = spendByCampaign.get(name);
			const cpc = sp ? ratio(sp.spend, sp.clicks) : null;
			const cpl = sp ? ratio(sp.spend, c.leads) : null;
			return [
				esc(name),
				sp ? eur(sp.spend) : '–',
				sp ? n0(sp.clicks) : '–',
				n0(c.visits),
				n0(c.submits),
				n0(c.leads),
				pct(ratio(c.leads, c.visits)),
				n0(c.won),
				eur(c.wonValue),
				cpc != null ? `${eur(cpc, 2)} ${verdict(cpc, rule.maxCpc)}` : '–',
				cpl != null
					? `${eur(cpl)} ${verdict(cpl, rule.maxCostPerLead)}`
					: sp && c.leads === 0
						? `${eur(sp.spend)}+ ${verdict(sp.spend, rule.maxCostPerLead)}`
						: '–'
			];
		});

	// ── by landing page
	type LandingStat = {
		visits: number;
		clicks: number;
		prices: number; // saw the price block (blog_*_prices_view)
		form: number; // saw the form (contact_view)
		started: number; // typed in the form (contact_start)
		submits: number;
		leads: number;
		won: number;
	};
	const landings = new Map<string, LandingStat>();
	const land = (p: string) => {
		let x = landings.get(p);
		if (!x)
			landings.set(
				p,
				(x = { visits: 0, clicks: 0, prices: 0, form: 0, started: 0, submits: 0, leads: 0, won: 0 })
			);
		return x;
	};
	for (const v of visitsInRange) {
		const l = land(v.landing);
		l.visits++;
		if ([...v.events].some((e) => e.endsWith('_prices_view'))) l.prices++;
		if (v.events.has('contact_view')) l.form++;
		if (v.events.has('contact_start')) l.started++;
		if (v.events.has('contact_submit')) l.submits++;
	}
	for (const [key, g] of gsc.pagesDaily) {
		const [date, path] = [key.slice(0, 10), key.slice(11)];
		if (!inRange(date)) continue;
		land(path).clicks += g.clicks;
	}
	for (const d of dealsInRange) {
		const t = dealTouch(d);
		if (!t?.land) continue;
		const l = land(t.land);
		l.leads++;
		if (isWon(d)) l.won++;
	}
	const landingRows = [...landings.entries()]
		.sort((a, b) => b[1].visits - a[1].visits)
		.slice(0, 15)
		.map(([path, l]) => [
			esc(path),
			n0(l.visits),
			gsc.pagesDaily.size ? n0(l.clicks) : '–',
			pct(ratio(l.prices, l.visits), 0),
			pct(ratio(l.form, l.visits), 0),
			pct(ratio(l.started, l.visits)),
			n0(l.submits),
			pct(ratio(l.submits, l.visits)),
			n0(l.leads),
			n0(l.won)
		]);
	const haveTouch = dealsInRange.some((d) => dealTouch(d));

	const dealRows = [...deals]
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		.map((d) => [
			d.createdAt.slice(0, 10),
			esc(d.name),
			esc(d.source || ''),
			SOURCE_LABEL[dealSource(d)] +
				(d.attribution
					? ' <small>(manual)</small>'
					: dealTouch(d)
						? ' <small>(measured)</small>'
						: ''),
			esc(d.choice ?? ''),
			esc(d.guests ?? ''),
			esc(STATUS_LABELS[d.status] ?? d.status),
			eur(d.offerteAmount ?? null, 2)
		]);

	// Form abandonment: who started and left, and on which field.
	const abandons = umami.abandons.filter((a) => inRange(a.date));
	const byField = new Map<string, number>();
	const bySurface = new Map<string, number>();
	for (const a of abandons) {
		byField.set(
			`${a.lastField} (step ${a.step})`,
			(byField.get(`${a.lastField} (step ${a.step})`) ?? 0) + 1
		);
		bySurface.set(a.surface, (bySurface.get(a.surface) ?? 0) + 1);
	}
	const abandonSection = `<section><h2>Form abandonment</h2>
${
	abandons.length
		? `<div class="charts"><div>${table(
				['Last field touched', 'Abandons'],
				[...byField.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => [esc(f), n0(n)]),
				{ numeric: [false, true] }
			)}</div><div>${table(
				['Surface', 'Abandons'],
				[...bySurface.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => [esc(s), n0(n)]),
				{ numeric: [false, true] }
			)}</div></div>`
		: '<p class="note">No <code>contact_abandon</code> events in this export yet (tracked from the next deploy on).</p>'
}
<p class="note">Fires once per attempt when someone who started typing leaves the page or switches tabs, with the last field they touched. Compare with "Started form" in the landing-page table.</p>
</section>`;

	const b = all;
	const k = allK;
	// Funnel from the first day form events exist (contact_view started mid 2026),
	// so the steps are measured over the same visits.
	const formSince =
		umami.visits
			.filter((v) => v.events.has('contact_view'))
			.map((v) => v.date)
			.sort()[0] ?? since;
	const funnelFrom = formSince > since ? formSince : since;
	const fb = fill(emptyBucket(funnelFrom, until), umami.visits, deals, gsc);
	const funnel = funnelChart(
		[
			{ label: 'Visits', value: fb.visits },
			{ label: 'Saw the form', value: fb.contactView },
			{ label: 'Started typing', value: fb.contactStart },
			{ label: 'Submitted', value: fb.contactSubmit, note: 'Umami contact_submit' },
			{ label: 'Leads in pipeline', value: fb.leads, note: 'incl. WhatsApp / mail', ofFirst: true },
			{ label: 'Offertes sent', value: fb.offersSent },
			{ label: 'Won', value: fb.won }
		],
		`Visit → booking, ${funnelFrom} → ${until}`
	);

	const kpiSection = `<section><h2>Overall ${since} → ${until} (${dayDiff(since, until) + 1} days)</h2>
<p class="note">Cohort view: everything counts in the month the aanvraag came in. ${
		k.clickMetrics
			? `Search Console covers ${pct(k.gscCoverage, 0)} of the days.`
			: `Search Console covers only ${pct(k.gscCoverage, 0)} of the days, so click metrics are left out; run <code>bun run gsc:pull</code>.`
	}</p>
<div class="tiles">
	${tile('Visits', n0(b.visits), `${n0(b.bySource.google)} Google · ${n0(b.bySource.instagram + b.bySource.instagram_ads)} Instagram${b.gscDays ? ` · ${n0(b.gscClicks)} GSC clicks` : ''}`)}
	${tile('Leads', n0(b.leads), `${pct(k.leadRate)} of visits · 1 per ${n1(k.visitsPerLead)}`)}
	${tile('Won', `${n0(b.won)} <small>of ${n0(b.won + b.lostClient)} decided</small>`, `${pct(k.winRate)} win rate · ${n0(b.pending)} open · ${n0(b.offersSent)} offertes sent`)}
	${tile('Won value', eur(b.wonValue), `avg ${eur(k.avgWon)} per booking · ${eur(b.pendingValue)} still open`)}
	${tile('Value per visit', eur(k.valuePerVisit, 2), `${eur(k.valuePerLead)} per lead`)}
	${tile('Value per Google click', eur(k.valuePerClick, 2), k.clickMetrics ? `${pct(k.leadsPerGscClick)} of clicks become a lead` : 'needs Search Console coverage')}
</div>
${funnel}
<details><summary>More numbers</summary>${kv([
		['Google lead rate', pct(k.googleLeadRate), 'Google leads ÷ Google visits (Umami)'],
		['Clicks per Google lead', n1(k.clicksPerLead)],
		['Offertes per lead', pct(k.offerRate)],
		['Win rate of all offertes sent', pct(k.winRateAll), 'open ones count as not won'],
		['Lost to client / declined by us', `${n0(b.lostClient)} / ${n0(b.declinedUs)}`],
		['Expected value of open offertes', eur(k.expectedPending), 'open value × win rate'],
		['Value per Google click incl. pipeline', eur(k.valuePerClickExpected, 2)],
		['Umami ÷ GSC coverage', pct(k.umamiCoverage, 0), 'Google visits seen per GSC click'],
		[
			'Form: seen / started / submitted',
			`${n0(b.contactView)} / ${n0(b.contactStart)} / ${n0(b.contactSubmit)}`,
			'tracked since the form events went live'
		],
		['CTA clicks (offerte + WhatsApp)', n0(b.ctaClicks)],
		[
			'Meta opt-in',
			`${n0(b.metaConsent)} of ${n0(b.metaLeads)} Meta leads`,
			'ticked the consent box, so Meta got a Lead event'
		]
	])}</details>
</section>
`;

	const priorRows = [...prior, snapshot].map((s) => {
		const o = s.overall;
		const ok = o.kpis;
		return [
			s.generatedAt.slice(0, 10),
			`${s.range[0]} → ${s.range[1]}`,
			n0(o.visits),
			n0(o.gscClicks),
			n0(o.leads),
			pct(ok.leadRate),
			n0(o.offersSent),
			n0(o.won),
			pct(ok.winRate),
			eur(o.wonValue),
			eur(ok.valuePerVisit, 2),
			eur(ok.valuePerClick, 2)
		];
	});

	const es = econ.summary;
	const estimated = es.materialsEstimated || es.hoursEstimated;
	const productRows = econ.byProduct.map((r) => [
		PRODUCT_LABEL[r.product],
		n0(r.leads),
		n0(r.quoted),
		n0(r.won),
		pct(r.winRate),
		n0(r.avgGuests),
		eur(r.avgQuoteIncl),
		eur(r.avgPerGuestIncl, 2),
		pct(r.quoteVsModel, 0),
		eur(r.wonValue),
		eur(r.perHour)
	]);
	const wonRows = econ.won.map((e) => [
		esc(e.deal.name),
		PRODUCT_LABEL[e.product],
		n0(e.guests),
		eur(e.incl, 2),
		eur(e.excl),
		eur(e.materials) + (e.materialsEstimated && e.materials != null ? '*' : ''),
		n1(e.hours) + (e.hoursEstimated && e.hours != null ? '*' : ''),
		eur(e.gross),
		eur(e.perHour),
		eur(e.modelExcl),
		e.deal.eventDate ?? ''
	]);
	const econSection = `<section><h2>Business &amp; customers</h2>
<p class="note">Won bookings that came in during the range. ${
		estimated
			? `Materials and hours are estimated with the admin pricing model at the deal's guest count and ${ONE_WAY_KM} km one-way (<code>--km</code>) unless the deal has real costs or logged hours; BTW 9% where no btw_amount.`
			: 'Materials and hours come from the deals themselves.'
	}</p>
<div class="tiles">
	${tile('Avg order value', eur(es.avgOrderIncl), `median ${eur(es.medianOrderIncl)} · ${eur(es.avgPerGuestIncl, 2)} per guest · incl. BTW`)}
	${tile('Guests per booking', n0(es.avgGuests), `${n0(es.bookings)} bookings · ${n0(es.customers)} customers · ${n0(es.repeatCustomers)} repeat`)}
	${tile('Gross margin', pct(es.grossMargin, 0), `${eur(es.grossPerBooking)} per booking${estimated ? ' · estimated' : ''}`)}
	${tile('€ per hour', eur(es.perHour), `${n1(es.hoursPerBooking)} h per booking, travel included`)}
	${tile('Days to decision', n1(es.avgDecisionDays), es.decisionKnown ? `reply ${n1(es.avgReplyDays)} d · offerte ${n1(es.avgQuoteDays)} d · ${es.decisionKnown} known` : 'fill in reply / afgewezen dates in the admin')}
	${tile('Lead time', es.avgLeadTimeDays == null ? '–' : `${n0(es.avgLeadTimeDays)} d`, `aanvraag → event, won bookings`)}
</div>
<h3>By product</h3>
<div class="wrap">${table(
		[
			'Product',
			'Leads',
			'Offertes',
			'Won',
			'Win rate',
			'Avg guests',
			'Avg quote',
			'€ / guest',
			'Quote vs model',
			'Won value',
			'€ / hour (won)'
		],
		productRows,
		{ numeric: [false, ...Array(10).fill(true)] }
	)}</div>
<h3>Why clients said no</h3>
<div class="wrap">${table(
		['Reason', 'Lost quotes', 'Quoted value'],
		econ.lostReasons.map(([reason, x]) => [
			LOST_REASON_LABEL[reason] ?? esc(reason),
			n0(x.count),
			eur(x.value)
		]),
		{ numeric: [false, true, true] }
	)}</div>
<p class="note">From "reden afwijzing" in the admin. Unknown means it was never filled in.</p>
<details><summary>More numbers</summary>${kv([
		['Revenue won', `${eur(es.revenueIncl)} incl. · ${eur(es.revenueExcl)} excl. BTW`],
		['Order value range', `${eur(es.minOrderIncl)} to ${eur(es.maxOrderIncl)}`],
		[
			'Avg quote, all offertes',
			eur(es.avgQuoteIncl),
			`lost quotes avg ${eur(es.avgLostQuoteIncl)}`
		],
		['Open offertes', eur(es.pendingValueIncl), 'incl. BTW'],
		[
			'Materials, won',
			eur(es.materials),
			es.materialsEstimated ? 'estimated' : 'from costs column'
		],
		['Hours, won', n1(es.hours), es.hoursEstimated ? 'estimated' : 'logged'],
		['Gross margin, won', eur(es.gross)],
		['Quotes vs pricing model', pct(es.quoteVsModel, 0), 'actual excl. BTW vs calculator today'],
		['Median lead time, all aanvragen', `${n0(es.medianLeadTimeDays)} d`]
	])}
<h3>Won bookings</h3>
<div class="wrap">${table(
		[
			'Name',
			'Product',
			'Guests',
			'Quote incl.',
			'Excl. BTW',
			'Materials',
			'Hours',
			'Gross',
			'€ / hour',
			'Model price excl.',
			'Event'
		],
		wonRows,
		{ numeric: [false, false, true, true, true, true, true, true, true, true, false] }
	)}</div>
<p class="note">* estimated with the pricing model. "Model price" is what the calculator would quote for that product and guest count today, excl. BTW.</p>
<h3>Agenda load, by event month (won + open)</h3>
<div class="wrap">${table(
		['Event month', 'Won', 'Won value', 'Open', 'Open value'],
		econ.byEventMonth.map(([m, x]) => [
			m,
			n0(x.won),
			eur(x.wonValue),
			n0(x.open),
			eur(x.openValue)
		]),
		{ numeric: [false, true, true, true, true] }
	)}</div>
</details>
</section>`;

	const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hangende Hapjes funnel report ${TODAY}</title>
<style>
:root{color-scheme:light;--surface:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--muted:#8a8984;--line:#e6e5e1;--accent:#2a78d6}
*{box-sizing:border-box}body{margin:0;background:var(--surface);color:var(--ink);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1180px;margin:0 auto;padding:28px 20px 60px}
h1{font-size:26px;margin:0 0 4px}h2{font-size:18px;margin:36px 0 6px;padding-top:12px;border-top:1px solid var(--line)}h3{font-size:15px;margin:8px 0 4px}
.meta,.note{color:var(--ink2);font-size:13px;margin:0 0 12px}.note{margin-bottom:14px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.tile{border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:#fff}
.tl{font-size:12px;color:var(--ink2);text-transform:uppercase;letter-spacing:.03em}.tv{font-size:26px;font-weight:600;margin:2px 0}.ts{font-size:12px;color:var(--muted)}
table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0 4px}th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{font-weight:600;color:var(--ink2);white-space:nowrap}td:first-child{white-space:nowrap}td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}small{color:var(--muted)}
.wrap{overflow-x:auto}.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:18px}
figure{margin:0;border:1px solid var(--line);border-radius:8px;padding:12px;background:#fff}figcaption{font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px}
.chart{width:100%;height:auto}.grid{stroke:var(--line);stroke-width:1}.axis{stroke:#bbb;stroke-width:1}.tick{font-size:11px;fill:var(--ink2)}.val{font-size:10px;fill:var(--ink2)}
.legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--ink2);margin-top:6px}.lg i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.warn{background:#fff6e5;border:1px solid #f1d49a;border-radius:6px;padding:8px 12px;font-size:13px}
.def{font-size:13px;color:var(--ink2)}.def dt{font-weight:600;color:var(--ink);margin-top:6px}.def dd{margin:0}
code{font-size:12px;background:#f1f0ec;padding:1px 4px;border-radius:3px}
.funnelfig{max-width:760px}.flabel{font-size:12px;fill:var(--ink2)}.fval{font-size:12px;fill:var(--ink);font-weight:600}.fconv{font-weight:400;fill:var(--muted)}.fnote{margin:4px 0 0;font-size:11px;color:var(--muted)}
details{margin:14px 0 4px}summary{cursor:pointer;font-size:13px;color:var(--accent);user-select:none}
.ok{color:#008300;font-weight:600}.warnt{color:#b45309;font-weight:600}.bad{color:#b91c1c;font-weight:600}
.kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:4px 24px;margin:10px 0 4px;font-size:13px}.kv div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px dotted var(--line);padding:4px 0}.kv dt{color:var(--ink2)}.kv dd{margin:0;font-variant-numeric:tabular-nums;text-align:right}
</style></head><body><main>
<h1>Hangende Hapjes · website → booking funnel</h1>
<p class="meta">Generated ${esc(new Date().toLocaleString('nl-NL'))} · deals: <b>${esc(dealsLabel)}</b> · Umami: <b>${esc(umami.label)}</b> · GSC: <b>${esc(gsc.sources.join(', ') || 'none')}</b></p>
${warnings.length ? `<div class="warn">${warnings.map(esc).join('<br>')}</div>` : ''}

${kpiSection}

${econSection}

<section><h2>Ads rule: what a click may cost</h2>
<p class="note">Derived from our own bookings, with the assumptions in <code>ADS_RULE</code> (scripts/funnel-economics.ts). Every run recomputes it, so the campaign table above is always judged against today's numbers.</p>
<div class="wrap">${table(
		['Step', 'Value', 'Based on'],
		[
			[
				'Average booking, incl. BTW',
				eur(rule.aovIncl),
				`${n0(econ.summary.bookings)} won bookings`
			],
			['Average booking, excl. BTW', eur(rule.aovExcl), 'real btw_amount or 9%'],
			[
				'Materials per booking',
				rule.materials != null ? `− ${eur(rule.materials)}` : '–',
				econ.summary.materialsEstimated ? 'pricing model estimate' : 'costs column'
			],
			['Gross per booking', eur(rule.gross), ''],
			[
				'What we want to keep per event',
				`− ${eur(rule.targetPayPerEvent)}`,
				'assumption: €300 to €400 before tax for our work'
			],
			['<b>Left for ads per booking</b>', `<b>${eur(rule.left)}</b>`, ''],
			[
				'× win rate',
				pct(rule.winRate, 0),
				'assumption: 3 of 20 so far, 4 to 5 with normal availability'
			],
			['<b>Max cost per lead</b>', `<b>${eur(rule.maxCostPerLead)}</b>`, ''],
			['Measured lead rate', pct(rule.leadRate), 'leads ÷ prospect visits, this range'],
			[
				'× lead quality of ad traffic',
				pct(rule.leadQuality, 0),
				'assumption: cold traffic converts half as well'
			],
			[
				'<b>Max cost per click</b>',
				`<b>${eur(rule.maxCpc, 2)}</b>`,
				`${pct(rule.adsLeadRate, 2)} of ad visits become a lead · ${eur(rule.maxCpcAtPay[300], 2)} at €300 pay, ${eur(rule.maxCpcAtPay[400], 2)} at €400`
			],
			[
				'<b>Max cost per booking</b>',
				`<b>${eur(rule.maxCostPerBooking)}</b>`,
				'at this spend the pay target is exactly kept'
			]
		],
		{ numeric: [false, true, false] }
	)}</div>
<h3>Lead rate, three ways</h3>
<div class="wrap">${table(
		['Base', 'Count', 'Visits', 'Rate', 'Used by the rule'],
		[
			[
				'Form submits ÷ visits, since form tracking',
				n0(fb.contactSubmit),
				n0(fb.visits),
				pct(ratio(fb.contactSubmit, fb.visits)),
				'strictest: only what Umami saw'
			],
			[
				'Leads in pipeline ÷ visits, same window',
				n0(fb.leads),
				n0(fb.visits),
				pct(ratio(fb.leads, fb.visits)),
				'incl. WhatsApp and mail'
			],
			[
				'All leads ÷ all visits, full range',
				n0(b.leads),
				n0(b.visits),
				pct(k.leadRate),
				'<b>yes</b>'
			]
		],
		{ numeric: [false, true, true, true, false] }
	)}</div>
<p class="note">Per visit, not per person: people come back a few times before they enquire, but ads are billed per click, so per visit is the right base.</p>
<p class="note">These are break-even limits against the pay target, not profit: at the max, a booking pays materials, ads and our target and nothing more. A campaign above the max cost per lead means the lead rate or win rate on ad traffic is worse than assumed. Update the assumptions as real numbers come in.</p>
</section>

<section><h2>Per month</h2>
<div class="charts">
${barChart({ months, series: sourceSeries, stacked: true, title: 'Prospect visits per month, by source (Umami)' })}
${barChart({ months, series: funnelSeries, stacked: false, title: 'Pipeline per month, by month the aanvraag came in' })}
</div>
<div class="wrap">${table(
		[
			'Month',
			'Visits',
			'Google',
			'Instagram',
			'Direct',
			'GSC clicks',
			'Contact viewed',
			'Form submits',
			'Leads',
			'Google leads',
			'Lead rate',
			'Offertes',
			'Won',
			'Won value',
			'Open',
			'Lost',
			'We declined'
		],
		monthRows,
		{ numeric: [false, ...Array(16).fill(true)] }
	)}</div>
<p class="note">Visits exclude klantportaal/admin traffic. "Form submits" is the Umami <code>contact_submit</code> event (tracked since late May 2026, so earlier months are low by construction). Partial GSC months show the day count.</p>
</section>

<section><h2>By source</h2>
<div class="wrap">${table(
		[
			'Source',
			'Visits (Umami)',
			'Leads',
			'Offertes',
			'Won',
			'Win rate',
			'Won value',
			'Open',
			'Open value',
			'Lead rate',
			'€ / visit'
		],
		sourceRows,
		{ numeric: [false, ...Array(10).fill(true)] }
	)}</div>
<p class="note">Deal source = our manual <em>attributie</em> if set, otherwise what the site measured at submit (first touch), otherwise what the client typed. "Found via TikTok, then googled us" counts as Google. Word of mouth and unknown have no matching traffic bucket. Paid channels only show up when ads carry <code>utm_medium=paid</code>.</p>
</section>

<section><h2>By campaign (utm_campaign)</h2>
${
	campaignRows.length
		? `<div class="wrap">${table(
				[
					'Campaign',
					'Spend',
					'Ad clicks',
					'Visits',
					'Form submits',
					'Leads',
					'Lead rate',
					'Won',
					'Won value',
					'Cost / click vs rule',
					'Cost / lead vs rule'
				],
				campaignRows,
				{ numeric: [false, ...Array(10).fill(true)] }
			)}</div>`
		: '<p class="note">No tagged campaigns in this range yet.</p>'
}
<p class="note">Tag every ad link like <code>https://hangendehapjes.nl/?utm_source=instagram&amp;utm_medium=paid&amp;utm_campaign=&lt;campagne&gt;&amp;utm_content=&lt;creative&gt;</code>. Visits and form submits come from Umami; leads and won come from the pipeline via the first touch the site stored at submit. Spend and ad clicks come from <code>data/ad-spend.csv</code> (campaign,from,to,spend,clicks), typed over from Ads Manager; "ok" is within the rule above, "above" up to 1,5× it, "stop" beyond.</p>
</section>

<section><h2>By landing page</h2>
<div class="wrap">${table(
		[
			'Landing page',
			'Visits',
			'GSC clicks',
			'Saw prices',
			'Saw form',
			'Started form',
			'Form submits',
			'Submit rate',
			'Leads',
			'Won'
		],
		landingRows,
		{ numeric: [false, ...Array(9).fill(true)] }
	)}</div>
<p class="note">Leads and won per landing page need the measured first touch${haveTouch ? '' : ' (none in this data yet: it is stored from the next deploy on)'}.</p>
</section>

${abandonSection}

${
	gsc.pages || gsc.queries
		? `<section><h2>Search Console detail</h2><div class="charts">
${
	gsc.pages
		? `<div><h3>Top pages <small>${esc(gsc.pages.label)}</small></h3>${table(
				['Page', 'Clicks', 'Impr.', 'CTR', 'Pos.'],
				gsc.pages.rows
					.slice(0, 12)
					.map((r) => [
						esc(pagePath(r.key) || '/'),
						n0(r.clicks),
						n0(r.impressions),
						pct(r.ctr / 100),
						n1(r.position)
					]),
				{ numeric: [false, true, true, true, true] }
			)}</div>`
		: ''
}
${
	gsc.queries
		? `<div><h3>Top queries <small>${esc(gsc.queries.label)}</small></h3>${table(
				['Query', 'Clicks', 'Impr.', 'CTR', 'Pos.'],
				gsc.queries.rows
					.slice(0, 15)
					.map((r) => [
						esc(r.key),
						n0(r.clicks),
						n0(r.impressions),
						pct(r.ctr / 100),
						n1(r.position)
					]),
				{ numeric: [false, true, true, true, true] }
			)}</div>`
		: ''
}
</div></section>`
		: ''
}

<section><h2>Runs over time</h2>
<div class="wrap">${table(
		[
			'Run',
			'Range',
			'Visits',
			'GSC clicks',
			'Leads',
			'Lead rate',
			'Offertes',
			'Won',
			'Win rate',
			'Won value',
			'€ / visit',
			'€ / Google click'
		],
		priorRows,
		{ numeric: [false, false, ...Array(10).fill(true)] }
	)}</div>
<p class="note">One row per <code>reports/funnel-*.json</code>.</p>
</section>

<section><h2>All aanvragen (${deals.length})</h2>
<div class="wrap">${table(['Came in', 'Name', 'Said', 'Bucket', 'Wat', 'Guests', 'Status', 'Offerte'], dealRows, { numeric: [false, false, false, false, false, true, false, true] })}</div>
</section>

<section><h2>Definitions</h2><dl class="def">
<dt>Visit</dt><dd>One Umami visit (visit_id) on hangendehapjes.nl whose first pageview is not the klantportaal or admin. Source comes from the utm / referrer of that first pageview, bucketed with the same function the site uses.</dd>
<dt>Lead</dt><dd>One row in the aanvragen pipeline, counted in the month of its "binnen" date.</dd>
<dt>Offerte sent</dt><dd>A quote went out: a "verstuurd op" date, a quoted amount, or status offerte verstuurd / in optie / geaccepteerd or any later booking status (geleverd, factuur verstuurd, betaald). Includes deals we declined ourselves after quoting (the admin dashboard leaves those out). A lost deal without an amount or date is not counted, so fill those in.</dd>
<dt>Win rate (decided)</dt><dd>Won ÷ (won + lost to client). Open offertes are left out, so this is the historical yes-rate once a client decides.</dd>
<dt>Value per Google click</dt><dd>Offerte totals (incl. BTW) of won deals attributed to Google ÷ Search Console clicks in the same window. The "incl. expected pipeline" variant adds open offertes × win rate, scaled by the Google share of leads. Only shown when GSC covers the window.</dd>
<dt>Umami ÷ GSC coverage</dt><dd>Google-referred visits Umami recorded per Search Console click. Below 100% means ad blockers / consent / bots; it is the correction factor between the two traffic sources. Above 100% means Umami also counts non-search Google referrals (Maps, Business Profile).</dd>
</dl></section>
</main></body></html>`;

	const htmlPath = join(OUT_DIR, `funnel-${TODAY}.html`);
	const jsonPath = join(OUT_DIR, `funnel-${TODAY}.json`);
	writeFileSync(htmlPath, html);
	writeFileSync(jsonPath, JSON.stringify(snapshot, null, '\t'));

	console.log(`\nReport: ${htmlPath}\nSnapshot: ${jsonPath}\n`);
	console.log(`Range ${since} → ${until} · GSC coverage ${pct(k.gscCoverage, 0)}`);
	console.log(
		`  bookings ${es.bookings} · avg order ${eur(es.avgOrderIncl)} · gross margin ${eur(es.gross)} (${pct(es.grossMargin, 0)}) · ${eur(es.perHour)}/h over ${n1(es.hours)} h`
	);
	console.log(
		`  visits ${b.visits} (google ${b.bySource.google}) · GSC clicks ${b.gscClicks} · leads ${b.leads} (google ${b.leadsGoogle})`
	);
	console.log(
		`  lead rate ${pct(k.leadRate)} · offertes ${b.offersSent} · won ${b.won} · win rate ${pct(k.winRate)} · won ${eur(b.wonValue)}`
	);
	console.log(
		`  € per visit ${eur(k.valuePerVisit, 2)} · € per Google click ${eur(k.valuePerClick, 2)} (incl. expected pipeline ${eur(k.valuePerClickExpected, 2)})`
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
