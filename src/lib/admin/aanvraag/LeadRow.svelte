<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateNL } from '$lib/admin/calc';
	import type { ContactLead } from '$lib/server/leads';
	import { serviceLabel } from './shared';

	// A half-finished contact form in the aanvragen list: the earliest stage of
	// an aanvraag. Step 1 done, step 2 never sent. Either make it a real
	// aanvraag (?/convertLead) or click it away (?/dismissLead).
	let { lead, variant }: { lead: ContactLead; variant: 'row' | 'card' } = $props();

	const what = $derived(
		[lead.serviceType ? serviceLabel(lead) : '', lead.choice].filter(Boolean).join(' · ')
	);
</script>

{#snippet actions()}
	<div class="flex flex-wrap items-center gap-2">
		<form method="POST" action="?/convertLead" use:enhance>
			<input type="hidden" name="id" value={lead.id} />
			<button
				type="submit"
				class="inline-flex h-7 items-center rounded-md border border-sky-600 bg-sky-600 px-2.5 text-xs font-medium text-white"
			>
				Maak aanvraag
			</button>
		</form>
		<form method="POST" action="?/dismissLead" use:enhance>
			<input type="hidden" name="id" value={lead.id} />
			<button type="submit" class="text-xs text-muted-foreground underline">Weg</button>
		</form>
	</div>
{/snippet}

{#if variant === 'row'}
	<tr class="border-t bg-sky-50/50 align-top">
		<td class="px-2 py-2">
			<div class="truncate font-medium">{lead.name || lead.email}</div>
			<div class="truncate text-xs text-muted-foreground">{what || lead.email}</div>
		</td>
		<td class="px-2 py-2 text-xs text-muted-foreground">–</td>
		<td class="px-2 py-2 text-right text-muted-foreground">–</td>
		<td class="px-2 py-2">
			<span
				class="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800"
			>
				Half ingevuld
			</span>
		</td>
		<td class="px-2 py-2 text-xs text-muted-foreground">–</td>
		<td class="px-2 py-2 text-xs text-muted-foreground">stap 1 op {formatDateNL(lead.updatedAt)}</td
		>
		<td class="px-2 py-2">{@render actions()}</td>
	</tr>
{:else}
	<div class="space-y-2 border bg-sky-50/50 p-3">
		<div>
			<div class="font-medium">{lead.name || lead.email}</div>
			<div class="text-xs text-muted-foreground">
				{what || lead.email} · half ingevuld op {formatDateNL(lead.updatedAt)}
			</div>
		</div>
		{@render actions()}
	</div>
{/if}
