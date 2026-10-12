<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import type { Deal } from '$lib/deals';
	import LeadRow from '$lib/admin/aanvraag/LeadRow.svelte';
	import Agenda from '$lib/admin/aanvraag/Agenda.svelte';
	import StatusCell from '$lib/admin/aanvraag/StatusCell.svelte';
	import KlantlinkCell from '$lib/admin/aanvraag/KlantlinkCell.svelte';
	import NoteCell from '$lib/admin/aanvraag/NoteCell.svelte';
	import NextActionCell from '$lib/admin/aanvraag/NextActionCell.svelte';
	import { nextAction, todoSummary, type NextAction } from '$lib/admin/aanvraag/next-action';
	import {
		LIST_FILTERS,
		detailHref,
		isListFilter,
		matchesFilter,
		serviceLabel,
		showsLeads,
		sortDeals,
		type ListFilter
	} from '$lib/admin/aanvraag/shared';
	import type { Snapshot } from './$types';

	let { data, form } = $props();

	type Row = { d: Deal; action: NextAction | null };

	const rows = $derived<Row[]>(data.deals.map((d) => ({ d, action: nextAction(d, data.today) })));

	// ?filter=half opens on the half-finished forms (old /leads links land here).
	const urlFilter = page.url.searchParams.get('filter');
	let filter = $state<ListFilter>(isListFilter(urlFilter) ? urlFilter : 'todo');
	let q = $state('');

	// Keep the filter and search when coming back from a detail page.
	export const snapshot: Snapshot<{ filter: ListFilter; q: string }> = {
		capture: () => ({ filter, q }),
		restore: (v) => {
			filter = v.filter;
			q = v.q;
		}
	};

	const inFilter = (r: Row, f: ListFilter) =>
		f === 'todo' ? !!r.action?.due : matchesFilter(r.d, f);

	const counts = $derived(
		Object.fromEntries(
			LIST_FILTERS.map((f) => [
				f.key,
				rows.filter((r) => inFilter(r, f.key)).length + (showsLeads(f.key) ? data.leads.length : 0)
			])
		) as Record<ListFilter, number>
	);

	const needle = $derived(q.trim().toLowerCase());
	const matches = (name: string, email: string) =>
		!needle || name.toLowerCase().includes(needle) || email.toLowerCase().includes(needle);

	const visibleLeads = $derived(
		showsLeads(filter) ? data.leads.filter((l) => matches(l.name, l.email)) : []
	);

	// Due first, then the usual order (booked, opties, offertes out, nieuw, lost).
	const visible = $derived.by(() => {
		const matching = rows.filter((r) => inFilter(r, filter) && matches(r.d.name, r.d.email));
		const byId = new Map(matching.map((r) => [r.d.id, r]));
		const ordered = sortDeals(matching.map((r) => r.d)).map((d) => byId.get(d.id) as Row);
		return [...ordered.filter((r) => r.action?.due), ...ordered.filter((r) => !r.action?.due)];
	});

	const summary = $derived(
		todoSummary(
			rows.flatMap((r) => (r.action?.due ? [r.action] : [])),
			data.leads.length
		)
	);

	// What they're buying, in one short line.
	const whatOf = (d: Deal) =>
		[serviceLabel(d), d.choice, d.guests ? `${d.guests} gasten` : ''].filter(Boolean).join(' · ');

	const dateOf = (d: Deal) => (d.eventDate ? formatDateNL(d.eventDate) : d.eventDateText || '–');

	const closed = (d: Deal) => d.status === 'afgewezen' || d.status === 'afgewezen_intern';

	// A click on the row opens the deal, except on the controls inside it.
	const openRow = (e: MouseEvent, id: string) => {
		const target = e.target as HTMLElement;
		if (target.closest('a, button, select, input, textarea, form, label, dialog')) return;
		goto(detailHref(id));
	};
</script>

