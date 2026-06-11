export type Product = 'tiramisu' | 'burrata';

interface Tier {
	50: number;
	100: number;
	200: number;
	400: number;
}

export const PRICE_TIERS: Record<Product, Tier> = {
	// 200 iets verlaagd zodat de prijs/portie gelijkmatig blijft dalen (geen vlakke plek
	// tussen 100 en 200). 400-anker houdt ons uurtarief rond ~€85 pp. Boven 400 loopt de
	// prijs door op de 200→400-helling.
	tiramisu: { 50: 425, 100: 650, 200: 1150, 400: 2075 },
	burrata: { 50: 450, 100: 700, 200: 1200, 400: 2200 }
};

export const PREP_HOURS: Record<Product, Tier> = {
	tiramisu: { 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 },
	// Gelijkgetrokken met tiramisu — eerdere burrata-prep was te laag ingeschat.
	burrata: { 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 }
};

export const CLEANUP_HOURS: Tier = { 50: 0.8, 100: 1, 200: 1.5, 400: 2.5 };

// Verpakking per portie (excl. btw): bakje 0,19 + servetje 0,019 + lepel 0,065.
export const PACKAGING_COST_PER_PORTION = 0.274;

export interface BurrataTopping {
	key: string;
	label: string;
	costPerPortion: number;
	default: boolean;
}

// Kostprijs per portie (excl. btw) op basis van werkelijk verbruik per portie.
// De default-selectie (stracciatella t/m parmezaan) is onze standaard-burrata.
export const BURRATA_TOPPINGS: BurrataTopping[] = [
	{ key: 'stracciatella', label: 'Stracciatella', costPerPortion: 0.68, default: true },
	{ key: 'scrocchis', label: 'Scrocchis', costPerPortion: 0.088, default: true },
	{ key: 'pesto', label: 'Pesto', costPerPortion: 0.12, default: true },
	{ key: 'parmaham', label: 'Parmaham', costPerPortion: 0.1875, default: true },
	{ key: 'parmezaan', label: 'Parmezaan', costPerPortion: 0.15, default: true },
	{ key: 'tomatensalsa', label: 'Tomatensalsa', costPerPortion: 0.1, default: false },
	{ key: 'olijfolie', label: 'Olijfolie', costPerPortion: 0.06, default: false },
	{ key: 'balsamico', label: 'Balsamico', costPerPortion: 0.072, default: false },
	{ key: 'pijnboompitten', label: 'Pijnboompitten', costPerPortion: 0.129, default: false },
	{ key: 'nduja', label: "N'duja", costPerPortion: 0.16, default: false },
	{ key: 'pistachenoten', label: 'Pistachenoten', costPerPortion: 0.143, default: false }
];

export const DEFAULT_BURRATA_TOPPINGS: string[] = BURRATA_TOPPINGS.filter((t) => t.default).map(
	(t) => t.key
);

export function burrataIngredientCost(selectedKeys: string[]): number {
	return round2(
		BURRATA_TOPPINGS.filter((t) => selectedKeys.includes(t.key)).reduce(
			(s, t) => s + t.costPerPortion,
			0
		)
	);
}

