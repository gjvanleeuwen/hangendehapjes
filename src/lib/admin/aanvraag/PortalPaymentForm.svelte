<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		PAYMENT_TERMS,
		PAYMENT_TERM_LABELS,
		PREPAYMENT_STATUSES,
		PREPAYMENT_STATUS_LABELS,
		activeQuoteOf,
		type Deal
	} from '$lib/deals';
	import { keepValues, selectClass } from './shared';

	// Which offerte the client sees, and how they pay. One ?/update form.
	let { deal }: { deal: Deal } = $props();

	const activeQuoteId = $derived(activeQuoteOf(deal)?.id ?? '');

	const suggestedDeposit = $derived(
		deal.depositAmount ??
			deal.prepaymentAmount ??
			(deal.offerteAmount == null ? '' : Math.round((deal.offerteAmount / 2) * 100) / 100)
	);

	const suggestedFinalPayment = $derived.by(() => {
		if (deal.finalPaymentAmount != null) return deal.finalPaymentAmount;
		if (deal.offerteAmount == null) return '';
		const deposit = Number(suggestedDeposit) || 0;
		return Math.max(0, Math.round((deal.offerteAmount - deposit) * 100) / 100);
	});

	let paymentTerm = $derived(deal.paymentTerm);
</script>

<form method="POST" action="?/update" class="space-y-4" use:enhance={keepValues}>
	<input type="hidden" name="id" value={deal.id} />

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="space-y-1">
			<Label for="pp-activeQuoteId">Actieve offerte</Label>
			<select id="pp-activeQuoteId" name="activeQuoteId" class={selectClass} value={activeQuoteId}>
				<option value="">Geen actieve offerte</option>
				{#each deal.quoteVersions as q (q.id)}
					<option value={q.id}>{q.version} - {q.label}</option>
				{/each}
			</select>
		</div>
		<div class="space-y-1">
			<Label for="pp-paymentTerm">Betaalafspraak</Label>
			<select id="pp-paymentTerm" name="paymentTerm" class={selectClass} bind:value={paymentTerm}>
				{#each PAYMENT_TERMS as term (term)}
					<option value={term}>{PAYMENT_TERM_LABELS[term]}</option>
				{/each}
			</select>
			<p class="text-xs text-muted-foreground">Bepaalt de akkoordtekst die de klant tekent.</p>
		</div>
	</div>

	<div
		class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
		class:opacity-60={paymentTerm === 'achteraf'}
	>
		<div class="space-y-1">
			<Label for="pp-depositAmount">Aanbetaling (€)</Label>
			<Input
				id="pp-depositAmount"
				name="depositAmount"
				type="number"
				step="0.01"
				min="0"
				inputmode="decimal"
				value={suggestedDeposit}
			/>
		</div>
		<div class="space-y-1">
			<Label for="pp-depositStatus">Aanbetaling status</Label>
			<select
				id="pp-depositStatus"
				name="depositStatus"
				class={selectClass}
				value={deal.depositStatus}
			>
				{#each PREPAYMENT_STATUSES as s (s)}
					<option value={s}>{PREPAYMENT_STATUS_LABELS[s]}</option>
				{/each}
			</select>
		</div>
		<div class="space-y-1 sm:col-span-2">
			<Label for="pp-depositLink">Mollie aanbetalingslink</Label>
			<Input
				id="pp-depositLink"
				name="depositLink"
				type="url"
				value={deal.depositLink}
				maxlength={500}
				placeholder="https://www.mollie.com/checkout/..."
			/>
		</div>
	</div>
	{#if paymentTerm === 'achteraf'}
		<p class="text-xs text-muted-foreground">Achteraf betalen: de aanbetaling is niet nodig.</p>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<div class="space-y-1">
			<Label for="pp-finalPaymentAmount">Eindbetaling (€)</Label>
			<Input
				id="pp-finalPaymentAmount"
				name="finalPaymentAmount"
				type="number"
				step="0.01"
				min="0"
				inputmode="decimal"
				value={suggestedFinalPayment}
			/>
		</div>
		<div class="space-y-1">
			<Label for="pp-finalPaymentStatus">Eindbetaling status</Label>
			<select
				id="pp-finalPaymentStatus"
				name="finalPaymentStatus"
				class={selectClass}
				value={deal.finalPaymentStatus}
			>
				{#each PREPAYMENT_STATUSES as s (s)}
					<option value={s}>{PREPAYMENT_STATUS_LABELS[s]}</option>
				{/each}
			</select>
		</div>
		<div class="space-y-1 sm:col-span-2">
			<Label for="pp-finalPaymentLink">Mollie eindbetaallink</Label>
			<Input
				id="pp-finalPaymentLink"
				name="finalPaymentLink"
				type="url"
				value={deal.finalPaymentLink}
				maxlength={500}
				placeholder="https://www.mollie.com/checkout/..."
			/>
		</div>
	</div>

	<Button type="submit">Offerte & betalen opslaan</Button>
</form>
