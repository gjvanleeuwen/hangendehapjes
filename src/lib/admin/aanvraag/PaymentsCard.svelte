<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatEUR } from '$lib/admin/calc';
	import { PREPAYMENT_STATUSES, PREPAYMENT_STATUS_LABELS, type Deal } from '$lib/deals';
	import { keepValues, submitOnChange } from './shared';

	// Mark payments by hand, also the ones that came in outside the Mollie link
	// (a bank transfer, a tikkie). Saves on change; the klantportaal shows the
	// same state ("Betaald") right away.
	let { deal }: { deal: Deal } = $props();

	const rows = $derived([
		...(deal.paymentTerm === 'achteraf'
			? []
			: [
					{
						name: 'depositStatus',
						label: 'Aanbetaling',
						amount: deal.depositAmount,
						status: deal.depositStatus
					}
				]),
		{
			name: 'finalPaymentStatus',
			label: deal.paymentTerm === 'achteraf' ? 'Factuur' : 'Eindbetaling',
			amount: deal.finalPaymentAmount,
			status: deal.finalPaymentStatus
		}
	]);

	const tone = (status: string) =>
		status === 'paid'
			? 'border-emerald-300 bg-emerald-50 text-emerald-900'
			: status === 'waived'
				? 'border-border bg-muted text-muted-foreground'
				: 'border-input bg-background';
</script>

<section class="space-y-2 border bg-card p-3">
	<h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Betalingen</h2>
	{#each rows as r (r.name)}
		<form
			method="POST"
			action="?/update"
			class="flex items-center justify-between gap-2"
			use:enhance={keepValues}
		>
			<input type="hidden" name="id" value={deal.id} />
			<div class="min-w-0 text-sm">
				<div>{r.label}</div>
				{#if r.amount != null}
					<div class="text-xs text-muted-foreground tabular-nums">{formatEUR(r.amount)}</div>
				{/if}
			</div>
			<select
				name={r.name}
				value={r.status}
				onchange={submitOnChange}
				aria-label="{r.label} status"
				class="h-7 rounded-full border px-2 text-xs {tone(r.status)}"
			>
				{#each PREPAYMENT_STATUSES as s (s)}
					<option value={s}>{PREPAYMENT_STATUS_LABELS[s]}</option>
				{/each}
			</select>
		</form>
	{/each}
</section>
