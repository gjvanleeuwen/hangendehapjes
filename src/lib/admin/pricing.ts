// ---------------------------------------------------------------------------
// Prijsmodel: uren geven het ruwe kostenprofiel, de kortingscurve maakt er de
// etalageprijs van.
//
// Elke variant wordt op dezelfde manier doorgerekend:
//
//   prep      keuken vooraf                         (mensuren, schaalt met porties)
//   onsite    op locatie buiten het eigenlijke werk  (uur per persoon, vast)
//             = uitpakken en opbouwen, wachten tot je mag beginnen, blijven
//               tot de taart is aangesneden, weer inpakken
//   service   lopen en maken, of taart bouwen        (mensuren, schaalt met porties)
//   cleanup   nazorg thuis (afwas)                   (mensuren, schaalt met porties)
//   travel    reistijd                               (mensuren, betaald via de km-prijs)
//
// Prep, onsite, service en cleanup hebben elk een uurtarief (config.hourlyRates).
// De urencurves staan in één matrix (config.hourCurves) op de ankers
// 25/50/100/200/400 porties.
//
// Prijs = som over werkfasen van (uren x tarief)
//       + materiaal (kostprijs, 1:1 doorbelast)
//       + vaste extra kosten (EUR 2,50 per 10 personen, voor alle varianten)
//       + inbegrepen reis (basisbedrag voor de vrije straal, in de productprijs)
//       + extra persoon (hun uren op locatie, volledig)
//       - korting volgens de kortingscurve (procent, per productgroep)
//       + reiskosten: retour-km BOVEN de vrije straal x km-prijs, als losse regel
//
// Reis. Binnen 30 km van Hilversum (60 retour-km) is reizen inbegrepen: een vast
// basisbedrag (vrije km x standaard km-prijs) zit in elke productprijs. Daarboven
// staat een losse regel "Reiskosten" tegen een km-prijs die we per klant kiezen
// tussen kmPriceMin en kmPriceMax. Autokosten tellen voor ELKE km, ook de vrije.
//
// Korting. Eén kortingscurve in procenten, afhankelijk van het aantal porties,
// per productgroep (hapjes, tiramisu-taart, millefeuille). De uren geven de volle
// prijs, de curve brengt die naar de etalageprijzen op de website. Extra korting
// geef je handmatig op de offerte.
//
// Controle. calculateInternals rekent terug wat de werkuren na korting per uur
// opleveren, en of het verschil met de uurtarieven precies de korting is.
// ---------------------------------------------------------------------------

export type Product = 'tiramisu' | 'burrata';

// Alle curves hangen aan hetzelfde raster. Het 25-anker is er omdat taarten
// vanaf 25/30 personen gaan; hapjes beginnen pas bij 50, dus daar is de 25-kolom
// gelijk aan de 50-kolom (vlak onder het minimum).
export interface Tier {
	25: number;
	50: number;
	100: number;
	200: number;
	400: number;
}

export const HOUR_TIER_POINTS = [25, 50, 100, 200, 400] as const;

// Elke rij van de urenmatrix. Prep verschilt per product, opbouw en nazorg zijn
// gedeeld tussen de taarten.
export type HourCurveKey =
	| 'prepTiramisu'
	| 'prepBurrata'
	| 'prepTiramisuTaart'
	| 'prepMillefeuille'
	| 'buildTaart'
	| 'cleanupHapjes'
	| 'cleanupTaart';

export const HOUR_CURVE_KEYS: HourCurveKey[] = [
	'prepTiramisu',
	'prepBurrata',
	'prepTiramisuTaart',
	'prepMillefeuille',
	'buildTaart',
	'cleanupHapjes',
	'cleanupTaart'
];

export const HOUR_CURVE_LABELS: Record<HourCurveKey, string> = {
	prepTiramisu: 'Prep tiramisu',
	prepBurrata: 'Prep burrata',
	prepTiramisuTaart: 'Prep tiramisu-taart',
	prepMillefeuille: 'Prep millefeuille',
	buildTaart: 'Opbouw taart (op locatie)',
	cleanupHapjes: 'Nazorg hapjes',
	cleanupTaart: 'Nazorg taart'
};

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

// ---------------------------------------------------------------------------
// Tiramisu kostprijs, uitgerekend vanuit het recept (okt 2026).
//
// Prijzen excl. btw van de Makro-bon, okt 2026. Koffiebonen en de hoeveelheid
// cacao staan niet op de bon en zijn een schatting.
// ---------------------------------------------------------------------------
export const TIRAMISU_PRICES = {
	sugarPerKg: 1.29, // kristalsuiker 1 kg
	eggPerKg: 7.49, // gepasteuriseerd heel ei, 1 kg
	mascarponePerKg: 17.53 / 2, // Casare 2 kg emmer (500 g is EUR 10,44/kg)
	disaronnoPerL: 17.6, // 1 l fles
	ladyfingerPack: 22.65 / 12, // doos van 12 pakken a 175 g
	cacaoPerKg: 4.27 / 0.25, // 250 g pot
	coffeeBeansPerKg: 30 // SCHATTING: Blommers, niet op de bon
};

export const TIRAMISU_RECIPE = {
	// Crème: 100 g suiker + 100 g ei + 350 g mascarpone = 550 g.
	sugarG: 100,
	eggG: 100,
	mascarponeG: 350,
	// Per 4 lange vingers: 12,5 ml koffie, 12,5 ml Disaronno, 7 ml water.
	coffeeMlPer4: 12.5,
	disaronnoMlPer4: 12.5,
	ladyfingersPerPack: 33,
	// Mokapot: 18 g bonen geeft 100-110 ml koffie, we rekenen met 105.
	beanGPerCoffeeMl: 18 / 105,
	loss: 0.1 // 10% verlies op alles
};

