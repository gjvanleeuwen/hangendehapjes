// Business and customer metrics for the funnel report: order values, guests,
// lead time, product mix, repeat customers, and a rough cost / margin picture.
//
// Costs come from the same pricing model the admin calculator uses
// (src/lib/admin/pricing.ts, DEFAULT_CONFIG): ingredients, packaging, vehicle
// and the hours per phase for the deal's product and guest count. Real numbers
// win when the deal has them (costs / btw_amount / time_spent columns); the
// model fills the gaps. Distance is unknown for most deals, so travel is
// estimated at --km one-way (default 30) and charged at the default km price.
import {
	calculatePrice,
	calculateSpecialPrice,
	DEFAULT_CONFIG,
	type PriceBreakdown
} from '../src/lib/admin/pricing';

export type EconDeal = {
	createdAt: string;
	name: string;
	email?: string;
	status: string;
	eventDate?: string | null;
	guests?: string;
	location?: string;
	serviceType?: string;
	choice?: string;
	offerteAmount?: number | null;
	btwAmount?: number | null;
	costs?: number | null;
	timeSpent?: Record<string, number>;
	firstReplyOn?: string | null;
	offerteVerstuurdOp?: string | null;
	geaccepteerdOp?: string | null;
	afgewezenOp?: string | null;
	lostReason?: string;
};

export const LOST_REASON_LABEL: Record<string, string> = {
	'': 'Unknown',
	prijs: 'Too expensive',
	andere_leverancier: 'Chose another vendor',
	datum_vervallen: 'Event cancelled / date changed',
	geen_reactie: 'Went silent',
	anders: 'Other'
};

const days = (from?: string | null, to?: string | null) =>
	from && to
		? Math.round(
				(Date.parse(`${to.slice(0, 10)}T00:00:00Z`) -
					Date.parse(`${from.slice(0, 10)}T00:00:00Z`)) /
					86400000
			)
		: null;
const present = (xs: (number | null)[]) => xs.filter((x): x is number => x != null);

export type ProductKey =
	| 'tiramisu_taart'
	| 'millefeuille_taart'
	| 'hapjes_tiramisu'
	| 'hapjes_burrata'
	| 'hapjes_mix'
	| 'other';

export const PRODUCT_LABEL: Record<ProductKey, string> = {
	tiramisu_taart: 'Tiramisu taart',
	millefeuille_taart: 'Millefeuille taart',
	hapjes_tiramisu: 'Hapjes tiramisu',
	hapjes_burrata: 'Hapjes burrata',
	hapjes_mix: 'Hapjes mix',
	other: 'Other / custom'
};
const PRODUCT_ORDER: ProductKey[] = [
	'tiramisu_taart',
	'millefeuille_taart',
	'hapjes_tiramisu',
	'hapjes_burrata',
	'hapjes_mix',
	'other'
];

// Food is 9% BTW in NL; used when the deal has no btw_amount.
const BTW_RATE = 0.09;

// Booked, from yes to fully paid. Mirrors WON_STATUSES in src/lib/deals.ts.
const isWon = (d: EconDeal) =>
	['geaccepteerd', 'geleverd', 'factuur_verstuurd', 'afgerond'].includes(d.status);
const isPending = (d: EconDeal) => d.status === 'offerte_verstuurd' || d.status === 'in_optie';
const isLost = (d: EconDeal) => d.status === 'afgewezen';
const quoted = (d: EconDeal) => (d.offerteAmount ?? 0) > 0;
const guestsOf = (d: EconDeal) => {
	const n = Number(String(d.guests ?? '').replace(/[^\d]/g, ''));
	return Number.isFinite(n) && n > 0 ? n : 0;
};

export function productOf(d: EconDeal): ProductKey {
	const c = `${d.choice ?? ''}`.toLowerCase();
	const st = (d.serviceType ?? '').toLowerCase();
	const tira = /tiramisu/.test(c);
	const burr = /burrata/.test(c);
	const taart = st === 'taart' || /taart|cake|millefeuille|millefoglie/.test(c);
	if (/millefeuille|millefoglie/.test(c) && !tira) return 'millefeuille_taart';
	if (taart && tira) return 'tiramisu_taart';
	if (tira && burr) return 'hapjes_mix';
	if (tira) return 'hapjes_tiramisu';
	if (burr) return 'hapjes_burrata';
	return 'other';
}

