<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import { TIME_PHASES, revenueExcl, type Deal } from '$lib/deals';
	import FormCard from './FormCard.svelte';

	// Costs and hours per phase. Feeds the margin section of the funnel report.
	let { deal }: { deal: Deal } = $props();

	// Writable deriveds: editable locally, reset to the stored values on refresh.
	let costs = $derived(deal.costs ?? 0);
	let time = $derived(
		Object.fromEntries(TIME_PHASES.map((p) => [p.key, deal.timeSpent[p.key] ?? 0])) as Record<
			string,
			number
		>
	);

	const excl = $derived(revenueExcl(deal));
	const takeHome = $derived(excl - (Number(costs) || 0));
	const hours = $derived(Object.values(time).reduce((sum, h) => sum + (Number(h) || 0), 0));
	const hourly = $derived(hours > 0 ? takeHome / hours : null);
</script>

<FormCard id="uren" title="Uren & kosten" dealId={deal.id}>
	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		<div class="pt-1.5 text-xs text-muted-foreground">Kosten</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="h-costs" class="text-xs text-muted-foreground">Excl. btw</Label>
				<!-- step="any": costs can come from the quote JSON with more decimals. -->
				<Input
					id="h-costs"
					name="costs"
					type="number"
					step="any"
					min="0"
					inputmode="decimal"
					bind:value={costs}
				/>
			</div>
			<p class="text-xs text-muted-foreground sm:col-span-2 sm:pt-6">
				Ingrediënten, verpakking, reizen, huur.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		<div class="pt-1.5 text-xs text-muted-foreground">Uren</div>
		<!-- step="any": hours are free-form, a stricter step would block saving. -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each TIME_PHASES as p (p.key)}
				<div class="space-y-1">
					<Label for="h-time-{p.key}" class="text-xs text-muted-foreground">{p.label}</Label>
					<Input
						id="h-time-{p.key}"
						name="time_{p.key}"
						type="number"
						step="any"
						min="0"
						inputmode="decimal"
						value={time[p.key]}
						oninput={(e) => (time = { ...time, [p.key]: Number(e.currentTarget.value) || 0 })}
					/>
				</div>
			{/each}
		</div>
	</div>

	<dl class="grid grid-cols-2 gap-3 border-t pt-4 text-sm sm:grid-cols-4">
		<div>
			<dt class="text-xs text-muted-foreground">Omzet excl. btw</dt>
			<dd class="tabular-nums">{formatEUR(excl)}</dd>
		</div>
		<div>
			<dt class="text-xs text-muted-foreground">Take-home</dt>
			<dd class="tabular-nums">{formatEUR(takeHome)}</dd>
		</div>
		<div>
			<dt class="text-xs text-muted-foreground">Uren</dt>
			<dd class="tabular-nums">{hours}</dd>
		</div>
		<div>
			<dt class="text-xs text-muted-foreground">Per uur</dt>
			<dd class="font-medium tabular-nums">{hourly == null ? '–' : formatEUR(hourly)}</dd>
		</div>
	</dl>
</FormCard>
