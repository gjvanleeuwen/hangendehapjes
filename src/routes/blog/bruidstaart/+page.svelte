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
		PRODUCT_MIN_PORTIONS,
		PRODUCT_PRICES_EUR_FROM,
		SITE_NAME,
		SITE_URL
	} from '$lib/site-config';
	import { nl } from '$lib/i18n/nl';
	import { BLOG_FAQS_NL, buildFaqJsonLd, type BlogFaq } from '$lib/blog/faqs';
	import BlogFaqSection from '$lib/blog/BlogFaqSection.svelte';
	import BlogCta from '$lib/blog/BlogCta.svelte';

	const headline = 'Bruidstaart op maat: Perfect voor jullie dag';
	const title = 'Bruidstaart op maat: inclusief proeven';
	const description =
		'Een klassieke bruidstaart op maat? Charlotte bakt botercrèmetaarten in 8 smaken, afwerking naar keuze en je kan gratis komen proeven.';
	const slug = '/blog/bruidstaart';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-bruidstaart.jpg';
	const serviceId = SITE_URL + '/#service-toetjes';
	const datePublished = '2026-06-29';

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

	// Canonical commercial page lives at /#service-toetjes (De Toetjes Vrouw, Charlotte).
	// The full reviews live on the homepage; here we only surface the aggregate score +
	// count (matching the compact teaser below) and link through.
	const toetjesReviews = nl.reviews.items.filter((review) => review.productId === 'toetjes');

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': ['Service', 'Product'],
		'@id': serviceId,
		name: 'Bruidstaart op maat (catering)',
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
			id: 'bruidstaart-aantal-etages',
			question: 'Hoeveel etages heb ik nodig voor mijn aantal gasten?',
			answer:
				"We maken klassieke bruidstaarten vanaf 50 personen. Als richtlijn: een bruidstaart van twee etages snijd je makkelijk in zo'n 80 porties, drie etages tot rond de 120. Trouw je met een groter gezelschap? Dan bouwen we hem groter of zetten we er een tweede aansnijtaart naast, zodat iedereen een stuk krijgt. Geef je aantal gasten door in je aanvraag, dan kijken we welk formaat past."
		},
		{
			id: 'bruidstaart-bloemen',
			question: 'Kunnen er verse bloemen op de bruidstaart?',
			answer:
				'Ja, verse bloemen passen heel mooi bij een klassieke bruidstaart. We stemmen de kleuren af op jullie boeket, styling of moodboard. Heb je een eigen bloemist? Dan werken we graag met dezelfde bloemen of kleuren, zodat de taart mooi aansluit op de rest van de dag. Liever zonder bloemen, of met een topper met jullie namen? Ook goed.'
		},
		{
			id: 'bruidstaart-hoog-stevig',
			question: 'Blijft een bruidstaart wel stevig staan, ook buiten?',
			answer:
				'Ja. Een klassieke bruidstaart bouwen we op met een stevige interne constructie, zodat de etages elkaar dragen en de taart strak blijft staan. Charlotte heeft veel patisserie-ervaring en bakte al talloze taarten voor vrienden en klanten. We zetten de taart op locatie in elkaar in plaats van hem heel te vervoeren, dus hij komt altijd recht aan. Op een warme trouwdag hebben we alleen een koel hoekje nodig om hem op te bouwen.'
		},
		{
			id: 'bruidstaart-bezorgen',
			question: 'Bezorgen jullie de taart, of moeten we hem ophalen?',
			answer:
				'Wij bezorgen de taart en zetten hem op locatie in elkaar, zodat hij daar in de koeling kan tot het taartmoment. Het bezorgen zit bij de prijs in, in het Gooi, Amsterdam en Utrecht. Verder weg rekenen we de reis mee in je offerte. Het aansnijden en serveren doen jullie zelf of je locatie. Wil je liever dat wij tussen je gasten door serveren? Kijk dan naar onze millefoglie of live tiramisu, of vraag ernaar in je aanvraag.'
		},
		{
			id: 'bruidstaart-allergies',
			question: 'Hebben jullie opties voor allergieën of dieetwensen?',
			answer:
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Een klassieke bruidstaart bevat standaard gluten, lactose en ei. Afhankelijk van de smaak kunnen daar noten, chocolade of fruit bij komen. We kunnen losse alternatieven meenemen voor gasten die vegan eten of een complexe allergie hebben. De taart zelf passen we alleen aan als iedereen dezelfde aangepaste receptuur krijgt. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
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
					Klassiek en persoonlijk
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een klassieke bruidstaart is niet alleen om aan een verwachting te voldoen, het is een
					persoonlijk moment, dus maak er een feestje van. Charlotte bakt een taart op maat: elke
					laag in de smaak die jullie kiezen, een matchende kleur of bloemen en de afwerking precies
					zoals je hem voor je ziet. Van rustig en strak tot perfect passend bij de jurk, versiering
					of bloemen, het kan allemaal.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een ander soort bruidstaart? Lees dan over onze
					<a href="/blog/italiaanse-bruidstaart" class="underline hover:text-foreground"
						>Italiaanse millefoglie</a
					>, of
					<a href="/blog/tiramisu-bruiloft" class="underline hover:text-foreground">live tiramisu</a
					>.
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
					<li>Botercrème-taart op maat gebakken en afgewerkt door Charlotte</li>
					<li>Keuze uit 8 smaken per laag, kleur en afwerking helemaal naar keuze</li>
					<li>Neem een proefdoosje mee naar huis (€30, verrekend bij je bestelling)</li>
					<li>Vanaf 25 personen, twee etages tot zo'n 80, drie tot rond de 150</li>
					<li>Richtprijs €11,50 per persoon, excl. btw</li>
					<li>Bezorgen en opbouwen op locatie inbegrepen, in het Gooi, Amsterdam en Utrecht</li>
				</ul>
			</section>

			<figure class="mt-10 overflow-hidden rounded-xl bg-muted">
				<div class="aspect-3/2">
					<Picture
						src="/images/bruitstaart_120_pers.jpeg"
						alt="Bruidspaar snijdt een hoge klassieke bruidstaart met rode rozen aan terwijl gasten toekijken"
						sizes="(min-width: 768px) 768px, 100vw"
						loading="lazy"
						class="size-full object-cover"
					/>
				</div>
			</figure>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat je kiest bij een bruidstaart op maat
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het begint met een kort gesprek online, om goed te snappen hoe jullie dag eruitziet, welke
					styling je mooi vindt en welke wensen jullie hebben voor de taart. Stuur wat
					inspiratiefoto's of een moodboard mee, dan maakt Charlotte daar een plan en een offerte
					van. Zo is helemaal duidelijk welke vulling julie lekker vinden, welke kleuren terugkomen
					in de bloemen of styling, en of de taart strak, rustiek of juist uitbundig wordt.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>De smaak, per laag:</strong> bij meerdere etages mag elke laag een eigen smaak hebben,
						van klassiek met rood fruit of chocolade tot gezouten karamel en thee.
					</li>
					<li>
						<strong>De afwerking:</strong> botercrème in elke kleur die je wilt, strak afgesmeerd of juist
						rustiek geveegd. Jij bepaalt de look.
					</li>
					<li>
						<strong>De details, als je wilt:</strong> verse bloemen, vers fruit, parels, een pipingtechniek
						of een topper met jullie namen. Alles kan, niets moet.
					</li>
					<li>
						<strong>Het formaat:</strong> twee etages is vaak genoeg voor ongeveer 80 porties, drie etages
						voor rond de 120. Willen jullie toch meer etages, dan wordt de taart smaller gemaakt zodat
						het past bij het aantal gasten.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Charlotte bakt de taart in lagen en zet hem op locatie in elkaar, zodat hij recht en strak
					klaarstaat voor het aansnijmoment. Kort voor de bruiloft hebben we altijd nog even contact
					om de bezorging en de laatste dingen kort te sluiten. Zo hebben jullie geen stress over
					dit cruciale deel van jullie dag.
				</p>
				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<figure class="overflow-hidden rounded-xl bg-muted">
						<div class="aspect-3/4">
							<Picture
								src="/images/bruidstaart_80_pers.jpeg"
								alt="Klassieke hoge bruidstaart in botercrème met perzikkleurige rozen en eucalyptus op een houten plak"
								sizes="(min-width: 768px) 376px, (min-width: 640px) 50vw, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
					</figure>
					<figure class="overflow-hidden rounded-xl bg-muted">
						<div class="aspect-3/4">
							<Picture
								src="/images/bruidstaart_orchidee.jpeg"
								alt="Klassieke hoge bruidstaart in botercrème met witte orchideeën en parels op een houten plak"
								sizes="(min-width: 768px) 376px, (min-width: 640px) 50vw, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
					</figure>
				</div>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Bestel een proefdoosje</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voordat je iets vastlegt wil je natuurlijk weten hoe het smaakt. Kom gratis proeven bij
					ons in Hilversum, dan drinken we meteen een kop koffie en praten we de taart door. Kom je
					liever niet langs? Dan kan je een proefdoosje meeneemen naar huis voor €30, en dat bedrag
					halen we er weer af zodra je de taart bestelt. Dit zijn de acht smaken:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Passie witte choco:</strong> vanille witte chocoladecake met een passievruchten-curd
						en witte chocolade ganache.
					</li>
					<li>
						<strong>Red velvet:</strong> red velvet cake met een vulling van cream cheese, oreo en witte
						chocolade drops.
					</li>
					<li>
						<strong>Citroen aardbei:</strong> frisse citroencake gevuld met een vanille-mascarpone crème
						en verse aardbeien.
					</li>
					<li>
						<strong>Vanille bosbes:</strong> vanillecake met bosbessen, gevuld met lemoncurd.
					</li>
					<li>
						<strong>Banaan karamel:</strong> smeuïge bananencake gevuld met een gezouten karamel en pecannoten.
					</li>
					<li>
						<strong>Earl grey sinaasappel:</strong> earl grey cake gevuld met een frisse sinaasappel-mascarpone
						crème.
					</li>
					<li>
						<strong>Kardemom chai:</strong> kruidige kardemomcake gevuld met een chai spiced witte chocolade
						ganache.
					</li>
					<li>
						<strong>Tiramisu:</strong> vanillecake met een koffie-amaretto siroop, gevuld met
						traditionele
						<a href="/blog/tiramisu-bruiloft" class="underline hover:text-foreground"
							>tiramisucrème</a
						>, lange vingers en cacao.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Mooie combinaties of een eigen idee? We denken graag mee.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Wat een bruidstaart kost</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een klassieke bruidstaart maken we helemaal op maat, dus de prijs hangt af van het aantal
					etages, de smaken, de afwerking en de bloemen. Als richtprijs kun je uitgaan van zo'n
					€11,50 per persoon (excl. btw). Het precieze bedrag stemmen we samen af in een belletje,
					op basis van jullie moodboard en wat je voor ogen hebt.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Bezorgen en opbouwen op locatie zit erbij in, in het Gooi, Amsterdam en Utrecht. Verder
					weg rekenen we de reis mee in je offerte. Daarna is de taart van jullie: het aansnijden en
					serveren doen jullie zelf of je locatie. Wil je dat wij wél tussen je gasten door
					serveren? Dat kan met live tiramisu of een burrata bar, die nemen we dan in hetzelfde
					voorstel mee.
				</p>
			</section>

			<BlogReviewTeaser reviews={toetjesReviews} />

			<BlogCta
				event="bruidstaart_klassiek"
				heading="Een klassieke bruidstaart op jullie dag? Stuur ons je datum."
				body="Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een voorstel op maat: een klassieke bruidstaart, een Italiaanse millefoglie, of de taart samen met live hapjes."
				waText="Hoi! Ik heb een vraag over een klassieke bruidstaart van Hangende Hapjes 👋"
			/>

			<BlogFaqSection
				items={faqList}
				intro="Alles wat je je afvraagt over een klassieke bruidstaart, van etages en bloemen tot bezorgen."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
