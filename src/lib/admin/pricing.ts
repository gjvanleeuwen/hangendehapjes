export type Product = 'tiramisu' | 'burrata';

interface Tier {
	45: number;
	100: number;
	200: number;
}

export const PRICE_TIERS: Record<Product, Tier> = {
	tiramisu: { 45: 395, 100: 650, 200: 1125 },
	burrata: { 45: 420, 100: 700, 200: 1225 }
};

export const PREP_HOURS: Record<Product, Tier> = {
	tiramisu: { 45: 1.25, 100: 2, 200: 3.5 },
	burrata: { 45: 0.6, 100: 1, 200: 1.75 }
};

function highestPrepProduct(): Product {
	const a = PREP_HOURS.tiramisu[100];
	const b = PREP_HOURS.burrata[100];
	return a >= b ? 'tiramisu' : 'burrata';
}

const ENTRY_TIER = 45;

export const PRODUCT_LABELS: Record<Product, string> = {
	tiramisu: 'Tiramisu (De Toetjes Vrouw)',
	burrata: 'Burrata (De Borrel Baas)'
};

export const MIN_PORTIONS_PER_PRODUCT = ENTRY_TIER;
export const MIN_TOTAL_PORTIONS = ENTRY_TIER;

export interface PricingConfig {
	mixPrepFactor: number;
	hourlyRate: number;
	extraPersonSetup: number;
	extraPersonPer50: number;
	extraPersonMinPortions1: number;
	extraPersonMinPortions2: number;
	freeRoundTripKm: number;
	costPerKm: number;
}

export const DEFAULT_CONFIG: PricingConfig = {
	mixPrepFactor: 1.0,
	hourlyRate: 75,
	extraPersonSetup: 50,
	extraPersonPer50: 75,
	extraPersonMinPortions1: 100,
	extraPersonMinPortions2: 200,
	freeRoundTripKm: 100,
	costPerKm: 0.45
};

