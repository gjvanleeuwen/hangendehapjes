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

	const headline = 'Burrata op je bruiloft: live geserveerd, italiaanse catering';
	const title = 'Burrata op je bruiloft: live geserveerd | Hangende Hapjes';
	const description =
		'Burrata op je bruiloft? Wij maken per gast een verse burrata-bowl met stracciatella, scrocchi en toppings naar keuze. Live, ter plekke, tussen jullie gasten.';
	const slug = '/blog/burrata-bruiloft';
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
			question: 'Wat is een burrata bar op een bruiloft?',
			answer:
				'Een burrata bar is een live cateringconcept waarbij elke gast een eigen burrata-bowl krijgt, opgebouwd rond een verse burrata met toppings en saus naar keuze. Bij ons is de bar mobiel in plaats van een vast station: Gijs loopt met een dienblad om de nek tussen jouw gasten door en bouwt elke bowl ter plekke op. Geen rijen, geen lege schalen, en iedereen krijgt een praatje en een verse portie.'
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
			question: 'Past burrata in een walking dinnero of samen met foodtrucks?',
			answer:
				'Heel goed. De burrata-bowl is licht genoeg om als eerste of tweede gang in een walking dinner te dienen, naast warme gerechten van een andere cateraar. Veel hosts zetten ons in tussen de ceremonie en het diner of bijvoorbeeld samen met een Pizza foodtruck. Wij werken graag samen met de avondcateraar om timing en allergieën op elkaar af te stemmen.'
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
					Een italiaanse klassieker op jouw bruiloft
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Zoek jij nog naar een heerlijke italiaanse snack, voorgerecht of hapje voor op je bruiloft?
					Wij bouwen per gast een verse burrata-bowl op. De BorrelBaas (Gijs) loopt rond met een dienblad om de nek,
					schept wat romige straciatella uit Puglia in een
					schaaltje, en bouwt voor jouw gast een heerlijk gerecht met keuze uit verscheidene toppings en sauzen. Hartig,
					theatraal en super lekker, een live burrata bar zonder rijen of vaste plek.
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
					<li>Verse burrata-bowl per gast, ter plekke opgemaakt</li>
					<li>50–60 porties per uur per bediende</li>
					<li>2 toppings én een saus naar keuze, Zout, zout en Vega opties</li>
					<li>Inzetbaar tijdens borrel, receptie, walking dinner of als midnight snack</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat is een burrata bar op een bruiloft?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een burrata bar is een live cateringconcept waarbij elke gast een eigen burrata-bowl
					krijgt, opgebouwd rond een verse burrata met toppings en saus naar keuze. Op de meeste
					bruiloften staat zo'n bar op een vaste plek met schalen vol toppings en een rij gasten
					die hun bord vullen. Leuk, maar er ontstaan rijen, de toppings drogen uit, en de
					interactie blijft beperkt.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij doen het anders. Bij Hangende Hapjes is de burrata bar mobiel: Gijs loopt met een
					hangend dienblad tussen jouw gasten door en bouwt elk gerecht op het moment van serveren
					op. Iedereen kiest zijn eigen toppings, krijgt er een praatje bij over de burrata of de
					nduja, en pakt een vers gevulde schaal aan. Geen rijen, hoge kwaliteit, en geen
					schotelgeld op locatie.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat zit er in onze burrata-bowl?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een Italiaanse basis met ruimte om te variëren. Iedere gast krijgt dezelfde top-kwaliteit
					Stracciatella uit Puglia (binnenkant burrata) en kiest zelf de combinatie die bij daarbij past. Een portie weegt ongeveer 150 gram
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
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Smaakprofielen die we vaak terugzien: crispy prosciutto + balsamico (klassiek hartig),
					gegrilde perzik + spicy honey (zomer, een tikje zoet), vijgen + truffelolie (rijk en
					feestelijk), pistache + olijfolie (puur en vegetarisch). Wij sturen vooraf graag een
					voorstel voor de combinaties op basis van het seizoen en jouw gastenmix. Wij kunen maximaal 3 toppings en 3 sauzen tegelijkertiijd voeren in onze bakken.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wanneer past burrata op je bruiloft?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Vier momenten waarop een live burrata bar écht werkt:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Tijdens de borrel of receptie</strong> - tussen ceremonie en diner, in plaats
						van de standaard kaasplankjes en bitterballen. Hartig, romig en feestelijk, en je
						gasten hebben meteen iets in handen.
					</li>
					<li>
						<strong>Als eerste of tweede gang in een walking dinner</strong> — Gijs loopt 1 á 1,5
						uur rond, iedereen heeft zijn portie burrata gehad, en de avondcateraar pakt het
						daarna over voor de warme gangen. Wij stemmen graag af met andere cateraars.
					</li>
					<li>
						<strong>Als midnight snack</strong> — laat op de avond en tussen de feestgangers, een
						hartige snack die niet zwaar is en gasten weer op gang trekt. Een romige bowl burrata
						werkt daar verrassend goed, naast (of in plaats van) een puntzak friet.
					</li>
					<li>
						<strong>Hartig én zoet samen</strong> — De Borrel Baas tijdens de borrel, De Toetjes
						Vrouw met Tiramisu als dessert. Een perfecte combi voor grotere groepen of italiaanse thema evenementen, beide concepten op één
						feest, los van elkaar getimed.
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Past burrata in jullie tijdsblok?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij verzorgen ongeveer 50–60 porties per uur per bediende. Bij meer dan 100 gasten raden
					we een tweede bediende aan, zodat iedereen binnen het tijdsblok aan de beurt komt zonder
					dat het gehaast voelt. Voor 200 personen werken we standaard met twee bedienden over
					twee uur, dan blijft er per gast nog steeds tijd voor het opbouwmoment en een praatje.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Op locatie hebben we weinig nodig: een klein hoekje voor onze koelbox is eigenlijk het enige.
					Mocht er wel een stopcontact of waterkraan aanwezig zijn is dat perfect, verder regelen we alles zelf.
					Alles is verzorgd inclusief de burrata, toppings, sauzen,
					bakjes, lepels, servetten en het opruimen. Zo past dit bijvoorbeeld goed op buitenlocaties en andere evenementen zonder vaste keuken.
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
								<td class="py-3">€1.225</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50 km zit het bij de prijs in. Daarboven rekenen we €0,45
					per kilometer. Wil je burrata en tiramisu samen op één feest? Dan rekenen we ongeveer
					€80 extra voor de extra voorbereiding van het tweede item.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Hartig én zoet combineren
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Veel hosts boeken De Borrel Baas voor de receptie en De Toetjes Vrouw voor het
					dessertmoment. Zo serveren we hartig én zoet, op twee aparte momenten in de avond, met
					steeds een live opbouwmoment per gast. Voor groepen vanaf 100 personen is dat ook qua
					capaciteit fijn. Ons concept staat zo gelijk aan zo'n 300 traditionele borrelhapjes per uur, maar met veel
					meer beleving.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je weten <a
						href="/blog/hoeveel-hapjes-per-persoon"
						class="underline hover:text-foreground">hoeveel porties je nodig hebt</a
					> voor jouw aantal gasten? Of meer lezen over <a
						href="/blog/tiramisu-bruiloft"
						class="underline hover:text-foreground">tiramisu op je bruiloft</a
					>? We hebben er een aparte blog over.
				</p>
			</section>

			<BlogFaqSection items={faqList} />

			<section class="mt-14 rounded-lg border border-border p-6 md:p-8">
				<h2 class="font-heading text-xl tracking-tight md:text-2xl">
					Burrata op jouw bruiloft? Stuur ons je datum.
				</h2>
				<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
					Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een
					voorstel op maat: alleen burrata, alleen tiramisu, of beide.
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
