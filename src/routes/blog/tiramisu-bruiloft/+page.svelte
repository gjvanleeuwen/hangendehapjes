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
			question: 'Maken jullie ook een tiramisu toren voor op de bruiloft?',
			answer:
				'Standaard staat een grote tiramisu toren niet in ons aanbod, maar we doen het op aanvraag. Charlotte heeft een bakkersachtergrond en bouwt de toren eigenhandig op. We hebben twee smaken voor je: een grote toren als visueel hoogtepunt, of onze live opbouw waarbij iedere gast een eigen verse mini-tiramisu krijgt. Beide werken op een bruiloft. Stuur ons een mail met je idee en het aantal gasten, dan kijken we wat past en wat het kost.'
		},
		{
			id: 'tiramisu-taart',
			question: 'Maken jullie ook een tiramisu taart of Italiaanse bruidstaart?',
			answer:
				'Ja, dat doen we. Charlotte komt uit de patisserie en heeft tiramisu taarten gemaakt voor familie- en vriendenfeesten, zowel als bruidstaart als één grote tiramisu in showformaat. Voor jouw bruiloft kunnen we hetzelfde: een echte tiramisu taart als wedding cake, of een grote tiramisu in showformaat. Stuur ons een mail met je idee en aantal gasten, dan komen we met een voorstel. Zoek je een Italiaanse taart bruiloft als alternatief? Een aardbeien-millefeuille of panna cotta-taart maken we ook. Een Italiaanse bruidstaart komt binnenkort als vast aanbod, voor nu doen we het op aanvraag.'
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
				'Ja. Mascarpone, eieren, lange vingers, suiker, espresso en cacao. Geen vlees of vis. De eieren zijn gepasteuriseerd, dus de tiramisu is ook veilig voor zwangere gasten en kinderen.'
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
					Tiramisu op je bruiloft. Wij van Hangende Hapjes maken er een live moment van. Met
					een dienblad om de nek lopen we tussen jouw gasten door en bouwen per persoon een
					verse portie op: mascarpone-crème, espresso uit de mokapot, lange vingers en cacao.
					Een praatje erbij, een keuze in toppings per gast, en iedere portie even vers als de
					eerste. Hieronder lees je hoe we het maken, wat het kost, en wanneer het past op
					jouw feest.
				</p>
			</header>

			<section
				class="data-[state=open]:bg-(--brand-magenta)/12 mt-10 rounded-lg bg-(--brand-magenta)/8 p-6 md:p-8"
				aria-labelledby="snel-antwoord"
			>
				<h2 id="snel-antwoord" class="font-heading text-xl tracking-tight md:text-2xl">
					Snel antwoord
				</h2>
				<ul class="mt-4 space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg">
					<li>Per gast 1 verse portie van ~150 gram, <strong>ter plekke opgebouwd</strong></li>
					<li><strong>50–70 porties per uur</strong> per bediende</li>
					<li>
						<strong>Vanaf €395</strong> voor 45 gasten (excl. BTW, vanaf Hilversum tot 50 km gratis)
					</li>
					<li>Past bij <strong>dessert, midnight snack of naast een walking dinner</strong></li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu als live moment op je bruiloft
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Charlotte loopt met een dienblad om de nek tussen jouw gasten door en bouwt per
					persoon een verse portie op: twee lange vingers onderin, mascarpone-eiercrème erover,
					vers gezette espresso, en cacao op het einde. Daar zit onze magie:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						Iedere portie wordt op het moment zelf opgebouwd. Wat de eerste gast krijgt, krijgt
						de laatste ook.
					</li>
					<li>
						Per gast een eigen afwerking: extra cacao, gestampte amaretti, een toefje slagroom of
						een limoncello-twist. Charlotte vraagt het naast je gast.
					</li>
					<li>
						Het wordt een gespreksmoment, niet alleen een gerecht. Gasten praten er nog dagen
						over na.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Charlotte vertelt jouw gasten graag het verhaal erbij: waarom we juist mokapot-koffie
					gebruiken, hoe ze de mascarpone-crème opklopt, en welke toppings vandaag op het
					dienblad liggen.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Liever een echte tiramisu taart of een Italiaanse bruidstaart? Dat kan ook, zie de
					veelgestelde vragen onder aan deze pagina.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Hoe Charlotte het maakt</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het recept is klassiek-Italiaans. Tiramisu hoort als tiramisu te smaken, en daar
					houden we ons aan. De basis ligt vast, de afwerking kiezen jouw gasten ter plekke.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Echte mascarpone</strong>, geen slagroom.
					</li>
					<li>
						<strong>Verse, gepasteuriseerde eieren</strong> met suiker opgeklopt tot de massa
						lintsporen trekt. Veilig voor zwangere gasten en kinderen.
					</li>
					<li>
						<strong>Lange vingers</strong>, gedoopt in espresso.
					</li>
					<li>
						<strong>Espresso uit de mokapot</strong>, met light-roast Ethiopische bonen van
						<a
							href="https://www.blommers.coffee/nl/"
							target="_blank"
							rel="noopener noreferrer"
							class="underline hover:text-foreground">Blommers Roasters</a
						>
						in Hilversum. Een heldere, lichte koffie tegen de zoete crème.
					</li>
					<li>
						<strong>Amaretto</strong> voor het Italiaanse randje. Liever zonder alcohol? Dan
						gebruiken we een alcoholvrije amaretto, met dezelfde smaak.
					</li>
					<li>
						<strong>Cacao</strong> op het einde gestrooid met de molen, dus nooit hardgeworden.
					</li>
					<li>
						<strong>FSC-gecertificeerde bakjes, lepels en servetten.</strong> We willen dat de
						duurzame keuze ook de mooie keuze is.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wat we wél variëren is de afwerking. Per gast kan een keuze gemaakt worden: extra
					cacao, gestampte amaretti, een toefje slagroom, of een limoncello-twist voor de
					zomerbruiloften. Charlotte staat letterlijk naast je gast en vraagt het.
				</p>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Past tiramisu in jullie tijdsblok?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij verzorgen ongeveer 50–70 porties per uur per bediende. In de praktijk:
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li><strong>45 gasten</strong>: 1 uur, Charlotte alleen</li>
					<li><strong>100 gasten</strong>: 1 uur met 2 bedienden, of 2 uur met alleen Charlotte</li>
					<li><strong>200 gasten</strong>: 2 uur, 2 bedienden</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Voor het dessertmoment van een bruiloft is dat meestal precies goed: jullie hebben dan
					één tot twee uur waarin gasten in en uit lopen. Charlotte bouwt door, en gasten kunnen
					op hun eigen moment komen halen. We hebben weinig nodig op locatie: een klein hoekje
					voor de koelelementen, een stopcontact en een waterkraan. Verder regelen we alles
					zelf, van bakjes tot servetten.
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
								<th class="py-3 font-heading font-semibold">Prijs</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60">
								<td class="py-3 pr-4">45</td>
								<td class="py-3 pr-4">1 uur, 1 bediende</td>
								<td class="py-3">€395</td>
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
					Tip die veel paren niet kennen: een korte tweede ronde later op de avond, als
					verrassings-midnight-snack. Kleinere portie, sneller tempo, ongeveer 60% van de prijs
					van een eerste ronde. Werkt vooral goed na een lang diner. Jouw gasten denken dat het
					feest afloopt en dan staat Charlotte ineens weer tussen ze.
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
						<strong>Als dessertmoment.</strong> Een verse tiramisu, per gast opgebouwd, maakt
						het dessert tot een hoogtepunt van de avond.
					</li>
					<li>
						<strong>Als midnight snack.</strong> Laat op de avond, na een lang diner, een ronde
						verse tiramisu. Koffie en zoet in één hapje.
					</li>
					<li>
						<strong>Naast een walking dinner.</strong> De avondcateraar doet het hartige, wij
						doen het zoete. Cateraars werken graag met ons samen, we vullen elkaar aan.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Onze focus is duidelijk: één gerecht, vers per gast, op het moment zelf. Daar zit onze
					passie en dat zien jouw gasten ook.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Twijfel je tussen <a
						href="/blog/hoeveel-hapjes-per-persoon"
						class="underline hover:text-foreground">hoeveel porties je nodig hebt</a
					>, of wil je tiramisu en burrata combineren? Lees ons andere stuk, of stuur ons een
					mail met je datum en aantal gasten. We denken graag mee.
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
