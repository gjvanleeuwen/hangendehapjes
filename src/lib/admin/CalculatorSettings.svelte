<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import {
		HOUR_CURVE_KEYS,
		HOUR_CURVE_LABELS,
		HOUR_TIER_POINTS,
		STAGE_LABELS,
		STAGE_SOURCE,
		drivingRatePerHour,
		hourCurveAt,
		includedTravelFee,
		DISCOUNT_GROUPS,
		DISCOUNT_GROUP_LABELS,
		discountGroupFor,
		discountPctAt,
		type InternalBreakdown,
		type PricingConfig,
		type SpecialVariant
	} from '$lib/admin/pricing';
	import DiscountSketch from '$lib/admin/DiscountSketch.svelte';

	// Everything you set once and rarely touch: rates per phase, the hour matrix
	// and the remaining assumptions. Lives folded away under the calculator.
	let {
		config = $bindable(),
		internals,
		totalPortions,
		sketchProduct,
		fruitCost,
		burrataIngredientCost
	}: {
		config: PricingConfig;
		internals: InternalBreakdown;
		totalPortions: number;
		sketchProduct: 'tiramisu' | 'burrata' | SpecialVariant;
		fruitCost: number;
		burrataIngredientCost: number;
	} = $props();

	const activeGroup = $derived(
		discountGroupFor(
			sketchProduct === 'tiramisu' || sketchProduct === 'burrata' ? undefined : sketchProduct
		)
	);

	// Generic number fields: these keys all hold plain numbers.
	type NumKey = keyof PricingConfig;
	const numOf = (key: NumKey) => config[key] as unknown as number;
	const setNum = (key: NumKey, raw: string) => {
		const n = Number(raw);
		if (Number.isFinite(n)) (config as unknown as Record<string, number>)[key] = n;
	};

	const fmtHours = (h: number) => h.toFixed(2).replace('.', ',') + 'u';

	const numberFields: { key: keyof PricingConfig; label: string; step: number; hint?: string }[] = [
		{ key: 'portionsPerHour', label: 'Porties per uur (lopen)', step: 5 },
		{
			key: 'extraCostPer10Persons',
			label: 'Vaste extra kosten (€ per 10 personen)',
			step: 0.25,
			hint: 'Voor alle varianten, naar rato.'
		},
		{ key: 'mandatoryExtraPersonAt', label: '2e persoon verplicht vanaf', step: 5 },
		{ key: 'extraPersonMinPortions2', label: '+2 toegestaan vanaf', step: 5 }
	];

	const travelFields: { key: keyof PricingConfig; label: string; step: number }[] = [
		{ key: 'travelSpeedKmh', label: 'Gem. snelheid (km/u)', step: 5 },
		{ key: 'vehicleCostPerKm', label: 'Autokosten (€ per km)', step: 0.01 },
		{ key: 'kmPriceDefault', label: 'Km-prijs standaard (€)', step: 0.05 },
		{ key: 'kmPriceMin', label: 'Km-prijs minimaal (€)', step: 0.05 },
		{ key: 'kmPriceMax', label: 'Km-prijs maximaal (€)', step: 0.05 },
		{ key: 'freeRoundTripKm', label: 'Inbegrepen retour-km', step: 2 }
	];
</script>

