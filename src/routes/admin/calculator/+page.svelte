<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
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
		calculateSpecialInternals,
		calculateSpecialPrice,
		minPortionsForSpecialVariant,
		specialIngredientCostPerPortion,
		validationCurve,
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
	let oneWayKm = $state(0);
	let burrToppings = $state<string[]>([...DEFAULT_BURRATA_TOPPINGS]);

	const config = $state<PricingConfig>({ ...DEFAULT_CONFIG });

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
					extraPeople,
					oneWayKm,
					config: $state.snapshot(config),
					fruitCostPerPortion: fruitCost
				})
			: calculatePrice({
					tiraPortions,
					burrPortions,
					extraPeople,
					oneWayKm,
					config: $state.snapshot(config)
				})
	);

	const internals = $derived(
		mode !== 'hapjes'
			? calculateSpecialInternals(result, {
					variant: mode,
					config: $state.snapshot(config),
					fruitCostPerPortion: fruitCost
				})
			: calculateInternals(result, {
					tiraPortions,
					burrPortions,
					config: $state.snapshot(config),
					burrataIngredientCost: burrCostPerPortion
				})
	);

	function fmtHours(h: number): string {
		return h.toFixed(2).replace('.', ',') + 'u';
	}

	const totalPortions = $derived(portions);
	const minChartPortions = $derived(
		mode !== 'hapjes' ? minPortionsForSpecialVariant(mode as SpecialVariant) : 50
	);
	const customerBaseBeforeDriveExtras = $derived(
		Math.max(0, result.total - result.extraPersonFee - result.travelFee)
	);
	const portionRelatedRevenue = $derived(
		Math.max(0, customerBaseBeforeDriveExtras - result.includedDriveFee)
	);

	const tiraShare = $derived(
		mode !== 'hapjes'
			? 1
			: hapjesKind === 'tira'
				? 1
				: hapjesKind === 'burr'
					? 0
					: tiraSharePct / 100
	);

	// Validatiecurve: constante lijnen voor het actieve type, alleen afhankelijk van het
	// type + de aannames (niet van het gekozen aantal porties). De marker volgt de porties.
	const curve = $derived(
		validationCurve({
			mode,
			tiraShare,
			config: $state.snapshot(config),
			fruitCostPerPortion: fruitCost,
			from: minChartPortions,
			to: 150,
			step: 5
		})
	);
	const curvePoint = $derived(
		totalPortions >= minChartPortions && totalPortions <= 150
			? validationCurve({
					mode,
					tiraShare,
					config: $state.snapshot(config),
					fruitCostPerPortion: fruitCost,
					from: totalPortions,
					to: totalPortions,
					step: 1
				})[0]
			: null
	);
	const locationLabel = $derived(isSpecial ? 'opbouw' : 'lopen');

	// Mini-grafiek-geometrie (x = porties 50→150).
	const CW = 320;
	const CH = 104;
	const CPL = 38;
	const CPR = 10;
	const CPT = 12;
	const CPB = 18;
	const VX_MAX = 150;
	const VX_STEP = 5;
	const xTicks = $derived(
		Array.from(new Set([minChartPortions, 50, 100, 150])).filter(
			(n) => n >= minChartPortions && n <= VX_MAX
		)
	);
	function vx(x: number) {
		return CPL + ((x - minChartPortions) / (VX_MAX - minChartPortions)) * (CW - CPL - CPR);
	}
	function vy(y: number, lo: number, hi: number) {
		const span = hi - lo || 1;
		return CH - CPB - ((y - lo) / span) * (CH - CPT - CPB);
	}
	function vpath(pts: { x: number; y: number }[], lo: number, hi: number) {
		return pts.length ? 'M' + pts.map((p) => `${vx(p.x)},${vy(p.y, lo, hi)}`).join(' L') : '';
	}
	function padRange(vals: number[]): { lo: number; hi: number } {
		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const pad = (max - min) * 0.15 || max * 0.1 || 1;
		return { lo: Math.max(0, min - pad), hi: max + pad };
	}
	function yTicks(lo: number, hi: number): number[] {
		return [lo, (lo + hi) / 2, hi];
	}
	function valAt(pts: { x: number; y: number }[], x: number): number | null {
		return pts.find((p) => p.x === x)?.y ?? null;
	}

	// Gedeelde hover-porties over alle drie de grafieken.
	let hoverN = $state<number | null>(null);
	function handleHover(e: MouseEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const vbX = ((e.clientX - rect.left) / rect.width) * CW;
		const frac = (vbX - CPL) / (CW - CPL - CPR);
		const raw = minChartPortions + frac * (VX_MAX - minChartPortions);
		const snapped = Math.round(raw / VX_STEP) * VX_STEP;
		hoverN = Math.max(minChartPortions, Math.min(VX_MAX, snapped));
	}

	// Per-grafiek lijn-data, afgeleid van de constante curve.
	const hoursLines = $derived([
		{
			label: 'prep',
			color: 'var(--brand-magenta)',
			pts: curve.map((p) => ({ x: p.x, y: p.prepHours })),
			dot: curvePoint?.prepHours ?? null
		},
		{
			label: locationLabel,
			color: '#0ea5e9',
			pts: curve.map((p) => ({ x: p.x, y: p.locationHours })),
			dot: curvePoint?.locationHours ?? null
		}
	]);
	const hoursRange = $derived(
		padRange(curve.flatMap((p) => [p.prepHours, p.locationHours]).concat(0))
	);
	const ppLine = $derived([
		{
			label: '€/portie',
			color: 'var(--brand-magenta)',
			pts: curve.map((p) => ({ x: p.x, y: p.perPortion })),
			dot: curvePoint?.perPortion ?? null
		}
	]);
	const ppRange = $derived(padRange(curve.map((p) => p.perPortion)));
	const phLine = $derived([
		{
			label: '€/uur p.p.',
			color: '#0ea5e9',
			pts: curve.map((p) => ({ x: p.x, y: p.perHour })),
			dot: curvePoint?.perHour ?? null
		}
	]);
	const phRange = $derived(padRange(curve.map((p) => p.perHour)));

	function setSplit(kind: 'tira' | 'burr' | 'mix') {
		mode = 'hapjes';
		hapjesKind = kind;
	}

	function setVariant(v: SpecialVariant) {
		mode = v;
	}

	function useInOfferte() {
		if (totalPortions === 0 || result.warnings.length > 0) return;

		const toppingLabels = BURRATA_TOPPINGS.filter((t) => burrToppings.includes(t.key)).map(
			(t) => t.label
		);
		const burrSuffix = toppingLabels.length ? ` met ${toppingLabels.join(', ')}` : '';

		const description = isSpecial
			? `Hangende Hapjes — ${portions}× ${VARIANT_LABELS[mode as SpecialVariant]}`
			: isMix
				? `Hangende Hapjes — ${tiraPortions}× tiramisu + ${burrPortions}× burrata${burrSuffix}`
				: tiraPortions > 0
					? `Hangende Hapjes — ${tiraPortions}× tiramisu`
					: `Hangende Hapjes — ${burrPortions}× burrata${burrSuffix}`;

		const payload = {
			description,
			qty: totalPortions,
			unitPrice: result.perPortion,
			btwRate: 'none' as const
		};
		try {
			sessionStorage.setItem('hh_calculator_prefill', JSON.stringify(payload));
		} catch {
			// ignore
		}
		goto('/admin/document?kind=offerte&from=calc');
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
		<details class="text-xs text-muted-foreground">
			<summary class="cursor-pointer hover:text-foreground">Hoe werkt de prijsopbouw?</summary>
			<div class="mt-2 space-y-1.5 leading-relaxed">
				<p>
					<strong>Basistarief per portie</strong> komt uit de tiers (50/100/200) — bevat alle eten, lopen,
					schoonmaak en de eerste rit. Boven 200 wordt lineair geëxtrapoleerd op basis van de 100→200
					helling.
				</p>
				<p>
					<strong>Mix (twee soorten)</strong> = beide producten op hun eigen prijs voor het bestelde aantal,
					opgeteld, minus een vaste aftrek voor gedeelde overhead (1 rit en 1 schoonmaak in plaats van
					2). Symmetrisch — meer porties betekent altijd een hogere prijs, los van welk product groter
					is.
				</p>
				<p>
					<strong>Extra persoon</strong> wordt verplicht vanaf {DEFAULT_CONFIG.mandatoryExtraPersonAt}
					porties (één persoon kan niet meer dan ±2u lopen). Fee dekt alleen de rituren — looptijd zit
					al in het basistarief, dus we rekenen niet dubbel.
				</p>
				<p>
					<strong>Reiskosten</strong>: eerste {DEFAULT_CONFIG.freeRoundTripKm} km retour gratis, daarna
					€{DEFAULT_CONFIG.costPerKm.toFixed(2).replace('.', ',')}/km.
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
				<legend class="px-1 text-sm font-medium">Aantal</legend>
				<div class="grid gap-4 sm:grid-cols-2">
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
				</div>
				<p class="text-xs text-muted-foreground">
					Gedeeld over alle varianten — schakel hieronder van type en vergelijk bij hetzelfde
					aantal.
					{#if isMix}
						· {tiraPortions} tiramisu + {burrPortions} burrata (min. {MIN_PORTIONS_PER_PRODUCT} per soort)
					{/if}
				</p>
			</fieldset>

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Wat</legend>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => setSplit('tira')}
						class="border px-3 py-1.5 text-sm transition {mode === 'hapjes' && hapjesKind === 'tira'
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						Alleen tiramisu
					</button>
					<button
						type="button"
						onclick={() => setSplit('burr')}
						class="border px-3 py-1.5 text-sm transition {mode === 'hapjes' && hapjesKind === 'burr'
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						Alleen burrata
					</button>
					<button
						type="button"
						onclick={() => setSplit('mix')}
						class="border px-3 py-1.5 text-sm transition {isMix
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						Mix
					</button>
				</div>
				<div class="flex flex-wrap gap-2 border-t pt-3">
					{#each SPECIAL_VARIANTS as v (v)}
						<button
							type="button"
							onclick={() => setVariant(v)}
							class="border px-3 py-1.5 text-sm transition {mode === v
								? 'border-primary bg-primary text-primary-foreground'
								: 'hover:bg-muted'}"
						>
							{VARIANT_LABELS[v]}
						</button>
					{/each}
				</div>

				<p class="text-xs text-muted-foreground">
					{#if isMix}
						Mix — beide producten op eigen tarief, minus gedeelde overhead.
					{:else if mode === 'millefeuille-taart'}
						Portie-anker €{config.millefeuillePriceAt25} @25 → €{config.millefeuillePriceAt50}
						@50 → €{config.millefeuillePriceAt100} @100.
					{:else if mode === 'tiramisu-taart'}
						Portie-anker €{config.tiramisuCakePriceAt30} @30 → €{config.tiramisuCakePriceAt50}
						@50 → €{config.tiramisuCakePriceAt100} @100.
					{:else}
						Basistarief per portie uit de tiers.
					{/if}
				</p>
			</fieldset>

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Fijn-afstemmen (deze variant)</legend>
				{#if !isSpecial}
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="pph">Porties per uur (lopen)</Label>
							<Input id="pph" type="number" min="1" step="5" bind:value={config.portionsPerHour} />
						</div>
					</div>
					<p class="text-xs text-muted-foreground">Looptijd = porties ÷ porties-per-uur.</p>
				{:else if mode === 'tiramisu-taart'}
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="tcpr30">Prijs @30 pers. (€)</Label>
							<Input
								id="tcpr30"
								type="number"
								min="0"
								step="25"
								bind:value={config.tiramisuCakePriceAt30}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="tcpr50">Prijs @50 pers. (€)</Label>
							<Input
								id="tcpr50"
								type="number"
								min="0"
								step="25"
								bind:value={config.tiramisuCakePriceAt50}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="tcpr100">Prijs @100 pers. (€)</Label>
							<Input
								id="tcpr100"
								type="number"
								min="0"
								step="25"
								bind:value={config.tiramisuCakePriceAt100}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="cb50">Opbouw @50 pers. (u)</Label>
							<Input
								id="cb50"
								type="number"
								min="0"
								step="0.05"
								bind:value={config.cakeBuildHoursAt50}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="cb100">Opbouw @100 pers. (u)</Label>
							<Input
								id="cb100"
								type="number"
								min="0"
								step="0.05"
								bind:value={config.cakeBuildHoursAt100}
							/>
						</div>
					</div>
					<p class="text-xs text-muted-foreground">
						Minimaal {minPortionsForSpecialVariant('tiramisu-taart')} personen. Prep = standaard
						hapjesprep × 2 (dubbele portie). Prijs = premium all-in anker voor opbouw en
						entertainment op locatie.
					</p>
				{:else if mode === 'millefeuille-taart'}
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="mp25">Prep @25 pers. (u)</Label>
							<Input
								id="mp25"
								type="number"
								min="0"
								step="0.25"
								bind:value={config.millefeuillePrepHoursAt25}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mp50">Prep @50 pers. (u)</Label>
							<Input
								id="mp50"
								type="number"
								min="0"
								step="0.25"
								bind:value={config.millefeuillePrepHoursAt50}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mp100">Prep @100 pers. (u)</Label>
							<Input
								id="mp100"
								type="number"
								min="0"
								step="0.25"
								bind:value={config.millefeuillePrepHoursAt100}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mpr25">Prijs @25 pers. (€)</Label>
							<Input
								id="mpr25"
								type="number"
								min="0"
								step="25"
								bind:value={config.millefeuillePriceAt25}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mpr50">Prijs @50 pers. (€)</Label>
							<Input
								id="mpr50"
								type="number"
								min="0"
								step="25"
								bind:value={config.millefeuillePriceAt50}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mpr100">Prijs @100 pers. (€)</Label>
							<Input
								id="mpr100"
								type="number"
								min="0"
								step="25"
								bind:value={config.millefeuillePriceAt100}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mcb50">Opbouw @50 pers. (u)</Label>
							<Input
								id="mcb50"
								type="number"
								min="0"
								step="0.05"
								bind:value={config.cakeBuildHoursAt50}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="mcb100">Opbouw @100 pers. (u)</Label>
							<Input
								id="mcb100"
								type="number"
								min="0"
								step="0.05"
								bind:value={config.cakeBuildHoursAt100}
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="fruit">Fruitkostprijs per portie (€)</Label>
							<Input id="fruit" type="number" min="0" step="0.05" bind:value={fruitCost} />
						</div>
					</div>
					<p class="text-xs text-muted-foreground">
						Minimaal {minPortionsForSpecialVariant('millefeuille-taart')} personen. Prijs is
						portie-verankerd (uurtarief is een uitkomst, geen input). Opbouw = zelfde als
						tiramisu-taart. Fruit drukt op de marge, niet op de prijs.
					</p>
				{/if}
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
						Heen + terug: <span class="text-foreground tabular-nums">{oneWayKm * 2} km</span>
						{#if oneWayKm * 2 > config.freeRoundTripKm}
							· {result.travelChargedKm} km × {config.costPerKm.toFixed(2).replace('.', ',')} €
						{:else}
							· binnen vrij gebied
						{/if}
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Eerste {config.freeRoundTripKm} km retour is inbegrepen. Daarboven €{config.costPerKm
						.toFixed(2)
						.replace('.', ',')} per km.
				</p>
			</fieldset>

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Extra persoon</legend>
				<div class="flex flex-wrap gap-2">
					{#each [0, 1, 2] as n}
						<button
							type="button"
							onclick={() => (extraPeople = n)}
							disabled={n > result.allowedExtraPeople || (n === 0 && result.extraPersonMandatory)}
							class="border px-3 py-1.5 text-sm transition disabled:opacity-30 {result.effectiveExtraPeople ===
							n
								? 'border-primary bg-primary text-primary-foreground'
								: 'hover:bg-muted'}"
						>
							{n === 0 ? 'Geen' : `+${n}`}
						</button>
					{/each}
				</div>
				{#if result.extraPersonMandatory}
					<p class="text-xs text-amber-700">
						Vanaf {config.mandatoryExtraPersonAt} porties is een tweede persoon vereist (één persoon kan
						niet langer dan ±2 uur lopen).
					</p>
				{/if}
				<p class="text-xs text-muted-foreground">
					Verplicht vanaf {config.mandatoryExtraPersonAt} porties · +2 toegestaan vanaf {config.extraPersonMinPortions2}
					porties.
				</p>
				{#if result.effectiveExtraPeople > 0}
					<p class="text-xs text-muted-foreground">
						Per extra persoon: {config.extraPersonDriveHours.toString().replace('.', ',')}u rijden ×
						€{config.driveHourlyRate} = {formatEUR(
							config.extraPersonDriveHours * config.driveHourlyRate
						)}.
						Looptijd is al gedekt in het basistarief van de hapjes.
					</p>
				{/if}
			</fieldset>

			<details class="border p-4">
				<summary class="cursor-pointer text-sm font-medium">Pricing-aannames (geavanceerd)</summary>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="drivehourly">Rij-uur tarief (€)</Label>
						<Input
							id="drivehourly"
							type="number"
							min="0"
							step="1"
							bind:value={config.driveHourlyRate}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="includeddrive">Standaardrit inbegrepen (u)</Label>
						<Input
							id="includeddrive"
							type="number"
							min="0"
							step="0.1"
							bind:value={config.includedDriveHours}
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
						<Label for="epdrive">Extra persoon — rijuren</Label>
						<Input
							id="epdrive"
							type="number"
							min="0"
							step="0.1"
							bind:value={config.extraPersonDriveHours}
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
					</div>
					<div class="space-y-1.5">
						<Label for="kmcost">Prijs per km (€)</Label>
						<Input id="kmcost" type="number" min="0" step="0.01" bind:value={config.costPerKm} />
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
				</div>

				<div class="mt-4 mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Taarten op locatie
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
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
				<p class="mt-2 text-xs text-muted-foreground">
					Opbouwtijden, tiramisu-taart prijsankers, millefeuille-prep en -prijsankers en
					porties/uur staan onder “Fijn-afstemmen (deze variant)”.
				</p>
			</details>
		</section>

		<!-- Output -->
		<section class="space-y-4">
			<div class="border bg-card p-5">
				<div class="text-xs tracking-wide text-muted-foreground uppercase">Totaal</div>
				<div class="mt-1 font-heading text-4xl tabular-nums">{formatEUR(result.total)}</div>
				<div class="mt-1 text-sm text-muted-foreground">
					{formatEUR(result.perPortion)} per portie · {totalPortions} porties
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
								<td class="py-1">
									{line.label ?? PRODUCT_LABELS[line.product]} · {line.portions} porties
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(line.price)}</td>
							</tr>
						{/each}
						{#if isSpecial && result.surchargeTotal}
							<tr>
								<td class="py-1 pl-4 text-muted-foreground">
									Basis (hapjestarief {result.totalPortions} pers.)
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.baseLinePrice ?? 0)}</td>
							</tr>
							<tr>
								<td class="py-1 pl-4 text-muted-foreground">
									Toeslag — {result.totalPortions} × €{(result.surchargePerPortion ?? 0)
										.toFixed(2)
										.replace('.', ',')}
								</td>
								<td class="py-1 text-right tabular-nums">+{formatEUR(result.surchargeTotal)}</td>
							</tr>
						{/if}
						{#if result.mixDeduction > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Gedeelde overhead (1 rit + schoonmaak ipv 2)
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(result.mixDeduction)}</td>
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
									Extra persoon ({result.effectiveExtraPeople}×) — {result.extraPersonDriveHours
										.toString()
										.replace('.', ',')}u rijden
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.extraPersonFee)}</td>
							</tr>
						{/if}
						{#if result.travelFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Reiskosten ({result.travelChargedKm} km)
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.travelFee)}</td>
							</tr>
						{/if}
						<tr class="border-t font-medium">
							<td class="py-2">Totaal</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(result.total)}</td>
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
						{#if result.includedDriveFee > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Waarvan product/service na korting excl. standaardrit
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(portionRelatedRevenue)}</td>
							</tr>
							<tr>
								<td class="py-1 text-muted-foreground">
									Waarvan standaardrit inbegrepen — {result.includedDriveHours
										.toString()
										.replace('.', ',')}u × €{config.driveHourlyRate}
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.includedDriveFee)}</td>
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
							{#if isSpecial}
								{fmtHours(internals.hours.build)} opbouw ·
							{:else}
								{fmtHours(internals.hours.walking)} lopen ·
							{/if}
							{fmtHours(internals.hours.cleanup)} schoonmaak · {fmtHours(internals.hours.drive)} rijden
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
							{formatEUR(internals.hourlyRatePerPerson)}/uur
						</div>
					</div>
				</div>
			</div>

			{#snippet miniChart(
				title: string,
				lines: {
					label: string;
					color: string;
					pts: { x: number; y: number }[];
					dot: number | null;
				}[],
				lo: number,
				hi: number,
				fmt: (n: number) => string
			)}
				<div>
					<div class="mb-1 flex items-center justify-between text-xs">
						<span class="text-muted-foreground">{title}</span>
						<span class="flex gap-2">
							{#each lines as l (l.label)}
								<span class="tabular-nums" style="color:{l.color}"
									>{l.label}{l.dot != null ? ' ' + fmt(l.dot) : ''}</span
								>
							{/each}
						</span>
					</div>
					<svg
						viewBox="0 0 {CW} {CH}"
						class="h-auto w-full"
						role="img"
						aria-label={title}
						onmousemove={handleHover}
						onmouseleave={() => (hoverN = null)}
					>
						{#each yTicks(lo, hi) as t (t)}
							<line
								x1={CPL}
								x2={CW - CPR}
								y1={vy(t, lo, hi)}
								y2={vy(t, lo, hi)}
								stroke="currentColor"
								stroke-opacity="0.1"
							/>
							<text
								x={CPL - 4}
								y={vy(t, lo, hi)}
								font-size="7"
								text-anchor="end"
								dominant-baseline="middle"
								fill="currentColor"
								opacity="0.55"
							>
								{fmt(t)}
							</text>
						{/each}
						{#each xTicks as t (t)}
							<text
								x={vx(t)}
								y={CH - 4}
								font-size="7"
								text-anchor="middle"
								fill="currentColor"
								opacity="0.45"
							>
								{t}
							</text>
						{/each}
						{#if curvePoint}
							<line
								x1={vx(curvePoint.x)}
								x2={vx(curvePoint.x)}
								y1={CPT}
								y2={CH - CPB}
								stroke="currentColor"
								stroke-opacity="0.25"
								stroke-dasharray="3 3"
							/>
						{/if}
						{#each lines as l (l.label)}
							<path d={vpath(l.pts, lo, hi)} fill="none" stroke={l.color} stroke-width="1.5" />
							{#if curvePoint && l.dot != null}
								<circle cx={vx(curvePoint.x)} cy={vy(l.dot, lo, hi)} r="3" fill={l.color} />
							{/if}
						{/each}
						{#if hoverN != null}
							<line
								x1={vx(hoverN)}
								x2={vx(hoverN)}
								y1={CPT}
								y2={CH - CPB}
								stroke="currentColor"
								stroke-opacity="0.5"
							/>
							<text
								x={hoverN > 110 ? vx(hoverN) - 4 : vx(hoverN) + 4}
								y={CPT + 2}
								font-size="7"
								text-anchor={hoverN > 110 ? 'end' : 'start'}
								fill="currentColor"
								opacity="0.7"
							>
								{hoverN}p
							</text>
							{#each lines as l (l.label)}
								{@const hv = valAt(l.pts, hoverN)}
								{#if hv != null}
									<circle cx={vx(hoverN)} cy={vy(hv, lo, hi)} r="2.5" fill={l.color} />
									<text
										x={hoverN > 110 ? vx(hoverN) - 5 : vx(hoverN) + 5}
										y={vy(hv, lo, hi) - 3}
										font-size="7"
										text-anchor={hoverN > 110 ? 'end' : 'start'}
										fill={l.color}
									>
										{fmt(hv)}
									</text>
								{/if}
							{/each}
						{/if}
					</svg>
				</div>
			{/snippet}

			<div class="border bg-card p-4">
				<div class="mb-3 text-xs tracking-wide text-muted-foreground uppercase">
					Schaling (ter validatie) — porties {minChartPortions}–150
				</div>
				<div class="space-y-3">
					{@render miniChart(
						`Werkuren (prep · ${locationLabel})`,
						hoursLines,
						hoursRange.lo,
						hoursRange.hi,
						fmtHours
					)}
					{@render miniChart('Prijs per portie', ppLine, ppRange.lo, ppRange.hi, formatEUR)}
					{@render miniChart('Opbrengst per uur p.p.', phLine, phRange.lo, phRange.hi, formatEUR)}
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					Lijnen hangen alleen af van het type en de aannames. De stip toont waar deze offerte ({totalPortions}
					porties) op de lijn valt.
				</p>
			</div>

			<Button
				type="button"
				class="w-full"
				disabled={totalPortions === 0 || result.warnings.length > 0}
				onclick={useInOfferte}
			>
				Gebruik in offerte
			</Button>
		</section>
	</div>
</div>
