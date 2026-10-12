<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { BUSINESS } from '$lib/admin/business';
	import { enhance } from '$app/forms';
	import { formatEUR } from '$lib/admin/calc';
	import { docFigures } from '$lib/admin/document';
	import DocumentView from '$lib/admin/DocumentView.svelte';
	import type { BtwRate, DocumentKind, DocumentState, InvoiceType } from '$lib/admin/types';

	let { data, form } = $props();

	const today = new Date().toISOString().slice(0, 10);
	const initialKind = (page.url.searchParams.get('kind') as DocumentKind) || 'offerte';
	const deal = untrack(() => data.deal);
	const acceptedQuote = untrack(() => data.acceptedQuote);
	let sequence = $state(untrack(() => data.sequence));
	let invoicePrefix = $state(untrack(() => data.invoicePrefix));

	// Texts start from the last saved offerte / factuur (any aanvraag); the
	// hardcoded versions below are only the fallback for the very first one.
	const latest = untrack(() => data.latestTexts);
	const latestFor = (kind: DocumentKind) =>
		kind === 'offerte' ? latest.offerte : kind === 'factuur' ? latest.factuur : null;

	const defaultTerms = (kind: DocumentKind) => {
		const saved = latestFor(kind);
		if (saved) return saved.terms;
		if (kind === 'offerte') {
			return [
				'Voor deze offerte houden wij de evenementdatum vast tot de verloopdatum (14 dagen na verzenden). Bij akkoord vragen wij een aanbetaling van 50% van het totaalbedrag. De boeking is definitief zodra de aanbetaling is ontvangen. De aanbetaling wordt verrekend met de eindfactuur. Het resterende bedrag kan voldaan worden binnen 14 dagen na het evenement.',
				'Definitieve aantallen, dieetwensen en praktische locatiegegevens ontvangen wij graag uiterlijk 14 dagen voor het evenement. Op deze offerte zijn onze algemene voorwaarden van toepassing.'
			].join('\n');
		}
		// Op de factuur herhalen we de betaalafspraak niet: die stond in de offerte
		// en is bij akkoord al aanvaard. Alleen de verwijzing blijft staan.
		if (kind === 'factuur') {
			return 'Op deze factuur zijn onze algemene voorwaarden van toepassing.';
		}
		return '';
	};

	// Alles wat sowieso meekomt en ons weinig tot niets kost, maar wat een klant
	// nergens ziet als we het niet opschrijven. Het staat er niet om te verkopen
	// maar omdat "all-in" pas iets betekent als je benoemt wat erin zit.
	const defaultNotes = (kind: DocumentKind) => {
		const saved = latestFor(kind);
		if (saved) return saved.notes;
		if (kind !== 'offerte') return '';
		return [
			'Inbegrepen, zonder meerprijs:',
			'· Wij nemen alles mee: tafel, koeling, servies en al het materiaal.',
			'· Alternatieven voor allergieën en dieetwensen regelen we gewoon, laat het even weten.',
			'· Bij een taart een sjabloon met jullie datum of naam, en een mooi mes voor de foto.',
			'· Reiskosten en opbouw op locatie.',
			'· Na afloop gaat alles weer met ons mee, inclusief de afwas.'
		].join('\n');
	};

	const defaultFooterNote = (kind: DocumentKind) => {
		const saved = latestFor(kind);
		if (saved) return saved.footerNote;
		if (kind === 'offerte') return `Vragen over deze offerte? Mail ons op ${BUSINESS.email}.`;
		if (kind === 'factuur') return `Vragen over deze factuur? Mail ons op ${BUSINESS.email}.`;
		return '';
	};

	const isDefaultNotes = (value: string) =>
		value === '' || value === defaultNotes('offerte') || value === defaultNotes('factuur');

	const isDefaultTerms = (value: string) =>
		value === '' || value === defaultTerms('offerte') || value === defaultTerms('factuur');

	const isDefaultFooterNote = (value: string) =>
		value === '' ||
		value === defaultFooterNote('offerte') ||
		value === defaultFooterNote('factuur');

	// Onze eigen gegevens onthouden we lokaal: pas je ze aan, dan staan ze bij het
	// volgende document meteen goed zonder ze in de code te zetten.
	const ISSUER_KEY = 'hh_issuer';
	function storedIssuer() {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem(ISSUER_KEY);
			return raw ? { ...BUSINESS, ...JSON.parse(raw) } : null;
		} catch {
			return null;
		}
	}

	// Placeholders worden bij het renderen ingevuld, zodat de tekst blijft kloppen
	// als het bedrag, de termijn of het factuurnummer nog verandert.
	const DEFAULT_PAYMENT_INSTRUCTIONS =
		'Graag {BEDRAG} binnen {DAGEN} dagen overmaken op {IBAN} t.n.v. {NAAM} o.v.v. factuurnummer {NUMMER}.';

	// De eerste factuur komt uit de geaccepteerde offerte: dezelfde regels, dezelfde
	// klantgegevens, dezelfde korting. Zo staat er nooit iets anders op de factuur
	// dan waar de klant ja op gezegd heeft.
	const fromQuote = acceptedQuote;

	const doc = $state<DocumentState>({
		kind: initialKind,
		number: '',
		date: today,
		eventDate: fromQuote?.eventDate || deal?.eventDate || '',
		validUntil: '',
		paidOn: today,
		issuer: storedIssuer() ?? { ...BUSINESS },
		recipient: fromQuote?.recipient
			? { ...fromQuote.recipient }
			: { name: deal?.name ?? '', company: '', address: '' },
		lineItems: fromQuote?.lineItems?.length
			? fromQuote.lineItems.map((l) => ({ ...l }))
			: [{ description: '', qty: 50, unitPrice: 2.5, btwRate: 'none', discountPct: 0 }],
		discountMode: fromQuote?.discountMode ?? 'pct',
		discountValue: fromQuote?.discountValue ?? 0,
		notes: defaultNotes(initialKind),
		terms: defaultTerms(initialKind),
		footerNote: defaultFooterNote(initialKind),
		invoiceType: 'volledig',
		prepaymentPct: 50,
		priorInvoiceNumber: '',
		priorInvoiceDate: '',
		priorInvoiceAmount: 0,
		paymentInstructions: latest.factuur?.paymentInstructions || DEFAULT_PAYMENT_INSTRUCTIONS,
		paymentTermDays: latest.factuur?.paymentTermDays ?? 14
	});

	$effect(() => {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(ISSUER_KEY, JSON.stringify($state.snapshot(doc).issuer));
		} catch {
			// opslag kan vol of geblokkeerd zijn; dan gebruiken we gewoon de defaults
		}
	});
	const calculatorMeta = $state<{
		costs: number | null;
		timeSpent: Record<string, number>;
	}>({
		costs: null,
		timeSpent: {}
	});

	let quoteMeta = $state({
		id: crypto.randomUUID(),
		version: `v${(deal?.quoteVersions.length ?? 0) + 1}`,
		label: deal?.choice || 'Offerte'
	});

	// The URL (?kind=…) is the source of truth, so the Offerte/Factuur tabs in the
	// aanvraag header and the switch on this page always agree.
	$effect(() => {
		const k = page.url.searchParams.get('kind');
		if (k === 'offerte' || k === 'factuur' || k === 'kwitantie') untrack(() => setKind(k));
	});

	function setKind(kind: DocumentKind) {
		if (doc.kind === kind) return;
		const shouldReplaceNotes = isDefaultNotes(doc.notes);
		const shouldReplaceTerms = isDefaultTerms(doc.terms);
		const shouldReplaceFooterNote = isDefaultFooterNote(doc.footerNote);
		doc.kind = kind;
		if (shouldReplaceNotes) doc.notes = defaultNotes(kind);
		if (shouldReplaceTerms) doc.terms = defaultTerms(kind);
		if (shouldReplaceFooterNote) doc.footerNote = defaultFooterNote(kind);
	}

	$effect(() => {
		if (page.url.searchParams.get('from') !== 'calc') return;
		try {
			const raw = sessionStorage.getItem('hh_calculator_prefill');
			if (!raw) return;
			type PrefillLine = { description: string; qty: number; unitPrice: number; btwRate: BtwRate };
			// The calculator sends `lineItems` (product + reiskosten). Older tabs may
			// still hold the single-line shape, so accept both.
			const data = JSON.parse(raw) as Partial<PrefillLine> & {
				lineItems?: PrefillLine[];
				costs?: number | null;
				timeSpent?: Record<string, number>;
			};
			const { costs, timeSpent, lineItems, ...single } = data;
			const lines: PrefillLine[] = lineItems?.length ? lineItems : [single as PrefillLine];
			doc.lineItems = lines.map((l) => ({ ...l, discountPct: 0 }));
			calculatorMeta.costs = costs ?? null;
			calculatorMeta.timeSpent = timeSpent ?? {};
			sessionStorage.removeItem('hh_calculator_prefill');
		} catch {
			// ignore
		}
	});

	// Totals, amount due and labels: shared with the preview and the klantportaal.
	const figures = $derived(docFigures(doc));
	const totals = $derived(figures.totals);
	const prepaymentAmount = $derived(figures.prepaymentAmount);
	const amountDue = $derived(figures.amountDue);
	const paymentInstructionsText = $derived(figures.paymentInstructionsText);
	const headingLabel = $derived(figures.headingLabel);
	const allNoVat = $derived(figures.allNoVat);
	const calculatorHref = $derived(`/admin/aanvragen/${deal.id}/calculator`);

	function addLine() {
		const fallbackRate: BtwRate = allNoVat ? 'none' : 9;
		doc.lineItems.push({
			description: '',
			qty: 1,
			unitPrice: 0,
			btwRate: fallbackRate,
			discountPct: 0
		});
	}

	function removeLine(i: number) {
		doc.lineItems.splice(i, 1);
		if (doc.lineItems.length === 0) addLine();
	}

	function moveLine(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= doc.lineItems.length) return;
		const [item] = doc.lineItems.splice(i, 1);
		doc.lineItems.splice(j, 0, item);
	}

	const btwOptions: { value: BtwRate; label: string }[] = [
		{ value: 'none', label: 'Geen BTW' },
		{ value: 0, label: '0%' },
		{ value: 9, label: '9%' },
		{ value: 21, label: '21%' }
	];

	const quotePayload = $derived(
		JSON.stringify({
			id: quoteMeta.id,
			version: quoteMeta.version,
			label: quoteMeta.label,
			kind: 'offerte',
			active: true,
			createdAt: new Date().toISOString(),
			date: doc.date,
			eventDate: doc.eventDate,
			validUntil: doc.validUntil,
			amount: totals.total,
			recipient: doc.recipient,
			lineItems: $state.snapshot(doc).lineItems,
			discountMode: doc.discountMode,
			discountValue: doc.discountValue,
			costs: calculatorMeta.costs,
			timeSpent: $state.snapshot(calculatorMeta).timeSpent,
			notes: doc.notes,
			terms: doc.terms,
			footerNote: doc.footerNote
		})
	);
