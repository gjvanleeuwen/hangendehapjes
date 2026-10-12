<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Deal } from '$lib/deals';
	import { dateInputValue, keepValues, portalLinkState } from './shared';

	// Klantlink in the list: its state, and the end date you can change in place.
	// Posts ?/update and ?/extendAcceptance.
	// actionBase: page to post to. Empty = the current page; the deal header sets it
	// to the deal page so the controls work from every sub-page.
	let {
		deal,
		today,
		actionBase = ''
	}: { deal: Deal; today: string; actionBase?: string } = $props();

	const linkState = $derived(portalLinkState(deal, today));

	const label: Record<string, { text: string; cls: string }> = {
		accepted: { text: 'Akkoord', cls: 'text-emerald-700' },
		active: { text: 'Actief', cls: 'text-foreground' },
		soon: { text: 'Verloopt bijna', cls: 'text-amber-700' },
		expired: { text: 'Verlopen', cls: 'text-destructive' },
		off: { text: 'Uit', cls: 'text-muted-foreground' }
	};

	const submitOnChange = (e: Event) => (e.currentTarget as HTMLInputElement).form?.requestSubmit();
</script>

{#if linkState === 'none'}
	<span class="text-xs text-muted-foreground">–</span>
{:else}
	<div class="space-y-1">
		<div class="text-xs font-medium {label[linkState].cls}">{label[linkState].text}</div>
		<form method="POST" action="{actionBase}?/update" use:enhance={keepValues}>
			<input type="hidden" name="id" value={deal.id} />
			<input
				type="date"
				name="acceptanceExpiresAt"
				value={dateInputValue(deal.acceptanceExpiresAt)}
				onchange={submitOnChange}
				aria-label="Klantlink geldig t/m"
				class="h-7 w-full rounded-md border border-input bg-background px-1.5 text-xs"
			/>
		</form>
		{#if linkState === 'expired' || linkState === 'soon'}
			<form method="POST" action="{actionBase}?/extendAcceptance" use:enhance={keepValues}>
				<input type="hidden" name="id" value={deal.id} />
				<input type="hidden" name="days" value="14" />
				<button type="submit" class="text-xs underline">+14 dagen</button>
			</form>
		{/if}
	</div>
{/if}
