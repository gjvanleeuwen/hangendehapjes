<script lang="ts">
	import { formatDateNL } from '$lib/admin/calc';
	import {
		OPS_AUDIT_LIMIT,
		PAYMENT_TERM_LABELS,
		PREPAYMENT_STATUSES,
		PREPAYMENT_STATUS_LABELS,
		normalizePaymentTerm,
		type Deal
	} from '$lib/deals';

	// Read-only. Two boxes, not one line: the akkoord is frozen evidence of a
	// one-off legal act, the praktische gegevens are a running log of edits by
	// whoever happened to hold the link. Showing them apart is the whole point
	// of storing them apart.
	let { deal }: { deal: Deal } = $props();

	const hasSnapshot = $derived(Object.keys(deal.acceptanceSnapshot ?? {}).length > 0);

	// What the client actually signed under, which is not necessarily the deal's
	// current setting: changing the betaalafspraak after an akkoord must not
	// rewrite the evidence box to claim they agreed to something else.
	const signedPaymentTerm = $derived.by(() => {
		const fromSnapshot = deal.acceptanceSnapshot?.paymentTerm;
		return typeof fromSnapshot === 'string' ? normalizePaymentTerm(fromSnapshot) : deal.paymentTerm;
	});

	const paymentLabel = (status: string) =>
		(PREPAYMENT_STATUSES as readonly string[]).includes(status)
			? PREPAYMENT_STATUS_LABELS[status as (typeof PREPAYMENT_STATUSES)[number]]
			: status || 'Onbekend';
</script>

<div class="grid gap-3 md:grid-cols-2">
	<div class="border p-3 text-xs">
		<div class="font-medium text-foreground">Akkoord (eenmalig vastgelegd)</div>
		<div class="mt-1 space-y-0.5 text-muted-foreground">
			<div title={deal.acceptedTermsAt ?? ''}>
				Getekend: {deal.acceptedTermsAt ? formatDateNL(deal.acceptedTermsAt) : 'nog niet'}
			</div>
			{#if deal.acceptedByName}
				<div>
					Door: {deal.acceptedByName}{deal.acceptedAtLocation
						? ` te ${deal.acceptedAtLocation}`
						: ''}
				</div>
			{/if}
			{#if deal.acceptedTermsVersion}
				<div>Voorwaarden: {deal.acceptedTermsVersion}</div>
			{/if}
			<div>
				Betaalafspraak: {PAYMENT_TERM_LABELS[signedPaymentTerm]}
				{#if deal.acceptedTermsAt && signedPaymentTerm !== deal.paymentTerm}
					<span class="text-destructive">
						(nu ingesteld op {PAYMENT_TERM_LABELS[deal.paymentTerm]})
					</span>
				{/if}
			</div>
			{#if deal.acceptedIp}
				<div>IP: {deal.acceptedIp}</div>
			{/if}
			{#if deal.acceptedUserAgent}
				<div class="truncate" title={deal.acceptedUserAgent}>
					Browser: {deal.acceptedUserAgent}
				</div>
			{/if}
			<div>{hasSnapshot ? 'Contractsnapshot opgeslagen' : 'Geen contractsnapshot'}</div>
		</div>
	</div>
	<div class="border p-3 text-xs">
		<div class="font-medium text-foreground">Praktische gegevens (los bewerkbaar)</div>
		<div class="mt-1 space-y-0.5 text-muted-foreground">
			<div title={deal.opsCompletedAt ?? ''}>
				Laatst opgeslagen: {deal.opsCompletedAt ? formatDateNL(deal.opsCompletedAt) : 'nog niet'}
			</div>
			{#if deal.opsAudit.length > 0}
				<div>{deal.opsAudit.length}x opgeslagen (laatste {OPS_AUDIT_LIMIT})</div>
				{#each deal.opsAudit.slice(-3).reverse() as entry (entry.savedAt)}
					<div class="truncate" title={entry.userAgent}>
						{formatDateNL(entry.savedAt)} · {entry.ip || 'onbekend IP'}
					</div>
				{/each}
			{:else}
				<div>Nog geen bewerkingen vastgelegd.</div>
			{/if}
		</div>
	</div>
</div>
<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
	<span>Aanbetaling: {paymentLabel(deal.depositStatus)}</span>
	<span>Eindbetaling: {paymentLabel(deal.finalPaymentStatus)}</span>
</div>
