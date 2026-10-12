<script lang="ts">
	import { enhance } from '$app/forms';
	import { KANS_LABELS, KANS_LEVELS, kansOf, type Deal, type Kans } from '$lib/deals';
	import { keepValues, submitOnChange } from './shared';

	// Gut feeling on whether this one books. Saves on change, like the status.
	let { deal }: { deal: Deal } = $props();

	const kans = $derived(kansOf(deal));

	const tone: Record<Kans, string> = {
		'': 'border-input text-muted-foreground',
		laag: 'border-border bg-muted text-muted-foreground',
		midden: 'border-amber-300 bg-amber-50 text-amber-800',
		hoog: 'border-emerald-300 bg-emerald-50 text-emerald-800'
	};
</script>

<form method="POST" action="?/update" use:enhance={keepValues}>
	<input type="hidden" name="id" value={deal.id} />
	<select
		name="kans"
		value={kans}
		onchange={submitOnChange}
		aria-label="Kans dat het doorgaat"
		class="h-7 rounded-full border px-2 text-xs {tone[kans]}"
	>
		{#each KANS_LEVELS as k (k)}
			<option value={k}>{KANS_LABELS[k]}</option>
		{/each}
	</select>
</form>