// Wat er per persoon in gaat. Taart: 100 g crème en 4 lange vingers, hapje 60 g
// en 2. Cacao is een schatting.
export const TIRAMISU_PORTIONS = {
	hapje: { creamG: 60, ladyfingers: 2, cacaoG: 2 },
	taart: { creamG: 100, ladyfingers: 4, cacaoG: 3 }
};

export function tiramisuCostPerPortion(kind: 'hapje' | 'taart'): number {
	const p = TIRAMISU_PRICES;
	const r = TIRAMISU_RECIPE;
	const portion = TIRAMISU_PORTIONS[kind];
	const creamTotal = r.sugarG + r.eggG + r.mascarponeG;
	const kg = (g: number) => g / 1000;
	const share = portion.creamG / creamTotal;
	const cream =
		kg(r.sugarG * share) * p.sugarPerKg +
		kg(r.eggG * share) * p.eggPerKg +
		kg(r.mascarponeG * share) * p.mascarponePerKg;
	const sets = portion.ladyfingers / 4;
	const coffee = kg(sets * r.coffeeMlPer4 * r.beanGPerCoffeeMl) * p.coffeeBeansPerKg;
	const liqueur = ((sets * r.disaronnoMlPer4) / 1000) * p.disaronnoPerL;
	const ladyfingers = (portion.ladyfingers / r.ladyfingersPerPack) * p.ladyfingerPack;
	const cacao = kg(portion.cacaoG) * p.cacaoPerKg;
	return round4((cream + coffee + liqueur + ladyfingers + cacao) * (1 + r.loss));
}

// Tiramisu volgt het recept hierboven; burrata-default is de som van de
// standaard-toppings. Beide zijn pure ingrediënten, verpakking telt apart via
// PACKAGING_COST_PER_PORTION.
export const INGREDIENT_COST_PER_PORTION: Record<Product, number> = {
	tiramisu: tiramisuCostPerPortion('hapje'),
	burrata: burrataIngredientCost(DEFAULT_BURRATA_TOPPINGS)
};

export const PRODUCT_LABELS: Record<Product, string> = {
	tiramisu: 'Tiramisu',
	burrata: 'Burrata'
};

export const MIN_PORTIONS_PER_PRODUCT = 50;
export const MIN_TOTAL_PORTIONS = 50;

// ---------------------------------------------------------------------------
// Fasen en tarieven
// ---------------------------------------------------------------------------

// De werkfasen met een uurtarief. Reizen heeft geen tarief: dat betaalt de klant
// via de km-prijs, de reisuren tellen alleen mee in wat we per uur overhouden.
export type Stage = 'prep' | 'onsite' | 'service' | 'cleanup';

export const STAGES: Stage[] = ['prep', 'onsite', 'service', 'cleanup'];

export const STAGE_LABELS: Record<Stage, string> = {
	prep: 'Prep (keuken)',
	onsite: 'Op locatie (opbouw en wachten)',
	service: 'Lopen / bouwen',
	cleanup: 'Nazorg (afwas)'
};

// Hoe de uren van een fase tot stand komen, puur ter uitleg in de UI.
export const STAGE_SOURCE: Record<Stage, string> = {
	prep: 'urenmatrix, per product',
	onsite: 'vaste aanname, per persoon',
	service: 'porties ÷ porties-per-uur, of de opbouwrij bij taart',
	cleanup: 'urenmatrix, vlak; hapjes en taart apart'
};

// ---------------------------------------------------------------------------
// Kortingscurve
// ---------------------------------------------------------------------------
export type DiscountGroup = 'hapjes' | 'tiramisuTaart' | 'millefeuille';

export const DISCOUNT_GROUPS: DiscountGroup[] = ['hapjes', 'tiramisuTaart', 'millefeuille'];

export const DISCOUNT_GROUP_LABELS: Record<DiscountGroup, string> = {
	hapjes: 'Hapjes (tiramisu en burrata)',
	tiramisuTaart: 'Tiramisu-taart',
	millefeuille: 'Millefeuille-taart'
};

// Startwaarden zo gekozen dat de calculator binnen de vrije straal rond de
// websiteprijzen uitkomt (okt 2026). Tiramisu-taart bij 100 zit zonder korting
// al onder de website, daarom daar 0.
export const DEFAULT_DISCOUNT_CURVES: Record<DiscountGroup, Tier> = {
	hapjes: { 25: 10, 50: 10, 100: 5, 200: 3, 400: 3 },
	tiramisuTaart: { 25: 13, 50: 7, 100: 0, 200: 0, 400: 0 },
	millefeuille: { 25: 9, 50: 9, 100: 1, 200: 0, 400: 0 }
};

// De prijzen die op de website staan, excl. btw, binnen de vrije straal. Alleen
// ter vergelijking in de schets; de calculator rekent er niet mee.
export const WEBSITE_PRICES: Record<
	'tiramisu' | 'burrata' | SpecialVariant,
	Record<number, number>
> = {
	tiramisu: { 50: 425, 100: 650, 200: 1150 },
	burrata: { 50: 450, 100: 700, 200: 1200 },
	'tiramisu-taart': { 30: 375, 50: 475, 100: 795 },
	'millefeuille-taart': { 25: 395, 50: 495, 100: 845 }
};

export function discountGroupFor(variant?: SpecialVariant): DiscountGroup {
	if (variant === 'tiramisu-taart') return 'tiramisuTaart';
	if (variant === 'millefeuille-taart') return 'millefeuille';
	return 'hapjes';
}

