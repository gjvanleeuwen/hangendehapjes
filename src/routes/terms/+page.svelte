<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { BUSINESS } from '$lib/admin/business';
	import { nl } from '$lib/i18n/nl';
	import { SITE_URL } from '$lib/site-config';

	const updated = '3 juli 2026';
	const canonical = `${SITE_URL}/terms`;

	const sections = [
		{
			title: '1. Offerte en boeking',
			body: [
				'Voor een offerte houden wij de evenementdatum vast tot de verloopdatum die op of bij de offerte staat. Meestal is dat 14 dagen na verzenden.',
				'De offerte vermeldt wat is inbegrepen: datum, locatie, aantal gasten, gekozen concept, service, prijs, btw en eventuele extra afspraken.',
				'De boeking is definitief zodra de opdrachtgever akkoord geeft en de afgesproken aanbetaling is ontvangen. Is de aanbetaling niet op tijd ontvangen, dan wordt de datum weer vrijgegeven.'
			]
		},
		{
			title: '2. Betaling',
			body: [
				'Bij akkoord vragen wij standaard een aanbetaling van 50% van het totaalbedrag. De boeking is definitief zodra deze aanbetaling is ontvangen.',
				'Voor zakelijke opdrachtgevers vragen wij geen aanbetaling. De boeking is dan definitief zodra de offerte schriftelijk is geaccordeerd en het volledige bedrag wordt achteraf gefactureerd. Het eindbedrag hangt af van het definitieve aantal gasten en eventuele aanpassingen, maar bedraagt altijd tenminste 50% van de geaccordeerde offerte.',
				'De aanbetaling wordt altijd verrekend met de eindfactuur. Als het eindbedrag wijzigt door definitieve aantallen of schriftelijk afgesproken aanpassingen, trekken we de betaalde aanbetaling af van dat aangepaste eindbedrag.',
				'Het resterende bedrag kan voldaan worden binnen 14 dagen na het evenement, tenzij schriftelijk anders afgesproken.',
				'Bij facturen geldt de betaaltermijn die op de factuur staat. Blijft betaling uit, dan worden voorbereiding of uitvoering uitgesteld tot de betaling is voldaan.'
			]
		},
		{
			title: '3. Aantallen, planning en wijzigingen',
			body: [
				'Definitieve aantallen, dieetwensen en praktische locatiegegevens ontvangen wij graag uiterlijk 14 dagen voor het evenement. Op de meeste van onze services is een staffel van kracht; door het verminderen van het aantal porties kan de prijs per portie verhoudingsgewijs stijgen. De uiteindelijke factuur is nooit minder dan de aanbetaling, ook niet als een aantalvermindering daar normaal onder zou uitkomen.',
				'Wijzigingen na die datum zijn alleen mogelijk in overleg. We denken graag met je mee.'
			]
		},
		{
			title: '4. Locatie en voorzieningen',
			body: [
				'De opdrachtgever is verantwoordelijk voor het afstemmen van toegang en ondersteuning van de evenementlocatie. Hangende Hapjes neemt dit contact over van de opdrachtgever na akkoord.',
				'Kosten die de locatie rekent voor externe leveranciers, service, keukenhuur of schotelgeld zijn voor de opdrachtgever, tenzij anders afgesproken.'
			]
		},
		{
			title: '5. Allergenen en dieetwensen',
			body: [
				'Geef allergieën en dieetwensen altijd vooraf door. Wij behandelen deze informatie zorgvuldig en denken mee over een passende oplossingen.',
				'Onze producten worden gemaakt in een keuken waar onder andere gluten, melk, ei en noten kunnen voorkomen. We kunnen daarom geen volledig kruisbesmettingsvrije productie garanderen.'
			]
		},
		{
			title: '6. Annulering door de opdrachtgever',
			body: [
				'Annuleren kan alleen schriftelijk, de aanbetaling is niet beschikbaar voor restitutie. Bij annulering tot 14 dagen voor het evenement is alleen de aanbetaling verschuldigd. Bij annulering binnen 14 dagen van het evenement zullen wij het volledige bedrag van de afgenomen service in rekening brengen.',
				'Hangende Hapjes kan afwijken van deze voorwaarden in voordeel van de opdrachtgever om deze tegemoet te komen bij force-majeure of andere annuleringsredenen. Mocht een offerte eigen annuleringsafspraken bevatten, dan gaan die afspraken voor.'
			]
		},
		{
			title: '7. Overmacht en veiligheid',
			body: [
				'Als uitvoering onmogelijk of onveilig wordt door omstandigheden buiten onze invloed, zoeken we eerst samen naar een praktische oplossing.',
				'Denk aan extreem weer, overheidsmaatregelen, ziekte, ernstige verkeersproblemen, stroomuitval of een locatie die niet toegankelijk blijkt.',
				'Kosten die al gemaakt zijn of verplichtingen die niet meer te annuleren zijn, kunnen in rekening worden gebracht.'
			]
		},
		{
			title: '8. Aansprakelijkheid',
			body: [
				'Wij werken zorgvuldig en professioneel. Onze aansprakelijkheid is beperkt tot directe schade die aantoonbaar door ons handelen is veroorzaakt.',
				'Wij zijn niet aansprakelijk voor schade door onjuiste of te late informatie van de opdrachtgever of locatie, ongeschikte voorzieningen, wijzigingen in de planning of handelen van derden.',
				'Onze aansprakelijkheid is nooit hoger dan het bedrag dat voor de betreffende opdracht aan ons is betaald en/of verschuldigd.'
			]
		},
		{
			title: '9. Foto’s en promotie',
			body: [
				'Wij gebruiken herkenbare foto’s van personen, privé-events of locatie-interieurs alleen voor promotie als daar toestemming voor is.',
				'Productfoto’s of sfeerbeelden zonder herkenbare personen kunnen we gebruiken voor portfolio, website of social media, tenzij vooraf anders is afgesproken.'
			]
		},
		{
			title: '10. Contact',
			body: [
				`Vragen over deze voorwaarden of over een offerte? Mail ons via ${BUSINESS.email}.`,
				`${BUSINESS.name}, ${BUSINESS.addressLine1}, ${BUSINESS.addressLine2}.`
			]
		}
	];
