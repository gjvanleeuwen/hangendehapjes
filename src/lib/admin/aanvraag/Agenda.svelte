<script lang="ts">
	import { Calendar, Day as CalendarDay } from '$lib/components/ui/calendar';
	import { formatDateNL } from '$lib/admin/calc';
	import { isWon, type Deal } from '$lib/deals';
	import { serviceLabel } from '$lib/admin/aanvraag/shared';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { SvelteMap } from 'svelte/reactivity';

	// Booked and in-optie deals with a date, on a calendar plus a list. Lives on
	// top of the aanvragen page; the ICS link to subscribe sits folded underneath.
	let { data }: { data: { events: Deal[]; today: string; calendarUrl: string | null } } = $props();

	// --- Booked events on a calendar + a height-matched list ---
	const pad = (n: number) => String(n).padStart(2, '0');
	const keyOf = (d: { year: number; month: number; day: number }) =>
		`${d.year}-${pad(d.month)}-${pad(d.day)}`;

	const eventsByDate = $derived.by(() => {
		const m = new SvelteMap<string, Deal[]>();
		for (const d of data.events) {
			const list = m.get(d.eventDate as string) ?? [];
			list.push(d);
			m.set(d.eventDate as string, list);
		}
		return m;
	});

	const upcomingEvents = $derived(
		[...data.events]
			.filter((d) => (d.eventDate as string) >= data.today)
			.sort((a, b) => (a.eventDate as string).localeCompare(b.eventDate as string))
	);

	let placeholder = $state<DateValue>(today(getLocalTimeZone()));

	// The list always shows every upcoming event, independent of which months
	// the calendar is currently showing.
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

	const calendarEventClass = (evs: Deal[] | undefined) => {
		if (!evs?.length) return '';
		if (evs.some(isWon)) {
			return 'border border-primary/40 bg-primary/15 text-primary font-semibold hover:bg-primary/20';
		}
		return 'border border-amber-300 bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200';
	};
</script>

<section class="space-y-3">
	<h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
		Agenda · {upcomingEvents.length} aankomend
	</h2>

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
								{evs.length > 1 ? `${evs.length} events` : evs.some(isWon) ? 'geboekt' : 'optie'}
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
										<a class="font-medium hover:underline" href="/admin/aanvragen/{d.id}">
											{d.name}
										</a>
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

	<!-- Calendar subscription -->
	{#if data.calendarUrl}
		<details class="border bg-muted/30 p-4 text-sm">
			<summary class="cursor-pointer font-medium">Agenda koppelen (ICS)</summary>
			<p class="mt-2 text-muted-foreground">
				Abonneer je agenda op deze link: geaccepteerde events verschijnen automatisch en blijven
				bijgewerkt. In Google Agenda: <em>Andere agenda's, Via URL</em>. Op iPhone/Mac:
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
</section>
