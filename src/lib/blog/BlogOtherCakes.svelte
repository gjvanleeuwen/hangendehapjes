<script lang="ts">
	import type { Snippet } from 'svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { nl } from '$lib/i18n/nl';

	type Props = {
		/** Cake ids from `nl.products.cakes.items` to show as cards. */
		ids: string[];
		/** Umami event prefix, e.g. `tiramisu` → `blog_tiramisu_andere_taart_<id>`. */
		event: string;
		heading?: string;
		/** Short intro line above the cards. */
		children?: Snippet;
	};
	let { ids, event, heading = 'Liever een andere bruidstaart?', children }: Props = $props();

	// Same cake entries as the homepage product cards, so name/price/image stay in sync.
	const cakes = $derived((nl.products.cakes?.items ?? []).filter((cake) => ids.includes(cake.id)));
</script>

<section class="mt-12 space-y-3 rounded-xl border border-border px-6 py-5">
	<h2 class="font-heading text-xl tracking-tight">{heading}</h2>
	{#if children}
		<p class="text-base leading-relaxed text-muted-foreground">
			{@render children()}
		</p>
	{/if}
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each cakes as cake (cake.id)}
			<a
				href={cake.href}
				data-umami-event="blog_{event}_andere_taart_{cake.id}"
				class="flex items-center overflow-hidden rounded-lg border border-input bg-card text-left transition-colors hover:border-primary/50"
			>
				<div class="relative aspect-square w-16 shrink-0 overflow-hidden bg-muted">
					<Picture
						src={cake.image}
						alt=""
						sizes="64px"
						loading="lazy"
						class="absolute inset-0 size-full object-cover {cake.position ?? ''}"
					/>
				</div>
				<div class="min-w-0 px-3 py-2">
					<p class="text-sm leading-snug font-medium text-foreground">{cake.name}</p>
					<p class="text-xs leading-snug text-muted-foreground">
						{cake.priceFrom}
						{cake.priceNote}
					</p>
				</div>
			</a>
		{/each}
	</div>
</section>