<svelte:head>
	<title>Aanvragen · admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="space-y-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="font-heading text-2xl">Aanvragen</h1>
		<Button href="/admin/aanvragen/nieuw">+ Nieuwe aanvraag</Button>
	</div>

	<Agenda {data} />

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

	<div class="flex flex-wrap items-center gap-2">
		<div class="flex flex-wrap gap-1" role="group" aria-label="Filter">
			{#each LIST_FILTERS as f (f.key)}
				<button
					type="button"
					class="rounded-md border px-2.5 py-1 text-sm {filter === f.key
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-border bg-background hover:bg-muted'}"
					aria-pressed={filter === f.key}
					onclick={() => (filter = f.key)}
				>
					{f.label}
					<span class={filter === f.key ? 'opacity-80' : 'text-muted-foreground'}>
						{counts[f.key]}
					</span>
				</button>
			{/each}
		</div>
		<Input
			type="search"
			placeholder="Zoek"
			class="ms-auto w-full sm:w-48"
			bind:value={q}
			aria-label="Zoek op naam of e-mail"
		/>
	</div>
	{#if filter === 'todo' && summary}
		<p class="text-sm text-muted-foreground">{summary}</p>
	{/if}

	<!-- Desktop -->
	<div class="hidden border md:block">
		<table class="w-full table-fixed text-sm">
			<colgroup>
				<col />
				<col class="w-32" />
				<col class="w-24" />
				<col class="w-44" />
				<col class="w-36" />
				<col class="w-60" />
				<col class="w-36" />
			</colgroup>
			<thead class="bg-muted text-left text-xs text-muted-foreground">
				<tr>
					<th class="px-2 py-1.5 font-medium">Naam</th>
					<th class="px-2 py-1.5 font-medium">Datum</th>
					<th class="px-2 py-1.5 text-right font-medium">Incl. btw</th>
					<th class="px-2 py-1.5 font-medium">Status</th>
					<th class="px-2 py-1.5 font-medium">Klantlink t/m</th>
					<th class="px-2 py-1.5 font-medium">Notitie</th>
					<th class="px-2 py-1.5 font-medium">Actie</th>
				</tr>
			</thead>
			<tbody>
				{#each visibleLeads as lead (lead.id)}
					<LeadRow {lead} variant="row" />
				{/each}
				{#each visible as { d, action } (d.id)}
					<tr
						class="cursor-pointer border-t align-top hover:bg-muted/40 {closed(d)
							? 'opacity-60'
							: ''}"
						onclick={(e) => openRow(e, d.id)}
					>
						<td class="px-2 py-2">
							<a class="block truncate font-medium hover:underline" href={detailHref(d.id)}>
								{d.name}
							</a>
							<div class="truncate text-xs text-muted-foreground">{whatOf(d) || '–'}</div>
						</td>
						<td class="px-2 py-2 text-xs">{dateOf(d)}</td>
						<td class="px-2 py-2 text-right tabular-nums">
							{d.offerteAmount != null ? formatEUR(d.offerteAmount) : '–'}
						</td>
						<td class="px-2 py-2"><StatusCell deal={d} variant="pill" /></td>
						<td class="px-2 py-2"><KlantlinkCell deal={d} today={data.today} /></td>
						<td class="px-1 py-1"><NoteCell deal={d} /></td>
						<td class="px-2 py-2"><NextActionCell deal={d} {action} /></td>
					</tr>
				{/each}
				{#if visible.length === 0 && visibleLeads.length === 0}
					<tr>
						<td colspan="7" class="p-6 text-center text-muted-foreground">
							{data.deals.length === 0 ? 'Nog geen aanvragen.' : 'Niets in dit filter.'}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Phone -->
	<div class="space-y-2 md:hidden">
		{#each visibleLeads as lead (lead.id)}
			<LeadRow {lead} variant="card" />
		{/each}
		{#each visible as { d, action } (d.id)}
			<div class="space-y-2 border bg-card p-3 {closed(d) ? 'opacity-60' : ''}">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<a class="font-medium hover:underline" href={detailHref(d.id)}>{d.name}</a>
						<div class="text-xs text-muted-foreground">{whatOf(d) || '–'}</div>
					</div>
					<div class="text-right text-sm">
						<div class="tabular-nums">
							{d.offerteAmount != null ? formatEUR(d.offerteAmount) : '–'}
						</div>
						<div class="text-xs text-muted-foreground">{dateOf(d)}</div>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<StatusCell deal={d} variant="pill" />
					<KlantlinkCell deal={d} today={data.today} />
				</div>
				<NoteCell deal={d} />
				<NextActionCell deal={d} {action} />
			</div>
		{/each}
		{#if visible.length === 0 && visibleLeads.length === 0}
			<p class="p-6 text-center text-sm text-muted-foreground">
				{data.deals.length === 0 ? 'Nog geen aanvragen.' : 'Niets in dit filter.'}
			</p>
		{/if}
	</div>
</div>