// Waarom de hapjescurve twee toppen heeft.
//
// Top 1, bij kleine klussen: de vaste uren (op locatie, nazorg, de eerste prep)
// zijn bij 50 porties een groot deel van de prijs. Zonder korting komt de
// instapprijs te hoog uit, dus de curve begint hoog en loopt af.
//
// Top 2, bij de verplichte tweede persoon: vanaf mandatoryExtraPersonAt komt er
// in één keer een tweede persoon bij, met al zijn uren op locatie. Dat is een
// harde stap in de prijs, terwijl de drempel zelf een schatting is (bij 130
// gasten red je het soms alleen, bij 100 heb je soms al hulp nodig). Een vloeiende
// curve kan een stap niet wegpoetsen, dus springt de korting precies op de drempel
// omhoog met extraPersonDiscountPct en dooft lineair uit tot nul bij
// extraPersonDiscountZeroAt. Daarboven draagt de klus de tweede persoon zelf.
// Taarten bouw je alleen, die hebben deze top niet.
export function extraPersonDiscountAt(config: PricingConfig, n: number): number {
	const at = config.mandatoryExtraPersonAt;
	const zero = config.extraPersonDiscountZeroAt;
	if (n < at || config.extraPersonDiscountPct <= 0) return 0;
	if (zero <= at) return config.extraPersonDiscountPct;
	const t = Math.min(1, (n - at) / (zero - at));
	return config.extraPersonDiscountPct * (1 - t);
}

