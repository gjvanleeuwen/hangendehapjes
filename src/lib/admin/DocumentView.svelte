<script lang="ts">
	import {
		formatBtw,
		formatDateNL,
		formatEUR,
		lineDiscountAmount,
		lineSubtotal
	} from '$lib/admin/calc';
	import { docFigures, termsParts as splitTerms } from '$lib/admin/document';
	import type { DocumentState } from '$lib/admin/types';

	// The printable offerte / factuur / kwitantie. Used by the builder (live
	// preview) and by the klantportaal (a sent factuur), so the client sees
	// exactly the document we made.
	let { doc }: { doc: DocumentState } = $props();

	const f = $derived(docFigures(doc));
	const totals = $derived(f.totals);
	const prepaymentAmount = $derived(f.prepaymentAmount);
	const amountDue = $derived(f.amountDue);
	const invoiceTypeLabel = $derived(f.invoiceTypeLabel);
	const paymentInstructionsText = $derived(f.paymentInstructionsText);
	const headingLabel = $derived(f.headingLabel);
	const allNoVat = $derived(f.allNoVat);
	const showBtwColumn = $derived(f.showBtwColumn);
	const showBtwBreakdown = $derived(f.showBtwBreakdown);
	const hasDiscount = $derived(f.hasDiscount);
	const showSummaryDetail = $derived(f.showSummaryDetail);
	const totalDiscountLabel = $derived(f.totalDiscountLabel);
	const termsParts = $derived(splitTerms(doc.terms));
</script>

<!--
	Afrekening onder het totaal. Bij een aanbetaling factureren we een deel van
	het totaal; bij een eindfactuur trekken we de eerder gefactureerde aanbetaling
	er inclusief btw weer af, met verwijzing naar dat factuurnummer. Zo klopt de
	btw-afdracht over beide facturen samen precies één keer.
-->
{#snippet invoiceSettlement()}
	{#if doc.kind === 'factuur' && doc.invoiceType === 'aanbetaling'}
		<tr>
			<td class="py-1 pr-6">Aanbetaling {doc.prepaymentPct}% van het totaal</td>
			<td class="py-1 text-right tabular-nums">{formatEUR(prepaymentAmount)}</td>
		</tr>
		<tr class="border-t border-neutral-400 font-medium">
			<td class="py-2 pr-6">Nu te voldoen</td>
			<td class="py-2 text-right tabular-nums">{formatEUR(amountDue)}</td>
		</tr>
	{:else if doc.kind === 'factuur' && doc.invoiceType === 'eind'}
		<tr>
			<td class="py-1 pr-6">
				Reeds gefactureerd{#if doc.priorInvoiceNumber}
					— factuur {doc.priorInvoiceNumber}{/if}{#if doc.priorInvoiceDate}
					d.d. {formatDateNL(doc.priorInvoiceDate)}{/if} (incl. btw)
			</td>
			<td class="py-1 text-right tabular-nums">−{formatEUR(doc.priorInvoiceAmount)}</td>
		</tr>
		<tr class="border-t border-neutral-400 font-medium">
			<td class="py-2 pr-6">Nog te voldoen</td>
			<td class="py-2 text-right tabular-nums">{formatEUR(amountDue)}</td>
		</tr>
	{/if}
{/snippet}

<article class="doc mx-auto p-10 print:p-0">
	<header class="flex items-start justify-between gap-6">
		<div>
			<div
				class="font-wordmark text-2xl font-bold tracking-[0.08em] whitespace-nowrap uppercase"
				style="color: var(--brand-magenta);"
			>
				{doc.issuer.name}
			</div>
			<div class="mt-3 text-sm leading-tight">
				{#if doc.issuer.legalName}<div>{doc.issuer.legalName}</div>{/if}
				{#if doc.issuer.addressLine1}<div>{doc.issuer.addressLine1}</div>{/if}
				{#if doc.issuer.addressLine2}<div>{doc.issuer.addressLine2}</div>{/if}
				{#if doc.issuer.email}<div>{doc.issuer.email}</div>{/if}
			</div>
		</div>
		<div class="text-right">
			<div class="font-heading text-3xl uppercase">{headingLabel}</div>
			{#if doc.kind === 'factuur' && doc.invoiceType !== 'volledig'}
				<div class="text-sm font-medium">{invoiceTypeLabel}</div>
			{/if}
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
							<td class="py-1 text-right tabular-nums">−{formatEUR(totals.lineDiscountTotal)}</td>
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
						{#each totals.btwGroups as g (g.rate)}
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
					{@render invoiceSettlement()}
				{:else}
					<tr class="border-t border-neutral-400 font-medium">
						<td class="py-2 pr-6">
							{doc.kind === 'kwitantie' ? 'Totaal voldaan' : 'Totaal'}
						</td>
						<td class="py-2 text-right tabular-nums">{formatEUR(totals.total)}</td>
					</tr>
					{@render invoiceSettlement()}
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
				{#each termsParts as part, i (i)}
					<p>
						{part.before}{#if part.link}<a class="underline" href="/terms">{part.link}</a
							>{/if}{part.after}
					</p>
				{/each}
			</div>
		</div>
	{/if}

	<footer class="mt-12 border-t border-neutral-300 pt-4 text-xs leading-relaxed text-neutral-600">
		{#if doc.kind === 'factuur'}
			<div>{paymentInstructionsText}</div>
			{#if doc.footerNote}
				<div class="mt-2">{doc.footerNote}</div>
			{/if}
			<div class="mt-2 flex flex-wrap gap-x-4">
				<span>{doc.issuer.legalName || doc.issuer.name}</span>
				{#if doc.issuer.email}<span>{doc.issuer.email}</span>{/if}
				{#if doc.issuer.iban}<span>IBAN {doc.issuer.iban}</span>{/if}
				{#if doc.issuer.kvk}<span>KvK {doc.issuer.kvk}</span>{/if}
				{#if doc.issuer.btwId}<span>BTW {doc.issuer.btwId}</span>{/if}
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

<style>
	.doc {
		font-family: 'Raleway Variable', system-ui, sans-serif;
		max-width: 560px;
	}
	@media print {
		.doc {
			max-width: none;
		}
	}
</style>