</script>

<svelte:head>
	<title>{headingLabel} — admin</title>
</svelte:head>

<div class="grid gap-8 lg:grid-cols-[1.2fr_minmax(0,560px)] print:block">
	<!-- Editor -->
	<section class="space-y-6 print:hidden">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h1 class="font-heading text-xl">{headingLabel}</h1>
			<!-- Offerte and factuur are tabs in the aanvraag header; kwitantie is the odd one out. -->
			<div class="flex gap-1 text-xs">
				{#each ['offerte', 'factuur', 'kwitantie'] as const as k (k)}
					<a
						href="?kind={k}"
						data-sveltekit-replacestate
						data-sveltekit-noscroll
						class="rounded-md border px-2 py-1 capitalize {doc.kind === k
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						{k}
					</a>
				{/each}
			</div>
		</div>

		{#if form?.error}
			<div class="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
				{form.error}
			</div>
		{/if}
		{#if form?.savedQuote}
			<div class="border border-primary/30 bg-primary/5 p-3 text-sm">
				Offerteversie opgeslagen op de aanvraag.
			</div>
		{/if}
		{#if form?.savedInvoice}
			<div class="border border-primary/30 bg-primary/5 p-3 text-sm">
				Factuur {form.savedInvoice} staat in het klantportaal.
			</div>
		{/if}

		{#if deal && doc.kind === 'offerte'}
			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Portalversie</legend>
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="quoteLabel">Label</Label>
						<Input
							id="quoteLabel"
							bind:value={quoteMeta.label}
							placeholder="Bijv. Taart + hapjes"
						/>
					</div>
					<div class="space-y-1.5">
						<Label for="quoteVersion">Versie</Label>
						<Input id="quoteVersion" bind:value={quoteMeta.version} placeholder="v1" />
					</div>
				</div>
			</fieldset>
		{/if}

		<div class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="number">
					{doc.kind === 'factuur' ? 'Factuurnummer' : 'Referentie (optioneel)'}
				</Label>
				<Input
					id="number"
					bind:value={doc.number}
					placeholder={doc.kind === 'factuur'
						? sequence?.nextPreview || 'HH-2026-0001'
						: 'Bijv. Bruiloft Jansen'}
				/>
				{#if doc.kind === 'factuur'}
					<div class="flex flex-wrap items-center gap-2">
						<Input
							class="h-8 w-20 uppercase"
							aria-label="Letters van de reeks"
							bind:value={invoicePrefix}
						/>
						<form
							method="POST"
							action="?/reserveNumber"
							use:enhance={() =>
								async ({ result, update }) => {
									if (result.type === 'success' && result.data?.invoiceNumber) {
										doc.number = String(result.data.invoiceNumber);
										sequence = (result.data.sequence as typeof sequence) ?? sequence;
									}
									await update({ reset: false });
								}}
						>
							<input type="hidden" name="prefix" value={invoicePrefix} />
							<input type="hidden" name="dealId" value={deal?.id ?? ''} />
							<Button type="submit" variant="outline" class="h-8">Volgend nummer</Button>
						</form>
						<span class="text-xs text-muted-foreground">
							{#if sequence}
								{#if sequence.lastIssued}
									laatst uitgegeven {sequence.lastIssued} · volgende {sequence.nextPreview}
								{:else}
									nog geen nummer dit jaar · volgende {sequence.nextPreview}
								{/if}
							{:else}
								reeks niet beschikbaar (geen database) — vul handmatig in
							{/if}
						</span>
					</div>
				{/if}
			</div>
			<div class="space-y-1.5">
				<Label for="date">Datum</Label>
				<Input id="date" type="date" bind:value={doc.date} />
			</div>
			<div class="space-y-1.5">
				<Label for="eventDate">Eventdatum</Label>
				<Input id="eventDate" type="date" bind:value={doc.eventDate} />
			</div>
			{#if doc.kind === 'offerte'}
				<div class="space-y-1.5">
					<Label for="validUntil">Geldig t/m</Label>
					<Input id="validUntil" type="date" bind:value={doc.validUntil} />
				</div>
			{/if}
			{#if doc.kind === 'kwitantie'}
				<div class="space-y-1.5">
					<Label for="paidOn">Voldaan op</Label>
					<Input id="paidOn" type="date" bind:value={doc.paidOn} />
				</div>
			{/if}
		</div>

		{#if doc.kind === 'factuur'}
			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Soort factuur</legend>
				<div class="flex flex-wrap gap-2">
					{#each [{ v: 'volledig', l: 'Volledig bedrag' }, { v: 'aanbetaling', l: 'Aanbetaling' }, { v: 'eind', l: 'Eindfactuur' }] as const as opt (opt.v)}
						<button
							type="button"
							onclick={() => (doc.invoiceType = opt.v as InvoiceType)}
							class="border px-3 py-1.5 text-sm transition {doc.invoiceType === opt.v
								? 'border-primary bg-primary text-primary-foreground'
								: 'hover:bg-muted'}"
						>
							{opt.l}
						</button>
					{/each}
				</div>

				{#if doc.invoiceType === 'aanbetaling'}
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="prepct">Percentage van het totaal</Label>
							<Input id="prepct" type="number" min="1" max="100" bind:value={doc.prepaymentPct} />
						</div>
						<div class="space-y-1.5">
							<Label>Nu te factureren</Label>
							<div class="flex h-10 items-center text-sm tabular-nums">
								{formatEUR(prepaymentAmount)}
							</div>
						</div>
					</div>
					<p class="text-xs text-muted-foreground">
						Een aanbetalingsfactuur is een gewone factuur: de btw over dit deel wordt nu al
						verschuldigd. Bewaar het nummer, je verwijst er straks op de eindfactuur naar.
					</p>
				{:else if doc.invoiceType === 'eind'}
					<div class="grid gap-3 sm:grid-cols-3">
						<div class="space-y-1.5">
							<Label for="prevnum">Eerdere factuur</Label>
							<Input id="prevnum" bind:value={doc.priorInvoiceNumber} placeholder="HH-2026-0001" />
						</div>
						<div class="space-y-1.5">
							<Label for="prevdate">Datum daarvan</Label>
							<Input id="prevdate" type="date" bind:value={doc.priorInvoiceDate} />
						</div>
						<div class="space-y-1.5">
							<Label for="prevamt">Reeds gefactureerd (incl. btw)</Label>
							<Input
								id="prevamt"
								type="number"
								min="0"
								step="0.01"
								bind:value={doc.priorInvoiceAmount}
							/>
						</div>
					</div>
					<p class="text-xs text-muted-foreground">
						Op de eindfactuur staat het volledige bedrag; de aanbetaling gaat er inclusief btw weer
						vanaf. Zo draag je de btw over dat deel niet twee keer af. Nog te voldoen: {formatEUR(
							amountDue
						)}.
					</p>
				{/if}
			</fieldset>

			<fieldset class="space-y-3 border p-4">
				<legend class="px-1 text-sm font-medium">Betaalinstructie</legend>
				<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
					<div class="space-y-1.5">
						<Label for="payinstr">Tekst onderaan de factuur</Label>
						<Textarea id="payinstr" rows={2} bind:value={doc.paymentInstructions} />
					</div>
					<div class="space-y-1.5">
						<Label for="paydays">Termijn (dagen)</Label>
						<Input
							id="paydays"
							type="number"
							min="0"
							class="w-28"
							bind:value={doc.paymentTermDays}
						/>
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Beschikbaar: {'{BEDRAG}'}
					{'{DAGEN}'}
					{'{IBAN}'}
					{'{NAAM}'}
					{'{NUMMER}'} — die vult hij zelf in. Nu:
					<span class="text-foreground">{paymentInstructionsText}</span>
				</p>
			</fieldset>
		{/if}

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Onze gegevens</legend>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="isname">Merknaam (bovenaan)</Label>
					<Input id="isname" bind:value={doc.issuer.name} />
				</div>
				<div class="space-y-1.5">
					<Label for="islegal">Statutaire naam</Label>
					<Input id="islegal" bind:value={doc.issuer.legalName} />
				</div>
				<div class="space-y-1.5">
					<Label for="isemail">E-mail</Label>
					<Input id="isemail" bind:value={doc.issuer.email} />
				</div>
				<div class="space-y-1.5">
					<Label for="isaddr1">Adres</Label>
					<Input id="isaddr1" bind:value={doc.issuer.addressLine1} />
				</div>
				<div class="space-y-1.5">
					<Label for="isaddr2">Postcode en plaats</Label>
					<Input id="isaddr2" bind:value={doc.issuer.addressLine2} />
				</div>
				<div class="space-y-1.5">
					<Label for="isiban">IBAN</Label>
					<Input id="isiban" bind:value={doc.issuer.iban} />
				</div>
				<div class="space-y-1.5">
					<Label for="iskvk">KvK</Label>
					<Input id="iskvk" bind:value={doc.issuer.kvk} />
				</div>
				<div class="space-y-1.5">
					<Label for="isbtw">BTW-id</Label>
					<Input id="isbtw" bind:value={doc.issuer.btwId} />
				</div>
			</div>
			<p class="text-xs text-muted-foreground">
				Wordt in je browser onthouden voor het volgende document. KvK en BTW-id zijn verplicht op
				een factuur zodra je die hebt.
			</p>
		</fieldset>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Klant</legend>
			<div class="space-y-1.5">
				<Label for="rname">Naam</Label>
				<Input id="rname" bind:value={doc.recipient.name} />
			</div>
			<div class="space-y-1.5">
				<Label for="rcompany">Bedrijf (optioneel)</Label>
				<Input id="rcompany" bind:value={doc.recipient.company} />
			</div>
			<div class="space-y-1.5">
				<Label for="raddress">Adres</Label>
				<Textarea id="raddress" rows={3} bind:value={doc.recipient.address} />
			</div>
		</fieldset>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Regels</legend>
			<div class="space-y-3">
				{#each doc.lineItems as item, i (i)}
					<div class="space-y-2 border bg-muted/40 p-3">
						<Input placeholder="Omschrijving" bind:value={item.description} />
						<div class="flex flex-wrap items-end gap-2">
							<div class="min-w-[80px] flex-1">
								<label class="mb-1 block text-xs text-muted-foreground" for="qty-{i}">Aantal</label>
								<Input id="qty-{i}" type="number" min="0" step="1" bind:value={item.qty} />
							</div>
							<div class="min-w-[100px] flex-1">
								<label class="mb-1 block text-xs text-muted-foreground" for="price-{i}"
									>Prijs p/s</label
								>
								<Input
									id="price-{i}"
									type="number"
									min="0"
									step="0.01"
									bind:value={item.unitPrice}
								/>
							</div>
							<div class="min-w-[80px] flex-1">
								<label class="mb-1 block text-xs text-muted-foreground" for="disc-{i}"
									>Korting %</label
								>
								<Input
									id="disc-{i}"
									type="number"
									min="0"
									max="100"
									step="1"
									bind:value={item.discountPct}
								/>
							</div>
							<div class="min-w-[110px] flex-1">
								<label class="mb-1 block text-xs text-muted-foreground" for="btw-{i}">BTW</label>
								<select
									id="btw-{i}"
									bind:value={item.btwRate}
									disabled={doc.kind === 'kwitantie'}
									class="h-9 w-full border border-input bg-background px-2 text-sm disabled:opacity-50"
								>
									{#each btwOptions as opt (opt.value)}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							</div>
							<div class="flex gap-1">
								<button
									type="button"
									onclick={() => moveLine(i, -1)}
									disabled={i === 0}
									class="h-9 w-8 border text-xs hover:bg-muted disabled:opacity-30"
									aria-label="Omhoog">↑</button
								>
								<button
									type="button"
									onclick={() => moveLine(i, 1)}
									disabled={i === doc.lineItems.length - 1}
									class="h-9 w-8 border text-xs hover:bg-muted disabled:opacity-30"
									aria-label="Omlaag">↓</button
								>
								<button
									type="button"
									onclick={() => removeLine(i)}
									class="h-9 w-8 border text-xs hover:bg-destructive hover:text-primary-foreground"
									aria-label="Verwijderen">×</button
								>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<Button type="button" variant="outline" onclick={addLine}>+ Regel toevoegen</Button>
		</fieldset>

		<fieldset class="space-y-3 border p-4">
			<legend class="px-1 text-sm font-medium">Korting op totaal</legend>
			<div class="flex flex-wrap items-end gap-2">
				<div class="min-w-[140px] flex-1">
					<label class="mb-1 block text-xs text-muted-foreground" for="disc-mode">Type</label>
					<select
						id="disc-mode"
						bind:value={doc.discountMode}
						class="h-9 w-full border border-input bg-background px-2 text-sm"
					>
						<option value="pct">Percentage (%)</option>
						<option value="amount">Vast bedrag (€)</option>
					</select>
				</div>
				<div class="min-w-[120px] flex-1">
					<label class="mb-1 block text-xs text-muted-foreground" for="disc-val">
						{doc.discountMode === 'pct' ? 'Korting %' : 'Korting €'}
					</label>
					<Input
						id="disc-val"
						type="number"
						min="0"
						max={doc.discountMode === 'pct' ? 100 : undefined}
						step={doc.discountMode === 'pct' ? 1 : 0.01}
						bind:value={doc.discountValue}
					/>
				</div>
			</div>
			{#if totals.totalDiscount > 0}
				<p class="text-xs text-muted-foreground">
					Korting op totaal: −{formatEUR(totals.totalDiscount)} (over {formatEUR(
						totals.subtotal + totals.totalDiscount
					)} na regelkortingen).
				</p>
			{/if}
		</fieldset>

		<div class="space-y-1.5">
			<Label for="notes">Notities (optioneel)</Label>
			<Textarea
				id="notes"
				rows={3}
				bind:value={doc.notes}
				placeholder="Bijv. afspraak over locatie, speciale service, afwijkende planning…"
			/>
		</div>

		{#if doc.kind !== 'kwitantie'}
			<div class="space-y-1.5">
				<Label for="terms">Betaling & voorwaarden</Label>
				<Textarea id="terms" rows={6} bind:value={doc.terms} />
			</div>
		{/if}

		<div class="space-y-1.5">
			<Label for="footerNote">Voettekst</Label>
			<Textarea id="footerNote" rows={2} bind:value={doc.footerNote} />
		</div>

		<div class="flex flex-wrap gap-2">
			<Button type="button" onclick={() => window.print()}>Print / Opslaan als PDF</Button>
			<a
				class="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
				href={calculatorHref}
			>
				Bereken met calculator
			</a>
			{#if doc.kind === 'offerte'}
				<form method="POST" action="?/saveQuote">
					<input type="hidden" name="dealId" value={deal.id} />
					<input type="hidden" name="quote" value={quotePayload} />
					<Button type="submit" variant="outline">Opslaan als actieve offerte op portal</Button>
				</form>
			{/if}
			{#if doc.kind === 'factuur'}
				<!-- Keeps the editor as it is after saving: you often print right after. -->
				<form
					method="POST"
					action="?/saveInvoice"
					use:enhance={() =>
						async ({ update }) => {
							await update({ reset: false });
						}}
				>
					<input type="hidden" name="dealId" value={deal.id} />
					<input type="hidden" name="doc" value={JSON.stringify($state.snapshot(doc))} />
					<Button
						type="submit"
						variant="outline"
						disabled={!doc.number}
						title={doc.number ? '' : 'Geef de factuur eerst een nummer'}
					>
						Zet in klantportaal
					</Button>
				</form>
			{/if}
		</div>
	</section>

	<!-- Preview / printable -->
	<section class="bg-white text-black shadow-sm print:shadow-none">
		<DocumentView {doc} />
	</section>
</div>

<style>
	:global(input[type='date']::-webkit-calendar-picker-indicator) {
		filter: brightness(0);
		cursor: pointer;
		opacity: 0.8;
	}

	@media print {
		:global(body) {
			background: white;
		}
	}
	@page {
		size: A4;
		margin: 18mm;
	}
</style>