/** Pricing-model run for this deal at its guest count; null when the product is unknown. */
export function modelFor(d: EconDeal, oneWayKm: number): PriceBreakdown | null {
	const n = guestsOf(d);
	if (!n) return null;
	const config = DEFAULT_CONFIG;
	switch (productOf(d)) {
		case 'tiramisu_taart':
			return calculateSpecialPrice({ variant: 'tiramisu-taart', portions: n, oneWayKm, config });
		case 'millefeuille_taart':
			return calculateSpecialPrice({
				variant: 'millefeuille-taart',
				portions: n,
				oneWayKm,
				config
			});
		case 'hapjes_tiramisu':
			return calculatePrice({ tiraPortions: n, burrPortions: 0, extraPeople: 0, oneWayKm, config });
		case 'hapjes_burrata':
			return calculatePrice({ tiraPortions: 0, burrPortions: n, extraPeople: 0, oneWayKm, config });
		case 'hapjes_mix': {
			const half = Math.round(n / 2);
			return calculatePrice({
				tiraPortions: half,
				burrPortions: n - half,
				extraPeople: 0,
				oneWayKm,
				config
			});
		}
		default:
			return null;
	}
}

export type DealEconomics = {
	deal: EconDeal;
	product: ProductKey;
	guests: number;
	incl: number; // quote incl. BTW
	excl: number; // quote excl. BTW (real btw_amount or 9% assumed)
	btwAssumed: boolean;
	materials: number | null; // real costs column or model estimate
	materialsEstimated: boolean;
	hours: number | null; // logged time_spent or model estimate
	hoursEstimated: boolean;
	gross: number | null; // excl − materials
	perHour: number | null; // gross ÷ hours
	modelExcl: number | null; // what the model would have quoted (excl. BTW)
	leadTimeDays: number | null; // event date − came in
};

