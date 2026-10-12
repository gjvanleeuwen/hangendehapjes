<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { keepValues } from './shared';

	// One card per job on the aanvraag pages: title bar, fields, save button
	// bottom right. Wraps a ?/update form that only sends the fields inside it.
	let {
		id,
		title,
		hint = '',
		dealId,
		action = '?/update',
		saveLabel = 'Opslaan',
		children,
		footer
	}: {
		id?: string;
		title: string;
		hint?: string;
		dealId: string;
		action?: string;
		saveLabel?: string;
		children: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<form {id} method="POST" {action} class="scroll-mt-4 border bg-card" use:enhance={keepValues}>
	<input type="hidden" name="id" value={dealId} />
	<div class="flex items-baseline justify-between gap-3 border-b px-4 py-2.5">
		<h2 class="text-sm font-medium">{title}</h2>
		{#if hint}<p class="text-xs text-muted-foreground">{hint}</p>{/if}
	</div>
	<div class="space-y-4 p-4">
		{@render children()}
	</div>
	<div class="flex items-center justify-end gap-3 border-t px-4 py-2.5">
		{#if footer}<div class="me-auto text-xs text-muted-foreground">{@render footer()}</div>{/if}
		<Button type="submit" size="sm">{saveLabel}</Button>
	</div>
</form>
