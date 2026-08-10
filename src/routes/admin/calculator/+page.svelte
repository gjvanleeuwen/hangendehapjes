<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import type { BtwRate } from '$lib/admin/types';
	import {
		BURRATA_TOPPINGS,
		DEFAULT_BURRATA_TOPPINGS,
		DEFAULT_CONFIG,
		HOUR_CURVE_KEYS,
		HOUR_CURVE_LABELS,
		HOUR_TIER_POINTS,
		INGREDIENT_COST_PER_PORTION,
		MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION,
		MIN_PORTIONS_PER_PRODUCT,
		PACKAGING_COST_PER_PORTION,
		PRODUCT_LABELS,
		STAGES,
		STAGE_LABELS,
		STAGE_SOURCE,
		VARIANT_LABELS,
		burrataIngredientCost,
		calculateInternals,
		calculatePrice,
		calculateSpecialPrice,
		cloneConfig,
		derivedCostPerKm,
		effectiveCostPerKm,
		effectiveEventBaseFee,
		hourCurveAt,
		smallOrderRelief,
		minPortionsForSpecialVariant,
		specialIngredientCostPerPortion,
		type PricingConfig,
		type SpecialVariant
	} from '$lib/admin/pricing';

	type Mode = 'hapjes' | SpecialVariant;
	const SPECIAL_VARIANTS: SpecialVariant[] = ['tiramisu-taart', 'millefeuille-taart'];

	let mode = $state<Mode>('hapjes');
	let hapjesKind = $state<'tira' | 'burr' | 'mix'>('burr');
	let portions = $state(100); // gedeeld over alle varianten — makkelijk schakelen/vergelijken
	let tiraSharePct = $state(50); // verdeling tiramisu/burrata bij een mix
	let fruitCost = $state(MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION);
	let extraPeople = $state(0);
	// Niet 0: er is geen klus om de hoek. 20 km is een doorsnee rit binnen het Gooi
	// of naar Amsterdam/Utrecht, en zorgt dat het blended uurtarief meteen klopt in
	// plaats van te vleien met reistijd die er niet is.
	let oneWayKm = $state(20);
	// Wachttijd op locatie verschilt per klus, dus per offerte in te vullen.
	let standbyHours = $state(DEFAULT_CONFIG.defaultStandbyHours);
	// Kleine-klus-korting: null = volg de curve, een getal = handmatig voor deze offerte.
	let reliefOverride = $state<number | null>(null);
	let burrToppings = $state<string[]>([...DEFAULT_BURRATA_TOPPINGS]);
	const dealId = page.url.searchParams.get('deal') ?? '';

	// Diep kopiëren: hourlyRates en de urencurves zijn geneste objecten, een
	// shallow spread zou DEFAULT_CONFIG zelf laten muteren.
	const config = $state<PricingConfig>(cloneConfig(DEFAULT_CONFIG));

	const isSpecial = $derived(mode !== 'hapjes');
	const isMix = $derived(mode === 'hapjes' && hapjesKind === 'mix');
	const burrCostPerPortion = $derived(burrataIngredientCost(burrToppings));

	// Hapjes-verdeling afgeleid van het gedeelde aantal porties.
	const tiraPortions = $derived(
		mode !== 'hapjes'
			? 0
			: hapjesKind === 'tira'
				? portions
				: hapjesKind === 'mix'
					? Math.round((portions * tiraSharePct) / 100)
					: 0
	);
	const burrPortions = $derived(
		mode !== 'hapjes'
			? 0
			: hapjesKind === 'burr'
				? portions
				: hapjesKind === 'mix'
					? portions - Math.round((portions * tiraSharePct) / 100)
					: 0
	);

	function toggleTopping(key: string) {
		burrToppings = burrToppings.includes(key)
			? burrToppings.filter((k) => k !== key)
			: [...burrToppings, key];
	}

	const result = $derived(
		mode !== 'hapjes'
			? calculateSpecialPrice({
					variant: mode,
					portions,
					oneWayKm,
					config: $state.snapshot(config),
					fruitCostPerPortion: fruitCost,
					standbyHours,
					smallOrderReliefOverride: reliefOverride ?? undefined
				})
			: calculatePrice({
					tiraPortions,
					burrPortions,
					extraPeople,
					oneWayKm,
					config: $state.snapshot(config),
					burrataIngredientCost: burrCostPerPortion,
					standbyHours,
					smallOrderReliefOverride: reliefOverride ?? undefined
				})
	);

	// Uren en materiaal zitten nu in het prijsresultaat zelf — internals rekent
	// alleen de controlegetallen terug (gerealiseerd arbeids- en reistarief).
	const internals = $derived(calculateInternals(result, $state.snapshot(config)));

	function fmtHours(h: number): string {
		return h.toFixed(2).replace('.', ',') + 'u';
	}

	function round2(n: number): number {
		return Math.round(n * 100) / 100;
	}

	const totalPortions = $derived(portions);
	// Wat de curve zelf zou voorstellen, als ijkpunt naast een handmatige korting.
	const curveRelief = $derived(smallOrderRelief(totalPortions, $state.snapshot(config)));

	// Materiaal uitgesplitst naar de posten waar het vandaan komt. De laatste regel
	// vangt het afrondingsverschil op, zodat de kolom exact optelt tot materialsFee.
	const materialLines = $derived.by(() => {
		if (result.totalPortions <= 0) return [];
		const mk = config.materialsMarkup;
		const lines: { label: string; amount: number }[] = [];
		if (isSpecial) {
			const per = specialIngredientCostPerPortion(mode as SpecialVariant, fruitCost);
			const fruit = mode === 'millefeuille-taart' ? ` (waarvan ${formatEUR(fruitCost)} fruit)` : '';
			lines.push({
				label: `Ingrediënten — ${result.totalPortions} × ${formatEUR(per)}${fruit}`,
				amount: round2(result.materials.ingredients * mk)
			});
			lines.push({
				label: `Cakeboards — ${formatEUR(config.cakeboardPrice)} per ${config.cakeboardPerPersons} pers.`,
				amount: 0
			});
		} else {
			if (tiraPortions > 0)
				lines.push({
					label: `Ingrediënten tiramisu — ${tiraPortions} × ${formatEUR(INGREDIENT_COST_PER_PORTION.tiramisu)}`,
					amount: round2(result.materials.ingredientsTira * mk)
				});
			if (burrPortions > 0)
				lines.push({
					label: `Ingrediënten burrata — ${burrPortions} × ${formatEUR(burrCostPerPortion)} (${burrToppings.length} toppings)`,
					amount: round2(result.materials.ingredientsBurr * mk)
				});
			lines.push({
				label: `Verpakking — ${result.totalPortions} × ${formatEUR(PACKAGING_COST_PER_PORTION)}`,
				amount: 0
			});
		}
		const others = lines.slice(0, -1).reduce((s, l) => s + l.amount, 0);
		lines[lines.length - 1].amount = round2(result.materialsFee - others);
		return lines;
	});
	// Wat je feitelijk op locatie bent: opbouwen + werken + wachten (mensuren).
	const onLocationHours = $derived(
		round2(result.hours.setup + result.hours.service + result.hours.standby)
	);

	// Alles in het model rekent excl. btw. Catering valt in NL onder het lage
	// tarief, dus 9% is de normale stand — dit is puur de weergave van wat de
	// klant uiteindelijk op de offerte ziet staan.
	let btwPercent = $state<0 | 9 | 21>(9);
	const btwAmount = $derived(round2((result.total * btwPercent) / 100));
	const totalIncl = $derived(round2(result.total + btwAmount));
	const perPortionIncl = $derived(totalPortions > 0 ? round2(totalIncl / totalPortions) : 0);

	// Wijkt de opbrengst af van wat de fase-tarieven voorschrijven? Kortingen die we
	// bewust geven verklaren dat gat, dus die tellen we terug. Wat dan nog overblijft
	// hoort 0 te zijn; is het dat niet, dan lekt er ergens geld weg.
	const unexplainedGap = $derived(
		round2(
			internals.labourGap + result.smallOrderRelief + result.mixDeduction + result.volumeDiscount
		)
	);
	const rateDrift = $derived(Math.abs(unexplainedGap) > 0.5);
	// Dekt de reisopbrengst (basisbedrag + km-vergoeding, min benzine) de reisuren
	// tegen het ingestelde reistarief? Zo niet, dan drukt dat het blended tarief.
	const travelDrift = $derived(result.hours.travel > 0 && internals.travelGap < -1);
	const kmDrift = $derived(
		!config.autoCostPerKm && Math.abs(derivedCostPerKm(config) - config.costPerKm) > 0.1
	);
	// Hoe zwaar weegt de reis in het totaal? Onder de 10% verdwijnt hij in de
	// productregels (all-in prijs), daarboven verklaart een losse regel hem beter
	// dan een portieprijs die ineens nergens op slaat.
	const travelSharePct = $derived(result.total > 0 ? (result.travelFee / result.total) * 100 : 0);
	// Productkeuze in twee stappen: eerst de categorie, dan de variant daarbinnen.
	type Category = 'hapjes' | 'taart';
	type Choice = 'tira' | 'burr' | 'mix' | SpecialVariant;

	const CHOICES: Record<Category, { value: Choice; label: string }[]> = {
		hapjes: [
			{ value: 'tira', label: 'Alleen tiramisu' },
			{ value: 'burr', label: 'Alleen burrata' },
			{ value: 'mix', label: 'Mix tiramisu + burrata' }
		],
		taart: SPECIAL_VARIANTS.map((v) => ({ value: v, label: VARIANT_LABELS[v] }))
	};

	const category = $derived<Category>(isSpecial ? 'taart' : 'hapjes');
	const choice = $derived<Choice>(mode === 'hapjes' ? hapjesKind : mode);

	function setChoice(v: Choice) {
		if (v === 'tira' || v === 'burr' || v === 'mix') {
			mode = 'hapjes';
			hapjesKind = v;
		} else {
			mode = v;
		}
	}

	// Wisselen van categorie valt terug op de eerste variant daarbinnen, tenzij we
	// er al een hadden gekozen — dan houden we die vast.
	function setCategory(cat: Category) {
		if (cat === category) return;
		setChoice(cat === 'hapjes' ? hapjesKind : SPECIAL_VARIANTS[0]);
	}

	function useInOfferte() {
		if (totalPortions === 0 || result.warnings.length > 0) return;

		const toppingLabels = BURRATA_TOPPINGS.filter((t) => burrToppings.includes(t.key)).map(
			(t) => t.label
		);
		const burrSuffix = toppingLabels.length ? ` met ${toppingLabels.join(', ')}` : '';

		const description = isSpecial
			? `${VARIANT_LABELS[mode as SpecialVariant]} (${portions} personen)`
			: isMix
				? `Hangende Hapjes (${totalPortions} personen) — tiramisu + burrata${burrSuffix}`
				: tiraPortions > 0
					? `Hangende Hapjes (${tiraPortions} personen) — tiramisu`
					: `Hangende Hapjes (${burrPortions} personen) — burrata${burrSuffix}`;

		const payload = {
			description,
			qty: 1,
			unitPrice: result.total,
			// unitPrice is excl. btw; het gekozen tarief gaat mee zodat de offerte
			// dezelfde stickerprijs laat zien als de calculator. Zet op 0% als we
			// (nog) geen btw in rekening brengen.
			btwRate: btwPercent as BtwRate,
			costs: internals.costs.total,
			timeSpent: {
				voorbereiding: result.hours.prep,
				reizen: result.hours.travel,
				event: round2(result.hours.setup + result.hours.service + result.hours.standby),
				afhandeling: result.hours.cleanup
			}
		};
		try {
			sessionStorage.setItem('hh_calculator_prefill', JSON.stringify(payload));
		} catch {
			// ignore
		}
		goto(`/admin/document?kind=offerte&from=calc${dealId ? `&deal=${dealId}` : ''}`);
	}
