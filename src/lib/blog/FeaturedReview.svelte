<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import type { Translations } from '$lib/i18n/types';

	type Review = Translations['reviews']['items'][number];
	type Props = {
		review: Review;
		/** BCP 47 tag for the date, e.g. `nl-NL`. */
		locale: string;
		/** "Google review" style source label shown before the date. */
		sourceLabel: string;
	};
	let { review, locale, sourceLabel }: Props = $props();

	const dateLabel = $derived(
		new Date(review.date).toLocaleDateString(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

<figure class="mt-12 rounded-lg border bg-muted/40 p-6 md:p-8">
	<div class="flex items-center gap-4">
		{#if review.avatar}
			<img
				src={review.avatar}
				alt="Logo {review.name}"
				width="64"
				height="64"
				loading="lazy"
				referrerpolicy="no-referrer"
				class="size-14 shrink-0 rounded-full object-cover md:size-16"
			/>
		{/if}
		<div class="flex flex-col gap-1">
			<span class="font-heading text-lg text-foreground">{review.name}</span>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-0.5 text-amber-500" aria-label="{review.rating} / 5">
					{#each { length: review.rating } as _, i (i)}
						<StarIcon class="size-4 fill-current" />
					{/each}
				</div>
				<span class="text-xs text-muted-foreground">
					{sourceLabel} · <time datetime={review.date}>{dateLabel}</time>
				</span>
			</div>
		</div>
	</div>
	<QuoteIcon class="mt-5 size-6 text-(--brand-magenta)/40" aria-hidden="true" />
	<blockquote class="mt-2 space-y-3 text-base leading-relaxed text-muted-foreground md:text-lg">
		{#each review.quote as paragraph (paragraph)}
			<p>{paragraph}</p>
		{/each}
	</blockquote>
</figure>
