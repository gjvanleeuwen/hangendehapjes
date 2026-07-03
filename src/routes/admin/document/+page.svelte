<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { BUSINESS } from '$lib/admin/business';
	import {
		calcTotals,
		formatBtw,
		formatDateNL,
		formatEUR,
		lineDiscountAmount,
		lineSubtotal
	} from '$lib/admin/calc';
	import type { BtwRate, DocumentKind, DocumentState } from '$lib/admin/types';

	let { data, form } = $props();

	const today = new Date().toISOString().slice(0, 10);
	const initialKind = (page.url.searchParams.get('kind') as DocumentKind) || 'offerte';
	const deal = untrack(() => data.deal);

	const defaultTerms = (kind: DocumentKind) => {
		if (kind === 'offerte') {
			return [
				'Voor deze offerte houden wij de evenementdatum vast tot de verloopdatum (14 dagen na verzenden). Bij akkoord vragen wij een aanbetaling van 50% van het totaalbedrag. De boeking is definitief zodra de aanbetaling is ontvangen. De aanbetaling wordt verrekend met de eindfactuur. Het resterende bedrag kan voldaan worden binnen 14 dagen na het evenement.',
				'Definitieve aantallen, dieetwensen en praktische locatiegegevens ontvangen wij graag uiterlijk 14 dagen voor het evenement. Op deze offerte zijn onze algemene voorwaarden van toepassing.'
			].join('\n');
		}
		if (kind === 'factuur') {
			return [
				'Voor deze boeking vragen wij een aanbetaling van 50% van het totaalbedrag. De boeking is definitief zodra de aanbetaling is ontvangen. De aanbetaling wordt verrekend met de eindfactuur. Het resterende bedrag kan voldaan worden binnen 14 dagen na het evenement.',
				'Definitieve aantallen, dieetwensen en praktische locatiegegevens ontvangen wij graag uiterlijk 14 dagen voor het evenement. Op deze factuur zijn onze algemene voorwaarden van toepassing.'
			].join('\n');
		}
		return '';
	};

	const defaultFooterNote = (kind: DocumentKind) => {
		if (kind === 'offerte') return `Vragen over deze offerte? Mail ons op ${BUSINESS.email}.`;
		if (kind === 'factuur') return `Vragen over deze factuur? Mail ons op ${BUSINESS.email}.`;
		return '';
	};

	const isDefaultTerms = (value: string) =>
		value === '' || value === defaultTerms('offerte') || value === defaultTerms('factuur');

	const isDefaultFooterNote = (value: string) =>
		value === '' ||
		value === defaultFooterNote('offerte') ||
		value === defaultFooterNote('factuur');

	const doc = $state<DocumentState>({
		kind: initialKind,
		number: initialKind === 'factuur' ? `${new Date().getFullYear()}-` : '',
		date: today,
		eventDate: deal?.eventDate ?? '',
		validUntil: '',
		paidOn: today,
		recipient: { name: deal?.name ?? '', company: '', address: '' },
		lineItems: [{ description: '', qty: 50, unitPrice: 2.5, btwRate: 'none', discountPct: 0 }],
		discountMode: 'pct',
		discountValue: 0,
		notes: '',
		terms: defaultTerms(initialKind),
		footerNote: defaultFooterNote(initialKind)
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

	const termsParts = $derived(
		doc.terms.split('\n').map((line) => {
			const phrase = 'algemene voorwaarden';
			const index = line.toLowerCase().indexOf(phrase);
			return {
				before: index >= 0 ? line.slice(0, index) : line,
				link: index >= 0 ? line.slice(index, index + phrase.length) : '',
				after: index >= 0 ? line.slice(index + phrase.length) : ''
			};
		})
	);

	function setKind(kind: DocumentKind) {
		if (doc.kind === kind) return;
		const shouldReplaceTerms = isDefaultTerms(doc.terms);
		const shouldReplaceFooterNote = isDefaultFooterNote(doc.footerNote);
		doc.kind = kind;
		if (doc.kind === 'factuur' && !doc.number) doc.number = `${new Date().getFullYear()}-`;
		if (shouldReplaceTerms) doc.terms = defaultTerms(kind);
		if (shouldReplaceFooterNote) doc.footerNote = defaultFooterNote(kind);
	}

	$effect(() => {
		if (page.url.searchParams.get('from') !== 'calc') return;
		try {
			const raw = sessionStorage.getItem('hh_calculator_prefill');
			if (!raw) return;
			const data = JSON.parse(raw) as {
				description: string;
				qty: number;
				unitPrice: number;
				btwRate: BtwRate;
				costs?: number | null;
				timeSpent?: Record<string, number>;
			};
			const { costs, timeSpent, ...lineItem } = data;
			doc.lineItems = [{ ...lineItem, discountPct: 0 }];
			calculatorMeta.costs = costs ?? null;
			calculatorMeta.timeSpent = timeSpent ?? {};
			sessionStorage.removeItem('hh_calculator_prefill');
		} catch {
			// ignore
		}
	});

	const totals = $derived(
		calcTotals($state.snapshot(doc).lineItems, {
			mode: doc.discountMode,
			value: doc.discountValue
		})
	);

	const headingLabel = $derived(
		doc.kind === 'offerte' ? 'Offerte' : doc.kind === 'factuur' ? 'Factuur' : 'Kwitantie'
	);
	const calculatorHref = $derived(`/admin/calculator${deal ? `?deal=${deal.id}` : ''}`);

	const allNoVat = $derived(doc.lineItems.every((l) => l.btwRate === 'none'));
	const showBtwColumn = $derived(doc.kind !== 'kwitantie' && !allNoVat);
	const showBtwBreakdown = $derived(doc.kind !== 'kwitantie' && totals.btwGroups.length > 0);

	const hasDiscount = $derived(totals.lineDiscountTotal > 0 || totals.totalDiscount > 0);
	const showSummaryDetail = $derived(showBtwBreakdown || hasDiscount);
	const totalDiscountLabel = $derived(
		doc.discountMode === 'pct' ? `Korting ${doc.discountValue}%` : 'Korting'
	);

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
		<div>
			<h1 class="font-heading text-2xl">{headingLabel}</h1>
			{#if deal}
				<p class="mt-1 text-sm text-muted-foreground">
					Opslaan op aanvraag van <strong>{deal.name}</strong>.
				</p>
			{/if}
			<div class="mt-3 flex flex-wrap gap-2">
				{#each ['offerte', 'factuur', 'kwitantie'] as const as k}
					<button
						type="button"
						onclick={() => setKind(k)}
						class="border px-3 py-1.5 text-sm capitalize transition {doc.kind === k
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						{k}
					</button>
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
					placeholder={doc.kind === 'factuur' ? '2026-001' : 'Bijv. Bruiloft Jansen'}
				/>
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
									{#each btwOptions as opt}
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
		</div>
	</section>

	<!-- Preview / printable -->
	<section class="bg-white text-black shadow-sm print:shadow-none">
		<article class="doc mx-auto p-10 print:p-0">
			<header class="flex items-start justify-between gap-6">
				<div>
					<div
						class="font-wordmark text-2xl font-bold tracking-[0.08em] whitespace-nowrap uppercase"
						style="color: var(--brand-magenta);"
					>
						{BUSINESS.name}
					</div>
					<div class="mt-3 text-sm leading-tight">
						<div>{BUSINESS.addressLine1}</div>
						<div>{BUSINESS.addressLine2}</div>
						<div>{BUSINESS.email}</div>
					</div>
				</div>
				<div class="text-right">
					<div class="font-heading text-3xl uppercase">{headingLabel}</div>
					{#if doc.kind === 'factuur'}
						<div class="text-sm">
							Factuurnummer: <span class="font-medium">{doc.number || '—'}</span>
						</div>
					{:else if doc.number}
						<div class="text-sm">Ref: <span class="font-medium">{doc.number}</span></div>
					{/if}
					<div class="text-sm">Datum: {formatDateNL(doc.date) || '—'}</div>
					{#if doc.eventDate}
						<div class="text-sm">Eventdatum: {formatDateNL(doc.eventDate)}</div>
					{/if}
					{#if doc.kind === 'offerte' && doc.validUntil}
						<div class="text-sm">Geldig t/m: {formatDateNL(doc.validUntil)}</div>
					{/if}
					{#if doc.kind === 'kwitantie' && doc.paidOn}
						<div class="text-sm">Voldaan op: {formatDateNL(doc.paidOn)}</div>
					{/if}
				</div>
			</header>

			<div class="mt-8">
				<div class="text-xs tracking-wide text-neutral-500 uppercase">Aan</div>
				<div class="mt-1 text-sm leading-tight">
					{#if doc.recipient.name}<div class="font-medium">{doc.recipient.name}</div>{/if}
					{#if doc.recipient.company}<div>{doc.recipient.company}</div>{/if}
					{#if doc.recipient.address}
						<div class="whitespace-pre-line">{doc.recipient.address}</div>
					{/if}
				</div>
			</div>

			<table class="mt-8 w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-neutral-300 text-left">
						<th class="py-2 pr-2 font-medium">Omschrijving</th>
						<th class="py-2 pr-2 text-right font-medium">Aantal</th>
						<th class="py-2 pr-2 text-right font-medium">Prijs</th>
						{#if showBtwColumn}
							<th class="py-2 pr-2 text-right font-medium">BTW</th>
						{/if}
						<th class="py-2 text-right font-medium">Totaal</th>
					</tr>
				</thead>
				<tbody>
					{#each doc.lineItems as item (item)}
						<tr class="align-top {item.discountPct > 0 ? '' : 'border-b border-neutral-200'}">
							<td class="py-2 pr-2">{item.description || '—'}</td>
							<td class="py-2 pr-2 text-right tabular-nums">{item.qty}</td>
							<td class="py-2 pr-2 text-right tabular-nums">{formatEUR(item.unitPrice)}</td>
							{#if showBtwColumn}
								<td class="py-2 pr-2 text-right tabular-nums">{formatBtw(item.btwRate)}</td>
							{/if}
							<td class="py-2 text-right tabular-nums">{formatEUR(lineSubtotal(item))}</td>
						</tr>
						{#if item.discountPct > 0}
							<tr class="border-b border-neutral-200 align-top text-neutral-600">
								<td class="pb-2 pl-3 text-xs" colspan={showBtwColumn ? 4 : 3}>
									Korting {item.discountPct}%
								</td>
								<td class="pb-2 text-right text-xs tabular-nums">
									−{formatEUR(lineDiscountAmount(item))}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>

			<div class="mt-4 flex justify-end">
				<table class="text-sm">
					<tbody>
						{#if showSummaryDetail}
							<tr>
								<td class="py-1 pr-6">Subtotaal</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(totals.grossSubtotal)}</td>
							</tr>
							{#if totals.lineDiscountTotal > 0}
								<tr class="text-neutral-600">
									<td class="py-1 pr-6">Korting op regels</td>
									<td class="py-1 text-right tabular-nums"
										>−{formatEUR(totals.lineDiscountTotal)}</td
									>
								</tr>
							{/if}
							{#if totals.totalDiscount > 0}
								<tr class="text-neutral-600">
									<td class="py-1 pr-6">{totalDiscountLabel}</td>
									<td class="py-1 text-right tabular-nums">−{formatEUR(totals.totalDiscount)}</td>
								</tr>
							{/if}
							{#if showBtwBreakdown}
								{#if hasDiscount}
									<tr>
										<td class="py-1 pr-6">Subtotaal na korting</td>
										<td class="py-1 text-right tabular-nums">{formatEUR(totals.subtotal)}</td>
									</tr>
								{/if}
								{#each totals.btwGroups as g}
									<tr>
										<td class="py-1 pr-6">BTW {g.rate}% over {formatEUR(g.base)}</td>
										<td class="py-1 text-right tabular-nums">{formatEUR(g.tax)}</td>
									</tr>
								{/each}
								{#if totals.noVatBase > 0}
									<tr>
										<td class="py-1 pr-6 text-neutral-600"
											>Geen BTW over {formatEUR(totals.noVatBase)}</td
										>
										<td class="py-1 text-right tabular-nums">—</td>
									</tr>
								{/if}
							{/if}
							<tr class="border-t border-neutral-400 font-medium">
								<td class="py-2 pr-6">
									{doc.kind === 'kwitantie' ? 'Totaal voldaan' : 'Totaal'}
								</td>
								<td class="py-2 text-right tabular-nums">{formatEUR(totals.total)}</td>
							</tr>
						{:else}
							<tr class="border-t border-neutral-400 font-medium">
								<td class="py-2 pr-6">
									{doc.kind === 'kwitantie' ? 'Totaal voldaan' : 'Totaal'}
								</td>
								<td class="py-2 text-right tabular-nums">{formatEUR(totals.total)}</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			{#if doc.kind !== 'kwitantie' && allNoVat && doc.lineItems.length > 0}
				<div class="mt-3 text-right text-xs text-neutral-600">Geen BTW van toepassing.</div>
			{/if}

			{#if doc.notes}
				<div class="mt-8">
					<div class="text-xs tracking-wide text-neutral-500 uppercase">Notities</div>
					<div class="mt-1 text-sm whitespace-pre-line">{doc.notes}</div>
				</div>
			{/if}

			{#if doc.kind !== 'kwitantie' && doc.terms}
				<div class="mt-8 text-[10px] leading-relaxed text-neutral-600">
					<div class="tracking-wide text-neutral-500 uppercase">Betaling & voorwaarden</div>
					<div class="mt-1">
						{#each termsParts as part}
							<p>
								{part.before}{#if part.link}<a class="underline" href="/terms">{part.link}</a
									>{/if}{part.after}
							</p>
						{/each}
					</div>
				</div>
			{/if}

			<footer
				class="mt-12 border-t border-neutral-300 pt-4 text-xs leading-relaxed text-neutral-600"
			>
				{#if doc.kind === 'factuur'}
					<div>
						Gelieve het bedrag van <span class="font-medium">{formatEUR(totals.total)}</span> binnen
						14 dagen over te maken op {BUSINESS.iban} t.n.v. {BUSINESS.name} o.v.v. factuurnummer {doc.number ||
							'—'}.
					</div>
					{#if doc.footerNote}
						<div class="mt-2">{doc.footerNote}</div>
					{/if}
					<div class="mt-2 flex flex-wrap gap-x-4">
						<span>{BUSINESS.name}</span>
						<span>{BUSINESS.email}</span>
						<span>IBAN {BUSINESS.iban}</span>
						{#if BUSINESS.kvk}<span>KvK {BUSINESS.kvk}</span>{/if}
						{#if BUSINESS.btwId}<span>BTW {BUSINESS.btwId}</span>{/if}
					</div>
				{:else if doc.kind === 'offerte'}
					<div>{doc.footerNote}</div>
				{:else}
					<div>
						{doc.footerNote ||
							`Bedankt! Deze kwitantie bevestigt ontvangst van ${formatEUR(totals.total)}.`}
					</div>
				{/if}
			</footer>
		</article>
	</section>
</div>

<style>
	:global(input[type='date']::-webkit-calendar-picker-indicator) {
		filter: brightness(0);
		cursor: pointer;
		opacity: 0.8;
	}

	.doc {
		font-family: 'Raleway Variable', system-ui, sans-serif;
		max-width: 560px;
	}
	@media print {
		:global(body) {
			background: white;
		}
		.doc {
			max-width: none;
		}
	}
	@page {
		size: A4;
		margin: 18mm;
	}
</style>
