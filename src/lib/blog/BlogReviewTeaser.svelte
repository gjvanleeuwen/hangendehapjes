<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { Translations } from '$lib/i18n/types';

	type Review = Translations['reviews']['items'][number];
	type Props = { reviews: Review[]; href?: string };
	let { reviews, href = '/#reviews' }: Props = $props();

	let count = $derived(reviews.length);
	let average = $derived(count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0);
	let averageDisplay = $derived(
		average.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	);
	let rounded = $derived(Math.round(average));
	let noun = $derived(count === 1 ? 'review' : 'reviews');
	let featured = $derived(reviews[0]);
	let snippet = $derived.by(() => {
		if (!featured) return '';
		const text = featured.quote.join(' ');
		return text.length > 160 ? text.slice(0, 160).trimEnd() + '…' : text;
	});
</script>

{#if count > 0}
	<a
		{href}
		class="mt-12 block rounded-lg border bg-muted/40 p-6 transition-colors hover:bg-muted/70 md:p-8"
	>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
			<div class="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
				{#each { length: 5 } as _, i (i)}
					<StarIcon class="size-4 {i < rounded ? 'fill-current' : 'text-muted-foreground/30'}" />
				{/each}
			</div>
			<span class="text-sm font-semibold text-foreground">{averageDisplay}</span>
			<span class="text-sm text-muted-foreground">· {count} {noun} op Google</span>
		</div>
		{#if featured}
			<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
				“{snippet}” <span class="text-sm text-muted-foreground/80">— {featured.name}</span>
			</p>
			<span class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--brand-magenta)">
				Lees al onze reviews
				<ArrowRight class="size-3.5" />
			</span>
		{/if}
	</a>
{/if}
