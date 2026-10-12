<script lang="ts">
	import { describeAttribution } from '$lib/attribution';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Deal } from '$lib/deals';
	import FormCard from './FormCard.svelte';
	import { selectClass } from './shared';

	// Who, what, where, when. Rarely edited after intake.
	let { deal }: { deal: Deal } = $props();

	const measured = $derived(describeAttribution(deal.firstTouch));

	// Meta Conversions API trail: consent ticked on the form, Lead / Purchase
	// accepted by Meta. Read-only; the server stamps these.
	const dateOf = (iso: string | null) => (iso ? iso.slice(0, 10) : 'nee');
	const metaLine = $derived(
		deal.metaConsentAt
			? `toestemming ${dateOf(deal.metaConsentAt)} · lead verstuurd ${dateOf(deal.metaLeadSentAt)} · boeking verstuurd ${dateOf(deal.metaPurchaseSentAt)}`
			: 'geen toestemming'
	);
</script>

{#snippet row(title: string)}
	<div class="pt-1.5 text-xs text-muted-foreground">{title}</div>
{/snippet}

<FormCard id="contact" title="Klant & event" dealId={deal.id}>
	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		{@render row('Klant')}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="c-name" class="text-xs text-muted-foreground">Naam</Label>
				<Input id="c-name" name="name" value={deal.name} maxlength={100} required />
			</div>
			<div class="space-y-1">
				<Label for="c-email" class="text-xs text-muted-foreground">E-mail</Label>
				<Input id="c-email" name="email" type="email" value={deal.email} maxlength={254} />
			</div>
			<div class="space-y-1">
				<Label for="c-phone" class="text-xs text-muted-foreground">Telefoon</Label>
				<Input id="c-phone" name="phone" type="tel" value={deal.phone} maxlength={30} />
			</div>
		</div>
	</div>

	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		{@render row('Wat')}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="c-serviceType" class="text-xs text-muted-foreground">Concept</Label>
				<select id="c-serviceType" name="serviceType" class={selectClass} value={deal.serviceType}>
					<option value="">–</option>
					<option value="hapjes">Hapjes (live)</option>
					<option value="taart">Taart / dessert</option>
					<option value="anders">Anders / op maat</option>
				</select>
			</div>
			<div class="space-y-1">
				<Label for="c-choice" class="text-xs text-muted-foreground">Keuze</Label>
				<Input id="c-choice" name="choice" value={deal.choice} maxlength={120} />
			</div>
			<div class="space-y-1">
				<Label for="c-guests" class="text-xs text-muted-foreground">Gasten</Label>
				<Input id="c-guests" name="guests" value={deal.guests} maxlength={10} inputmode="numeric" />
			</div>
		</div>
	</div>

	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		{@render row('Waar & wanneer')}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="c-eventDate" class="text-xs text-muted-foreground">Datum</Label>
				<Input id="c-eventDate" name="eventDate" type="date" value={deal.eventDate ?? ''} />
				{#if !deal.eventDate && deal.eventDateText}
					<p class="text-xs text-muted-foreground">Klant schreef: "{deal.eventDateText}"</p>
				{/if}
			</div>
			<div class="space-y-1">
				<Label for="c-dagdeel" class="text-xs text-muted-foreground">Dagdeel · tijd</Label>
				<div class="flex gap-1">
					<Input
						id="c-dagdeel"
						name="dagdeel"
						value={deal.dagdeel}
						maxlength={40}
						placeholder="middag"
					/>
					<Input
						name="servingTime"
						value={deal.servingTime}
						maxlength={20}
						placeholder="16:00"
						aria-label="Tijd"
						class="w-20"
					/>
				</div>
			</div>
			<div class="space-y-1">
				<Label for="c-location" class="text-xs text-muted-foreground">Locatie</Label>
				<Input id="c-location" name="location" value={deal.location} maxlength={200} />
			</div>
		</div>
	</div>

	<div class="grid grid-cols-[6rem_1fr] items-start gap-3">
		{@render row('Bron')}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="c-source" class="text-xs text-muted-foreground">Wat ze zeiden</Label>
				<Input id="c-source" name="source" value={deal.source} maxlength={200} />
			</div>
			<div class="space-y-1">
				<Label for="c-attribution" class="text-xs text-muted-foreground">Echte bron</Label>
				<Input
					id="c-attribution"
					name="attribution"
					value={deal.attribution}
					maxlength={200}
					placeholder="overschrijft in de cijfers"
				/>
			</div>
			<div class="space-y-1">
				<span class="text-xs text-muted-foreground">Gemeten (site)</span>
				<p class="flex h-8 items-center truncate text-sm" title={deal.firstTouch}>
					{measured || 'niet gemeten'}
				</p>
			</div>
		</div>
		<p class="text-xs text-muted-foreground">Meta: {metaLine}</p>
	</div>

	{#if deal.message}
		<div class="grid grid-cols-[6rem_1fr] items-start gap-3 border-t pt-4">
			{@render row('Bericht')}
			<p class="text-sm whitespace-pre-wrap">{deal.message}</p>
		</div>
	{/if}
</FormCard>
