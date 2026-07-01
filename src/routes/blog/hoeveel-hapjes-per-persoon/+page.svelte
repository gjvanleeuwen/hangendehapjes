<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { jsonLdScript } from '$lib/seo';
	import {
		BUILD_DATE,
		OG_IMAGE_HEIGHT,
		OG_IMAGE_WIDTH,
		SITE_NAME,
		SITE_URL
	} from '$lib/site-config';
	import { nl } from '$lib/i18n/nl';
	import { BLOG_FAQS_NL, buildFaqJsonLd, type BlogFaq } from '$lib/blog/faqs';
	import BlogFaqSection from '$lib/blog/BlogFaqSection.svelte';
	import BlogCta from '$lib/blog/BlogCta.svelte';

	const headline = 'Hoeveel hapjes moet je serveren per persoon voor een receptie of bruiloft?';
	const title = 'Hoeveel hapjes per persoon? Echte cijfers van een caterer | Hangende Hapjes';
	const description =
		'Voor een receptie of bruiloft reken je meestal op 5–7 hapjes per persoon. Met onze live-concepten is 1 à 2 porties per gast vaak genoeg, omdat één portie gelijk staat aan 2–3 borrelhapjes.';
	const slug = '/blog/hoeveel-hapjes-per-persoon';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-hoeveel-hapjes-per-persoon.jpg';
	const datePublished = '2026-04-28';

	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': canonical + '#article',
		headline,
		description,
		datePublished,
		dateModified: BUILD_DATE,
		inLanguage: 'nl-NL',
		mainEntityOfPage: canonical,
		image: {
			'@type': 'ImageObject',
			url: ogImage,
			width: OG_IMAGE_WIDTH,
			height: OG_IMAGE_HEIGHT
		},
		author: [{ '@id': SITE_URL + '/#charlotte' }, { '@id': SITE_URL + '/#gijs' }],
		publisher: { '@id': SITE_URL + '/#localbusiness' }
	};

	const faqList: BlogFaq[] = [
		BLOG_FAQS_NL.allergies,
		BLOG_FAQS_NL.leadtime,
		{
			id: 'occasion-mix',
			question: 'Hoeveel hapjes per persoon op een verjaardag of zakelijke borrel?',
			answer:
				'De vuistregel van 5–7 hapjes per persoon werkt ook voor verjaardagen, zakelijke borrels en jubilea, mits de borrel een paar uur duurt. Bij een korte zakelijke receptie van 1 à 2 uur kom je vaak weg met 3 à 4 hapjes per persoon. Vervangen de hapjes op een verjaardag het diner? Reken dan op 10–15 stuks per persoon. Onze 1 à 2 porties per gast passen overal: borrel, dessert of midnight snack.'
		},
		{
			id: 'guest-count-change',
			question: 'Wat als er meer of minder gasten komen dan ik nu verwacht?',
			answer:
				'Geef ons je beste schatting in de aanvraag. Tot ongeveer 1 week voor het feest kan je het aantal porties nog naar boven of beneden bijstellen. Op de dag zelf hebben we meestal wat speling om een paar porties extra te maken, maar reken vooraf op 5 à 10% buffer als je het zeker wilt weten.'
		}
	];

	const faqJsonLd = buildFaqJsonLd(faqList, { id: canonical + '#faq' });

	const articleJsonLdHtml = jsonLdScript(articleJsonLd);
	const faqJsonLdHtml = jsonLdScript(faqJsonLd);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<link rel="alternate" hreflang="nl" href={canonical} />
	<link rel="alternate" hreflang="x-default" href={canonical} />

	<meta name="robots" content="index, follow, max-image-preview:large" />

	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
	<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:locale" content="nl_NL" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	{@html articleJsonLdHtml}
	{@html faqJsonLdHtml}
</svelte:head>

