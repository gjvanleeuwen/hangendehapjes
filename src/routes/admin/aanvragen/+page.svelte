<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Calendar, Day as CalendarDay } from '$lib/components/ui/calendar';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import {
		DEAL_STATUSES,
		STATUS_LABELS,
		TIME_PHASES,
		isWon,
		isCalendarEvent,
		type Deal
	} from '$lib/deals';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { SvelteMap } from 'svelte/reactivity';

	let { data, form } = $props();

	let showAdd = $state(false);
	let editingId = $state<string | null>(null);

	// Live financial + time state for the open editor (one row at a time).
	let edit = $state({
		offerteAmount: 0,
		btwAmount: 0,
		costs: 0,
		time: {} as Record<string, number>
	});

	const openEdit = (d: Deal) => {
		editingId = d.id;
		edit = {
			offerteAmount: d.offerteAmount ?? 0,
			btwAmount: d.btwAmount ?? 0,
			costs: d.costs ?? 0,
			time: Object.fromEntries(TIME_PHASES.map((p) => [p.key, d.timeSpent[p.key] ?? 0]))
		};
	};

	const editExcl = $derived((edit.offerteAmount || 0) - (edit.btwAmount || 0));
	const editTakeHome = $derived(editExcl - (edit.costs || 0));
	const editHours = $derived(
		Object.values(edit.time).reduce((sum, h) => sum + (Number(h) || 0), 0)
	);
	const editHourly = $derived(editHours > 0 ? editTakeHome / editHours : null);

	// Convenience: fill BTW from a rate applied to the (incl. BTW) total.
	const applyRate = (rate: number) => {
		const incl = edit.offerteAmount || 0;
		edit.btwAmount = rate > 0 ? Math.round((incl - incl / (1 + rate / 100)) * 100) / 100 : 0;
	};

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

	// Booked or in-optie deals that have a real date.
	const eventDeals = $derived(data.deals.filter((d) => isCalendarEvent(d) && d.eventDate));

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

	// The list always shows every upcoming event, independent of which months the
	// calendar is currently showing — navigating the calendar never filters it.
	const shownByDate = $derived.by(() => {
		const m = new SvelteMap<string, Deal[]>();
		for (const d of upcomingEvents) {
			const list = m.get(d.eventDate as string) ?? [];
			list.push(d);
			m.set(d.eventDate as string, list);
		}
		return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	});

	// Match the list height to the calendar so the rest scrolls.
	let calHeight = $state(0);

	// Colour the "geldig tot" date for offertes/opties still awaiting a reply,
	// so chasing is readable straight from the table (no separate reminder box).
	const geldigClass = (d: Deal) => {
		if (!d.geldigTot || (d.status !== 'offerte_verstuurd' && d.status !== 'in_optie')) return '';
		if (d.geldigTot < data.today) return 'text-destructive font-medium'; // verlopen
		if (d.geldigTot <= data.soon) return 'font-medium text-amber-600'; // verloopt binnenkort
		return '';
	};
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
					<Label for="add-source">Hoe gevonden (bron, wat ze zeiden)</Label>
					<Input id="add-source" name="source" maxlength={200} placeholder="Instagram, Google, mond-tot-mond…" />
				</div>
				<div class="space-y-1">
					<Label for="add-attribution">Attributie (echte bron, als je 't weet)</Label>
					<Input id="add-attribution" name="attribution" maxlength={200} placeholder="overschrijft bron in de cijfers" />
				</div>
				<div class="space-y-1">
					<Label for="add-offerteAmount">Offertebedrag (€)</Label>
					<Input id="add-offerteAmount" name="offerteAmount" inputmode="decimal" placeholder="0,00" />
				</div>
				<div class="space-y-1">
					<Label for="add-btwAmount">Btw-bedrag (€)</Label>
					<Input id="add-btwAmount" name="btwAmount" inputmode="decimal" placeholder="0,00" />
				</div>
				<div class="space-y-1">
					<Label for="add-costs">Kosten (excl. btw, €)</Label>
					<Input id="add-costs" name="costs" inputmode="decimal" placeholder="0,00" />
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

	<!-- Agenda: booked events on a calendar + height-matched scrollable list -->
	{#if eventDeals.length > 0}
		<section class="space-y-2">
			<div class="flex items-center justify-between gap-2">
				<h2 class="font-heading text-lg">📅 Agenda</h2>
			</div>
			<div class="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
				<div class="bg-card border" bind:clientHeight={calHeight}>
					<Calendar
						type="single"
						bind:placeholder
						numberOfMonths={2}
						locale="nl-NL"
						weekdayFormat="short"
					>
						{#snippet day({ day: date, outsideMonth })}
							{@const evs = eventsByDate.get(keyOf(date))}
							<CalendarDay>
								{date.day}
								{#if !outsideMonth && evs}
									<span
										class="{evs.some(isWon)
											? 'bg-primary'
											: 'bg-amber-500'} block size-1 rounded-full"
										aria-hidden="true"
									></span>
								{/if}
							</CalendarDay>
						{/snippet}
					</Calendar>
				</div>

				<div class="bg-card flex flex-col border">
					<div class="bg-muted border-b p-2 text-sm font-medium">
						Aankomende events · {upcomingEvents.length}
					</div>
					<div
						class="overflow-y-auto"
						style="max-height: {calHeight ? `${calHeight}px` : '22rem'}"
					>
						{#if shownByDate.length === 0}
							<p class="text-muted-foreground p-4 text-sm">
								Nog geen geboekte events.
							</p>
						{:else}
							{#each shownByDate as [date, evs] (date)}
								<div class="border-b last:border-b-0">
									<div class="bg-muted/40 text-muted-foreground px-3 py-1 text-xs font-medium">
										{formatDateNL(date)}
									</div>
									{#each evs as d (d.id)}
										<div class="px-3 py-2 text-sm">
											<div class="flex items-center gap-2">
												<span class="font-medium">{d.name}</span>
												{#if d.status === 'in_optie'}
													<span class="bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
														optie{#if d.geldigTot} t/m {formatDateNL(d.geldigTot)}{/if}
													</span>
												{/if}
											</div>
											<div class="text-muted-foreground text-xs">
												{#if d.serviceType}{serviceLabel(d)}{/if}
												{#if d.guests}· {d.guests} gasten{/if}
												{#if d.location}· {d.location}{/if}
											</div>
											{#if d.notes}<div class="text-muted-foreground mt-0.5 text-xs italic">{d.notes}</div>{/if}
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
						<td class="p-2 whitespace-nowrap {geldigClass(d)}">
							{d.geldigTot ? formatDateNL(d.geldigTot) : '—'}
						</td>
						<td class="space-x-2 p-2 whitespace-nowrap">
							<button
								type="button"
								class="underline"
								onclick={() => (editingId === d.id ? (editingId = null) : openEdit(d))}
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
											<Label for="e-source-{d.id}">Bron (wat ze zeiden)</Label>
											<Input id="e-source-{d.id}" name="source" value={d.source} maxlength={200} />
										</div>
										<div class="space-y-1">
											<Label for="e-attribution-{d.id}">Attributie (echte bron)</Label>
											<Input
												id="e-attribution-{d.id}"
												name="attribution"
												value={d.attribution}
												maxlength={200}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-offerteAmount-{d.id}">Offertebedrag (incl. btw, €)</Label>
											<Input
												id="e-offerteAmount-{d.id}"
												name="offerteAmount"
												type="number"
												step="0.01"
												min="0"
												bind:value={edit.offerteAmount}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-btwAmount-{d.id}">Btw-bedrag (€)</Label>
											<div class="flex gap-1">
												<Input
													id="e-btwAmount-{d.id}"
													name="btwAmount"
													type="number"
													step="0.01"
													min="0"
													class="flex-1"
													bind:value={edit.btwAmount}
												/>
												<select
													class="border-input bg-background h-9 shrink-0 rounded-md border px-1 text-sm"
													onchange={(e) => {
														applyRate(Number(e.currentTarget.value));
														e.currentTarget.selectedIndex = 0;
													}}
												>
													<option value="">btw%</option>
													<option value="9">9%</option>
													<option value="21">21%</option>
													<option value="0">0%</option>
												</select>
											</div>
										</div>
										<div class="space-y-1">
											<Label for="e-costs-{d.id}">Kosten (excl. btw, €)</Label>
											<Input
												id="e-costs-{d.id}"
												name="costs"
												type="number"
												step="0.01"
												min="0"
												bind:value={edit.costs}
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
										<span class="text-sm font-medium">Tijd per fase (uren)</span>
										<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
											{#each TIME_PHASES as p (p.key)}
												<div class="space-y-1">
													<Label for="e-time-{p.key}-{d.id}" class="text-xs">{p.label}</Label>
													<Input
														id="e-time-{p.key}-{d.id}"
														name="time_{p.key}"
														type="number"
														step="0.25"
														min="0"
														bind:value={edit.time[p.key]}
													/>
												</div>
											{/each}
										</div>
									</div>
									<div class="bg-muted/40 flex flex-wrap gap-x-4 gap-y-1 p-2 text-sm">
										<span>Excl. btw: <strong>{formatEUR(editExcl)}</strong></span>
										<span>Take-home: <strong>{formatEUR(editTakeHome)}</strong></span>
										<span>Uren: <strong>{editHours}</strong></span>
										<span>Per uur: <strong>{editHourly == null ? '—' : formatEUR(editHourly)}</strong></span>
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
