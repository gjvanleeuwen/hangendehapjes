<script lang="ts">
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { BUSINESS } from '$lib/admin/business';
	import { formatDateNL } from '$lib/admin/calc';

	let { data } = $props();
	const deal = untrack(() => data.deal);
	const ops = deal.opsJson;
	const today = new Date().toISOString().slice(0, 10);

	const pick = (...keys: string[]) => keys.map((k) => ops[k]).find((v) => v && v.trim()) ?? '';
	const serviceLabel =
		deal.serviceType === 'taart'
			? 'Taart / dessert'
			: deal.serviceType === 'hapjes'
				? 'Hangende hapjes'
				: deal.serviceType;

	let sheet = $state({
		title: 'Event sheet / praktische afspraken',
		generatedDate: today,
		client: deal.name,
		eventDate: deal.eventDate ?? '',
		location: pick('venueAddress') || deal.location,
		guests: pick('finalGuests') || deal.guests,
		concept: [serviceLabel, deal.choice].filter(Boolean).join(' - '),
		dayContact: pick('dayContact'),
		plannerContact: pick('ceremonyContact'),
		venueContact: pick('venueContact'),
		arrivalTime: pick('arrivalTime'),
		loadingParking: pick('loadingParking'),
		accessNotes: pick('accessNotes'),
		setupSpot: pick('setupSpot'),
		facilities: pick('powerWaterCooling'),
		timeline: pick('timeline'),
		servingTimeslot: pick('servingTimeslot'),
		startSignal: pick('startSignal'),
		materials: pick('serviceMaterials'),
		dietary: pick('dietary'),
		weatherPlan: pick('weatherPlan'),
		venueRules: pick('venueRules'),
		openPoints: '',
		footer:
			'Deze sheet vat de praktische afspraken samen zoals bekend op het moment van genereren. Bel of mail ons bij wijzigingen.'
	});

	const rows = $derived([
		['Opdrachtgever', sheet.client],
		['Eventdatum', sheet.eventDate ? formatDateNL(sheet.eventDate) : ''],
		['Locatie', sheet.location],
		['Gasten', sheet.guests],
		['Concept', sheet.concept]
	]);

	const contactRows = $derived([
		['Contact op de dag', sheet.dayContact],
		['Ceremoniemeester / planner', sheet.plannerContact],
		['Locatie / duty manager', sheet.venueContact],
		['Hangende Hapjes', BUSINESS.email]
	]);

	const timingRows = $derived([
		['Aankomst Hangende Hapjes', sheet.arrivalTime],
		['Laden/lossen en parkeren', sheet.loadingParking],
		['Toegang', sheet.accessNotes],
		['Dagplanning', sheet.timeline],
		['Serveertijd / timeslot', sheet.servingTimeslot],
		['Startsein', sheet.startSignal]
	]);

	const locationRows = $derived([
		['Werk-/setupplek', sheet.setupSpot],
		['Stroom, water en koeling', sheet.facilities],
		['Slechtweerplan', sheet.weatherPlan],
		['Locatieregels', sheet.venueRules]
	]);

	const serviceRows = $derived([
		['Materialen', sheet.materials],
		['Allergieën / dieetwensen', sheet.dietary],
		['Open punten', sheet.openPoints]
	]);

	const sections = $derived<[string, string[][]][]>([
		['Contacten', contactRows],
		['Timing & toegang', timingRows],
		['Locatie', locationRows],
		['Service', serviceRows]
	]);

	const visible = (rows: string[][]) => rows.filter(([, value]) => value && value.trim());
</script>