<div id="top" class="bg-background text-foreground">
	<Nav t={nl} />
	<main>
		<article class="mx-auto max-w-3xl px-6 py-16 md:py-24">
			<header class="space-y-4">
				<p class="text-sm font-semibold tracking-wider text-(--brand-magenta) uppercase">
					Catering plannen
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voor een receptie of borrel op een zakelijk evenement of bruiloft kan je het best rekening
					houden met 5–7 hapjes per persoon over een tijdsbestek van 3-4 uur. Hiermee heb je
					ongeveer elk halfuurtje een hapje of net wat meer in het midden van de borrel. De
					live-concepten van Hangende Hapjes staan gelijk aan ongeveer 2–3 standaard hapjes per
					portie. Dat betekent dat je voor het hele evenement ongeveer 1 à 2 porties per persoon
					nodig hebt.
				</p>
			</header>

			<section
				class="mt-10 rounded-lg bg-(--brand-magenta)/8 p-6 data-[state=open]:bg-(--brand-magenta)/12 md:p-8"
				aria-labelledby="snel-antwoord"
			>
				<h2 id="snel-antwoord" class="font-heading text-xl tracking-tight md:text-2xl">
					Snel antwoord
				</h2>
				<ul class="mt-4 space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg">
					<li>Standaardborrel of receptie van 3–4 uur: <strong>5–7 hapjes p.p.</strong></li>
					<li>Hapjes vervangen de maaltijd: <strong>10–15 hapjes p.p.</strong></li>
					<li>
						Met de Hangende Hapjes:
						<strong>1 à 2 porties p.p.</strong>
					</li>
					<li>
						Wij serveren: <strong>50–60 porties per uur per bediende</strong>
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					De standaardregel: 5–7 hapjes per persoon
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					De meeste cateraars hanteren een
					<a
						href="https://vanreuselverhuur.nl/hoeveel-hapjes-per-persoon/"
						target="_blank"
						rel="noopener noreferrer"
						class="underline hover:text-foreground">vuistregel</a
					>
					van 5 tot 7 hapjes per persoon voor een borrel of receptie van een paar uur. Heb je ook een
					diner bij je evenement, of duurt je borrel korter dan twee uur, dan kun je met minder hapjes
					rekenen. Vervangen de hapjes het diner? Dan hebben gasten eerder 10–15 grotere hapjes per persoon
					nodig op een avond.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					De porties van Hangende Hapjes
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij serveren meestal niet de hele maaltijd en lopen in plaats daarvan voor minimaal één
					uur tussen de gasten door, tijdens de borrel, het dessertmoment of als verrassende
					midnight snack, met een dienblad om de nek. Per gast bouwen we ter plekke een ruime portie
					van onze tiramisu of burrata.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Onze porties staan gelijk aan ongeveer 2–3 standaard borrelhapjes. De burrata-bowl weegt
					rond de 125 gram; de tiramisu is iets lichter, maar wel een volwaardig dessertmoment.
					Omdat we elke portie live opmaken, krijgt je gast ook meteen een praatje en, bij de
					burrata, keuze in toppings en saus. Gasten kunnen gerust een tweede portie halen als dat
					past binnen jullie planning.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij verzorgen per bediende ongeveer 50–60 porties per uur. Voor groepen boven de 100
					gasten raden we daarom een extra bediende aan, zodat iedereen binnen het tijdsblok aan de
					beurt komt. Je kunt tiramisu en burrata ook combineren op één evenement: burrata bij de
					borrel of als voorgerecht, tiramisu als dessert of midnight snack.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Kosten Hangende Hapjes</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de volgende tabel zie je de verwachte prijzen (excl. BTW) voor de tiramisu en de
					burrata op de drie standaardgroottes; 1 portie = 1 gast.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Porties</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tijd &amp; bezetting</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tiramisu</th>
								<th class="py-3 font-heading font-semibold">Burrata</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">50</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3 pr-4">€425</td>
								<td class="py-3">€450</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">100</td>
								<td class="py-3 pr-4">1 uur, 2 bedienden (of 2 uur, 1)</td>
								<td class="py-3 pr-4">€650</td>
								<td class="py-3">€700</td>
							</tr>
							<tr>
								<td class="py-3 pr-4">200</td>
								<td class="py-3 pr-4">2 uur, 2 bedienden</td>
								<td class="py-3 pr-4">€1.150</td>
								<td class="py-3">€1.200</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50 km zit het bij de prijs in. Daarboven rekenen we €0,45
					per kilometer.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Combineren met walking dinner of buffet
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Onze porties zijn niet groot genoeg om een volledig walking dinner te vervangen, maar ze
					passen wel mooi naast je diner of als dessert. Andere cateraars voor jullie evenement
					werken graag met ons samen doordat wij helpen met het verrijken van de ervaring en extra
					capaciteit en entertainment bieden. Denk dus gerust aan de mogelijkheid om Hangende Hapjes
					te combineren met een walking dinner of buffet.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hoe wij vaak ingezet worden:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Tijdens de borrel of receptie</strong>: verse burrata tussen jouw gasten met
						heerlijke burrata, voordat het diner begint of de bitterballen in het vet gaan.
					</li>
					<li>
						<strong>Bij het dessert</strong>: verse tiramisu als verrassingsmoment in plaats van een
						dessertbuffet. Iedereen strekt even de benen met verse tiramisu, opgebouwd waar je gast
						bij staat.
					</li>
					<li>
						<strong>Als midnight snack</strong>: laat op de avond hebben gasten vaak weer trek. Denk
						in plaats van een frietje aan een ruime portie burrata of tiramisu.
					</li>
					<li>
						<strong>Hartig én zoet</strong>: beide concepten op één feest, los van elkaar getimed.
						Dit is een perfecte optie voor grotere groepen.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Vaak verzorgt de locatie of avondcateraar de basis, en verrijken wij het evenement met een
					live, persoonlijke component op het moment dat jij kiest.
				</p>
			</section>

			<BlogCta
				event="hapjes"
				heading="Plan je feest? Vertel ons hoeveel gasten je verwacht."
				body="Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een voorstel op maat: hartig, zoet of beide."
			/>

			<BlogFaqSection
				items={faqList}
				intro="De meestgestelde vragen over porties, hoeveelheden en timing."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
