<script lang="ts">
	import type { Snippet } from 'svelte';
	import QuoteVersions from '$lib/admin/aanvraag/QuoteVersions.svelte';
	import PortalPaymentForm from '$lib/admin/aanvraag/PortalPaymentForm.svelte';
	import PortalQuestionsForm from '$lib/admin/aanvraag/PortalQuestionsForm.svelte';
	import PortalLinkCard from '$lib/admin/aanvraag/PortalLinkCard.svelte';
	import PortalEvidence from '$lib/admin/aanvraag/PortalEvidence.svelte';
	import InvoiceList from '$lib/admin/aanvraag/InvoiceList.svelte';

	// The client portal in four steps, one card each, same look as the overzicht.
	// Each step saves on its own. Header and tabs come from ../+layout.svelte.
	let { data, form } = $props();
	const deal = $derived(data.deal);
</script>

<svelte:head>
	<title>Portaal · {deal.name}</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#snippet card(step: string, title: string, body: Snippet, extra?: Snippet)}
	<section class="border bg-card">
		<div class="flex items-baseline justify-between gap-3 border-b px-4 py-2.5">
			<h2 class="text-sm font-medium">
				<span class="text-muted-foreground">{step}</span>
				{title}
			</h2>
			{#if extra}{@render extra()}{/if}
		</div>
		<div class="p-4">{@render body()}</div>
	</section>
{/snippet}

{#if form?.error}
	<div class="mb-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
		{form.error}
	</div>
{/if}

<div class="space-y-5">
	{#snippet quotes()}<QuoteVersions {deal} />{/snippet}
	{#snippet newQuote()}
		<a class="text-xs underline" href="/admin/aanvragen/{deal.id}/document?kind=offerte">
			Nieuwe versie maken
		</a>
	{/snippet}
	{@render card('1.', 'Offerte', quotes, newQuote)}

	{#snippet payment()}<PortalPaymentForm {deal} />{/snippet}
	{@render card('2.', 'Welke offerte en hoe betalen', payment)}

	{#snippet questions()}<PortalQuestionsForm {deal} />{/snippet}
	{@render card('3.', 'Wat de klant ziet', questions)}

	{#snippet link()}<PortalLinkCard {deal} origin={data.origin} today={data.today} />{/snippet}
	{@render card('4.', 'Klantlink', link)}

	{#snippet invoices()}<InvoiceList {deal} />{/snippet}
	{#snippet newInvoice()}
		<a class="text-xs underline" href="/admin/aanvragen/{deal.id}/document?kind=factuur">
			Factuur maken
		</a>
	{/snippet}
	{@render card('5.', 'Facturen', invoices, newInvoice)}

	{#snippet evidence()}<PortalEvidence {deal} />{/snippet}
	{@render card('', 'Bewijs', evidence)}
</div>
