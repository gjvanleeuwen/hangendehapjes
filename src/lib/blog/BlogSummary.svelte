<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Translations } from '$lib/i18n/types';
	import BlogReviewTeaser from './BlogReviewTeaser.svelte';

	type Review = Translations['reviews']['items'][number];
	type Props = {
		reviews: Review[];
		heading?: string;
		/** How many reviews the teaser quotes; see BlogReviewTeaser. */
		quotes?: number;
		/** The summary bullets, as `<li>` elements. */
		children: Snippet;
	};
	let { reviews, heading = 'Snelle samenvatting', quotes = 1, children }: Props = $props();
</script>

<!-- Summary next to the review teaser, placed right below the intro of a blog post. -->
<section class="mt-10 grid gap-4 sm:grid-cols-2" aria-labelledby="snel-antwoord">
	<div class="rounded-lg border border-(--brand-magenta)/15 bg-(--brand-magenta)/5 p-5">
		<h2
			id="snel-antwoord"
			class="text-xs font-semibold tracking-wider text-(--brand-magenta) uppercase"
		>
			{heading}
		</h2>
		<ul
			class="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-(--brand-magenta) [&_strong]:text-foreground"
		>
			{@render children()}
		</ul>
	</div>
	<BlogReviewTeaser {reviews} {quotes} class="h-full" />
</section>
