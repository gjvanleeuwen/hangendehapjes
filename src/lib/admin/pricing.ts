export type Product = 'tiramisu' | 'burrata';

interface Tier {
	50: number;
	100: number;
	200: number;
}

export const PRICE_TIERS: Record<Product, Tier> = {
	tiramisu: { 50: 425, 100: 650, 200: 1225 },
	burrata: { 50: 450, 100: 750, 200: 1395 }
};

export const PREP_HOURS: Record<Product, Tier> = {
	tiramisu: { 50: 1.25, 100: 2, 200: 3.5 },
	burrata: { 50: 0.6, 100: 1, 200: 1.75 }
};

export const CLEANUP_HOURS: Tier = { 50: 0.8, 100: 1, 200: 1.5 };

export const INGREDIENT_COST_PER_PORTION: Record<Product, number> = {
	tiramisu: 1.58,
	burrata: 2.62
};

export const PACKAGING_COST_PER_PORTION = 0.33;

export const PRODUCT_LABELS: Record<Product, string> = {
	tiramisu: 'Tiramisu (De Toetjes Vrouw)',
	burrata: 'Burrata (De Borrel Baas)'
};

export const MIN_PORTIONS_PER_PRODUCT = 50;
export const MIN_TOTAL_PORTIONS = 50;

export interface PricingConfig {
	mixSharedDeduction: number;
	hourlyRate: number;
	extraPersonDriveHours: number;
	mandatoryExtraPersonAt: number;
	extraPersonMinPortions2: number;
	freeRoundTripKm: number;
	costPerKm: number;
}

export const DEFAULT_CONFIG: PricingConfig = {
	mixSharedDeduction: 125,
	hourlyRate: 75,
	extraPersonDriveHours: 1.5,
	mandatoryExtraPersonAt: 125,
	extraPersonMinPortions2: 250,
	freeRoundTripKm: 100,
	costPerKm: 0.45
};

export const SOLO_PORTIONS_PER_HOUR = 50;

function interp(x: number, x0: number, x1: number, y0: number, y1: number): number {
	return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function piecewise(value: Tier, n: number): number {
	if (n <= 50) return value[50];
	if (n <= 100) return interp(n, 50, 100, value[50], value[100]);
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

export function cleanupHours(portions: number): number {
	if (portions <= 0) return 0;
	return piecewise(CLEANUP_HOURS, portions);
}

export interface ProductLine {
	product: Product;
	portions: number;
	price: number;
}

export interface PriceBreakdown {
	totalPortions: number;
	productLines: ProductLine[];
	mixDeduction: number;
	extraPersonFee: number;
	extraPersonDriveHours: number;
	extraPersonMandatory: boolean;
	travelFee: number;
	travelChargedKm: number;
	total: number;
	perPortion: number;
	allowedExtraPeople: number;
	effectiveExtraPeople: number;
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

	const productLines: ProductLine[] = [];
	let mixDeduction = 0;

	if (tiraPortions > 0) {
		productLines.push({
			product: 'tiramisu',
			portions: tiraPortions,
			price: round2(purePrice('tiramisu', tiraPortions))
		});
	}
	if (burrPortions > 0) {
		productLines.push({
			product: 'burrata',
			portions: burrPortions,
			price: round2(purePrice('burrata', burrPortions))
		});
	}

	if (isMix) {
		mixDeduction = round2(config.mixSharedDeduction);
	}

	const mandatory = totalPortions >= config.mandatoryExtraPersonAt;
	const allowedExtra = totalPortions >= config.extraPersonMinPortions2 ? 2 : 1;
	let cappedExtra = Math.min(Math.max(0, extraPeople), allowedExtra);
	if (mandatory) cappedExtra = Math.max(cappedExtra, 1);
	if (extraPeople > allowedExtra) {
		warnings.push(`Maximaal ${allowedExtra} extra persoon (2× extra vereist ${config.extraPersonMinPortions2}+ porties).`);
	}

	const driveHoursPerPerson = config.extraPersonDriveHours;
	const extraPersonFee =
		cappedExtra > 0 ? round2(cappedExtra * driveHoursPerPerson * config.hourlyRate) : 0;

	const roundTripKm = Math.max(0, oneWayKm) * 2;
	const travelChargedKm = Math.max(0, roundTripKm - config.freeRoundTripKm);
	const travelFee = round2(travelChargedKm * config.costPerKm);

	const linesSum = productLines.reduce((s, l) => s + l.price, 0);
	const base = linesSum - mixDeduction;
	const total = round2(base + extraPersonFee + travelFee);
	const perPortion = totalPortions > 0 ? round2(total / totalPortions) : 0;

	return {
		totalPortions,
		productLines,
		mixDeduction,
		extraPersonFee,
		extraPersonDriveHours: cappedExtra > 0 ? driveHoursPerPerson : 0,
		extraPersonMandatory: mandatory,
		travelFee,
		travelChargedKm,
		total,
		perPortion,
		allowedExtraPeople: allowedExtra,
		effectiveExtraPeople: cappedExtra,
		warnings
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export interface InternalBreakdown {
	hours: {
		prep: number;
		walking: number;
		cleanup: number;
		drive: number;
		total: number;
	};
	costs: {
		ingredientsTira: number;
		ingredientsBurr: number;
		ingredients: number;
		packaging: number;
		total: number;
	};
	people: number;
	grossProfit: number;
	hourlyRatePerPerson: number;
}

export function calculateInternals(
	result: PriceBreakdown,
	input: { tiraPortions: number; burrPortions: number; config: PricingConfig }
): InternalBreakdown {
	const { tiraPortions, burrPortions, config } = input;
	const total = result.totalPortions;
	const people = 1 + result.effectiveExtraPeople;

	let prep = 0;
	for (const line of result.productLines) {
		prep += prepHours(line.product, line.portions);
	}

	const walking = total / SOLO_PORTIONS_PER_HOUR;
	const cleanup = cleanupHours(total);
	const drive = config.extraPersonDriveHours * people;
	const totalPersonHours = prep + walking + cleanup + drive;

	const ingredientsTira = tiraPortions * INGREDIENT_COST_PER_PORTION.tiramisu;
	const ingredientsBurr = burrPortions * INGREDIENT_COST_PER_PORTION.burrata;
	const ingredients = ingredientsTira + ingredientsBurr;
	const packaging = total * PACKAGING_COST_PER_PORTION;
	const totalCosts = ingredients + packaging;

	const grossProfit = result.total - totalCosts;
	const hourlyRatePerPerson = totalPersonHours > 0 ? grossProfit / totalPersonHours : 0;

	return {
		hours: {
			prep: round2(prep),
			walking: round2(walking),
			cleanup: round2(cleanup),
			drive: round2(drive),
			total: round2(totalPersonHours)
		},
		costs: {
			ingredientsTira: round2(ingredientsTira),
			ingredientsBurr: round2(ingredientsBurr),
			ingredients: round2(ingredients),
			packaging: round2(packaging),
			total: round2(totalCosts)
		},
		people,
		grossProfit: round2(grossProfit),
		hourlyRatePerPerson: round2(hourlyRatePerPerson)
	};
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
	const { tiraShare, extraPeople, oneWayKm, config, from = 50, to = 300, step = 5 } = opts;
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
