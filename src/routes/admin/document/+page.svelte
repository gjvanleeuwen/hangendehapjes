<script lang="ts">
	import { page } from '$app/state';
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

	const today = new Date().toISOString().slice(0, 10);
	const initialKind = (page.url.searchParams.get('kind') as DocumentKind) || 'offerte';

	const doc = $state<DocumentState>({
		kind: initialKind,
		number: initialKind === 'factuur' ? `${new Date().getFullYear()}-` : '',
		date: today,
		validUntil: '',
		paidOn: today,
		recipient: { name: '', company: '', address: '' },
		lineItems: [{ description: '', qty: 50, unitPrice: 2.5, btwRate: 'none', discountPct: 0 }],
		discountMode: 'pct',
		discountValue: 0,
		notes: ''
	});

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
			};
			doc.lineItems = [{ ...data, discountPct: 0 }];
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
</script>

<svelte:head>
	<title>{headingLabel} — admin</title>
</svelte:head>

<div class="grid gap-8 lg:grid-cols-[1.2fr_minmax(0,560px)] print:block">
	<!-- Editor -->
	<section class="space-y-6 print:hidden">
		<div>
			<h1 class="font-heading text-2xl">{headingLabel}</h1>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each ['offerte', 'factuur', 'kwitantie'] as const as k}
					<button
						type="button"
						onclick={() => (doc.kind = k)}
						class="border px-3 py-1.5 text-sm capitalize transition {doc.kind === k
							? 'border-primary bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
					>
						{k}
					</button>
				{/each}
			</div>
		</div>

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
				placeholder="Bijv. afspraken, betalingstermijn, locatie…"
			/>
		</div>

		<div class="flex gap-2">
			<Button type="button" onclick={() => window.print()}>Print / Opslaan als PDF</Button>
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

			<footer
				class="mt-12 border-t border-neutral-300 pt-4 text-xs leading-relaxed text-neutral-600"
			>
				{#if doc.kind === 'factuur'}
					<div>
						Gelieve het bedrag van <span class="font-medium">{formatEUR(totals.total)}</span> binnen
						14 dagen over te maken op {BUSINESS.iban} t.n.v. {BUSINESS.name} o.v.v. factuurnummer {doc.number ||
							'—'}.
					</div>
					<div class="mt-2 flex flex-wrap gap-x-4">
						<span>{BUSINESS.name}</span>
						<span>{BUSINESS.email}</span>
						<span>IBAN {BUSINESS.iban}</span>
						{#if BUSINESS.kvk}<span>KvK {BUSINESS.kvk}</span>{/if}
						{#if BUSINESS.btwId}<span>BTW {BUSINESS.btwId}</span>{/if}
					</div>
				{:else if doc.kind === 'offerte'}
					<div>Vragen over deze offerte? Mail ons op {BUSINESS.email}.</div>
				{:else}
					<div>
						Bedankt! Deze kwitantie bevestigt ontvangst van {formatEUR(totals.total)}.
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
