<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="reviews" class="bg-muted/40">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<SectionHeading>{t.reviews.heading}</SectionHeading>
		<Card.Root class="mx-auto mt-8 max-w-3xl border-dashed">
			<Card.Content class="flex flex-col items-center gap-4 py-12 text-center">
				<QuoteIcon class="size-8 text-muted-foreground" />
				<p class="max-w-xl text-muted-foreground">{t.reviews.empty}</p>
			</Card.Content>
		</Card.Root>

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