// Lineair tussen de ankers, vlak onder 25 en boven 400, plus bij hapjes de top
// voor de tweede persoon. Nooit onder 0 of boven 100.
export function discountPctAt(config: PricingConfig, group: DiscountGroup, n: number): number {
	if (n <= 0) return 0;
	const c = config.discountCurves[group];
	const base = n >= 400 ? c[400] : piecewise(c, n);
	const bump = group === 'hapjes' ? extraPersonDiscountAt(config, n) : 0;
	return round2(Math.min(100, Math.max(0, base + bump)));
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface PricingConfig {
	// --- Uurtarieven per werkfase -------------------------------------------
	hourlyRates: Record<Stage, number>;

	// --- Uren ----------------------------------------------------------------
	// Eén matrix: elke curve op dezelfde ankers (25/50/100/200/400 porties),
	// lineair ertussen en doorgetrokken op de 200->400 helling erboven.
	hourCurves: Record<HourCurveKey, Tier>;
	// Op locatie buiten het eigenlijke werk, per persoon: uitpakken en opbouwen,
	// wachten tot je mag beginnen, blijven tot de taart is aangesneden, inpakken.
	// Verschilt per klus, maar is een vaste aanname: de uren geven alleen het
	// ruwe kostenprofiel.
	onsiteHours: number;
	portionsPerHour: number; // porties per uur dat één persoon lopend ter plekke maakt

	// --- Reis ----------------------------------------------------------------
	travelSpeedKmh: number; // gemiddelde snelheid, voor de rij-uren
	vehicleCostPerKm: number; // brandstof en slijtage: onze kostprijs per km
	kmPriceDefault: number;
	kmPriceMin: number;
	kmPriceMax: number;
	// Retour-km die inbegrepen zijn (60 = 30 km enkele reis rond Hilversum). Het
	// basisbedrag is freeRoundTripKm x kmPriceDefault en zit in elke productprijs.
	freeRoundTripKm: number;

	// --- Team ----------------------------------------------------------------
	mandatoryExtraPersonAt: number;
	extraPersonMinPortions2: number;

	// --- Korting -------------------------------------------------------------
	// Kortingspercentage per productgroep op de ankers 25/50/100/200/400.
	discountCurves: Record<DiscountGroup, Tier>;
	// De tweede top in de hapjescurve, zie extraPersonDiscountAt.
	extraPersonDiscountPct: number;
	extraPersonDiscountZeroAt: number;

	// --- Overig --------------------------------------------------------------
	// Vaste extra kosten (administratie, kleine spullen) per 10 personen, voor
	// alle varianten. Naar rato gerekend, dus 0,25 per persoon bij 2,50.
	extraCostPer10Persons: number;
}

// De urenmatrix. Onder het eerste anker is de curve vlak, dus voor hapjes (min. 50)
// is de 25-kolom gelijk aan de 50-kolom en doet hij niets. Voor taarten (min. 25/30)
// is hij wel de werkzame ondergrens.
export const DEFAULT_HOUR_CURVES: Record<HourCurveKey, Tier> = {
	prepTiramisu: { 25: 1.25, 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 },
	// Gelijkgetrokken met tiramisu, eerdere burrata-prep was te laag ingeschat.
	prepBurrata: { 25: 1.25, 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 },
	// Tot okt 2026 berekend als tiramisu-prep op 2x het aantal porties (een
	// taartportie is twee hapjes). Deze rij is precies die uitkomst, zodat je hem
	// nu los kunt bijstellen zodra je een taartprep klokt.
	prepTiramisuTaart: { 25: 1.25, 50: 2, 100: 3.5, 200: 6.5, 400: 12.5 },
	// NIET GEMETEN. Begonnen als kopie van de tiramisu-taart-prep en in okt 2026
	// iets opgehoogd zodat de calculator binnen de vrije straal uitkomt op de
	// prijzen uit de blog (25 -> ~395, 50 -> ~495, 100 -> ~845 excl. btw).
	prepMillefeuille: { 25: 1.5, 50: 2.25, 100: 4.25, 200: 7.25, 400: 13.25 },
	// 45 min bij 50 personen, 1u15 bij 100. Daarboven dezelfde helling doorgetrokken.
	buildTaart: { 25: 0.75, 50: 0.75, 100: 1.25, 200: 2.25, 400: 4.25 },
	// Nazorg is vlak: de vaatwasser inruimen en spullen terugzetten schaalt
	// nauwelijks met het aantal porties. Hapjes iets meer dan een taart.
	cleanupHapjes: { 25: 0.75, 50: 0.75, 100: 0.75, 200: 0.75, 400: 0.75 },
	cleanupTaart: { 25: 0.5, 50: 0.5, 100: 0.5, 200: 0.5, 400: 0.5 }
};

export const DEFAULT_CONFIG: PricingConfig = {
	hourlyRates: {
		prep: 85,
		// Opbouw (0,75 u tegen 85) en wachten (0,75 u tegen 65) samengevoegd tot
		// 1,5 u tegen het gemiddelde van 75. Dezelfde prijs als voorheen.
		onsite: 75,
		service: 85,
		cleanup: 85
	},
	hourCurves: {
		prepTiramisu: { ...DEFAULT_HOUR_CURVES.prepTiramisu },
		prepBurrata: { ...DEFAULT_HOUR_CURVES.prepBurrata },
		prepTiramisuTaart: { ...DEFAULT_HOUR_CURVES.prepTiramisuTaart },
		prepMillefeuille: { ...DEFAULT_HOUR_CURVES.prepMillefeuille },
		buildTaart: { ...DEFAULT_HOUR_CURVES.buildTaart },
		cleanupHapjes: { ...DEFAULT_HOUR_CURVES.cleanupHapjes },
		cleanupTaart: { ...DEFAULT_HOUR_CURVES.cleanupTaart }
	},
	// Gemeten op een taartklus voor 95 personen: 14:45 aangekomen, pas 15:30 kunnen
	// beginnen, 1 uur gebouwd, om 17:10 weg. Van die 2u25 was 1u echt bouwen; de
	// rest was uitpakken, wachten en inpakken. Als vaste aanname 1,5 u per persoon.
	onsiteHours: 1.5,
	portionsPerHour: 50,
	travelSpeedKmh: 70,
	// Brandstof: ~15 km per liter bij EUR 2,20 = EUR 0,147/km. Plus banden, olie en
	// onderhoud kom je rond EUR 0,25. LET OP: dit is de variabele kilometerprijs,
	// niet de volledige EUR 0,45 van de belastingvrije vergoeding. Daar zitten ook
	// afschrijving, verzekering en wegenbelasting in, en die lopen door of we nu
	// rijden of niet.
	vehicleCostPerKm: 0.25,
	// Per klant te kiezen tussen 0,45 en 0,85. 0,65 is het midden.
	kmPriceDefault: 0.65,
	kmPriceMin: 0.45,
	kmPriceMax: 0.85,
	// 30 km enkele reis: het Gooi, Amsterdam, Utrecht, Amersfoort en Almere.
	freeRoundTripKm: 60,
	mandatoryExtraPersonAt: 125,
	extraPersonMinPortions2: 250,
	discountCurves: {
		hapjes: { ...DEFAULT_DISCOUNT_CURVES.hapjes },
		tiramisuTaart: { ...DEFAULT_DISCOUNT_CURVES.tiramisuTaart },
		millefeuille: { ...DEFAULT_DISCOUNT_CURVES.millefeuille }
	},
	// Zo gekozen dat de stap op 125 vrijwel wegvalt (de tweede persoon kost
	// 1,5 u x 75 = 112,50) en 200 tiramisu en burrata rond de websiteprijs uitkomen.
	extraPersonDiscountPct: 12,
	extraPersonDiscountZeroAt: 250,
	extraCostPer10Persons: 2.5
};

export function cloneConfig(config: PricingConfig): PricingConfig {
	return {
		...config,
		hourlyRates: { ...config.hourlyRates },
		hourCurves: Object.fromEntries(
			HOUR_CURVE_KEYS.map((k) => [k, { ...config.hourCurves[k] }])
		) as Record<HourCurveKey, Tier>,
		discountCurves: Object.fromEntries(
			DISCOUNT_GROUPS.map((g) => [g, { ...config.discountCurves[g] }])
		) as Record<DiscountGroup, Tier>
	};
}

// Vaste extra kosten voor deze klus: naar rato van het aantal personen.
export function extraCostsFor(portions: number, config: PricingConfig): number {
	if (portions <= 0) return 0;
	return round2((portions * Math.max(0, config.extraCostPer10Persons)) / 10);
}

// De km-prijs voor deze offerte: wat je kiest, binnen de afgesproken bandbreedte.
export function clampKmPrice(kmPrice: number | undefined, config: PricingConfig): number {
	const v = kmPrice ?? config.kmPriceDefault;
	if (!Number.isFinite(v)) return config.kmPriceDefault;
	return Math.round(Math.min(config.kmPriceMax, Math.max(config.kmPriceMin, v)) * 100) / 100;
}

// Het vaste bedrag voor de inbegrepen reis. Bewust op de standaard km-prijs en
// niet op de per-klant km-prijs, zodat de productprijs niet meeschuift met de
// km-prijs die je voor iemand kiest.
export function includedTravelFee(config: PricingConfig): number {
	return round2(Math.max(0, config.freeRoundTripKm) * config.kmPriceDefault);
}

// Wat een km-prijs per rij-uur oplevert na autokosten, voor één auto.
export function drivingRatePerHour(kmPrice: number, config: PricingConfig): number {
	return round2((kmPrice - config.vehicleCostPerKm) * config.travelSpeedKmh);
}

function interp(x: number, x0: number, x1: number, y0: number, y1: number): number {
	return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

// Vlak onder het eerste anker, lineair ertussen, en boven 400 doorgetrokken op de
// 200->400 helling. Eén functie voor alle curves.
function piecewise(value: Tier, n: number): number {
	if (n <= 25) return value[25];
	if (n <= 50) return interp(n, 25, 50, value[25], value[50]);
	if (n <= 100) return interp(n, 50, 100, value[50], value[100]);
	if (n <= 200) return interp(n, 100, 200, value[100], value[200]);
	if (n <= 400) return interp(n, 200, 400, value[200], value[400]);
	const slope = (value[400] - value[200]) / 200;
	return value[400] + (n - 400) * slope;
}

export function hourCurveAt(config: PricingConfig, key: HourCurveKey, n: number): number {
	if (n <= 0) return 0;
	return piecewise(config.hourCurves[key], n);
}

export function prepHours(product: Product, portions: number, config: PricingConfig): number {
	return hourCurveAt(config, product === 'tiramisu' ? 'prepTiramisu' : 'prepBurrata', portions);
}

export function cleanupHours(
	portions: number,
	config: PricingConfig,
	kind: 'hapjes' | 'taart' = 'hapjes'
): number {
	return hourCurveAt(config, kind === 'taart' ? 'cleanupTaart' : 'cleanupHapjes', portions);
}

// Reistijd retour voor één persoon.
export function travelHoursFor(oneWayKm: number, config: PricingConfig): number {
	if (oneWayKm <= 0 || config.travelSpeedKmh <= 0) return 0;
	return (Math.max(0, oneWayKm) * 2) / config.travelSpeedKmh;
}

// ---------------------------------------------------------------------------
// Berekening
// ---------------------------------------------------------------------------

export interface ProductLine {
	product: Product;
	portions: number;
	price: number;
	label?: string; // overschrijft PRODUCT_LABELS bij speciale varianten (taart/millefeuille)
}

// Alles in mensuren: onsite en travel zijn al vermenigvuldigd met het aantal
// personen, prep/service/cleanup zijn het totale werk dat over het team verdeeld
// wordt.
export interface WorkHours {
	prep: number;
	onsite: number;
	service: number; // lopen en maken (hapjes) of opbouwen (taart)
	cleanup: number;
	travel: number;
	billable: number; // prep + onsite + service + cleanup
	total: number; // billable + travel
}

export interface MaterialCosts {
	ingredientsTira: number;
	ingredientsBurr: number;
	ingredients: number;
	packaging: number; // verpakking bij hapjes; taarten hebben geen verpakking
	extra: number; // vaste extra kosten per 10 personen
	vehicle: number; // brandstof en slijtage: retour-km x autokosten per km
	total: number;
}

export interface PriceBreakdown {
	totalPortions: number;
	productLines: ProductLine[];
	labourFee: number; // uren x uurtarief, voor één persoon
	materialsFee: number; // materiaal en vaste extra kosten, 1:1 doorbelast
	baseFee: number; // inbegrepen reis (vrije straal), zit in de productregel(s)
	productBeforeDiscount: number; // productprijs volgens de uren, vóór de kortingscurve
	discountPct: number; // toegepast kortingspercentage (curve of handmatig)
	discountPctCurve: number; // wat de curve bij dit aantal porties zegt
	discount: number; // bedrag van de korting, alleen op de productprijs
	extraPersonFee: number;
	extraPersonMandatory: boolean;
	travelFee: number; // losse offerteregel: chargedKm x kmPrice
	kmPrice: number;
	roundTripKm: number;
	chargedKm: number; // retour-km boven de vrije straal
	productTotal: number; // total min reiskosten: wat in de productregel(s) staat
	total: number;
	perPortion: number;
	allowedExtraPeople: number;
	effectiveExtraPeople: number;
	hours: WorkHours;
	materials: MaterialCosts;
	warnings: string[];
	// Alleen gevuld bij speciale varianten (calculateSpecialPrice):
	variant?: SpecialVariant;
	fruitCostPerPortion?: number;
}

interface ExtraPersonResult {
	mandatory: boolean;
	allowedExtra: number;
	cappedExtra: number;
	warnings: string[];
}

// Extra persoon is verplicht vanaf een drempel, +2 pas vanaf een hogere drempel.
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
			`Maximaal ${allowedExtra} extra persoon (2x extra vereist ${config.extraPersonMinPortions2}+ porties).`
		);
	}
	return { mandatory, allowedExtra, cappedExtra, warnings };
}