function interp(x: number, x0: number, x1: number, y0: number, y1: number): number {
	return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function piecewise(value: Tier, n: number): number {
	if (n <= ENTRY_TIER) return value[45];
	if (n <= 100) return interp(n, ENTRY_TIER, 100, value[45], value[100]);
	if (n <= 200) return interp(n, 100, 200, value[100], value[200]);
	const slope = (value[200] - value[100]) / 100;
	return value[200] + (n - 200) * slope;
}

export function purePrice(product: Product, portions: number): number {
	if (portions <= 0) return 0;
	return piecewise(PRICE_TIERS[product], portions);
}

export function prepHours(product: Product, portions: number): number {
	if (portions <= 0) return 0;
	return piecewise(PREP_HOURS[product], portions);
}

export interface PriceBreakdown {
	totalPortions: number;
	primary: { product: Product; portions: number; price: number } | null;
	extension: { product: Product; portions: number; price: number } | null;
	mixSurcharge: number;
	extraPersonFee: number;
	travelFee: number;
	travelChargedKm: number;
	total: number;
	perPortion: number;
	allowedExtraPeople: number;
	warnings: string[];
}

export function calculatePrice(input: {
	tiraPortions: number;
	burrPortions: number;
	extraPeople: number;
	oneWayKm: number;
	config: PricingConfig;
}): PriceBreakdown {
	const { tiraPortions, burrPortions, extraPeople, oneWayKm, config } = input;
	const totalPortions = tiraPortions + burrPortions;
	const warnings: string[] = [];

	const isMix = tiraPortions > 0 && burrPortions > 0;
	const isPure = (tiraPortions > 0) !== (burrPortions > 0);

	if (isMix) {
		if (tiraPortions < MIN_PORTIONS_PER_PRODUCT)
			warnings.push(`Bij mix minimaal ${MIN_PORTIONS_PER_PRODUCT} tiramisu.`);
		if (burrPortions < MIN_PORTIONS_PER_PRODUCT)
			warnings.push(`Bij mix minimaal ${MIN_PORTIONS_PER_PRODUCT} burrata.`);
	} else if (totalPortions > 0 && totalPortions < MIN_TOTAL_PORTIONS) {
		warnings.push(`Minimaal ${MIN_TOTAL_PORTIONS} porties.`);
	}

	let primary: PriceBreakdown['primary'] = null;
	let extension: PriceBreakdown['extension'] = null;
	let mixSurcharge = 0;

	if (isMix) {
		const tiraIsPrimary = tiraPortions >= burrPortions;
		const primaryProduct: Product = tiraIsPrimary ? 'tiramisu' : 'burrata';
		const secondaryProduct: Product = tiraIsPrimary ? 'burrata' : 'tiramisu';
		const primaryN = tiraIsPrimary ? tiraPortions : burrPortions;
		const secondaryN = tiraIsPrimary ? burrPortions : tiraPortions;

		const primaryPrice = purePrice(primaryProduct, primaryN);
		const extPrice =
			purePrice(secondaryProduct, primaryN + secondaryN) - purePrice(secondaryProduct, primaryN);

		primary = { product: primaryProduct, portions: primaryN, price: round2(primaryPrice) };
		extension = { product: secondaryProduct, portions: secondaryN, price: round2(extPrice) };

		const surchargeHours = prepHours(highestPrepProduct(), secondaryN);
		mixSurcharge = round2(surchargeHours * config.hourlyRate * config.mixPrepFactor);
	} else if (isPure) {
		const product: Product = tiraPortions > 0 ? 'tiramisu' : 'burrata';
		const portions = tiraPortions > 0 ? tiraPortions : burrPortions;
		primary = { product, portions, price: round2(purePrice(product, portions)) };
	}

	let allowedExtra = 0;
	if (totalPortions >= config.extraPersonMinPortions1) allowedExtra = 1;
	if (totalPortions >= config.extraPersonMinPortions2) allowedExtra = 2;
	const cappedExtra = Math.min(extraPeople, allowedExtra);
	if (extraPeople > allowedExtra) {
		warnings.push(`Extra persoon vereist minimaal ${config.extraPersonMinPortions1} porties (2× extra vereist ${config.extraPersonMinPortions2}).`);
	}

	const segments = Math.ceil(totalPortions / 50);
	const extraPersonFee =
		cappedExtra > 0
			? round2(cappedExtra * (config.extraPersonSetup + segments * config.extraPersonPer50))
			: 0;

	const roundTripKm = Math.max(0, oneWayKm) * 2;
	const travelChargedKm = Math.max(0, roundTripKm - config.freeRoundTripKm);
	const travelFee = round2(travelChargedKm * config.costPerKm);

	const base = (primary?.price ?? 0) + (extension?.price ?? 0) + mixSurcharge;
	const total = round2(base + extraPersonFee + travelFee);
	const perPortion = totalPortions > 0 ? round2(total / totalPortions) : 0;

	return {
		totalPortions,
		primary,
		extension,
		mixSurcharge,
		extraPersonFee,
		travelFee,
		travelChargedKm,
		total,
		perPortion,
		allowedExtraPeople: allowedExtra,
		warnings
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export function priceCurve(opts: {
	tiraShare: number;
	extraPeople: number;
	oneWayKm: number;
	config: PricingConfig;
	from?: number;
	to?: number;
	step?: number;
}): { x: number; total: number; perPortion: number }[] {
	const { tiraShare, extraPeople, oneWayKm, config, from = ENTRY_TIER, to = 300, step = 5 } = opts;
	const out: { x: number; total: number; perPortion: number }[] = [];
	for (let n = from; n <= to; n += step) {
		const tira = Math.round(n * tiraShare);
		const burr = n - tira;
		const isMix = tira > 0 && burr > 0;
		const tiraOk = !isMix || tira >= MIN_PORTIONS_PER_PRODUCT;
		const burrOk = !isMix || burr >= MIN_PORTIONS_PER_PRODUCT;
		if (!tiraOk || !burrOk) {
			out.push({ x: n, total: NaN, perPortion: NaN });
			continue;
		}
		const r = calculatePrice({
			tiraPortions: tira,
			burrPortions: burr,
			extraPeople,
			oneWayKm,
			config
		});
		out.push({ x: n, total: r.total, perPortion: r.perPortion });
	}
	return out;
}
