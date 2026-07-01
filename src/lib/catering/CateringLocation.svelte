<script lang="ts">
	import { onMount } from 'svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import BlogFaqSection from '$lib/blog/BlogFaqSection.svelte';
	import { buildFaqJsonLd } from '$lib/blog/faqs';
	import { jsonLdScript } from '$lib/seo';
	import {
		OG_IMAGE_HEIGHT,
		OG_IMAGE_WIDTH,
		PRODUCT_MIN_PORTIONS,
		PRODUCT_PRICES_EUR_FROM,
		SITE_NAME,
		SITE_URL,
		WHATSAPP_URL
	} from '$lib/site-config';
	import { nl } from '$lib/i18n/nl';
	import { en } from '$lib/i18n/en';
	import type { Locale } from '$lib/i18n/types';
	import type { LocationContent } from './content';

	type Props = { content: LocationContent; locale: Locale };
	let { content, locale }: Props = $props();

	const t = $derived(locale === 'en' ? en : nl);
	const langTag = $derived(locale === 'en' ? 'en-US' : 'nl-NL');
	const ogLocale = $derived(locale === 'en' ? 'en_US' : 'nl_NL');

	const nlUrl = $derived(`${SITE_URL}/catering/${content.slug}`);
	const enUrl = $derived(`${SITE_URL}/en/catering/${content.slug}`);
	const canonical = $derived(locale === 'en' ? enUrl : nlUrl);
	const homeHref = $derived(locale === 'en' ? '/en' : '/');

	const waHref = $derived(`${WHATSAPP_URL}?text=${encodeURIComponent(content.cta.waText)}`);

	const areaServed = $derived(
		content.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name }))
	);

	const serviceJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': canonical + '#service',
		name: content.serviceName,
		description: content.description,
		serviceType: 'Catering',
		provider: { '@id': SITE_URL + '/#localbusiness' },
		areaServed,
		url: canonical,
		image: content.ogImage,
		inLanguage: langTag,
		offers: [
			{
				'@type': 'Offer',
				name: 'Live tiramisu catering',
				priceCurrency: 'EUR',
				price: PRODUCT_PRICES_EUR_FROM.toetjes,
				availability: 'https://schema.org/InStock',
				priceSpecification: {
					'@type': 'UnitPriceSpecification',
					price: PRODUCT_PRICES_EUR_FROM.toetjes,
					priceCurrency: 'EUR',
					referenceQuantity: {
						'@type': 'QuantitativeValue',
						value: PRODUCT_MIN_PORTIONS,
						unitText: 'portions'
					}
				}
			},
			{
				'@type': 'Offer',
				name: 'Live burrata bar catering',
				priceCurrency: 'EUR',
				price: PRODUCT_PRICES_EUR_FROM.borrel,
				availability: 'https://schema.org/InStock',
				priceSpecification: {
					'@type': 'UnitPriceSpecification',
					price: PRODUCT_PRICES_EUR_FROM.borrel,
					priceCurrency: 'EUR',
					referenceQuantity: {
						'@type': 'QuantitativeValue',
						value: PRODUCT_MIN_PORTIONS,
						unitText: 'portions'
					}
				}
			}
		]
	});

	const breadcrumbJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'@id': canonical + '#breadcrumb',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL + homeHref },
			{ '@type': 'ListItem', position: 2, name: content.h1, item: canonical }
		]
	});

	const faqJsonLd = $derived(
		buildFaqJsonLd(content.faq, { id: canonical + '#faq', locale: langTag })
	);

	const serviceJsonLdHtml = $derived(jsonLdScript(serviceJsonLd));
	const breadcrumbJsonLdHtml = $derived(jsonLdScript(breadcrumbJsonLd));
	const faqJsonLdHtml = $derived(jsonLdScript(faqJsonLd));

	const umamiKey = $derived(`catering_${content.slug}`);

	onMount(() => {
		if (t.products.items.some((product) => product.video)) {
			void import('@mux/mux-player');
		}
	});
</script>

