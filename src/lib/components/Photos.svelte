<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { INSTAGRAM_URL } from '$lib/site-config';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="photos" class="bg-background">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-10 max-w-2xl">
			<SectionHeading>{t.photos.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.photos.intro}</p>
		</div>

		<Card.Root class="mx-auto max-w-3xl overflow-hidden">
			<Card.Content class="flex flex-col items-center gap-6 px-6 py-16 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-12 text-foreground"
					aria-hidden="true"
				>
					<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
					<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
					<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
				</svg>
				<p class="font-heading text-2xl tracking-tight">{t.photos.handle}</p>
				<Button href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" size="lg">
					{t.photos.cta}
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</section>
