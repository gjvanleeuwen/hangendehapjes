<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Calendar, Day as CalendarDay } from '$lib/components/ui/calendar';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import { DEAL_STATUSES, STATUS_LABELS, isWon, type Deal } from '$lib/deals';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { SvelteMap } from 'svelte/reactivity';

	let { data, form } = $props();

	let showAdd = $state(false);
	let editingId = $state<string | null>(null);

	const selectClass =
		'border-input bg-background h-9 w-full rounded-md border px-2 text-sm shadow-sm';

	const eventDisplay = (d: Deal) =>
		d.eventDate ? formatDateNL(d.eventDate) : d.eventDateText || '—';

	const serviceLabel = (d: Deal) =>
		d.serviceType === 'taart' ? 'Taart' : d.serviceType === 'hapjes' ? 'Hapjes' : d.serviceType;

	// Auto-submit the quick status form when the dropdown changes.
	const submitOnChange = (e: Event) => {
		(e.currentTarget as HTMLSelectElement).form?.requestSubmit();
	};

	// --- Agenda: booked events on a calendar + a height-matched list ---
	const pad = (n: number) => String(n).padStart(2, '0');
	const keyOf = (d: { year: number; month: number; day: number }) =>
		`${d.year}-${pad(d.month)}-${pad(d.day)}`;

	// Booked deals that have a real date.
	const eventDeals = $derived(data.deals.filter((d) => isWon(d) && d.eventDate));

	const eventsByDate = $derived.by(() => {
		const m = new SvelteMap<string, Deal[]>();
		for (const d of eventDeals) {
			const list = m.get(d.eventDate as string) ?? [];
			list.push(d);
			m.set(d.eventDate as string, list);
		}
		return m;
	});
	const eventDays = $derived(new Set(eventsByDate.keys()));

	const upcomingEvents = $derived(
		[...eventDeals]
			.filter((d) => (d.eventDate as string) >= data.today)
			.sort((a, b) => (a.eventDate as string).localeCompare(b.eventDate as string))
	);

	let placeholder = $state<DateValue>(today(getLocalTimeZone()));
	let selectedDay = $state<DateValue | undefined>(undefined);

	const selectedKey = $derived(selectedDay ? keyOf(selectedDay) : null);
	const shownEvents = $derived(
		selectedKey ? (eventsByDate.get(selectedKey) ?? []) : upcomingEvents
	);

	const shownByDate = $derived.by(() => {
		const m = new SvelteMap<string, Deal[]>();
		for (const d of shownEvents) {
			const list = m.get(d.eventDate as string) ?? [];
			list.push(d);
			m.set(d.eventDate as string, list);
		}
		return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	});

	// Match the list height to the calendar so the rest scrolls.
	let calHeight = $state(0);
</script>

