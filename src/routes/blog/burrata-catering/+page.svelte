<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Picture from '$lib/components/Picture.svelte';
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

	const headline = 'Burrata bar voor jouw feest: live, per gast opgebouwd';
	const title = 'Live Italiaanse burrata catering | Hangende Hapjes';
	const description =
		'Een Italiaanse catering burrata bar huren voor je bruiloft, bedrijfsfeest of borrel? Wij bouwen per gast verse hapjes en snacks op, live tussen je gasten. Bekijk prijzen.';
	const slug = '/blog/burrata-catering';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/images/borrel.jpeg';
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

	const faqList: BlogFaq[] = [
		{
			id: 'burrata-bar',
			question: 'Wat is een burrata bar precies?',
			answer:
				'Een burrata bar is een live cateringconcept waarbij elke gast een eigen burrata-bowl krijgt, opgebouwd rond een verse burrata met toppings en saus naar keuze. Bij ons is de bar mobiel in plaats van een vast station: Met een dienblad om de nek lopen wij tussen jouw gasten door en bouwen elk hapje ter plekke op. Geen rijen, geen lege schalen, en iedereen krijgt een praatje en een verse portie.'
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
				'Heel goed. De burrata-bowl is licht genoeg om als eerste of tweede gang in een walking dinner te dienen, naast warme gerechten van een andere cateraar. Veel evenementen nemen bijvoorbeeld Burrata als voorgerecht, hebben een Pizza/pasta foodtruck voor het hoofdgerecht en daarna kunnen wij nogmaals met een portie tiramisu rondkomen als dessert. Wij werken graag samen met de avondcateraar om timing en allergieën op elkaar af te stemmen.'
		},
		{
			id: 'burrata-houdbaarheid',
			question: 'Blijft burrata wel goed tijdens een feest buiten?',
			answer:
				'Burrata is een vers product en moet gekoeld blijven tot het opmaken. Daar zorgen wij voor: Wij lopen rond met kleine porties recht uit de koeling die binnen 30 minuten geserveerd worden, zie het als een lopend buffet. Daardoor is de burrata altijd op temperatuur en romig, zelfs op een warme zomerdag. Wij nemen onze eigen koeling mee en hebben verder geen apparatuur of stroom nodig.'
		},
		BLOG_FAQS_NL.allergies,
		BLOG_FAQS_NL.leadtime
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
					Een italiaanse catering klassieker op elk evenement
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Zoek jij nog naar een heerlijke italiaanse snack, voorgerecht of hapje voor je bruiloft,
					borrel of bedrijfsfeest? Wij bouwen per gast een verse burrata-bowl op. De BorrelBaas					loopt rond met een dienblad om de nek, schept wat romige straciatella uit Puglia in een
					schaaltje, en bouwt voor jouw gast een heerlijk gerecht met keuze uit verscheidene toppings
					en sauzen. Hartig, betrokken en super lekker, een live burrata bar zonder rijen of vaste
					plek.
				</p>
			</header>

			<section
				class="data-[state=open]:bg-(--brand-magenta)/12 mt-10 rounded-lg bg-(--brand-magenta)/8 p-6 md:p-8"
				aria-labelledby="snel-antwoord"
			>
				<h2 id="snel-antwoord" class="font-heading text-xl tracking-tight md:text-2xl">
					Alles op een rijtje
				</h2>
				<ul class="mt-4 space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg">
					<li>Vers hapje van stracciatella opgebouwd per gast</li>
					<li>50–60 porties per uur per bediende</li>
					<li>2 toppings én een saus naar keuze, Zoet, zout en Vega opties</li>
					<li>Inzetbaar tijdens borrel, feest, receptie, walking dinner of beurs</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat is een Hangend Hapje (burrata) precies?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hangende Hapjes is een live cateringconcept waarbij elke gast een eigen burrata-bowl
					krijgt. Dit hapje is opgebouwd met verse stracciatella (binnenste van een burrata) en
					italiaanse toppings en saus naar keuze. Waar andere cateringbedrijven dit leveren vanaf
					een vaste plek als een buffet met rijen doen wij dat anders.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Bij Hangende Hapjes is de burrata bar mobiel: De BorrelBaas loopt met een
					hangend dienblad tussen jouw gasten door en bouwt elk gerecht op het moment van serveren
					op. Iedereen kiest zijn eigen toppings, krijgt er een praatje bij over de burrata of de
					nduja, en krijgt een vers gemaakt borrelhapje. Geen rijen, hoge kwaliteit, en een perfecte
					portie ook voor walking dinners en zakelijke evenementen.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat zit er in onze burrata-bowl?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een Italiaanse basis met ruimte om te variëren. Iedere gast krijgt dezelfde top-kwaliteit
					Stracciatella uit Puglia (binnenkant burrata) en kiest zelf de combinatie die bij daarbij past. Een portie weegt ongeveer 125 gram
					en staat gelijk aan zo'n 2 á 3 standaard borrelhapjes.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Verse stracciatella</strong>, het romige, slierterige binnenste
						van de burrata scheppen wij in het bakje
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
					<li>
						<strong>Duurzame bakjes en bestek</strong>, gebruiksvriendelijk voor staand eten en ook super geschikt
						voor kinderen of oudere gasten
					</li>
				</ul>
				<figure class="mt-6">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
								src="/images/HH_burrata_Peach.jpeg"
								alt="Burrata-bowl met gegrilde perzik, pistache en hot honey een zoete zomerse topping op verse stracciatella"
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
					<!-- <figcaption class="mt-2 text-sm text-muted-foreground">
						Drie combinaties die we vaak maken: crispy prosciutto met balsamico, gegrilde perzik met
						pistache, en tomatensalsa met pesto.
					</figcaption> -->
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
					<li><strong>vijgen, Nduja en truffelolie</strong> (rijk en feestelijk)</li>
					<li>
						<strong>Tomatensalsa, parmigiano en pesto</strong> (Vegetarisch en klassiek italiaans)
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij sturen vooraf graag een voorstel voor de combinaties op basis van het seizoen en jouw
					gastenmix. Wij kunen maximaal 3 toppings en 3 sauzen tegelijkertiijd voeren in onze bakken.
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
						<strong>Tijdens de borrel of receptie</strong> — tussen ceremonie en diner, of als
						zakelijke borrel op een bedrijfsfeest, in plaats van kaasplankjes en bitterballen.
					</li>
					<li>
						<strong>Als eerste of tweede gang in een walking dinner</strong> — de avondcateraar pakt
						daarna de warme gangen over.
					</li>
					<li>
						<strong>Als midnight snack</strong> — laat op de avond, hartig maar niet zwaar, naast (of
						in plaats van) een puntzak friet.
					</li>
					<li>
						<strong>Hartig én zoet samen</strong> — De Borrel Baas met burrata, De Toetjes Vrouw met
						tiramisu als dessert, los van elkaar getimed.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je weten <a
						href="/blog/hoeveel-hapjes-per-persoon"
						class="underline hover:text-foreground">hoeveel porties je nodig hebt</a
					> voor jouw aantal gasten? Of meer lezen over <a
						href="/blog/tiramisu-bruiloft"
						class="underline hover:text-foreground">tiramisu op je bruiloft</a
					>? We hebben er een aparte blog over.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Qua capaciteit verzorgen we 50–60 porties per uur per bediende; vanaf 100 gasten zetten we
					een tweede bediende in. Op locatie hebben we weinig nodig, een hoekje voor onze koelbox is
					genoeg. Alles is verzorgd en inbegrepen, van burrata en sauzen tot bakjes, servetten en opruimen. Zo
					past het ook prima op buitenlocaties zonder vaste keuken.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Wat een burrata bar kost</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de tabel hieronder zie je de Vanaf prijs (excl. BTW) voor De Borrel Baas - 1 portie = 1 gast.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Porties</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tijd &amp; bezetting</th>
								<th class="py-3 font-heading font-semibold">Prijs</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">50</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3">€450</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">100</td>
								<td class="py-3 pr-4">1 uur, 2 bedienden (of 2 uur, 1)</td>
								<td class="py-3">€700</td>
							</tr>
							<tr>
								<td class="py-3 pr-4">200</td>
								<td class="py-3 pr-4">2 uur, 2 bedienden</td>
								<td class="py-3">€1.200</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50km zit het bij de prijs in. Daarboven rekenen we €0,45
					per kilometer. Wil je burrata en tiramisu samen op één feest? Dan krijg je ongeveer €125
					korting op de gecombineerde vanaf prijs.
				</p>
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
