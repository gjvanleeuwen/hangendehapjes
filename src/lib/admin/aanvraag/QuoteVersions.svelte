<script lang="ts">
	import { enhance } from '$app/forms';
	import { activeQuoteOf, type Deal } from '$lib/deals';

	// The stored offerte revisions with their portal visibility. Each row posts
	// its own action, so this lives outside the big ?/update form (nesting
	// forms is invalid HTML).
	let { deal }: { deal: Deal } = $props();

	// Mirrors the server's resolution (activeQuoteId, else the `active` flag),
	// so the badge can't disagree with what the portal actually serves.
	const activeId = $derived(activeQuoteOf(deal)?.id ?? '');
</script>

{#if deal.quoteVersions.length === 0}
	<p class="text-sm text-muted-foreground">
		Nog geen offerteversie. Maak er een via "Offerte maken" bovenaan.
	</p>
{:else}
	<p class="text-xs text-muted-foreground">
		Verborgen versies verdwijnen uit het klantportaal, ook voor iemand die de directe link nog
		heeft. De actieve offerte tonen we altijd.
	</p>
	<ul class="space-y-2">
		{#each deal.quoteVersions as q (q.id)}
			{@const isActive = q.id === activeId}
			<li class="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
				<span class="font-medium">{q.version}</span>
				<span class="text-muted-foreground">{q.label}</span>
				{#if isActive}
					<span class="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-xs">
						Actief
					</span>
				{:else if q.hiddenForClient}
					<span class="rounded border px-1.5 py-0.5 text-xs text-muted-foreground">Verborgen</span>
				{:else}
					<span class="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs">
						Zichtbaar
					</span>
				{/if}
				<div class="ms-auto flex flex-wrap items-center gap-3">
					{#if deal.acceptanceToken}
						<a
							class="text-xs underline"
							href="/klantportaal/{deal.acceptanceToken}/offerte/{q.id}"
							target="_blank"
							rel="noreferrer"
						>
							Bekijken
						</a>
					{/if}
					{#if !isActive}
						<form method="POST" action="?/setQuoteVisibility" use:enhance>
							<input type="hidden" name="id" value={deal.id} />
							<input type="hidden" name="quoteId" value={q.id} />
							<input type="hidden" name="hidden" value={q.hiddenForClient ? 'false' : 'true'} />
							<button type="submit" class="text-xs underline">
								{q.hiddenForClient ? 'Tonen' : 'Verbergen'}
							</button>
						</form>
					{/if}
					<form method="POST" action="?/deleteQuote" use:enhance>
						<input type="hidden" name="id" value={deal.id} />
						<input type="hidden" name="quoteId" value={q.id} />
						<button
							type="submit"
							class="text-xs text-destructive underline"
							onclick={(e) => {
								if (!confirm(`Offerte ${q.version} (${q.label}) definitief verwijderen?`))
									e.preventDefault();
							}}
						>
							Verwijder
						</button>
					</form>
				</div>
			</li>
		{/each}
	</ul>
{/if}
