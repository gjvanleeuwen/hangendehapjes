<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MuxClips from '$lib/components/MuxClips.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { jsonLdScript, aggregateRatingJsonLd } from '$lib/seo';
	import BlogSummary from '$lib/blog/BlogSummary.svelte';
	import BlogOtherCakes from '$lib/blog/BlogOtherCakes.svelte';
	import {
		BUILD_DATE,
		OG_IMAGE_HEIGHT,
		OG_IMAGE_WIDTH,
		PRODUCT_MIN_PORTIONS,
		PRODUCT_PRICES_EUR_FROM,
		SITE_NAME,
		SITE_URL
	} from '$lib/site-config';
	import { nl } from '$lib/i18n/nl';
	import { BLOG_FAQS_NL, buildFaqJsonLd, type BlogFaq } from '$lib/blog/faqs';
	import BlogFaqSection from '$lib/blog/BlogFaqSection.svelte';
	import BlogCta from '$lib/blog/BlogCta.svelte';

	const headline = 'Tiramisu op je bruiloft: als hapje of taart, ter plekke opgebouwd';
	const title = 'Tiramisu op je bruiloft: vers hapje of hele taart | Hangende Hapjes';
	const description =
		'Tiramisu op je bruiloft? Wij maken het live als vers hapje per gast, of als hele tiramisutaart om samen aan te snijden. Met mascarpone, espresso uit de mokapot en lange vingers.';
	const slug = '/blog/tiramisu-bruiloft';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-tiramisu-bruiloft.jpg';
	const serviceId = SITE_URL + '/#service-toetjes';
	const datePublished = '2026-05-09';

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
		publisher: { '@id': SITE_URL + '/#localbusiness' },
		about: { '@id': serviceId },
		mentions: [{ '@id': serviceId }]
	};

	// Canonical commercial page for the tiramisu service. The full reviews live on the
	// homepage; here we only surface the aggregate score + count (matching the compact
	// teaser below) and link through, so the page stays light and policy-compliant.
	const toetjesReviews = nl.reviews.items.filter((review) => review.productId === 'toetjes');

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': ['Service', 'Product'],
		'@id': serviceId,
		name: 'Live tiramisu catering',
		description,
		image: ogImage,
		brand: { '@type': 'Brand', name: SITE_NAME },
		serviceType: 'Catering',
		provider: { '@id': SITE_URL + '/#localbusiness' },
		areaServed: [
			{ '@type': 'Country', name: 'Netherlands' },
			{ '@type': 'Country', name: 'Belgium' }
		],
		offers: {
			'@type': 'Offer',
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
		...aggregateRatingJsonLd(toetjesReviews)
	};

	const faqList: BlogFaq[] = [
		{
			id: 'tiramisu-toren',
			question: 'Kunnen jullie ook een tiramisu toren leveren voor op een bruiloft?',
			answer:
				'Nee, helaas leveren wij geen gebouwde tiramisu toren. Dat is een bewuste keuze: onze kracht zit in tiramisu vers op locatie opbouwen, als hangend hapje tussen de gasten of als tiramisutaart. Een toren met losse glaasjes moet je eigenlijk vooraf maken; als wij dat allemaal vers op locatie vullen, wordt het onnodig duur en omslachtig. Willen jullie de tiramisu toch in glas presenteren, dan denken we graag mee over coupes of glaswerk.'
		},
		{
			id: 'tiramisu-sjabloon',
			question: 'Kan er iets persoonlijks op de taart?',
			answer:
				'Op de tiramisutaart maken we aan de hand van een sjabloon een tekst in cacao. ‘Just Married’ hebben we standaard liggen en die zit bij de prijs in. Wil je jullie namen, de datum of iets anders eigens, dan laten we daar een sjabloon voor maken en rekenen we soms een klein bedrag door. Vraag het gerust in je aanvraag, dan zeggen we meteen of het meerkosten heeft.'
		},
		{
			id: 'tiramisu-zonder-alcohol',
			question: 'Kunnen jullie tiramisu zonder alcohol maken?',
			answer:
				'Ja. Standaard zit er een scheutje amaretto in, maar we hebben ook een alcoholvrije amaretto die we als vervanging gebruiken. Op een bruiloft met een gemengd publiek (kinderen, zwangere gasten, gasten die niet drinken) is dat geen enkel probleem. Geef het in je aanvraag door, dan houden we er meteen rekening mee.'
		},
		{
			id: 'tiramisu-allergies',
			question: 'Hebben jullie opties voor allergieën of dieetwensen?',
			answer:
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Daar rekenen we niets extra voor. Onze tiramisu bevat standaard gluten, lactose en ei. Als alternatief maken daarom een lactose-, gluten-, Alcohol- en cafeïnevrijrije tiramisu - ook deze is super lekker. Een vegan tiramisu kunnen we helaas niet maken, voor vegan gasten nemen we een ander taartje mee. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
		},
		{
			id: 'tiramisu-all-inclusive',
			question: 'Moeten wij of de locatie zelf nog iets regelen of terugbrengen?',
			answer:
				'Nee, dit is een full-service pakket. Wij bezorgen alles, bouwen de tiramisu of taart ter plekke vers op en blijven erbij tot het moment klopt zoals jullie het willen. Voor hangende hapjes is ook eetgerij inbegrepen, voor de taart kunnen wij borden, bestek, extra servetten of zelfs een tafel en decoratie meenemen als dit voor jullie makkelijker is dan overleggen met de locatie. Alles is geregeld, je hoeft dus ook geen schalen of bakken terug te brengen en vaak geen schotelgeld te betalen. Het is voor ons wat meer werk, maar dan heb je wel een compleet verzorgd dessert- of taartmoment.'
		},
		{
			id: 'tiramisu-proeven',
			question: 'Kunnen we de tiramisu eerst proeven?',
			answer:
				'Ja! We organiseren geen losse proeverijen per stel, maar we staan vier keer per jaar op de Open Trouwlocatieroute. Daar kun je gewoon langskomen en proeven. Stuur ons een berichtje, dan laten we weten wanneer en waar we de volgende keer staan.'
		},
		BLOG_FAQS_NL.leadtime,
		{
			id: 'tiramisu-taart',
			question: 'Maken jullie ook andere (italiaanse) bruidstaarten?',
			answer:
				'Ja! Charlotte heeft veel patisserie-ervaring en maakt naast de tiramisutaart nog twee bruidstaarten. Een Italiaanse millefoglie (of mille-feuille) met knapperig bladerdeeg, Zwitserse room en vers rood fruit, vanaf 25 personen. Die maken we op locatie af, en het laatste fruit mogen jullie zelf leggen. En een klassieke hoge bruidstaart op maat, ook vanaf 25 personen, met 8 smaken om per laag uit te kiezen, waaronder tiramisu. Hierboven bij "Liever een andere bruidstaart?" lees je meer over allebei.'
		}
	];

	const faqJsonLd = buildFaqJsonLd(faqList, { id: canonical + '#faq' });

	const articleJsonLdHtml = jsonLdScript(articleJsonLd);
	const faqJsonLdHtml = jsonLdScript(faqJsonLd);
	const productJsonLdHtml = jsonLdScript(productJsonLd);
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
	{@html productJsonLdHtml}
