<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { keepValues, selectClass } from '$lib/admin/aanvraag/shared';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Nieuwe aanvraag · admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="space-y-5">
	<a href="/admin/aanvragen" class="text-sm text-muted-foreground hover:underline">
		‹ Alle aanvragen
	</a>

	{#if !data.dbConfigured}
		<div class="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
			Geen database geconfigureerd. Zet <code>DATABASE_URL</code> in de omgeving om aanvragen op te slaan.
		</div>
	{/if}

	{#if form?.error}
		<div class="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/create"
		class="space-y-4 border bg-card p-5"
		use:enhance={keepValues}
	>
		<div>
			<h1 class="font-heading text-2xl">Aanvraag toevoegen</h1>
			<p class="text-sm text-muted-foreground">
				Maak een prospect aan met de basisgegevens. Bedragen, betalingen en offertegegevens voeg je
				daarna toe op de detailpagina.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-1">
				<Label for="add-name">Naam *</Label>
				<Input id="add-name" name="name" required maxlength={100} />
			</div>
			<div class="space-y-1">
				<Label for="add-email">E-mail</Label>
				<Input id="add-email" name="email" type="email" maxlength={254} />
			</div>
			<div class="space-y-1">
				<Label for="add-phone">Telefoon</Label>
				<Input id="add-phone" name="phone" type="tel" maxlength={30} />
			</div>
			<div class="space-y-1">
				<Label for="add-eventDate">Datum event</Label>
				<Input id="add-eventDate" name="eventDate" type="date" />
			</div>
			<div class="space-y-1">
				<Label for="add-location">Locatie</Label>
				<Input id="add-location" name="location" maxlength={200} />
			</div>
			<div class="space-y-1">
				<Label for="add-guests">Aantal gasten</Label>
				<Input id="add-guests" name="guests" maxlength={10} inputmode="numeric" />
			</div>
			<div class="space-y-1">
				<Label for="add-serviceType">Concept</Label>
				<select id="add-serviceType" name="serviceType" class={selectClass}>
					<option value="">–</option>
					<option value="hapjes">Hapjes (live)</option>
					<option value="taart">Taart / dessert</option>
					<option value="anders">Anders / op maat</option>
				</select>
			</div>
			<div class="space-y-1">
				<Label for="add-choice">Keuze</Label>
				<Input id="add-choice" name="choice" maxlength={120} />
			</div>
			<div class="space-y-1">
				<Label for="add-source">Hoe gevonden (bron, wat ze zeiden)</Label>
				<Input
					id="add-source"
					name="source"
					maxlength={200}
					placeholder="Instagram, Google, mond-tot-mond…"
				/>
			</div>
			<div class="space-y-1">
				<Label for="add-attribution">Attributie (echte bron, als je 't weet)</Label>
				<Input
					id="add-attribution"
					name="attribution"
					maxlength={200}
					placeholder="overschrijft bron in de cijfers"
				/>
			</div>
			<div class="space-y-1">
				<Label for="add-createdAt">Oorspronkelijke datum (backfill)</Label>
				<Input id="add-createdAt" name="createdAt" type="date" />
				<p class="text-xs text-muted-foreground">
					Alleen voor oude aanvragen: de datum waarop de aanvraag echt binnenkwam.
				</p>
			</div>
		</div>

		<div class="space-y-1">
			<Label for="add-message">Bericht</Label>
			<Textarea id="add-message" name="message" rows={2} maxlength={5000} />
		</div>
		<div class="space-y-1">
			<Label for="add-notes">Interne notitie</Label>
			<Textarea id="add-notes" name="notes" rows={2} maxlength={5000} />
		</div>

		<div class="flex gap-2">
			<Button type="submit" disabled={!data.dbConfigured}>Opslaan</Button>
			<Button href="/admin/aanvragen" variant="outline">Annuleren</Button>
		</div>
	</form>
</div>
