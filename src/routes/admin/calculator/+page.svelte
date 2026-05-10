<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import {
		DEFAULT_CONFIG,
		INGREDIENT_COST_PER_PORTION,
		MIN_PORTIONS_PER_PRODUCT,
		PACKAGING_COST_PER_PORTION,
		PRODUCT_LABELS,
		calculateInternals,
		calculatePrice,
		priceCurve,
		type PricingConfig
	} from '$lib/admin/pricing';

	let tiraPortions = $state(0);
	let burrPortions = $state(100);
	let extraPeople = $state(0);
	let oneWayKm = $state(0);

	const config = $state<PricingConfig>({ ...DEFAULT_CONFIG });

	const result = $derived(
		calculatePrice({
			tiraPortions,
			burrPortions,
			extraPeople,
			oneWayKm,
			config: $state.snapshot(config)
		})
	);

	const internals = $derived(
		calculateInternals(result, {
			tiraPortions,
			burrPortions,
			config: $state.snapshot(config)
		})
	);

	function fmtHours(h: number): string {
		return h.toFixed(2).replace('.', ',') + 'u';
	}

	const totalPortions = $derived(tiraPortions + burrPortions);
	const isMix = $derived(tiraPortions > 0 && burrPortions > 0);

	const tiraShare = $derived(totalPortions > 0 ? tiraPortions / totalPortions : 0);

	const curveData = $derived(
		priceCurve({
			tiraShare,
			extraPeople,
			oneWayKm,
			config: $state.snapshot(config),
			from: 50,
			to: 300,
			step: 5
		})
	);

	// Chart geometry
	const chartW = 540;
	const chartH = 220;
	const padL = 48;
	const padR = 12;
	const padT = 12;
	const padB = 28;

	const validPoints = $derived(curveData.filter((p) => Number.isFinite(p.total)));
	const yMax = $derived(
		validPoints.length > 0 ? Math.max(...validPoints.map((p) => p.total)) * 1.1 : 1
	);
	const xMin = 50;
	const xMax = 300;

	function xToPx(x: number) {
		return padL + ((x - xMin) / (xMax - xMin)) * (chartW - padL - padR);
	}
	function yToPx(y: number) {
		return chartH - padB - (y / yMax) * (chartH - padT - padB);
	}

	const linePath = $derived.by(() => {
		const pts = validPoints.map((p) => `${xToPx(p.x)},${yToPx(p.total)}`);
		return pts.length ? 'M' + pts.join(' L') : '';
	});

	const yTicks = $derived.by(() => {
		const step = niceStep(yMax / 4);
		const ticks: number[] = [];
		for (let v = 0; v <= yMax; v += step) ticks.push(v);
		return ticks;
	});

	function niceStep(raw: number): number {
		const pow = Math.pow(10, Math.floor(Math.log10(raw)));
		const n = raw / pow;
		const nice = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
		return nice * pow;
	}

	function setSplit(option: 'tira' | 'burr' | 'mix') {
		if (option === 'tira') {
			burrPortions = 0;
			if (tiraPortions === 0) tiraPortions = 100;
		} else if (option === 'burr') {
			tiraPortions = 0;
			if (burrPortions === 0) burrPortions = 100;
		} else {
			if (tiraPortions < MIN_PORTIONS_PER_PRODUCT) tiraPortions = MIN_PORTIONS_PER_PRODUCT;
			if (burrPortions < MIN_PORTIONS_PER_PRODUCT) burrPortions = MIN_PORTIONS_PER_PRODUCT;
		}
	}

	function useInOfferte() {
		if (totalPortions === 0 || result.warnings.length > 0) return;

		const description = isMix
			? `Hangende Hapjes — ${tiraPortions}× tiramisu + ${burrPortions}× burrata`
			: tiraPortions > 0
				? `Hangende Hapjes — ${tiraPortions}× tiramisu (De Toetjes Vrouw)`
				: `Hangende Hapjes — ${burrPortions}× burrata (De Borrel Baas)`;

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
		<p class="text-muted-foreground text-sm">
			Bereken een offerteprijs op basis van porties, mix en extra personen.
		</p>
		<details class="text-muted-foreground text-xs">
			<summary class="cursor-pointer hover:text-foreground">Hoe werkt de prijsopbouw?</summary>
			<div class="mt-2 space-y-1.5 leading-relaxed">
				<p>
					<strong>Basistarief per portie</strong> komt uit de tiers (50/100/200) — bevat alle
					eten, lopen, schoonmaak en de eerste rit. Boven 200 wordt lineair geëxtrapoleerd op
					basis van de 100→200 helling.
				</p>
				<p>
					<strong>Mix-surcharge</strong> dekt de extra prep van een tweede product (we gebruiken
					tiramisu's prep-curve op de kleinere portie als symmetrische basis).
				</p>
				<p>
					<strong>Extra persoon</strong> wordt verplicht vanaf {DEFAULT_CONFIG.mandatoryExtraPersonAt}
					porties (één persoon kan niet meer dan ±2u lopen). Fee dekt alleen de rituren — looptijd
					zit al in het basistarief, dus we rekenen niet dubbel.
				</p>
				<p>
					<strong>Reiskosten</strong>: eerste {DEFAULT_CONFIG.freeRoundTripKm} km retour gratis,
					daarna €{DEFAULT_CONFIG.costPerKm.toFixed(2).replace('.', ',')}/km.
				</p>
			</div>
		</details>
	</div>

	<div class="grid gap-8 lg:grid-cols-[1fr_minmax(0,560px)]">
		<!-- Inputs -->
		<section class="space-y-6">
			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Wat</legend>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => setSplit('tira')}
						class="border px-3 py-1.5 text-sm transition {tiraPortions > 0 && burrPortions === 0
							? 'bg-primary text-primary-foreground border-primary'
							: 'hover:bg-muted'}"
					>
						Alleen tiramisu
					</button>
					<button
						type="button"
						onclick={() => setSplit('burr')}
						class="border px-3 py-1.5 text-sm transition {burrPortions > 0 && tiraPortions === 0
							? 'bg-primary text-primary-foreground border-primary'
							: 'hover:bg-muted'}"
					>
						Alleen burrata
					</button>
					<button
						type="button"
						onclick={() => setSplit('mix')}
						class="border px-3 py-1.5 text-sm transition {isMix
							? 'bg-primary text-primary-foreground border-primary'
							: 'hover:bg-muted'}"
					>
						Mix
					</button>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<div class="mb-1 flex items-baseline justify-between">
							<Label for="tira">{PRODUCT_LABELS.tiramisu}</Label>
							<span class="text-sm tabular-nums">{tiraPortions}</span>
						</div>
						<input
							id="tira"
							type="range"
							min="0"
							max="300"
							step="5"
							bind:value={tiraPortions}
							class="w-full"
						/>
					</div>
					<div>
						<div class="mb-1 flex items-baseline justify-between">
							<Label for="burr">{PRODUCT_LABELS.burrata}</Label>
							<span class="text-sm tabular-nums">{burrPortions}</span>
						</div>
						<input
							id="burr"
							type="range"
							min="0"
							max="300"
							step="5"
							bind:value={burrPortions}
							class="w-full"
						/>
					</div>
				</div>

				<p class="text-muted-foreground text-xs">
					Totaal: <span class="text-foreground font-medium tabular-nums">{totalPortions}</span> porties
					{#if isMix}
						(mix vereist min. {MIN_PORTIONS_PER_PRODUCT} per soort)
					{/if}
				</p>
			</fieldset>

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Reisafstand</legend>
				<div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
					<div class="space-y-1.5">
						<Label for="oneway">Enkele reis (km)</Label>
						<Input
							id="oneway"
							type="number"
							min="0"
							step="1"
							bind:value={oneWayKm}
						/>
					</div>
					<div class="text-muted-foreground text-xs sm:pb-2">
						Heen + terug: <span class="text-foreground tabular-nums">{oneWayKm * 2} km</span>
						{#if oneWayKm * 2 > config.freeRoundTripKm}
							· {result.travelChargedKm} km × {config.costPerKm.toFixed(2).replace('.', ',')} €
						{:else}
							· binnen vrij gebied
						{/if}
					</div>
				</div>
				<p class="text-muted-foreground text-xs">
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
							disabled={n > result.allowedExtraPeople ||
								(n === 0 && result.extraPersonMandatory)}
							class="border px-3 py-1.5 text-sm transition disabled:opacity-30 {result.effectiveExtraPeople ===
							n
								? 'bg-primary text-primary-foreground border-primary'
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
				<p class="text-muted-foreground text-xs">
					Verplicht vanaf {config.mandatoryExtraPersonAt} porties · +2 toegestaan vanaf {config.extraPersonMinPortions2}
					porties.
				</p>
				{#if result.effectiveExtraPeople > 0}
					<p class="text-muted-foreground text-xs">
						Per extra persoon: {config.extraPersonDriveHours.toString().replace('.', ',')}u rijden ×
						€{config.hourlyRate} = {formatEUR(
							config.extraPersonDriveHours * config.hourlyRate
						)}. Looptijd is al gedekt in het basistarief van de hapjes.
					</p>
				{/if}
			</fieldset>

			<details class="border p-4">
				<summary class="cursor-pointer text-sm font-medium">Pricing-aannames (geavanceerd)</summary>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="hourly">Uurloon (€)</Label>
						<Input id="hourly" type="number" min="0" step="1" bind:value={config.hourlyRate} />
					</div>
					<div class="space-y-1.5">
						<Label for="mixfactor">Mix-prep factor</Label>
						<Input
							id="mixfactor"
							type="number"
							min="0"
							step="0.1"
							bind:value={config.mixPrepFactor}
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
						<Input
							id="freekm"
							type="number"
							min="0"
							step="1"
							bind:value={config.freeRoundTripKm}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="kmcost">Prijs per km (€)</Label>
						<Input
							id="kmcost"
							type="number"
							min="0"
							step="0.01"
							bind:value={config.costPerKm}
						/>
					</div>
				</div>
			</details>
		</section>

		<!-- Output -->
		<section class="space-y-4">
			<div class="bg-card border p-5">
				<div class="text-muted-foreground text-xs uppercase tracking-wide">Totaal</div>
				<div class="font-heading mt-1 text-4xl tabular-nums">{formatEUR(result.total)}</div>
				<div class="text-muted-foreground mt-1 text-sm">
					{formatEUR(result.perPortion)} per portie · {totalPortions} porties
				</div>
			</div>

			{#if result.warnings.length > 0}
				<div class="border-destructive bg-destructive/10 text-destructive border p-3 text-sm">
					{#each result.warnings as w}
						<div>{w}</div>
					{/each}
				</div>
			{/if}

			<div class="bg-card border p-4 text-sm">
				<div class="text-muted-foreground mb-2 text-xs uppercase tracking-wide">Opbouw (intern)</div>
				<table class="w-full">
					<tbody>
						{#if result.primary}
							<tr>
								<td class="py-1">
									{PRODUCT_LABELS[result.primary.product]} · {result.primary.portions} porties
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.primary.price)}</td>
							</tr>
						{/if}
						{#if result.extension}
							<tr>
								<td class="py-1 text-muted-foreground">
									Uitbreiding {PRODUCT_LABELS[result.extension.product]} · {result.extension.portions} porties
								</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.extension.price)}</td>
							</tr>
						{/if}
						{#if result.mixSurcharge > 0}
							<tr>
								<td class="py-1 text-muted-foreground">Mix-surcharge (extra prep)</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(result.mixSurcharge)}</td>
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
			<div class="bg-card border p-4 text-sm">
				<div class="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
					Onze cijfers (intern)
				</div>
				<table class="w-full">
					<tbody>
						<tr>
							<td class="py-1">Klant betaalt</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(result.total)}</td>
						</tr>
						{#if tiraPortions > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Ingrediënten tiramisu — {tiraPortions} × {formatEUR(
										INGREDIENT_COST_PER_PORTION.tiramisu
									)}
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(internals.costs.ingredientsTira)}</td>
							</tr>
						{/if}
						{#if burrPortions > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Ingrediënten burrata — {burrPortions} × {formatEUR(
										INGREDIENT_COST_PER_PORTION.burrata
									)}
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(internals.costs.ingredientsBurr)}</td>
							</tr>
						{/if}
						{#if totalPortions > 0}
							<tr>
								<td class="py-1 text-muted-foreground">
									Verpakking — {totalPortions} × {formatEUR(PACKAGING_COST_PER_PORTION)}
								</td>
								<td class="py-1 text-right tabular-nums">−{formatEUR(internals.costs.packaging)}</td>
							</tr>
						{/if}
						<tr class="border-t font-medium">
							<td class="py-2">Voor ons (bruto)</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(internals.grossProfit)}</td>
						</tr>
					</tbody>
				</table>

				<div class="mt-3 grid grid-cols-2 gap-3 border-t pt-3">
					<div>
						<div class="text-muted-foreground text-xs">Werkuren totaal (mensuren)</div>
						<div class="font-heading text-2xl tabular-nums">{fmtHours(internals.hours.total)}</div>
						<div class="text-muted-foreground mt-0.5 text-xs">
							{fmtHours(internals.hours.prep)} prep · {fmtHours(internals.hours.walking)} lopen ·
							{fmtHours(internals.hours.cleanup)} schoonmaak · {fmtHours(internals.hours.drive)} rijden
						</div>
					</div>
					<div>
						<div class="text-muted-foreground text-xs">
							Per persoon ({internals.people}× — gemiddeld)
						</div>
						<div class="font-heading text-2xl tabular-nums">
							{formatEUR(internals.grossProfit / internals.people)}
						</div>
						<div class="text-muted-foreground mt-0.5 text-xs">
							~{fmtHours(internals.hours.total / internals.people)} werk ·
							{formatEUR(internals.hourlyRatePerPerson)}/uur
						</div>
					</div>
				</div>
			</div>

			<!-- Chart -->
			<div class="bg-card border p-4">
				<div class="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
					Prijscurve bij huidige mix
				</div>
				<svg viewBox="0 0 {chartW} {chartH}" class="h-auto w-full" role="img" aria-label="Prijscurve">
					<!-- Y axis ticks -->
					{#each yTicks as t}
						<line
							x1={padL}
							x2={chartW - padR}
							y1={yToPx(t)}
							y2={yToPx(t)}
							stroke="currentColor"
							stroke-opacity="0.1"
						/>
						<text x={padL - 6} y={yToPx(t)} text-anchor="end" dominant-baseline="middle" font-size="10" fill="currentColor" opacity="0.6">
							{Math.round(t)}
						</text>
					{/each}

					<!-- X axis ticks -->
					{#each [50, 100, 150, 200, 250, 300] as x}
						<text x={xToPx(x)} y={chartH - 10} text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">
							{x}
						</text>
					{/each}

					<!-- Curve -->
					<path d={linePath} fill="none" stroke="var(--brand-magenta)" stroke-width="2" />

					<!-- Current marker -->
					{#if totalPortions >= xMin && totalPortions <= xMax && Number.isFinite(result.total)}
						<line
							x1={xToPx(totalPortions)}
							x2={xToPx(totalPortions)}
							y1={padT}
							y2={chartH - padB}
							stroke="var(--brand-magenta)"
							stroke-opacity="0.3"
							stroke-dasharray="3 3"
						/>
						<circle
							cx={xToPx(totalPortions)}
							cy={yToPx(result.total)}
							r="5"
							fill="var(--brand-magenta)"
						/>
					{/if}
				</svg>
				<p class="text-muted-foreground mt-2 text-xs">
					Verticale as: totaalprijs (€). Horizontale as: porties.
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

<style>
	input[type='range'] {
		accent-color: var(--brand-magenta);
	}
</style>