</svelte:head>

<div id="top" class="bg-background text-foreground">
	<Nav t={nl} />
	<main>
		<article class="mx-auto max-w-3xl px-6 py-16 md:py-24">
			<header class="space-y-4">
				<p class="text-sm font-semibold tracking-wider text-(--brand-magenta) uppercase">
					Tiramisu &amp; trouwen, een top combinatie
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Tiramisu op je bruiloft kan bij ons op twee manieren. Als <strong>hangend hapje</strong>:
					Charlotte of Gijs loopt met een dienblad tussen jouw gasten door en bouwt elke portie vers
					op - super leuk voor tijdens de borrel of het feest. Of als
					<strong>tiramisutaart</strong>: een grote open taart die we ter plekke opbouwen, en die
					jullie samen kunnen afmaken en aansnijden.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hieronder lees je per optie hoe het werkt en wat het kost. Welke past bij jullie dag?
				</p>
			</header>

			<BlogSummary reviews={toetjesReviews}>
				<li>
					<strong>Live hapje:</strong> vers per gast opgebouwd, vanaf €425 voor 50 gasten.
				</li>
				<li>
					<strong>Tiramisutaart:</strong> om samen aan te snijden, vanaf €375 voor 30 gasten.
				</li>
				<li>
					<strong>Dieetwensen:</strong> we maken hem ook alcoholvrij, lactosevrij of glutenvrij.
				</li>
				<li>
					<strong>Inbegrepen:</strong> bezorgen en opbouwen. In het Gooi, Amsterdam en Utrecht rekenen
					we geen reiskosten.
				</li>
			</BlogSummary>

			<section class="mt-12 flow-root space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu als hangend hapje op je bruiloft
				</h2>
				<MuxClips
					clips={[
						{
							playbackId: 'Q6dowlovJnKajd134vOoS60101q00RS3NYz2YgOCv4gQpE',
							title: 'Gijs bouwt live een portie tiramisu op vanaf zijn hangende dienblad'
						}
					]}
					gridClass="mx-auto mb-4 w-full max-w-60 sm:float-right sm:mt-1 sm:mb-2 sm:ml-6 sm:w-56"
					itemClass="w-full"
				/>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Charlotte of Gijs loopt rond met een dienblad om de nek en bouwt elke portie waar de gast
					bij staat Met een klein praatje en een glimlach brengen wij zo niet alleen een borrelhapje
					of dessert maar ook een stuk entertainment.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						Per gast kunnen wij aanpassingen maken zoals alcoholvrij of alleen een losse lange
						vinger voor de kinderen.
					</li>
					<li>
						Gasten hoeven niet in de rij te staan en kunnen op eigen tempo een Tiramisu krijgen
					</li>
					<li>
						Zelf hadden wij op onze bruiloft een ijsbar. Na een zittend diner was het echt fijn om
						gasten wat vrijheid te bieden, zo raakt iedereen weer even in gesprek.
					</li>
				</ul>
				<aside
					class="rounded-r-lg border-l-4 border-(--brand-magenta) bg-(--brand-magenta)/5 px-5 py-4"
				>
					<p class="text-xs font-semibold tracking-wider text-(--brand-magenta) uppercase">
						Tip van ons
					</p>
					<p class="mt-1 text-base leading-relaxed text-muted-foreground">
						Een tiramisu Hangend Hapje past goed tijden je receptie of als walking dinner dessert. Maar onze favoriet:
						ruil je midnight snack in voor tiramisu! Wij dansen graag tussen je gasten door en serveren een echte crowdpleaser.
					</p>
				</aside>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Als wij rondlopen kunnen we tot 50–60 porties per uur serveren, dit is voor de meeste aantallen onder 70-80 perfect. Hierboven raden we aan dat we met z'n tweeën komen zodat we de gasten snel genoeg kunnen bedienen.
					Wij nemen alles zelf mee maar mocht er op de locatie een plek zijn voor onze koelbox en om ons om te kleden dan zou dat perfect zijn.
					Bakjes, lepels en servetten nemen wij mee en ook het afval gaat met ons terug, zo zijn jullie en de locatie volledig ontzorgd.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisutaart als bruidstaart
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een taart om samen aan te snijden, geen probleem. Onze tiramisutaart is een grote, ronde open
					taart. Door onze speciale receptuur is die mooi stevig voor het bouwen zodat je niet hoeft te scheppen maar echt kan snijden
					Het smaakt nogsteeds net zo luchtig en romig als je gewend bent.
					We bouwen de taart op locatie, dit duurt zo een 30 minuten voor 50 personen. Als jullie het willen kunnen jullie gasten
					dus meekijken, uit ervaring weten wij dat mensen dit erg leuk vinden.
					Zo heb je wel het klassieke taart moment, maar dan toch net anders.
				</p>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<figure class="overflow-hidden rounded-xl bg-muted">
						<div class="aspect-3/4">
							<Picture
								src="/images/tiramisutaart_opbouw.jpg"
								alt="Charlotte en Gijs bouwen ter plekke een verse tiramisu taart op met lange vingers en koffie"
								sizes="(min-width: 768px) 376px, (min-width: 640px) 50vw, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
					</figure>
					<figure class="overflow-hidden rounded-xl bg-muted">
						<div class="aspect-3/4">
							<Picture
								src="/images/tiramisutaart_hapje.jpg"
								alt="Bruidegom geeft de bruid een hapje van de verse tiramisu taart"
								sizes="(min-width: 768px) 376px, (min-width: 640px) 50vw, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
					</figure>
				</div>

				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voor een stukje extra interactie kunnen jullie de laatste laag cacao zelf strooien, dit levert ook super mooie beelden op.
				    Ook kunnen we een sjabloon zoals 'Just Married' in de
					cacao plaatsen, beide is bij de prijs inbegrepen. Jullie namen of de trouwdatum kan ook, daar maken we dan een custom sjabloon voor.
				</p>

				<figure class="mt-6 overflow-hidden rounded-xl bg-muted">
					<div class="aspect-3/2">
						<Picture
							src="/images/tiramisutaart_cacao.jpg"
							alt="Bruidspaar bestrooit samen de tiramisu taart met een laatste laag cacao"
							sizes="(min-width: 768px) 768px, 100vw"
							loading="lazy"
							class="size-full object-cover"
						/>
					</div>
				</figure>

				<p class="text-sm leading-relaxed text-muted-foreground/80">
					De taart op deze foto's is voor zo'n 30 personen.
				</p>
			</section>

			<BlogOtherCakes ids={['italiaans', 'klassiek']} event="tiramisu">
				Charlotte heeft veel patisserie-ervaring en maakt ook een prachtige Italiaanse millefoglie (die hadden
				we zelf op onze bruiloft) en een klassieke hoge bruidstaart, in 8 verschillende smaken (incl tiramisu optie).
			</BlogOtherCakes>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Hoe wij de tiramisu maken</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het recept is klassiek Italiaans, voor het hapje en de taart. Tiramisu hoort als tiramisu
					te smaken, dus we houden het bij de basis en letten vooral op goede ingrediënten.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Echte mascarpone</strong>, geen slagroom. De crème wordt luchtig door er met
						suiker opgeklopte eieren door te spatelen. Die eieren zijn gepasteuriseerd, dus ook
						zwangere gasten en kinderen kunnen gewoon mee-eten.
					</li>
					<li>
						<strong>Sterke koffie uit de mokapot</strong>, van licht gebrande Ethiopische bonen van
						<a
							href="https://www.blommers.coffee/nl/"
							target="_blank"
							rel="noopener noreferrer"
							class="underline hover:text-foreground">Blommers Roasters</a
						>. Helder en bloemig, een mooi contrast met de zoete crème.
					</li>
					<li><strong>Lange vingers</strong>, gedoopt in die koffie.</li>
					<li>
						<strong>Amaretto</strong> voor het Italiaanse randje. Liever zonder alcohol? Dan gebruiken
						we alcoholvrije amaretto, met dezelfde smaak.
					</li>
					<li>
						<strong>Cacao</strong> tot het helemaal bedekt is, maakt het echt af.
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat tiramisu op je bruiloft kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Dit zijn pakketprijzen, excl. btw. Bezorgen, opbouwen op locatie, servetten en
					dieetwensen zijn altijd inbegrepen.
				</p>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="rounded-xl border border-border px-5 py-4">
						<h3 class="font-heading text-lg tracking-tight">Live tiramisu als hapje</h3>
						<table class="mt-2 w-full border-collapse text-sm">
							<thead class="sr-only">
								<tr>
									<th>Aantal gasten</th>
									<th>Prijs</th>
								</tr>
							</thead>
							<tbody class="text-muted-foreground">
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3">
										<span class="text-foreground">50 gasten</span>
										<span class="block text-xs">1 uur, 1 persoon</span>
									</td>
									<td class="py-2 text-right font-medium text-foreground">€425</td>
								</tr>
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3">
										<span class="text-foreground">100 gasten</span>
										<span class="block text-xs">1 uur met 2, of 2 uur met 1</span>
									</td>
									<td class="py-2 text-right font-medium text-foreground">€650</td>
								</tr>
								<tr>
									<td class="py-2 pr-3">
										<span class="text-foreground">200 gasten</span>
										<span class="block text-xs">2 uur, 2 personen</span>
									</td>
									<td class="py-2 text-right font-medium text-foreground">€1.150</td>
								</tr>
							</tbody>
						</table>
						<p class="mt-3 text-xs leading-relaxed text-muted-foreground">
							Bij de hangende hapjes verzorgen we het niet alleen het uitserveren maar ook ontzorgen we jullie en de locatie volledig.
						    Stevige, duurzame bakjes, lepels en servetten zijn inbegrepen, zo is het makkelijk eten ook voor kinderen en
							oudere gasten.
						</p>
					</div>

					<div class="rounded-xl border border-border px-5 py-4">
						<h3 class="font-heading text-lg tracking-tight">Tiramisutaart</h3>
						<table class="mt-2 w-full border-collapse text-sm">
							<thead class="sr-only">
								<tr>
									<th>Aantal gasten</th>
									<th>Prijs</th>
								</tr>
							</thead>
							<tbody class="text-muted-foreground">
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3 text-foreground">30 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€375</td>
								</tr>
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3 text-foreground">50 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€475</td>
								</tr>
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3 text-foreground">100 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€795</td>
								</tr>
								<tr>
									<td class="py-2 pr-3 text-foreground">200 gasten</td>
									<td class="py-2 text-right">Op aanvraag</td>
								</tr>
							</tbody>
						</table>
						<p class="mt-3 text-xs leading-relaxed text-muted-foreground">
							Bij de tiramisutaart is de complete opbouw, communicatie en andere elementen inbegrepen.
							Ook een gedecoreerde tafel kunnen wij meenemen. Wel wordt er vanuit gegaan dat er voor het aansnijden Borden, bestek, extra servetten
							en dergelijke van de locatie gebruikt kan worden. Mochten jullie dit graag anders zien laat dit dan vooral even weten en dan denken we graag mee.
						</p>
					</div>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten zijn inbegrepen tot ~30km rondom Hilversum (Het Gooi, Amersfoort, Amsterdam en Utrecht).
					Hierbuiten brengen wij reiskosten in rekening voor de extra kilometers.
				</p>
			</section>

			<BlogCta
				event="tiramisu"
				heading="Tiramisu op jouw bruiloft? Stuur ons je datum."
				body="Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een voorstel op maat: Tiramisu als hangend hapje of als taart, wat past bij jullie?"
				waText="Hoi! Ik heb een vraag over tiramisu van Hangende Hapjes 👋"
			/>

			<BlogFaqSection
				items={faqList}
				intro="Alles wat je je afvraagt over tiramisu op je bruiloft, als live hapje of als taart."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