// Tiramisu heeft een vast recept; burrata-default is de som van de standaard-toppings.
// Beide zijn pure ingrediënten — verpakking telt apart via PACKAGING_COST_PER_PORTION.
export const INGREDIENT_COST_PER_PORTION: Record<Product, number> = {
	tiramisu: 0.8998,
	burrata: burrataIngredientCost(DEFAULT_BURRATA_TOPPINGS)
};

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
	volumeDiscountThreshold: number;
	volumeDiscountPercent: number;
	// Hangende hapjes — looptijd:
	portionsPerHour: number; // porties per uur dat één persoon lopend ter plekke maakt

	// Taart-/toren-varianten (op locatie gebouwd):
	cakeSurchargePerPortion: number; // tiramisu-taart: bovenop het hapjestarief per persoon
	towerSurchargePerPortion: number; // tiramisu-toren: bovenop het hapjestarief per persoon
	glassDepreciationPerPortion: number; // toren: afschrijving glaswerk per gebruik (breuk + schoonmaak)
	cakeboardPrice: number; // prijs per cakeboard
	cakeboardPerPersons: number; // 1 cakeboard per X personen

	// Opbouwtijd op locatie — twee ankers (50 en 100 personen), lineair ertussen en
	// erbuiten. Millefeuille gebruikt dezelfde opbouw-ankers als de tiramisu-taart.
	cakeBuildHoursAt50: number;
	cakeBuildHoursAt100: number;
	towerBuildHoursAt50: number;
	towerBuildHoursAt100: number;

	// Millefeuille — eigen prep-curve (zwaarder) en eigen prijsankers (portie-anchoring),
	// beide met ankers op 50 en 100 personen. Het uurtarief is hier een uitkomst, geen input.
	millefeuillePrepHoursAt50: number;
	millefeuillePrepHoursAt100: number;
	millefeuillePriceAt50: number;
	millefeuillePriceAt100: number;
}

export const DEFAULT_CONFIG: PricingConfig = {
	mixSharedDeduction: 125,
	hourlyRate: 75,
	extraPersonDriveHours: 1.5,
	mandatoryExtraPersonAt: 125,
	extraPersonMinPortions2: 250,
	freeRoundTripKm: 100,
	costPerKm: 0.45,
	volumeDiscountThreshold: 300,
	volumeDiscountPercent: 0,
	portionsPerHour: 50,
	// +€1 dekt de dubbele portie net niet bij 2× prep — €1,50 landt rond ons doeltarief.
	cakeSurchargePerPortion: 1.5,
	towerSurchargePerPortion: 2.5,
	glassDepreciationPerPortion: 1.0,
	cakeboardPrice: 2.5,
	cakeboardPerPersons: 12,
	cakeBuildHoursAt50: 0.75, // 45 min
	cakeBuildHoursAt100: 1.25, // 1u15
	towerBuildHoursAt50: 1.25, // 1u15
	towerBuildHoursAt100: 2.0, // 2u
	millefeuillePrepHoursAt50: 3,
	millefeuillePrepHoursAt100: 6,
	millefeuillePriceAt50: 550,
	millefeuillePriceAt100: 1075
};

export const SOLO_PORTIONS_PER_HOUR = 50;