export function dealEconomics(d: EconDeal, oneWayKm: number): DealEconomics {
	const model = modelFor(d, oneWayKm);
	const incl = d.offerteAmount ?? 0;
	const btwAssumed = d.btwAmount == null;
	const excl = btwAssumed ? incl / (1 + BTW_RATE) : incl - (d.btwAmount ?? 0);
	const logged = Object.values(d.timeSpent ?? {}).reduce((s, h) => s + (Number(h) || 0), 0);
	const materials = d.costs != null ? d.costs : model ? model.materials.total : null;
	const hours = logged > 0 ? logged : model ? model.hours.total : null;
	const gross = materials != null && incl > 0 ? excl - materials : null;
	const leadTimeDays =
		d.eventDate && d.createdAt
			? Math.round(
					(Date.parse(`${d.eventDate.slice(0, 10)}T00:00:00Z`) -
						Date.parse(`${d.createdAt.slice(0, 10)}T00:00:00Z`)) /
						86400000
				)
			: null;
	return {
		deal: d,
		product: productOf(d),
		guests: guestsOf(d),
		incl,
		excl,
		btwAssumed,
		materials,
		materialsEstimated: d.costs == null,
		hours,
		hoursEstimated: !(logged > 0),
		gross,
		perHour: gross != null && hours ? gross / hours : null,
		modelExcl: model ? model.total : null,
		leadTimeDays
	};
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : null);
const median = (xs: number[]) => {
	if (!xs.length) return null;
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

export function economics(deals: EconDeal[], oneWayKm: number) {
	const all = deals.map((d) => dealEconomics(d, oneWayKm));
	const won = all.filter((e) => isWon(e.deal));
	const quotedAll = all.filter((e) => quoted(e.deal) && e.deal.status !== 'afgewezen_intern');
	const pending = all.filter((e) => isPending(e.deal));
	const lost = all.filter((e) => isLost(e.deal) && quoted(e.deal));

	const wonIncl = won.map((e) => e.incl);
	const wonExcl = won.map((e) => e.excl);
	const wonGuests = won.map((e) => e.guests).filter((g) => g > 0);
	const wonMat = won.filter((e) => e.materials != null);
	const wonHrs = won.filter((e) => e.hours != null);
	const wonGross = won.filter((e) => e.gross != null);
	const grossTotal = sum(wonGross.map((e) => e.gross!));
	const hoursTotal = sum(wonHrs.map((e) => e.hours!));

	// Repeat customers: same email, or same name when the email is missing.
	const keyOf = (d: EconDeal) =>
		(d.email ?? '').trim().toLowerCase() ||
		d.name
			.toLowerCase()
			.replace(/\(.*?\)/g, '')
			.trim();
	const perCustomer = new Map<string, number>();
	for (const d of deals) perCustomer.set(keyOf(d), (perCustomer.get(keyOf(d)) ?? 0) + 1);
	const repeat = [...perCustomer.values()].filter((n) => n > 1).length;

	// Calendar load: won + pending by event month.
	const byEventMonth = new Map<
		string,
		{ won: number; wonValue: number; open: number; openValue: number }
	>();
	for (const e of [...won, ...pending]) {
		const m = e.deal.eventDate?.slice(0, 7);
		if (!m) continue;
		const x = byEventMonth.get(m) ?? { won: 0, wonValue: 0, open: 0, openValue: 0 };
		if (isWon(e.deal)) {
			x.won++;
			x.wonValue += e.incl;
		} else {
			x.open++;
			x.openValue += e.incl;
		}
		byEventMonth.set(m, x);
	}

	// Response and decision speed, in days.
	const replyDays = present(deals.map((d) => days(d.createdAt, d.firstReplyOn)));
	const quoteDays = present(deals.map((d) => days(d.createdAt, d.offerteVerstuurdOp)));
	const decisionDays = present(
		deals.map((d) => days(d.offerteVerstuurdOp, d.geaccepteerdOp ?? d.afgewezenOp))
	);

	// Why clients said no, with the value that walked away.
	const lostReasons = new Map<string, { count: number; value: number }>();
	for (const e of all) {
		if (!isLost(e.deal)) continue;
		const key = e.deal.lostReason ?? '';
		const x = lostReasons.get(key) ?? { count: 0, value: 0 };
		x.count++;
		x.value += e.incl;
		lostReasons.set(key, x);
	}

	const byProduct = PRODUCT_ORDER.map((p) => {
		const rows = all.filter((e) => e.product === p);
		const w = rows.filter((e) => isWon(e.deal));
		const l = rows.filter((e) => isLost(e.deal) && quoted(e.deal));
		const q = rows.filter((e) => quoted(e.deal) && e.deal.status !== 'afgewezen_intern');
		const wg = w.filter((e) => e.gross != null && e.hours);
		return {
			product: p,
			leads: rows.length,
			quoted: q.length,
			won: w.length,
			winRate: ratio(w.length, w.length + l.length),
			avgGuests: avg(rows.map((e) => e.guests).filter((g) => g > 0)),
			avgQuoteIncl: avg(q.map((e) => e.incl)),
			avgPerGuestIncl: avg(q.filter((e) => e.guests > 0).map((e) => e.incl / e.guests)),
			quoteVsModel: avg(q.filter((e) => e.modelExcl).map((e) => e.excl / e.modelExcl! - 1)),
			wonValue: sum(w.map((e) => e.incl)),
			perHour: wg.length ? sum(wg.map((e) => e.gross!)) / sum(wg.map((e) => e.hours!)) : null
		};
	}).filter((r) => r.leads > 0);

	return {
		oneWayKm,
		deals: all,
		won,
		summary: {
			bookings: won.length,
			revenueIncl: sum(wonIncl),
			revenueExcl: sum(wonExcl),
			avgOrderIncl: avg(wonIncl),
			medianOrderIncl: median(wonIncl),
			minOrderIncl: wonIncl.length ? Math.min(...wonIncl) : null,
			maxOrderIncl: wonIncl.length ? Math.max(...wonIncl) : null,
			avgGuests: avg(wonGuests),
			avgPerGuestIncl: avg(won.filter((e) => e.guests > 0).map((e) => e.incl / e.guests)),
			avgQuoteIncl: avg(quotedAll.map((e) => e.incl)),
			avgLostQuoteIncl: avg(lost.map((e) => e.incl)),
			avgLeadTimeDays: avg(won.map((e) => e.leadTimeDays).filter((x): x is number => x != null)),
			medianLeadTimeDays: median(
				all.map((e) => e.leadTimeDays).filter((x): x is number => x != null)
			),
			materials: wonMat.length ? sum(wonMat.map((e) => e.materials!)) : null,
			materialsEstimated: won.some((e) => e.materialsEstimated),
			hours: wonHrs.length ? hoursTotal : null,
			hoursEstimated: won.some((e) => e.hoursEstimated),
			gross: wonGross.length ? grossTotal : null,
			grossMargin: wonGross.length ? ratio(grossTotal, sum(wonGross.map((e) => e.excl))) : null,
			perHour: hoursTotal > 0 ? grossTotal / hoursTotal : null,
			hoursPerBooking: wonHrs.length ? hoursTotal / wonHrs.length : null,
			grossPerBooking: wonGross.length ? grossTotal / wonGross.length : null,
			pendingValueIncl: sum(pending.map((e) => e.incl)),
			repeatCustomers: repeat,
			avgReplyDays: avg(replyDays),
			replyKnown: replyDays.length,
			avgQuoteDays: avg(quoteDays),
			quoteKnown: quoteDays.length,
			avgDecisionDays: avg(decisionDays),
			decisionKnown: decisionDays.length,
			customers: perCustomer.size,
			quoteVsModel: avg(quotedAll.filter((e) => e.modelExcl).map((e) => e.excl / e.modelExcl! - 1))
		},
		byProduct,
		lostReasons: [...lostReasons.entries()].sort((a, b) => b[1].count - a[1].count),
		byEventMonth: [...byEventMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]))
	};
}