</script>

<svelte:head>
	<title>Algemene voorwaarden — Hangende Hapjes</title>
	<meta
		name="description"
		content="Algemene voorwaarden van Hangende Hapjes voor offertes, boekingen, betalingen, locaties, allergenen en annuleringen."
	/>
	<link rel="canonical" href={canonical} />
</svelte:head>

<div class="bg-background text-foreground">
	<Nav t={nl} />
	<main class="mx-auto max-w-3xl px-6 py-14 md:py-20">
		<header class="border-b pb-8">
			<p class="font-wordmark text-sm font-bold tracking-[0.08em] text-primary uppercase">
				Hangende Hapjes
			</p>
			<h1 class="mt-4 font-heading text-4xl tracking-tight">Algemene voorwaarden</h1>
			<p class="mt-4 text-muted-foreground">
				Deze voorwaarden houden onze afspraken simpel en duidelijk. In een offerte kunnen we
				afwijkende afspraken maken; die gaan dan voor.
			</p>
			<p class="mt-3 text-sm text-muted-foreground">Laatst bijgewerkt: {updated}</p>
		</header>

		<div class="mt-10 space-y-10">
			{#each sections as section}
				<section class="space-y-3">
					<h2 class="font-heading text-2xl">{section.title}</h2>
					{#each section.body as paragraph}
						<p class="leading-relaxed text-muted-foreground">{paragraph}</p>
					{/each}
				</section>
			{/each}
		</div>
	</main>
	<Footer t={nl} />
</div>
