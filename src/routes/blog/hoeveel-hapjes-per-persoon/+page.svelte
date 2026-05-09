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

	const headline = 'Hoeveel hapjes moet je serveren per persoon voor een receptie of bruiloft?';
	const title = 'Hoeveel hapjes moet je serveren per persoon? | Hangende Hapjes';
	const description =
		'Voor een receptie of bruiloftsfeest kan je het best rekening houden met 5–7 hapjes per persoon. Echter, met de live-concepten van Hangende Hapjes is 1 á 2 porties per gast al voldoende.';
	const slug = '/blog/hoeveel-hapjes-per-persoon';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-hoeveel-hapjes-per-persoon.jpg';

	const articleJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': canonical + '#article',
		headline,
		description,
		datePublished: BUILD_DATE,
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
				'De vuistregel van 5–7 hapjes per persoon werkt ook voor verjaardagen, zakelijke borrels en jubilea, mits de borrel een paar uur duurt. Bij een korte zakelijke receptie van 1 á 2 uur kom je vaak weg met 3 á 4 hapjes per persoon. Vervangen de hapjes op een verjaardag het diner? Reken dan op 10–15 stuks per persoon. Onze 1 á 2 porties per gast passen overal: borrel, dessert of midnight snack.'
		},
		{
			id: 'guest-count-change',
			question: 'Wat als er meer of minder gasten komen dan ik nu verwacht?',
			answer:
				'Geef ons je beste schatting in de aanvraag. Tot ongeveer 1 week voor het feest kan je het aantal porties nog naar boven of beneden bijstellen. Op de dag zelf hebben we meestal wat speling om een paar porties extra te maken, maar reken vooraf op 5 á 10% buffer als je het zeker wilt weten.'
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
				<p class="text-(--brand-magenta) text-sm font-semibold uppercase tracking-wider">
					Catering plannen
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voor een receptie of borrel op een zakelijk evenement of bruiloft kan je het best rekening houden met 5–7 hapjes per persoon over een tijdsbestek van 3-4 uur.
					Hiermee heb je ongeveer elk halfuurtje een hapje of net wat meer in het midden van de borrel. De live-concepten van Hangende Hapjes staan gelijk aan ongeveer 2–3
					standaard hapjes per portie. Dat betekent dat je voor het hele evenement ongeveer 1 á 2 porties per persoon nodig hebt. 
				</p>
			</header>

			<section
				class="data-[state=open]:bg-(--brand-magenta)/12 mt-10 rounded-lg bg-(--brand-magenta)/8 p-6 md:p-8"
				aria-labelledby="snel-antwoord"
			>
				<h2
					id="snel-antwoord"
					class="font-heading text-xl tracking-tight md:text-2xl"
				>
					Snel antwoord
				</h2>
				<ul class="mt-4 space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg">
					<li>Standaardborrel of receptie (3–4 uur): <strong>5–7 hapjes p.p.</strong></li>
					<li>Hapjes vervangen de maaltijd: <strong>10–15 hapjes p.p.</strong></li>
					<li>
						Met de Hangende Hapjes:
						<strong>1 á 2 porties p.p.</strong>
					</li>
					<li>
						Wij serveren: <strong>50–70 porties per uur per bediende</strong>
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
					van 5 tot 7 hapjes per persoon voor een borrel of receptie van een paar uur.
					Heb je ook een diner bij je evenement of duurt je borrel korter dan 2 uur dan kan je met minder hapjes rekenen
					Vervangen de hapjes het diner? Dan hebben gasten ongeveer 10–15 grotere hapjes p.p. nodig op een avod.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">De porties van Hangende Hapjes</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij serveren meestal niet de hele maaltijd en lopen in plaats daarvan voor minimaal één uur tussen de gasten
					door, tijdens de borrel, het dessertmoment of als verrassende midnight snack, met een
					dienblad om de nek. Per gast bouwen we ter plekke een ruime portie van onse heerlijke tiramisu of burrata.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Onze porties staan gelijk aan ongeveer 2-3 standaard borrelhapjes en wegen rond de 150 gram per stuk.
					Terwijl wij de hapjes opmaken is er een praatje met de gast en heeft deze ook keuze over de toppings en andere
					details van het hapje.
					Gasten kunnen gerust een 2de portie halen als dit past binnen jullie evenement
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij verzorgen per bediende ongeveer 50–70 porties in het u ur. Voor groepen boven de 100 gasten
					raden we daarom aan om een extra bediende te vragen, zodat iedereen binnen het tijdsblok aan de beurt komt.
					Je kan de ToetjesVrouw (Tiramisu) en de BorrelBaas (Burrata) combineren op één evenement voor zowel voorgerecht als dessert. 
					Hiermee serveren wij evenveel als 300 traditionele borrelhapjes per uur wat perfect is voor grotere groepen.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Kosten Hangende Hapjes
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de volgende tabel kan zie je de verwachtte prijzen (excl BTW) voor de ToetjesVrouw (Tiramisu) en de BorrelBaas (Burrata) op de drie standaardgroottes; 1 portie = 1 gast.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Porties</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tijd &amp; bezetting</th>
								<th class="py-3 pr-4 font-heading font-semibold">De Toetjes Vrouw</th>
								<th class="py-3 font-heading font-semibold">De Borrel Baas</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">45</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3 pr-4">€395</td>
								<td class="py-3">€420</td>
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
								<td class="py-3 pr-4">€1.125</td>
								<td class="py-3">€1.225</td>
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
					Onze porties zijn niet groot genoeg om een volledig walking dinner te vervangen, maar
					ze passen wel mooi naast je diner of als dessert. Andere cateraars voor jullie evenement werken graag met ons samen
					doordat wij helpen met het verrijken van de ervaring en extra capaciteit en entertainment bieden.
					Denk dus gerust aan de mogelijkheid om Hangende Hapjes te combineren met een walking dinner of buffet.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hoe wij vaak ingezet worden:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Tijdens de borrel of receptie</strong>: De BorrelBaas tussen jouw gasten met
						heerlijke burrata, voordat het diner begint of de bitterballen in het vet gaan.
					</li>
					<li>
						<strong>Bij het dessert</strong>: De ToetjesVrouw als verrassingsmoment in plaats van
						een dessertbuffet. Iedereen strekt even de benen met verse tiramisu, opgebouwd waar je gast bij staat.
					</li>
					<li>
						<strong>Als midnight snack</strong>: laat op de avond hebbebn gasten het meeste track. Denk in plaats van een frietje
						aan een ruim portie burrata of tiramisu.
					</li>
					<li>
						<strong>Hartig én zoet</strong>: beide concepten op één feest, los van elkaar getimed. Dit is een perfecte optie voor grotere groepen.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Vaak verzorgt de locatie of avondcateraar een basis aan snacked en eten en wij verrijken het evenement met
					een live, persoonlijke component op het moment dat jij kiest.
				</p>
			</section>

			<BlogFaqSection items={faqList} />

			<section class="mt-14 rounded-lg border border-border p-6 md:p-8">
				<h2 class="font-heading text-xl tracking-tight md:text-2xl">
					Plan je feest? Vertel ons hoeveel gasten je verwacht.
				</h2>
				<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
					Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een
					voorstel op maat: hartig, zoet of beide.
				</p>
				<a
					href="/#contact"
					class="bg-(--brand-magenta) mt-6 inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-medium text-white transition-colors hover:opacity-90"
				>
					Vraag een voorstel aan
				</a>
			</section>
		</article>
	</main>
	<Footer t={nl} />
</div>