export type Economics = ReturnType<typeof economics>;

// ─────────────────────────── Ads rule ───────────────────────────
// What a paid click may cost, derived from our own bookings. Change the
// assumptions here; the report prints every step so the rule stays checkable.
export const ADS_RULE = {
	// Share of leads we close. Gijs: 3 of 20 so far, 4 to 5 with normal availability.
	winRate: 0.2,
	// Cold ad traffic converts at this fraction of the measured lead rate.
	leadQuality: 0.5,
	// What we want to keep per event, before tax, to pay for our own work.
	// Whatever a booking leaves above this may go to ads.
	targetPayPerEvent: 350
};

export function adsRule(es: Economics['summary'], leadRate: number | null) {
	const a = ADS_RULE;
	const aovIncl = es.avgOrderIncl;
	const aovExcl = es.bookings ? es.revenueExcl / es.bookings : null;
	const materials = es.materials != null && es.bookings ? es.materials / es.bookings : null;
	const gross = aovExcl != null && materials != null ? aovExcl - materials : null;
	const left = gross != null ? gross - a.targetPayPerEvent : null;
	const valuePerLead = left != null ? left * a.winRate : null;
	const adsLeadRate = leadRate != null ? leadRate * a.leadQuality : null;
	const valuePerClick =
		valuePerLead != null && adsLeadRate != null ? valuePerLead * adsLeadRate : null;
	// Sensitivity: the same chain at a lower and a higher pay target.
	const at = (pay: number) =>
		gross != null && adsLeadRate != null ? (gross - pay) * a.winRate * adsLeadRate : null;
	return {
		...a,
		aovIncl,
		aovExcl,
		materials,
		gross,
		left,
		valuePerLead,
		leadRate,
		adsLeadRate,
		valuePerClick,
		maxCpc: valuePerClick,
		maxCostPerLead: valuePerLead,
		maxCostPerBooking: left,
		maxCpcAtPay: { 300: at(300), 400: at(400) }
	};
}