// Reis: de retour-km boven de vrije straal tegen de gekozen km-prijs, per auto.
// Een extra persoon rijdt mee in dezelfde auto, dus de km tellen één keer.
type TravelResult = {
	roundTripKm: number;
	chargedKm: number;
	travelFee: number;
	kmPrice: number;
};

function travelResult(oneWayKm: number, kmPrice: number, config: PricingConfig): TravelResult {
	const roundTripKm = Math.max(0, oneWayKm) * 2;
	const chargedKm = Math.max(0, roundTripKm - Math.max(0, config.freeRoundTripKm));
	return { roundTripKm, chargedKm, travelFee: round2(chargedKm * kmPrice), kmPrice };
}

// De extra persoon kost ons alleen zijn eigen uren op locatie. Prep, service en
// nazorg zijn totaal werk dat over het team verdeeld wordt, dus dat rekenen we
// niet dubbel. Volledig doorbelast: de afvlakking rond de drempel zit in de
// kortingscurve.
function extraPersonFeeFor(cappedExtra: number, config: PricingConfig): number {
	if (cappedExtra <= 0) return 0;
	return round2(cappedExtra * config.onsiteHours * config.hourlyRates.onsite);
}

// Het werk van één persoon, elke fase tegen zijn eigen tarief.
function labourFeeFor(
	base: { prep: number; onsite: number; service: number; cleanup: number },
	config: PricingConfig
): number {
	const r = config.hourlyRates;
	return (
		base.prep * r.prep +
		base.onsite * r.onsite +
		base.service * r.service +
		base.cleanup * r.cleanup
	);
}

