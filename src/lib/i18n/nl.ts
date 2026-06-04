import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const TOETJES_IMAGE = '/images/07.jpeg';
const BORREL_IMAGE = '/images/01.jpeg';

export const nl: Translations = {
	meta: {
		title: 'Hangende Hapjes | Live catering voor jouw bruiloft of evenement',
		description:
			'Verse tiramisu en burrata-bowls, ter plekke gemaakt voor jouw gasten. Hapjes en borrel catering voor bruiloften, recepties en zakelijke events. Vanaf €425.'
	},
	nav: {
		about: 'Over ons',
		products: 'Concepten',
		photos: 'Foto’s',
		contact: 'Contact',
		homeHref: '/',
		switchLabel: 'EN',
		switchHref: '/en',
		otherLabel: 'English'
	},
	hero: {
		eyebrow: 'Entertainend Eten',
		title: 'Hapjes die jouw gasten onthouden.',
		subtitle:
			'Met een tray vol zelfgemaakte hapjes lopen we tussen jouw gasten. Voor ieder wat wils op een unieke manier met een praatje en een glimlach.',
		secondaryCta: 'Bekijk onze concepten',
		image: HERO_IMAGE,
		imageAlt: 'Charlotte en Gijs van Hangende Hapjes met een dienblad om de nek tussen gasten'
	},
	about: {
		heading: 'Aan wie hangen de hapjes?',
		body: [
			'Dat zijn Charlotte en Gijs. Net één jaar getrouwd en al 12 jaar samen, er is één ding waar wij echt blij van worden: eten verzorgen voor anderen. De ervaring van talloze feestjes en diners thuis nemen wij nu mee naar ons eerste catering concept.',
			'Maar als er één ding is waar we niet eensgezind over zijn, is het wel etenskeuze. Charlotte is een echte bakker en zoetekauw maar ook een fan van "hearty" en "classic" eten. Daarentegen houdt Gijs juist van alles nieuw en anders en is hartig koken meer zijn passie.',
			'Gelukkig hebben jullie daar alleen maar profijt van! Twee super leuke concepten, hartig en zoet, voor jouw bruiloft, borrel, receptie, walking dinner of zakelijk event.'
		]
	},
	products: {
		heading: 'Kies jij voor zoet of zout?',
		intro:
			'Eén voor de borrel, één voor het dessert, of misschien wel beide als midnight snack of walking dinner?',
		items: [
			{
				id: 'toetjes',
				name: 'De Toetjes Vrouw',
				pitch: 'Verse tiramisu die we als een toren opbouwen bij het serveren.',
				priceFrom: 'Vanaf €425',
				priceNote: 'voor 50 personen',
				bullets: [
					'Twee lange vingers, overgoten met espresso en likeur',
					'Klassieke mascarpone-crème met gepasteuriseerde eieren',
					'En natuurlijk een mooie laag cacao',
					'Huisgemaakt door Charlotte',
					'Vanaf €425 voor 50 porties · €650 voor 100 · grotere events op aanvraag'
				],
				image: TOETJES_IMAGE,
				imageAlt: 'Charlotte maakt live tiramisu voor een gast'
			},
			{
				id: 'borrel',
				name: 'De Borrel Baas',
				pitch: 'Burrata-bowl met toppings en dips naar keuze voor extra variëteit.',
				priceFrom: 'Vanaf €450',
				priceNote: 'voor 50 personen',
				bullets: [
					'Stracciatella — het romige binnenste van een burrata',
					'Scrocchi-toastjes om mee te dippen',
					{
						label: '2 toppings naar keuze',
						options: [
							'crispy prosciutto',
							'tomatensalsa',
							'pijnboompitten',
							'vijgen',
							'gegrilde perzik',
							'spicy nduja',
							'pistachenoten',
							'parmigiano flakes'
						]
					},
					{
						label: '1 saus naar keuze',
						options: ['olijfolie', 'balsamico', 'truffelolie', 'pesto', 'spicy honey']
					},
					'Vanaf €450 voor 50 porties · €700 voor 100 · grotere events op aanvraag'
				],
				image: BORREL_IMAGE,
				imageAlt: 'Gijs maakt een live burrata-bowl voor een gast'
			}
		],
		priceFooter: 'Prijzen excl. BTW · Reiskosten gratis tot 50 km vanaf Hilversum.',
		priceCta: 'Vraag een offerte aan'
	},
	faq: {
		eyebrow: 'Waarom Hangende Hapjes',
		why: [
			{
				heading: 'Eten als Entertainment',
				body: 'Niemand vergeet een hapje dat live voor ’m wordt opgemaakt. Wij dansen en praten graag met jullie gasten mee terwijl ze weer een ervaring hebben om het evenement mee te onthouden.'
			},
			{
				heading: 'Persoonlijk & gigantisch lekker',
				body: 'Het is altijd Charlotte of Gijs, elke mail en elk hapje. We passen ons graag aan qua kleding, hapjes keuze en tijden zodat het precies is wat jij zoekt. En zelfgemaakt smaakt natuurlijk het best.'
			}
		],
		srHeading: 'Veelgestelde vragen',
		items: [
			{
				id: 'occasions',
				question: 'Op wat voor evenementen serveren jullie?',
				answer:
					'Bruiloften, recepties, borrels en zakelijke events. Onze hapjes werken net zo goed als (lopend) walking dinner, "grazing" moment bij de borrel of als midnight snack na een lange avond. Mail ons gerust, dan denken we mee.'
			},
			{
				id: 'booking',
				question: 'Hoe werkt boeken en moet dat snel?',
				answer:
					'Vul het contactformulier in met je datum, locatie en aantal gasten. We komen binnen 1–2 dagen bij je terug met een voorstel op maat. Akkoord? Dan staat de boeking. Wij kunnen snel schakelen, soms zelfs op de dag zelf, maar voor zekerheid raden we aan om minstens 2 á 3 maanden van tevoren te boeken.'
			},
			{
				id: 'travel',
				question: 'Vragen jullie ook reiskosten?',
				answer:
					'Voor feesten tot 50 km vanaf Hilversum rekenen we geen extra reiskosten. Daarboven rekenen we €0,45 per km.'
			},
			{
				id: 'combine',
				question: 'Kan ik beide concepten boeken, en wie komt er serveren?',
				answer:
					'Zeker, je kan beide concepten los of samen op één feest boeken. Sommige hosts kiezen voor De BorrelBaas tijdens de borrel/receptie en De ToetjesVrouw als dessert. Een richtprijs voor een combi van beide concepten is onze standaard vanaf prijs voor beide concepten met ~€125 korting. Zowel Gijs als Charlotte maken heerlijke tiramisu en burrata-bowls, wie er komt is afhankelijk van de beschikbaarheid en is niet verbonden met de conceptkeuze.'
			},
			{
				id: 'portion',
				question: 'Hoe groot is een portie?',
				answer:
					'Een portie is ongeveer even groot als 2 á 3 standaard hapjes (crostinis, bittergarnituur etc.). Gasten krijgen een net bakje dat goed gevuld is met lekkers. Wij gaan voor kwaliteit en dat zie je terug in hoe wij de hapjes presenteren en de smaak daarvan.'
			},
			{
				id: 'diet',
				question: 'Hebben jullie opties voor allergieën of dieetwensen?',
				answer:
					'Ja, we denken graag mee. De tiramisu heeft mascarpone, ei en lange vingers als basis (niet lactose- of glutenvrij), maar kan wel alcoholvrij en cafeïnevrij gemaakt worden. De burrata-bowl is vegetarisch en kan ook glutenvrij. Geef je wensen door in de aanvraag, dan kijken we wat past.'
			},
			{
				id: 'pace',
				question: 'Hoe snel serveren jullie?',
				answer:
					'Ongeveer 50 porties per uur per persoon. Wil je het sneller? Dan komt er een extra bediende mee, tegen meerprijs.'
			},
			{
				id: 'wear',
				question: 'Wat trekken jullie aan?',
				answer:
					'We stemmen onze kleding af op het thema of de dresscode van jouw feest. Laat het ons gewoon weten in je aanvraag.'
			}
		]
	},
	reviews: {
		heading: 'Wat gasten zeggen',
		empty:
			'Hangende hapjes is net begonnen, quotes en reviews komen hier binnenkort. Heb jij de hapjes al wel geproefd? Stuur ons gerust een berichtje.',
		cta: {
			text: 'Heb jij onze hapjes geproefd? Laat ons weten hoe lekker ze waren.',
			button: 'Schrijf een review',
			href: 'https://g.page/r/CYBafahKAvrMEBM/review'
		}
	},
	photos: {
		heading: 'In actie',
		intro: 'De laatste sfeerbeelden van onze evenementen staan op Instagram.',
		cta: 'Bekijk Instagram',
		blockedTitle: 'De Instagram-posts zijn geblokkeerd',
		blockedBody:
			'Je browser of een extensie (zoals een tracker- of cookieblokker) houdt de Instagram embeds tegen. Geen zorgen, je vindt al onze beelden direct op Instagram.'
	},
	contact: {
		heading: 'Boek ons voor jouw feest',
		intro:
			'Vertel ons kort wat je plant dan komen we binnen 1–2 dagen bij je terug met een voorstel.',
		labels: {
			name: 'Naam',
			email: 'E-mailadres',
			phone: 'Telefoonnummer',
			eventDate: 'Datum evenement',
			location: 'Locatie evenement',
			guests: 'Aantal gasten',
			serviceType: 'Waar ben je in geïnteresseerd?',
			choice: 'En welke?',
			dagdeel: 'Als welk onderdeel van je evenement?',
			servingTime: 'En hoelaat ongeveer?',
			referral: 'Hoe heb je over ons gehoord?',
			message: 'Bericht'
		},
		serviceTypes: {
			hapjes: {
				title: 'De Hangende Hapjes',
				description: 'Catering als live entertainment, vers voor elke gast.'
			},
			taart: {
				title: 'Een bruidstaart',
				description: 'Een custom bruidstaart of grote italiaanse milefeuille/tiramisu gemaakt door Charlotte.'
			}
		},
		options: {
			tiramisuLive: 'Tiramisu',
			burrataLive: 'Burrata',
			bruidstaart: 'Klassieke bruidstaart',
			millefeuille: 'Italiaanse millefeuille',
			tiramisuTaart: 'Tiramisu Taart'
		},
		dagdelen: {
			placeholder: 'Kies een onderdeel',
			taartmoment: 'Taartmoment',
      receptie: 'Receptie/borrel',
			voorgerecht: 'Voorgerecht/walking dinner',
			dessert: 'Dessert',
			feest: 'Feest'
		},
		whatsapp: {
			cta: 'Stuur een WhatsApp',
			or: 'of'
		},
		placeholders: {
			message: 'Vertel ons over je feest, sfeer, locatie, eventuele wensen en meer.',
			referral: 'Bijv. via Instagram, een vriend, Google…',
			choice: 'Maak een keuze…'
		},
		optional: 'optioneel',
		submit: 'Verstuur',
		submitting: 'Bezig met versturen…',
		successTitle: 'Bedankt!',
		successBody: 'We reageren meestal binnen 1–2 dagen.',
		errorTitle: 'Versturen mislukt',
		errorBody:
			'Er ging iets mis. Probeer het zo nog eens, of mail ons direct op info@hangendehapjes.nl.',
		errorRateTitle: 'Eventjes wachten',
		errorRateBody: 'Je hebt net iets verstuurd. Probeer het over een minuut nog eens.'
	},
	footer: {
		tagline: 'Live hapjes, heerlijk entertainend eten.',
		instagram: 'Instagram',
		facebook: 'Facebook',
		tiktok: 'TikTok',
		whatsapp: 'WhatsApp',
		emailLabel: 'E-mail',
		readingHeading: 'Goed om te weten',
		readingLinks: [
			{
				label: 'Hoeveel hapjes per persoon',
				href: '/blog/hoeveel-hapjes-per-persoon'
			},
			{
				label: 'Tiramisu op je bruiloft',
				href: '/blog/tiramisu-bruiloft'
			},
			{
				label: 'Burrata bar op je feest',
				href: '/blog/burrata-catering'
			}
		]
	}
};
