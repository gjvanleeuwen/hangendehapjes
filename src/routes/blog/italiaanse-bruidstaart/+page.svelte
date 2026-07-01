<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { jsonLdScript, aggregateRatingJsonLd } from '$lib/seo';
	import BlogReviewTeaser from '$lib/blog/BlogReviewTeaser.svelte';
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
	const title = 'Italiaanse bruidstaart: vers op locatie';
	const description =
		'Een Italiaanse bruidstaart voor je bruiloft? Wij maken een verse millefoglie: gelaagd bladerdeeg met luchtige Zwitserse room en vers rood fruit, ter plekke afgemaakt.';
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

	// Canonical commercial page lives at /#service-toetjes (De Toetjes Vrouw). No
	// bruidstaart-specific review exists yet, so aggregateRatingJsonLd([]) yields no
	// rating markup; the aggregate + teaser appear once a review tagged 'toetjes' is added.
	const toetjesReviews = nl.reviews.items.filter((review) => review.productId === 'toetjes');

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
		},
		...aggregateRatingJsonLd(toetjesReviews)
	};

	const faqList: BlogFaq[] = [
		{
			id: 'millefoglie-vs-millefeuille',
			question: 'Wat is het verschil tussen een millefoglie en een millefeuille?',
			answer:
				'Eigenlijk niets, het is dezelfde taart in een andere taal. Millefoglie is de Italiaanse naam, millefeuille de Franse, en allebei betekenen ze duizend blaadjes. Het gaat om dunne, knapperige lagen bladerdeeg met daartussen een romige vulling. Onze versie is de Italiaanse: luchtige Zwitserse room en een flinke laag vers rood fruit erbovenop. Zie het als de chique, grote zus van de Nederlandse tompouce.'
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
			question: 'Kunnen we de bruidstaart eerst proeven?',
			answer:
				'Heel graag zelfs. Net als bij onze tiramisu doen we de proeverij bij ons in Hilversum: je komt langs en proeft de millefoglie vers, want een bladerdeegtaart leent zich niet goed voor een doosje mee naar huis. Zo proef je hem precies zoals hij op je grote dag is voordat je iets vastlegt.'
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
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Een millefoglie bevat standaard gluten, lactose en ei door het bladerdeeg en de Zwitserse room. Het rode fruit kunnen we aanpassen op voorkeur of seizoen. We kunnen losse alternatieven meenemen voor gasten die vegan eten of een complexe allergie hebben. De millefoglie zelf passen we alleen aan als iedereen dezelfde aangepaste receptuur krijgt. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
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
					en een flinke berg vers rood fruit. Zelf hadden wij deze taart op onze bruiloft en het was
					een enorm succes. Niet alleen hadden wij zelf de tijd van ons leven met het leggen van
					het fruit, ook de gasten vonden het fantastisch om naar het opbouwen te kijken. Het was
					feestelijk, super lekker en net even anders dan een klassieke hoge bruidstaart.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een <a href="/blog/bruidstaart" class="underline hover:text-foreground"
						>klassieke hoge bruidstaart</a
					>, of
					<a href="/blog/tiramisu-bruiloft" class="underline hover:text-foreground"
						>tiramisu op je bruiloft?
					</a> Daar denken we ook graag in mee.
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
					<li>Knapperig bladerdeeg, luchtige Zwitserse room en vers rood fruit</li>
					<li>Ter plekke afgemaakt, zodat het bladerdeeg knapperig blijft</li>
					<li>Vanaf 25 personen, het hele jaar door, binnen of buiten</li>
					<li>Wij bouwen de taart op, jullie maken hem af en/of snijden de taart aan</li>
				</ul>
			</section>

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
					fruit. Geen zware botercrème of stugge cake, maar een lichte, gelaagde taart die na een
					diner nog prima wegglijdt. Het is de Italiaanse neef van de Franse millefeuille en de
					chique grote zus van de Nederlandse tompouce.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					De taart wordt groter en groter met het aantal personen en je kan het zelf afmaken met
					rood fruit of poedersuiker. Zo kun je er een mooi taartmoment van maken.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Vers afgemaakt op locatie</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het geheim van een goede millefoglie is timing. Bladerdeeg dat te lang onder de room ligt
					wordt zacht, en daar gaat juist de knapperigheid verloren die de taart zo lekker maakt.
					Daarom bouwen wij de taart ter plekke op: Charlotte spuit de Zwitserse room en legt het
					verse fruit erop kort voor het taartmoment. Gasten vinden het super leuk om hier naar te
					kijken en we maken graag een praatje met ze.
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
					poedersuiker ook zelf opleggen. Dat hoeft niet, maar het is wel een leuk, persoonlijk
					moment.
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
					Verder hebben we weinig nodig op locatie: een koel hoekje om de taart op te bouwen, en wij
					nemen mee wat nodig is om hem netjes klaar te zetten. We blijven erbij tot het
					aansnijmoment, zodat de taart precies staat zoals jullie hem willen.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Smaken, fruit en formaten</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					De millefoglie is bewust klassiek: knapperig bladerdeeg, luchtige Zwitserse room en vers
					rood fruit. De variatie zit niet in de vulling maar in het fruit en de afwerking.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Klassieke millefoglie</strong> met Zwitserse room en vers rood fruit: aardbei, frambozen,
						bramen en blauwe bes, met een lichte poedersuiker. Feestelijk, fris en precies waarom we deze
						taart zo leuk vinden.
					</li>
					<li>
						<strong>Rood fruit naar seizoen.</strong> Aardbei, frambozen, bramen en blauwe bes komen het
						best tot hun recht in de zomer. Ver buiten het zomerseizoen kan de mix iets veranderen door
						beschikbaarheid en kwaliteit; dan kiezen we het fruit dat op dat moment het lekkerst en mooiste
						is.
					</li>
					<li>
						<strong>Liever iets anders?</strong> We maken ook een
						<a href="/blog/bruidstaart" class="underline hover:text-foreground"
							>klassieke hoge bruidstaart</a
						>, of je combineert de dag met onze
						<a href="/blog/tiramisu-bruiloft" class="underline hover:text-foreground"
							>live tiramisu</a
						>. We denken graag met je mee over wat het beste bij jullie dag past.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Laat ons via het <a href="/#contact" class="underline hover:text-foreground"
						>contactformulier</a
					> weten wat je voor ogen hebt, dan sturen we een voorstel op maat. Je kan ook eerst bij ons
					in Hilversum langskomen om te proeven.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Waarom wij deze taart zo leuk vinden
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Op onze eigen bruiloft hadden we ook een Italiaanse millefoglie, en dat moment is ons
					altijd bijgebleven. Niet omdat hij traditioneel of perfect strak was, maar juist omdat hij
					luchtig, vrolijk en een beetje anders voelde. Dat is precies waarom we hem nu in ons
					aanbod hebben: Charlotte heeft de patisserie-ervaring om hem lekker en mooi te maken, en
					wij vinden het gewoon een fantastische taart voor een feest.
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

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat een Italiaanse bruidstaart kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de tabel hieronder zie je de pakketprijzen (excl. BTW) voor onze Italiaanse
					bruidstaart. Dit is geen portieprijs maar volledig inclusief: bezorgen, live afmaken op
					locatie, aanwezig blijven tot het aansnijmoment, eetgerij, servetten en het netjes
					klaarzetten zijn allemaal inbegrepen.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Aantal gasten</th>
								<th class="py-3 font-heading font-semibold">Pakketprijs (vanaf)</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">25</td>
								<td class="py-3">€395</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">50</td>
								<td class="py-3">€575</td>
							</tr>
							<tr>
								<td class="py-3 pr-4">100</td>
								<td class="py-3">€995</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een millefoglie wordt vers in onze keuken gemaakt en op locatie afgemaakt met room en een
					flinke laag echt fruit. Voor grotere bruiloften maken we de taart groter; vraag gerust een
					voorstel op maat aan.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je de locatie ontzorgen of kosten daar beperken? Dan kunnen we in overleg ook borden,
					bestek, extra servetten of een presentatietafel meenemen. Zo heb je geen schotelgeld of
					andere onverwachtse kosten zoals bij een klassieke bruidstaart.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50 km zit het bij de prijs in. Daarboven rekenen we €0,45
					per kilometer.
				</p>
			</section>

			<BlogReviewTeaser reviews={toetjesReviews} />

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