<svelte:head>
	<title>{content.title}</title>
	<meta name="description" content={content.description} />
	<link rel="canonical" href={canonical} />

	<link rel="alternate" hreflang="nl" href={nlUrl} />
	<link rel="alternate" hreflang="en" href={enUrl} />
	<link rel="alternate" hreflang="x-default" href={nlUrl} />

	<meta name="robots" content="index, follow, max-image-preview:large" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={content.title} />
	<meta property="og:description" content={content.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={content.ogImage} />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:locale" content={ogLocale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={content.title} />
	<meta name="twitter:description" content={content.description} />
	<meta name="twitter:image" content={content.ogImage} />

	{@html serviceJsonLdHtml}
	{@html breadcrumbJsonLdHtml}
	{@html faqJsonLdHtml}
</svelte:head>

<div id="top" class="bg-background text-foreground">
	<Nav {t} />
	<main>
		<article class="mx-auto max-w-3xl px-6 py-16 md:py-24">
			<header class="space-y-4">
				<p class="text-sm font-semibold tracking-wider text-(--brand-magenta) uppercase">
					{content.kicker}
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{content.h1}
				</h1>
				{#each content.intro as paragraph (paragraph)}
					<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- first-party static copy -->
						{@html paragraph}
					</p>
				{/each}
			</header>

			<section class="mt-10 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					{content.productsLead.heading}
				</h2>
				{#each content.productsLead.body as paragraph (paragraph)}
					<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- first-party static copy -->
						{@html paragraph}
					</p>
				{/each}
				<div class="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
					{#each t.products.items as product, i (product.id)}
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
										sizes="(min-width: 640px) 360px, 100vw"
										loading={i === 0 ? 'eager' : 'lazy'}
										fetchpriority={i === 0 ? 'high' : 'auto'}
										class="size-full object-cover"
									/>
								{/if}
							</div>
							<Card.Header class="px-5 pt-5">
								<p class="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
									{product.kicker}
								</p>
								<Card.Title class="font-heading text-xl">{product.name}</Card.Title>
								<Card.Description class="text-base text-muted-foreground">
									{product.pitch}
								</Card.Description>
							</Card.Header>
							<Card.Content class="px-5 pb-5">
								<p class="font-heading text-lg">{product.priceFrom}</p>
								<p class="mt-1 text-xs text-muted-foreground/70">{product.priceNote}</p>
								{#if product.article}
									<a
										href={product.article.href}
										class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-(--brand-magenta) hover:underline"
									>
										{product.article.label}
										<ChevronRight class="size-3.5" />
									</a>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>

			{#each content.sections as section (section.heading)}
				<section class="mt-12 space-y-4">
					<h2 class="font-heading text-2xl tracking-tight md:text-3xl">{section.heading}</h2>
					{#each section.body as paragraph (paragraph)}
						<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- first-party static copy -->
							{@html paragraph}
						</p>
					{/each}
					{#if section.bullets}
						<ul
							class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
						>
							{#each section.bullets as bullet (bullet)}
								<li>{bullet}</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/each}

			<section class="mt-12 flex items-center gap-4">
				<Picture
					src="/images/owners.jpeg"
					alt={content.about.imageAlt}
					sizes="192px"
					class="h-16 w-32 shrink-0 rounded-full object-cover md:h-20 md:w-44"
					loading="lazy"
				/>
				{#each content.about.body as paragraph (paragraph)}
					<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- first-party static copy -->
						{@html paragraph}
					</p>
				{/each}
			</section>

			<section class="mt-10 rounded-lg border border-border p-6 md:p-8">
				<h2 class="font-heading text-xl tracking-tight md:text-2xl">{content.cta.heading}</h2>
				<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
					{content.cta.body}
				</p>
				<div class="mt-6 flex flex-wrap items-center gap-3">
					<a
						href="{homeHref}#contact"
						data-umami-event="{umamiKey}_offerte"
						class="inline-flex h-10 items-center justify-center rounded-md bg-(--brand-magenta) px-5 text-sm font-medium text-white transition-colors hover:opacity-90"
					>
						{content.cta.offerButton}
					</a>
					<a
						href={waHref}
						target="_blank"
						rel="noopener noreferrer"
						data-umami-event="{umamiKey}_whatsapp"
						class="inline-flex h-10 items-center gap-2 rounded-md border border-input px-5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-5 text-[#25D366]"
							aria-hidden="true"
						>
							<path
								d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.23-8.25 8.23a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24Zm-3.05 4.43c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.14 1.53 2.34 3.71 3.28.52.22.92.36 1.24.46.52.17.99.14 1.37.09.42-.06 1.28-.52 1.46-1.03.18-.51.18-.94.13-1.03-.05-.09-.2-.14-.41-.25-.21-.11-1.28-.63-1.48-.7-.2-.07-.34-.11-.49.11-.14.21-.56.7-.69.85-.13.14-.25.16-.46.05-.21-.11-.9-.33-1.71-1.06-.63-.56-1.06-1.26-1.18-1.47-.13-.21-.01-.33.09-.43.09-.09.21-.25.32-.37.11-.13.14-.21.21-.36.07-.14.04-.27-.02-.38-.05-.11-.49-1.18-.67-1.61-.18-.43-.36-.37-.49-.37l-.42-.01Z"
							/>
						</svg>
						{content.cta.waButton}
					</a>
				</div>
			</section>

			<BlogFaqSection items={content.faq} heading={content.faqHeading} intro={content.faqIntro} />
		</article>
	</main>
	<Footer {t} />
</div>
