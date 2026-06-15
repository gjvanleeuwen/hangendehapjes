// Client-safe deal types, constants and pure helpers. No DB imports here so it
// can be used from both server code and Svelte components. The actual database
// access lives in $lib/server/deals.ts.

export const DEAL_STATUSES = [
	'nieuw',
	'offerte_verstuurd',
	'geaccepteerd',
	'afgewezen',
	'afgerond'
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

export const STATUS_LABELS: Record<DealStatus, string> = {
	nieuw: 'Nieuw',
	offerte_verstuurd: 'Offerte verstuurd',
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
	source: string;
	eventDate: string | null; // YYYY-MM-DD
	eventDateText: string; // original free-text date (e.g. "ergens in september")
	location: string;
	guests: string;
	serviceType: string;
	choice: string;
	dagdeel: string;
	servingTime: string;
	status: DealStatus;
	offerteAmount: number | null;
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
	d.status === 'geaccepteerd' ||
	d.status === 'afgerond';

export const isWon = (d: Pick<Deal, 'status'>) =>
	d.status === 'geaccepteerd' || d.status === 'afgerond';

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

export type Metrics = {
	total: number;
	offertes: number;
	won: number;
	lost: number;
	open: number;
	conversionPct: number; // won / offertes
	wonValue: number; // sum of offerteAmount for won deals
	byMonth: MonthMetric[];
	bySource: SourceMetric[];
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
	const open = deals.filter((d) => d.status === 'nieuw' || d.status === 'offerte_verstuurd').length;
	const wonValue = deals
		.filter(isWon)
		.reduce((sum, d) => sum + (d.offerteAmount ?? 0), 0);

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
		const source = d.source.trim() || 'Onbekend';
		const s = sources.get(source) ?? { source, leads: 0, won: 0 };
		s.leads += 1;
		if (isWon(d)) s.won += 1;
		sources.set(source, s);
	}
	const bySource = [...sources.values()].sort((a, b) => b.leads - a.leads);

	return {
		total: deals.length,
		offertes,
		won,
		lost,
		open,
		conversionPct: offertes ? Math.round((won / offertes) * 100) : 0,
		wonValue,
		byMonth,
		bySource
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
