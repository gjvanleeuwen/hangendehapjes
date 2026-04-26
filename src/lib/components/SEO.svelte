<script lang="ts">
	import { page } from '$app/state';
	import type { Locale, Translations } from '$lib/i18n/types';
	import {
		CONTACT_EMAIL,
		FACEBOOK_URL,
		INSTAGRAM_URL,
		OG_IMAGE_HEIGHT,
		OG_IMAGE_PATH,
		OG_IMAGE_WIDTH,
		PRODUCT_MIN_PORTIONS,
		PRODUCT_PRICES_EUR_FROM,
		ROUTES,
		SITE_NAME,
		SITE_URL,
		TIKTOK_URL
	} from '$lib/site-config';
	import { jsonLdScript } from '$lib/seo';

	type Props = { t: Translations; locale: Locale };
	let { t, locale }: Props = $props();

	const canonical = $derived(SITE_URL + page.url.pathname);
	const ogImage = SITE_URL + OG_IMAGE_PATH;
	const altUrlNl = SITE_URL + ROUTES.nl;
	const altUrlEn = SITE_URL + ROUTES.en;
	const ogLocale = $derived(locale === 'nl' ? 'nl_NL' : 'en_US');
	const ogLocaleAlt = $derived(locale === 'nl' ? 'en_US' : 'nl_NL');

	const businessId = SITE_URL + '/#localbusiness';

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'LocalBusiness',
				'@id': businessId,
				name: SITE_NAME,
				description: t.meta.description,
				url: canonical,
				image: ogImage,
				email: CONTACT_EMAIL,
				address: {
					'@type': 'PostalAddress',
					addressLocality: 'Hilversum',
					addressCountry: 'NL'
				},
				areaServed: { '@type': 'Country', name: 'Netherlands' },
				sameAs: [INSTAGRAM_URL, FACEBOOK_URL, TIKTOK_URL],
				priceRange: '€€',
				inLanguage: locale === 'nl' ? 'nl-NL' : 'en-US'
			},
			...t.products.items.map((product) => ({
				'@type': 'Service',
				'@id': `${SITE_URL}/#service-${product.id}`,
				name: product.name,
				description: product.pitch,
				serviceType: 'Catering',
				provider: { '@id': businessId },
				areaServed: { '@type': 'Country', name: 'Netherlands' },
				image: SITE_URL + product.image,
				offers: {
					'@type': 'Offer',
					priceCurrency: 'EUR',
					price: PRODUCT_PRICES_EUR_FROM[product.id],
					availability: 'https://schema.org/InStock',
					priceSpecification: {
						'@type': 'UnitPriceSpecification',
						price: PRODUCT_PRICES_EUR_FROM[product.id],
						priceCurrency: 'EUR',
						referenceQuantity: {
							'@type': 'QuantitativeValue',
							value: PRODUCT_MIN_PORTIONS,
							unitText: 'portions'
						}
					}
				}
			})),
			{
				'@type': 'FAQPage',
				'@id': `${SITE_URL}/#faq-${locale}`,
				inLanguage: locale === 'nl' ? 'nl-NL' : 'en-US',
				mainEntity: t.faq.items.map((item) => ({
					'@type': 'Question',
					name: item.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: item.answer
					}
				}))
			}
		]
	});

	const jsonLdHtml = $derived(jsonLdScript(jsonLd));
</script>

<svelte:head>
	<title>{t.meta.title}</title>
	<meta name="description" content={t.meta.description} />
	<link rel="canonical" href={canonical} />

	<link rel="alternate" hreflang="nl" href={altUrlNl} />
	<link rel="alternate" hreflang="en" href={altUrlEn} />
	<link rel="alternate" hreflang="x-default" href={altUrlNl} />

	<meta name="robots" content="index, follow, max-image-preview:large" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={t.meta.title} />
	<meta property="og:description" content={t.meta.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:alt" content={t.hero.imageAlt} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:locale:alternate" content={ogLocaleAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={t.meta.title} />
	<meta name="twitter:description" content={t.meta.description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={t.hero.imageAlt} />

	{@html jsonLdHtml}
</svelte:head>
