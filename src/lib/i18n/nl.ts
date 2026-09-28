import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const HERO_CAKE_IMAGE = '/images/tiramisutaart_bruiloft_aansnijden.jpeg';
const TOETJES_IMAGE = '/images/tiramisu_dienblad_handen.jpeg';
const BORREL_IMAGE = '/images/burrata_closeup.jpeg';

export const nl: Translations = {
	meta: {
		title: 'Hangende Hapjes | Live catering voor jouw bruiloft of evenement',
		description:
			'Verse tiramisu, bruidstaarten en hartige snacks, ter plekke gemaakt voor jouw gasten. Hapjes en borrel catering voor bruiloften, recepties en zakelijke events.'
	},
	nav: {
		about: 'Over ons',
		products: 'Producten',
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
			'Ten midden van jullie gasten maken wij live met een praatje en een glimlach de lekkerste hapjes. Zelfs bruidstaarten bouwen wij op locatie zodat alles helemaal perfect is.',
		secondaryCta: 'Bekijk onze concepten',
		image: HERO_IMAGE,
		imageAlt: 'Charlotte en Gijs van Hangende Hapjes met een dienblad om de nek tussen gasten',
		cakeImage: HERO_CAKE_IMAGE,
		cakeImageAlt: 'Bruidspaar snijdt samen een grote tiramisutaart aan'
	},
	about: {
		heading: 'Aan wie hangen de hapjes?',
		body: [
			'Dat zijn Charlotte en Gijs. Net één jaar getrouwd en al 12 jaar samen, er is één ding waar wij echt blij van worden: eten verzorgen voor anderen. Buiten jaren in de horeca nemen we ook die ervaring van talloze feestjes en diners thuis nu mee naar ons eerste catering concept.',
			'Maar als er één ding is waar we niet eensgezind over zijn, is het wel etenskeuze. Charlotte is een echte bakker en zoetekauw maar ook een fan van "hearty" en "classic" eten. Daarentegen houdt Gijs juist van alles nieuw en anders en is hartig koken meer zijn passie.',
			'Gelukkig hebben jullie daar alleen maar profijt van! Twee super leuke concepten, hartig en zoet, voor jouw bruiloft, borrel, receptie, walking dinner of zakelijk event.'
		],
		photo: {
			src: '/images/owners.jpeg',
			alt: 'Charlotte en Gijs van Hangende Hapjes samen met hun hangende dienblad'
		}
	},
	products: {
		heading: 'Onze hapjes en taarten',
		intro:
			'Tiramisu of burrata, per gast live opgebouwd tussen jouw gasten door. Of een italiaanse/klassieke bruidstaart als showstopper. Wil je net wat anders dan denken we graag met je mee!',
		items: [
			{
				id: 'toetjes',
				kicker: 'Zoet · klassiek',
				name: 'Tiramisu',
				pitch: 'Verse tiramisu die we per gast live opbouwen bij het serveren.',
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
				imageAlt: 'Gijs strooit cacao over een verse portie tiramisu boven het hangende dienblad',
				article: { href: '/blog/tiramisu-bruiloft', label: 'Lees meer over onze tiramisu' }
			},
			{
				id: 'borrel',
				kicker: 'Hartig · nieuw & anders',
				name: 'Burrata',
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
				imageAlt: 'Een burrata-bowl wordt ter plekke opgemaakt boven het hangende dienblad',
				article: { href: '/blog/burrata-catering', label: 'Lees meer over onze burrata bar' }
			}
		],
		hapjesHeading: 'Hangende hapjes',
		cakes: {
			heading: 'Bruidstaarten',
			items: [
				{
					id: 'tiramisutaart',
					kicker: 'Zoet · ter plekke gebouwd',
					name: 'Tiramisutaart',
					pitch:
						'Een grote tiramisutaart die we op locatie opbouwen. Jullie maken hem zelf af met cacao.',
					priceFrom: 'Vanaf €475',
					priceNote: 'voor 50 personen',
					href: '/blog/tiramisu-bruiloft',
					image: '/images/tiramisutaart_bruiloft_punt.jpeg',
					imageAlt: 'Bruidspaar schept samen een punt tiramisutaart op een schaaltje',
					position: 'object-[30%_50%]'
				},
				{
					id: 'klassiek',
					kicker: 'Klassiek · op maat',
					name: 'Klassieke bruidstaart',
					pitch: 'Botercrèmetaart in 8 smaken, met afwerking en bloemen naar keuze.',
					priceFrom: 'Vanaf €11,50',
					priceNote: 'per persoon',
					href: '/blog/bruidstaart',
					image: '/images/bruitstaart_120_pers.jpeg',
					imageAlt: 'Bruidspaar snijdt een hoge klassieke bruidstaart aan'
				},
				{
					id: 'italiaans',
					kicker: 'Italiaans · vers fruit',
					name: 'Italiaanse bruidstaart',
					pitch: 'Millefoglie met dunne lagen bladerdeeg, luchtige room en vers rood fruit.',
					priceFrom: 'Vanaf €495',
					priceNote: 'voor 50 personen',
					href: '/blog/italiaanse-bruidstaart',
					image: '/images/millefoglie_aansnijden.jpeg',
					imageAlt: 'Bruidspaar snijdt samen een Italiaanse millefoglie bruidstaart aan'
				}
			]
		},
		priceFooter:
			'Prijzen excl. BTW · Reiskosten inbegrepen voor regio Gooi, Amsterdam en Utrecht · All-in service (inclusief dieetwensen)',
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
			},
			{
				heading: 'Unieke Bruidstaarten',
				body: 'Of het nou om een custom klassieke taart gaat met de beste smaken of een moderne Italiaanse taart, alles is zoals jullie het graag willen. Spektakel is gegarandeerd, helemaal als wij het live opbouwen en jullie zelf de laatste hand leggen.'
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
					'Vul het contactformulier in met je datum, locatie en aantal gasten. We komen binnen 1–2 dagen bij je terug met een voorstel op maat. Akkoord? Dan staat de boeking. Wij kunnen snel schakelen, soms zelfs op de dag zelf, maar voor zekerheid raden we aan om minstens 2 à 3 maanden van tevoren te boeken.'
			},
			{
				id: 'travel',
				question: 'Vragen jullie ook reiskosten?',
				answer:
					'In het Gooi, Amsterdam, Utrecht, Amersfoort en Almere zitten de reiskosten gewoon in de prijs. Daar voorbij rekenen we reiskosten voor de extra kilometers.'
			},
			{
				id: 'combine',
				question: 'Kan ik beide concepten boeken, en wie komt er serveren?',
				answer:
					'Zeker, je kan beide concepten los of samen op één feest boeken. Sommige hosts kiezen voor de burrata tijdens de borrel/receptie en de tiramisu als dessert. Een richtprijs voor een combi is de standaard vanafprijs voor beide concepten samen, met ongeveer €125 korting. Zowel Gijs als Charlotte maken heerlijke tiramisu en burrata-bowls; wie er komt is afhankelijk van de beschikbaarheid en is niet verbonden met de conceptkeuze.'
			},
			{
				id: 'portion',
				question: 'Hoe groot is een portie?',
				answer:
					'Een portie is ongeveer even groot als 2 à 3 standaard hapjes (crostini, bittergarnituur etc.). Gasten krijgen een net bakje dat goed gevuld is met lekkers. Wij gaan voor kwaliteit en dat zie je terug in de presentatie en smaak.'
			},
			{
				id: 'diet',
				question: 'Hebben jullie opties voor allergieën of dieetwensen?',
				answer:
					'Ja, we denken graag mee. De tiramisu kan alcoholvrij en cafeïnevrij, en we kunnen een lactose- en glutenvrije tiramisu als alternatief meenemen. Een vegan tiramisu hebben we helaas niet, voor vegan gasten nemen we een ander taartje mee. De burrata-bowl is vegetarisch en kan ook glutenvrij. Geef je wensen door in de aanvraag, dan kijken we wat past.'
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
			},
			{
				id: 'guests-change',
				question: 'Wat als het aantal gasten nog verandert?',
				answer:
					'Dat is geen probleem, tot 14 dagen voor je feest passen we het aantal porties gewoon aan. Ook zorgen wij er voor dat we altijd genoeg hebben, zelfs als er een paar extra gasten bij zijn gekomen.'
			},
			{
				id: 'space',
				question: 'Hoeveel ruimte hebben jullie nodig?',
				answer:
					'Met een klein hoekje voor onze koelkast zijn wij al tevreden, mocht er ook stroom en water beschikbaar zijn dan is dat helemaal fijn. Wij nemen eigenlijk alles mee (zelfs een tafel als nodig) dus de locatie hoeft met weinig rekening te houden.'
			}
		]
	},
	reviews: {
		heading: 'Wat gasten zeggen',
		empty:
			'Hangende hapjes is net begonnen, quotes en reviews komen hier binnenkort. Heb jij de hapjes al wel geproefd? Stuur ons gerust een berichtje.',
		items: [
			{
				name: 'Michael Demeulemeester',
				rating: 5,
				date: '2026-08-18',
				productId: 'toetjes',
				quote: [
					'Super service! Snel geregeld mooie show en iedereen vond de tiramisu erg lekker. Ook mogelijk voor glutenvrij, lactosevrij en alcoholvrij! Geweldig!'
				]
			},
			{
				name: 'Stip Hilversum',
				rating: 5,
				date: '2026-06-11',
				productId: 'borrel',
				avatar:
					'https://lh3.googleusercontent.com/a-/ALV-UjV6dVUTj84XE0qV3PZrYxq7J4LroeRxqpwC99z7kGh-43-jYN4=w144-h144-p-rp-mo-br100',
				quote: [
					'Voor de opening van ons nieuwe Stip-bureau hebben wij "Hangende Hapjes" ingeschakeld voor de catering, en dat was een uitstekende keuze. Gedurende de hele middag liepen zij rond met heerlijke Burrata Bowls, die bij onze gasten enorm in de smaak vielen. Er was volop keuze uit verschillende toppings en sauzen, waardoor iedereen zijn eigen favoriete combinatie kon samenstellen.',
					'Naast de uitstekende kwaliteit van het eten onderscheidt "Hangende Hapjes" zich ook door hun persoonlijke en gastvrije aanpak. Ze staan altijd open voor een praatje of een uitleg over de gerechten en zorgen ervoor dat gasten zich welkom voelen. De vriendelijke service, professionele uitstraling en smaakvolle gerechten maakten onze opening compleet.',
					'Wij kijken terug op een zeer geslaagde samenwerking en kunnen "Hangende Hapjes" van harte aanbevelen voor ieder evenement.'
				]
			}
		],
		reviewNoun: { one: 'review', other: 'reviews' },
		sourceLabel: 'op Google',
		readAll: 'Lees al onze reviews',
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
			'Vertel ons kort wat je van plan bent dan komen we binnen 1–2 dagen bij je terug met een voorstel.',
		labels: {
			name: 'Naam',
			email: 'E-mailadres',
			phone: 'Telefoonnummer',
			eventDate: 'Datum evenement',
			location: 'Locatie evenement',
			guests: 'Aantal gasten',
			serviceType: 'Waar kies jij voor?',
			choice: 'Wat heb je in gedachten?',
			dagdeel: 'Als welk onderdeel van je evenement?',
			servingTime: 'En hoe laat ongeveer?',
			referral: 'Hoe heb je over ons gehoord?',
			message: 'Bericht'
		},
		options: {
			tiramisuLive: 'Tiramisu',
			burrataLive: 'Burrata',
			bruidstaart: 'Klassieke bruidstaart',
			millefeuille: 'Italiaanse millefeuille',
			tiramisuTaart: 'Tiramisu Taart',
			anders: 'Anders',
			andersNote: 'Iets op maat'
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
			or: 'of',
			prefill: {
				greeting: 'Hoi! Ik heb een vraag over Hangende Hapjes 👋',
				choice: 'Interesse in',
				name: 'Naam',
				email: 'E-mail',
				phone: 'Telefoon',
				date: 'Datum',
				guests: 'Aantal gasten',
				location: 'Locatie'
			}
		},
		nav: {
			next: 'Volgende',
			back: 'Terug'
		},
		placeholders: {
			name: 'Bijv. Charlotte de Vries',
			email: 'bijv. jij@email.nl',
			phone: 'bijv. 06 12 34 56 78',
			guests: 'bijv. 75',
			location: 'Bijv. De Vorstin, Hilversum',
			message: 'Vertel ons over je feest, sfeer, locatie, eventuele wensen en meer.',
			referral: 'Bijv. via Instagram, een vriend, Google…',
			choice: 'Vertel kort wat je zoekt'
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
		photoCredit: 'Foto’s door',
		readingLinks: [
			{
				label: 'Tiramisu op je bruiloft',
				href: '/blog/tiramisu-bruiloft'
			},
			{
				label: 'Burrata bar op je feest',
				href: '/blog/burrata-catering'
			},
			{
				label: 'Italiaanse bruidstaart',
				href: '/blog/italiaanse-bruidstaart'
			},
			{
				label: 'Klassieke bruidstaart',
				href: '/blog/bruidstaart'
			}
		],
		resourceLinks: [
			{
				label: 'Catering in Hilversum',
				href: '/catering/hilversum'
			},
			{
				label: 'Hoeveel hapjes per persoon',
				href: '/blog/hoeveel-hapjes-per-persoon'
			},
			{
				label: 'Algemene voorwaarden',
				href: '/terms'
			}
		]
	}
};
