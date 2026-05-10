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

	const headline = 'Tiramisu op je bruiloft: live geserveerd, ter plekke opgebouwd';
	const title = 'Tiramisu op je bruiloft: live geserveerd | Hangende Hapjes';
	const description =
		"Tiramisu op je bruiloft? Wij bouwen per gast een verse portie op met mascarpone, espresso uit de mokapot en lange vingers. Een live moment, een praatje, een verhaal.";
	const slug = '/blog/tiramisu-bruiloft';
	const canonical = SITE_URL + slug;
	const ogImage = SITE_URL + '/images/07.jpeg';
	const serviceId = SITE_URL + '/#service-toetjes';

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
			id: 'tiramisu-toren',
			question: 'Kunnen jullie ook een tiramisu toren leveren voor op een bruiloft?',
			answer:
				'Wij maken heerlijke tiramisu en als je die graag serveert vanaf een toren is dat zeker mogelijk. De glazen met tiramisu worden op locatie gemaakt zodat de kwaliteit goed blijft en gasten ook kunnen komen kijken als jullie dit leuk vinden. Voor de kosten kan je uitgaan van onze standaard prijzen (vanaf €425 voor 50 personen) met een kleine meerprijs voor het huren en schoonmaken van het glaswerk.'
		},
		{
			id: 'tiramisu-taart',
			question: 'Maken jullie ook een tiramisu taart of Italiaanse bruidstaart?',
			answer:
				'Ja, dat doen we. Charlotte heeft veel patisserie ervaring en al vele bruidstaarten verzorgt voor vrienden en klanten en het is altijd een succes. Zelf hadden wij een italiaanse mille-feuille als bruidstaart maar ook één grote tiramisu in showformaat zouden wij iedereen aanraden. Ook de echte hoge bruidstaart kunnen wij maken met een tiramisu smaak en vulling, een echte aanrader. Laat ons via het contactformulier weten wat je graag zou willen dan sturen wij een voorstel, ook kan je alles vooraf komen proeven of een proefdoosje voor de bruidstaart mee naar huisnemen.'
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
				'Ja. Mascarpone, eieren, lange vingers, suiker, espresso en cacao. Geen vlees of vis. De eieren zijn gepasteuriseerd, dus de tiramisu is ook veilig voor zwangere gasten en kinderen. Helaas is het aanbieden van een Vegan optie voor ons niet mogelijk.'
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
					Tiramisu &amp; trouwen, een top combinatie
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					{headline}
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Tiramisu op je bruiloft, met hangende hapjes maken je er echt een moment van. Vanaf een hangend
				    dienblad krijgt elke gast een eigen vers gemaakte tiramisu.
					Wij maken onze tiramisu met Traditionele mascarpone-crème, Koffie uit de mokapot, Amaretto likeur, lange vingers en cacao.
					Met een praatje en een glimlach, geniet elke gast zo van het dessert, de midnight snack, taartmoment of waar jij denkt dat de Tiramisu het beste zou passen.
					Toch liever een Tiramisu taart om zelf aan te snijden of een toren voor gasten om zelf uit te pakken, ook dan ben je aan het juiste adres.
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
					<li>Verse tiramisu voor elke gast </li>
					<li>50–60 porties per uur als hangend hapje</li>
					<li>Ook als taart of toren te bestellen</li>
					<li>Maak van jouw dessert of taartmoment een extra feestje</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu als live catering op je bruiloft
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
				    Ga voor iets unieks en laat Charlotte of Gijs rondlopen met verse tiramisu voor elke gast.
					Een Authentiek recept tot in de puntjes verfijnd wat wordt opgebouwd met live entertainment.
					In plaats van een toren of schaal met oude tiramisu kan iedere gast genieten van een eigen verse portie, en zelf de keuze maken voor met of zonder alcohol.
					Buiten een lekker gerecht krijgen ze er ook een glimlach en een leuke herinnering bij.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						Iedere portie wordt op het moment zelf opgebouwd. Top kwaliteit voor de eerst tot de laatste gast.
					</li>
					<li>
						Een glimlach en praatje met elke gast zorgt voor die extra herinnering aan jullie speciale dag. Ook kunnen we hiermee
						makkelijk wisselen tussen alcoholvrij en met likeur om ook de jongste op de bruiloft een lekker toetje te bieden.
					</li>
					<li>
					    Zelf hadden wij op onze bruiloft een ijsbar, na een zittend diner was dit echt perfect om nog even een praatje te maken en
						en de after-dinner dip over te slaan. Maar ook als taartmoment creer je sfeer en een vrij gevoel voor het start van het feest of receptie zonder rijen en schotelgeld.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
				        Zijn er vragen over ons recept van de gasten of wordt er een grapje gemaakt? We gaan er graag in mee en praten met liefde over de tiramisu.
						Toetjesfanaat of niet, we halen ze allemal over om lekker te proeven.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een tiramisu taart, toren of een Italiaanse bruidstaart? Ook dan kunnen wij helpen, zie de
					veelgestelde vragen onder aan deze pagina.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Hoe wij de tiramisu maken</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het recept is klassiek-Italiaans. Tiramisu hoort als tiramisu te smaken, en daar
					houden we ons aan. De basis ligt vast, de afwerking kiezen jouw gasten ter plekke.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Echte mascarpone</strong> crème, geen slagroom
					</li>
					<li>
						De crème wordt luchtig door met suiker opgeklopt (gepasteuriseerde) eieren toe te voegen.
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
						<strong>Amaretto</strong> voor het Italiaanse randje. Liever zonder alcohol? Dan
						gebruiken we een alcoholvrije amaretto, met dezelfde smaak.
					</li>
					<li>
						<strong>Cacao</strong> op het einde gestrooid, zoveel als je wilt.
					</li>
					<li>
						Hoog kwaliteit en duurzame bakjes, lepels en servetten. Ook voor kinderen en ouderen is hiermee eten gemakkelijk.
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Past tiramisu in jullie tijdsblok?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij verzorgen ongeveer 50–60 porties per uur per bediende. Daarom raden we aan om met meer dan 100 personen te vragen voor een extra bediende.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voor veel momenten tijdens een bruiloft is een tijdsbestek voor serveren van 1-2 uur eigenlijk perfect.
					Gasten komen vaak in golven en zo kan iedereen een eigen moment bepalen om een tiramisu te nemen.
				    We hebben weinig nodig op locatie: een klein hoekje
					voor de koelelementen, een stopcontact en een waterkraan. Verder regelen we alles
					zelf, van bakjes tot servetten.
					Heb je toch een krapper moment en wil je wel Tiramisu? Kijk dan naar de optie om het te serveren als grote taart of vanuit glazen die wij terplekke opmaken maar gasten kunnen ophalen.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat tiramisu op je bruiloft kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					In de tabel hieronder zie je de prijzen (excl. BTW) voor De Toetjes Vrouw op de drie
					standaardgroottes; 1 portie = 1 gast.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<thead>
							<tr class="border-b border-border text-left">
								<th class="py-3 pr-4 font-heading font-semibold">Porties</th>
								<th class="py-3 pr-4 font-heading font-semibold">Tijd &amp; bezetting</th>
								<th class="py-3 font-heading font-semibold">Prijs (vanaf)</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">50</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3">€425</td>
							</tr>
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">100</td>
								<td class="py-3 pr-4">1 uur, 2 bedienden (of 2 uur, 1)</td>
								<td class="py-3">€650</td>
							</tr>
							<tr>
								<td class="py-3 pr-4">200</td>
								<td class="py-3 pr-4">2 uur, 2 bedienden</td>
								<td class="py-3">€1.125</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: vanaf Hilversum tot 50 km zit het bij de prijs in. Daarboven rekenen we
					€0,45 per kilometer.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Tip van hangende hapjes: Denk aan tiramisu (of de Burrata Borrel baas) als midnight snack.
					Dansend tussen de menigte voeden we de gasten die nog net een beetje extra energie nodig hebben.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wanneer past tiramisu op je bruiloft
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Drie momenten waarop het écht werkt:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Als dessertmoment of tijdens een Walking dinner</strong> Een verse tiramisu, per gast opgebouwd, maakt
						het dessert tot een hoogtepunt van de avond.
					</li>
					<li>
						<strong>Als midnight snack.</strong> Laat op de avond, na een lang diner, een ronde
						verse tiramisu. Koffie en zoet in één hapje.
					</li>
					<li>
						<strong>Als taartmoment (Receptie of feest)</strong> Of je nu graag de taart net na je ceremonie of later op de avond plant, voor beide is wat extra rust voor jezelf super fijn.
						Maak je eigen Tiramisu of snijd een stuk van je tiramisu taart maar geniet daarna zelf lekker van het moment en laat ons je gasten vers serveren. Geen schotelgeld, geen lange en geforceerde rijen, gewoon wat lekkers voor iedereen.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
				    Wij hebben de volle focus op jullie gasten en passie voor het serveren van kwaliteit, zo hoef jij nergens aan te denken.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Twijfel je tussen <a
						href="/blog/hoeveel-hapjes-per-persoon"
						class="underline hover:text-foreground">hoeveel porties je nodig hebt</a
					>, of wil je tiramisu en burrata combineren? Lees onze andere blog, of stuur ons een
					mail met je datum en aantal gasten. We denken graag met je mee.
				</p>
			</section>

			<BlogFaqSection items={faqList} />

			<section class="mt-14 rounded-lg border border-border p-6 md:p-8">
				<h2 class="font-heading text-xl tracking-tight md:text-2xl">
					Tiramisu op jouw bruiloft? Stuur ons je datum.
				</h2>
				<p class="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
					Stuur ons je datum, locatie en aantal gasten. We komen binnen 1–2 dagen terug met een
					voorstel op maat: alleen tiramisu, alleen burrata, of beide.
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