<svelte:head>
	<title>Aanvragen — admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-heading text-2xl">Aanvragen & offertes</h1>
			<p class="text-muted-foreground text-sm">{data.deals.length} aanvragen in de pijplijn.</p>
		</div>
		<Button onclick={() => (showAdd = !showAdd)}>
			{showAdd ? 'Sluiten' : '+ Nieuwe aanvraag'}
		</Button>
	</div>

	{#if !data.dbConfigured}
		<div class="border-destructive/40 bg-destructive/5 text-destructive border p-4 text-sm">
			Geen database geconfigureerd. Zet <code>DATABASE_URL</code> in de omgeving (Dokploy Postgres)
			om aanvragen op te slaan.
		</div>
	{/if}

	{#if form?.error}
		<div class="border-destructive/40 bg-destructive/5 text-destructive border p-3 text-sm">
			{form.error}
		</div>
	{/if}

	<!-- Manual add / backfill -->
	{#if showAdd}
		<form
			method="POST"
			action="?/create"
			class="bg-card space-y-4 border p-5"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') showAdd = false;
				};
			}}
		>
			<div>
				<h2 class="font-heading text-lg">Aanvraag toevoegen</h2>
				<p class="text-muted-foreground text-sm">
					Handmatig of als backfill van eerdere aanvragen. Zet de
					<strong>oorspronkelijke datum</strong> bij backfill zodat de cijfers in de juiste maand vallen,
					en kies meteen de juiste status.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-1">
					<Label for="add-name">Naam *</Label>
					<Input id="add-name" name="name" required maxlength={100} />
				</div>
				<div class="space-y-1">
					<Label for="add-status">Status</Label>
					<select id="add-status" name="status" class={selectClass}>
						{#each DEAL_STATUSES as s (s)}
							<option value={s}>{STATUS_LABELS[s]}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1">
					<Label for="add-email">E-mail</Label>
					<Input id="add-email" name="email" type="email" maxlength={254} />
				</div>
				<div class="space-y-1">
					<Label for="add-phone">Telefoon</Label>
					<Input id="add-phone" name="phone" maxlength={30} />
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
					<Input id="add-guests" name="guests" maxlength={10} />
				</div>
				<div class="space-y-1">
					<Label for="add-serviceType">Concept</Label>
					<select id="add-serviceType" name="serviceType" class={selectClass}>
						<option value="">—</option>
						<option value="hapjes">Hapjes (live)</option>
						<option value="taart">Taart / dessert</option>
					</select>
				</div>
				<div class="space-y-1">
					<Label for="add-choice">Keuze</Label>
					<Input id="add-choice" name="choice" maxlength={120} />
				</div>
				<div class="space-y-1">
					<Label for="add-source">Hoe gevonden (bron)</Label>
					<Input id="add-source" name="source" maxlength={200} placeholder="Instagram, Google, mond-tot-mond…" />
				</div>
				<div class="space-y-1">
					<Label for="add-offerteAmount">Offertebedrag (€)</Label>
					<Input id="add-offerteAmount" name="offerteAmount" inputmode="decimal" placeholder="0,00" />
				</div>
				<div class="space-y-1">
					<Label for="add-offerteVerstuurdOp">Offerte verstuurd op</Label>
					<Input id="add-offerteVerstuurdOp" name="offerteVerstuurdOp" type="date" />
				</div>
				<div class="space-y-1">
					<Label for="add-geldigTot">Geldig tot</Label>
					<Input id="add-geldigTot" name="geldigTot" type="date" />
				</div>
				<div class="space-y-1">
					<Label for="add-geaccepteerdOp">Geaccepteerd op</Label>
					<Input id="add-geaccepteerdOp" name="geaccepteerdOp" type="date" />
				</div>
				<div class="space-y-1">
					<Label for="add-createdAt">Oorspronkelijke datum (backfill)</Label>
					<Input id="add-createdAt" name="createdAt" type="date" />
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
				<Button type="submit">Opslaan</Button>
				<Button type="button" variant="outline" onclick={() => (showAdd = false)}>Annuleren</Button>
			</div>
		</form>
	{/if}

	<!-- Attention: offertes expiring soon -->
	{#if data.expiringSoon.length > 0}
		<section class="border-l-4 border-amber-500 bg-amber-50 p-4">
			<h2 class="font-heading text-lg text-amber-900">⏳ Offertes verlopen binnenkort</h2>
			<p class="mb-3 text-sm text-amber-800">
				Deze offertes zijn verstuurd en lopen af — tijd om na te bellen of te mailen.
			</p>
			<ul class="space-y-2">
				{#each data.expiringSoon as d (d.id)}
					<li class="flex flex-wrap items-center justify-between gap-2 text-sm">
						<span>
							<strong>{d.name}</strong>
							{#if d.geldigTot}
								— geldig tot <strong>{formatDateNL(d.geldigTot)}</strong>
							{/if}
							{#if d.eventDate}<span class="text-amber-700"> (event {formatDateNL(d.eventDate)})</span>{/if}
						</span>
						{#if d.email}
							<a
								class="underline"
								href="mailto:{d.email}?subject={encodeURIComponent('Je offerte van Hangende Hapjes')}"
							>
								Mail {d.email}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Agenda: booked events on a calendar + height-matched scrollable list -->
	{#if eventDeals.length > 0}
		<section class="space-y-2">
			<div class="flex items-center justify-between gap-2">
				<h2 class="font-heading text-lg">📅 Agenda</h2>
				{#if selectedDay}
					<Button variant="outline" onclick={() => (selectedDay = undefined)}>
						Toon alle aankomende
					</Button>
				{/if}
			</div>
			<div class="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
				<div class="bg-card border" bind:clientHeight={calHeight}>
					<Calendar
						type="single"
						bind:value={selectedDay}
						bind:placeholder
						numberOfMonths={2}
						locale="nl-NL"
						weekdayFormat="short"
					>
						{#snippet day({ day: date, outsideMonth })}
							<CalendarDay>
								{date.day}
								{#if !outsideMonth && eventDays.has(keyOf(date))}
									<span class="bg-primary block size-1 rounded-full" aria-hidden="true"></span>
								{/if}
							</CalendarDay>
						{/snippet}
					</Calendar>
				</div>

				<div class="bg-card flex flex-col border">
					<div class="bg-muted border-b p-2 text-sm font-medium">
						{selectedKey ? formatDateNL(selectedKey) : 'Aankomende events'} · {shownEvents.length}
					</div>
					<div
						class="overflow-y-auto"
						style="max-height: {calHeight ? `${calHeight}px` : '22rem'}"
					>
						{#if shownByDate.length === 0}
							<p class="text-muted-foreground p-4 text-sm">
								{selectedKey ? 'Geen events op deze dag.' : 'Nog geen geboekte events.'}
							</p>
						{:else}
							{#each shownByDate as [date, evs] (date)}
								<div class="border-b last:border-b-0">
									<div class="bg-muted/40 text-muted-foreground px-3 py-1 text-xs font-medium">
										{formatDateNL(date)}
									</div>
									{#each evs as d (d.id)}
										<div class="px-3 py-2 text-sm">
											<div class="font-medium">{d.name}</div>
											<div class="text-muted-foreground text-xs">
												{#if d.serviceType}{serviceLabel(d)}{/if}
												{#if d.guests}· {d.guests} gasten{/if}
												{#if d.location}· {d.location}{/if}
											</div>
										</div>
									{/each}
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Calendar subscription -->
	{#if data.calendarUrl}
		<details class="bg-muted/30 border p-4 text-sm">
			<summary class="cursor-pointer font-medium">📆 Agenda koppelen (ICS)</summary>
			<p class="text-muted-foreground mt-2">
				Abonneer je agenda op deze link — geaccepteerde events verschijnen automatisch en blijven
				bijgewerkt. In Google Agenda: <em>Andere agenda's → Via URL</em>. Op iPhone/Mac:
				<em>open de webcal-link</em>. Houd de link geheim.
			</p>
			<div class="mt-2 space-y-1">
				<div>
					<a class="break-all underline" href={data.calendarUrl.replace(/^https?:/, 'webcal:')}>
						webcal-abonnement (klik om toe te voegen)
					</a>
				</div>
				<input
					readonly
					class="border-input bg-background w-full rounded-md border px-2 py-1 font-mono text-xs"
					value={data.calendarUrl}
					onclick={(e) => e.currentTarget.select()}
				/>
			</div>
		</details>
	{/if}

	<!-- All deals -->
	<div class="overflow-x-auto border">
		<table class="w-full min-w-[760px] text-sm">
			<thead class="bg-muted text-muted-foreground text-left">
				<tr>
					<th class="p-2 font-medium">Binnen</th>
					<th class="p-2 font-medium">Naam</th>
					<th class="p-2 font-medium">Event</th>
					<th class="p-2 font-medium">Wat</th>
					<th class="p-2 font-medium">Status</th>
					<th class="p-2 font-medium">Offerte</th>
					<th class="p-2 font-medium">Geldig tot</th>
					<th class="p-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each data.deals as d (d.id)}
					<tr class="border-t align-top">
						<td class="text-muted-foreground p-2 whitespace-nowrap">
							{formatDateNL(d.createdAt)}
						</td>
						<td class="p-2">
							<div class="font-medium">{d.name}</div>
							{#if d.email}<div class="text-muted-foreground text-xs">{d.email}</div>{/if}
							{#if d.phone}<div class="text-muted-foreground text-xs">{d.phone}</div>{/if}
							{#if d.source}<div class="text-muted-foreground text-xs">via {d.source}</div>{/if}
						</td>
						<td class="p-2">
							<div>{eventDisplay(d)}</div>
							{#if d.guests}<div class="text-muted-foreground text-xs">{d.guests} gasten</div>{/if}
							{#if d.location}<div class="text-muted-foreground text-xs">{d.location}</div>{/if}
						</td>
						<td class="p-2">
							{#if d.serviceType}{serviceLabel(d)}{/if}
							{#if d.choice}<div class="text-muted-foreground text-xs">{d.choice}</div>{/if}
						</td>
						<td class="p-2">
							<form method="POST" action="?/update" use:enhance>
								<input type="hidden" name="id" value={d.id} />
								<select name="status" class={selectClass} value={d.status} onchange={submitOnChange}>
									{#each DEAL_STATUSES as s (s)}
										<option value={s}>{STATUS_LABELS[s]}</option>
									{/each}
								</select>
							</form>
						</td>
						<td class="p-2 whitespace-nowrap">
							{d.offerteAmount != null ? formatEUR(d.offerteAmount) : '—'}
						</td>
						<td class="p-2 whitespace-nowrap">
							{d.geldigTot ? formatDateNL(d.geldigTot) : '—'}
						</td>
						<td class="space-x-2 p-2 whitespace-nowrap">
							<button
								type="button"
								class="underline"
								onclick={() => (editingId = editingId === d.id ? null : d.id)}
							>
								{editingId === d.id ? 'Sluiten' : 'Bewerk'}
							</button>
							<form method="POST" action="?/delete" class="inline" use:enhance>
								<input type="hidden" name="id" value={d.id} />
								<button
									type="submit"
									class="text-destructive underline"
									onclick={(e) => {
										if (!confirm(`Aanvraag van ${d.name} verwijderen?`)) e.preventDefault();
									}}
								>
									Verwijder
								</button>
							</form>
						</td>
					</tr>
					{#if editingId === d.id}
						<tr class="bg-muted/30 border-t">
							<td colspan="8" class="p-4">
								<form
									method="POST"
									action="?/update"
									class="space-y-4"
									use:enhance={() => {
										return async ({ result, update }) => {
											await update();
											if (result.type === 'success') editingId = null;
										};
									}}
								>
									<input type="hidden" name="id" value={d.id} />
									<div class="grid gap-3 sm:grid-cols-3">
										<div class="space-y-1">
											<Label for="e-name-{d.id}">Naam</Label>
											<Input id="e-name-{d.id}" name="name" value={d.name} maxlength={100} />
										</div>
										<div class="space-y-1">
											<Label for="e-email-{d.id}">E-mail</Label>
											<Input id="e-email-{d.id}" name="email" value={d.email} maxlength={254} />
										</div>
										<div class="space-y-1">
											<Label for="e-phone-{d.id}">Telefoon</Label>
											<Input id="e-phone-{d.id}" name="phone" value={d.phone} maxlength={30} />
										</div>
										<div class="space-y-1">
											<Label for="e-eventDate-{d.id}">Datum event</Label>
											<Input
												id="e-eventDate-{d.id}"
												name="eventDate"
												type="date"
												value={d.eventDate ?? ''}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-location-{d.id}">Locatie</Label>
											<Input id="e-location-{d.id}" name="location" value={d.location} maxlength={200} />
										</div>
										<div class="space-y-1">
											<Label for="e-guests-{d.id}">Gasten</Label>
											<Input id="e-guests-{d.id}" name="guests" value={d.guests} maxlength={10} />
										</div>
										<div class="space-y-1">
											<Label for="e-serviceType-{d.id}">Concept</Label>
											<select id="e-serviceType-{d.id}" name="serviceType" class={selectClass} value={d.serviceType}>
												<option value="">—</option>
												<option value="hapjes">Hapjes (live)</option>
												<option value="taart">Taart / dessert</option>
											</select>
										</div>
										<div class="space-y-1">
											<Label for="e-choice-{d.id}">Keuze</Label>
											<Input id="e-choice-{d.id}" name="choice" value={d.choice} maxlength={120} />
										</div>
										<div class="space-y-1">
											<Label for="e-source-{d.id}">Bron</Label>
											<Input id="e-source-{d.id}" name="source" value={d.source} maxlength={200} />
										</div>
										<div class="space-y-1">
											<Label for="e-offerteAmount-{d.id}">Offertebedrag (€)</Label>
											<Input
												id="e-offerteAmount-{d.id}"
												name="offerteAmount"
												inputmode="decimal"
												value={d.offerteAmount ?? ''}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-offerteVerstuurdOp-{d.id}">Offerte verstuurd op</Label>
											<Input
												id="e-offerteVerstuurdOp-{d.id}"
												name="offerteVerstuurdOp"
												type="date"
												value={d.offerteVerstuurdOp ?? ''}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-geldigTot-{d.id}">Geldig tot</Label>
											<Input id="e-geldigTot-{d.id}" name="geldigTot" type="date" value={d.geldigTot ?? ''} />
										</div>
										<div class="space-y-1">
											<Label for="e-geaccepteerdOp-{d.id}">Geaccepteerd op</Label>
											<Input
												id="e-geaccepteerdOp-{d.id}"
												name="geaccepteerdOp"
												type="date"
												value={d.geaccepteerdOp ?? ''}
											/>
										</div>
									</div>
									<div class="space-y-1">
										<Label for="e-notes-{d.id}">Interne notitie</Label>
										<Textarea id="e-notes-{d.id}" name="notes" rows={2} value={d.notes} maxlength={5000} />
									</div>
									<div class="flex gap-2">
										<Button type="submit">Opslaan</Button>
										<Button type="button" variant="outline" onclick={() => (editingId = null)}>
											Annuleren
										</Button>
									</div>
								</form>
							</td>
						</tr>
					{/if}
				{/each}
				{#if data.deals.length === 0}
					<tr>
						<td colspan="8" class="text-muted-foreground p-6 text-center">
							Nog geen aanvragen.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