function assemble(input: {
	totalPortions: number;
	productLines: ProductLine[];
	hours: WorkHours;
	materials: MaterialCosts;
	labourFee: number;
	materialsFee: number;
	baseFee: number;
	ep: ExtraPersonResult;
	extraPersonFee: number;
	travel: TravelResult;
	config: PricingConfig;
	warnings: string[];
	discountPctOverride?: number;
	variant?: SpecialVariant;
	fruitCostPerPortion?: number;
}): PriceBreakdown {
	const { totalPortions, config } = input;
	// De korting geldt voor de productprijs, inclusief extra persoon en de
	// inbegrepen reis. De losse reiskostenregel blijft onaangeroerd.
	const productBeforeDiscount = round2(
		input.labourFee + input.materialsFee + input.baseFee + input.extraPersonFee
	);
	const discountPctCurve = discountPctAt(config, discountGroupFor(input.variant), totalPortions);
	const discountPct =
		input.discountPctOverride != null && Number.isFinite(input.discountPctOverride)
			? Math.min(100, Math.max(0, input.discountPctOverride))
			: discountPctCurve;
	const discount = round2((productBeforeDiscount * discountPct) / 100);
	const productTotal = round2(productBeforeDiscount - discount);
	const total = round2(productTotal + input.travel.travelFee);

	// Productregels naar rato meeschalen, zodat ze optellen tot de prijs na korting
	// (zonder de extra persoon, die staat niet in de regels).
	const factor = 1 - discountPct / 100;
	const productLines = input.productLines.map((l) => ({ ...l, price: round2(l.price * factor) }));

	return {
		totalPortions,
		productLines,
		labourFee: round2(input.labourFee),
		materialsFee: round2(input.materialsFee),
		baseFee: round2(input.baseFee),
		productBeforeDiscount,
		discountPct,
		discountPctCurve,
		discount,
		extraPersonFee: input.extraPersonFee,
		extraPersonMandatory: input.ep.mandatory,
		travelFee: input.travel.travelFee,
		kmPrice: input.travel.kmPrice,
		roundTripKm: input.travel.roundTripKm,
		chargedKm: input.travel.chargedKm,
		productTotal,
		total,
		perPortion: totalPortions > 0 ? round2(total / totalPortions) : 0,
		allowedExtraPeople: input.ep.allowedExtra,
		effectiveExtraPeople: input.ep.cappedExtra,
		hours: input.hours,
		materials: input.materials,
		warnings: input.warnings,
		variant: input.variant,
		fruitCostPerPortion: input.fruitCostPerPortion
	};
}

function travelWarning(hours: WorkHours): string | null {
	if (hours.travel <= hours.billable) return null;
	return `Meer rijden (${round2(hours.travel)} u) dan werken (${round2(hours.billable)} u). De marge klopt, maar dit blokkeert een hele dag voor één klus.`;
}

export function calculatePrice(input: {
	tiraPortions: number;
	burrPortions: number;
	extraPeople: number;
	oneWayKm: number;
	config: PricingConfig;
	burrataIngredientCost?: number;
	kmPrice?: number; // EUR per retour-km, binnen kmPriceMin..kmPriceMax
	discountPctOverride?: number; // handmatig percentage in plaats van de curve
}): PriceBreakdown {
	const { tiraPortions, burrPortions, extraPeople, oneWayKm, config } = input;
	const burrCostPerPortion = input.burrataIngredientCost ?? INGREDIENT_COST_PER_PORTION.burrata;
	const totalPortions = tiraPortions + burrPortions;
	const warnings: string[] = [];

	const isMix = tiraPortions > 0 && burrPortions > 0;

	if (isMix) {
		if (tiraPortions < MIN_PORTIONS_PER_PRODUCT)
			warnings.push(`Bij mix minimaal ${MIN_PORTIONS_PER_PRODUCT} tiramisu.`);
		if (burrPortions < MIN_PORTIONS_PER_PRODUCT)
			warnings.push(`Bij mix minimaal ${MIN_PORTIONS_PER_PRODUCT} burrata.`);
	} else if (totalPortions > 0 && totalPortions < MIN_TOTAL_PORTIONS) {
		warnings.push(`Minimaal ${MIN_TOTAL_PORTIONS} porties.`);
	}

	const ep = extraPersonResult(totalPortions, extraPeople, config);
	warnings.push(...ep.warnings);
	const people = 1 + ep.cappedExtra;

	const travel = travelResult(oneWayKm, clampKmPrice(input.kmPrice, config), config);

	// --- Uren ---------------------------------------------------------------
	// Prep is per product (twee soorten = twee keer de keuken in), service en
	// nazorg gaan over het totaal, op locatie en reis schalen met het aantal personen.
	const has = totalPortions > 0;
	const prep =
		(tiraPortions > 0 ? prepHours('tiramisu', tiraPortions, config) : 0) +
		(burrPortions > 0 ? prepHours('burrata', burrPortions, config) : 0);
	const service = has && config.portionsPerHour > 0 ? totalPortions / config.portionsPerHour : 0;
	const cleanup = cleanupHours(totalPortions, config);
	const onsite = has ? config.onsiteHours * people : 0;
	const travelHours = travelHoursFor(oneWayKm, config) * people;

	const hours = makeHours({ prep, onsite, service, cleanup, travel: travelHours });

	// --- Materiaal ----------------------------------------------------------
	const ingredientsTira = tiraPortions * INGREDIENT_COST_PER_PORTION.tiramisu;
	const ingredientsBurr = burrPortions * burrCostPerPortion;
	const packaging = totalPortions * PACKAGING_COST_PER_PORTION;
	const extra = extraCostsFor(totalPortions, config);
	const vehicle = travel.roundTripKm * config.vehicleCostPerKm;
	const materials = makeMaterials({ ingredientsTira, ingredientsBurr, packaging, extra, vehicle });

	// --- Prijs --------------------------------------------------------------
	// De basisregel telt alleen het werk dat één persoon zou doen; de extra
	// persoon staat als eigen post.
	const labourFee = labourFeeFor(
		{ prep, onsite: has ? config.onsiteHours : 0, service, cleanup },
		config
	);
	const materialsFee = ingredientsTira + ingredientsBurr + packaging + extra;
	const baseFee = has ? includedTravelFee(config) : 0;
	const extraPersonFee = extraPersonFeeFor(ep.cappedExtra, config);

	const tw = has ? travelWarning(hours) : null;
	if (tw) warnings.push(tw);

	const productLines: ProductLine[] = [];
	if (has) {
		// De prijs is één geheel (uren + materiaal + inbegrepen reis). We splitsen
		// hem naar rato van de porties over de regels zodat de offerte per soort
		// leesbaar blijft. Reiskosten boven de straal zijn een eigen regel.
		const linesTotal = labourFee + materialsFee + baseFee;
		if (tiraPortions > 0 && burrPortions > 0) {
			const tiraPart = round2((linesTotal * tiraPortions) / totalPortions);
			productLines.push({ product: 'tiramisu', portions: tiraPortions, price: tiraPart });
			productLines.push({
				product: 'burrata',
				portions: burrPortions,
				price: round2(linesTotal - tiraPart)
			});
		} else if (tiraPortions > 0) {
			productLines.push({ product: 'tiramisu', portions: tiraPortions, price: round2(linesTotal) });
		} else {
			productLines.push({ product: 'burrata', portions: burrPortions, price: round2(linesTotal) });
		}
	}

	return assemble({
		totalPortions,
		productLines,
		hours,
		materials,
		labourFee,
		materialsFee,
		baseFee,
		ep,
		extraPersonFee,
		travel,
		config,
		discountPctOverride: input.discountPctOverride,
		warnings
	});
}

