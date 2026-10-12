<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatDateNL } from '$lib/admin/calc';
	import type { Deal } from '$lib/deals';
	import {
		dateInputValue,
		keepValues,
		portalExpiryDate,
		portalLinkState,
		selectClass
	} from './shared';

	// The klantlink: make it, see whether it still works, lengthen it in one
	// click, copy it with a short message. Posts ?/generateAcceptance,
	// ?/extendAcceptance and ?/update.
	let {
		deal,
		origin,
		today,
		showSettings = true
	}: { deal: Deal; origin: string; today: string; showSettings?: boolean } = $props();

	const url = $derived(
		deal.acceptanceToken ? `${origin}/klantportaal/${deal.acceptanceToken}` : ''
	);
	const linkState = $derived(portalLinkState(deal, today));
	const expiry = $derived(portalExpiryDate(deal));
	const firstName = $derived(deal.name.trim().split(/\s+/)[0] ?? '');

	const banner = $derived.by(() => {
		switch (linkState) {
			case 'none':
				return { tone: 'border-border bg-muted/40', text: 'Nog geen klantlink.' };
			case 'expired':
				return {
					tone: 'border-destructive/40 bg-destructive/5 text-destructive',
					text: `Verlopen op ${formatDateNL(expiry)}. De klant ziet een foutmelding tot je hem verlengt.`
				};
			case 'soon':
				return {
					tone: 'border-amber-300 bg-amber-50 text-amber-900',
					text: `Verloopt ${formatDateNL(expiry)}.`
				};
			case 'off':
				return {
					tone: 'border-border bg-muted/40 text-muted-foreground',
					text: 'Staat uit. De klant kan de pagina niet openen.'
				};
			case 'accepted':
				return {
					tone: 'border-primary/30 bg-primary/5',
					text: `Akkoord gegeven. Link werkt${expiry ? ` t/m ${formatDateNL(expiry)}` : ''} voor de praktische vragen en betalingen.`
				};
			default:
				return {
					tone: 'border-emerald-300 bg-emerald-50 text-emerald-900',
					text: `Actief${expiry ? ` t/m ${formatDateNL(expiry)}` : ''}.`
				};
		}
	});

	// Starting point only: edit before sending.
	let message = $derived(
		`Hoi ${firstName}! Hier is jullie eigen pagina met de offerte: ${url}\nDaar kun je akkoord geven en een paar praktische vragen invullen. Vragen? Laat het gerust weten!\n\nGroetjes, Charlotte & Gijs`
	);

	let copied = $state('');
	const copy = async (what: 'link' | 'bericht', text: string) => {
		await navigator.clipboard.writeText(text);
		copied = what;
		setTimeout(() => (copied = ''), 1500);
	};
</script>

<div class="space-y-3">
	<div class="border px-3 py-2 text-sm {banner.tone}">{banner.text}</div>

	{#if url}
		<div class="grid gap-2 md:grid-cols-[1fr_auto_auto]">
			<Input readonly value={url} onclick={(e) => e.currentTarget.select()} />
			<Button href={url} variant="outline" target="_blank" rel="noreferrer">Open</Button>
			<Button type="button" variant="outline" onclick={() => copy('link', url)}>
				{copied === 'link' ? 'Gekopieerd' : 'Kopieer link'}
			</Button>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		{#if deal.acceptanceToken}
			{#each [14, 30] as days (days)}
				<form method="POST" action="?/extendAcceptance" use:enhance={keepValues}>
					<input type="hidden" name="id" value={deal.id} />
					<input type="hidden" name="days" value={days} />
					<Button
						type="submit"
						variant={linkState === 'expired' || linkState === 'soon' ? 'default' : 'outline'}
					>
						Verleng {days} dagen
					</Button>
				</form>
			{/each}
		{/if}
		<form method="POST" action="?/generateAcceptance" use:enhance={keepValues}>
			<input type="hidden" name="id" value={deal.id} />
			<Button
				type="submit"
				variant={deal.acceptanceToken ? 'ghost' : 'default'}
				onclick={(e) => {
					if (
						deal.acceptanceToken &&
						!confirm('Nieuwe link maken? De oude link werkt dan niet meer.')
					)
						e.preventDefault();
				}}
			>
				{deal.acceptanceToken ? 'Nieuwe link maken' : 'Klantlink maken'}
			</Button>
		</form>
	</div>

	{#if showSettings && deal.acceptanceToken}
		<form
			method="POST"
			action="?/update"
			class="grid grid-cols-2 items-end gap-3 sm:grid-cols-3"
			use:enhance={keepValues}
		>
			<input type="hidden" name="id" value={deal.id} />
			<div class="space-y-1">
				<Label for="pl-enabled">Link</Label>
				<select
					id="pl-enabled"
					name="acceptanceEnabled"
					class={selectClass}
					value={deal.acceptanceEnabled ? 'true' : 'false'}
				>
					<option value="true">Aan</option>
					<option value="false">Uit</option>
				</select>
			</div>
			<div class="space-y-1">
				<Label for="pl-expires">Geldig t/m</Label>
				<Input
					id="pl-expires"
					name="acceptanceExpiresAt"
					type="date"
					value={dateInputValue(deal.acceptanceExpiresAt)}
				/>
			</div>
			<Button type="submit" variant="outline">Opslaan</Button>
		</form>

		<div class="space-y-1">
			<Label for="pl-message">Bericht om mee te sturen</Label>
			<textarea
				id="pl-message"
				rows={4}
				bind:value={message}
				class="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
			></textarea>
			<Button type="button" variant="outline" size="sm" onclick={() => copy('bericht', message)}>
				{copied === 'bericht' ? 'Gekopieerd' : 'Kopieer bericht'}
			</Button>
		</div>
	{/if}
</div>
