<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { isPending } from '$lib/deals';
	import FormCard from '$lib/admin/aanvraag/FormCard.svelte';
	import PipelineTab from '$lib/admin/aanvraag/PipelineTab.svelte';
	import ContactTab from '$lib/admin/aanvraag/ContactTab.svelte';
	import HoursTab from '$lib/admin/aanvraag/HoursTab.svelte';
	import KansSelect from '$lib/admin/aanvraag/KansSelect.svelte';
	import PaymentsCard from '$lib/admin/aanvraag/PaymentsCard.svelte';
	import NextActionCell from '$lib/admin/aanvraag/NextActionCell.svelte';
	import { nextAction } from '$lib/admin/aanvraag/next-action';
	import { attentionChips, chipClass, detailHref } from '$lib/admin/aanvraag/shared';

	// Overzicht: everything about the aanvraag on one page, one card per job.
	// Header and sub-page tabs come from +layout.svelte.
	let { data, form } = $props();

	const deal = $derived(data.deal);
	const action = $derived(nextAction(deal, data.today));
	const chips = $derived(
		attentionChips(deal, data.today, data.soon).filter((c) => c.key !== action?.key)
	);
</script>

<svelte:head>
	<title>{deal.name} · aanvraag</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if form?.error}
	<div class="mb-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
		{form.error}
	</div>
{/if}

{#key deal.id}
	<div class="grid items-start gap-5 lg:grid-cols-[1fr_16rem]">
		<div class="space-y-5">
			<FormCard id="notitie" title="Interne notitie" dealId={deal.id}>
				<Textarea
					name="notes"
					rows={3}
					value={deal.notes}
					maxlength={5000}
					placeholder="Wat moeten we onthouden over deze aanvraag?"
					aria-label="Interne notitie"
				/>
			</FormCard>
			<PipelineTab {deal} />
			<ContactTab {deal} />
			<HoursTab {deal} />
		</div>

		<aside class="space-y-3 lg:sticky lg:top-4">
			<section class="space-y-2 border bg-card p-3">
				<h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Volgende stap
				</h2>
				{#if action}
					<NextActionCell {deal} {action} />
					<p class="text-xs text-muted-foreground">{action.hint}</p>
				{:else}
					<p class="text-sm text-muted-foreground">Niks te doen.</p>
				{/if}
			</section>

			{#if isPending(deal) || deal.status === 'nieuw'}
				<!-- Follow-up is the "Volgende stap" above; its dates are in Datums & bedrag. -->
				<section class="flex items-center justify-between gap-2 border bg-card p-3">
					<h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Kans</h2>
					<KansSelect {deal} />
				</section>
			{/if}

			<PaymentsCard {deal} />

			{#if chips.length > 0}
				<section class="space-y-2 border bg-card p-3">
					<h2 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Let op</h2>
					<ul class="space-y-1">
						{#each chips as chip (chip.key)}
							<li>
								<a
									class="inline-block rounded border px-1.5 py-0.5 text-xs hover:underline {chipClass(
										chip.tone
									)}"
									href={detailHref(deal.id, chip.tab)}
								>
									{chip.label}
								</a>
								<span class="text-xs text-muted-foreground">{chip.title}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<form method="POST" action="?/delete" class="pt-2" use:enhance>
				<input type="hidden" name="id" value={deal.id} />
				<Button
					type="submit"
					variant="ghost"
					size="sm"
					class="text-destructive"
					onclick={(e) => {
						if (!confirm(`Aanvraag van ${deal.name} verwijderen?`)) e.preventDefault();
					}}
				>
					Aanvraag verwijderen
				</Button>
			</form>
		</aside>
	</div>
{/key}
