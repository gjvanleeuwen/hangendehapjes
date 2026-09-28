<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import { jsonLdScript, aggregateRatingJsonLd } from '$lib/seo';
	import BlogSummary from '$lib/blog/BlogSummary.svelte';
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

	const headline = 'Burrata bar voor jouw feest: live, per gast opgebouwd';
	const title = 'Burrata bar huren voor feest, borrel of bruiloft | Hangende Hapjes';
	const description =
		'Een burrata bar huren voor je bruiloft, bedrijfsfeest of borrel? Wij bouwen per gast een verse burrata-bowl op, live tussen je gasten. Bekijk toppings, timing en prijzen.';
	const slug = '/blog/burrata-catering';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/og-blog-burrata-catering.jpg';
	const serviceId = SITE_URL + '/#service-borrel';

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
		publisher: { '@id': SITE_URL + '/#localbusiness' },
		about: { '@id': serviceId },
		mentions: [{ '@id': serviceId }]
	};

	// Canonical commercial page for the burrata service. The full reviews live on the
	// homepage; here we only surface the aggregate score + count (matching the compact
	// teaser below) and link through, so the page stays light and policy-compliant.
	const borrelReviews = nl.reviews.items.filter((review) => review.productId === 'borrel');

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': ['Service', 'Product'],
		'@id': serviceId,
		name: 'Live burrata bar catering',
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
		},
		...aggregateRatingJsonLd(borrelReviews)
	};

	const faqList: BlogFaq[] = [
		{
			id: 'burrata-bar',
			question: 'Wat is een burrata bar precies?',
			answer:
				'Een burrata bar is een live cateringconcept waarbij elke gast een eigen burrata-bowl krijgt, opgebouwd rond stracciatella met toppings en saus naar keuze. Bij ons is de bar mobiel in plaats van een vast station: met een dienblad om de nek lopen wij tussen jouw gasten door en bouwen elk hapje ter plekke op. Geen rijen, geen lege schalen, en iedereen krijgt een praatje en een verse portie.'
		},
		{
			id: 'burrata-bar-events',
			question: 'Voor welke feesten kun je een burrata bar boeken?',
			answer:
				'Een burrata bar werkt op vrijwel elk feest: bruiloften, bedrijfsfeesten en zakelijke borrels, verjaardagen en jubilea, recepties en zomerse tuinfeesten. Omdat wij lopend serveren met een dienblad om de nek heb je geen vaste plek of keuken nodig, alleen een hoekje voor onze koelbox. Vanaf 50 porties komen we langs, vanuit Hilversum door heel Nederland.'
		},
		{
			id: 'burrata-vs-mozzarella',
			question: 'Wat is het verschil tussen burrata en mozzarella?',
			answer:
				'Burrata ziet er aan de buitenkant uit als mozzarella, maar binnenin zit een romige vulling van stracciatella (slierten verse mozzarella met room). Mozzarella is door en door stevig en mild, burrata is romig met een rijkere, botterige smaak. De romigheid van burrata leent het perfect voor dippers, toppings en sauzen en eet makkelijker, perfect dus voor jouw feest.'
		},
		{
			id: 'burrata-glutenvrij-vega',
			question: 'Kan de burrata-bowl ook glutenvrij of zonder vlees?',
			answer:
				'Ja. De bowl is in basis vegetarisch, alleen de crispy prosciutto en de spicy nduja zijn vlees, en die laten we makkelijk weg of vervangen door bijvoorbeeld gegrilde perzik, vijgen of pistache. Ook kunnen we de porties zonder toastjes aanbieden als glutenvrije optie. Geef je voorkeuren door in je aanvraag, dan stemmen we het menu daarop af.'
		},
		{
			id: 'burrata-walking-dinner',
			question: 'Past burrata in een walking dinner of samen met foodtrucks?',
			answer:
				'Heel goed. De burrata-bowl is licht genoeg om als eerste of tweede gang in een walking dinner te dienen, naast warme gerechten van een andere cateraar. Veel evenementen nemen bijvoorbeeld burrata als voorgerecht, hebben een pizza- of pastafoodtruck voor het hoofdgerecht en daarna kunnen wij nogmaals met een portie tiramisu rondkomen als dessert. Wij werken graag samen met de avondcateraar om timing en allergieën op elkaar af te stemmen.'
		},
		{
			id: 'burrata-houdbaarheid',
			question: 'Blijft burrata wel goed tijdens een feest buiten?',
			answer:
				'Burrata is een vers product en moet gekoeld blijven tot het opmaken. Daar zorgen wij voor: we lopen rond met kleine porties recht uit de koeling die binnen 30 minuten geserveerd worden. Daardoor is de burrata altijd op temperatuur en romig, zelfs op een warme zomerdag. Wij nemen onze eigen koeling mee en hebben verder geen apparatuur of stroom nodig.'
		},
		BLOG_FAQS_NL.allergies,
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
					Een Italiaanse cateringklassieker op elk evenement
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Zoek je een hartig hapje voor je bruiloft, borrel of bedrijfsfeest? Wij bouwen per gast
					een verse burrata-bowl op. We lopen rond met een dienblad om de nek, scheppen romige
					stracciatella uit Puglia in een schaaltje en maken het af met toppings en saus naar keuze.
					Hartig, persoonlijk en makkelijk te eten: een live burrata bar zonder rij of vaste plek.
				</p>
			</header>

			<BlogSummary reviews={borrelReviews}>
				<li>
					<strong>Live hapje:</strong> verse stracciatella, per gast opgebouwd, vanaf €450 voor 50 gasten.
				</li>
				<li><strong>Keuze:</strong> 2 toppings en 1 saus, met vlees of vegetarisch.</li>
				<li><strong>Dieetwensen:</strong> vegetarisch of glutenvrij kan ook.</li>
				<li>
					<strong>Inbegrepen:</strong> bakjes, servetten en opruimen. Reiskosten tot ~30km rondom Hilversum.
				</li>
			</BlogSummary>

			<figure class="mt-10 overflow-hidden rounded-xl bg-muted">
				<div class="aspect-3/2">
					<Picture
						src="/images/burrata_closeup.jpeg"
						alt="Een verse burrata-bowl wordt live opgebouwd met toppings en saus tussen de gasten"
						sizes="(min-width: 768px) 768px, 100vw"
						loading="lazy"
						class="size-full object-cover"
					/>
				</div>
			</figure>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat is een Hangend Hapje (burrata) precies?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hangende Hapjes is een live cateringconcept waarbij elke gast een eigen burrata-bowl
					krijgt. Die bowl maken we met verse stracciatella, het romige binnenste van burrata, en
					Italiaanse toppings en saus naar keuze. Geen vaste plek of buffettafel: wij lopen ermee
					tussen je gasten door.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					We lopen met een hangend dienblad tussen jouw gasten door en bouwen elk gerecht op het
					moment van serveren op. Iedereen kiest zijn eigen toppings, krijgt er een praatje bij over
					de burrata of de nduja, en krijgt een vers gemaakt borrelhapje. Geen rijen, geen lege
					schalen, en een portie die ook goed past bij walking dinners en zakelijke evenementen.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat zit er in onze burrata-bowl?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een Italiaanse basis met ruimte om te variëren. Iedere gast krijgt dezelfde topkwaliteit
					stracciatella uit Puglia en kiest zelf de combinatie die daarbij past. Een portie weegt
					ongeveer 125 gram en staat gelijk aan zo'n 2 à 3 standaard borrelhapjes.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Verse stracciatella</strong>, het romige, slierterige binnenste van burrata,
						geschept in een bakje
					</li>
					<li>
						<strong>Scrocchi-toastjes</strong>, knapperige Italiaanse cracker om mee te dippen
					</li>
					<li>
						<strong>2 toppings naar keuze</strong>: crispy prosciutto, tomatensalsa, pijnboompitten,
						vijgen, gegrilde perzik, spicy nduja, pistachenoten of parmigiano flakes
					</li>
					<li>
						<strong>1 saus naar keuze</strong>: olijfolie, balsamico, truffelolie, pesto of spicy
						honey
					</li>
				</ul>
				<figure class="mt-6">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="aspect-3/4 overflow-hidden rounded-lg bg-muted">
							<Picture
								src="/images/HH_burrata_Parma.jpeg"
								alt="Burrata-bowl met crispy prosciutto, pijnboompitten en balsamico, vastgehouden tijdens een live burrata bar"
								sizes="(min-width: 640px) 240px, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
						<div class="aspect-3/4 overflow-hidden rounded-lg bg-muted">
							<Picture
								src="/images/HH_burrata_T.jpeg"
								alt="Vegetarische burrata-bowl met tomatensalsa, parmigiano en pesto in een duurzaam bakje"
								sizes="(min-width: 640px) 240px, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
					</div>
				</figure>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Smaakprofielen die we vaak terugzien:
				</p>
				<ul
					class="mt-1 grid list-inside list-disc gap-x-6 gap-y-1 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 md:text-base"
				>
					<li><strong>crispy prosciutto, pijnboompitten en balsamico</strong> (klassiek hartig)</li>
					<li>
						<strong>gegrilde perzik, pistache en spicy honey</strong> (zomers en een tikje zoet)
					</li>
					<li><strong>vijgen, nduja en truffelolie</strong> (rijk en feestelijk)</li>
					<li>
						<strong>tomatensalsa, parmigiano en pesto</strong> (vegetarisch en klassiek Italiaans)
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij sturen vooraf graag een voorstel voor de combinaties op basis van het seizoen en jouw
					gastenmix. We kunnen maximaal 3 toppings en 3 sauzen tegelijk meenemen in onze bakken.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wanneer en waar past een burrata bar?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Vier momenten waarop een live burrata bar écht werkt:
				</p>
				<ul
					class="ml-6 list-disc space-y-1.5 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Tijdens de borrel of receptie:</strong> tussen ceremonie en diner, of als zakelijke
						borrel op een bedrijfsfeest, in plaats van kaasplankjes en bitterballen.
					</li>
					<li>
						<strong>Als eerste of tweede gang in een walking dinner:</strong> de avondcateraar pakt daarna
						de warme gangen over.
					</li>
					<li>
						<strong>Als midnight snack:</strong> laat op de avond, hartig maar niet zwaar, naast (of in
						plaats van) een puntzak friet.
					</li>
					<li>
						<strong>Hartig én zoet samen:</strong> burrata bij de borrel, tiramisu als dessert, los van
						elkaar getimed.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je weten <a
						href="/blog/hoeveel-hapjes-per-persoon"
						class="underline hover:text-foreground">hoeveel porties je nodig hebt</a
					>
					voor jouw aantal gasten? Of meer lezen over
					<a href="/blog/tiramisu-bruiloft" class="underline hover:text-foreground"
						>tiramisu op je bruiloft</a
					>? We hebben er een aparte blog over. Zit je feest in de buurt? Lees dan ook over onze
					<a href="/catering/hilversum" class="underline hover:text-foreground"
						>catering in Hilversum</a
					> en het Gooi.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Qua capaciteit verzorgen we 50–60 porties per uur per bediende; vanaf 100 gasten zetten we
					een tweede bediende in. Op locatie hebben we weinig nodig, een hoekje voor onze koelbox is
					genoeg. Alles is verzorgd en inbegrepen, van burrata en sauzen tot bakjes, servetten en
					opruimen. Zo past het ook prima op buitenlocaties zonder vaste keuken.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Wat een burrata bar kost</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Dit zijn pakketprijzen, excl. btw, waarbij 1 portie 1 gast is. Bezorgen, opbouwen op
					locatie, servetten en dieetwensen zijn altijd inbegrepen.
				</p>
				<div class="rounded-xl border border-border px-5 py-4">
					<h3 class="font-heading text-lg tracking-tight">Live burrata bar</h3>
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
								<td class="py-2 text-right font-medium text-foreground">€450</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-2 pr-3">
									<span class="text-foreground">100 gasten</span>
									<span class="block text-xs">1 uur met 2, of 2 uur met 1</span>
								</td>
								<td class="py-2 text-right font-medium text-foreground">€700</td>
							</tr>
							<tr>
								<td class="py-2 pr-3">
									<span class="text-foreground">200 gasten</span>
									<span class="block text-xs">2 uur, 2 personen</span>
								</td>
								<td class="py-2 text-right font-medium text-foreground">€1.200</td>
							</tr>
						</tbody>
					</table>
					<p class="mt-3 text-xs leading-relaxed text-muted-foreground">
						Bij de hangende hapjes verzorgen we niet alleen het uitserveren, maar ontzorgen we jullie
						en de locatie volledig. Stevige, duurzame bakjes, bestek en servetten zijn inbegrepen, zo
						is het makkelijk eten, ook voor kinderen en oudere gasten.
					</p>
					<p class="mt-2 text-xs leading-relaxed text-muted-foreground">
						Reiskosten zijn inbegrepen tot ~30km rondom Hilversum (Het Gooi, Amersfoort, Amsterdam
						en Utrecht). Hierbuiten brengen wij reiskosten in rekening voor de extra kilometers.
					</p>
					<p class="mt-2 text-xs leading-relaxed text-muted-foreground">
						Wil je burrata en tiramisu samen op één feest? Dan krijg je ongeveer €125 korting op de
						gecombineerde vanafprijs.
					</p>
				</div>
			</section>

			<BlogCta
				event="burrata"
				heading="Burrata op jouw feest? Stuur ons je datum."
				body="Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een voorstel op maat: alleen burrata, alleen tiramisu, of beide."
				waText="Hoi! Ik heb een vraag over een burrata bar 👋"
			/>

			<BlogFaqSection
				items={faqList}
				intro="Alles wat je je afvraagt over een live burrata bar op je feest, bruiloft of borrel."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
