<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MuxClips from '$lib/components/MuxClips.svelte';
	import Picture from '$lib/components/Picture.svelte';
	import DiagonalSplit from '$lib/components/DiagonalSplit.svelte';
	import BlogReviewTeaser from '$lib/blog/BlogReviewTeaser.svelte';
	import BlogFaqSection from '$lib/blog/BlogFaqSection.svelte';
	import BlogCta from '$lib/blog/BlogCta.svelte';
	import { nl } from '$lib/i18n/nl';
	import { SITE_URL } from '$lib/site-config';
	import { BLOG_FAQS_NL, type BlogFaq } from '$lib/blog/faqs';

	const toetjesReviews = nl.reviews.items.filter((review) => review.productId === 'toetjes');
	const faqList: BlogFaq[] = [
		{
			id: 'tiramisu-taart',
			question: 'Vanaf hoeveel personen kunnen we een tiramisutaart bestellen?',
			answer:
				'Onze platte tiramisutaart in showformaat maken we vanaf ongeveer 30 personen. Charlotte heeft veel patisserie-ervaring en bakte al talloze bruidstaarten. We bouwen de tiramisutaart live op locatie, je mag hem zelf afmaken met cacao of wij kunnen een persoonlijk sjabloon plaatsen. Laat ons via het contactformulier weten wat je voor ogen hebt, dan sturen we een voorstel.'
		},
		{
			id: 'tiramisu-all-inclusive',
			question: 'Moeten wij of de locatie zelf nog iets regelen of terugbrengen?',
			answer:
				'Wij bezorgen alles en bouwen de tiramisutaart of de losse porties ter plekke op. Voor de hangende hapjes nemen we bakjes, lepels en servetten mee. Bij de taart stemmen we het eetgerij en de tafel vooraf met jullie af; we kunnen ook borden, bestek, extra servetten, een tafel en decoratie meenemen. Op locatie hebben we een klein hoekje voor de koelelementen, een stopcontact en een waterkraan nodig. Je hoeft achteraf geen schalen of bakken terug te brengen. Vraag jullie locatie wel even naar eventuele kosten voor het serveren van een externe taart, zodat daar geen verrassingen over ontstaan.'
		},
		{
			id: 'tiramisu-zonder-alcohol',
			question: 'Kunnen jullie tiramisu zonder alcohol maken?',
			answer:
				'Ja. Standaard zit er een scheutje amaretto in, maar we hebben ook een alcoholvrije amaretto als vervanging. Bij de hangende hapjes kunnen we per portie wisselen. Voor de tiramisutaart stemmen we vooraf af of de hele taart met of zonder alcohol wordt gemaakt. Geef het in je aanvraag door, dan houden we er meteen rekening mee.'
		},
		{
			id: 'tiramisu-vegetarisch',
			question: 'Is jullie tiramisu vegetarisch?',
			answer:
				'Ja, zowel de tiramisutaart als de hangende hapjes zijn vegetarisch. We gebruiken mascarpone, gepasteuriseerde eieren, lange vingers, suiker, espresso en cacao. Door de mascarpone en eieren is onze tiramisu niet veganistisch. Geef dieetwensen vooraf door, dan denken we mee over een passend alternatief.'
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
				'Ja, geef allergieën en dieetwensen altijd vooraf door. Daar rekenen we niets extra voor. Onze tiramisu bevat standaard gluten, lactose en ei. We kunnen losse alternatieven meenemen voor gasten die vegan eten of een complexe allergie hebben. De tiramisu of tiramisutaart zelf passen we alleen aan als iedereen dezelfde aangepaste receptuur krijgt. Alcoholvrij of cafeïnevrij kan wel per persoon bij live tiramisu. Voor strenge allergieën kunnen we geen volledig kruisbesmettingsvrije productie garanderen.'
		},
		{
			id: 'tiramisu-sjabloon',
			question: 'Kan er iets persoonlijks op de taart?',
			answer:
				'Op de tiramisutaart maken we aan de hand van een sjabloon een tekst in cacao. ‘Just Married’ hebben we standaard liggen en die zit bij de prijs in. Wil je jullie namen, de datum of iets anders eigens, dan laten we daar een sjabloon voor maken en rekenen we soms een klein bedrag door. Vraag het gerust in je aanvraag, dan zeggen we meteen of het meerkosten heeft.'
		},
		BLOG_FAQS_NL.leadtime
	];
