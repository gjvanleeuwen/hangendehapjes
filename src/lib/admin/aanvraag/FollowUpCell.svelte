<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateNL } from '$lib/admin/calc';
	import type { Deal } from '$lib/deals';
	import { followUpStep, keepValues } from './shared';

	// The chase on an open offerte: herinnering 1, herinnering 2, bellen.
	// One button logs the next step as done today. Posts ?/logFollowUp, so the
	// page using this must register that action.
	let { deal, today }: { deal: Deal; today: string } = $props();

	const step = $derived(followUpStep(deal));
	const due = $derived(step ? step.due <= today : false);
	const doneLabel = $derived(
		!step
			? ''
			: step.done === 0
				? 'Nog niet herinnerd'
				: step.done === 3
					? '2× herinnerd, gebeld'
					: `${Math.min(step.done, 2)}× herinnerd`
	);
</script>

{#if step}
	<div class="space-y-1 text-xs">
		<div class="text-muted-foreground">{doneLabel}</div>
		{#if step.key === 'afsluiten'}
			<div class="font-medium text-destructive">Afsluiten: zet op afgewezen</div>
		{:else}
			<div class={due ? 'font-medium text-amber-700' : 'text-muted-foreground'}>
				{step.label}
				{due ? 'nu' : `vanaf ${formatDateNL(step.due)}`}
			</div>
			<form method="POST" action="?/logFollowUp" use:enhance={keepValues}>
				<input type="hidden" name="id" value={deal.id} />
				<button
					type="submit"
					class="rounded border px-2 py-0.5 {due
						? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
						: 'hover:bg-muted'}"
				>
					{step.key === 'bellen' ? 'Gebeld' : 'Herinnerd'}
				</button>
			</form>
		{/if}
	</div>
{:else}
	<span class="text-xs text-muted-foreground">–</span>
{/if}
