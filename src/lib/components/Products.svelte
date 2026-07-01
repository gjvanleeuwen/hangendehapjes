<script lang="ts">
	import { onMount } from 'svelte';
	import type { Translations } from '$lib/i18n/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import SectionHeading from './SectionHeading.svelte';
	import Picture from './Picture.svelte';
	import { trackInView } from '$lib/inView';

	type Props = { t: Translations };
	let { t }: Props = $props();

	onMount(() => {
		if (t.products.items.some((product) => product.video)) {
			void import('@mux/mux-player');
		}
	});
</script>

<section id="products" class="bg-muted/40" use:trackInView={{ event: 'home_products_view' }}>
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-12 max-w-2xl">
			<SectionHeading>{t.products.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.products.intro}</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each t.products.items as product (product.id)}
				<Card.Root class="overflow-hidden p-0">
					<div class="aspect-3/4 overflow-hidden bg-muted">
						{#if product.video}
							<mux-player
								playback-id={product.video.playbackId}
								stream-type="on-demand"
								title={product.video.title}
								autoplay="muted"
								muted
								loop
								nohotkeys
								style="display: block; width: 100%; height: 100%; --controls: none; --media-object-fit: cover;"
							></mux-player>
						{:else}
							<Picture
								src={product.image}
								alt={product.imageAlt}
								sizes="(min-width: 768px) min(540px, 50vw), 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						{/if}
					</div>
					<Card.Header class="px-6 pt-6">
						<p class="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
							{product.kicker}
						</p>
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
									<span class="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60"></span>
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
						{#if product.article}
							<a
								href={product.article.href}
								class="mt-5 inline-flex items-center gap-1 text-sm font-medium text-(--brand-magenta) hover:underline"
							>
								{product.article.label}
								<ChevronRight class="size-3.5" />
							</a>
						{/if}
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