function interp(x: number, x0: number, x1: number, y0: number, y1: number): number {
	return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

function piecewise(value: Tier, n: number): number {
	if (n <= 50) return value[50];
	if (n <= 100) return interp(n, 50, 100, value[50], value[100]);
	if (n <= 200) return interp(n, 100, 200, value[100], value[200]);
	if (n <= 400) return interp(n, 200, 400, value[200], value[400]);
	const slope = (value[400] - value[200]) / 200;
	return value[400] + (n - 400) * slope;
}

// Lineair tussen twee ankers op 50 en 100 personen; vlak onder 50 en doorgetrokken
// boven 100. We verwachten zelden >100 personen voor taarten — daarboven blijft het ruw.
function linAnchor(n: number, at50: number, at100: number): number {
	if (n <= 50) return at50;
	return at50 + ((n - 50) * (at100 - at50)) / 50;
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
	label?: string; // overschrijft PRODUCT_LABELS bij speciale varianten (taart/toren/millefeuille)
}

export interface PriceBreakdown {
	totalPortions: number;
	productLines: ProductLine[];
	mixDeduction: number;
	volumeDiscount: number;
	volumeDiscountPercent: number;
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
	// Alleen gevuld bij speciale varianten (calculateSpecialPrice):
	variant?: SpecialVariant;
	baseLinePrice?: number; // hapjestarief vóór toeslag (taart/toren)
	surchargePerPortion?: number; // toeslag per persoon (taart/toren)
	surchargeTotal?: number; // toeslag × porties (taart/toren)
	fruitCostPerPortion?: number; // millefeuille: gebruikte fruitkostprijs per portie
}

interface ExtraPersonResult {
	mandatory: boolean;
	allowedExtra: number;
	cappedExtra: number;
	driveHoursPerPerson: number;
	extraPersonFee: number;
	warnings: string[];
}

// Gedeeld door hapjes- en speciale varianten: extra persoon is verplicht vanaf een
// drempel, +2 pas vanaf een hogere drempel, en de fee dekt alleen hun rituren.
function extraPersonResult(
	totalPortions: number,
	extraPeople: number,
	config: PricingConfig
): ExtraPersonResult {
	const mandatory = totalPortions >= config.mandatoryExtraPersonAt;
	const allowedExtra = totalPortions >= config.extraPersonMinPortions2 ? 2 : 1;
	let cappedExtra = Math.min(Math.max(0, extraPeople), allowedExtra);
	if (mandatory) cappedExtra = Math.max(cappedExtra, 1);
	const warnings: string[] = [];
	if (extraPeople > allowedExtra) {
		warnings.push(
			`Maximaal ${allowedExtra} extra persoon (2× extra vereist ${config.extraPersonMinPortions2}+ porties).`
		);
	}
	const driveHoursPerPerson = config.extraPersonDriveHours;
	const extraPersonFee =
		cappedExtra > 0 ? round2(cappedExtra * driveHoursPerPerson * config.hourlyRate) : 0;
	return { mandatory, allowedExtra, cappedExtra, driveHoursPerPerson, extraPersonFee, warnings };
}

function travelResult(
	oneWayKm: number,
	config: PricingConfig
): { travelChargedKm: number; travelFee: number } {
	const roundTripKm = Math.max(0, oneWayKm) * 2;
	const travelChargedKm = Math.max(0, roundTripKm - config.freeRoundTripKm);
	const travelFee = round2(travelChargedKm * config.costPerKm);
	return { travelChargedKm, travelFee };
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

	const ep = extraPersonResult(totalPortions, extraPeople, config);
	const { mandatory, allowedExtra, cappedExtra, driveHoursPerPerson, extraPersonFee } = ep;
	warnings.push(...ep.warnings);

	const { travelChargedKm, travelFee } = travelResult(oneWayKm, config);

	const linesSum = productLines.reduce((s, l) => s + l.price, 0);
	const base = linesSum - mixDeduction;

	const discountApplies =
		config.volumeDiscountPercent > 0 && totalPortions >= config.volumeDiscountThreshold;
	const volumeDiscount = discountApplies ? round2((base * config.volumeDiscountPercent) / 100) : 0;
	const effectiveDiscountPercent = discountApplies ? config.volumeDiscountPercent : 0;

	const total = round2(base - volumeDiscount + extraPersonFee + travelFee);
	const perPortion = totalPortions > 0 ? round2(total / totalPortions) : 0;

	return {
		totalPortions,
		productLines,
		mixDeduction,
		volumeDiscount,
		volumeDiscountPercent: effectiveDiscountPercent,
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
		walking: number; // hapjesconcept: rondlopen en ter plekke maken
		build: number; // taart/toren: op locatie opbouwen (0 bij hapjes)
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
	input: {
		tiraPortions: number;
		burrPortions: number;
		config: PricingConfig;
		burrataIngredientCost?: number;
	}
): InternalBreakdown {
	const { tiraPortions, burrPortions, config } = input;
	const burrCostPerPortion = input.burrataIngredientCost ?? INGREDIENT_COST_PER_PORTION.burrata;
	const total = result.totalPortions;
	const people = 1 + result.effectiveExtraPeople;

	let prep = 0;
	for (const line of result.productLines) {
		prep += prepHours(line.product, line.portions);
	}

	const walking = total / config.portionsPerHour;
	const cleanup = cleanupHours(total);
	const drive = config.extraPersonDriveHours * people;
	const totalPersonHours = prep + walking + cleanup + drive;

	const ingredientsTira = tiraPortions * INGREDIENT_COST_PER_PORTION.tiramisu;
	const ingredientsBurr = burrPortions * burrCostPerPortion;
	const ingredients = ingredientsTira + ingredientsBurr;
	const packaging = total * PACKAGING_COST_PER_PORTION;
	const totalCosts = ingredients + packaging;

	const grossProfit = result.total - totalCosts;
	const hourlyRatePerPerson = totalPersonHours > 0 ? grossProfit / totalPersonHours : 0;

	return {
		hours: {
			prep: round2(prep),
			walking: round2(walking),
			build: 0,
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

// ---------------------------------------------------------------------------
// Speciale varianten: bruidstaarten op locatie gebouwd.
//
// Geen hapjes (geen rondlopen) maar prep in onze keuken + opbouw op locatie.
// Worden voorlopig niet gemengd met de hapjesconcepten in één bestelling.
// ---------------------------------------------------------------------------

export type SpecialVariant = 'tiramisu-taart' | 'tiramisu-toren' | 'millefeuille-taart';

export const VARIANT_LABELS: Record<SpecialVariant, string> = {
	'tiramisu-taart': 'Tiramisu-taart (op locatie gebouwd)',
	'tiramisu-toren': 'Tiramisu-toren (champagneglazen)',
	'millefeuille-taart': 'Millefeuille-taart (vers fruit)'
};

// Portiegrootte t.o.v. één hapje — stuurt de ingrediëntkost van de tiramisu-varianten
// (een 2×-portie = 2× ingrediënten) en is ook de basis voor de footprint later.
// Millefeuille heeft een eigen kostprijs, dus de factor raakt daar alleen de spec.
export const PORTION_SIZE_FACTOR: Record<SpecialVariant, number> = {
	'tiramisu-taart': 2,
	'tiramisu-toren': 1.5,
	'millefeuille-taart': 2
};

// Prep voor tiramisu-taart/-toren = de standaard hapjesprep, geschaald met de
// portiegrootte (ze maken letterlijk 2×/1,5× het volume tiramisu). Zie PORTION_SIZE_FACTOR.
// Millefeuille erft die schaal NIET — die heeft een eigen prep-curve (config-ankers).

// Opbouwtijd op locatie staat in de config (cake/tower ankers @50 en @100), lineair
// ertussen en erbuiten via linAnchor — zo zijn de tijden per offerte fijn te tunen.
// Millefeuille gebruikt dezelfde opbouw-ankers als de tiramisu-taart.

// Millefeuille kostprijs per portie (excl. btw):
//   bladerdeeg €9,60 + crème €20,04 = €29,64 over 40 porties → €0,74 p.p. (stabiel)
//   fruit: 4 kg @ €18,90/kg = €75,60 voor 50 porties → 80 g p.p. → €1,51 p.p.
//   (fruit varieert per seizoen → losse input in de calculator)
export const MILLEFEUILLE_BASE_COST_PER_PORTION = 0.74;
export const MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION = 1.51;

// Portie-spec (voor latere footprint-/formaatberekeningen — nu niet in de prijs).
export interface PortionSpec {
	puffPastryRawGrams?: number;
	creamMl?: number;
	fruitGrams?: number;
	heightCm?: number;
	footprintCm?: string;
}

export const PORTION_SPECS: Partial<Record<SpecialVariant, PortionSpec>> = {
	'millefeuille-taart': {
		puffPastryRawGrams: 40,
		creamMl: 150,
		fruitGrams: 80,
		heightCm: 7.5,
		footprintCm: '6×6'
	}
};

// Tiramisu-taart/-toren: standaard hapjesprep, geschaald met de portiegrootte.
// Millefeuille: eigen, zwaardere curve via config-ankers (50/100 personen).
export function specialPrepHours(
	variant: SpecialVariant,
	portions: number,
	config: PricingConfig
): number {
	if (portions <= 0) return 0;
	if (variant === 'millefeuille-taart') {
		return linAnchor(portions, config.millefeuillePrepHoursAt50, config.millefeuillePrepHoursAt100);
	}
	return prepHours('tiramisu', portions * PORTION_SIZE_FACTOR[variant]);
}

// Opbouwtijd op locatie uit de config-ankers. Toren heeft eigen ankers; taart en
// millefeuille delen de cake-ankers.
export function buildHours(
	variant: SpecialVariant,
	portions: number,
	config: PricingConfig
): number {
	if (portions <= 0) return 0;
	const at50 = variant === 'tiramisu-toren' ? config.towerBuildHoursAt50 : config.cakeBuildHoursAt50;
	const at100 =
		variant === 'tiramisu-toren' ? config.towerBuildHoursAt100 : config.cakeBuildHoursAt100;
	return linAnchor(portions, at50, at100);
}

function cakeboardCostPerPortion(config: PricingConfig): number {
	return config.cakeboardPrice / config.cakeboardPerPersons;
}

// Ingrediëntkost per portie per variant. Tiramisu-varianten schalen mee met de
// portiegrootte; millefeuille heeft een eigen kostprijs incl. (seizoens)fruit.
export function specialIngredientCostPerPortion(
	variant: SpecialVariant,
	fruitCostPerPortion = MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION
): number {
	if (variant === 'millefeuille-taart') {
		return round2(MILLEFEUILLE_BASE_COST_PER_PORTION + fruitCostPerPortion);
	}
	return round2(INGREDIENT_COST_PER_PORTION.tiramisu * PORTION_SIZE_FACTOR[variant]);
}

function specialPackagingCostPerPortion(variant: SpecialVariant, config: PricingConfig): number {
	return variant === 'tiramisu-toren'
		? config.glassDepreciationPerPortion
		: cakeboardCostPerPortion(config);
}

export function calculateSpecialPrice(input: {
	variant: SpecialVariant;
	portions: number;
	extraPeople: number;
	oneWayKm: number;
	config: PricingConfig;
	fruitCostPerPortion?: number;
}): PriceBreakdown {
	const { variant, extraPeople, oneWayKm, config } = input;
	const n = Math.max(0, Math.round(input.portions));
	const fruitCost = input.fruitCostPerPortion ?? MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION;
	const warnings: string[] = [];

	if (n > 0 && n < MIN_TOTAL_PORTIONS) {
		warnings.push(`Minimaal ${MIN_TOTAL_PORTIONS} porties.`);
	}

	let baseLinePrice = 0;
	let surchargePerPortion = 0;
	let linePrice = 0;

	if (variant === 'millefeuille-taart') {
		// Portie-anchoring: vaste prijsankers op 50 en 100 personen, lineair ertussen en
		// erbuiten. Fruit zit NIET in de prijs — het drukt op onze marge (zie intern),
		// dus bij een duur seizoen verhogen we het anker zelf.
		linePrice = round2(linAnchor(n, config.millefeuillePriceAt50, config.millefeuillePriceAt100));
	} else {
		// Tiramisu-taart/-toren: hapjestarief voor hetzelfde aantal personen + toeslag.
		baseLinePrice = round2(purePrice('tiramisu', n));
		surchargePerPortion =
			variant === 'tiramisu-toren'
				? config.towerSurchargePerPortion
				: config.cakeSurchargePerPortion;
		linePrice = round2(baseLinePrice + surchargePerPortion * n);
	}

	const productLines: ProductLine[] =
		n > 0
			? [{ product: 'tiramisu', portions: n, price: linePrice, label: VARIANT_LABELS[variant] }]
			: [];

	const ep = extraPersonResult(n, extraPeople, config);
	warnings.push(...ep.warnings);
	const { travelChargedKm, travelFee } = travelResult(oneWayKm, config);

	const base = linePrice;
	const discountApplies =
		config.volumeDiscountPercent > 0 && n >= config.volumeDiscountThreshold;
	const volumeDiscount = discountApplies ? round2((base * config.volumeDiscountPercent) / 100) : 0;
	const effectiveDiscountPercent = discountApplies ? config.volumeDiscountPercent : 0;

	const total = round2(base - volumeDiscount + ep.extraPersonFee + travelFee);
	const perPortion = n > 0 ? round2(total / n) : 0;

	return {
		totalPortions: n,
		productLines,
		mixDeduction: 0,
		volumeDiscount,
		volumeDiscountPercent: effectiveDiscountPercent,
		extraPersonFee: ep.extraPersonFee,
		extraPersonDriveHours: ep.cappedExtra > 0 ? ep.driveHoursPerPerson : 0,
		extraPersonMandatory: ep.mandatory,
		travelFee,
		travelChargedKm,
		total,
		perPortion,
		allowedExtraPeople: ep.allowedExtra,
		effectiveExtraPeople: ep.cappedExtra,
		warnings,
		variant,
		baseLinePrice,
		surchargePerPortion,
		surchargeTotal: round2(surchargePerPortion * n),
		fruitCostPerPortion: variant === 'millefeuille-taart' ? fruitCost : undefined
	};
}

export function calculateSpecialInternals(
	result: PriceBreakdown,
	input: {
		variant: SpecialVariant;
		config: PricingConfig;
		fruitCostPerPortion?: number;
	}
): InternalBreakdown {
	const { variant, config } = input;
	const n = result.totalPortions;
	const people = 1 + result.effectiveExtraPeople;

	const prep = specialPrepHours(variant, n, config);
	const build = buildHours(variant, n, config);
	const cleanup = cleanupHours(n);
	const drive = config.extraPersonDriveHours * people;
	const totalPersonHours = prep + build + cleanup + drive;

	const ingredients = n * specialIngredientCostPerPortion(variant, input.fruitCostPerPortion);
	const packaging = n * specialPackagingCostPerPortion(variant, config);
	const totalCosts = ingredients + packaging;

	const grossProfit = result.total - totalCosts;
	const hourlyRatePerPerson = totalPersonHours > 0 ? grossProfit / totalPersonHours : 0;

	return {
		hours: {
			prep: round2(prep),
			walking: 0,
			build: round2(build),
			cleanup: round2(cleanup),
			drive: round2(drive),
			total: round2(totalPersonHours)
		},
		costs: {
			ingredientsTira: 0,
			ingredientsBurr: 0,
			ingredients: round2(ingredients),
			packaging: round2(packaging),
			total: round2(totalCosts)
		},
		people,
		grossProfit: round2(grossProfit),
		hourlyRatePerPerson: round2(hourlyRatePerPerson)
	};
}

export interface ValidationPoint {
	x: number;
	prepHours: number;
	locationHours: number;
	perPortion: number;
	perHour: number;
}

// Curve om de schaling van een variant te valideren los van de gekozen offerte.
// Berekend op een neutrale basis (geen reis-km, geen handmatige extra persoon — de
// verplichte extra persoon blijft wel automatisch gelden), zodat de lijnen alleen
// veranderen als je het type of de aannames wijzigt. De gekozen porties bepalen
// enkel waar de marker op de lijn valt, niet de lijn zelf.
export function validationCurve(opts: {
	mode: 'hapjes' | SpecialVariant;
	tiraShare?: number;
	config: PricingConfig;
	fruitCostPerPortion?: number;
	from?: number;
	to?: number;
	step?: number;
}): ValidationPoint[] {
	const { mode, tiraShare = 1, config, fruitCostPerPortion, from = 50, to = 150, step = 5 } = opts;
	const out: ValidationPoint[] = [];
	for (let n = from; n <= to; n += step) {
		if (mode === 'hapjes') {
			const tira = Math.round(n * tiraShare);
			const burr = n - tira;
			const r = calculatePrice({
				tiraPortions: tira,
				burrPortions: burr,
				extraPeople: 0,
				oneWayKm: 0,
				config
			});
			const i = calculateInternals(r, { tiraPortions: tira, burrPortions: burr, config });
			out.push({
				x: n,
				prepHours: i.hours.prep,
				locationHours: i.hours.walking,
				perPortion: r.perPortion,
				perHour: i.hourlyRatePerPerson
			});
		} else {
			const r = calculateSpecialPrice({
				variant: mode,
				portions: n,
				extraPeople: 0,
				oneWayKm: 0,
				config,
				fruitCostPerPortion
			});
			const i = calculateSpecialInternals(r, { variant: mode, config, fruitCostPerPortion });
			out.push({
				x: n,
				prepHours: i.hours.prep,
				locationHours: i.hours.build,
				perPortion: r.perPortion,
				perHour: i.hourlyRatePerPerson
			});
		}
	}
	return out;
}
