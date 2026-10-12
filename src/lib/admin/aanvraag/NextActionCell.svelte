<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Deal, DealStatus } from '$lib/deals';
	import StatusChange from './StatusChange.svelte';
	import type { NextAction } from './next-action';
	import { keepValues } from './shared';

	// One small button for the next step; the reason sits in the tooltip.
	// A button that changes the status (Geleverd, Betaald, Afsluiten…) saves
	// nothing by itself: it opens StatusChange, which asks for the data that
	// belongs to it. Other buttons (Herinnerd, Link verlengen) post directly.
	let { deal, action }: { deal: Deal; action: NextAction | null } = $props();

	let change = $state<{ status: DealStatus; preset: Record<string, string> } | null>(null);

	const statusOf = (fields: Record<string, string>) => fields.status as DealStatus | undefined;

	const openChange = (fields: Record<string, string>) => {
		const { id: _id, status, ...preset } = fields;
		change = { status: status as DealStatus, preset };
	};

	const cls = $derived.by(() => {
		const base =
			'inline-flex h-7 items-center whitespace-nowrap rounded-md border px-2.5 text-xs font-medium';
		if (!action?.due) return `${base} border-border bg-background hover:bg-muted`;
		if (action.tone === 'red') return `${base} border-destructive bg-destructive text-white`;
		if (action.tone === 'amber') return `${base} border-amber-500 bg-amber-500 text-white`;
		return `${base} border-primary bg-primary text-primary-foreground`;
	});
</script>

{#if action}
	{#if action.act.type === 'link'}
		<a class={cls} href={action.act.href} title={action.hint}>{action.label}</a>
	{:else if statusOf(action.act.fields)}
		{@const fields = action.act.fields}
		<button type="button" class={cls} title={action.hint} onclick={() => openChange(fields)}>
			{action.label}
		</button>
	{:else}
		<form method="POST" action={action.act.action} use:enhance={keepValues}>
			{#each Object.entries(action.act.fields) as [name, value] (name)}
				<input type="hidden" {name} {value} />
			{/each}
			<button type="submit" class={cls} title={action.hint}>{action.label}</button>
		</form>
	{/if}
{/if}

{#if change}
	<StatusChange
		{deal}
		status={change.status}
		preset={change.preset}
		onclose={() => (change = null)}
	/>
{/if}
