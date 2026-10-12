<script lang="ts">
	import { page } from '$app/state';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import StatusCell from '$lib/admin/aanvraag/StatusCell.svelte';
	import KlantlinkCell from '$lib/admin/aanvraag/KlantlinkCell.svelte';
	import { serviceLabel } from '$lib/admin/aanvraag/shared';

	// One header for every view of an aanvraag, with the sub-pages as tabs.
	// Same columns as the list: wat, datum, bedrag, status, klantlink. The
	// controls post to the deal page itself, so they work on every sub-page.
	let { data, children } = $props();

	const deal = $derived(data.deal);
	const base = $derived(`/admin/aanvragen/${deal.id}`);

	const what = $derived(
		[serviceLabel(deal), deal.choice, deal.guests ? `${deal.guests} gasten` : '', deal.location]
			.filter(Boolean)
			.join(' · ')
	);

	const tabs = $derived([
		{ key: 'overzicht', label: 'Overzicht', href: base },
		{ key: 'portaal', label: 'Portaal', href: `${base}/portaal` },
		{ key: 'calculator', label: 'Calculator', href: `${base}/calculator` },
		{ key: 'offerte', label: 'Offerte', href: `${base}/document?kind=offerte` },
		{ key: 'factuur', label: 'Factuur', href: `${base}/document?kind=factuur` },
		{ key: 'event-sheet', label: 'Event sheet', href: `${base}/event-sheet` }
	]);

	const active = $derived.by(() => {
		const rest = page.url.pathname.slice(base.length).replace(/^\//, '');
		if (!rest) return 'overzicht';
		if (rest.startsWith('document'))
			return page.url.searchParams.get('kind') === 'factuur' ? 'factuur' : 'offerte';
		return rest.split('/')[0];
	});
</script>

<div class="space-y-5">
	<header class="space-y-3 print:hidden">
		<a href="/admin/aanvragen" class="text-sm text-muted-foreground hover:underline">
			‹ Aanvragen
		</a>

		<div class="grid gap-x-6 gap-y-3 border bg-card p-4 md:grid-cols-[1fr_auto]">
			<div class="min-w-0">
				<h1 class="truncate font-heading text-2xl">{deal.name}</h1>
				<p class="truncate text-sm text-muted-foreground">{what || 'Nog geen eventgegevens'}</p>
			</div>
			<dl class="grid grid-cols-2 gap-x-5 gap-y-2 text-sm sm:grid-cols-4 md:items-start">
				<div>
					<dt class="text-xs text-muted-foreground">Datum</dt>
					<dd>{deal.eventDate ? formatDateNL(deal.eventDate) : deal.eventDateText || '–'}</dd>
				</div>
				<div>
					<dt class="text-xs text-muted-foreground">Incl. btw</dt>
					<dd class="tabular-nums">
						{deal.offerteAmount != null ? formatEUR(deal.offerteAmount) : '–'}
					</dd>
				</div>
				<div class="w-40">
					<dt class="mb-0.5 text-xs text-muted-foreground">Status</dt>
					<dd><StatusCell {deal} variant="pill" actionBase={base} /></dd>
				</div>
				<div class="w-36">
					<dt class="mb-0.5 text-xs text-muted-foreground">Klantlink t/m</dt>
					<dd><KlantlinkCell {deal} today={data.today} actionBase={base} /></dd>
				</div>
			</dl>
		</div>

		<nav
			class="-mx-4 overflow-x-auto border-b px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
			aria-label="Aanvraag"
		>
			<div class="flex gap-1">
				{#each tabs as t (t.key)}
					<a
						href={t.href}
						aria-current={active === t.key ? 'page' : undefined}
						class="-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap {active === t.key
							? 'border-primary font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'}"
					>
						{t.label}
					</a>
				{/each}
			</div>
		</nav>
	</header>

	{@render children()}
</div>
