<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatEUR } from '$lib/admin/calc';
	import type { Deal } from '$lib/deals';
	import FormCard from './FormCard.svelte';

	// Dates, follow-up and money. Status, reden and kans live in the header and
	// sidebar, so this card never changes the stage: what you see is what's stored.
	let { deal }: { deal: Deal } = $props();

	// Writable deriveds: editable locally, reset to the stored values on refresh.
	let offerteAmount = $derived(deal.offerteAmount ?? 0);
	let btwAmount = $derived(deal.btwAmount ?? 0);
	const excl = $derived((Number(offerteAmount) || 0) - (Number(btwAmount) || 0));

	// Fill btw from a rate applied to the (incl. btw) total.
	const applyRate = (rate: number) => {
		const incl = Number(offerteAmount) || 0;
		btwAmount = rate > 0 ? Math.round((incl - incl / (1 + rate / 100)) * 100) / 100 : 0;
	};

	type DateField = { name: keyof Deal & string; label: string };
	const groups: { title: string; fields: DateField[] }[] = [
		{
			title: 'Offerte',
			fields: [
				{ name: 'firstReplyOn', label: 'Eerste reactie' },
				{ name: 'offerteVerstuurdOp', label: 'Verstuurd' },
				{ name: 'geldigTot', label: 'Geldig tot' }
			]
		},
		{
			title: 'Opvolgen',
			fields: [
				{ name: 'herinnering1Op', label: 'Herinnering 1' },
				{ name: 'herinnering2Op', label: 'Herinnering 2' },
				{ name: 'gebeldOp', label: 'Gebeld' }
			]
		},
		{
			title: 'Boeking',
			fields: [
				{ name: 'geaccepteerdOp', label: 'Geaccepteerd' },
				{ name: 'factuurVerstuurdOp', label: 'Factuur verstuurd' },
				{ name: 'betaaldOp', label: 'Betaald' }
			]
		}
	];

	const dateOf = (name: string) => ((deal as Record<string, unknown>)[name] as string | null) ?? '';
</script>

<FormCard id="pijplijn" title="Datums & bedrag" dealId={deal.id}>
	{#each groups as g (g.title)}
		<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
			<div class="pt-1.5 text-xs text-muted-foreground">{g.title}</div>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{#each g.fields as f (f.name)}
					<div class="space-y-1">
						<Label for="p-{f.name}" class="text-xs text-muted-foreground">{f.label}</Label>
						<Input id="p-{f.name}" name={f.name} type="date" value={dateOf(f.name)} />
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if deal.status === 'afgewezen' || deal.status === 'afgewezen_intern' || deal.afgewezenOp}
		<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
			<div class="pt-1.5 text-xs text-muted-foreground">Afwijzing</div>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div class="space-y-1">
					<Label for="p-afgewezenOp" class="text-xs text-muted-foreground">Afgewezen op</Label>
					<Input id="p-afgewezenOp" name="afgewezenOp" type="date" value={deal.afgewezenOp ?? ''} />
				</div>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-[6rem_1fr] items-start gap-3 border-t pt-4">
		<div class="pt-1.5 text-xs text-muted-foreground">Bedrag</div>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="p-offerteAmount" class="text-xs text-muted-foreground">Incl. btw</Label>
				<Input
					id="p-offerteAmount"
					name="offerteAmount"
					type="number"
					step="0.01"
					min="0"
					inputmode="decimal"
					bind:value={offerteAmount}
				/>
			</div>
			<div class="space-y-1">
				<Label for="p-btwAmount" class="text-xs text-muted-foreground">Btw</Label>
				<div class="flex gap-1">
					<Input
						id="p-btwAmount"
						name="btwAmount"
						type="number"
						step="0.01"
						min="0"
						inputmode="decimal"
						class="flex-1"
						bind:value={btwAmount}
					/>
					<select
						class="h-8 shrink-0 rounded-lg border border-input bg-background px-1 text-xs"
						aria-label="Btw-percentage toepassen"
						onchange={(e) => {
							applyRate(Number(e.currentTarget.value));
							e.currentTarget.selectedIndex = 0;
						}}
					>
						<option value="">%</option>
						<option value="9">9%</option>
						<option value="21">21%</option>
						<option value="0">0%</option>
					</select>
				</div>
			</div>
			<div class="space-y-1">
				<span class="text-xs text-muted-foreground">Excl. btw</span>
				<div class="flex h-8 items-center text-sm tabular-nums">{formatEUR(excl)}</div>
			</div>
		</div>
	</div>

	{#snippet footer()}
		{#if deal.quoteVersions.length > 0}
			Bedrag en btw volgen de actieve offerteversie.
		{/if}
	{/snippet}
</FormCard>
