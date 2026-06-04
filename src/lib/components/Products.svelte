<script lang="ts">
	import type { Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import SectionHeading from './SectionHeading.svelte';
	import Picture from './Picture.svelte';

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
						<Picture
							src={product.image}
							alt={product.imageAlt}
							sizes="(min-width: 768px) min(540px, 50vw), 100vw"
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
						<div>
							<p class="font-heading text-xl">{product.priceFrom}</p>
							<p class="mt-1 text-xs text-muted-foreground/70">{product.priceNote}</p>
						</div>
						<Separator class="my-6" />
						<ul class="space-y-2 text-sm leading-relaxed text-muted-foreground">
							{#each product.bullets as bullet, i (i)}
								<li class="flex gap-3">
									<span
										class="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60"
									></span>
									{#if typeof bullet === 'string'}
										<span>{bullet}</span>
									{:else}
										<details class="group flex-1">
											<summary
												class="flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden"
											>
												<span>{bullet.label}</span>
												<ChevronRight
													class="size-3 opacity-60 transition-transform group-open:rotate-90"
												/>
											</summary>
											<p class="mt-1.5 pl-0 text-xs text-muted-foreground/80">
												{bullet.options.join(' · ')}
											</p>
										</details>
									{/if}
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<p class="mt-8 text-center text-xs text-muted-foreground">{t.products.priceFooter}</p>
		<div class="mt-3 flex justify-center">
			<Button
				href="{t.nav.homeHref}#contact"
				size="lg"
				class="px-10 py-6 text-base"
				data-umami-event="home_offerte"
			>
				{t.products.priceCta}
			</Button>
		</div>
	</div>
</section>
