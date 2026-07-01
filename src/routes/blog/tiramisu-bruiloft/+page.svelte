<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MuxClips from '$lib/components/MuxClips.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { jsonLdScript, aggregateRatingJsonLd } from '$lib/seo';
	import BlogReviewTeaser from '$lib/blog/BlogReviewTeaser.svelte';
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

	// Canonical commercial page for the tiramisu service. No tiramisu review exists yet,
	// so aggregateRatingJsonLd([]) yields no rating markup — the aggregate + compact
	// teaser below appear automatically once a review tagged productId 'toetjes' is added.
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
			id: 'tiramisu-taart',
			question: 'Maken jullie ook een tiramisu taart of Italiaanse bruidstaart?',
			answer:
				'Ja, en hierboven lees je er alles over. Charlotte heeft veel patisserie-ervaring en bakte al talloze bruidstaarten. Je kan kiezen voor een platte tiramisutaart in showformaat vanaf ongeveer 30 personen, een Italiaanse mille-feuille vanaf 25 personen, of een klassieke hoge bruidstaart met tiramisu-smaak. We bouwen de tiramisutaart live op locatie, je mag hem zelf afmaken met cacao of wij kunnen een persoonlijk sjabloon plaatsen. Laat ons via het contactformulier weten wat je voor ogen hebt, dan sturen we een voorstel. Je kan ook eerst bij ons in Hilversum langskomen om te proeven.'
		},
		{
			id: 'tiramisu-all-inclusive',
			question: 'Moeten wij of de locatie zelf nog iets regelen of terugbrengen?',
			answer:
				'Nee, dit is een full-service pakket. Wij bezorgen alles, bouwen de tiramisu of taart ter plekke vers op en blijven erbij tot het moment klopt zoals jullie het willen. Voor hangende hapjes is ook eetgerij inbegrepen, voor de taart kunnen wij borden, bestek, extra servetten of zelfs een tafel en decoratie meenemen als dit voor jullie makkelijker is dan overleggen met de locatie. Alles is geregeld, je hoeft dus ook geen schalen of bakken terug te brengen en vaak geen schotelgeld te betalen. Het is voor ons wat meer werk, maar dan heb je wel een compleet verzorgd dessert- of taartmoment.'
		},
		{
			id: 'tiramisu-zonder-alcohol',
			question: 'Kunnen jullie tiramisu zonder alcohol maken?',
			answer:
				'Ja. Standaard zit er een scheutje amaretto in, maar we hebben ook een alcoholvrije amaretto die we als vervanging gebruiken. Op een bruiloft met een gemengd publiek (kinderen, zwangere gasten, gasten die niet drinken) is dat geen enkel probleem. Geef het in je aanvraag door, dan houden we er meteen rekening mee.'
		},
		{
			id: 'tiramisu-vegetarisch',
			question: 'Is jullie tiramisu vegetarisch?',
			answer:
				'Ja. Mascarpone, eieren, lange vingers, suiker, espresso en cacao. Geen vlees of vis. De eieren zijn gepasteuriseerd, dus de tiramisu is ook veilig voor zwangere gasten en kinderen. Daarentegen is tiramisu niet Veganistisch.'
		},
		{
			id: 'tiramisu-toren',
			question: 'Kunnen jullie ook een tiramisu toren leveren voor op een bruiloft?',
			answer:
				'Nee, helaas leveren wij geen gebouwde tiramisu toren. Dat is een bewuste keuze: onze kracht zit in tiramisu vers op locatie opbouwen, als hangend hapje tussen de gasten of als tiramisutaart. Een toren met losse glaasjes moet je eigenlijk vooraf maken; als wij dat allemaal vers op locatie vullen, wordt het onnodig duur en omslachtig. Willen jullie de tiramisu toch in glas presenteren, dan denken we graag mee over coupes of glaswerk.'
		},
		{
			id: 'tiramisu-allergies',
			question: 'Hebben jullie opties voor allergieën of dieetwensen?',
			answer:
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Onze tiramisu bevat standaard gluten, lactose en ei. We kunnen losse alternatieven meenemen voor gasten die vegan eten of een complexe allergie hebben. De tiramisu of tiramisutaart zelf passen we alleen aan als iedereen dezelfde aangepaste receptuur krijgt. Alcoholvrij of cafeïnevrij kan wel per persoon bij live tiramisu. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
		},
		BLOG_FAQS_NL.leadtime
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
					Tiramisu op je bruiloft is nog leuker vanaf een hangend dienblad! Elke gast krijgt een
					vers gemaakte portie: lange vingers, espresso uit de mokapot, mascarponecrème, amaretto en
					cacao. Met een praatje en een glimlach serveren wij jullie dessert, midnight snack of
					zelfs tiramisu bruidstaart.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Toch liever een tiramisu taart om zelf aan te snijden of een toren met volle glazen, ook
					dan ben je aan het juiste adres.
				</p>
			</header>

			<section
				class="mt-10 rounded-xl border border-(--brand-magenta)/15 bg-(--brand-magenta)/5 px-6 py-5"
				aria-labelledby="snel-antwoord"
			>
				<h2
					id="snel-antwoord"
					class="text-xs font-semibold tracking-wider text-(--brand-magenta) uppercase"
				>
					Alles op een rijtje
				</h2>
				<ul
					class="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-(--brand-magenta)"
				>
					<li>Verse tiramisu voor elke gast</li>
					<li>50–60 porties per uur als hangend hapje</li>
					<li>Ook als tiramisutaart te bestellen</li>
					<li>Maak van jouw dessert of taartmoment een extra feestje</li>
				</ul>
			</section>

			<MuxClips
				clips={[
					{
						playbackId: 'Q6dowlovJnKajd134vOoS60101q00RS3NYz2YgOCv4gQpE',
						title: 'Tiramisu live op een bruiloft'
					},
					{
						playbackId: 'wAh8024FDNRT8VtuMTapIO5uHxiWIpr00d4t2aKMV8Stc',
						title: 'Tiramisu ter plekke opgebouwd'
					}
				]}
				gridClass="mx-auto mt-6 grid max-w-xl grid-cols-2 justify-items-center gap-3 sm:gap-4"
			/>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu als live catering op je bruiloft
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Ga voor iets unieks en laat Charlotte of Gijs rondlopen met verse tiramisu voor elke gast.
					We bouwen elke portie pas op bij het serveren voor extra entertainment en de hoogste
					kwaliteit. Zelf vinden wij dit er mooier uitzien dan scheppen uit een grote schaal en zo
					voelt het uniek voor elke gast.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						Iedere portie wordt op het moment zelf opgebouwd. Zo krijgt de laatste gast dezelfde
						kwaliteit als de eerste.
					</li>
					<li>
						Een glimlach en praatje met elke gast zorgt voor die extra herinnering aan jullie
						speciale dag. Ook kunnen we hiermee makkelijk wisselen tussen porties met likeur of
						juist alcoholvrij voor kinderen, zwangere gasten of gasten die niet drinken.
					</li>
					<li>
						Zelf hadden wij op onze bruiloft een ijsbar, na een zittend diner was dit echt perfect
						om nog even rond te lopen en de after-dinner dip over te slaan. Tiramisu werkt ook op
						dezelfde manier: een los, gezellig moment zonder rij voor een buffet.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Zijn er vragen over ons recept van de gasten of wordt er een grapje gemaakt? We gaan er
					graag in mee en praten met liefde over de tiramisu. Toetjesfanaat of niet, we halen ze
					allemaal over om lekker te proeven.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu taart, tiramisu toren of Italiaanse bruidstaart
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een taart om zelf aan te snijden? Ook dan ben je bij ons aan het juiste adres.
					Charlotte heeft veel patisserie-ervaring en naast klassieke bruidstaarten leveren wij ook
					een mooie tiramisutaart of Italiaanse millefoglie.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Tiramisutaart</strong> in showformaat om zelf aan te snijden. Ideaal als je een groter
						dessertmoment wilt, krap in de tijd zit of zelf onderdeel wilt zijn van het taartmoment.
					</li>
					<li>
						<strong>Tiramisu toren (coupes)</strong> Helaas leveren wij geen voorgebouwde torens omdat
						dit minder goed past bij ons verse concept en all-inclusive service. Wel kunnen we glaswerk
						meenemen zodat gasten uit een mooie coupe kunnen eten. We leveren alleen geen gebouwde torenconstructie.
					</li>
					<li>
						<a href="/blog/italiaanse-bruidstaart" class="underline hover:text-foreground"
							><strong>Italiaanse mille-feuille (millefoglie)</strong> als bruidstaart</a
						>, precies zoals wij die zelf op onze eigen bruiloft hadden. Een groot feest om zelf af
						te maken met rood fruit als je dat wilt!
					</li>
					<li>
						<a href="/blog/bruidstaart" class="underline hover:text-foreground"
							><strong>Klassieke hoge bruidstaart</strong> met een tiramisu-smaak en -vulling</a
						>, een echte aanrader.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een ronde open showtaart van lange vingers en Tiramisu-creme door jullie afgemaakt met een
					laagje cacao. We bouwen hem live op locatie, dus je gasten kunnen meekijken. Een portie is
					een volwaardig stuk taart en is mooi gelaagd voor elke gast. Liever een andere vorm, een
					sjabloon of een dichte taart, ook dat kan!
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
					Het leukste bewaren we voor jullie: de laatste laag cacao mag je zelf strooien. We geven
					het zeefje met liefde uit handen voor dat ene plaatje, en meteen heb je een mooi moment
					voor de fotograaf. Wil je het persoonlijker maken? Dan kunnen we ook een decal in de cacao
					stempelen, denk aan jullie namen, initialen of de trouwdatum. Op deze foto's zie je 'm
					niet, maar vraag er gerust naar, we denken graag mee.
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
					De taart op deze foto's is gemaakt voor zo'n 30 personen.
				</p>

				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Laat ons via het <a href="/#contact" class="underline hover:text-foreground"
						>contactformulier</a
					> weten wat je voor ogen hebt, dan sturen we een voorstel op maat. Kom vooral van tevoren proeven
					in Hilversum, dat is altijd een leuk moment in de aanloop naar jullie dag.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Hoe wij de tiramisu maken</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het recept is klassiek-Italiaans. Tiramisu hoort als tiramisu te smaken, en daar houden we
					ons aan. De basis ligt vast, de afwerking kiezen jouw gasten ter plekke.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Echte mascarpone</strong> crème, geen slagroom
					</li>
					<li>
						De crème wordt luchtig door met suiker opgeklopte (gepasteuriseerde) eieren toe te
						voegen.
					</li>
					<li>
						<strong>Lange vingers</strong>
					</li>
					<li>
						Sterke koffie uit de mokapot van light-roast Ethiopische bonen van
						<a
							href="https://www.blommers.coffee/nl/"
							target="_blank"
							rel="noopener noreferrer"
							class="underline hover:text-foreground">Blommers Roasters</a
						>
						Een heldere en bloemige koffie die een goed contrast geeft.
					</li>
					<li>
						<strong>Amaretto</strong> voor het Italiaanse randje. Liever zonder alcohol? Dan gebruiken
						we een alcoholvrije amaretto, met dezelfde smaak.
					</li>
					<li>
						<strong>Cacao</strong> op het einde gestrooid, zoveel als je wilt.
					</li>
					<li>
						Stevige, duurzame bakjes, lepels en servetten. Ook voor kinderen en oudere gasten is het
						daarmee makkelijk eten.
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wanneer en waar past tiramisu op je bruiloft?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Drie momenten waarop het écht werkt:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Als dessertmoment of tijdens een Walking dinner</strong> Een verse tiramisu, per gast
						opgebouwd, maakt het dessert tot een hoogtepunt van de avond.
					</li>
					<li>
						<strong>Als midnight snack.</strong> Laat op de avond, na een lang diner, een ronde verse
						tiramisu. Koffie en zoet in één hapje.
					</li>
					<li>
						<strong>Als taartmoment (receptie of feest).</strong> Snijd zelf je tiramisutaart aan en laat
						ons het dessertmoment eromheen verzorgen. Geen lange rijen, gewoon wat lekkers voor iedereen.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij houden de focus op jullie gasten en op de kwaliteit van elke portie, zodat jij nergens
					aan hoeft te denken.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Qua capaciteit verzorgen we 50–60 porties per uur per bediende; vanaf 100 gasten raden we
					een extra bediende aan. Voor veel bruiloftsmomenten is een serveervenster van 1-2 uur
					eigenlijk perfect: gasten komen in golven en bepalen zo hun eigen moment voor een
					tiramisu. Op locatie hebben we weinig nodig, een klein hoekje voor de koelelementen, een
					stopcontact en een waterkraan. De rest regelen wij, van bakjes tot servetten. Heb je
					minder tijd? Dan kan de tiramisu ook als grote taart geleverd worden.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je tiramisu combineren met een hartig hapje?
					<a href="/blog/burrata-catering" class="underline hover:text-foreground"
						>Lees over onze burrata-catering</a
					>, of stuur ons een mail met je datum en aantal gasten. We denken graag met je mee.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat tiramisu op je bruiloft kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de tabel hieronder zie je de pakketprijzen (excl. BTW) voor onze live tiramisu en
					tiramisutaart. Deze prijs is inclusief bezorgen, opbouw op locatie, serveren of aanwezig
					blijven tot het taartmoment, eetgerij, servetten, sjabloon en alle andere wensen. Een
					portie per gast is groter bij de tiramisutaart, hier komt het prijsverschil vandaan voor
					de opties.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Aantal gasten</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tijd &amp; bezetting</th>
								<th class="py-3 pr-4 font-heading font-semibold">Live tiramisu</th>
								<th class="py-3 font-heading font-semibold">Tiramisutaart</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">30</td>
								<td class="py-3 pr-4">Taartmoment</td>
								<td class="py-3 pr-4">—</td>
								<td class="py-3">€375</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">50</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3 pr-4">€425</td>
								<td class="py-3">€475</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">100</td>
								<td class="py-3 pr-4">1 uur, 2 bedienden (of 2 uur, 1)</td>
								<td class="py-3 pr-4">€650</td>
								<td class="py-3">€795</td>
							</tr>
							<tr>
								<td class="py-3 pr-4">200</td>
								<td class="py-3 pr-4">2 uur, 2 bedienden</td>
								<td class="py-3 pr-4">€1.150</td>
								<td class="py-3">Op aanvraag</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50 km zit het bij de prijs in. Daarboven rekenen we €0,45
					per kilometer.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Tip van Hangende Hapjes: denk aan tiramisu, als midnight snack. Laat op de avond krijgen
					gasten vaak weer trek, en dan is dit echt een topmoment. Wij dansen lekker mee tijdens het
					uitserveren.
				</p>
			</section>

			<BlogReviewTeaser reviews={toetjesReviews} />

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
