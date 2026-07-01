// Client-safe deal types, constants and pure helpers. No DB imports here so it
// can be used from both server code and Svelte components. The actual database
// access lives in $lib/server/deals.ts.

export const DEAL_STATUSES = [
	'nieuw',
	'offerte_verstuurd',
	'in_optie',
	'geaccepteerd',
	'afgewezen',
	'afgewezen_intern',
	'afgerond'
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export const STATUS_LABELS: Record<DealStatus, string> = {
	nieuw: 'Nieuw',
	offerte_verstuurd: 'Offerte verstuurd',
	in_optie: 'In optie',
	geaccepteerd: 'Geaccepteerd',
	afgewezen: 'Afgewezen (klant)', // klant wilde niet / koos iemand anders
	afgewezen_intern: 'Afgewezen (wij)', // wij konden niet — geen capaciteit / datum bezet
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
	// Deals we declined ourselves don't belong in the conversion funnel — losing
	// them is our choice (capacity/date), not a failure to convert the client.
	d.status !== 'afgewezen_intern' &&
	(!!d.offerteVerstuurdOp ||
		d.status === 'offerte_verstuurd' ||
		d.status === 'in_optie' ||
		d.status === 'geaccepteerd' ||
		d.status === 'afgerond');

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
	declinedByUs: number; // deals we turned down (capacity/date) — outside the funnel
	wonValue: number; // sum of offerteAmount for won deals (incl. BTW)
	pendingValue: number; // sum of offerteAmount for offertes still out (incl. in optie)
	pendingTakeHome: number; // potential take-home if all pending offertes land
	optieValue: number; // offerteAmount of deals specifically in optie
	optieTakeHome: number; // take-home of deals specifically in optie
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
	const declinedByUs = deals.filter((d) => d.status === 'afgewezen_intern').length;
	const open = deals.filter(
		(d) => d.status === 'nieuw' || d.status === 'offerte_verstuurd' || d.status === 'in_optie'
	).length;
	const wonValue = deals.filter(isWon).reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);
	const pendingDeals = deals.filter(isPending);
	const pendingValue = pendingDeals.reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);
	const pendingTakeHome = pendingDeals.reduce((sum, d) => sum + dealTakeHome(d), 0);
	const optieDeals = deals.filter((d) => d.status === 'in_optie');
	const optieValue = optieDeals.reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);
	const optieTakeHome = optieDeals.reduce((sum, d) => sum + dealTakeHome(d), 0);

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
		declinedByUs,
		wonValue,
		pendingValue,
		pendingTakeHome,
		optieValue,
		optieTakeHome,
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

// ---------------------------------------------------------------------------
// Lead-trend significance — "is this dip real, or just small-numbers noise?"
//
// Leads are rare countable events, so instead of eyeballing "6 then 0" we ask:
// if the underlying lead rate were unchanged, how surprising is the split
// between the most-recent window and the one before it? Two equal-length
// windows under H0 (rate unchanged) split the leads 50/50, so this is an exact
// two-sided binomial (sign) test with p=0.5 — no libraries, no distribution
// assumptions beyond equal-length windows. Needs a real baseline to have power:
// a zero-period only clears p<0.05 once the prior window held >~4 leads.
// ---------------------------------------------------------------------------

export type LeadTrend = {
	windowDays: number;
	recent: number; // leads in the most recent window
	prior: number; // leads in the equal window before it
	total: number; // prior + recent
	direction: 'drop' | 'rise' | 'flat';
	pValue: number; // two-sided exact binomial p-value (H0: rate unchanged)
	verdict: 'significant' | 'suggestive' | 'noise' | 'insufficient';
};

/** Two-sided exact binomial p-value for observing `recent` of `n` under p=0.5. */
export function binomialTwoSidedP(recent: number, n: number): number {
	if (n <= 0) return 1;
	const lo = Math.min(recent, n - recent);
	let term = Math.pow(0.5, n); // P(X = 0)
	let cum = 0;
	for (let k = 0; k <= lo; k++) {
		cum += term;
		term = (term * (n - k)) / (k + 1); // advance to P(X = k+1)
	}
	return Math.min(1, 2 * cum);
}

/** Compare two equal-length lead counts and classify the change. */
export function leadDropTest(prior: number, recent: number, windowDays: number): LeadTrend {
	const total = prior + recent;
	const expected = total / 2;
	const direction = recent < expected ? 'drop' : recent > expected ? 'rise' : 'flat';
	const pValue = binomialTwoSidedP(recent, total);
	const verdict: LeadTrend['verdict'] =
		total < 5
			? 'insufficient'
			: pValue < 0.05
				? 'significant'
				: pValue < 0.1
					? 'suggestive'
					: 'noise';
	return { windowDays, recent, prior, total, direction, pValue, verdict };
}

/**
 * Bucket deals into the most-recent `windowDays` vs the equal window before it
 * and test the split. Suspected-spam captures (`contact_form_suspect`) are
 * excluded — they aren't real leads. `nowIso` is injected so this stays pure.
 */
export function periodLeadTrend(deals: Deal[], windowDays: number, nowIso: string): LeadTrend {
	const now = new Date(nowIso).getTime();
	const dayMs = 86_400_000;
	const recentStart = now - windowDays * dayMs;
	const priorStart = now - 2 * windowDays * dayMs;
	let recent = 0;
	let prior = 0;
	for (const d of deals) {
		if (d.origin === 'contact_form_suspect') continue;
		const t = new Date(d.createdAt).getTime();
		if (Number.isNaN(t)) continue;
		if (t >= recentStart && t < now) recent++;
		else if (t >= priorStart && t < recentStart) prior++;
	}
	return leadDropTest(prior, recent, windowDays);
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
