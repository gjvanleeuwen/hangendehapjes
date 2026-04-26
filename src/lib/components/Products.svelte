<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SectionHeading from './SectionHeading.svelte';

	type Props = { t: Translations };
	let { t }: Props = $props();
</script>

<section id="products" class="bg-muted/40">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-12 max-w-2xl">
			<SectionHeading>{t.products.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.products.intro}</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each t.products.items as product (product.id)}
				<Card.Root class="overflow-hidden p-0">
					<div class="aspect-9/16 overflow-hidden bg-muted md:aspect-4/5">
						<img
							src={product.image}
							alt={product.imageAlt}
							loading="lazy"
							class="size-full object-cover"
						/>
					</div>
					<Card.Header class="px-6 pt-6">
						<Card.Title class="font-heading text-2xl">{product.name}</Card.Title>
						<Card.Description class="text-base text-muted-foreground">
							{product.pitch}
						</Card.Description>
					</Card.Header>
					<Card.Content class="px-6 pb-6">
						<div class="flex items-baseline gap-3">
							<p class="font-heading text-xl">{product.priceFrom}</p>
							<p class="text-sm text-muted-foreground">{product.priceNote}</p>
						</div>
						<Separator class="my-6" />
						<ul class="space-y-2 text-sm leading-relaxed text-muted-foreground">
							{#each product.bullets as bullet (bullet)}
								<li class="flex gap-3">
									<span
										class="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60"
									></span>
									<span>{bullet}</span>
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</section>
