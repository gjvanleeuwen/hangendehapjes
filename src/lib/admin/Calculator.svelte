<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import type { BtwRate } from '$lib/admin/types';
	import CalculatorSettings from '$lib/admin/CalculatorSettings.svelte';
	import {
		BURRATA_TOPPINGS,
		DEFAULT_BURRATA_TOPPINGS,
		DEFAULT_CONFIG,
		INGREDIENT_COST_PER_PORTION,
		MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION,
		MIN_PORTIONS_PER_PRODUCT,
		PACKAGING_COST_PER_PORTION,
		PRODUCT_LABELS,
		VARIANT_LABELS,
		burrataIngredientCost,
		calculateInternals,
		calculatePrice,
		calculateSpecialPrice,
		clampKmPrice,
		cloneConfig,
		minPortionsForSpecialVariant,
		smallOrderRelief,
		specialIngredientCostPerPortion,
		type PricingConfig,
		type SpecialVariant
	} from '$lib/admin/pricing';

	type Mode = 'hapjes' | SpecialVariant;
	const SPECIAL_VARIANTS: SpecialVariant[] = ['tiramisu-taart', 'millefeuille-taart'];

	let mode = $state<Mode>('hapjes');
	let hapjesKind = $state<'tira' | 'burr' | 'mix'>('burr');
	let portions = $state(100);
	let tiraSharePct = $state(50);
	let fruitCost = $state(MILLEFEUILLE_DEFAULT_FRUIT_COST_PER_PORTION);
	let extraPeople = $state(0);
	let oneWayKm = $state(20);
	let standbyHours = $state(DEFAULT_CONFIG.defaultStandbyHours);
	// Kleine-klus-korting: null = volg de curve, een getal = handmatig voor deze offerte.
	let reliefOverride = $state<number | null>(null);
	let burrToppings = $state<string[]>([...DEFAULT_BURRATA_TOPPINGS]);
	// Set when the calculator runs inside an aanvraag; empty for the general one.
	let { dealId = '' }: { dealId?: string } = $props();

	// Diep kopiëren: hourlyRates en de urencurves zijn geneste objecten.
	let config = $state<PricingConfig>(cloneConfig(DEFAULT_CONFIG));
	// Per klant te kiezen, binnen de bandbreedte uit de aannames.
	let kmPrice = $state(DEFAULT_CONFIG.kmPriceDefault);

	const isSpecial = $derived(mode !== 'hapjes');
	const isMix = $derived(mode === 'hapjes' && hapjesKind === 'mix');
	const burrCostPerPortion = $derived(burrataIngredientCost(burrToppings));

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
					smallOrderReliefOverride: reliefOverride ?? undefined,
					kmPrice
				})
			: calculatePrice({
					tiraPortions,
					burrPortions,
					extraPeople,
					oneWayKm,
					config: $state.snapshot(config),
					burrataIngredientCost: burrCostPerPortion,
					standbyHours,
					smallOrderReliefOverride: reliefOverride ?? undefined,
					kmPrice
				})
	);

	const internals = $derived(calculateInternals(result, $state.snapshot(config)));

	const fmtHours = (h: number) => h.toFixed(2).replace('.', ',') + 'u';
	const round2 = (n: number) => Math.round(n * 100) / 100;
	const eur2 = (n: number) => n.toFixed(2).replace('.', ',');

	const curveRelief = $derived(smallOrderRelief(portions, $state.snapshot(config)));

	// Alles in het model rekent excl. btw; 9% is de normale stand voor catering.
	let btwPercent = $state<0 | 9 | 21>(9);
	const btwAmount = $derived(round2((result.total * btwPercent) / 100));
	const totalIncl = $derived(round2(result.total + btwAmount));
	const perPortionIncl = $derived(portions > 0 ? round2(totalIncl / portions) : 0);
	const productIncl = $derived(round2(result.productTotal * (1 + btwPercent / 100)));
	const travelIncl = $derived(round2(totalIncl - productIncl));

	const KM_PRESETS = [0.45, 0.55, 0.65, 0.75, 0.85];
	const usedKmPrice = $derived(clampKmPrice(kmPrice, config));

	// Wijkt de opbrengst af van wat de fase-tarieven voorschrijven? Bewuste kortingen
	// verklaren dat gat; wat dan nog overblijft hoort 0 te zijn.
	const unexplainedGap = $derived(
		round2(
			internals.labourGap + result.smallOrderRelief + result.mixDeduction + result.volumeDiscount
		)
	);
	const rateDrift = $derived(Math.abs(unexplainedGap) > 0.5);
	const travelBelowBenchmark = $derived(
		result.hours.travel > 0 && internals.travelRateRealised < config.hourlyRates.travel
	);

	const productDescription = $derived.by(() => {
		const toppingLabels = BURRATA_TOPPINGS.filter((t) => burrToppings.includes(t.key)).map(
			(t) => t.label
		);
		const burrSuffix = toppingLabels.length ? ` met ${toppingLabels.join(', ')}` : '';
		if (isSpecial) return `${VARIANT_LABELS[mode as SpecialVariant]} (${portions} personen)`;
		if (isMix) return `Hangende Hapjes (${portions} personen), tiramisu + burrata${burrSuffix}`;
		if (tiraPortions > 0) return `Hangende Hapjes (${tiraPortions} personen), tiramisu`;
		return `Hangende Hapjes (${burrPortions} personen), burrata${burrSuffix}`;
	});

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

	function setCategory(cat: Category) {
		if (cat === category) return;
		setChoice(cat === 'hapjes' ? hapjesKind : SPECIAL_VARIANTS[0]);
	}

	function useInOfferte() {
		if (portions === 0 || result.warnings.length > 0) return;

		// unitPrice is excl. btw; het gekozen tarief gaat mee. Reiskosten volgen
		// de hoofdprestatie, dus hetzelfde btw-tarief als het eten.
		const btwRate = btwPercent as BtwRate;
		const lineItems = [
			{ description: productDescription, qty: 1, unitPrice: result.productTotal, btwRate }
		];
		if (result.travelFee > 0) {
			lineItems.push({
				description: `Reiskosten (${result.chargedKm} km retour boven de ${config.freeRoundTripKm} inbegrepen km, à € ${eur2(result.kmPrice)})`,
				qty: result.chargedKm,
				unitPrice: result.kmPrice,
				btwRate
			});
		}

		const payload = {
			lineItems,
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
		goto(`/admin/aanvragen/${dealId}/document?kind=offerte&from=calc`);
	}

	const toggleClass = (on: boolean) =>
		`border px-3 py-1.5 text-sm transition ${on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'}`;
</script>

<div class="space-y-6">
	{#if !dealId}
		<!-- Inside an aanvraag the deal header already says where you are. -->
		<h1 class="font-heading text-2xl">Calculator</h1>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[1fr_minmax(0,460px)]">
		<!-- Inputs -->
		<section class="space-y-4">
			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Wat &amp; hoeveel</legend>
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => setCategory('hapjes')}
						class={toggleClass(category === 'hapjes')}
					>
						Hangende hapjes
					</button>
					<button
						type="button"
						onclick={() => setCategory('taart')}
						class={toggleClass(category === 'taart')}
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
							class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
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
							<p class="text-xs text-muted-foreground">
								{tiraPortions} tiramisu + {burrPortions} burrata, min. {MIN_PORTIONS_PER_PRODUCT} per
								soort.
							</p>
						</div>
					{/if}
					{#if mode === 'millefeuille-taart'}
						<div class="space-y-1.5">
							<Label for="fruit">Fruitkostprijs per portie (€)</Label>
							<Input id="fruit" type="number" min="0" step="0.05" bind:value={fruitCost} />
							<p class="text-xs text-muted-foreground">
								Min. {minPortionsForSpecialVariant('millefeuille-taart')} personen.
							</p>
						</div>
					{/if}
					<div class="space-y-1.5">
						<Label for="standby">Wachten op locatie (u p.p.)</Label>
						<Input id="standby" type="number" min="0" step="0.25" bind:value={standbyHours} />
					</div>
				</div>

				{#if !isSpecial}
					<div class="flex flex-wrap items-center gap-2 border-t pt-3">
						<span class="text-sm">Extra persoon</span>
						{#each [0, 1, 2] as n (n)}
							<button
								type="button"
								onclick={() => (extraPeople = n)}
								disabled={n > result.allowedExtraPeople || (n === 0 && result.extraPersonMandatory)}
								class="disabled:opacity-30 {toggleClass(result.effectiveExtraPeople === n)}"
							>
								{n === 0 ? 'Geen' : `+${n}`}
							</button>
						{/each}
						<span
							class="text-xs {result.extraPersonMandatory
								? 'text-amber-700'
								: 'text-muted-foreground'}"
						>
							verplicht vanaf {config.mandatoryExtraPersonAt}
						</span>
					</div>
				{/if}
			</fieldset>

			{#if !isSpecial && burrPortions > 0}
				<fieldset class="space-y-2 border p-4">
					<legend class="px-1 text-sm font-medium">
						Burrata-toppings · {formatEUR(burrCostPerPortion)} kostprijs p.p.
					</legend>
					<div class="flex flex-wrap gap-2">
						{#each BURRATA_TOPPINGS as t (t.key)}
							<button
								type="button"
								onclick={() => toggleTopping(t.key)}
								class={toggleClass(burrToppings.includes(t.key))}
							>
								{t.label}
								<span class="text-xs tabular-nums opacity-60">{formatEUR(t.costPerPortion)}</span>
							</button>
						{/each}
					</div>
				</fieldset>
			{/if}

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Reis</legend>
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="oneway">Enkele reis (km)</Label>
						<Input id="oneway" type="number" min="0" step="1" bind:value={oneWayKm} />
						<p class="text-xs text-muted-foreground">
							{result.roundTripKm} km retour · {fmtHours(result.hours.travel / internals.people)} rijden
						</p>
					</div>
					<div class="space-y-1.5">
						<Label for="kmprice">Prijs per km (€)</Label>
						<Input
							id="kmprice"
							type="number"
							min={config.kmPriceMin}
							max={config.kmPriceMax}
							step="0.05"
							bind:value={kmPrice}
						/>
						<div class="flex flex-wrap gap-1">
							{#each KM_PRESETS as p (p)}
								<button
									type="button"
									class="rounded border px-1.5 py-0.5 text-xs {usedKmPrice === p
										? 'border-primary bg-primary text-primary-foreground'
										: 'hover:bg-muted'}"
									onclick={() => (kmPrice = p)}
								>
									{eur2(p)}
								</button>
							{/each}
						</div>
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Eerste {config.freeRoundTripKm} km retour ({config.freeRoundTripKm / 2} km enkele reis) zijn
					inbegrepen: {formatEUR(result.baseFee)} zit in de productprijs, op elke offerte.
					{#if result.chargedKm > 0}
						Daarboven {result.chargedKm} km × {formatEUR(result.kmPrice)} als losse regel.
					{:else}
						Deze rit valt erbinnen, dus geen reiskostenregel.
					{/if}
				</p>
				{#if result.roundTripKm > 0}
					<p class="text-sm">
						Reis levert {formatEUR(result.baseFee + result.travelFee)} op excl. btw. Na
						{formatEUR(result.materials.vehicle)} autokosten verdien je
						<strong class="tabular-nums">{formatEUR(internals.travelRateRealised)}/u</strong>
						rijden{internals.people > 1 ? ` (gedeeld over ${internals.people} personen)` : ''}.
						{#if travelBelowBenchmark}
							<span class="text-amber-700">
								Onder je ijkpunt van {formatEUR(config.hourlyRates.travel)}/u.
							</span>
						{/if}
					</p>
				{/if}
				{#if usedKmPrice !== kmPrice}
					<p class="text-xs text-amber-700">
						Buiten de bandbreedte: we rekenen met {formatEUR(usedKmPrice)}.
					</p>
				{/if}
			</fieldset>
		</section>

		<!-- Result -->
		<section class="space-y-4">
			<div class="border bg-card p-5">
				<div class="text-xs tracking-wide text-muted-foreground uppercase">Wat de klant ziet</div>
				<div class="mt-1 font-heading text-4xl tabular-nums">{formatEUR(totalIncl)}</div>
				<div class="mt-1 text-sm text-muted-foreground">
					{formatEUR(perPortionIncl)} per portie · incl. {btwPercent}% btw
				</div>
				<div class="mt-3 space-y-1 border-t pt-3 text-sm">
					<div class="flex justify-between gap-2">
						<span class="truncate text-muted-foreground">
							{result.productLines.map((l) => l.label ?? PRODUCT_LABELS[l.product]).join(' + ') ||
								'Product'}
						</span>
						<span class="tabular-nums">{formatEUR(productIncl)}</span>
					</div>
					{#if result.travelFee > 0}
						<div class="flex justify-between gap-2">
							<span class="text-muted-foreground">
								Reiskosten {result.chargedKm} km × {formatEUR(result.kmPrice)}
							</span>
							<span class="tabular-nums">{formatEUR(travelIncl)}</span>
						</div>
					{/if}
				</div>
				<div class="mt-3 flex items-center gap-2 border-t pt-3 text-sm">
					<span class="text-muted-foreground">Excl. btw</span>
					<span class="tabular-nums">{formatEUR(result.total)}</span>
					<select
						aria-label="Btw-tarief"
						bind:value={btwPercent}
						class="ml-auto h-8 rounded-md border border-input bg-background px-2 text-xs"
					>
						{#each [0, 9, 21] as r (r)}
							<option value={r}>{r}% btw</option>
						{/each}
					</select>
				</div>
				<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
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
							terug naar {formatEUR(curveRelief)}
						</button>
					{/if}
				</div>
			</div>

			{#if result.warnings.length > 0}
				<div class="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
					{#each result.warnings as w (w)}
						<div>{w}</div>
					{/each}
				</div>
			{/if}

			<div class="grid grid-cols-3 gap-2 text-sm">
				<div class="border bg-card p-3">
					<div class="text-xs text-muted-foreground">Voor ons</div>
					<div class="font-semibold tabular-nums">{formatEUR(internals.grossProfit)}</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-xs text-muted-foreground">Uren totaal</div>
					<div class="font-semibold tabular-nums">{fmtHours(internals.hours.total)}</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-xs text-muted-foreground">Per uur</div>
					<div class="font-semibold tabular-nums">
						{formatEUR(internals.blendedRatePerPerson)}
					</div>
				</div>
			</div>

			{#if dealId}
				<Button
					type="button"
					class="w-full"
					disabled={portions === 0 || result.warnings.length > 0}
					onclick={useInOfferte}
				>
					Gebruik in offerte
				</Button>
			{:else}
				<Button href="/admin/aanvragen/nieuw" variant="outline" class="w-full">
					Maak eerst een aanvraag om een offerte te maken
				</Button>
			{/if}

			<details class="border bg-card p-4 text-sm">
				<summary class="cursor-pointer font-medium">Hoe is de prijs opgebouwd?</summary>
				<table class="mt-3 w-full">
					<tbody>
						<tr>
							<td class="py-1 text-muted-foreground">Werk, {fmtHours(result.hours.billable)}</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(result.labourFee)}</td>
						</tr>
						<tr>
							<td class="py-1 text-muted-foreground">
								Materiaal{isSpecial
									? ` (${formatEUR(specialIngredientCostPerPortion(mode as SpecialVariant, fruitCost))} p.p. + cakeboards)`
									: ` (tiramisu ${formatEUR(INGREDIENT_COST_PER_PORTION.tiramisu)}, burrata ${formatEUR(burrCostPerPortion)}, verpakking ${formatEUR(PACKAGING_COST_PER_PORTION)} p.p.)`}
							</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(result.materialsFee)}</td>
						</tr>
						{#if result.extraPersonFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Extra persoon ({result.effectiveExtraPeople}×), opbouw + wachten
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.extraPersonFee)}</td>
							</tr>
						{/if}
						{#if result.smallOrderRelief + result.mixDeduction + result.volumeDiscount > 0}
							<tr>
								<td class="py-1 text-muted-foreground">Kortingen</td>
								<td class="py-1 text-right tabular-nums">
									−{formatEUR(
										result.smallOrderRelief + result.mixDeduction + result.volumeDiscount
									)}
								</td>
							</tr>
						{/if}
						<tr>
							<td class="py-1 text-muted-foreground">
								Inbegrepen reis, eerste {config.freeRoundTripKm} km retour (in de productprijs)
							</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(result.baseFee)}</td>
						</tr>
						{#if result.travelFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Reiskosten, {result.chargedKm} km × {formatEUR(result.kmPrice)} (losse regel)
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.travelFee)}</td>
							</tr>
						{/if}
						<tr class="border-t">
							<td class="py-1.5">Totaal excl. btw</td>
							<td class="py-1.5 text-right tabular-nums">{formatEUR(result.total)}</td>
						</tr>
						<tr>
							<td class="py-1 text-muted-foreground">
								Kosten: eten en verpakking {formatEUR(
									internals.costs.ingredients + internals.costs.packaging
								)}, auto {formatEUR(internals.costs.vehicle)}
							</td>
							<td class="py-1 text-right tabular-nums">−{formatEUR(internals.costs.total)}</td>
						</tr>
						<tr class="font-medium">
							<td class="py-1">Voor ons</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(internals.grossProfit)}</td>
						</tr>
					</tbody>
				</table>
				<div class="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
					<div>
						Werkuren leveren {formatEUR(internals.labourRateRealisedAfterDiscounts)}/u op, rijden {formatEUR(
							internals.travelRateRealised
						)}/u.
					</div>
					<div class={rateDrift ? 'font-medium text-amber-700' : ''}>
						{rateDrift
							? `Let op: ${formatEUR(unexplainedGap)} verschil tussen opbrengst en fase-tarieven dat niet door een korting komt.`
							: 'Werk klopt met de fase-tarieven (kortingen verrekend).'}
					</div>
				</div>
			</details>
		</section>
	</div>

	<details class="border p-4">
		<summary class="cursor-pointer text-sm font-medium">Tarieven &amp; aannames</summary>
		<CalculatorSettings bind:config bind:standbyHours {internals} totalPortions={portions} />
	</details>
</div>
