// ---------------------------------------------------------------------------
// Prijsmodel — uren zijn de bron.
//
// Elke variant wordt op dezelfde manier doorgerekend:
//
//   prep      keuken vooraf                  (mensuren, schaalt met porties)
//   setup     op locatie op- en afbouwen     (mensuren, vast per persoon)
//   service   lopen en maken, of taart bouwen (mensuren, schaalt met porties)
//   cleanup   nazorg thuis (afwas)           (mensuren, schaalt met porties)
//   travel    reistijd                       (mensuren, schaalt met afstand)
//
// Elke fase heeft een EIGEN uurtarief (config.hourlyRates). De urencurves staan
// in één matrix (config.hourCurves): elke rij op dezelfde ankers 25/50/100/200/400
// porties. Alleen setupHours (vast p.p.) en portionsPerHour (looptempo) staan los.
//
// Prijs = som over fasen van (uren x tarief van die fase)
//       + materiaal (kostprijs x markup)
//       + basisbedrag (eventBaseFee, dekt de vrije reisstraal)
//       + reis (retour-km boven de vrije straal x costPerKm)
//       + extra persoon (hun setup + hun reistijd boven de vrije straal)
//
// calculateInternals geeft per fase uren, tarief en bedrag terug, plus twee
// controles: labourGap (opbrengst min wat de fase-tarieven vragen, hoort 0 te
// zijn tenzij er korting op zit) en travelGap (reismarge min reisuren x tarief).
//
// Reis. Voorheen zat er een vaste 1,5 u rijtijd in het basistarief, ongeacht
// afstand. Dat betekende dat een klus om de hoek 1,5 u rijtijd betaalde die er
// niet was, en een klus op 150 km 4,3 u rijtijd maakte waarvan er 1,5 u betaald
// werd. Het gerealiseerde tarief zakte daardoor van ~EUR 107/u (0 km) naar
// ~EUR 62/u (200 km).
//
// Nu betaalt afstand zichzelf, met een vrije straal eromheen zodat we naar buiten
// toe een all-in prijs kunnen blijven noemen:
//
//   * eventBaseFee is een vast bedrag per klus dat de vrije straal financiert.
//     Het staat niet als losse regel op de offerte maar zit in de productregels.
//   * freeRoundTripKm zijn de retour-km die daarmee betaald zijn. Daarbinnen is
//     de reis "inbegrepen" en zien we alleen het all-in bedrag.
//   * Daarboven telt costPerKm per retour-km, voor ons en voor een extra persoon.
//
// Op 60 vrije retour-km (30 km enkele reis) dekt EUR 45 de rit tot ~20 km; op de
// rand van de straal leggen we ~EUR 24 toe. Dat is bewust: Amsterdam, Utrecht en
// het hele Gooi vallen erbinnen en houden daarmee een all-in prijs.
// ---------------------------------------------------------------------------

export type Product = 'tiramisu' | 'burrata';

// Alle urencurves hangen aan hetzelfde raster. Het 25-anker is er omdat taarten
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
// gedeeld. De prep van de tiramisu-taart staat er bewust NIET in: die volgt uit
// de tiramisu-prep maal tiramisuCakePrepFactor, zodat één receptmeting doorwerkt.
export type HourCurveKey =
	| 'prepTiramisu'
	| 'prepBurrata'
	| 'prepMillefeuille'
	| 'buildTaart'
	| 'cleanupHapjes'
	| 'cleanupTaart';

export const HOUR_CURVE_KEYS: HourCurveKey[] = [
	'prepTiramisu',
	'prepBurrata',
	'prepMillefeuille',
	'buildTaart',
	'cleanupHapjes',
	'cleanupTaart'
];

