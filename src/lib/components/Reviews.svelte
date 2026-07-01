<script lang="ts">
	import type { Locale, Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import StarIcon from '@lucide/svelte/icons/star';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations; locale: Locale };
	let { t, locale }: Props = $props();

	let reviews = $derived(t.reviews.items ?? []);
	let count = $derived(reviews.length);
	let average = $derived(count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0);
	let averageDisplay = $derived(
		average.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	);
	let rounded = $derived(Math.round(average));
	let noun = $derived(count === 1 ? t.reviews.reviewNoun.one : t.reviews.reviewNoun.other);
</script>

<section id="reviews" class="bg-muted/40">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<SectionHeading>{t.reviews.heading}</SectionHeading>

			{#if count > 0}
				<div class="flex items-center gap-3 sm:shrink-0">
					<span class="text-3xl font-semibold text-foreground tabular-nums">{averageDisplay}</span>
					<div class="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
						{#each { length: 5 } as _, i (i)}
							<StarIcon
								class="size-5 {i < rounded ? 'fill-current' : 'text-muted-foreground/30'}"
							/>
						{/each}
					</div>
					<span class="text-sm text-muted-foreground">{count} {noun}</span>
				</div>
			{/if}
		</div>

		{#if count > 0}
			<div class="mx-auto mt-8 grid max-w-3xl gap-4">
				{#each reviews as review (review.name)}
					<Card.Root class="text-left">
						<Card.Content class="flex flex-col gap-4 py-6">
							<div class="flex items-center gap-1 text-amber-500" aria-label="{review.rating} / 5">
								{#each { length: review.rating } as _, i (i)}
									<StarIcon class="size-4 fill-current" />
								{/each}
							</div>
							<div class="flex flex-col gap-3 text-muted-foreground">
								{#each review.quote as paragraph (paragraph)}
									<p>{paragraph}</p>
								{/each}
							</div>
							<div class="mt-2 flex items-center gap-3">
								{#if review.avatar}
									<img
										src={review.avatar}
										alt={review.name}
										width="40"
										height="40"
										loading="lazy"
										referrerpolicy="no-referrer"
										class="size-10 rounded-full object-cover"
									/>
								{/if}
								<div class="flex flex-col">
									<span class="text-sm font-medium text-foreground">{review.name}</span>
									<span class="text-xs text-muted-foreground">
										Google review ·
										<time datetime={review.date}>
											{new Date(review.date).toLocaleDateString(locale, {
												day: 'numeric',
												month: 'long',
												year: 'numeric'
											})}
										</time>
									</span>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<Card.Root class="mx-auto mt-8 max-w-3xl border-dashed">
				<Card.Content class="flex flex-col items-center gap-4 py-12 text-center">
					<QuoteIcon class="size-8 text-muted-foreground" />
					<p class="max-w-xl text-muted-foreground">{t.reviews.empty}</p>
				</Card.Content>
			</Card.Root>
		{/if}

		<div
			class="mx-auto mt-4 flex max-w-3xl flex-col items-center justify-between gap-3 rounded-lg border bg-background px-5 py-4 text-center sm:flex-row sm:gap-6 sm:text-left"
		>
			<p class="text-sm text-muted-foreground">{t.reviews.cta.text}</p>
			<Button href={t.reviews.cta.href} target="_blank" rel="noopener" size="sm">
				{t.reviews.cta.button}
			</Button>
		</div>
	</div>
</section>
