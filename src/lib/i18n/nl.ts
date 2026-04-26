import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const TOETJES_IMAGE = '/images/07.jpeg';
const BORREL_IMAGE = '/images/01.jpeg';

export const nl: Translations = {
	meta: {
		title: 'Hangende Hapjes — live hapjes voor jouw bruiloft of evenement',
		description:
			'Live tiramisu en burrata-bowls, ter plekke gemaakt voor jouw gasten. Voor bruiloften, recepties en feesten. Vanuit Hilversum.'
	},
	nav: {
		about: 'Over ons',
		products: 'Concepten',
		photos: 'Foto’s',
		contact: 'Contact',
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
			'Dat zijn Charlotte en Gijs. Net 1 jaar getrouwd maar al bijna 15 jaar samen en er is één ding waar wij echt blij van worden: eten verzorgen voor anderen. De ervaring van talloze feestjes en diners thuis nemen we nu mee naar ons eerste catering concept.',
			'Maar als er één ding is waar we niet eensgezind over zijn, is het wel etenskeuze. Charlotte is een echte bakker en fan van zoet en klassiek, Gijs houdt juist van alles nieuw, anders en hartig koken.',
			'Gelukkig heb jij daar alleen maar profijt van! Twee super leuke concepten, hartig én zoet, voor op jouw bruiloft of evenement.'
		]
	},
	products: {
		heading: 'Kies jij voor zoet of zout?',
		intro: 'Eén voor de borrel, één voor het toetje. Los te boeken of samen op één feest.',
		items: [
			{
				id: 'toetjes',
				name: 'De Toetjes Vrouw',
				pitch: 'Verse tiramisu die we als een toren opbouwen bij het serveren.',
				priceFrom: 'Vanaf €425',
				priceNote: '50 porties',
				bullets: [
					'Twee lange vingers, overgoten met espresso en likeur',
					'Klassieke mascarpone-crème met gepasteuriseerde eieren',
					'En natuurlijk een mooie laag cacao',
					'Huisgemaakt door Charlotte',
					'Vanaf €425 voor 50 porties · €650 voor 100 · €1.125 voor 200'
				],
				image: TOETJES_IMAGE,
				imageAlt: 'Charlotte maakt live tiramisu voor een gast'
			},
			{
				id: 'borrel',
				name: 'De Borrel Baas',
				pitch: 'Burrata-bowl met toppings en dips naar keuze voor extra variëteit.',
				priceFrom: 'Vanaf €450',
				priceNote: '50 porties',
				bullets: [
					'Stracciatella — het romige binnenste van een burrata',
					'Scrocchi-toastjes om mee te dippen',
					'Twee toppings naar keuze (parmaham, tomaten etc.)',
					'Een saus zoals pesto of balsamico-vinaigrette',
					'Vanaf €450 voor 50 porties · €700 voor 100 · €1.225 voor 200'
				],
				image: BORREL_IMAGE,
				imageAlt: 'Gijs maakt een live burrata-bowl voor een gast'
			}
		]
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
				id: 'booking',
				question: 'Hoe werkt boeken?',
				answer:
					'Vul het contactformulier in met je datum, locatie en aantal gasten. We komen binnen 1–2 dagen bij je terug met een voorstel op maat. Akkoord? Dan staat de boeking.'
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
					'Zeker, je kan beide concepten los of samen op één feest boeken. Sommige hosts kiezen voor De BorrelBaas tijdens de borrel/receptie en De ToetjesVrouw als dessert. Zowel Gijs als Charlotte maken heerlijke tiramisu en burrata-bowls, wie er komt is afhankelijk van de beschikbaarheid en is niet verbonden met de conceptkeuze.'
			},
			{
				id: 'portion',
				question: 'Hoe groot is een portie?',
				answer:
					'Een portie is ongeveer even groot als 2 á 3 standaard hapjes (crostinis, bittergarnituur etc.). Gasten krijgen een net bakje dat goed gevuld is met lekkers. Wij gaan voor kwaliteit en dat zie je terug in hoe wij de hapjes presenteren en de smaak daarvan.'
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
			'Hangende hapjes is net begonnen, quotes en reviews komen hier binnenkort. Heb jij de hapjes al wel geproefd? Stuur ons gerust een berichtje.'
	},
	photos: {
		heading: 'In actie',
		intro: 'De laatste sfeerbeelden van onze evenementen staan op Instagram.',
		handle: '@hangendehapjes',
		cta: 'Bekijk Instagram'
	},
	contact: {
		heading: 'Boek ons voor jouw feest',
		intro:
			'Vertel ons kort wat je plant dan komen we binnen 1–2 dagen bij je terug met een voorstel.',
		labels: {
			name: 'Naam',
			email: 'E-mailadres',
			phone: 'Telefoonnummer',
			eventDate: 'Datum',
			location: 'Locatie',
			guests: 'Aantal gasten',
			interests: 'Waar kies je voor?',
			toetjes: 'Tiramisu (De Toetjes Vrouw)',
			borrel: 'Burrata (De Borrel Baas)',
			both: 'Beide',
			message: 'Bericht'
		},
		placeholders: {
			message: 'Vertel ons over je feest, sfeer, locatie, eventuele wensen en meer.'
		},
		optional: 'optioneel',
		submit: 'Verstuur',
		submitting: 'Bezig met versturen…',
		successTitle: 'Bedankt!',
		successBody: 'We reageren meestal binnen 1–2 dagen.',
		errorTitle: 'Versturen mislukt',
		errorBody:
			'Er ging iets mis. Probeer het zo nog eens, of mail ons direct op info@hangendehapjes.nl.'
	},
	footer: {
		tagline: 'Live hapjes, heerlijk entertainend eten.',
		instagram: 'Instagram',
		facebook: 'Facebook',
		tiktok: 'TikTok',
		emailLabel: 'E-mail'
	}
};