export const HOUR_CURVE_LABELS: Record<HourCurveKey, string> = {
	prepTiramisu: 'Prep tiramisu',
	prepBurrata: 'Prep burrata',
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

// Tiramisu heeft een vast recept; burrata-default is de som van de standaard-toppings.
// Beide zijn pure ingrediënten — verpakking telt apart via PACKAGING_COST_PER_PORTION.
export const INGREDIENT_COST_PER_PORTION: Record<Product, number> = {
	tiramisu: 0.8998,
	burrata: burrataIngredientCost(DEFAULT_BURRATA_TOPPINGS)
};

export const PRODUCT_LABELS: Record<Product, string> = {
	tiramisu: 'Tiramisu',
	burrata: 'Burrata'
};

export const MIN_PORTIONS_PER_PRODUCT = 50;
export const MIN_TOTAL_PORTIONS = 50;

// De vijf fasen van een klus. Elke fase heeft een eigen uurtarief en een eigen
// urencurve, allebei instelbaar — zo kun je bijvoorbeeld de afwas goedkoper
// rekenen dan het lopen, of de prep zwaarder maken zonder de rest te raken.
export type Stage = 'prep' | 'setup' | 'service' | 'standby' | 'cleanup' | 'travel';

export const STAGES: Stage[] = ['prep', 'setup', 'service', 'standby', 'cleanup', 'travel'];

export const STAGE_LABELS: Record<Stage, string> = {
	prep: 'Prep (keuken)',
	setup: 'Opbouw op locatie',
	service: 'Lopen / bouwen',
	standby: 'Aanwezig zonder werk',
	cleanup: 'Nazorg (afwas)',
	travel: 'Reizen'
};

// Hoe de urencurve van een fase tot stand komt, puur ter uitleg in de UI.
export const STAGE_SOURCE: Record<Stage, string> = {
	prep: 'urenmatrix, per product',
	setup: 'uitpakken en inpakken, vast per persoon',
	service: 'porties ÷ porties-per-uur, of de opbouwrij bij taart',
	standby: 'per offerte instelbaar, per persoon',
	cleanup: 'urenmatrix, vlak; hapjes en taart apart',
	travel: 'retour-km ÷ gemiddelde snelheid'
};

export interface PricingConfig {
	// --- Uurtarieven per fase ----------------------------------------------
	hourlyRates: Record<Stage, number>;

	// --- Urencurves --------------------------------------------------------
	// Eén matrix: elke curve op dezelfde ankers (25/50/100/200/400 porties),
	// lineair ertussen en doorgetrokken op de 200->400 helling erboven.
	hourCurves: Record<HourCurveKey, Tier>;
	setupHours: number; // uitpakken, station opbouwen, na afloop weer inpakken — per persoon
	portionsPerHour: number; // porties per uur dat één persoon lopend ter plekke maakt

	// Aanwezig zijn zonder te werken: ruim op tijd komen, wachten tot je mag
	// beginnen, blijven tot de taart is aangesneden. Dit verschilt zo sterk per
	// klus (soms nul, soms twee uur) dat het per offerte wordt ingevuld; dit is
	// alleen de startwaarde. Net als setup en reis telt het per persoon.
	defaultStandbyHours: number;

	// --- Reis --------------------------------------------------------------
	// Eén tarief per retour-kilometer dat zowel de rijtijd als de auto dekt.
	// costPerKm hoort ongeveer gelijk te zijn aan
	//   vehicleCostPerKm + hourlyRates.travel / travelSpeedKmh
	// (zie derivedCostPerKm). Het is een losse dial zodat het bedrag dat we
	// communiceren een rond getal kan zijn.
	travelSpeedKmh: number; // gemiddelde snelheid, voor de afleiding en de uren
	vehicleCostPerKm: number; // brandstof en slijtage
	costPerKm: number; // wat de klant per retour-km betaalt boven de vrije straal
	// Laat costPerKm en het basisbedrag zichzelf afleiden uit de reisaannames, zodat
	// de reis per definitie zijn eigen uren dekt en het blended tarief niet stiekem
	// wegzakt zodra je aan het reistarief draait. Zet uit als je een rond bedrag
	// wilt communiceren en het verschil bewust voor lief neemt.
	autoCostPerKm: boolean;
	autoEventBaseFee: boolean;
	freeRoundTripKm: number; // vrije retour-km voordat we gaan rekenen
	// Vast bedrag per klus dat de vrije straal betaalt. Zit in de productregels
	// en komt dus nooit als losse regel op de offerte. Dichtbij houden we er iets
	// van over, op de rand van de straal leggen we toe.
	eventBaseFee: number;

	// --- Team --------------------------------------------------------------
	mandatoryExtraPersonAt: number;
	extraPersonMinPortions2: number;

	// Welk deel van de werkelijke kosten van een extra persoon we doorbelasten.
	// Onder 1 leggen we bewust toe. De drempel is namelijk een schatting: bij 130
	// gasten red je het soms alleen, bij 100 heb je soms al hulp nodig. Een harde
	// stap in de portieprijs precies op die drempel suggereert een precisie die er
	// niet is, dus vlakken we hem af en nemen we het verschil voor eigen rekening.
	extraPersonChargeFactor: number;

	// --- Materiaal ---------------------------------------------------------
	materialsMarkup: number; // 1 = kostprijs 1:1 doorbelast, marge zit in het uurtarief

	// --- Kortingen ---------------------------------------------------------
	// Het delen van setup, reis en nazorg bij een mix zit nu structureel in het
	// model (één event, dus één keer opbouwen en één keer afwassen). Deze aftrek
	// is daarom standaard 0 en alleen nog een verkoop-dial.
	mixSharedDeduction: number;
	volumeDiscountThreshold: number;
	volumeDiscountPercent: number;

	// Kleine-klus-korting. De vaste overhead (opbouw, wachten, nazorg, basisbedrag)
	// is bij 50 porties ~47% van de prijs en bij 400 nog maar ~11%. Volledig
	// doorbelasten geeft een instapprijs boven de 10 euro per portie incl. btw, en
	// dat is als etalageprijs te duur. We nemen daar bewust een lager uurtarief
	// voor lief: volledige korting tot reliefFullAt porties, lineair uitdovend
	// naar nul bij reliefZeroAt. Grote en verre klussen blijven onaangeroerd.
	smallOrderReliefMax: number;
	smallOrderReliefFullAt: number;
	smallOrderReliefZeroAt: number;

	// --- Taart-varianten (op locatie gebouwd) ------------------------------
	cakeboardPrice: number; // prijs per cakeboard
	cakeboardPerPersons: number; // 1 cakeboard per X personen

	// Prep van de tiramisu-taart = hapjesprep op deze portiefactor.
	tiramisuCakePrepFactor: number;
}

// De urenmatrix. Onder het eerste anker is de curve vlak, dus voor hapjes (min. 50)
// is de 25-kolom gelijk aan de 50-kolom en doet hij niets. Voor taarten (min. 25/30)
// is hij wel de werkzame ondergrens.
export const DEFAULT_HOUR_CURVES: Record<HourCurveKey, Tier> = {
	prepTiramisu: { 25: 1.25, 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 },
	// Gelijkgetrokken met tiramisu — eerdere burrata-prep was te laag ingeschat.
	prepBurrata: { 25: 1.25, 50: 1.25, 100: 2, 200: 3.5, 400: 6.5 },
	// NIET GEMETEN. Deze rij is een kopie van wat de tiramisu-taart aan prep kost
	// (hapjesprep op 2x portiegrootte), omdat we van de millefeuille nog geen echte
	// klus geklokt hebben. De eerdere curve liep op tot 5u bij 100 personen, wat
	// puur een aanname was en de millefeuille ~EUR 128 duurder maakte dan de taart.
	// Zodra je er een klokt: alleen deze rij aanpassen.
	prepMillefeuille: { 25: 1.25, 50: 2, 100: 3.5, 200: 6.5, 400: 12.5 },
	// 45 min bij 50 personen, 1u15 bij 100. Daarboven dezelfde helping doorgetrokken.
	buildTaart: { 25: 0.75, 50: 0.75, 100: 1.25, 200: 2.25, 400: 4.25 },
	// Nazorg is vlak: het is de vaatwasser inruimen en spullen terugzetten, en dat
	// schaalt nauwelijks met het aantal porties. Hapjes kosten iets meer dan een
	// taart, want er is meer schoon te maken en terug te zetten. Vlak gezet, maar
	// het blijft een rij in de matrix voor als het bij grote klussen toch oploopt.
	cleanupHapjes: { 25: 0.75, 50: 0.75, 100: 0.75, 200: 0.75, 400: 0.75 },
	cleanupTaart: { 25: 0.5, 50: 0.5, 100: 0.5, 200: 0.5, 400: 0.5 }
};

export const DEFAULT_CONFIG: PricingConfig = {
	// EUR 85 komt overeen met wat het oude model op volume feitelijk opleverde,
	// zodat de middenmoot van de prijslijst niet omvalt. De correctie zit aan de
	// randen: kleine klussen omhoog, verre klussen fors omhoog, dichtbij omlaag.
	// Reizen staat bewust lager: rijden is geen werken.
	hourlyRates: {
		prep: 85,
		setup: 85,
		service: 85,
		// Wachten is geen werken, maar je staat er wel en kunt niks anders doen.
		// Daarom tussen het werktarief en het reistarief in.
		standby: 65,
		cleanup: 85,
		travel: 50
	},
	hourCurves: {
		prepTiramisu: { ...DEFAULT_HOUR_CURVES.prepTiramisu },
		prepBurrata: { ...DEFAULT_HOUR_CURVES.prepBurrata },
		prepMillefeuille: { ...DEFAULT_HOUR_CURVES.prepMillefeuille },
		buildTaart: { ...DEFAULT_HOUR_CURVES.buildTaart },
		cleanupHapjes: { ...DEFAULT_HOUR_CURVES.cleanupHapjes },
		cleanupTaart: { ...DEFAULT_HOUR_CURVES.cleanupTaart }
	},
	setupHours: 0.75,
	portionsPerHour: 50,
	// Gemeten op een taartklus voor 95 personen: 14:45 aangekomen, pas 15:30 kunnen
	// beginnen, 1 uur gebouwd, om 17:10 weg. Van die 2u25 was 1u echt bouwen; de
	// rest was uitpakken/inpakken (setup) plus wachten (standby).
	defaultStandbyHours: 0.75,
	travelSpeedKmh: 70,
	vehicleCostPerKm: 0.45,
	// 0,45 + 50/70 = 1,164 -> afgerond op een communiceerbare 1,15.
	costPerKm: 1.15,
	autoCostPerKm: true,
	autoEventBaseFee: true,
	// 60 retour-km = 30 km enkele reis. Amsterdam, Utrecht, Amersfoort, Almere en
	// het hele Gooi vallen erbinnen, dus daar noemen we gewoon één all-in prijs.
	freeRoundTripKm: 60,
	// EUR 45 is precies het gat tussen dit model op 0 km en de oude prijslijst
	// (50 -> 382 vs 425, 100 -> 606 vs 650). De prijslijst blijft dus staan waar
	// hij stond en betaalt vanaf nu de vrije straal.
	eventBaseFee: 45,
	mandatoryExtraPersonAt: 125,
	extraPersonMinPortions2: 250,
	extraPersonChargeFactor: 0.6,
	materialsMarkup: 1,
	mixSharedDeduction: 0,
	volumeDiscountThreshold: 300,
	volumeDiscountPercent: 0,
	// 45 zet de instapprijs terug op het niveau van voor de herziening.
	smallOrderReliefMax: 45,
	smallOrderReliefFullAt: 50,
	// Boven ~80 porties draagt de klus zijn eigen vaste overhead prima; daar hoeft
	// niks meer bij. De korting is er puur voor de kleine boekingen (30-80).
	smallOrderReliefZeroAt: 80,
	cakeboardPrice: 2.5,
	cakeboardPerPersons: 12,
	tiramisuCakePrepFactor: 2
};

export function cloneConfig(config: PricingConfig): PricingConfig {
	return {
		...config,
		hourlyRates: { ...config.hourlyRates },
		hourCurves: Object.fromEntries(
			HOUR_CURVE_KEYS.map((k) => [k, { ...config.hourCurves[k] }])
		) as Record<HourCurveKey, Tier>
	};
}

// Wat costPerKm zou moeten zijn als je hem puur uit de aannames afleidt.
// De calculator zet dit naast de ingestelde waarde zodat drift zichtbaar is.
// Korting op kleine klussen: vol tot reliefFullAt, lineair uitdovend naar nul bij
// reliefZeroAt, daarboven niets. Bewust een korting en geen verlaging van de uren,
// zodat in de urenmatrix blijft staan wat het werk echt kost.
export function smallOrderRelief(portions: number, config: PricingConfig): number {
	if (portions <= 0 || config.smallOrderReliefMax <= 0) return 0;
	const full = config.smallOrderReliefFullAt;
	const zero = config.smallOrderReliefZeroAt;
	if (zero <= full) return portions <= full ? round2(config.smallOrderReliefMax) : 0;
	// Smoothstep in plaats van lineair. Lineair uitdoven laat de korting met een
	// constant bedrag per portie krimpen, en op het eindpunt stopt dat abrupt: de
	// marginale prijs per extra portie klapt daar in één keer omlaag (bij 45 euro
	// over 30 porties schilde dat 1,50 per portie). Met 3t^2-2t^3 is de helling aan
	// beide uiteinden nul, dus sluit de korting vloeiend aan op het vlakke stuk
	// eronder en op geen-korting erboven.
	const t = Math.min(1, Math.max(0, (portions - full) / (zero - full)));
	const eased = 3 * t * t - 2 * t * t * t;
	return round2(config.smallOrderReliefMax * (1 - eased));
}

// Wat de klant feitelijk per retour-km betaalt: afgeleid uit de reisaannames of
// de handmatig ingestelde waarde.
export function effectiveCostPerKm(config: PricingConfig): number {
	return config.autoCostPerKm ? derivedCostPerKm(config) : config.costPerKm;
}

// Het basisbedrag financiert de vrije straal. Afgeleid betekent: precies wat die
// vrije retour-km zouden kosten, zodat een rit tot aan de rand van de straal
// zichzelf betaalt in plaats van marge te kosten.
export function effectiveEventBaseFee(config: PricingConfig): number {
	if (!config.autoEventBaseFee) return config.eventBaseFee;
	return round2(config.freeRoundTripKm * effectiveCostPerKm(config));
}

export function derivedCostPerKm(config: PricingConfig): number {
	const perKm =
		config.vehicleCostPerKm +
		(config.travelSpeedKmh > 0 ? config.hourlyRates.travel / config.travelSpeedKmh : 0);
	return Math.round(perKm * 1000) / 1000;
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

export interface ProductLine {
	product: Product;
	portions: number;
	price: number;
	label?: string; // overschrijft PRODUCT_LABELS bij speciale varianten (taart/millefeuille)
}

// De vier werkbuckets plus reis. Alles in mensuren: setup en travel zijn al
// vermenigvuldigd met het aantal personen, prep/service/cleanup zijn het totale
// werk dat over het team verdeeld wordt.
export interface WorkHours {
	prep: number;
	setup: number;
	service: number; // lopen en maken (hapjes) of opbouwen (taart)
	standby: number; // aanwezig zonder te werken
	cleanup: number;
	travel: number;
	billable: number; // prep + setup + service + cleanup, tegen labourHourlyRate
	total: number; // billable + travel
}

export interface MaterialCosts {
	ingredientsTira: number;
	ingredientsBurr: number;
	ingredients: number;
	packaging: number; // verpakking bij hapjes, cakeboards bij taarten
	vehicle: number; // brandstof en slijtage voor deze rit
	total: number;
}

export interface PriceBreakdown {
	totalPortions: number;
	productLines: ProductLine[];
	labourFee: number; // uren x uurtarief
	materialsFee: number; // materiaal doorbelast aan de klant
	baseFee: number; // vast bedrag per klus, betaalt de vrije reisstraal
	mixDeduction: number;
	smallOrderRelief: number; // korting op kleine klussen, zie smallOrderRelief()
	volumeDiscount: number;
	volumeDiscountPercent: number;
	extraPersonFee: number;
	extraPersonMandatory: boolean;
	extraPersonSetupHours: number;
	extraPersonTravelHours: number;
	travelFee: number;
	travelChargedKm: number;
	roundTripKm: number;
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

// Reis: retour-km boven de vrije straal tegen één tarief dat rijtijd en auto dekt.
// chargedHoursPerPerson zijn de reisuren die daadwerkelijk doorbelast worden; binnen
// de vrije straal is dat 0, want daar betaalt eventBaseFee de rit al.
function travelResult(
	oneWayKm: number,
	config: PricingConfig
): {
	roundTripKm: number;
	travelChargedKm: number;
	travelFee: number;
	chargedHoursPerPerson: number;
} {
	const roundTripKm = Math.max(0, oneWayKm) * 2;
	const travelChargedKm = Math.max(0, roundTripKm - config.freeRoundTripKm);
	const travelFee = round2(travelChargedKm * effectiveCostPerKm(config));
	const chargedHoursPerPerson =
		config.travelSpeedKmh > 0 ? travelChargedKm / config.travelSpeedKmh : 0;
	return { roundTripKm, travelChargedKm, travelFee, chargedHoursPerPerson };
}

// De extra persoon kost ons alleen zijn eigen setup en zijn eigen reistijd —
// prep, service en nazorg zijn totaal werk dat sowieso gedaan moet worden en
// verdeeld wordt over het team, dus dat rekenen we niet dubbel. Zijn reistijd
// telt op de doorbelaste km, niet op de totale: binnen de vrije straal rijden we
// in dezelfde auto en zit die rit al in het basisbedrag.
function extraPersonFeeFor(
	cappedExtra: number,
	chargedTravelHoursPerPerson: number,
	standbyHoursPerPerson: number,
	config: PricingConfig
): number {
	if (cappedExtra <= 0) return 0;
	const perPerson =
		config.setupHours * config.hourlyRates.setup +
		standbyHoursPerPerson * config.hourlyRates.standby +
		chargedTravelHoursPerPerson * config.hourlyRates.travel;
	return round2(cappedExtra * perPerson * config.extraPersonChargeFactor);
}

// Het werk van één persoon, elke fase tegen zijn eigen tarief. De reisfase zit
// hier niet in: die loopt via de km-prijs.
function labourFeeFor(
	base: { prep: number; setup: number; service: number; standby: number; cleanup: number },
	config: PricingConfig
): number {
	const r = config.hourlyRates;
	return (
		base.prep * r.prep +
		base.setup * r.setup +
		base.service * r.service +
		base.standby * r.standby +
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
	extraPersonTravelHours: number;
	travel: {
		roundTripKm: number;
		travelChargedKm: number;
		travelFee: number;
		chargedHoursPerPerson: number;
	};
	config: PricingConfig;
	warnings: string[];
	reliefOverride?: number;
	variant?: SpecialVariant;
	fruitCostPerPortion?: number;
}): PriceBreakdown {
	const { totalPortions, config } = input;
	const mixDeduction = round2(input.productLines.length > 1 ? config.mixSharedDeduction : 0);
	// Per offerte te overrulen, zodat je aan de knop kunt draaien en meteen ziet
	// wat het met het uurtarief doet. Zonder override volgt hij de curve.
	const relief =
		input.reliefOverride != null
			? round2(Math.max(0, input.reliefOverride))
			: smallOrderRelief(totalPortions, config);
	const base = input.labourFee + input.materialsFee + input.baseFee - mixDeduction - relief;

	const discountApplies =
		config.volumeDiscountPercent > 0 && totalPortions >= config.volumeDiscountThreshold;
	const volumeDiscount = discountApplies ? round2((base * config.volumeDiscountPercent) / 100) : 0;

	const total = round2(base - volumeDiscount + input.extraPersonFee + input.travel.travelFee);

	return {
		totalPortions,
		productLines: input.productLines,
		labourFee: round2(input.labourFee),
		materialsFee: round2(input.materialsFee),
		baseFee: round2(input.baseFee),
		mixDeduction,
		smallOrderRelief: relief,
		volumeDiscount,
		volumeDiscountPercent: discountApplies ? config.volumeDiscountPercent : 0,
		extraPersonFee: input.extraPersonFee,
		extraPersonMandatory: input.ep.mandatory,
		extraPersonSetupHours: input.ep.cappedExtra > 0 ? config.setupHours : 0,
		extraPersonTravelHours: input.ep.cappedExtra > 0 ? round2(input.extraPersonTravelHours) : 0,
		travelFee: input.travel.travelFee,
		travelChargedKm: input.travel.travelChargedKm,
		roundTripKm: input.travel.roundTripKm,
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

export function calculatePrice(input: {
	tiraPortions: number;
	burrPortions: number;
	extraPeople: number;
	oneWayKm: number;
	config: PricingConfig;
	burrataIngredientCost?: number;
	standbyHours?: number;
	smallOrderReliefOverride?: number;
}): PriceBreakdown {
	const { tiraPortions, burrPortions, extraPeople, oneWayKm, config } = input;
	const standbyPerPerson = Math.max(0, input.standbyHours ?? config.defaultStandbyHours);
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

	const travelHoursPerPerson = travelHoursFor(oneWayKm, config);
	const travel = travelResult(oneWayKm, config);

	// --- Uren ---------------------------------------------------------------
	// Prep is per product (twee soorten = twee keer de keuken in), service en
	// nazorg gaan over het totaal, setup en reis schalen met het aantal personen.
	const prep =
		(tiraPortions > 0 ? prepHours('tiramisu', tiraPortions, config) : 0) +
		(burrPortions > 0 ? prepHours('burrata', burrPortions, config) : 0);
	const service =
		totalPortions > 0 && config.portionsPerHour > 0 ? totalPortions / config.portionsPerHour : 0;
	const cleanup = cleanupHours(totalPortions, config);
	const setup = totalPortions > 0 ? config.setupHours * people : 0;
	const standby = totalPortions > 0 ? standbyPerPerson * people : 0;
	const travelHours = travelHoursPerPerson * people;

	const hours = makeHours({ prep, setup, service, standby, cleanup, travel: travelHours });

	// --- Materiaal ----------------------------------------------------------
	const ingredientsTira = tiraPortions * INGREDIENT_COST_PER_PORTION.tiramisu;
	const ingredientsBurr = burrPortions * burrCostPerPortion;
	const packaging = totalPortions * PACKAGING_COST_PER_PORTION;
	const vehicle = travel.roundTripKm * config.vehicleCostPerKm;
	const materials = makeMaterials({ ingredientsTira, ingredientsBurr, packaging, vehicle });

	// --- Prijs --------------------------------------------------------------
	// De basisregel telt alleen het werk dat één persoon zou doen; de extra
	// persoon staat als eigen regel op de offerte.
	const labourFee = labourFeeFor(
		{
			prep,
			setup: totalPortions > 0 ? config.setupHours : 0,
			service,
			standby: totalPortions > 0 ? standbyPerPerson : 0,
			cleanup
		},
		config
	);
	const materialsFee = (ingredientsTira + ingredientsBurr + packaging) * config.materialsMarkup;
	const baseFee = totalPortions > 0 ? effectiveEventBaseFee(config) : 0;
	const extraPersonFee = extraPersonFeeFor(
		ep.cappedExtra,
		travel.chargedHoursPerPerson,
		standbyPerPerson,
		config
	);

	if (hours.travel > hours.billable && totalPortions > 0) {
		warnings.push(
			`Meer rijden (${round2(hours.travel)} u) dan werken (${round2(hours.billable)} u). De marge klopt, maar dit blokkeert een hele dag voor één klus.`
		);
	}

	const productLines: ProductLine[] = [];
	if (tiraPortions > 0 || burrPortions > 0) {
		// De prijs is één geheel (uren + materiaal + basisbedrag). We splitsen hem
		// naar rato van de porties over de regels zodat de offerte per soort
		// leesbaar blijft en het basisbedrag nergens als losse post opduikt.
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
		extraPersonTravelHours: travel.chargedHoursPerPerson,
		travel,
		config,
		reliefOverride: input.smallOrderReliefOverride,
		warnings
	});
}

function makeHours(h: {
	prep: number;
	setup: number;
	service: number;
	standby: number;
	cleanup: number;
	travel: number;
}): WorkHours {
	const billable = h.prep + h.setup + h.service + h.standby + h.cleanup;
	return {
		prep: round2(h.prep),
		setup: round2(h.setup),
		service: round2(h.service),
		standby: round2(h.standby),
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
	vehicle: number;
}): MaterialCosts {
	const ingredients = m.ingredientsTira + m.ingredientsBurr;
	return {
		ingredientsTira: round2(m.ingredientsTira),
		ingredientsBurr: round2(m.ingredientsBurr),
		ingredients: round2(ingredients),
		packaging: round2(m.packaging),
		vehicle: round2(m.vehicle),
		total: round2(ingredients + m.packaging + m.vehicle)
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

export interface StageLine {
	stage: Stage;
	hours: number; // mensuren, inclusief extra personen
	rate: number;
	amount: number; // hours x rate — wat deze fase zou moeten opbrengen
}

export interface InternalBreakdown {
	hours: WorkHours;
	costs: MaterialCosts;
	people: number;
	grossProfit: number;
	// Per fase: uren, tarief en waarde. Zo zie je precies waar het geld zit.
	stages: StageLine[];
	// Wat het werk feitelijk oplevert versus wat de fase-tarieven voorschrijven.
	labourValue: number;
	labourRevenue: number;
	labourGap: number; // revenue - value; 0 als er geen korting op zit
	// Wat de werkuren na alle kortingen feitelijk opleveren. Gelijk aan het
	// ingestelde tarief zolang er niets weggegeven wordt, en zakt zichtbaar zodra
	// de kleine-klus-korting of een andere korting aanslaat.
	labourRateRealisedAfterDiscounts: number;
	// Idem voor reizen: km-opbrengst min autokosten versus reisuren x reistarief.
	travelValue: number;
	travelMargin: number;
	travelGap: number;
	travelRateRealised: number;
	// Alles bij elkaar, inclusief reistijd — het getal dat vroeger wegzakte bij afstand.
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

	// Reisomzet dekt de auto en de rijtijd; wat overblijft hoort bij het werk.
	// Het basisbedrag telt hier mee: het is de vrije straal, dus reisomzet. Zonder
	// die regel zou travelGap binnen de straal altijd negatief lijken en labourGap
	// even hard positief.
	const travelRevenue =
		result.travelFee +
		result.baseFee +
		result.extraPersonTravelHours * result.effectiveExtraPeople * r.travel;
	const travelMargin = travelRevenue - costs.vehicle;
	const travelValue = result.hours.travel * r.travel;
	const labourRevenue = result.total - costs.ingredients - costs.packaging - travelRevenue;
	const labourValue = stages
		.filter((s) => s.stage !== 'travel')
		.reduce((sum, s) => sum + s.amount, 0);

	const grossProfit = round2(result.total - costs.total);

	return {
		hours: result.hours,
		costs,
		people,
		grossProfit,
		stages,
		labourValue: round2(labourValue),
		labourRevenue: round2(labourRevenue),
		labourGap: round2(labourRevenue - labourValue),
		labourRateRealisedAfterDiscounts:
			result.hours.billable > 0 ? round2(labourRevenue / result.hours.billable) : 0,
		travelValue: round2(travelValue),
		travelMargin: round2(travelMargin),
		travelGap: round2(travelMargin - travelValue),
		travelRateRealised: result.hours.travel > 0 ? round2(travelMargin / result.hours.travel) : 0,
		blendedRatePerPerson: result.hours.total > 0 ? round2(grossProfit / result.hours.total) : 0
	};
}

// ---------------------------------------------------------------------------
// Speciale varianten: bruidstaarten op locatie gebouwd.
//
// Geen hapjes (geen rondlopen) maar prep in onze keuken + opbouw op locatie.
// Ze lopen door exact dezelfde uren-buckets, alleen is `service` hier de
// opbouwtijd in plaats van de looptijd.
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

// Portiegrootte t.o.v. één hapje — stuurt de prep-schaling van de tiramisu-taart
// en is ook de basis voor de footprint later.
export const PORTION_SIZE_FACTOR: Record<SpecialVariant, number> = {
	'tiramisu-taart': 2,
	'millefeuille-taart': 2
};

// Ingredientfactor voor tiramisu-taart: de taart gebruikt wel 2x lange vingers/koffie/
// amaretto, maar ongeveer 1,35x crème. Als gewogen midden houden we 1,65x aan.
export const TIRAMISU_CAKE_INGREDIENT_FACTOR = 1.65;

// Millefeuille kostprijs per portie (excl. btw):
//   bladerdeeg EUR 9,60 + crème EUR 20,04 = EUR 29,64 over 40 porties -> 0,74 p.p.
//   fruit: 2,4 kg @ EUR 18,90/kg = EUR 45,36 voor 50 porties -> 48 g p.p. -> 0,91 p.p.
//   (fruit varieert per seizoen -> losse input in de calculator)
export const MILLEFEUILLE_BASE_COST_PER_PORTION = 0.74;
export const MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION = 0.91;

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
		fruitGrams: 48,
		heightCm: 7.5,
		footprintCm: '6x6'
	}
};

// Tiramisu-taart: standaard hapjesprep, geschaald met de portiegrootte.
// Millefeuille: eigen, zwaardere curve via config-ankers (25/50/100 personen).
export function specialPrepHours(
	variant: SpecialVariant,
	portions: number,
	config: PricingConfig
): number {
	if (portions <= 0) return 0;
	if (variant === 'millefeuille-taart') {
		return hourCurveAt(config, 'prepMillefeuille', portions);
	}
	return prepHours('tiramisu', portions * config.tiramisuCakePrepFactor, config);
}

// Opbouwtijd op locatie. Taart en millefeuille delen dezelfde curve.
export function buildHours(
	_variant: SpecialVariant,
	portions: number,
	config: PricingConfig
): number {
	return hourCurveAt(config, 'buildTaart', portions);
}

function cakeboardCostPerPortion(config: PricingConfig): number {
	return config.cakeboardPrice / config.cakeboardPerPersons;
}

// Ingrediëntkost per portie per variant. Tiramisu-taart schaalt mee met de
// portiegrootte; millefeuille heeft een eigen kostprijs incl. (seizoens)fruit.
export function specialIngredientCostPerPortion(
	variant: SpecialVariant,
	fruitCostPerPortion = MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION
): number {
	if (variant === 'millefeuille-taart') {
		return round2(MILLEFEUILLE_BASE_COST_PER_PORTION + fruitCostPerPortion);
	}
	return round2(INGREDIENT_COST_PER_PORTION.tiramisu * TIRAMISU_CAKE_INGREDIENT_FACTOR);
}

export function calculateSpecialPrice(input: {
	variant: SpecialVariant;
	portions: number;
	oneWayKm: number;
	config: PricingConfig;
	fruitCostPerPortion?: number;
	standbyHours?: number;
	smallOrderReliefOverride?: number;
}): PriceBreakdown {
	const { variant, oneWayKm, config } = input;
	const n = Math.max(0, Math.round(input.portions));
	const standbyPerPerson = Math.max(0, input.standbyHours ?? config.defaultStandbyHours);
	const fruitCost = input.fruitCostPerPortion ?? MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION;
	const warnings: string[] = [];
	const minPortions = minPortionsForSpecialVariant(variant);

	if (n > 0 && n < minPortions) {
		warnings.push(`Minimaal ${minPortions} porties.`);
	}

	// Een taart bouw je alleen. De verplichte tweede persoon van de hapjes (nodig
	// omdat één iemand niet uren achter elkaar kan rondlopen) speelt hier niet: het
	// werk is opbouwen en dan wachten, niet doorlopend bedienen. We negeren
	// extraPeople hier dus bewust in plaats van hem stiekem toe te passen.
	const ep: ExtraPersonResult = {
		mandatory: false,
		allowedExtra: 0,
		cappedExtra: 0,
		warnings: []
	};
	const people = 1;

	const travelHoursPerPerson = travelHoursFor(oneWayKm, config);
	const travel = travelResult(oneWayKm, config);

	// --- Uren ---------------------------------------------------------------
	const prep = specialPrepHours(variant, n, config);
	const service = buildHours(variant, n, config); // opbouw op locatie
	const cleanup = cleanupHours(n, config, 'taart');
	const setup = n > 0 ? config.setupHours * people : 0;
	const standby = n > 0 ? standbyPerPerson * people : 0;
	const travelHours = travelHoursPerPerson * people;

	const hours = makeHours({ prep, setup, service, standby, cleanup, travel: travelHours });

	// --- Materiaal ----------------------------------------------------------
	const ingredients = n * specialIngredientCostPerPortion(variant, fruitCost);
	const packaging = n * cakeboardCostPerPortion(config);
	const vehicle = travel.roundTripKm * config.vehicleCostPerKm;
	const materials = makeMaterials({
		ingredientsTira: ingredients,
		ingredientsBurr: 0,
		packaging,
		vehicle
	});

	// --- Prijs --------------------------------------------------------------
	const labourFee = labourFeeFor(
		{
			prep,
			setup: n > 0 ? config.setupHours : 0,
			service,
			standby: n > 0 ? standbyPerPerson : 0,
			cleanup
		},
		config
	);
	const materialsFee = (ingredients + packaging) * config.materialsMarkup;
	const baseFee = n > 0 ? effectiveEventBaseFee(config) : 0;
	const extraPersonFee = extraPersonFeeFor(
		ep.cappedExtra,
		travel.chargedHoursPerPerson,
		standbyPerPerson,
		config
	);

	if (hours.travel > hours.billable && n > 0) {
		warnings.push(
			`Meer rijden (${round2(hours.travel)} u) dan werken (${round2(hours.billable)} u). De marge klopt, maar dit blokkeert een hele dag voor één klus.`
		);
	}

	const productLines: ProductLine[] =
		n > 0
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
		extraPersonFee,
		extraPersonTravelHours: travel.chargedHoursPerPerson,
		travel,
		config,
		reliefOverride: input.smallOrderReliefOverride,
		warnings,
		variant,
		fruitCostPerPortion: variant === 'millefeuille-taart' ? fruitCost : undefined
	});
}

export interface ValidationPoint {
	x: number;
	prepHours: number;
	locationHours: number; // setup + service op locatie
	perPortion: number;
	perHour: number; // blended, inclusief reistijd
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
		const r =
			mode === 'hapjes'
				? calculatePrice({
						tiraPortions: Math.round(n * tiraShare),
						burrPortions: n - Math.round(n * tiraShare),
						extraPeople: 0,
						oneWayKm: 0,
						config
					})
				: calculateSpecialPrice({
						variant: mode,
						portions: n,
						oneWayKm: 0,
						config,
						fruitCostPerPortion
					});
		const i = calculateInternals(r, config);
		out.push({
			x: n,
			prepHours: r.hours.prep,
			locationHours: round2(r.hours.setup + r.hours.service),
			perPortion: r.perPortion,
			perHour: i.blendedRatePerPerson
		});
	}
	return out;
}
