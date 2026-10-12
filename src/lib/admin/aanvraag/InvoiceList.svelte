<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateNL, formatEUR } from '$lib/admin/calc';
	import { invoicePaymentStatus, type Deal } from '$lib/deals';
	import { keepValues } from './shared';

	// Facturen that are in the klantportaal. Make one on the Factuur tab and
	// press "Zet in klantportaal". Posts ?/deleteInvoice.
	let { deal }: { deal: Deal } = $props();

	const typeLabel = (t: string) =>
		t === 'aanbetaling' ? 'Aanbetalingsfactuur' : t === 'eind' ? 'Eindfactuur' : 'Factuur';
</script>

{#if deal.invoices.length === 0}
	<p class="text-sm text-muted-foreground">
		Nog geen factuur in het portaal. Maak er een op het tabblad Factuur en kies "Zet in
		klantportaal".
	</p>
{:else}
	<ul class="space-y-2">
		{#each deal.invoices as inv (inv.id)}
			{@const paid = invoicePaymentStatus(inv, deal) === 'paid'}
			<li class="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
				<span class="font-medium">{inv.number}</span>
				<span class="text-muted-foreground">
					{typeLabel(inv.doc.invoiceType)} · {formatDateNL(inv.doc.date)} · {formatEUR(
						inv.amountDue
					)}
				</span>
				<span
					class="rounded border px-1.5 py-0.5 text-xs {paid
						? 'border-emerald-300 bg-emerald-50'
						: 'border-amber-300 bg-amber-50'}"
				>
					{paid ? 'Betaald' : 'Open'}
				</span>
				<div class="ms-auto flex items-center gap-3">
					{#if deal.acceptanceToken}
						<a
							class="text-xs underline"
							href="/klantportaal/{deal.acceptanceToken}/factuur/{inv.id}"
							target="_blank"
							rel="noreferrer"
						>
							Bekijken
						</a>
					{/if}
					<form method="POST" action="?/deleteInvoice" use:enhance={keepValues}>
						<input type="hidden" name="id" value={deal.id} />
						<input type="hidden" name="invoiceId" value={inv.id} />
						<button
							type="submit"
							class="text-xs text-destructive underline"
							onclick={(e) => {
								if (!confirm(`Factuur ${inv.number} uit het portaal halen?`)) e.preventDefault();
							}}
						>
							Uit portaal
						</button>
					</form>
				</div>
			</li>
		{/each}
	</ul>
{/if}