</script>

<svelte:head>
	<title>Calculator — admin</title>
</svelte:head>

<div class="space-y-8">
	<div class="space-y-2">
		<h1 class="font-heading text-2xl">Calculator</h1>
		<p class="text-sm text-muted-foreground">
			Bereken een offerteprijs op basis van porties, mix en extra personen.
		</p>
		{#if dealId}
			<p class="text-xs text-muted-foreground">
				Gekoppeld aan aanvraag. Gebruik “Gebruik in offerte” om prijs, kosten en uren door te
				zetten.
			</p>
		{/if}
		<details class="text-xs text-muted-foreground">
			<summary class="cursor-pointer hover:text-foreground">Hoe werkt de prijsopbouw?</summary>
			<div class="mt-2 space-y-1.5 leading-relaxed">
				<p>
					<strong>Uren zijn de bron.</strong> De prijs is geen tabel meer maar een optelsom over vijf
					fasen: prep, opbouw, lopen/bouwen, nazorg en reizen. Elke fase heeft een eigen urencurve én
					een eigen uurtarief, allebei instelbaar onder “Uren &amp; tarieven”. Daarbovenop komt de kostprijs
					van het materiaal.
				</p>
				<p>
					<strong>Opbouw op locatie</strong> ({DEFAULT_CONFIG.setupHours
						.toString()
						.replace('.', ',')}u per persoon) is nieuw. Aankomen, uitpakken, opbouwen en weer
					inpakken kost evenveel tijd bij 50 als bij 400 porties, en werd voorheen helemaal niet
					gerekend. Dat drukte vooral op kleine klussen.
				</p>
				<p>
					<strong>Reis: vrije straal, daarboven per km.</strong> Voorheen zat er een vaste 1,5u
					rijtijd in het basistarief, ongeacht afstand. Nu zit er een basisbedrag van €{DEFAULT_CONFIG.eventBaseFee}
					per klus in de prijs dat de eerste {DEFAULT_CONFIG.freeRoundTripKm} retour-km betaalt ({DEFAULT_CONFIG.freeRoundTripKm /
						2} km enkele reis, dus het hele Gooi, Amsterdam, Utrecht, Amersfoort en Almere). Daarboven
					telt €{DEFAULT_CONFIG.costPerKm.toFixed(2).replace('.', ',')} per retour-km, wat zowel de auto
					(€{DEFAULT_CONFIG.vehicleCostPerKm.toFixed(2).replace('.', ',')}/km) als de rijtijd (€{DEFAULT_CONFIG
						.hourlyRates.travel}/u bij {DEFAULT_CONFIG.travelSpeedKmh} km/u) dekt.
				</p>
				<p>
					Binnen de straal noemen we dus altijd één all-in prijs. Aan de rand ervan leggen we een
					euro of 24 toe; dat is de prijs van die belofte en is bewust zo gekozen. Ver weg betaalt
					zichzelf: 250 km enkele reis levert een reisregel van ruim €500 op in plaats van de €90
					die de oude regeling opleverde.
				</p>
				<p>
					<strong>Mix (twee soorten)</strong> deelt automatisch de opbouw, de reis en de nazorg — dat
					is één event, dus dat rekenen we één keer. De losse mix-aftrek staat daarom standaard op 0.
				</p>
				<p>
					<strong>Extra persoon</strong> wordt verplicht vanaf {DEFAULT_CONFIG.mandatoryExtraPersonAt}
					porties (één persoon kan niet meer dan ±2u lopen). Kost alleen zijn eigen opbouw en eigen reistijd
					— prep, lopen en nazorg zijn totaal werk dat verdeeld wordt, dus niet dubbel.
				</p>
				<p>
					<strong>Volumekorting</strong> (uit in standaard, 0%) trekt een percentage van het eten + service
					af zodra het totaal de drempel haalt. Reis- en extra-persoonskosten blijven buiten de korting,
					want dat zijn echte kosten. Stel in onder de aannames.
				</p>
			</div>
		</details>
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_minmax(0,560px)]">
		<!-- Inputs -->
		<section class="space-y-6">
			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Wat &amp; hoeveel</legend>

				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => setCategory('hapjes')}
						class="border px-3 py-2 text-sm transition {category === 'hapjes'
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						Hangende hapjes
					</button>
					<button
						type="button"
						onclick={() => setCategory('taart')}
						class="border px-3 py-2 text-sm transition {category === 'taart'
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						Bruidstaart
					</button>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="choice">Variant</Label>
						<select
							id="choice"
							value={choice}
							onchange={(e) => setChoice(e.currentTarget.value as Choice)}
							class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						>
							{#each CHOICES[category] as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="space-y-1.5">
						<Label for="portions">Porties (personen)</Label>
						<Input id="portions" type="number" min="0" step="5" bind:value={portions} />
					</div>
					{#if isMix}
						<div class="space-y-1.5">
							<Label for="tirashare">Aandeel tiramisu (%)</Label>
							<Input
								id="tirashare"
								type="number"
								min="0"
								max="100"
								step="5"
								bind:value={tiraSharePct}
							/>
						</div>
					{/if}
					{#if mode === 'millefeuille-taart'}
						<div class="space-y-1.5">
							<Label for="fruit">Fruitkostprijs per portie (€)</Label>
							<Input id="fruit" type="number" min="0" step="0.05" bind:value={fruitCost} />
						</div>
					{/if}
				</div>

				<p class="text-xs text-muted-foreground">
					Op locatie in totaal <span class="text-foreground tabular-nums"
						>{fmtHours(onLocationHours)}</span
					>
					mensuren: {fmtHours(result.hours.setup)} opbouwen + {fmtHours(result.hours.service)}
					{isSpecial ? 'bouwen' : 'lopen'} + {fmtHours(result.hours.standby)} wachten. De wachttijd stel
					je in bij “Uren &amp; tarieven”: op 0 als je de plaat neerzet en meteen weg bent, hoger als
					je moet blijven tot er aangesneden wordt.
				</p>

				{#if !isSpecial}
					<!-- Alleen bij hapjes: één persoon kan niet uren achter elkaar rondlopen.
					     Een taart bouw je alleen, dus daar speelt dit niet. -->
					<div class="flex flex-wrap items-center gap-2 border-t pt-3">
						<span class="text-sm">Extra persoon</span>
						{#each [0, 1, 2] as n}
							<button
								type="button"
								onclick={() => (extraPeople = n)}
								disabled={n > result.allowedExtraPeople || (n === 0 && result.extraPersonMandatory)}
								class="border px-2.5 py-1 text-sm transition disabled:opacity-30 {result.effectiveExtraPeople ===
								n
									? 'border-primary bg-primary text-primary-foreground'
									: 'hover:bg-muted'}"
							>
								{n === 0 ? 'Geen' : `+${n}`}
							</button>
						{/each}
						<span
							class="text-xs {result.extraPersonMandatory
								? 'text-amber-700'
								: 'text-muted-foreground'}"
						>
							verplicht vanaf {config.mandatoryExtraPersonAt} · +2 vanaf {config.extraPersonMinPortions2}
						</span>
					</div>
				{/if}

				<p class="text-xs text-muted-foreground">
					{#if isMix}
						{tiraPortions} tiramisu + {burrPortions} burrata (min. {MIN_PORTIONS_PER_PRODUCT} per soort)
						· één event, dus opbouw, reis en nazorg tellen één keer.
					{:else if mode === 'millefeuille-taart'}
						Min. {minPortionsForSpecialVariant('millefeuille-taart')} personen · prep-ankers en opbouwtijd
						staan onder “Uren &amp; tarieven”. Fruit drukt op de marge, niet op de prijs.
					{:else if mode === 'tiramisu-taart'}
						Min. {minPortionsForSpecialVariant('tiramisu-taart')} personen · prep = hapjesprep op {config.tiramisuCakePrepFactor}×
						portiegrootte.
					{:else}
						Prep uit de ankers, looptijd uit porties-per-uur.
					{/if}
					{#if result.effectiveExtraPeople > 0}
						Extra persoon kost {formatEUR(result.extraPersonFee / result.effectiveExtraPeople)} p.p. (eigen
						opbouw + eigen reistijd).
					{/if}
				</p>
			</fieldset>

			{#if !isSpecial && burrPortions > 0}
				<fieldset class="space-y-3 border p-4">
					<legend class="px-1 text-sm font-medium">Burrata-toppings</legend>
					<p class="text-xs text-muted-foreground">
						Kies wat er op de burrata komt. Bepaalt de kostprijs per portie en dus jullie marge — de
						klantprijs blijft het tarief uit de tiers.
					</p>
					<div class="flex flex-wrap gap-2">
						{#each BURRATA_TOPPINGS as t (t.key)}
							<button
								type="button"
								onclick={() => toggleTopping(t.key)}
								class="flex items-baseline gap-1.5 border px-3 py-1.5 text-sm transition {burrToppings.includes(
									t.key
								)
									? 'border-primary bg-primary text-primary-foreground'
									: 'hover:bg-muted'}"
							>
								{t.label}
								<span class="text-xs tabular-nums opacity-60">{formatEUR(t.costPerPortion)}</span>
							</button>
						{/each}
					</div>
					<p class="text-xs text-muted-foreground">
						Kostprijs ingrediënten:
						<span class="font-medium text-foreground tabular-nums"
							>{formatEUR(burrCostPerPortion)}</span
						>
						per portie · {burrToppings.length} toppings · +{formatEUR(PACKAGING_COST_PER_PORTION)} verpakking
					</p>
				</fieldset>
			{/if}

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Reisafstand</legend>
				<div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
					<div class="space-y-1.5">
						<Label for="oneway">Enkele reis (km)</Label>
						<Input id="oneway" type="number" min="0" step="1" bind:value={oneWayKm} />
					</div>
					<div class="text-xs text-muted-foreground sm:pb-2">
						Heen + terug: <span class="text-foreground tabular-nums">{result.roundTripKm} km</span>
						{#if result.travelChargedKm > 0}
							· {result.travelChargedKm} km × €{effectiveCostPerKm(config)
								.toFixed(2)
								.replace('.', ',')}
						{:else}
							· binnen vrij gebied
						{/if}
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Reistijd: <span class="text-foreground tabular-nums">{fmtHours(result.hours.travel)}</span
					>
					mensuren ({internals.people}× persoon, {config.travelSpeedKmh} km/u).
					{#if config.freeRoundTripKm > 0}
						Eerste {config.freeRoundTripKm} km retour ({config.freeRoundTripKm / 2} km enkele reis) zit
						in het basisbedrag van €{effectiveEventBaseFee(config).toFixed(2).replace('.', ',')}.
					{/if}
					Daarboven €{effectiveCostPerKm(config).toFixed(2).replace('.', ',')} per retour-km, dat dekt
					auto én rijtijd.
				</p>
				{#if kmDrift}
					<p class="text-xs text-amber-700">
						Let op: uit de aannames volgt €{derivedCostPerKm(config)
							.toFixed(2)
							.replace('.', ',')}/km, ingesteld staat €{effectiveCostPerKm(config)
							.toFixed(2)
							.replace('.', ',')}. Reistijd wordt dan niet volledig gedekt.
					</p>
				{/if}
			</fieldset>
		</section>

		<!-- Output -->
		<section class="space-y-4">
			<div class="border bg-card p-5">
				<div class="text-xs tracking-wide text-muted-foreground uppercase">
					Stickerprijs — wat de klant ziet
				</div>
				<div class="mt-1 font-heading text-4xl tabular-nums">{formatEUR(totalIncl)}</div>
				<div class="mt-1 text-sm text-muted-foreground">
					{formatEUR(perPortionIncl)} per portie · {totalPortions} porties · incl. {btwPercent}% btw
				</div>
				<div class="mt-3 flex items-center gap-2 border-t pt-3 text-sm">
					<span class="text-muted-foreground">Excl. btw</span>
					<span class="tabular-nums">{formatEUR(result.total)}</span>
					<span class="text-muted-foreground">+ btw</span>
					<span class="tabular-nums">{formatEUR(btwAmount)}</span>
					<select
						aria-label="BTW-tarief"
						bind:value={btwPercent}
						class="ml-auto h-8 rounded-md border border-input bg-background px-2 text-xs"
					>
						{#each [0, 9, 21] as r (r)}
							<option value={r}>{r}%</option>
						{/each}
					</select>
				</div>

				<div class="mt-3 border-t pt-3">
					<div class="flex items-center gap-2 text-sm">
						<Label for="reliefnow" class="text-muted-foreground">Kleine-klus-korting</Label>
						<Input
							id="reliefnow"
							type="number"
							min="0"
							step="5"
							class="h-8 w-24 text-right"
							value={result.smallOrderRelief}
							oninput={(e) => {
								const v = e.currentTarget.value;
								reliefOverride = v === '' ? null : Number(v);
							}}
						/>
						{#if reliefOverride !== null}
							<button
								type="button"
								class="text-xs text-muted-foreground underline hover:text-foreground"
								onclick={() => (reliefOverride = null)}
							>
								terug naar curve ({formatEUR(curveRelief)})
							</button>
						{:else}
							<span class="text-xs text-muted-foreground">volgt de curve</span>
						{/if}
					</div>
					<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
						<span>
							<span class="text-muted-foreground">Uurtarief deze offerte</span>
							<span class="font-medium">{formatEUR(internals.blendedRatePerPerson)}/u</span>
						</span>
						<span>
							<span class="text-muted-foreground">Werkuren</span>
							{formatEUR(internals.labourRateRealisedAfterDiscounts)}/u
						</span>
						<span class="text-muted-foreground">
							{fmtHours(internals.hours.total)} mensuren · bruto {formatEUR(internals.grossProfit)}
						</span>
					</div>
				</div>
			</div>

			{#if result.warnings.length > 0}
				<div class="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
					{#each result.warnings as w}
						<div>{w}</div>
					{/each}
				</div>
			{/if}

			<div class="border bg-card p-4 text-sm">
				<div class="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
					Opbouw (intern)
				</div>
				<table class="w-full">
					<tbody>
						{#each result.productLines as line}
							<tr>
								<td class="py-1 font-medium" colspan="2">
									{line.label ?? PRODUCT_LABELS[line.product]} · {line.portions} porties
								</td>
							</tr>
						{/each}
						{#if result.totalPortions > 0}
							<tr>
								<td class="py-1 pl-4 text-muted-foreground">
									Werk — {fmtHours(result.hours.billable - result.extraPersonSetupHours)} over {STAGES.length -
										1} fasen
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.labourFee)}</td>
							</tr>
							<tr>
								<td class="py-1 pl-4 text-muted-foreground" colspan="2">
									Materiaal{config.materialsMarkup !== 1
										? ` (${config.materialsMarkup.toString().replace('.', ',')}× kostprijs)`
										: ' (kostprijs)'} — totaal {formatEUR(result.materialsFee)}
								</td>
							</tr>
							{#each materialLines as m (m.label)}
								<tr>
									<td class="py-1 pl-8 text-xs text-muted-foreground">{m.label}</td>
									<td class="py-1 text-right text-xs text-muted-foreground tabular-nums">
										{formatEUR(m.amount)}
									</td>
								</tr>
							{/each}
							{#if result.baseFee > 0}
								<tr>
									<td class="py-1 pl-4 text-muted-foreground">
										Basisbedrag (dekt de vrije {config.freeRoundTripKm} km retour)
									</td>
									<td class="py-1 text-right tabular-nums">{formatEUR(result.baseFee)}</td>
								</tr>
							{/if}
						{/if}
						{#if result.mixDeduction > 0}
							<tr>
								<td class="py-1 text-muted-foreground">Extra mix-korting (verkoop-dial)</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(result.mixDeduction)}</td>
							</tr>
						{/if}
						{#if result.smallOrderRelief > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Kleine-klus-korting (vol t/m {config.smallOrderReliefFullAt}, weg vanaf {config.smallOrderReliefZeroAt})
								</td>
								<td class="py-1 text-right tabular-nums">
									−{formatEUR(result.smallOrderRelief)}
								</td>
							</tr>
						{/if}
						{#if result.volumeDiscount > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Volumekorting ({result.volumeDiscountPercent.toString().replace('.', ',')}% vanaf {config.volumeDiscountThreshold}
									porties)
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(result.volumeDiscount)}</td>
							</tr>
						{/if}
						{#if result.extraPersonFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Extra persoon ({result.effectiveExtraPeople}×) — {fmtHours(
										result.extraPersonSetupHours
									)} opbouw + {fmtHours(result.extraPersonTravelHours)} reizen
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.extraPersonFee)}</td>
							</tr>
						{/if}
						{#if result.travelFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Reiskosten ({result.travelChargedKm} km retour × €{effectiveCostPerKm(config)
										.toFixed(2)
										.replace('.', ',')})
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.travelFee)}</td>
							</tr>
							<tr>
								<td class="pb-1 pl-4 text-xs text-muted-foreground" colspan="2">
									{#if travelSharePct < 10}
										{travelSharePct.toFixed(0)}% van het totaal — verwerk dit in de productregels,
										geen losse reisregel op de offerte.
									{:else}
										{travelSharePct.toFixed(0)}% van het totaal — zet dit wél als losse regel op de
										offerte, anders lijkt de portieprijs nergens op.
									{/if}
								</td>
							</tr>
						{/if}
						<tr class="border-t">
							<td class="py-2">Subtotaal excl. btw</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(result.total)}</td>
						</tr>
						{#if btwPercent > 0}
							<tr>
								<td class="py-1 text-muted-foreground">BTW {btwPercent}%</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(btwAmount)}</td>
							</tr>
						{/if}
						<tr class="border-t font-medium">
							<td class="py-2">Totaal incl. btw</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(totalIncl)}</td>
						</tr>
						<tr>
							<td class="py-1 text-xs text-muted-foreground">Per portie incl. btw</td>
							<td class="py-1 text-right text-xs text-muted-foreground tabular-nums">
								{formatEUR(perPortionIncl)}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Bottomline / take-home -->
			<div class="border bg-card p-4 text-sm">
				<div class="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
					Onze cijfers (intern)
				</div>
				<table class="w-full">
					<tbody>
						<tr>
							<td class="py-1">Klant betaalt</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(result.total)}</td>
						</tr>
						{#if result.materials.vehicle > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Auto — {result.roundTripKm} km × {formatEUR(config.vehicleCostPerKm)}
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(result.materials.vehicle)}</td>
							</tr>
						{/if}
						{#if isSpecial && mode !== 'hapjes'}
							{#if totalPortions > 0}
								<tr>
									<td class="py-1 text-muted-foreground">
										Ingrediënten — {totalPortions} × {formatEUR(
											specialIngredientCostPerPortion(mode, fruitCost)
										)}
										{#if mode === 'millefeuille-taart'}
											(incl. {formatEUR(fruitCost)} fruit)
										{/if}
									</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(internals.costs.ingredients)}</td
									>
								</tr>
								<tr>
									<td class="py-1 text-muted-foreground">
										Cakeboards — {formatEUR(config.cakeboardPrice)} per {config.cakeboardPerPersons}
										pers.
									</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(internals.costs.packaging)}</td
									>
								</tr>
							{/if}
						{:else}
							{#if tiraPortions > 0}
								<tr>
									<td class="py-1 text-muted-foreground">
										Ingrediënten tiramisu — {tiraPortions} × {formatEUR(
											INGREDIENT_COST_PER_PORTION.tiramisu
										)}
									</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(internals.costs.ingredientsTira)}</td
									>
								</tr>
							{/if}
							{#if burrPortions > 0}
								<tr>
									<td class="py-1 text-muted-foreground">
										Ingrediënten burrata — {burrPortions} × {formatEUR(burrCostPerPortion)}
									</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(internals.costs.ingredientsBurr)}</td
									>
								</tr>
							{/if}
							{#if totalPortions > 0}
								<tr>
									<td class="py-1 text-muted-foreground">
										Verpakking — {totalPortions} × {formatEUR(PACKAGING_COST_PER_PORTION)}
									</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(internals.costs.packaging)}</td
									>
								</tr>
							{/if}
						{/if}
						<tr class="border-t font-medium">
							<td class="py-2">Voor ons (bruto)</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(internals.grossProfit)}</td>
						</tr>
					</tbody>
				</table>

				<div class="mt-3 grid grid-cols-2 gap-3 border-t pt-3">
					<div>
						<div class="text-xs text-muted-foreground">Werkuren totaal (mensuren)</div>
						<div class="font-heading text-2xl tabular-nums">{fmtHours(internals.hours.total)}</div>
						<div class="mt-0.5 text-xs text-muted-foreground">
							{fmtHours(internals.hours.prep)} prep ·
							{fmtHours(internals.hours.setup)} opbouw ·
							{fmtHours(internals.hours.service)}
							{isSpecial ? 'bouwen' : 'lopen'} ·
							{fmtHours(internals.hours.standby)} wachten ·
							{fmtHours(internals.hours.cleanup)} nazorg ·
							{fmtHours(internals.hours.travel)} reizen{#if result.travelChargedKm === 0 && result.roundTripKm > 0}
								(in basisbedrag){/if}
						</div>
					</div>
					<div>
						<div class="text-xs text-muted-foreground">
							Per persoon ({internals.people}× — gemiddeld)
						</div>
						<div class="font-heading text-2xl tabular-nums">
							{formatEUR(internals.grossProfit / internals.people)}
						</div>
						<div class="mt-0.5 text-xs text-muted-foreground">
							~{fmtHours(internals.hours.total / internals.people)} werk ·
							{formatEUR(internals.blendedRatePerPerson)}/uur blended
						</div>
					</div>
				</div>

				<div class="mt-3 border-t pt-3 text-xs">
					<div class="mb-1 text-muted-foreground">Controle: opbrengst versus fase-tarieven</div>
					<div class="space-y-1 tabular-nums">
						<div class={rateDrift ? 'text-amber-700' : 'text-muted-foreground'}>
							Werk levert {formatEUR(internals.labourRevenue)} op, de fase-tarieven vragen
							{formatEUR(internals.labourValue)}
							{#if result.smallOrderRelief > 0 || result.mixDeduction > 0 || result.volumeDiscount > 0}
								· {formatEUR(result.smallOrderRelief + result.mixDeduction + result.volumeDiscount)} bewust
								weggegeven
							{/if}
							{#if rateDrift}
								· onverklaard gat {formatEUR(unexplainedGap)}
							{:else}
								· sluit
							{/if}
						</div>
						{#if result.hours.travel > 0}
							<div class={travelDrift ? 'text-amber-700' : 'text-muted-foreground'}>
								Reis levert {formatEUR(internals.travelMargin)} op na autokosten, de reisuren vragen
								{formatEUR(internals.travelValue)} · feitelijk {formatEUR(
									internals.travelRateRealised
								)}/u
								{#if travelDrift}
									· tekort {formatEUR(internals.travelGap)}
								{:else}
									· sluit
								{/if}
							</div>
						{/if}
					</div>
					{#if result.hours.total > 0}
						<p class="mt-2 text-muted-foreground">
							Blended {formatEUR(internals.blendedRatePerPerson)}/u = (werk {formatEUR(
								internals.labourRevenue
							)} + reismarge {formatEUR(internals.travelMargin)}) ÷ {fmtHours(
								internals.hours.total
							)}. Reisuren tellen mee in het gemiddelde, dus zolang de reis zichzelf niet betaalt
							ligt blended onder je werktarief.
						</p>
					{/if}
					{#if travelDrift}
						<p class="mt-1 text-amber-700">
							De reis dekt zichzelf niet. Bij een reistarief van €{config.hourlyRates.travel} hoort €{derivedCostPerKm(
								config
							)
								.toFixed(2)
								.replace('.', ',')} per retour-km; ingesteld staat €{effectiveCostPerKm(config)
								.toFixed(2)
								.replace('.', ',')}.
							{#if config.freeRoundTripKm > 0}
								Daarnaast dekt het basisbedrag van €{effectiveEventBaseFee(config).toFixed(0)} de vrije
								{config.freeRoundTripKm}
								km retour maar deels: die rit kost alleen al {fmtHours(
									config.freeRoundTripKm / config.travelSpeedKmh
								)} rijtijd.
							{/if}
						</p>
					{/if}
				</div>
			</div>

			{#if dealId}
				<Button
					type="button"
					class="w-full"
					disabled={totalPortions === 0 || result.warnings.length > 0}
					onclick={useInOfferte}
				>
					Gebruik in offerte
				</Button>
			{:else}
				<a
					class="inline-flex h-10 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
					href="/admin/aanvragen?add=1"
				>
					Maak eerst een prospect of open een aanvraag
				</a>
			{/if}
		</section>
	</div>

	<details class="border p-4" open>
		<summary class="cursor-pointer text-sm font-medium">Uren &amp; tarieven</summary>

		<div class="mt-3 grid gap-x-8 gap-y-6 lg:grid-cols-2">
			<div>
				<table class="w-full text-sm">
					<thead class="text-xs text-muted-foreground">
						<tr>
							<th class="pb-1 text-left font-normal">Fase</th>
							<th class="pb-1 pl-2 text-right font-normal">Uren p.p. / totaal</th>
							<th class="w-24 pb-1 text-right font-normal">Tarief €/u</th>
							<th class="pb-1 text-right font-normal">Bedrag</th>
						</tr>
					</thead>
					<tbody>
						{#each internals.stages as s (s.stage)}
							<tr class="border-t">
								<td class="py-1.5">
									<div>{STAGE_LABELS[s.stage]}</div>
									<div class="text-xs text-muted-foreground">{STAGE_SOURCE[s.stage]}</div>
								</td>
								<td class="py-1.5 pl-2 text-right tabular-nums">
									{#if s.stage === 'standby'}
										<Input
											type="number"
											min="0"
											step="0.25"
											class="h-8 w-20 text-right"
											aria-label="Wachttijd per persoon"
											bind:value={standbyHours}
										/>
									{:else if s.stage === 'setup'}
										<Input
											type="number"
											min="0"
											step="0.25"
											class="h-8 w-20 text-right"
											aria-label="Opbouw per persoon"
											bind:value={config.setupHours}
										/>
									{:else}
										{fmtHours(s.hours)}
									{/if}
								</td>
								<td class="py-1.5 pl-2">
									<Input
										type="number"
										min="0"
										step="5"
										class="h-8 text-right"
										aria-label="Tarief {STAGE_LABELS[s.stage]}"
										bind:value={config.hourlyRates[s.stage]}
									/>
								</td>
								<td class="py-1.5 text-right tabular-nums">{formatEUR(s.amount)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="mt-2 text-xs text-muted-foreground">
					Opbouw en wachttijd vul je hier in (uren per persoon); de rest volgt uit de urenmatrix
					rechts. Opbouw is een vaste aanname per klus, wachttijd zet je per offerte. Bij {internals.people}
					persoon{internals.people > 1 ? 'en' : ''} telt dat {fmtHours(result.hours.standby)} mensuren.
				</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Reizen loopt via de km-prijs, niet via deze regel — het bedrag hier is wat de reisuren
					waard zouden moeten zijn.
					{#if result.travelChargedKm === 0 && result.roundTripKm > 0}
						Deze rit valt binnen de vrije straal, dus de klant betaalt hem via het basisbedrag van €{effectiveEventBaseFee(
							config
						)
							.toFixed(2)
							.replace('.', ',')}.
					{/if}
					Zie de controle bij “Onze cijfers” of dat klopt.
				</p>
			</div>

			<div>
				<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Urenmatrix — uren per curve, per aantal porties
				</div>
				<table class="w-full text-sm">
					<thead class="text-xs text-muted-foreground">
						<tr>
							<th class="pb-1 text-left font-normal">Curve</th>
							{#each HOUR_TIER_POINTS as pt (pt)}
								<th class="pb-1 text-right font-normal">@{pt}</th>
							{/each}
							<th class="pb-1 pl-2 text-right font-normal">nu</th>
						</tr>
					</thead>
					<tbody>
						{#each HOUR_CURVE_KEYS as key (key)}
							<tr class="border-t">
								<td class="py-1 pr-2 text-xs">{HOUR_CURVE_LABELS[key]}</td>
								{#each HOUR_TIER_POINTS as pt (pt)}
									<td class="py-1 pl-1">
										<Input
											type="number"
											min="0"
											step="0.25"
											class="h-8 text-right"
											aria-label="{HOUR_CURVE_LABELS[key]} bij {pt} porties"
											bind:value={config.hourCurves[key][pt]}
										/>
									</td>
								{/each}
								<td class="py-1 pl-2 text-right text-xs text-muted-foreground tabular-nums">
									{fmtHours(hourCurveAt(config, key, totalPortions))}
								</td>
							</tr>
						{/each}
						<tr class="border-t text-muted-foreground">
							<td class="py-1 pr-2 text-xs italic">
								Prep tiramisu-taart
								<span class="not-italic">({config.tiramisuCakePrepFactor}× portiegrootte)</span>
							</td>
							{#each HOUR_TIER_POINTS as pt (pt)}
								<td class="py-1 pl-1 text-right text-xs tabular-nums">
									{fmtHours(
										hourCurveAt(config, 'prepTiramisu', pt * config.tiramisuCakePrepFactor)
									)}
								</td>
							{/each}
							<td class="py-1 pl-2 text-right text-xs tabular-nums">
								{fmtHours(
									hourCurveAt(config, 'prepTiramisu', totalPortions * config.tiramisuCakePrepFactor)
								)}
							</td>
						</tr>
						<tr class="text-muted-foreground">
							<td class="py-1 pr-2 text-xs italic">
								Lopen hapjes
								<span class="not-italic">({config.portionsPerHour}/uur)</span>
							</td>
							{#each HOUR_TIER_POINTS as pt (pt)}
								<td class="py-1 pl-1 text-right text-xs tabular-nums">
									{fmtHours(config.portionsPerHour > 0 ? pt / config.portionsPerHour : 0)}
								</td>
							{/each}
							<td class="py-1 pl-2 text-right text-xs tabular-nums">
								{fmtHours(config.portionsPerHour > 0 ? totalPortions / config.portionsPerHour : 0)}
							</td>
						</tr>
					</tbody>
				</table>
				<p class="mt-2 text-xs text-muted-foreground">
					Daartussen lineair, onder 25 vlak, boven 400 doorgetrokken op de 200→400 helling. De
					laatste kolom is deze offerte ({totalPortions} porties). De twee cursieve rijen zijn afgeleid,
					niet instelbaar: de taart-prep volgt de tiramisu-curve en het lopen volgt porties-per-uur.
				</p>
			</div>

			<div class="lg:col-span-2">
				<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Overige aannames
				</div>
				<div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
					<div class="space-y-1.5">
						<Label for="pph2">Porties per uur (lopen)</Label>
						<Input id="pph2" type="number" min="1" step="5" bind:value={config.portionsPerHour} />
					</div>
					<div class="space-y-1.5">
						<Label for="cakeprepfactor">Taart-prep factor (×)</Label>
						<Input
							id="cakeprepfactor"
							type="number"
							min="0.5"
							step="0.05"
							bind:value={config.tiramisuCakePrepFactor}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="travelspeed">Gem. snelheid (km/u)</Label>
						<Input
							id="travelspeed"
							type="number"
							min="1"
							step="5"
							bind:value={config.travelSpeedKmh}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="vehiclekm">Autokosten per km (€)</Label>
						<Input
							id="vehiclekm"
							type="number"
							min="0"
							step="0.01"
							bind:value={config.vehicleCostPerKm}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="matmarkup">Materiaal-markup (×)</Label>
						<Input
							id="matmarkup"
							type="number"
							min="1"
							step="0.05"
							bind:value={config.materialsMarkup}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="mixded">Mix gedeelde aftrek (€)</Label>
						<Input
							id="mixded"
							type="number"
							min="0"
							step="5"
							bind:value={config.mixSharedDeduction}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="epmand">2e persoon verplicht vanaf (porties)</Label>
						<Input
							id="epmand"
							type="number"
							min="0"
							step="5"
							bind:value={config.mandatoryExtraPersonAt}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="epfactor">2e persoon doorbelasten (×)</Label>
						<Input
							id="epfactor"
							type="number"
							min="0"
							max="1"
							step="0.05"
							bind:value={config.extraPersonChargeFactor}
						/>
						<p class="text-xs text-muted-foreground">
							Onder 1 leg je bewust toe; vlakt de stap in de portieprijs af.
						</p>
					</div>
					<div class="space-y-1.5">
						<Label for="epmax2">+2 toegestaan vanaf (porties)</Label>
						<Input
							id="epmax2"
							type="number"
							min="0"
							step="5"
							bind:value={config.extraPersonMinPortions2}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="freekm">Vrije retour-km</Label>
						<Input id="freekm" type="number" min="0" step="1" bind:value={config.freeRoundTripKm} />
						<p class="text-xs text-muted-foreground">
							= {(config.freeRoundTripKm / 2).toFixed(0)} km enkele reis
						</p>
					</div>
					<div class="space-y-1.5">
						<Label for="kmcost">Prijs per retour-km (€)</Label>
						<Input
							id="kmcost"
							type="number"
							min="0"
							step="0.01"
							disabled={config.autoCostPerKm}
							value={effectiveCostPerKm(config)}
							oninput={(e) => (config.costPerKm = Number(e.currentTarget.value))}
						/>
						<label class="flex items-center gap-1.5 text-xs text-muted-foreground">
							<input type="checkbox" bind:checked={config.autoCostPerKm} />
							volg reistarief (€{derivedCostPerKm(config).toFixed(2).replace('.', ',')})
						</label>
					</div>
					<div class="space-y-1.5">
						<Label for="basefee">Basisbedrag per klus (€)</Label>
						<Input
							id="basefee"
							type="number"
							min="0"
							step="5"
							disabled={config.autoEventBaseFee}
							value={effectiveEventBaseFee(config)}
							oninput={(e) => (config.eventBaseFee = Number(e.currentTarget.value))}
						/>
						<label class="flex items-center gap-1.5 text-xs text-muted-foreground">
							<input type="checkbox" bind:checked={config.autoEventBaseFee} />
							dekt de vrije straal precies
						</label>
					</div>
					<div class="space-y-1.5">
						<Label for="voldisc">Volumekorting (%)</Label>
						<Input
							id="voldisc"
							type="number"
							min="0"
							max="100"
							step="1"
							bind:value={config.volumeDiscountPercent}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="voldiscthr">Volumekorting vanaf (porties)</Label>
						<Input
							id="voldiscthr"
							type="number"
							min="0"
							step="50"
							bind:value={config.volumeDiscountThreshold}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="relmax">Kleine-klus-korting (€)</Label>
						<Input
							id="relmax"
							type="number"
							min="0"
							step="5"
							bind:value={config.smallOrderReliefMax}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="relfull">Volle korting t/m (porties)</Label>
						<Input
							id="relfull"
							type="number"
							min="0"
							step="5"
							bind:value={config.smallOrderReliefFullAt}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="relzero">Korting weg vanaf (porties)</Label>
						<Input
							id="relzero"
							type="number"
							min="0"
							step="5"
							bind:value={config.smallOrderReliefZeroAt}
						/>
					</div>
				</div>
				<p class="mt-3 text-xs text-muted-foreground">
					Duwt iemand op de prijs? Geef er dan liever iets bij dan eraf. Extra porties, een smaak
					afgestemd op hun thema, of een schaaltje voor het bruidspaar later op de avond kosten ons
					bijna niks en voelen als winst. Korting leert een klant alleen dat de prijs zacht is.
				</p>

				<div class="mt-4 mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Cakeboards
				</div>
				<div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
					<div class="space-y-1.5">
						<Label for="cbprice">Cakeboard prijs (€)</Label>
						<Input
							id="cbprice"
							type="number"
							min="0"
							step="0.25"
							bind:value={config.cakeboardPrice}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="cbper">Cakeboard per (personen)</Label>
						<Input
							id="cbper"
							type="number"
							min="1"
							step="1"
							bind:value={config.cakeboardPerPersons}
						/>
					</div>
				</div>
			</div>
		</div>
	</details>
</div>
