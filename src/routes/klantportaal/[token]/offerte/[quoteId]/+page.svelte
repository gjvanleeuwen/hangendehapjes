<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { BUSINESS } from '$lib/admin/business';
	import {
		calcTotals,
		formatBtw,
		formatDateNL,
		formatEUR,
		lineDiscountAmount,
		lineSubtotal
	} from '$lib/admin/calc';

	// Design width of the document. Below this the whole thing is scaled down to
	// fit rather than reflowed, so a phone shows the same document as the PDF.
	const DOC_WIDTH = 560;

	let fitWidth = $state(0);
	// Scale down only. Wider viewports leave the document at its natural size
	// instead of blowing it up to fill the screen.
	const scale = $derived(fitWidth > 0 ? Math.min(1, fitWidth / DOC_WIDTH) : 1);

	let { data } = $props();
	const q = $derived(data.quote);
	const totals = $derived(
		calcTotals(q.lineItems, { mode: q.discountMode, value: q.discountValue })
	);
	const showBtwColumn = $derived(q.lineItems.some((item) => item.btwRate !== 'none'));
	const termsParts = $derived(
		q.terms.split('\n').map((line) => {
			const phrase = 'algemene voorwaarden';
			const index = line.toLowerCase().indexOf(phrase);
			return {
				before: index >= 0 ? line.slice(0, index) : line,
				link: index >= 0 ? line.slice(index, index + phrase.length) : '',
				after: index >= 0 ? line.slice(index + phrase.length) : ''
			};
		})
	);
</script>

<svelte:head>
	<title>{q.version} {q.label} - Hangende Hapjes</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-6 print:p-0">
	<div class="mb-4 flex gap-2 print:hidden">
		<Button type="button" onclick={() => window.print()}>Download / opslaan als PDF</Button>
	</div>

	<!-- The document keeps its A4-ish proportions at every screen size and is
	     scaled down to fit, the way a PDF viewer does. Reflowing it instead
	     (stacking the header, shrinking single columns) would make the page the
	     client reads on their phone differ from the PDF they download. -->
	<div class="doc-fit" bind:clientWidth={fitWidth}>
		<article
			class="doc mx-auto bg-white p-10 text-black print:p-0"
			style="zoom: {scale}; --doc-width: {DOC_WIDTH}px;"
		>
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
					<div class="font-heading text-3xl uppercase">Offerte</div>
					<div class="text-sm">Ref: <span class="font-medium">{q.version} - {q.label}</span></div>
					<div class="text-sm">Datum: {formatDateNL(q.date) || '-'}</div>
					{#if q.eventDate}<div class="text-sm">Eventdatum: {formatDateNL(q.eventDate)}</div>{/if}
					{#if q.validUntil}<div class="text-sm">Geldig t/m: {formatDateNL(q.validUntil)}</div>{/if}
				</div>
			</header>

			<div class="mt-8">
				<div class="text-xs tracking-wide text-neutral-500 uppercase">Aan</div>
				<div class="mt-1 text-sm leading-tight">
					{#if q.recipient.name}<div class="font-medium">{q.recipient.name}</div>{/if}
					{#if q.recipient.company}<div>{q.recipient.company}</div>{/if}
					{#if q.recipient.address}<div class="whitespace-pre-line">{q.recipient.address}</div>{/if}
				</div>
			</div>

			<table class="mt-8 w-full border-collapse text-sm">
				<thead>
					<tr class="border-b border-neutral-300 text-left">
						<th class="py-2 pr-2 font-medium">Omschrijving</th>
						<th class="py-2 pr-2 text-right font-medium">Aantal</th>
						<th class="py-2 pr-2 text-right font-medium">Prijs</th>
						{#if showBtwColumn}<th class="py-2 pr-2 text-right font-medium">BTW</th>{/if}
						<th class="py-2 text-right font-medium">Totaal</th>
					</tr>
				</thead>
				<tbody>
					{#each q.lineItems as item}
						<tr class="border-b border-neutral-200 align-top">
							<td class="py-2 pr-2">{item.description || '-'}</td>
							<td class="py-2 pr-2 text-right tabular-nums">{item.qty}</td>
							<td class="py-2 pr-2 text-right tabular-nums">{formatEUR(item.unitPrice)}</td>
							{#if showBtwColumn}<td class="py-2 pr-2 text-right tabular-nums"
									>{formatBtw(item.btwRate)}</td
								>{/if}
							<td class="py-2 text-right tabular-nums">{formatEUR(lineSubtotal(item))}</td>
						</tr>
						{#if item.discountPct > 0}
							<tr class="border-b border-neutral-200 align-top text-neutral-600">
								<td class="pb-2 pl-3 text-xs" colspan={showBtwColumn ? 4 : 3}>
									Korting {item.discountPct}%
								</td>
								<td class="pb-2 text-right text-xs tabular-nums">
									-{formatEUR(lineDiscountAmount(item))}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>

			<div class="mt-4 flex justify-end">
				<table class="text-sm">
					<tbody>
						<tr>
							<td class="py-1 pr-6">Subtotaal</td>
							<td class="py-1 text-right tabular-nums">{formatEUR(totals.grossSubtotal)}</td>
						</tr>
						{#if totals.totalDiscount > 0}
							<tr class="text-neutral-600">
								<td class="py-1 pr-6">Korting</td>
								<td class="py-1 text-right tabular-nums">-{formatEUR(totals.totalDiscount)}</td>
							</tr>
						{/if}
						{#each totals.btwGroups as g}
							<tr>
								<td class="py-1 pr-6">BTW {g.rate}% over {formatEUR(g.base)}</td>
								<td class="py-1 text-right tabular-nums">{formatEUR(g.tax)}</td>
							</tr>
						{/each}
						<tr class="border-t border-neutral-400 font-medium">
							<td class="py-2 pr-6">Totaal</td>
							<td class="py-2 text-right tabular-nums">{formatEUR(totals.total)}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{#if q.notes}
				<div class="mt-8">
					<div class="text-xs tracking-wide text-neutral-500 uppercase">Notities</div>
					<div class="mt-1 text-sm whitespace-pre-line">{q.notes}</div>
				</div>
			{/if}

			{#if q.terms}
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
				{q.footerNote}
			</footer>
		</article>
	</div>
</main>

<style>
	.doc {
		font-family: 'Raleway Variable', system-ui, sans-serif;
		/* Fixed, not max-width: the layout must stay identical at every screen
		   size so `zoom` can shrink the whole thing uniformly. */
		width: var(--doc-width);
	}
	@media print {
		:global(body) {
			background: white;
		}
		.doc {
			/* Beat the inline `zoom` from the fit-to-width calculation: printing
			   has its own page box and must never inherit the screen scale. */
			zoom: 1 !important;
			width: auto;
		}
	}
	@page {
		size: A4;
		margin: 18mm;
	}
</style>