</script>

<svelte:head>
	<title>Tiramisu op je bruiloft — alternatief | Hangende Hapjes</title>
	<meta name="robots" content="noindex, nofollow" />
	<link rel="canonical" href={SITE_URL + '/blog/tiramisu-bruiloft'} />
</svelte:head>

<div id="top" class="bg-background text-foreground">
	<Nav t={nl} />
	<aside aria-label="Pagina vergelijken" class="border-b border-border bg-muted/40">
		<div
			class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-6 py-3 text-xs text-muted-foreground sm:text-sm"
		>
			<span>Alternatieve versie · taart &amp; hangende hapjes</span>
			<a
				href="/blog/tiramisu-bruiloft"
				target="_blank"
				rel="noopener noreferrer"
				class="font-medium underline underline-offset-4 hover:text-foreground"
				>Open de huidige pagina ↗</a
			>
		</div>
	</aside>
	<main>
		<article class="mx-auto max-w-3xl px-6 py-16 md:py-24">
			<header class="space-y-4">
				<p class="text-sm font-semibold tracking-wider text-(--brand-magenta) uppercase">
					Tiramisu &amp; trouwen, een top combinatie
				</p>
				<h1 class="font-heading text-3xl tracking-tight md:text-5xl">
					Tiramisu op je bruiloft: als taart of hapje, ter plekke opgebouwd
				</h1>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een grote tiramisutaart om samen aan te snijden, of een vers gemaakte portie voor elke
					gast vanaf ons hangende dienblad. Met lange vingers, espresso uit de mokapot,
					mascarponecrème, amaretto en cacao maken wij van jullie taart- of dessertmoment een extra
					feestje.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Beide bouwen we ter plekke op. Bij de taart mogen jullie zelf de laatste cacao strooien;
					met de hangende hapjes lopen we tussen de gasten, met een praatje en een glimlach. Wat
					past bij jullie dag?
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
				<div class="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-8">
					<div>
						<a
							href="#tiramisutaart"
							class="font-heading text-lg underline decoration-(--brand-magenta)/40 underline-offset-4 hover:decoration-(--brand-magenta)"
							>Tiramisutaart</a
						>
						<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
							Een hele taart vanaf ongeveer 30 personen. Samen afmaken en aansnijden, met een
							volwaardig stuk taart voor iedere gast.
						</p>
					</div>
					<div>
						<a
							href="#hangende-hapjes"
							class="font-heading text-lg underline decoration-(--brand-magenta)/40 underline-offset-4 hover:decoration-(--brand-magenta)"
							>Hangende hapjes</a
						>
						<p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
							Losse porties, vers opgebouwd vanaf ons dienblad. Als dessert of midnight snack,
							terwijl jullie gasten bijpraten of feestvieren.
						</p>
					</div>
				</div>
				<nav
					aria-label="In dit artikel"
					class="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-(--brand-magenta)/15 pt-4 text-sm text-muted-foreground"
				>
					<a href="#planning" class="underline underline-offset-4 hover:text-foreground"
						>Moment &amp; tijd</a
					>
					<a href="#prijzen" class="underline underline-offset-4 hover:text-foreground"
						>Prijzen voor beide opties</a
					>
					<a href="#op-locatie" class="underline underline-offset-4 hover:text-foreground"
						>Wat wij regelen</a
					>
				</nav>
			</section>
			<DiagonalSplit
				class="mt-8"
				loading="eager"
				sizes="(min-width: 768px) 560px, 80vw"
				seamTop={42}
				seamBottom={25}
				left={{
					src: '/images/tiramisu_dienblad_gijs.jpeg',
					alt: 'Gijs strooit cacao over een verse portie tiramisu boven zijn hangende dienblad',
					position: 'object-[50%_20%]'
				}}
				right={{
					src: '/images/tiramisutaart_bruiloft_aansnijden.jpeg',
					alt: 'Bruidspaar snijdt samen een grote tiramisutaart aan',
					position: 'object-[24%_50%]'
				}}
				caption="Een tiramisutaart om samen aan te snijden, of per gast vers van het dienblad."
			/>

			<section id="tiramisutaart" class="mt-12 scroll-mt-24 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Een tiramisutaart als bruidstaart
				</h2>

				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Onze tiramisutaart in showformaat is er om samen aan te snijden, vanaf ongeveer 30
					personen. Charlotte heeft veel patisserie-ervaring en bakte al talloze bruidstaarten. Met
					deze taart zijn jullie zelf onderdeel van het taartmoment: van de laatste laag cacao tot
					het eerste stukje.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Een ronde open showtaart van lange vingers en tiramisucrème door jullie afgemaakt met een
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
					voor de fotograaf. Wil je het persoonlijker maken? Dan kunnen we met een sjabloon jullie
					namen, initialen of de trouwdatum in de cacao aanbrengen. Op deze foto's zie je 'm niet,
					maar vraag er gerust naar, we denken graag mee.
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
					Bekijk hieronder de <a href="#prijzen" class="underline hover:text-foreground"
						>prijzen voor de tiramisutaart</a
					>, of laat ons via het
					<a href="/#contact" class="underline hover:text-foreground">contactformulier</a> weten wat je
					voor ogen hebt, dan sturen we een voorstel op maat.
				</p>
			</section>

			<section id="hangende-hapjes" class="mt-12 flow-root scroll-mt-24 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Tiramisu als hangend hapje tussen de gasten
				</h2>
				<MuxClips
					clips={[
						{
							playbackId: 'Q6dowlovJnKajd134vOoS60101q00RS3NYz2YgOCv4gQpE',
							title: 'Gijs bouwt live een portie tiramisu op vanaf zijn hangende dienblad'
						}
					]}
					gridClass="mx-auto mb-4 w-full max-w-60 sm:float-right sm:mt-1 sm:mb-2 sm:ml-6 sm:w-56"
					itemClass="w-full"
				/>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Ga voor iets unieks en laat Charlotte of Gijs rondlopen met verse tiramisu voor elke gast.
					We bouwen elke portie pas op bij het serveren. Zo krijgt iedere gast een vers gemaakt
					hapje en is er meteen ruimte voor een praatje.
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
						juist alcoholvrij voor gasten die niet drinken.
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
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Tip van Hangende Hapjes: denk aan tiramisu als midnight snack. Laat op de avond krijgen
					gasten vaak weer trek, en dan is dit echt een topmoment. Wij dansen lekker mee tijdens het
					uitserveren.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Bekijk de <a href="#prijzen" class="underline hover:text-foreground"
						>prijzen voor hangende hapjes</a
					>
					of lees hieronder hoeveel serveertijd bij jullie aantal gasten past.
				</p>
			</section>

			<section id="planning" class="mt-12 scroll-mt-24 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wanneer past tiramisu op jullie bruiloft?
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Als taartmoment tijdens de receptie, als dessert na het diner of als midnight snack: de
					vorm en het moment kiezen jullie. Voor de planning maakt het wel uit of we een hele taart
					opbouwen of de porties één voor één tussen de gasten serveren.
				</p>
				<h3 class="pt-2 font-heading text-xl md:text-2xl">
					Tiramisutaart: samen afmaken en aansnijden
				</h3>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					We bouwen de taart live op locatie op en stemmen vooraf af wanneer hij klaarstaat. Jullie
					strooien de laatste cacao, snijden samen aan en daarna kan de taart worden verdeeld. Een
					volwaardig taartmoment tijdens de receptie of een gezamenlijk dessert na het diner. De
					opbouw en het aansnijden plannen we met jullie; de serveertijden hieronder gelden voor de
					hangende hapjes.
				</p>
				<h3 class="pt-2 font-heading text-xl md:text-2xl">
					Hangende hapjes: een rondje tussen de gasten
				</h3>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Bij een walking dinner, na het diner of tijdens het feest komen gasten vaak in golven. Een
					serveervenster van 1–2 uur past daar goed bij: iedereen bepaalt zijn eigen moment voor een
					tiramisu. We verzorgen ongeveer 50–60 porties per uur per bediende; vanaf 100 gasten raden
					we een extra bediende aan.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li><strong>50 gasten:</strong> ongeveer 1 uur met 1 bediende.</li>
					<li>
						<strong>100 gasten:</strong> ongeveer 1 uur met 2 bedienden, of 2 uur met 1 bediende.
					</li>
					<li><strong>200 gasten:</strong> ongeveer 2 uur met 2 bedienden.</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Geef jullie gewenste moment en aantal gasten door. Dan stemmen we de planning samen af,
					zodat de tiramisu bij jullie dag past.
				</p>
			</section>

			<section id="prijzen" class="mt-12 scroll-mt-24 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Wat tiramisu op je bruiloft kost
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Hieronder zie je de pakketprijzen voor de tiramisutaart en de hangende hapjes. Een portie
					van de tiramisutaart is een volwaardig stuk taart en groter dan een hangend hapje; daar
					komt het prijsverschil vandaan.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm md:text-base">
						<caption class="pb-2 text-left text-sm text-muted-foreground"
							>Pakketprijzen, exclusief btw.</caption
						>
						<thead>
							<tr class="border-b border-border text-left">
								<th scope="col" class="py-3 pr-4 font-heading font-semibold">Aantal gasten</th>
								<th scope="col" class="py-3 pr-4 font-heading font-semibold">Tiramisutaart</th>
								<th scope="col" class="py-3 font-heading font-semibold">Hangende hapjes</th>
							</tr>
						</thead>
						<tbody class="text-muted-foreground">
							<tr class="border-b border-border/60"
								><th scope="row" class="py-3 pr-4 text-left font-normal">30</th><td
									class="py-3 pr-4">€375</td
								><td class="py-3">—</td></tr
							>
							<tr class="border-b border-border/60"
								><th scope="row" class="py-3 pr-4 text-left font-normal">50</th><td
									class="py-3 pr-4">€475</td
								><td class="py-3">€425</td></tr
							>
							<tr class="border-b border-border/60"
								><th scope="row" class="py-3 pr-4 text-left font-normal">100</th><td
									class="py-3 pr-4">€795</td
								><td class="py-3">€650</td></tr
							>
							<tr
								><th scope="row" class="py-3 pr-4 text-left font-normal">200</th><td
									class="py-3 pr-4">Op aanvraag</td
								><td class="py-3">€1.150</td></tr
							>
						</tbody>
					</table>
				</div>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Inbegrepen zijn bezorgen, opbouw op locatie en het serveren van de hangende hapjes of
					aanwezig blijven tot het taartmoment. Het eetgerij en eventuele extra spullen stemmen we
					vooraf af, zoals je hieronder leest. Bij de tiramisutaart is het standaard ‘Just
					Married’-sjabloon inbegrepen; voor een persoonlijk sjabloon rekenen we soms een klein
					bedrag door. Dat hoor je vooraf.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Reiskosten: in het Gooi, Amsterdam en Utrecht zitten ze gewoon in de prijs. Verder weg
					rekenen we de reis mee in je offerte, zodat je één totaalbedrag ziet.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Staat jullie aantal gasten er niet tussen? Laat ons via het
					<a href="/#contact" class="underline hover:text-foreground">contactformulier</a>
					weten wat je voor ogen hebt, dan sturen we een voorstel op maat.
				</p>
			</section>

			<section id="op-locatie" class="mt-12 scroll-mt-24 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Wat wij regelen op locatie</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wij bezorgen alles en bouwen de taart of hapjes ter plekke vers op. Op locatie hebben we
					weinig nodig: een klein hoekje voor de koelelementen, een stopcontact en een waterkraan.
					We stemmen vooraf af wat jullie locatie al heeft en wat wij meenemen. Achteraf hoef je
					geen schalen of bakken terug te brengen.
				</p>
				<ul
					class="ml-6 list-disc space-y-2 text-base leading-relaxed text-muted-foreground md:text-lg"
				>
					<li>
						<strong>Bij de tiramisutaart</strong> blijven we tot het taartmoment. Borden, bestek, extra
						servetten of zelfs een tafel en decoratie kunnen we meenemen als dat voor jullie makkelijker
						is dan overleggen met de locatie.
					</li>
					<li>
						<strong>Bij de hangende hapjes</strong> verzorgen we het uitserveren. Stevige, duurzame bakjes,
						lepels en servetten zijn inbegrepen.
					</li>
				</ul>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Geef allergieën en dieetwensen vooraf door. Bij de hangende hapjes kan alcoholvrij of
					cafeïnevrij per persoon; voor de taart stemmen we één receptuur af. Voor andere
					dieetwensen kunnen we losse alternatieven meenemen. In de veelgestelde vragen hieronder
					lees je daar meer over.
				</p>
			</section>
			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">Hoe wij de tiramisu maken</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Het recept is klassiek-Italiaans. Tiramisu hoort als tiramisu te smaken, en daar houden we
					ons aan. De basis is voor de tiramisutaart en de hangende hapjes hetzelfde. De taart
					stemmen we vooraf met jullie af; bij de losse porties kunnen we ter plekke wisselen,
					bijvoorbeeld tussen amaretto met of zonder alcohol.
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
						<strong>Cacao</strong> als laatste laag: door jullie op de taart, of door ons over iedere
						losse portie.
					</li>
				</ul>
			</section>

			<section class="mt-12 space-y-4">
				<h2 class="font-heading text-2xl tracking-tight md:text-3xl">
					Nog meer ideeën voor jullie bruiloft
				</h2>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Naast tiramisutaart maakt Charlotte ook een
					<a href="/blog/italiaanse-bruidstaart" class="underline hover:text-foreground"
						>Italiaanse millefoglie</a
					>, precies zoals wij die zelf op onze eigen bruiloft hadden. Een groot feest om zelf af te
					maken met rood fruit als je dat wilt! Of kies een
					<a href="/blog/bruidstaart" class="underline hover:text-foreground"
						>klassieke hoge bruidstaart met tiramisu-smaak en -vulling</a
					>.
				</p>
				<p class="text-base leading-relaxed text-muted-foreground md:text-lg">
					Wil je tiramisu combineren met een hartig hapje?
					<a href="/blog/burrata-catering" class="underline hover:text-foreground"
						>Lees over onze burrata-catering</a
					>. We denken graag met je mee.
				</p>
			</section>
			<BlogReviewTeaser reviews={toetjesReviews} />

			<BlogCta
				event="tiramisu_preview"
				heading="Tiramisutaart of hangende hapjes op jullie bruiloft?"
				body="Stuur ons jullie datum, locatie en aantal gasten. Vertel gerust of jullie aan een tiramisutaart of hangende hapjes denken. Nog niet zeker? Dan denken we mee. Binnen 1–2 dagen ontvangen jullie een voorstel op maat."
				waText="Hoi! Ik heb een vraag over tiramisu van Hangende Hapjes 👋"
			/>

			<BlogFaqSection
				items={faqList}
				intro="Alles wat je je afvraagt over tiramisu op je bruiloft, als taart of als hangend hapje."
			/>
		</article>
	</main>
	<Footer t={nl} />
</div>