<div class="mt-3 grid gap-x-8 gap-y-6 lg:grid-cols-2">
	<div>
		<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			Uurtarieven per fase
		</div>
		<table class="w-full text-sm">
			<thead class="text-xs text-muted-foreground">
				<tr>
					<th class="pb-1 text-left font-normal">Fase</th>
					<th class="pb-1 pl-2 text-right font-normal">Uren</th>
					<th class="w-24 pb-1 text-right font-normal">€/u</th>
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
							{#if s.stage === 'onsite'}
								<Input
									type="number"
									min="0"
									step="0.25"
									class="h-8 w-20 text-right"
									aria-label="Uren op locatie per persoon"
									bind:value={config.onsiteHours}
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
			Op locatie is opbouwen, wachten en inpakken samen, in uren per persoon. Een vaste aanname voor
			het kostenprofiel, niet iets wat je per offerte bijstelt.
		</p>

		<div class="mt-4 mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			Reizen
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each travelFields as f (f.key)}
				<div class="space-y-1.5">
					<Label for="cs-{f.key}">{f.label}</Label>
					<Input
						id="cs-{f.key}"
						type="number"
						min="0"
						step={f.step}
						value={numOf(f.key)}
						oninput={(e) => setNum(f.key, e.currentTarget.value)}
					/>
				</div>
			{/each}
		</div>
		<p class="mt-2 text-xs text-muted-foreground">
			Inbegrepen reis: {config.freeRoundTripKm} km retour × {formatEUR(config.kmPriceDefault)} =
			{formatEUR(includedTravelFee(config))} in elke productprijs.
		</p>
		<p class="mt-1 text-xs text-muted-foreground">
			Wat een km-prijs per rij-uur oplevert: bij {formatEUR(config.kmPriceMin)} is dat {formatEUR(
				drivingRatePerHour(config.kmPriceMin, config)
			)}/u rijden, bij {formatEUR(config.kmPriceMax)}
			{formatEUR(drivingRatePerHour(config.kmPriceMax, config))}/u, na autokosten.
		</p>
	</div>

	<div>
		<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			Urenmatrix: uren per aantal porties
		</div>
		<div class="overflow-x-auto">
			<table class="w-full min-w-[420px] text-sm">
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
				</tbody>
			</table>
		</div>
		<p class="mt-2 text-xs text-muted-foreground">
			Lineair tussen de ankers, onder 25 vlak, boven 400 doorgetrokken. Lopen volgt porties per uur.
		</p>
	</div>

	<div class="lg:col-span-2">
		<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			Kortingscurve: korting in % per aantal porties
		</div>
		<div class="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
			<div>
				<div class="overflow-x-auto">
					<table class="w-full min-w-[380px] text-sm">
						<thead class="text-xs text-muted-foreground">
							<tr>
								<th class="pb-1 text-left font-normal">Groep</th>
								{#each HOUR_TIER_POINTS as pt (pt)}
									<th class="pb-1 text-right font-normal">@{pt}</th>
								{/each}
								<th class="pb-1 pl-2 text-right font-normal">nu</th>
							</tr>
						</thead>
						<tbody>
							{#each DISCOUNT_GROUPS as g (g)}
								<tr class="border-t {g === activeGroup ? 'bg-muted/50' : ''}">
									<td class="py-1 pr-2 text-xs">{DISCOUNT_GROUP_LABELS[g]}</td>
									{#each HOUR_TIER_POINTS as pt (pt)}
										<td class="py-1 pl-1">
											<Input
												type="number"
												min="0"
												max="100"
												step="0.5"
												class="h-8 text-right"
												aria-label="Korting {DISCOUNT_GROUP_LABELS[g]} bij {pt} porties"
												bind:value={config.discountCurves[g][pt]}
											/>
										</td>
									{/each}
									<td class="py-1 pl-2 text-right text-xs text-muted-foreground tabular-nums">
										{discountPctAt(config, g, totalPortions)}%
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					Lineair tussen de ankers, vlak onder 25 en boven 400. De korting gaat van de productprijs
					af, inclusief extra persoon en inbegrepen reis. De losse reiskostenregel blijft heel. De
					startwaarden brengen de calculator op de websiteprijzen.
				</p>

				<div class="mt-4 mb-1 text-xs font-medium text-muted-foreground">
					Tweede top bij hapjes: de verplichte tweede persoon
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5">
						<Label for="cs-epd-pct">Extra korting vanaf {config.mandatoryExtraPersonAt} (%)</Label>
						<Input
							id="cs-epd-pct"
							type="number"
							min="0"
							max="100"
							step="0.5"
							bind:value={config.extraPersonDiscountPct}
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="cs-epd-zero">Uitgedoofd bij (porties)</Label>
						<Input
							id="cs-epd-zero"
							type="number"
							min="0"
							step="5"
							bind:value={config.extraPersonDiscountZeroAt}
						/>
					</div>
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					Vanaf {config.mandatoryExtraPersonAt} porties komt er in één keer een tweede persoon bij. Die
					stap vangt de curve op met een sprong in de korting op de drempel, die daarna lineair uitdooft.
					Daarom heeft de hapjescurve twee toppen: één voor kleine klussen en één op de drempel.
				</p>
			</div>
			<DiscountSketch
				config={$state.snapshot(config) as PricingConfig}
				product={sketchProduct}
				currentPortions={totalPortions}
				{fruitCost}
				{burrataIngredientCost}
			/>
		</div>
	</div>

	<div class="lg:col-span-2">
		<div class="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			Overige aannames
		</div>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
			{#each numberFields as f (f.key)}
				<div class="space-y-1.5">
					<Label for="cs-{f.key}">{f.label}</Label>
					<Input
						id="cs-{f.key}"
						type="number"
						min="0"
						step={f.step}
						value={numOf(f.key)}
						oninput={(e) => setNum(f.key, e.currentTarget.value)}
					/>
					{#if f.hint}<p class="text-xs text-muted-foreground">{f.hint}</p>{/if}
				</div>
			{/each}
		</div>
		<p class="mt-3 text-xs text-muted-foreground">
			Duwt iemand op de prijs? Geef er liever iets bij dan eraf. Extra porties of een schaaltje voor
			het bruidspaar kosten ons bijna niks en voelen als winst.
		</p>
	</div>
</div>