<svelte:head>
	<title>Event sheet - {deal.name}</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="grid gap-8 lg:grid-cols-[1.1fr_minmax(0,620px)] print:block">
	<section class="space-y-5 print:hidden">
		<div>
			<a class="text-sm underline" href="/admin/aanvragen">Terug naar aanvragen</a>
			<h1 class="mt-2 font-heading text-2xl">Event sheet</h1>
			<p class="text-sm text-muted-foreground">
				Pas de velden aan en gebruik daarna printen of opslaan als PDF.
			</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1">
				<Label for="title">Titel</Label>
				<Input id="title" bind:value={sheet.title} />
			</div>
			<div class="space-y-1">
				<Label for="generatedDate">Datum sheet</Label>
				<Input id="generatedDate" type="date" bind:value={sheet.generatedDate} />
			</div>
			<div class="space-y-1">
				<Label for="client">Opdrachtgever</Label>
				<Input id="client" bind:value={sheet.client} />
			</div>
			<div class="space-y-1">
				<Label for="eventDate">Eventdatum</Label>
				<Input id="eventDate" type="date" bind:value={sheet.eventDate} />
			</div>
			<div class="space-y-1 sm:col-span-2">
				<Label for="location">Locatie</Label>
				<Input id="location" bind:value={sheet.location} />
			</div>
			<div class="space-y-1">
				<Label for="guests">Gasten</Label>
				<Input id="guests" bind:value={sheet.guests} />
			</div>
			<div class="space-y-1">
				<Label for="concept">Concept</Label>
				<Input id="concept" bind:value={sheet.concept} />
			</div>
		</div>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Contacten</legend>
			<Textarea rows={2} bind:value={sheet.dayContact} placeholder="Contact op de dag" />
			<Textarea
				rows={2}
				bind:value={sheet.plannerContact}
				placeholder="Ceremoniemeester / planner"
			/>
			<Textarea rows={2} bind:value={sheet.venueContact} placeholder="Locatie / duty manager" />
		</fieldset>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Timing & toegang</legend>
			<Input bind:value={sheet.arrivalTime} placeholder="Aankomsttijd" />
			<Textarea rows={2} bind:value={sheet.loadingParking} placeholder="Laden/lossen en parkeren" />
			<Textarea
				rows={2}
				bind:value={sheet.accessNotes}
				placeholder="Toegang, lift, trappen, loopafstand"
			/>
			<Textarea rows={2} bind:value={sheet.timeline} placeholder="Dagplanning" />
			<Input bind:value={sheet.servingTimeslot} placeholder="Serveertijd / timeslot" />
			<Input bind:value={sheet.startSignal} placeholder="Wie geeft startsein?" />
		</fieldset>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Locatie & service</legend>
			<Textarea rows={2} bind:value={sheet.setupSpot} placeholder="Werk-/setupplek" />
			<Textarea rows={2} bind:value={sheet.facilities} placeholder="Stroom, water, koeling" />
			<Textarea
				rows={2}
				bind:value={sheet.materials}
				placeholder="Borden, bestek, servetten, glaswerk"
			/>
			<Textarea rows={2} bind:value={sheet.dietary} placeholder="Allergieën / dieetwensen" />
			<Textarea rows={2} bind:value={sheet.weatherPlan} placeholder="Slechtweerplan" />
			<Textarea rows={2} bind:value={sheet.venueRules} placeholder="Locatieregels" />
			<Textarea
				rows={3}
				bind:value={sheet.openPoints}
				placeholder="Open punten / nog te bevestigen"
			/>
		</fieldset>

		<div class="space-y-1">
			<Label for="footer">Voettekst</Label>
			<Textarea id="footer" rows={2} bind:value={sheet.footer} />
		</div>

		<Button type="button" onclick={() => window.print()}>Print / Opslaan als PDF</Button>
	</section>

	<section class="bg-white text-black shadow-sm print:shadow-none">
		<article class="sheet mx-auto p-10 print:p-0">
			<header class="border-b border-neutral-300 pb-4">
				<div class="flex items-start justify-between gap-6">
					<div>
						<div class="font-wordmark text-xl font-bold tracking-[0.08em] uppercase">
							{BUSINESS.name}
						</div>
						<div class="mt-2 text-xs text-neutral-600">{BUSINESS.email}</div>
					</div>
					<div class="text-right">
						<h1 class="font-heading text-2xl">{sheet.title}</h1>
						<div class="mt-1 text-xs text-neutral-600">
							Gegenereerd: {formatDateNL(sheet.generatedDate)}
						</div>
					</div>
				</div>
			</header>

			<div class="mt-6 grid gap-2 text-sm">
				{#each visible(rows) as [label, value]}
					<div class="grid grid-cols-[135px_1fr] gap-3 border-b border-neutral-100 pb-1">
						<div class="text-neutral-500">{label}</div>
						<div class="font-medium whitespace-pre-line">{value}</div>
					</div>
				{/each}
			</div>

			{#each sections as [title, sectionRows]}
				{@const shown = visible(sectionRows)}
				{#if shown.length > 0}
					<section class="mt-6">
						<h2 class="border-b border-neutral-300 pb-1 font-heading text-lg">{title}</h2>
						<div class="mt-3 grid gap-2 text-sm">
							{#each shown as [label, value]}
								<div class="grid grid-cols-[135px_1fr] gap-3">
									<div class="text-neutral-500">{label}</div>
									<div class="whitespace-pre-line">{value}</div>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			{/each}

			<footer
				class="mt-8 border-t border-neutral-300 pt-3 text-[10px] leading-relaxed text-neutral-600"
			>
				{sheet.footer}
			</footer>
		</article>
	</section>
</div>

<style>
	.sheet {
		font-family: 'Raleway Variable', system-ui, sans-serif;
		max-width: 620px;
	}

	@media print {
		:global(body) {
			background: white;
		}
		.sheet {
			max-width: none;
		}
	}

	@page {
		size: A4;
		margin: 18mm;
	}
</style>
