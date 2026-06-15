// Client-safe deal types, constants and pure helpers. No DB imports here so it
// can be used from both server code and Svelte components. The actual database
// access lives in $lib/server/deals.ts.

export const DEAL_STATUSES = [
	'nieuw',
	'offerte_verstuurd',
	'in_optie',
	'geaccepteerd',
	'afgewezen',
	'afgerond'
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export const STATUS_LABELS: Record<DealStatus, string> = {
	nieuw: 'Nieuw',
	offerte_verstuurd: 'Offerte verstuurd',
	in_optie: 'In optie',
	geaccepteerd: 'Geaccepteerd',
	afgewezen: 'Afgewezen',
	afgerond: 'Afgerond'
};

export type Deal = {
	id: string;
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
	name: string;
	email: string;
	phone: string;
	source: string; // what the lead said in the form ("Hoe ons gevonden")
	attribution: string; // our corrected/known bucket for funnel analysis
	eventDate: string | null; // YYYY-MM-DD
	eventDateText: string; // original free-text date (e.g. "ergens in september")
	location: string;
	guests: string;
	serviceType: string;
	choice: string;
	dagdeel: string;
	servingTime: string;
	status: DealStatus;
	offerteAmount: number | null; // total the client pays, incl. BTW
	btwAmount: number | null; // BTW (VAT) portion of the offerte
	costs: number | null; // our costs excl. BTW (ingredients, travel, rentals…)
	timeSpent: Record<string, number>; // hours per process phase (see TIME_PHASES)
	offerteVerstuurdOp: string | null; // YYYY-MM-DD
	geldigTot: string | null; // YYYY-MM-DD
	geaccepteerdOp: string | null; // YYYY-MM-DD
	message: string;
	notes: string;
	origin: string; // 'contact_form' | 'manual'
};

export type DealInput = {
	name: string;
	email?: string;
	phone?: string;
	source?: string;
	attribution?: string;
	eventDate?: string | null;
	eventDateText?: string;
	location?: string;
	guests?: string;
	serviceType?: string;
	choice?: string;
	dagdeel?: string;
	servingTime?: string;
	status?: DealStatus;
	offerteAmount?: number | null;
	btwAmount?: number | null;
	costs?: number | null;
	timeSpent?: Record<string, number>;
	offerteVerstuurdOp?: string | null;
	geldigTot?: string | null;
	geaccepteerdOp?: string | null;
	message?: string;
	notes?: string;
	origin?: string;
	createdAt?: string | null; // backfill override for past aanvragen
};

export const isOfferteSent = (d: Pick<Deal, 'status' | 'offerteVerstuurdOp'>) =>
	!!d.offerteVerstuurdOp ||
	d.status === 'offerte_verstuurd' ||
	d.status === 'in_optie' ||
	d.status === 'geaccepteerd' ||
	d.status === 'afgerond';

export const isWon = (d: Pick<Deal, 'status'>) =>
	d.status === 'geaccepteerd' || d.status === 'afgerond';

// Offerte out, awaiting a final yes/no — counts toward "pending sales".
export const isPending = (d: Pick<Deal, 'status'>) =>
	d.status === 'offerte_verstuurd' || d.status === 'in_optie';

// Shown on the agenda calendar / ICS feed (a provisional hold or a real booking).
export const isCalendarEvent = (d: Pick<Deal, 'status'>) =>
	d.status === 'in_optie' || d.status === 'geaccepteerd' || d.status === 'afgerond';

// Prefer our corrected attribution bucket; fall back to what the lead said.
export const effectiveSource = (d: Pick<Deal, 'source' | 'attribution'>) =>
	d.attribution.trim() || d.source.trim() || 'Onbekend';

// The phases of one job, in order. Hours are logged per phase per deal so we
// can see where time actually goes and price future offertes accordingly.
export const TIME_PHASES = [
	{ key: 'offerte', label: 'Offerte & contact' },
	{ key: 'inkoop', label: 'Inkoop' },
	{ key: 'voorbereiding', label: 'Voorbereiding' },
	{ key: 'reizen', label: 'Reizen' },
	{ key: 'event', label: 'Op locatie' },
	{ key: 'afhandeling', label: 'Afhandeling' }
] as const;

export const totalHours = (d: Pick<Deal, 'timeSpent'>) =>
	Object.values(d.timeSpent).reduce((sum, h) => sum + (Number(h) || 0), 0);

// Revenue excl. BTW (what we actually keep before costs).
export const revenueExcl = (d: Pick<Deal, 'offerteAmount' | 'btwAmount'>) =>
	(d.offerteAmount ?? 0) - (d.btwAmount ?? 0);

// Take-home = revenue excl. BTW − our costs. The BTW is passed on to the tax
// office, so it's not ours; this is a management view, not a tax calculation.
export const dealTakeHome = (d: Pick<Deal, 'offerteAmount' | 'btwAmount' | 'costs'>) =>
	revenueExcl(d) - (d.costs ?? 0);

export type MonthMetric = {
	month: string; // YYYY-MM
	leads: number;
	offertes: number;
	won: number;
};

export type SourceMetric = {
	source: string;
	leads: number;
	won: number;
};

export type PhaseMetric = {
	phase: string;
	label: string;
	hours: number; // total logged across won deals
	deals: number; // how many won deals logged this phase
	avg: number; // hours / deals (0 if none)
};

export type Metrics = {
	total: number;
	offertes: number;
	won: number;
	lost: number;
	open: number;
	conversionPct: number; // won / offertes
	wonValue: number; // sum of offerteAmount for won deals (incl. BTW)
	pendingValue: number; // sum of offerteAmount for offertes still out (incl. in optie)
	vat: number; // BTW on won sales
	costs: number; // costs on won deals
	takeHome: number; // revenue excl. BTW − costs, over won deals
	hours: number; // hours logged across won deals
	hourly: number | null; // takeHome / hours
	byMonth: MonthMetric[];
	bySource: SourceMetric[];
	byPhase: PhaseMetric[];
};

/**
 * Pure funnel aggregation over a set of deals. Cohort view: a deal is counted
 * in the month its aanvraag came in (createdAt), so "of the X aanvragen this
 * month, Y became offertes and Z were won" reads correctly.
 */
export function computeMetrics(deals: Deal[], monthsBack = 6): Metrics {
	const offertes = deals.filter(isOfferteSent).length;
	const won = deals.filter(isWon).length;
	const lost = deals.filter((d) => d.status === 'afgewezen').length;
	const open = deals.filter(
		(d) => d.status === 'nieuw' || d.status === 'offerte_verstuurd' || d.status === 'in_optie'
	).length;
	const wonValue = deals.filter(isWon).reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);
	const pendingValue = deals.filter(isPending).reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);

	const months = new Map<string, MonthMetric>();
	for (const d of deals) {
		const month = d.createdAt.slice(0, 7);
		if (!month) continue;
		const m = months.get(month) ?? { month, leads: 0, offertes: 0, won: 0 };
		m.leads += 1;
		if (isOfferteSent(d)) m.offertes += 1;
		if (isWon(d)) m.won += 1;
		months.set(month, m);
	}
	const byMonth = [...months.values()]
		.sort((a, b) => b.month.localeCompare(a.month))
		.slice(0, monthsBack);

	const sources = new Map<string, SourceMetric>();
	for (const d of deals) {
		const source = effectiveSource(d);
		const s = sources.get(source) ?? { source, leads: 0, won: 0 };
		s.leads += 1;
		if (isWon(d)) s.won += 1;
		sources.set(source, s);
	}
	const bySource = [...sources.values()].sort((a, b) => b.leads - a.leads);

	// Financial + time analysis is based on won deals (actually executed work).
	const wonDeals = deals.filter(isWon);
	const vat = wonDeals.reduce((sum, d) => sum + (d.btwAmount ?? 0), 0);
	const costs = wonDeals.reduce((sum, d) => sum + (d.costs ?? 0), 0);
	const takeHome = wonDeals.reduce((sum, d) => sum + dealTakeHome(d), 0);
	const hours = wonDeals.reduce((sum, d) => sum + totalHours(d), 0);

	const byPhase: PhaseMetric[] = TIME_PHASES.map((p) => {
		let h = 0;
		let count = 0;
		for (const d of wonDeals) {
			const v = Number(d.timeSpent[p.key]) || 0;
			if (v > 0) {
				h += v;
				count += 1;
			}
		}
		return { phase: p.key, label: p.label, hours: h, deals: count, avg: count ? h / count : 0 };
	});

	return {
		total: deals.length,
		offertes,
		won,
		lost,
		open,
		conversionPct: offertes ? Math.round((won / offertes) * 100) : 0,
		wonValue,
		pendingValue,
		vat,
		costs,
		takeHome,
		hours,
		hourly: hours > 0 ? takeHome / hours : null,
		byMonth,
		bySource,
		byPhase
	};
}

/**
 * Returns a clean YYYY-MM-DD string if the input is a valid calendar date,
 * else null. Used to turn the contact form's free-text date field into a real
 * `date` column when possible (and to validate manual/backfill input).
 */
export function toDateOrNull(value: string | null | undefined): string | null {
	if (!value) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
	if (!m) return null;
	const [, y, mo, d] = m;
	const date = new Date(`${y}-${mo}-${d}T00:00:00Z`);
	if (Number.isNaN(date.getTime())) return null;
	// Reject overflow like 2026-02-31 that Date silently rolls forward.
	if (date.getUTCMonth() + 1 !== Number(mo) || date.getUTCDate() !== Number(d)) {
		return null;
	}
	return `${y}-${mo}-${d}`;
}
