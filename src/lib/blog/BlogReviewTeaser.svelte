<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import type { Translations } from '$lib/i18n/types';

	type Review = Translations['reviews']['items'][number];
	type Props = {
		reviews: Review[];
		href?: string;
		/**
		 * Label overrides. The blog is NL-only so the defaults are Dutch; the
		 * catering location pages pass the locale's strings from `t.reviews`.
		 */
		noun?: { one: string; other: string };
		sourceLabel?: string;
		readAllLabel?: string;
		numberLocale?: string;
		/** Outer spacing/sizing; defaults to the standalone top margin. */
		class?: string;
		/**
		 * How many reviews to quote. One gives a longer snippet; more gives short
		 * snippets (used on pages without a review of their own product).
		 */
		quotes?: number;
	};
	let {
		reviews,
		href = '/#reviews',
		noun = { one: 'review', other: 'reviews' },
		sourceLabel = 'op Google',
		readAllLabel = 'Lees al onze reviews',
		numberLocale = 'nl-NL',
		class: className = 'mt-12',
		quotes = 1
	}: Props = $props();

	let count = $derived(reviews.length);
	let average = $derived(count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0);
	let averageDisplay = $derived(
		average.toLocaleString(numberLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	);
	let rounded = $derived(Math.round(average));
	let nounDisplay = $derived(count === 1 ? noun.one : noun.other);

	function truncate(text: string, max: number) {
		if (text.length <= max) return text;
		const cut = text.slice(0, max);
		// Prefer ending on a full sentence; otherwise break on a word boundary.
		const sentenceEnd = Math.max(
			cut.lastIndexOf('. '),
			cut.lastIndexOf('! '),
			cut.lastIndexOf('? ')
		);
		if (sentenceEnd > max * 0.4) return cut.slice(0, sentenceEnd + 1);
		return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:!]+$/, '') + '…';
	}

	let snippets = $derived(
		reviews.slice(0, quotes).map((review) => ({
			name: review.name,
			text: truncate(review.quote.join(' '), quotes > 1 ? 140 : 160)
		}))
	);
</script>

{#if count > 0}
	<a
		{href}
		class="{className} block rounded-lg border bg-muted/40 p-6 transition-colors hover:bg-muted/70 md:p-8"
	>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
			<div class="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
				{#each { length: 5 } as _, i (i)}
					<StarIcon class="size-4 {i < rounded ? 'fill-current' : 'text-muted-foreground/30'}" />
				{/each}
			</div>
			<span class="text-sm font-semibold text-foreground">{averageDisplay}</span>
			<span class="text-sm text-muted-foreground">· {count} {nounDisplay} {sourceLabel}</span>
		</div>
		{#if snippets.length === 1}
			<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
				“{snippets[0].text}”
				<span class="text-sm text-muted-foreground/80">— {snippets[0].name}</span>
			</p>
		{:else}
			<ul class="mt-3 space-y-3">
				{#each snippets as snippet (snippet.name)}
					<li class="text-sm leading-relaxed text-muted-foreground">
						“{snippet.text}”
						<span class="mt-0.5 block text-xs font-medium text-foreground">{snippet.name}</span>
					</li>
				{/each}
			</ul>
		{/if}
		<span class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--brand-magenta)">
			{readAllLabel}
			<ArrowRight class="size-3.5" />
		</span>
	</a>
{/if}
