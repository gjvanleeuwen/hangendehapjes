<script lang="ts">
	import { onMount } from 'svelte';
	import type { Translations } from '$lib/i18n/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import SectionHeading from './SectionHeading.svelte';
	import Picture from './Picture.svelte';
	import { trackInView } from '$lib/inView';

	type Props = { t: Translations };
	let { t }: Props = $props();

	/** What every card on the homepage shows: the same fields for hapjes and cakes. */
	type CardData = {
		kicker: string;
		name: string;
		pitch: string;
		priceFrom: string;
		priceNote: string;
		href?: string;
		image: string;
		imageAlt: string;
		position?: string;
		video?: { playbackId: string; title: string };
	};

	const hapjes: CardData[] = $derived(
		t.products.items.map((p) => ({ ...p, href: p.article?.href }))
	);

	onMount(() => {
		if (t.products.items.some((product) => product.video)) {
			void import('@mux/mux-player');
		}
	});
</script>

{#snippet productCard(card: CardData)}
	<svelte:element
		this={card.href ? 'a' : 'div'}
		href={card.href}
		class="group flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:ring-(--brand-amaranth)/40"
	>
		<div class="relative aspect-4/3 overflow-hidden bg-muted">
			{#if card.video}
				<mux-player
					playback-id={card.video.playbackId}
					stream-type="on-demand"
					title={card.video.title}
					autoplay="muted"
					muted
					loop
					nohotkeys
					style="position: absolute; inset: 0; width: 100%; height: 100%; --controls: none; --media-object-fit: cover;"
				></mux-player>
			{:else}
				<Picture
					src={card.image}
					alt={card.imageAlt}
					sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
					loading="lazy"
					class="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105 {card.position ??
						''}"
				/>
			{/if}
		</div>
		<div class="flex flex-1 flex-col p-5">
			<p class="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
				{card.kicker}
			</p>
			<h4 class="mt-2 font-heading text-2xl leading-tight">{card.name}</h4>
			<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{card.pitch}</p>
			<div class="mt-auto pt-5">
				<p class="font-heading text-xl">{card.priceFrom}</p>
				<p class="mt-1 text-xs text-muted-foreground/70">{card.priceNote}</p>
			</div>
		</div>
	</svelte:element>
{/snippet}

<section id="products" class="bg-muted/40" use:trackInView={{ event: 'home_products_view' }}>
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-28">
		<div class="mb-10 max-w-2xl">
			<SectionHeading>{t.products.heading}</SectionHeading>
			<p class="mt-3 text-muted-foreground">{t.products.intro}</p>
		</div>

		<h3 class="mb-4 font-heading text-2xl tracking-tight">{t.products.hapjesHeading}</h3>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each hapjes as card (card.name)}
				{@render productCard(card)}
			{/each}
		</div>

		{#if t.products.cakes}
			<div id="bruidstaarten" class="mt-12 scroll-mt-20">
				<h3 class="mb-4 font-heading text-2xl tracking-tight">{t.products.cakes.heading}</h3>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each t.products.cakes.items as card (card.id)}
						{@render productCard(card)}
					{/each}
				</div>
			</div>
		{/if}

		<p class="mt-10 text-center text-xs text-muted-foreground">{t.products.priceFooter}</p>
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
