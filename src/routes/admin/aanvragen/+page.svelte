<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Calendar, Day as CalendarDay } from '$lib/components/ui/calendar';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import {
		DEAL_STATUSES,
		DEFAULT_OPS_QUESTIONS,
		PREPAYMENT_STATUSES,
		PREPAYMENT_STATUS_LABELS,
		STATUS_LABELS,
		TIME_PHASES,
		isWon,
		isCalendarEvent,
		isPending,
		type Deal,
		type LeadTrend
	} from '$lib/deals';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { SvelteMap } from 'svelte/reactivity';

	let { data, form } = $props();

	let showAdd = $state(page.url.searchParams.get('add') === '1');
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

	const dateInputValue = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

	const acceptanceUrl = (d: Deal) =>
		d.acceptanceToken ? `${data.origin}/klantportaal/${d.acceptanceToken}` : '';

	const suggestedDeposit = (d: Deal) =>
		d.depositAmount ??
		d.prepaymentAmount ??
		(d.offerteAmount == null ? '' : Math.round((d.offerteAmount / 2) * 100) / 100);

	const suggestedFinalPayment = (d: Deal) => {
		if (d.finalPaymentAmount != null) return d.finalPaymentAmount;
		if (d.offerteAmount == null) return '';
		const deposit = Number(suggestedDeposit(d)) || 0;
		return Math.max(0, Math.round((d.offerteAmount - deposit) * 100) / 100);
	};

	const paymentLabel = (status: string) =>
		(PREPAYMENT_STATUSES as readonly string[]).includes(status)
			? PREPAYMENT_STATUS_LABELS[status as (typeof PREPAYMENT_STATUSES)[number]]
			: status || 'Onbekend';

	const portalQuestions = (d: Deal) =>
		d.opsQuestions.length > 0 ? d.opsQuestions : DEFAULT_OPS_QUESTIONS;

	const hasAcceptanceSnapshot = (d: Deal) => Object.keys(d.acceptanceSnapshot ?? {}).length > 0;

	const serviceLabel = (d: Deal) =>
		d.serviceType === 'taart' ? 'Taart' : d.serviceType === 'hapjes' ? 'Hapjes' : d.serviceType;

	const dealRank = (d: Deal) => {
		if (isWon(d) || d.acceptedTermsAt) return 0;
		if (d.status === 'in_optie') return 1;
		if (isPending(d)) return 2;
		if (d.status === 'nieuw') return 3;
		if (d.status === 'afgewezen_intern') return 4;
		if (d.status === 'afgewezen') return 5;
		return 6;
	};

	const dateKey = (d: Deal) => d.eventDate ?? d.geldigTot ?? d.createdAt.slice(0, 10);
	const sortedDeals = $derived(
		[...data.deals].sort((a, b) => {
			const rank = dealRank(a) - dealRank(b);
			if (rank) return rank;
			const aDate = dateKey(a);
			const bDate = dateKey(b);
			if (aDate !== bDate) {
				return dealRank(a) <= 2 ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
			}
			return b.updatedAt.localeCompare(a.updatedAt);
		})
	);

	const rowClass = (d: Deal) => {
		if (isWon(d) || d.acceptedTermsAt) return 'bg-primary/5';
		if (d.status === 'in_optie') return 'bg-amber-50/70';
		if (d.status === 'afgewezen' || d.status === 'afgewezen_intern') return 'opacity-60';
		return '';
	};

	const stateBadge = (d: Deal) => {
		if (d.acceptedTermsAt)
			return { label: 'Akkoord digitaal', className: 'bg-primary/10 text-primary' };
		if (isWon(d)) return { label: 'Geboekt', className: 'bg-primary/10 text-primary' };
		if (d.status === 'in_optie')
			return { label: 'In optie', className: 'bg-amber-100 text-amber-800' };
		if (d.status === 'offerte_verstuurd')
			return { label: 'Offerte uit', className: 'bg-amber-100 text-amber-800' };
		if (d.status === 'nieuw') return { label: 'Nieuw', className: 'bg-muted text-foreground' };
		return { label: STATUS_LABELS[d.status], className: 'bg-muted text-muted-foreground' };
	};

	const shortNote = (value: string) => {
		const note = value.trim();
		if (!note) return '';
		return note.length > 90 ? `${note.slice(0, 90).trim()}...` : note;
	};

	const calendarEventClass = (evs: Deal[] | undefined) => {
		if (!evs?.length) return '';
		if (evs.some(isWon)) {
			return 'border border-primary/40 bg-primary/15 text-primary font-semibold hover:bg-primary/20';
		}
		return 'border border-amber-300 bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200';
	};

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

	const m = $derived(data.metrics);
	const trend = $derived(data.trend);

	const monthLabel = (ym: string) => {
		const [y, mo] = ym.split('-');
		const names = [
			'jan',
			'feb',
			'mrt',
			'apr',
			'mei',
			'jun',
			'jul',
			'aug',
			'sep',
			'okt',
			'nov',
			'dec'
		];
		return `${names[Number(mo) - 1] ?? mo} ${y}`;
	};

	const trendText = (t: LeadTrend): string => {
		const dir = t.direction === 'drop' ? 'daling' : t.direction === 'rise' ? 'stijging' : 'gelijk';
		const p = `p=${t.pValue.toFixed(3).replace('.', ',')}`;
		switch (t.verdict) {
			case 'insufficient':
				return `Te weinig data (${t.total} leads in ${2 * t.windowDays} dgn).`;
			case 'significant':
				return t.direction === 'drop'
					? `Significante daling (${p}).`
					: `Significante stijging (${p}).`;
			case 'suggestive':
				return `Mogelijke ${dir} (${p}).`;
			default:
				return `Normale ruis (${p}).`;
		}
	};

	const trendClass = (t: LeadTrend): string => {
		if (t.verdict === 'significant')
			return t.direction === 'drop' ? 'font-medium text-red-600' : 'font-medium text-green-700';
		if (t.verdict === 'suggestive') return 'text-amber-600';
		return 'text-muted-foreground';
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
			<p class="text-sm text-muted-foreground">{data.deals.length} aanvragen in de pijplijn.</p>
		</div>
		<Button onclick={() => (showAdd = !showAdd)}>
			{showAdd ? 'Sluiten' : '+ Nieuwe aanvraag'}
		</Button>
	</div>

	{#if !data.dbConfigured}
		<div class="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
			Geen database geconfigureerd. Zet <code>DATABASE_URL</code> in de omgeving (Dokploy Postgres) om
			aanvragen op te slaan.
		</div>
	{/if}

	{#if form?.error}
		<div class="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
			{form.error}
		</div>
	{/if}

	{#if data.dbConfigured}
		<section class="space-y-3">
			<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.total}</div>
					<div class="text-xs text-muted-foreground">Aanvragen</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.open}</div>
					<div class="text-xs text-muted-foreground">Open</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{m.conversionPct}%</div>
					<div class="text-xs text-muted-foreground">Offerte → geboekt</div>
				</div>
				<div class="border bg-card p-3">
					<div class="text-2xl font-semibold">{formatEUR(m.pendingValue)}</div>
					<div class="text-xs text-muted-foreground">Openstaand</div>
				</div>
			</div>

			<details class="border bg-card p-4 text-sm">
				<summary class="cursor-pointer font-medium">Analytics</summary>
				<div class="mt-4 space-y-4">
					<div class="grid gap-3 md:grid-cols-[1fr_1.2fr]">
						<div class="border bg-background p-3">
							<div class="text-xs font-medium text-muted-foreground uppercase">Lead-trend</div>
							<div class="mt-2 flex items-baseline gap-2">
								<span class="text-xl font-semibold">{trend.recent}</span>
								<span class="text-xs text-muted-foreground">laatste {trend.windowDays} dgn</span>
								<span class="text-muted-foreground">vs</span>
								<span class="text-xl font-semibold">{trend.prior}</span>
							</div>
							<p class="mt-1 {trendClass(trend)}">{trendText(trend)}</p>
						</div>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div class="border bg-background p-3">
								<div class="font-semibold">{formatEUR(m.wonValue)}</div>
								<div class="text-xs text-muted-foreground">Geboekt</div>
							</div>
							<div class="border bg-background p-3">
								<div class="font-semibold">{formatEUR(m.takeHome)}</div>
								<div class="text-xs text-muted-foreground">Take-home</div>
							</div>
							<div class="border bg-background p-3">
								<div class="font-semibold">{m.hourly == null ? '—' : formatEUR(m.hourly)}</div>
								<div class="text-xs text-muted-foreground">Per uur</div>
							</div>
							<div class="border bg-background p-3">
								<div class="font-semibold">{formatEUR(m.optieValue)}</div>
								<div class="text-xs text-muted-foreground">In optie</div>
							</div>
						</div>
					</div>

					<div class="grid gap-4 lg:grid-cols-2">
						{#if m.byMonth.length > 0}
							<div class="border">
								<div class="bg-muted p-2 text-xs font-medium uppercase">Per maand</div>
								<table class="w-full text-sm">
									<thead class="text-left text-xs text-muted-foreground">
										<tr>
											<th class="p-2 font-medium">Maand</th>
											<th class="p-2 font-medium">Aanvragen</th>
											<th class="p-2 font-medium">Offertes</th>
											<th class="p-2 font-medium">Geboekt</th>
										</tr>
									</thead>
									<tbody>
										{#each m.byMonth as row (row.month)}
											<tr class="border-t">
												<td class="p-2">{monthLabel(row.month)}</td>
												<td class="p-2">{row.leads}</td>
												<td class="p-2">{row.offertes}</td>
												<td class="p-2">{row.won}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						{#if m.bySource.length > 0}
							<div class="border">
								<div class="bg-muted p-2 text-xs font-medium uppercase">Per bron</div>
								<table class="w-full text-sm">
									<thead class="text-left text-xs text-muted-foreground">
										<tr>
											<th class="p-2 font-medium">Bron</th>
											<th class="p-2 font-medium">Aanvragen</th>
											<th class="p-2 font-medium">Geboekt</th>
										</tr>
									</thead>
									<tbody>
										{#each m.bySource.slice(0, 8) as row (row.source)}
											<tr class="border-t">
												<td class="p-2">{row.source}</td>
												<td class="p-2">{row.leads}</td>
												<td class="p-2">{row.won}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>

					{#if m.hours > 0}
						<div class="border">
							<div class="bg-muted p-2 text-xs font-medium uppercase">
								Tijd per fase · {m.hours} uur totaal
							</div>
							<table class="w-full text-sm">
								<thead class="text-left text-xs text-muted-foreground">
									<tr>
										<th class="p-2 font-medium">Fase</th>
										<th class="p-2 font-medium">Uren</th>
										<th class="p-2 font-medium">Klussen</th>
										<th class="p-2 font-medium">Gem.</th>
									</tr>
								</thead>
								<tbody>
									{#each m.byPhase as row (row.phase)}
										<tr class="border-t">
											<td class="p-2">{row.label}</td>
											<td class="p-2">{row.hours}</td>
											<td class="p-2">{row.deals}</td>
											<td class="p-2">{row.avg ? row.avg.toFixed(1) : '—'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</details>
		</section>
	{/if}

	<!-- Manual add / backfill -->
	{#if showAdd}
		<form
			method="POST"
			action="?/create"
			class="space-y-4 border bg-card p-5"
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') showAdd = false;
				};
			}}
		>
			<div>
				<h2 class="font-heading text-lg">Aanvraag toevoegen</h2>
				<p class="text-sm text-muted-foreground">
					Maak een prospect aan met de basisgegevens. Bedragen, betalingen en offertegegevens voeg
					je later toe via bewerken of door een offerte op te slaan.
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
				<div class="border bg-card" bind:clientHeight={calHeight}>
					<Calendar
						type="single"
						bind:placeholder
						numberOfMonths={2}
						locale="nl-NL"
						weekdayFormat="short"
					>
						{#snippet day({ day: date, outsideMonth })}
							{@const evs = eventsByDate.get(keyOf(date))}
							<CalendarDay class={!outsideMonth ? calendarEventClass(evs) : ''}>
								{date.day}
								{#if !outsideMonth && evs}
									<span class="text-[9px] leading-none font-medium opacity-90">
										{evs.length > 1
											? `${evs.length} events`
											: evs.some(isWon)
												? 'geboekt'
												: 'optie'}
									</span>
								{/if}
							</CalendarDay>
						{/snippet}
					</Calendar>
				</div>

				<div class="flex flex-col border bg-card">
					<div class="border-b bg-muted p-2 text-sm font-medium">
						Aankomende events · {upcomingEvents.length}
					</div>
					<div class="overflow-y-auto" style="max-height: {calHeight ? `${calHeight}px` : '22rem'}">
						{#if shownByDate.length === 0}
							<p class="p-4 text-sm text-muted-foreground">Nog geen geboekte events.</p>
						{:else}
							{#each shownByDate as [date, evs] (date)}
								<div class="border-b last:border-b-0">
									<div class="bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
										{formatDateNL(date)}
									</div>
									{#each evs as d (d.id)}
										<div class="px-3 py-2 text-sm">
											<div class="flex items-center gap-2">
												<span class="font-medium">{d.name}</span>
												{#if d.status === 'in_optie'}
													<span class="bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
														optie{#if d.geldigTot}
															t/m {formatDateNL(d.geldigTot)}{/if}
													</span>
												{/if}
											</div>
											<div class="text-xs text-muted-foreground">
												{#if d.serviceType}{serviceLabel(d)}{/if}
												{#if d.guests}· {d.guests} gasten{/if}
												{#if d.location}· {d.location}{/if}
											</div>
											{#if d.notes}<div class="mt-0.5 text-xs text-muted-foreground italic">
													{d.notes}
												</div>{/if}
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
		<details class="border bg-muted/30 p-4 text-sm">
			<summary class="cursor-pointer font-medium">📆 Agenda koppelen (ICS)</summary>
			<p class="mt-2 text-muted-foreground">
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
					class="w-full rounded-md border border-input bg-background px-2 py-1 font-mono text-xs"
					value={data.calendarUrl}
					onclick={(e) => e.currentTarget.select()}
				/>
			</div>
		</details>
	{/if}

	<!-- All deals -->
	<div class="overflow-x-auto border">
		<table class="w-full min-w-[1040px] text-sm">
			<thead class="bg-muted text-left text-muted-foreground">
				<tr>
					<th class="p-2 font-medium">Binnen</th>
					<th class="p-2 font-medium">Naam</th>
					<th class="p-2 font-medium">Event</th>
					<th class="p-2 font-medium">Wat</th>
					<th class="p-2 font-medium">Status</th>
					<th class="p-2 font-medium">Offerte</th>
					<th class="p-2 font-medium">Geldig tot</th>
					<th class="p-2 font-medium">Klantlink</th>
					<th class="p-2 font-medium">Notitie</th>
					<th class="p-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each sortedDeals as d (d.id)}
					{@const badge = stateBadge(d)}
					<tr class="border-t align-top {rowClass(d)}">
						<td class="p-2 whitespace-nowrap text-muted-foreground">
							{formatDateNL(d.createdAt)}
						</td>
						<td class="p-2">
							<div class="font-medium">{d.name}</div>
							{#if d.email}<div class="text-xs text-muted-foreground">{d.email}</div>{/if}
							{#if d.phone}<div class="text-xs text-muted-foreground">{d.phone}</div>{/if}
							{#if d.source}<div class="text-xs text-muted-foreground">via {d.source}</div>{/if}
						</td>
						<td class="p-2">
							<div>{eventDisplay(d)}</div>
							{#if d.guests}<div class="text-xs text-muted-foreground">{d.guests} gasten</div>{/if}
							{#if d.location}<div class="text-xs text-muted-foreground">{d.location}</div>{/if}
						</td>
						<td class="p-2">
							{#if d.serviceType}{serviceLabel(d)}{/if}
							{#if d.choice}<div class="text-xs text-muted-foreground">{d.choice}</div>{/if}
						</td>
						<td class="p-2">
							<form method="POST" action="?/update" use:enhance>
								<input type="hidden" name="id" value={d.id} />
								<div class="mb-1">
									<span class="inline-flex px-2 py-0.5 text-xs font-medium {badge.className}">
										{badge.label}
									</span>
								</div>
								<select
									name="status"
									class={selectClass}
									value={d.status}
									onchange={submitOnChange}
								>
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
						<td class="p-2 text-xs">
							{#if d.acceptedTermsAt}
								<span class="font-medium text-primary">Akkoord</span>
							{:else if d.acceptanceToken && d.acceptanceEnabled}
								<span class="text-amber-700">Actief</span>
							{:else if d.acceptanceToken}
								<span class="text-muted-foreground">Uit</span>
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
							{#if d.opsCompletedAt}
								<div class="text-muted-foreground">gegevens binnen</div>
							{/if}
						</td>
						<td class="max-w-[220px] p-2 text-xs">
							{#if shortNote(d.notes)}
								<div class="line-clamp-3 text-muted-foreground" title={d.notes}>
									{shortNote(d.notes)}
								</div>
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
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
						<tr class="border-t bg-muted/30">
							<td colspan="10" class="p-4">
								<div class="mb-4 border bg-background p-3 text-sm">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div>
											<div class="font-medium">Volgende stap: akkoord + aanbetaling</div>
											<p class="text-xs text-muted-foreground">
												Maak de klantlink, plak je Mollie-link en stuur daarna alleen deze ene link.
											</p>
										</div>
										<div class="flex flex-wrap gap-2">
											<a
												class="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm hover:bg-muted"
												href="/admin/event-sheet/{d.id}"
												target="_blank"
												rel="noreferrer"
											>
												Event sheet
											</a>
											<a
												class="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm hover:bg-muted"
												href="/admin/document?kind=offerte&deal={d.id}"
											>
												Offerte maken
											</a>
											<a
												class="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm hover:bg-muted"
												href="/admin/document?kind=factuur&deal={d.id}"
											>
												Factuur maken
											</a>
											<a
												class="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm hover:bg-muted"
												href="/admin/calculator?deal={d.id}"
											>
												Bereken offerte
											</a>
											<form method="POST" action="?/generateAcceptance" use:enhance>
												<input type="hidden" name="id" value={d.id} />
												<Button type="submit" variant="outline">
													{d.acceptanceToken ? 'Regenerate link' : 'Generate link'}
												</Button>
											</form>
										</div>
									</div>
									{#if d.acceptanceToken}
										<div class="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
											<Input
												readonly
												value={acceptanceUrl(d)}
												onclick={(e) => e.currentTarget.select()}
											/>
											<a
												class="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm hover:bg-muted"
												href={acceptanceUrl(d)}
												target="_blank"
												rel="noreferrer"
											>
												Open
											</a>
										</div>
									{/if}
									<form method="POST" action="?/update" class="mt-3 space-y-3" use:enhance>
										<input type="hidden" name="id" value={d.id} />
										<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
											<div class="space-y-1 sm:col-span-2">
												<Label for="quick-activeQuoteId-{d.id}">Actieve offerte</Label>
												<select
													id="quick-activeQuoteId-{d.id}"
													name="activeQuoteId"
													class={selectClass}
													value={d.activeQuoteId}
												>
													<option value="">Geen actieve offerte</option>
													{#each d.quoteVersions as q (q.id)}
														<option value={q.id}>{q.version} - {q.label}</option>
													{/each}
												</select>
												{#if d.quoteVersions.length > 0 && d.acceptanceToken}
													<div class="flex flex-wrap gap-2 pt-1 text-xs">
														{#each d.quoteVersions as q (q.id)}
															<a
																class="underline"
																href="/klantportaal/{d.acceptanceToken}/offerte/{q.id}"
																target="_blank"
																rel="noreferrer"
															>
																{q.version}
																{q.label}
															</a>
														{/each}
													</div>
												{:else if d.quoteVersions.length > 0}
													<p class="pt-1 text-xs text-muted-foreground">
														Genereer eerst een klantlink om portaloffertes te openen.
													</p>
												{/if}
											</div>
											<div class="space-y-1">
												<Label for="quick-portalQuestionsEnabled-{d.id}">Praktische vragen</Label>
												<select
													id="quick-portalQuestionsEnabled-{d.id}"
													name="portalQuestionsEnabled"
													class={selectClass}
													value={d.portalQuestionsEnabled ? 'true' : 'false'}
												>
													<option value="true">Tonen</option>
													<option value="false">Verbergen</option>
												</select>
											</div>
											<div class="space-y-1">
												<Label for="quick-acceptanceEnabled-{d.id}">Klantlink</Label>
												<select
													id="quick-acceptanceEnabled-{d.id}"
													name="acceptanceEnabled"
													class={selectClass}
													value={d.acceptanceEnabled ? 'true' : 'false'}
												>
													<option value="false">Uit</option>
													<option value="true">Aan</option>
												</select>
											</div>
											<div class="space-y-1">
												<Label for="quick-acceptanceExpiresAt-{d.id}">Geldig t/m</Label>
												<Input
													id="quick-acceptanceExpiresAt-{d.id}"
													name="acceptanceExpiresAt"
													type="date"
													value={dateInputValue(d.acceptanceExpiresAt)}
												/>
											</div>
											<div class="space-y-1">
												<Label for="quick-depositAmount-{d.id}">Aanbetaling (€)</Label>
												<Input
													id="quick-depositAmount-{d.id}"
													name="depositAmount"
													type="number"
													step="0.01"
													min="0"
													value={suggestedDeposit(d)}
												/>
											</div>
											<div class="space-y-1">
												<Label for="quick-depositStatus-{d.id}">Aanbetaling status</Label>
												<select
													id="quick-depositStatus-{d.id}"
													name="depositStatus"
													class={selectClass}
													value={d.depositStatus}
												>
													{#each PREPAYMENT_STATUSES as s (s)}
														<option value={s}>{PREPAYMENT_STATUS_LABELS[s]}</option>
													{/each}
												</select>
											</div>
											<div class="space-y-1 sm:col-span-2">
												<Label for="quick-depositLink-{d.id}">Mollie aanbetalingslink</Label>
												<Input
													id="quick-depositLink-{d.id}"
													name="depositLink"
													type="url"
													value={d.depositLink}
													maxlength={500}
													placeholder="https://www.mollie.com/checkout/..."
												/>
											</div>
											<div class="space-y-1">
												<Label for="quick-finalPaymentAmount-{d.id}">Eindbetaling (€)</Label>
												<Input
													id="quick-finalPaymentAmount-{d.id}"
													name="finalPaymentAmount"
													type="number"
													step="0.01"
													min="0"
													value={suggestedFinalPayment(d)}
												/>
											</div>
											<div class="space-y-1">
												<Label for="quick-finalPaymentStatus-{d.id}">Eindbetaling status</Label>
												<select
													id="quick-finalPaymentStatus-{d.id}"
													name="finalPaymentStatus"
													class={selectClass}
													value={d.finalPaymentStatus}
												>
													{#each PREPAYMENT_STATUSES as s (s)}
														<option value={s}>{PREPAYMENT_STATUS_LABELS[s]}</option>
													{/each}
												</select>
											</div>
											<div class="space-y-1 sm:col-span-2">
												<Label for="quick-finalPaymentLink-{d.id}">Mollie eindbetaallink</Label>
												<Input
													id="quick-finalPaymentLink-{d.id}"
													name="finalPaymentLink"
													type="url"
													value={d.finalPaymentLink}
													maxlength={500}
													placeholder="https://www.mollie.com/checkout/..."
												/>
											</div>
											<div class="flex items-end lg:col-span-4">
												<Button type="submit" class="w-full">Betaalstappen opslaan</Button>
											</div>
										</div>
									</form>
									<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
										<span
											>Terms: {d.acceptedTermsAt
												? formatDateNL(d.acceptedTermsAt)
												: 'nog niet'}</span
										>
										{#if d.acceptedByName}
											<span>Ondertekend door: {d.acceptedByName}</span>
										{/if}
										{#if d.acceptedAtLocation}
											<span>Te: {d.acceptedAtLocation}</span>
										{/if}
										<span
											>Gegevens: {d.opsCompletedAt
												? formatDateNL(d.opsCompletedAt)
												: 'nog niet'}</span
										>
										{#if hasAcceptanceSnapshot(d)}
											<span>Snapshot opgeslagen</span>
										{/if}
										<span>Aanbetaling: {paymentLabel(d.depositStatus)}</span>
										<span>Eindbetaling: {paymentLabel(d.finalPaymentStatus)}</span>
									</div>
								</div>
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
											<Input
												id="e-location-{d.id}"
												name="location"
												value={d.location}
												maxlength={200}
											/>
										</div>
										<div class="space-y-1">
											<Label for="e-guests-{d.id}">Gasten</Label>
											<Input id="e-guests-{d.id}" name="guests" value={d.guests} maxlength={10} />
										</div>
										<div class="space-y-1">
											<Label for="e-serviceType-{d.id}">Concept</Label>
											<select
												id="e-serviceType-{d.id}"
												name="serviceType"
												class={selectClass}
												value={d.serviceType}
											>
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
													class="h-9 shrink-0 rounded-md border border-input bg-background px-1 text-sm"
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
											<Input
												id="e-geldigTot-{d.id}"
												name="geldigTot"
												type="date"
												value={d.geldigTot ?? ''}
											/>
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
									<div class="space-y-2 border bg-background p-3">
										<input type="hidden" name="opsQuestionsConfig" value="yes" />
										<div>
											<div class="text-sm font-medium">Portalvragen</div>
											<p class="text-xs text-muted-foreground">
												Vink vragen uit die niet nodig zijn, pas tekst aan of voeg losse extra
												vragen toe.
											</p>
										</div>
										<div class="grid gap-2">
											{#each portalQuestions(d) as q (q.key)}
												<div class="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
													<input type="hidden" name="opsQuestionKey" value={q.key} />
													<label class="flex items-center gap-2 text-xs text-muted-foreground">
														<input
															type="checkbox"
															name="opsQuestionEnabled_{q.key}"
															value="yes"
															checked={q.enabled}
															class="size-4"
														/>
														<span>aan</span>
													</label>
													<Input
														name="opsQuestionLabel_{q.key}"
														value={q.label}
														maxlength={240}
														aria-label="Portalvraag"
													/>
												</div>
											{/each}
										</div>
										<div class="grid gap-2 sm:grid-cols-3">
											{#each [1, 2, 3] as i (i)}
												<div class="space-y-1">
													<Label for="new-question-{i}-{d.id}" class="text-xs"
														>Extra vraag {i}</Label
													>
													<Input
														id="new-question-{i}-{d.id}"
														name="opsQuestionNewLabel_{i}"
														maxlength={240}
														placeholder="Optioneel"
													/>
												</div>
											{/each}
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
									<div class="flex flex-wrap gap-x-4 gap-y-1 bg-muted/40 p-2 text-sm">
										<span>Excl. btw: <strong>{formatEUR(editExcl)}</strong></span>
										<span>Take-home: <strong>{formatEUR(editTakeHome)}</strong></span>
										<span>Uren: <strong>{editHours}</strong></span>
										<span
											>Per uur: <strong>{editHourly == null ? '—' : formatEUR(editHourly)}</strong
											></span
										>
									</div>
									<div class="space-y-1">
										<Label for="e-notes-{d.id}">Interne notitie</Label>
										<Textarea
											id="e-notes-{d.id}"
											name="notes"
											rows={2}
											value={d.notes}
											maxlength={5000}
										/>
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
						<td colspan="10" class="p-6 text-center text-muted-foreground">
							Nog geen aanvragen.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