function makeHours(h: {
	prep: number;
	onsite: number;
	service: number;
	cleanup: number;
	travel: number;
}): WorkHours {
	const billable = h.prep + h.onsite + h.service + h.cleanup;
	return {
		prep: round2(h.prep),
		onsite: round2(h.onsite),
		service: round2(h.service),
		cleanup: round2(h.cleanup),
		travel: round2(h.travel),
		billable: round2(billable),
		total: round2(billable + h.travel)
	};
}

function makeMaterials(m: {
	ingredientsTira: number;
	ingredientsBurr: number;
	packaging: number;
	extra: number;
	vehicle: number;
}): MaterialCosts {
	const ingredients = m.ingredientsTira + m.ingredientsBurr;
	return {
		ingredientsTira: round2(m.ingredientsTira),
		ingredientsBurr: round2(m.ingredientsBurr),
		ingredients: round2(ingredients),
		packaging: round2(m.packaging),
		extra: round2(m.extra),
		vehicle: round2(m.vehicle),
		total: round2(ingredients + m.packaging + m.extra + m.vehicle)
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

function round4(n: number): number {
	return Math.round(n * 10000) / 10000;
}

export interface StageLine {
	stage: Stage;
	hours: number; // mensuren, inclusief extra personen
	rate: number;
	amount: number; // hours x rate: wat deze fase zonder korting opbrengt
}

export interface InternalBreakdown {
	hours: WorkHours;
	costs: MaterialCosts;
	people: number;
	grossProfit: number;
	// Per werkfase: uren, tarief en waarde. Zo zie je waar het geld zit.
	stages: StageLine[];
	// Wat de werkuren na korting per uur opleveren (zonder reisuren).
	labourRateRealised: number;
	// Controle: het verschil tussen opbrengst en uurtarieven hoort precies de
	// korting te zijn. Alles daarboven wijst op een rekenfout.
	unexplainedGap: number;
	// Reizen: inbegrepen reis + reiskostenregel min autokosten, per rij-mensuur.
	travelRateRealised: number;
	// Alles bij elkaar, inclusief reistijd: wat we per uur overhouden.
	blendedRatePerPerson: number;
}

export function calculateInternals(
	result: PriceBreakdown,
	config: PricingConfig
): InternalBreakdown {
	const people = 1 + result.effectiveExtraPeople;
	const costs = result.materials;
	const r = config.hourlyRates;

	const stages: StageLine[] = STAGES.map((stage) => {
		const hours = result.hours[stage];
		return { stage, hours, rate: r[stage], amount: round2(hours * r[stage]) };
	});

	// Reisomzet = inbegrepen reis + reiskostenregel. Autokosten tellen over alle
	// km, ook binnen de vrije straal. Al het andere hoort bij het werk.
	const travelRevenue = result.baseFee + result.travelFee;
	const travelMargin = travelRevenue - costs.vehicle;
	const labourRevenue =
		result.total - costs.ingredients - costs.packaging - costs.extra - travelRevenue;
	const labourValue = stages.reduce((sum, s) => sum + s.amount, 0);
	const grossProfit = round2(result.total - costs.total);

	return {
		hours: result.hours,
		costs,
		people,
		grossProfit,
		stages,
		labourRateRealised:
			result.hours.billable > 0 ? round2(labourRevenue / result.hours.billable) : 0,
		unexplainedGap: round2(labourRevenue - labourValue + result.discount),
		travelRateRealised: result.hours.travel > 0 ? round2(travelMargin / result.hours.travel) : 0,
		blendedRatePerPerson: result.hours.total > 0 ? round2(grossProfit / result.hours.total) : 0
	};
}

// ---------------------------------------------------------------------------
// Speciale varianten: bruidstaarten op locatie gebouwd.
//
// Geen hapjes (geen rondlopen) maar prep in onze keuken + opbouw op locatie.
// Ze lopen door dezelfde fasen, alleen is `service` hier de opbouwtijd in
// plaats van de looptijd.
// ---------------------------------------------------------------------------

export type SpecialVariant = 'tiramisu-taart' | 'millefeuille-taart';

export const VARIANT_LABELS: Record<SpecialVariant, string> = {
	'tiramisu-taart': 'Tiramisu-taart (op locatie gebouwd)',
	'millefeuille-taart': 'Millefeuille-taart (vers fruit)'
};

export const SPECIAL_MIN_PORTIONS: Record<SpecialVariant, number> = {
	'tiramisu-taart': 30,
	'millefeuille-taart': 25
};

export function minPortionsForSpecialVariant(variant: SpecialVariant): number {
	return SPECIAL_MIN_PORTIONS[variant];
}

// Millefeuille kostprijs per portie (excl. btw):
//   bladerdeeg EUR 9,60 + crème EUR 20,04 = EUR 29,64 over 40 porties -> 0,74 p.p.
//   fruit: 2,4 kg @ EUR 18,90/kg = EUR 45,36 voor 50 porties -> 48 g p.p. -> 0,91 p.p.
//   (fruit varieert per seizoen -> losse input in de calculator)
export const MILLEFEUILLE_BASE_COST_PER_PORTION = 0.74;
export const MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION = 0.91;

export function specialPrepHours(
	variant: SpecialVariant,
	portions: number,
	config: PricingConfig
): number {
	return hourCurveAt(
		config,
		variant === 'millefeuille-taart' ? 'prepMillefeuille' : 'prepTiramisuTaart',
		portions
	);
}

// Opbouwtijd op locatie. Taart en millefeuille delen dezelfde curve.
export function buildHours(portions: number, config: PricingConfig): number {
	return hourCurveAt(config, 'buildTaart', portions);
}

// Ingrediëntkost per portie per variant. Tiramisu-taart volgt het recept met
// een taartportie; millefeuille heeft een eigen kostprijs incl. (seizoens)fruit.
export function specialIngredientCostPerPortion(
	variant: SpecialVariant,
	fruitCostPerPortion = MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION
): number {
	if (variant === 'millefeuille-taart') {
		return round2(MILLEFEUILLE_BASE_COST_PER_PORTION + fruitCostPerPortion);
	}
	return round2(tiramisuCostPerPortion('taart'));
}

export function calculateSpecialPrice(input: {
	variant: SpecialVariant;
	portions: number;
	oneWayKm: number;
	config: PricingConfig;
	fruitCostPerPortion?: number;
	kmPrice?: number; // EUR per retour-km, binnen kmPriceMin..kmPriceMax
	discountPctOverride?: number; // handmatig percentage in plaats van de curve
}): PriceBreakdown {
	const { variant, oneWayKm, config } = input;
	const n = Math.max(0, Math.round(input.portions));
	const fruitCost = input.fruitCostPerPortion ?? MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION;
	const warnings: string[] = [];
	const minPortions = minPortionsForSpecialVariant(variant);

	if (n > 0 && n < minPortions) {
		warnings.push(`Minimaal ${minPortions} porties.`);
	}

	// Een taart bouw je alleen. De verplichte tweede persoon van de hapjes (nodig
	// omdat één iemand niet uren achter elkaar kan rondlopen) speelt hier niet.
	const ep: ExtraPersonResult = {
		mandatory: false,
		allowedExtra: 0,
		cappedExtra: 0,
		warnings: []
	};

	const travel = travelResult(oneWayKm, clampKmPrice(input.kmPrice, config), config);

	// --- Uren ---------------------------------------------------------------
	const has = n > 0;
	const prep = specialPrepHours(variant, n, config);
	const service = buildHours(n, config); // opbouw op locatie
	const cleanup = cleanupHours(n, config, 'taart');
	const onsite = has ? config.onsiteHours : 0;
	const travelHours = travelHoursFor(oneWayKm, config);

	const hours = makeHours({ prep, onsite, service, cleanup, travel: travelHours });

	// --- Materiaal ----------------------------------------------------------
	const ingredients = n * specialIngredientCostPerPortion(variant, fruitCost);
	const extra = extraCostsFor(n, config);
	const vehicle = travel.roundTripKm * config.vehicleCostPerKm;
	const materials = makeMaterials({
		ingredientsTira: ingredients,
		ingredientsBurr: 0,
		packaging: 0,
		extra,
		vehicle
	});

	// --- Prijs --------------------------------------------------------------
	const labourFee = labourFeeFor({ prep, onsite, service, cleanup }, config);
	const materialsFee = ingredients + extra;
	const baseFee = has ? includedTravelFee(config) : 0;

	const tw = has ? travelWarning(hours) : null;
	if (tw) warnings.push(tw);

	const productLines: ProductLine[] = has
		? [
				{
					product: 'tiramisu',
					portions: n,
					price: round2(labourFee + materialsFee + baseFee),
					label: VARIANT_LABELS[variant]
				}
			]
		: [];

	return assemble({
		totalPortions: n,
		productLines,
		hours,
		materials,
		labourFee,
		materialsFee,
		baseFee,
		ep,
		extraPersonFee: 0,
		travel,
		config,
		discountPctOverride: input.discountPctOverride,
		warnings,
		variant,
		fruitCostPerPortion: variant === 'millefeuille-taart' ? fruitCost : undefined
	});
}

// ---------------------------------------------------------------------------
// Schets van de kortingscurve
// ---------------------------------------------------------------------------

export interface DiscountSketchPoint {
	n: number;
	discountPct: number;
	perPortionBefore: number; // excl. btw, zonder korting
	perPortionAfter: number; // excl. btw, met de curve
	totalBefore: number;
	totalAfter: number;
}

// Prijs per portie met en zonder korting over een bereik aan porties. Binnen de
// vrije straal (0 km) en alleen de verplichte extra persoon, net als de prijzen
// op de website.
export function discountSketch(opts: {
	product: 'tiramisu' | 'burrata' | SpecialVariant;
	config: PricingConfig;
	from?: number;
	to?: number;
	step?: number;
	fruitCostPerPortion?: number;
	burrataIngredientCost?: number;
}): DiscountSketchPoint[] {
	const { product, config, to = 400, step = 5 } = opts;
	const special = product === 'tiramisu-taart' || product === 'millefeuille-taart';
	const from = opts.from ?? (special ? SPECIAL_MIN_PORTIONS[product] : MIN_TOTAL_PORTIONS);
	const out: DiscountSketchPoint[] = [];
	for (let n = from; n <= to; n += step) {
		const r = special
			? calculateSpecialPrice({
					variant: product,
					portions: n,
					oneWayKm: 0,
					config,
					fruitCostPerPortion: opts.fruitCostPerPortion
				})
			: calculatePrice({
					tiraPortions: product === 'tiramisu' ? n : 0,
					burrPortions: product === 'burrata' ? n : 0,
					extraPeople: 0,
					oneWayKm: 0,
					config,
					burrataIngredientCost: opts.burrataIngredientCost
				});
		out.push({
			n,
			discountPct: r.discountPct,
			perPortionBefore: round2(r.productBeforeDiscount / n),
			perPortionAfter: round2(r.total / n),
			totalBefore: r.productBeforeDiscount,
			totalAfter: r.total
		});
	}
	return out;
}
