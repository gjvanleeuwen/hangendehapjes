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
		'Een klassieke bruidstaart op maat? wij bakken botercrèmetaarten in 8 smaken, met afwerking naar keuze. Proeven zit bij de prijs in.';
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

	// No classic-cake review yet, so no aggregateRating on this product (borrowing the
	// tiramisu rating would be misleading). The summary card shows the business-wide
	// score with short snippets of all reviews and links through.

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
		}
	};

	const faqList: BlogFaq[] = [
		{
			id: 'bruidstaart-aantal-etages',
			question: 'Hoeveel etages heb ik nodig voor mijn aantal gasten?',
			answer:
				'We maken klassieke bruidstaarten vanaf 25 personen. Onder de 50 gasten worden dat vaak twee etages, vanaf 50 personen kan het ook in drie. We passen de breedte en hoogte van de lagen aan op basis van het aantal personen. In ons gesprek bespreken we altijd even de wensen van hoe groot jullie de taart willen hebben. Voor elke laag kan je een andere smaak kiezen.'
		},
		{
			id: 'bruidstaart-proeven',
			question: 'Kunnen we de bruidstaart eerst proeven?',
			answer:
				'Ja, dat hoort erbij. Je proeft alle acht smaken, zodat jullie per laag kunnen kiezen. Bestel je daarna de taart, dan zit de proeverij bij de prijs in. Zie je ervan af, dan rekenen we €35.'
		},
		{
			id: 'bruidstaart-bloemen',
			question: 'Kunnen er verse bloemen op de bruidstaart?',
			answer:
				'Ja, verse bloemen passen heel mooi bij een klassieke bruidstaart. We stemmen de kleuren af op jullie boeket, styling of moodboard. Heb je een eigen bloemist? Dan werken we graag met dezelfde bloemen of kleuren, zodat de taart mooi aansluit op de rest van de dag. Liever zonder bloemen, of met een topper met jullie namen. Dat kan ook!'
		},
		{
			id: 'bruidstaart-hoog-stevig',
			question: 'Blijft een bruidstaart wel stevig staan, ook buiten?',
			answer:
				'Ja. Een klassieke bruidstaart bouwen we op met een stevige interne constructie, zodat de etages elkaar dragen en de taart strak blijft staan. Charlotte heeft veel patisserie-ervaring en bakte al talloze taarten zelfs met een buitentemperatuur van 40 graden. We zetten de taart op locatie in elkaar in plaats van hem heel te vervoeren, dus hij komt altijd recht aan. Op een warme trouwdag hebben we alleen een koel hoekje nodig om hem op te bouwen.'
		},
		{
			id: 'bruidstaart-bezorgen',
			question: 'Bezorgen jullie de taart, of moeten we hem ophalen?',
			answer:
				'Wij bezorgen de taart en zetten hem op locatie in elkaar, zodat hij daar in de koeling kan tot het taartmoment. Het bezorgen zit bij de prijs in, in het Gooi, Amsterdam en Utrecht. Daar voorbij rekenen we reiskosten voor de extra kilometers. Het aansnijden en serveren doen jullie zelf of je locatie. Wil je liever dat wij tussen je gasten door serveren? Kijk dan naar onze millefoglie of live tiramisu, of vraag ernaar in je aanvraag.'
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
					Een klassieke hoge bruidstaart, maar dan precies zoals jullie in gedachten hebben. Charlotte bakt hem op maat:
					elke laag in de smaak die jullie kiezen, botercrème in jullie kleur en een afwerking die
					past bij de bloemen, de jurk of de styling. We laten niks te wensen over.
				</p>
			</header>

			<BlogSummary reviews={nl.reviews.items} quotes={2}>
				<li>
					<strong>Op maat:</strong> in een online videogesprek bespreken we jullie wensen, daarna
					bakt Charlotte de taart in jullie kleur en stijl.
				</li>
				<li>
					<strong>8 smaken:</strong> per laag te kiezen. Proeven zit erbij als je bestelt, anders €35.
				</li>
				<li>
					<strong>Formaat:</strong> vanaf 25 personen in twee etages, vanaf 50 personen ook in drie.
				</li>
				<li>
					<strong>Prijs:</strong> richtprijs €11,50 per persoon, excl. btw. Bezorgen en opbouwen op
					locatie zijn inbegrepen.
				</li>
			</BlogSummary>

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
				<figcaption class="px-4 py-3 text-sm text-muted-foreground">
					Deze bruidstaart was voor 140 personen.
				</figcaption>
			</figure>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Zo verloopt het proces van een custom bruidstaart
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Zodra we jullie aanvraag binnenkrijgen plannen we snel een online (video)gesprek in.
					We bespreken jullie ideeen voor de dag en de taart, het thema, de andere styling en komen tot een wensenlijst voor de bruidstaart.
					Met wat extra inspiratiefoto's of een moodboard maakt Charlotte dan een plan en offerte.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Dit kan je allemaal kiezen en bepalen:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>De smaak van elke laag:</strong> Afhankelijk van de grootte kan je zo soms wel 4 smaken aan je gasten serveren.
						Van klassiek met rood fruit of chocolade tot gezouten karamel en thee.
					</li>
					<li>
						<strong>De afwerking:</strong> botercrème in elke kleur die je wilt, strak afgesmeerd of juist
						rustiek, opgespoten of naked. Jij bepaalt de look.
					</li>
					<li>
						<strong>De details:</strong> verse bloemen, vers fruit, parels, een pipingtechniek
						of een topper met speciale betekenis. Het wordt helemaal zoals je bedacht hebt.
					</li>
					<li>
						<strong>Het formaat:</strong> vanaf 25 personen maken we twee etages, vanaf 50 personen kan
						het ook in drie. Hoeveel porties erin zitten, hangt af van hoe breed de etages zijn en wij zullen je helpen met het bepalen van de juiste grootte.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Charlotte bakt de taart in lagen en zet hem op locatie in elkaar, zodat hij recht en strak
					klaarstaat voor het aansnijmoment. Kort voor de bruiloft hebben we altijd nog even contact
					om de bezorging en de laatste dingen kort te sluiten.
				</p>
				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<figure class="overflow-hidden rounded-xl bg-muted">
						<div class="aspect-3/4">
							<Picture
								src="/images/bruidstaart_bloemen.jpeg"
								alt="Klassieke bruidstaart van drie etages in witte botercrème met kleurrijke verse bloemen"
								sizes="(min-width: 768px) 376px, (min-width: 640px) 50vw, 100vw"
								loading="lazy"
								class="size-full object-cover"
							/>
						</div>
						<figcaption class="px-4 py-3 text-sm text-muted-foreground">
							Voor 50 personen.
						</figcaption>
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
						<figcaption class="px-4 py-3 text-sm text-muted-foreground">
							Voor 75 personen.
						</figcaption>
					</figure>
				</div>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Eerst proeven</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Welke smaak wordt het? Dat kies je het makkelijkst door te proeven. Je proeft alle acht
					smaken, zodat jullie per laag kunnen kiezen. Bestel je daarna de taart, dan zit de
					proeverij bij de prijs in. Zie je ervan af, dan rekenen we €35. Dit zijn de acht smaken:
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

			<BlogOtherCakes ids={['tiramisutaart', 'italiaans']} event="bruidstaart_klassiek">
				Liever iets anders? Wij maken ook een tiramisutaart en een Italiaanse millefoglie. Echte showstoppers die
				we ter plekke opbouwen.
			</BlogOtherCakes>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Wat een bruidstaart kost</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een klassieke bruidstaart maken we helemaal op maat, dus de prijs hangt af van het aantal
					etages, de afwerking, de bloemen en andere extra's die jullie kiezen. Als richtprijs kun je uitgaan van zo'n
					€11,50 per persoon (excl. btw). Je krijgt altijd een offerte op maat,
					op basis van jullie moodboard en ons gesprek. Dit kan ook lager uitvallen.
				</p>
				<div class="rounded-xl border border-border px-5 py-4">
					<h3 class="font-heading text-lg tracking-tight">Klassieke bruidstaart</h3>
					<div class="mt-2 flex items-baseline justify-between gap-3 text-sm">
						<span class="text-muted-foreground">Richtprijs, excl. btw</span>
						<span class="font-medium text-foreground">€11,50 per persoon</span>
					</div>
					<p class="mt-3 text-xs leading-relaxed text-muted-foreground">
						Bezorgen en opbouwen op locatie zijn inbegrpen. Het serveren wordt gedaan door de locatie.
					</p>
					<p class="mt-2 text-xs leading-relaxed text-muted-foreground">
						Reiskosten zijn inbegrepen tot ~30km rondom Hilversum (Het Gooi, Amersfoort, Amsterdam en
						Utrecht). Hierbuiten brengen wij reiskosten in rekening voor de extra kilometers.
					</p>
				</div>
			</section>

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
