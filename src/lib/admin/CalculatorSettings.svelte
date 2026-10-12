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
		type InternalBreakdown,
		type PricingConfig
	} from '$lib/admin/pricing';

	// Everything you set once and rarely touch: rates per phase, the hour matrix
	// and the remaining assumptions. Lives folded away under the calculator.
	let {
		config = $bindable(),
		standbyHours = $bindable(),
		internals,
		totalPortions
	}: {
		config: PricingConfig;
		standbyHours: number;
		internals: InternalBreakdown;
		totalPortions: number;
	} = $props();

	// Generic number fields: these keys all hold plain numbers.
	type NumKey = keyof PricingConfig;
	const numOf = (key: NumKey) => config[key] as unknown as number;
	const setNum = (key: NumKey, raw: string) => {
		const n = Number(raw);
		if (Number.isFinite(n)) (config as unknown as Record<string, number>)[key] = n;
	};

	const fmtHours = (h: number) => h.toFixed(2).replace('.', ',') + 'u';

	// Travel is priced per km now; its hourly rate is only a benchmark, shown below.
	const workStages = $derived(internals.stages.filter((s) => s.stage !== 'travel'));

	const numberFields: { key: keyof PricingConfig; label: string; step: number; hint?: string }[] = [
		{ key: 'portionsPerHour', label: 'Porties per uur (lopen)', step: 5 },
		{ key: 'tiramisuCakePrepFactor', label: 'Taart-prep factor (×)', step: 0.05 },
		{ key: 'materialsMarkup', label: 'Materiaal-markup (×)', step: 0.05 },
		{ key: 'mixSharedDeduction', label: 'Mix gedeelde aftrek (€)', step: 5 },
		{ key: 'mandatoryExtraPersonAt', label: '2e persoon verplicht vanaf', step: 5 },
		{ key: 'extraPersonMinPortions2', label: '+2 toegestaan vanaf', step: 5 },
		{
			key: 'extraPersonChargeFactor',
			label: '2e persoon doorbelasten (×)',
			step: 0.05,
			hint: 'Onder 1 leg je bewust toe.'
		},
		{ key: 'volumeDiscountPercent', label: 'Volumekorting (%)', step: 1 },
		{ key: 'volumeDiscountThreshold', label: 'Volumekorting vanaf', step: 50 },
		{ key: 'smallOrderReliefMax', label: 'Kleine-klus-korting (€)', step: 5 },
		{ key: 'smallOrderReliefFullAt', label: 'Volle korting t/m', step: 5 },
		{ key: 'smallOrderReliefZeroAt', label: 'Korting weg vanaf', step: 5 },
		{ key: 'cakeboardPrice', label: 'Cakeboard prijs (€)', step: 0.25 },
		{ key: 'cakeboardPerPersons', label: 'Cakeboard per (personen)', step: 1 }
	];

	const travelFields: { key: keyof PricingConfig; label: string; step: number }[] = [
		{ key: 'travelSpeedKmh', label: 'Gem. snelheid (km/u)', step: 5 },
		{ key: 'vehicleCostPerKm', label: 'Autokosten per km (€)', step: 0.01 },
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
				{#each workStages as s (s.stage)}
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
			Opbouw en wachttijd zijn uren per persoon. Wachttijd verschilt per klus, dus zet je per
			offerte.
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
			<div class="space-y-1.5">
				<Label for="cs-travelrate">Ijkpunt rijden (€/u)</Label>
				<Input
					id="cs-travelrate"
					type="number"
					min="0"
					step="5"
					bind:value={config.hourlyRates.travel}
				/>
			</div>
		</div>
		<p class="mt-2 text-xs text-muted-foreground">
			Inbegrepen reis: {config.freeRoundTripKm} km retour × {formatEUR(config.kmPriceDefault)} =
			{formatEUR(includedTravelFee(config))} in elke productprijs.
		</p>
		<p class="mt-1 text-xs text-muted-foreground">
			Het ijkpunt stuurt de prijs niet. Het laat zien of een km-prijs genoeg oplevert: bij
			{formatEUR(config.kmPriceMin)} is dat {formatEUR(
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
			Lineair tussen de ankers, onder 25 vlak, boven 400 doorgetrokken. Taart-prep volgt de
			tiramisu-curve op {config.tiramisuCakePrepFactor}× portiegrootte; lopen volgt porties per uur.
		</p>
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
