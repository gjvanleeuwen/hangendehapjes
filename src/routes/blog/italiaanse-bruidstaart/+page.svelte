<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { jsonLdScript } from '$lib/seo';
	import BlogSummary from '$lib/blog/BlogSummary.svelte';
	import BlogOtherCakes from '$lib/blog/BlogOtherCakes.svelte';
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

	const headline = 'Italiaanse bruidstaart: een millefoglie, vers afgemaakt op locatie';
	// Title leads with "millefoglie": GSC (90d tot 2026-08-06) laat zien dat dat het
	// grootste zoekwoord van deze pagina is (107 imp, pos 9.1) en dat 'wat is millefoglie'
	// op pos 5.8 staat met 0 clicks. Het woord stond niet in de oude title, vandaar 3,43%
	// CTR tegenover 15,57% op de tiramisu-post. De millefeuille-spelling blijft in de body
	// en de FAQ staan voor de long tail.
	const title = 'Millefoglie: de Italiaanse bruidstaart | Hangende Hapjes';
	const description =
		'Millefoglie is de Italiaanse bruidstaart: dunne lagen bladerdeeg, luchtige Zwitserse room en vers rood fruit. Wij maken hem ter plekke af, live voor jouw gasten.';
	const slug = '/blog/italiaanse-bruidstaart';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-italiaanse-bruidstaart.jpg';
	const serviceId = SITE_URL + '/#service-toetjes';
	const datePublished = '2026-06-29';
	const millefogliePriceFrom = 395;
	const millefoglieMinPortions = 25;

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

	// No millefoglie review yet, so no aggregateRating on this product (borrowing the
	// tiramisu rating would be misleading). The summary card shows the business-wide
	// score with short snippets of all reviews and links through.

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': ['Service', 'Product'],
		'@id': serviceId,
		name: 'Italiaanse bruidstaart (millefoglie) catering',
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
			price: millefogliePriceFrom,
			availability: 'https://schema.org/InStock',
			priceSpecification: {
				'@type': 'UnitPriceSpecification',
				price: millefogliePriceFrom,
				priceCurrency: 'EUR',
				referenceQuantity: {
					'@type': 'QuantitativeValue',
					value: millefoglieMinPortions,
					unitText: 'portions'
				}
			}
		}
	};

	const faqList: BlogFaq[] = [
		{
			id: 'millefoglie-vs-millefeuille',
			question: 'Wat is het verschil tussen een millefoglie en een millefeuille?',
			answer:
				'Eigenlijk niets, het is dezelfde taart in een andere taal. Millefoglie is de Italiaanse naam, millefeuille de Franse, en allebei betekenen ze duizend blaadjes. Het gaat om dunne, knapperige lagen bladerdeeg met daartussen een romige vulling. Onze versie is de Italiaanse: luchtige Zwitserse room en een flinke laag vers rood fruit erbovenop.'
		},
		{
			id: 'bruidstaart-fruit',
			question: 'Welk fruit zit er op de Italiaanse bruidstaart?',
			answer:
				'Een gulle laag vers rood fruit: aardbei, frambozen, bramen en blauwe bes, afgemaakt met een beetje poedersuiker. In de zomer is de keuze en kwaliteit het best. Ver buiten het zomerseizoen kan de samenstelling iets veranderen, omdat we liever goed fruit gebruiken dan exact dezelfde mix forceren. Heb je een voorkeur, of moet er iets juist af vanwege een allergie? Geef het door in je aanvraag, dan passen we het aan.'
		},
		{
			id: 'bruidstaart-aantal-gasten',
			question: 'Voor hoeveel gasten kunnen jullie een Italiaanse bruidstaart maken?',
			answer:
				'Een millefoglie kan vanaf 25 personen. Voor grotere bruiloften maken we de taart groter, zodat het formaat past bij jullie aantal gasten. Geef je aantal gasten door in je aanvraag, dan kijken we welk formaat logisch is.'
		},
		{
			id: 'bruidstaart-proeven',
			question: 'Kunnen we de millefoglie eerst proeven?',
			answer:
				'Ja! We organiseren geen losse proeverijen per stel, maar we staan vier keer per jaar op de Open Trouwlocatieroute. Daar kun je gewoon langskomen en proeven. Stuur ons een berichtje, dan laten we weten wanneer en waar we de volgende keer staan.'
		},
		{
			id: 'bruidstaart-zomer-buiten',
			question: 'Kan een millefoglie ook in de zomer of buiten?',
			answer:
				'Ja, en dat is juist waarom we hem op locatie afmaken. We spuiten de room en leggen het verse fruit er ter plekke op, zodat het bladerdeeg knapperig blijft en de room tot het aansnijden gekoeld is. Daardoor werkt de taart het hele jaar door, binnen én buiten, ook op een warme trouwdag. We hebben alleen een koel hoekje nodig om de taart op te bouwen.'
		},
		{
			id: 'bruidstaart-schotelgeld',
			question: 'Moeten we schotelgeld betalen aan onze locatie?',
			answer:
				'Meestal niet. Veel locaties rekenen schotelgeld als zij een meegebrachte taart via hun eigen servies en personeel moeten verwerken. Wij leveren de millefoglie als full-service pakket: bezorgen, opbouwen op locatie en aanwezig blijven tot het aansnijmoment. Borden, bestek, servetten of een presentatietafel kunnen we in overleg meenemen als dat kosten bij de locatie scheelt. Check het wel even in je contract: een enkele locatie rekent een vast bedrag voor externe catering, los van hoe het taartmoment wordt geregeld.'
		},
		{
			id: 'millefoglie-allergies',
			question: 'Hebben jullie opties voor allergieën of dieetwensen?',
			answer:
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Daar rekenen we niets extra voor. Een millefoglie bevat standaard gluten, lactose en ei door het bladerdeeg en de Zwitserse room. Het rode fruit kunnen we aanpassen op voorkeur of seizoen. We kunnen losse alternatieven meenemen voor gasten die vegan eten of een complexe allergie hebben. De millefoglie zelf passen we alleen aan als iedereen dezelfde aangepaste receptuur krijgt. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
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
					Onze eigen bruidstaart, nu ook voor jullie
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een Italiaanse bruidstaart, ook wel een millefoglie (of de Franse millefeuille) genoemd,
					is een gelaagde taart van dunne, knapperige lagen bladerdeeg met luchtige Zwitserse room
					en een flinke berg vers rood fruit. Zelf hadden wij deze taart op onze bruiloft, en nu
					maken we hem ook voor jullie.
				</p>
			</header>

			<BlogSummary reviews={nl.reviews.items} quotes={2}>
				<li>
					<strong>Wat:</strong> knapperig bladerdeeg, luchtige Zwitserse room en vers rood fruit.
				</li>
				<li>
					<strong>Vers afgemaakt:</strong> we bouwen hem ter plekke op, het laatste fruit mogen jullie
					zelf leggen.
				</li>
				<li><strong>Prijs:</strong> vanaf €395 voor 25 gasten, het hele jaar door.</li>
				<li>
					<strong>Inbegrepen:</strong> bezorgen, opbouwen en alternatieven voor dieetwensen. In het Gooi,
					Amsterdam en Utrecht rekenen we geen reiskosten.
				</li>
			</BlogSummary>

			<figure class="mt-10 overflow-hidden rounded-xl bg-muted">
				<div class="aspect-[19/10]">
					<Picture
						src="/images/millefoglie_banner.jpeg"
						alt="Italiaanse bruidstaart millefoglie met gelaagd bladerdeeg, Zwitserse room en vers rood fruit"
						sizes="(min-width: 768px) 768px, 100vw"
						loading="lazy"
						class="size-full object-cover"
					/>
				</div>
				<figcaption class="px-4 py-3 text-sm text-muted-foreground">
					De millefoglie op deze foto is goed voor zo'n 24 porties.
				</figcaption>
			</figure>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat is een Italiaanse bruidstaart precies?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Millefoglie betekent letterlijk duizend blaadjes, en dat is precies wat het is: laag op
					laag knapperig bladerdeeg, daartussen luchtige Zwitserse room (banketbakkersroom met
					slagroom, lichter dan de crème in een tompouce), en bovenop een gulle laag vers rood
					fruit. Een lichte, gelaagde taart die na een diner nog prima wegglijdt. Zie het als de
					Italiaanse neef van de Franse millefeuille en de chique grote zus van de Nederlandse
					tompouce.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Vers afgemaakt op locatie</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Bladerdeeg dat te lang onder de room ligt, wordt zacht, en dan is de knapperigheid weg die
					de taart zo lekker maakt. Daarom bouwen wij de taart ter plekke op: Wij spuiten de
					Zwitserse room op en leggen het verse fruit erop kort voor het taartmoment. Gasten vinden
					het super leuk om hier naar te kijken en we maken graag een praatje met ze. Op deze manier
					kunnen wij hele grote taarten leveren, tot wel 2 meter breed.
				</p>
				<figure class="mt-6 overflow-hidden rounded-xl bg-muted">
					<div class="aspect-3/2">
						<Picture
							src="/images/millefoglie_charlotte.jpeg"
							alt="Charlotte van Hangende Hapjes spuit verse Zwitserse room op een Italiaanse millefoglie bruidstaart op locatie"
							sizes="(min-width: 768px) 768px, 100vw"
							loading="lazy"
							class="size-full object-cover"
						/>
					</div>
				</figure>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij bouwen de taart helemaal op en geven hem daarna aan jullie door voor het taartmoment.
					Wil je er nog een klein showmoment van maken? Dan kan je het laatste fruit en een snufje
					poedersuiker ook zelf plaatsen. Dat hoeft niet, maar het is wel een leuk, persoonlijk
					moment en geeft super mooie plaatjes.
				</p>
				<figure class="mt-6 overflow-hidden rounded-xl bg-muted">
					<div class="aspect-3/2">
						<Picture
							src="/images/millefoglie_aansnijden.jpeg"
							alt="Een bruidspaar snijdt samen hun Italiaanse millefoglie bruidstaart aan tussen de gasten"
							sizes="(min-width: 768px) 768px, 100vw"
							loading="lazy"
							class="size-full object-cover"
						/>
					</div>
				</figure>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij nemen alles zelf mee, maar mocht er op de locatie een plek zijn voor de koelbox, dan
					is dat perfect. We blijven erbij tot het aansnijmoment en ook het afval gaat met ons
					terug, zo zijn jullie en de locatie volledig ontzorgd.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Smaken, fruit en formaten</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					De millefoglie is bewust klassiek: bladerdeeg, Zwitserse room en vers rood fruit (aardbei,
					framboos, braam en blauwe bes) met wat poedersuiker. In de zomer is dat fruit op z'n best.
					Daarbuiten kan de mix iets veranderen, want we kiezen liever wat op dat moment het
					lekkerst is.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					We leveren een taart vanaf 25 personen maar het kan tot zeker 200 personen, dan wordt de
					taart gewoon breder en langer.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Laat ons via het <a href="/#contact" class="underline hover:text-foreground"
						>contactformulier</a
					> weten wat je voor ogen hebt, dan sturen we een voorstel op maat.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Gegarandeerd een succes, we weten het uit ervaring.
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Op onze eigen bruiloft hadden we een mega milefeille voor 100 personen. Samen het fruit
					leggen was echt een hoogtepunt en de gasten vonden het genieten. Wij weten precies hoe we
					het moeten maken en leveren zodat het ook voor jullie perfect is!
				</p>
				<figure class="mt-6 overflow-hidden rounded-xl bg-muted">
					<div class="aspect-[19/10]">
						<Picture
							src="/images/millefoglie_ons.jpeg"
							alt="Charlotte en Gijs met een Italiaanse millefoglie bruidstaart op hun bruiloft"
							sizes="(min-width: 768px) 768px, 100vw"
							loading="lazy"
							class="size-full object-cover object-[50%_28%]"
						/>
					</div>
				</figure>
			</section>

			<BlogOtherCakes ids={['tiramisutaart', 'klassiek']} event="bruidstaart">
				Wij leveren ook een tiramisutaart die we ter plekke opbouwen, en klassieke hoge
				bruidstaarten in 8 smaken.
			</BlogOtherCakes>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat een Italiaanse bruidstaart kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Dit zijn pakketprijzen, excl. btw. Bezorgen, live opbouwen op locatie en dieetwensen zijn
					inbegrepen.
				</p>
				<div>
					<div class="rounded-xl border border-border px-5 py-4">
						<h3 class="font-heading text-lg tracking-tight">Italiaanse bruidstaart</h3>
						<table class="mt-2 w-full border-collapse text-sm">
							<thead class="sr-only">
								<tr>
									<th>Aantal gasten</th>
									<th>Prijs</th>
								</tr>
							</thead>
							<tbody class="text-muted-foreground">
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3 text-foreground">25 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€395</td>
								</tr>
								<tr class="border-b border-border/60">
									<td class="py-2 pr-3 text-foreground">50 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€495</td>
								</tr>
								<tr>
									<td class="py-2 pr-3 text-foreground">100 gasten</td>
									<td class="py-2 text-right font-medium text-foreground">€845</td>
								</tr>
							</tbody>
						</table>
						<p class="mt-3 text-xs leading-relaxed text-muted-foreground">
							Alle service tot en met het aansnijd moment is inbegrepen. Borden, bestek, een
							presentatietafel en servetten gebruiken wij graag van de locatie. Is dit lastig dan
							kunnen wij dit in overleg ook meenemen en regelen voor jullie.
						</p>
						<p class="mt-2 text-xs leading-relaxed text-muted-foreground">
							Reiskosten zijn inbegrepen tot ~30km rondom Hilversum (Het Gooi, Amersfoort, Amsterdam en
							Utrecht). Hierbuiten brengen wij reiskosten in rekening voor de extra kilometers.
						</p>
					</div>
				</div>
			</section>

			<BlogCta
				event="bruidstaart"
				heading="Een Italiaanse bruidstaart op jullie dag? Stuur ons je datum."
				body="Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een voorstel op maat: een millefoglie, een klassieke bruidstaart, of de taart samen met live hapjes."
				waText="Hoi! Ik heb een vraag over een Italiaanse bruidstaart van Hangende Hapjes 👋"
			/>

			<BlogFaqSection
				items={faqList}
				intro="Alles wat je je afvraagt over een Italiaanse bruidstaart, van fruit tot schotelgeld."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
