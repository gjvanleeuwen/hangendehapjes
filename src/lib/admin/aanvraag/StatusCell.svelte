<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusChange from './StatusChange.svelte';
	import {
		DEAL_STATUSES,
		STATUS_LABELS,
		isValidReason,
		reasonOptions,
		type Deal,
		type DealStatus
	} from '$lib/deals';
	import { keepValues, selectClass, stateBadge, statusPillClass, submitOnChange } from './shared';

	// Status select + reden. Picking a new status saves nothing yet: it opens
	// StatusChange, which asks for the data that belongs to that status and
	// saves both together. Annuleren puts the select back.
	// 'pill': the compact list look, a coloured select per stage, no badge.
	// actionBase: page to post to (empty = current page).
	let {
		deal,
		showBadge = true,
		variant = 'full',
		actionBase = ''
	}: { deal: Deal; showBadge?: boolean; variant?: 'full' | 'pill'; actionBase?: string } = $props();

	const badge = $derived(stateBadge(deal));

	// What the select shows. Follows the saved status, except while a change is
	// waiting in the popup.
	let selected = $derived<string>(deal.status);
	let pending = $state<DealStatus | null>(null);

	const choose = (e: Event) => {
		const next = (e.currentTarget as HTMLSelectElement).value as DealStatus;
		if (next !== deal.status) pending = next;
	};

	const cancel = () => {
		pending = null;
		selected = deal.status;
	};

	// Client reasons for "afgewezen (klant)", ours for "afgewezen (wij)". Once a
	// reason is set it can be changed, not cleared.
	const hasReason = $derived(isValidReason(deal.status, deal.lostReason));
	const reasons = $derived(
		reasonOptions(deal.status).filter((r) => !(hasReason && r.value === ''))
	);
</script>

<div class="space-y-1">
	{#if showBadge && variant === 'full'}
		<span class="inline-flex px-2 py-0.5 text-xs font-medium {badge.className}">{badge.label}</span>
	{/if}
	<select
		class={variant === 'pill'
			? `h-7 w-full rounded-full border px-2.5 text-xs font-medium ${statusPillClass(deal)}`
			: selectClass}
		bind:value={selected}
		onchange={choose}
		aria-label="Status"
	>
		{#each DEAL_STATUSES as s (s)}
			<option value={s}>{STATUS_LABELS[s]}</option>
		{/each}
	</select>
	{#if reasons.length > 0}
		<form method="POST" action="{actionBase}?/update" use:enhance={keepValues}>
			<input type="hidden" name="id" value={deal.id} />
			<select
				name="lostReason"
				class="{variant === 'pill'
					? 'h-7 w-full rounded-full border border-input bg-background px-2.5 text-xs'
					: selectClass} {hasReason ? '' : 'border-amber-400 text-amber-800'}"
				value={hasReason ? deal.lostReason : ''}
				onchange={submitOnChange}
				aria-label="Reden"
			>
				{#each reasons as r (r.value)}
					<option value={r.value}>{r.value ? r.label : 'Reden?'}</option>
				{/each}
			</select>
		</form>
	{/if}
</div>

{#if pending}
	<StatusChange {deal} status={pending} {actionBase} onclose={cancel} />
{/if}
