import type { Locale } from '$lib/i18n/types';
import { BLOG_FAQS_NL, type BlogFaq } from '$lib/blog/faqs';
import type { CollageImage } from '$lib/components/PhotoCollage.svelte';

/**
 * Content model for the landing pages under `/catering/[slug]` (and their
 * English mirrors under `/en/catering/[slug]`): location pages (`hilversum`)
 * and occasion pages (`bruiloft`, `bedrijfsfeest`).
 *
 * Every user-facing string lives here, in both locales, so adding a new
 * location (`het-gooi`, `amsterdam`, `utrecht`, ...) is a matter of dropping a
 * new entry into both `nl` and `en` below, no template duplication. Paragraph
 * strings may contain inline first-party `<a>` links; they are rendered with
 * `{@html}` in CateringLocation.svelte (trusted static copy, no user input).
 */
export type LocationSection = {
	/** Optional: a section that only shows `featuredReview` has no heading. */
	heading?: string;
	/** Paragraphs. May contain inline `<a>` markup (first-party, static). */
	body: string[];
	bullets?: string[];
	/**
	 * Render the review teaser for this product directly above the section
	 * heading. Only reviews tagged with this `productId` are shown, so the proof
	 * sits next to the concept it actually belongs to.
	 */
	reviewProductId?: 'toetjes' | 'borrel';
	/** Photo collage under the section (2, 3 or 6 photos fill the grid best). */
	gallery?: CollageImage[];
	/**
	 * Show this review (matched on `name` in `t.reviews.items`) in full, with
	 * logo, instead of a regular section.
	 */
	featuredReview?: string;
	/** Simple table rendered after the body (e.g. prices). Cells are plain text. */
	table?: { head: string[]; rows: string[][]; note?: string };
};

export type LocationContent = {
	slug: string;
	/** `<title>`, keep at or below 60 chars, head query front-loaded. */
	title: string;
	/** Meta description, 120 to 160 chars, value prop plus soft CTA, "je" voice. */
	description: string;
	/** Absolute URL to the Open Graph image. */
	ogImage: string;
	kicker: string;
	h1: string;
	intro: string[];
	/** Intro + concept narrative shown directly above the product cards. */
	productsLead: { heading: string; body: string[] };
	sections: LocationSection[];
	/** Personal "about us" block with the founders' photo, shown near the end. */
	about: { heading: string; body: string[]; imageAlt: string };
	/** Place names for the Service `areaServed` JSON-LD (city plus region towns). */
	areaServed: string[];
	/** Name of the catering Service node in JSON-LD. */
	serviceName: string;
	cta: { heading: string; body: string; offerButton: string; waButton: string; waText: string };
	faqHeading: string;
	faqIntro: string;
	faq: BlogFaq[];
};

const HILVERSUM_NL: LocationContent = {
	slug: 'hilversum',
	title: 'Live Catering Hilversum | Entertainend eten | Hangende Hapjes',
	description:
		'Catering in Hilversum nodig? Wij maken verse tiramisu en burrata-bowls, voor iedere gast uniek. Vanaf 50 porties, geen reiskosten en vaste prijzen.',
	ogImage: 'https://hangendehapjes.nl/images/owners.jpeg',
	kicker: 'Entertainend eten · lokale catering uit Hilversum',
	h1: 'Live catering in Hilversum: heerlijke hapjes ter plekke gemaakt voor elke gast',
	intro: [
		'Zoek je catering in Hilversum die er ook echt een leuk moment van maakt? Wij maken verse hapjes ter plekke, lopend tussen jouw gasten door. Kies voor zoet, hartig of allebei, hieronder zie je wat we maken. Altijd geleverd met een glimlach!'
	],
	productsLead: {
		heading: 'Entertainend eten: zoet of hartig?',
		body: [
			'Kies voor een van onze mobiele hapjes concepten: <strong>De Toetjes Vrouw</strong> loopt rond met een dienblad om de nek en bouwt voor elke gast een verse tiramisu op. Klassiek, zoet en per portie afgemaakt. <strong>De Borrel Baas</strong> maakt ter plekke hartige burrata-bowls, net even anders dan je gewend bent.',
			'Beide concepten kunnen gecombineerd worden en het bedienen doen wij als eigenaren zelf. Alles wordt live opgebouwd voor de beste kwaliteit en een gegarandeerd praatje en glimlach voor elke gast.'
		]
	},
	sections: [
		{
			heading: 'Waarom een cateraar uit Hilversum zelf',
			body: [
				'Omdat wij zelf in Hilversum wonen en hier ook onze hapjes maken, zijn we zo bij je. Of je feest nu in het Gooi is, in Bussum, Laren, Blaricum of Naarden, of in Hilversum zelf: de reis is kort en dus zijn er geen reiskosten. We kennen de trouwlocaties, feestzalen, tuinen en bedrijfspanden in de buurt en weten meestal precies hoe het op locatie werkt.',
				'Dat scheelt jou gedoe: korte lijntjes, snel langskomen om te proeven kan, en geen lange ritprijs op je offerte. Lokaal bestellen is gewoon makkelijker.'
			]
		},
		{
			heading: 'Voor welke feesten in Hilversum en het Gooi',
			body: [
				'We doen bruiloften, recepties, verjaardagen en jubilea, van een intieme borrel thuis tot een groot feest in een zaal. Of je nu een dessertmoment, een midnight snack of gewoon iets leuks tijdens de borrel zoekt, we passen ons aan jouw feest aan. Zakelijke borrels en bedrijfsfeesten doen we ook, daar lees je hieronder meer over.',
				'Gaan jullie trouwen? Alles over hapjes, bruidstaarten en prijzen voor je trouwdag lees je op onze pagina over <strong><a href="/catering/bruiloft">catering voor je bruiloft</a></strong>.'
			],
			bullets: [
				'Bruiloften en recepties in het Gooi',
				'Verjaardagen en jubilea, thuis of in een feestzaal',
				'Walking dinners, dessertmomenten en midnight snacks'
			],
			gallery: [
				{
					src: '/images/bruitstaart_120_pers.jpeg',
					alt: 'Bruidspaar snijdt een hoge klassieke bruidstaart aan'
				},
				{
					src: '/images/tiramisutaart_bruiloft_aansnijden.jpeg',
					alt: 'Bruidspaar snijdt samen een grote tiramisutaart aan'
				},
				{
					src: '/images/millefoglie_aansnijden.jpeg',
					alt: 'Bruidspaar snijdt samen een Italiaanse millefoglie bruidstaart aan'
				}
			]
		},
		{
			heading: 'Bedrijfsfeest of zakelijke borrel in Hilversum',
			reviewProductId: 'borrel',
			body: [
				'Of je nou een event hebt op het Mediapark, op de bedrijfscampus bij Nike of gewoon in het centrum van Hilversum, voor een zakelijke borrel of een bedrijfsfeest zijn wij altijd dichtbij. Wij wonen hier, dus een vrijdagmiddagborrel, een kantooropening of een personeelsfeest is voor ons zo geregeld.',
				'Voor de opening van hun nieuwe bureau in Hilversum liepen wij een middag rond met burrata-bowls voor <strong>Stip</strong>. Volop keuze in toppings en sauzen, zodat elke gast zijn eigen combinatie kon samenstellen. Meer over dat concept lees je op onze <strong><a href="/blog/burrata-catering">pagina over burrata catering</a></strong>.',
				'Hoe we zakelijke events aanpakken, van offerte tot factuur, lees je op onze pagina over <strong><a href="/catering/bedrijfsfeest">catering voor je bedrijfsfeest</a></strong>.'
			],
			bullets: [
				'Kantooropeningen, jubilea en relatie-events',
				'Personeelsfeesten en vrijdagmiddagborrels',
				'Recepties en zakelijke bijeenkomsten in het Gooi'
			],
			gallery: [
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs maakt een burrata-bowl af met saus, tussen de gasten van een evenement'
				},
				{
					src: '/images/charlotte_evenement.jpeg',
					alt: 'Charlotte geeft een gast een vers opgemaakte portie vanaf het hangende dienblad'
				},
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte met het hangende dienblad om de nek tussen de gasten van een borrel'
				}
			]
		},
		{
			heading: 'Wat het kost en wat we nodig hebben',
			body: [
				'We werken vanaf 50 porties. Tiramisu start vanaf €425 voor 50 porties, de burrata-bowls vanaf €450. In Hilversum en het Gooi zijn er meestal geen reiskosten; op locatie hebben we alleen een hoekje, een stopcontact en een waterkraan nodig.'
			]
		}
	],
	about: {
		heading: 'Even voorstellen: Charlotte en Gijs uit Hilversum',
		body: [
			'We wonen en werken in Hilversum en maken onze hapjes zelf op locatie. Wil je meer zien van Hangende Hapjes, onze concepten en wie wij zijn? <strong><a href="/">Bekijk dan de homepage</a></strong>.'
		],
		imageAlt: 'Charlotte en Gijs van Hangende Hapjes, cateraars uit Hilversum'
	},
	areaServed: ['Hilversum', 'Bussum', 'Laren', 'Blaricum', 'Naarden', 'Het Gooi'],
	serviceName: 'Live catering in Hilversum',
	cta: {
		heading: 'Catering in Hilversum nodig? Stuur ons je datum.',
		body: 'Geef je datum, locatie en aantal gasten door, dan hoor je dezelfde dag nog van ons met een voorstel op maat. Tiramisu, burrata of allebei: wij denken graag met je mee.',
		offerButton: 'Vraag een voorstel aan',
		waButton: 'Stuur een WhatsApp',
		waText: 'Hoi! Ik wil graag catering in Hilversum bij Hangende Hapjes 👋'
	},
	faqHeading: 'Veelgestelde vragen',
	faqIntro: 'De vragen die we het vaakst krijgen over hapjes bestellen in Hilversum en het Gooi.',
	faq: [
		{
			id: 'hilversum-omgeving',
			question: 'Komen jullie ook buiten Hilversum, in de rest van het Gooi?',
			answer:
				'Zeker. Hilversum is onze thuisbasis, maar we komen net zo makkelijk in Bussum, Laren, Blaricum, Naarden en de rest van het Gooi. Daar zitten de reiskosten gewoon in de prijs, net als in Amsterdam, Utrecht, Amersfoort en Almere. Wil je ons ergens verder weg hebben? Dat kan ook, daar voorbij rekenen we reiskosten voor de extra kilometers.'
		},
		{
			id: 'hilversum-prijs',
			question: 'Wat kost catering in Hilversum?',
			answer:
				'We werken vanaf 50 porties (1 portie = 1 gast). De live tiramisu start vanaf €425 voor 50 porties, de burrata-bowls vanaf €450. Binnen Hilversum en het Gooi zitten de reiskosten in die prijs, dus wat je in de offerte ziet is wat je betaalt. Stuur je datum en aantal gasten, dan maken we een voorstel op maat.'
		},
		{
			id: 'hilversum-zakelijk',
			question: 'Doen jullie ook bedrijfsfeesten en zakelijke borrels?',
			answer:
				'Ja, regelmatig, van het Mediapark tot het centrum van Hilversum. Voor bedrijven werken we met een vaste prijs en een factuur achteraf. Hoe dat precies werkt lees je op onze <a href=\"/catering/bedrijfsfeest\">pagina over catering voor je bedrijfsfeest</a>.'
		},
		BLOG_FAQS_NL.allergies,
		BLOG_FAQS_NL.leadtime
	]
};

const HILVERSUM_EN: LocationContent = {
	slug: 'hilversum',
	title: 'Catering Hilversum | Live bites & desserts | Hangende Hapjes',
	description:
		'Need catering in Hilversum? We make fresh tiramisu and burrata bowls live, right among your guests. From 50 portions, low travel costs. Get your quote.',
	ogImage: 'https://hangendehapjes.nl/images/owners.jpeg',
	kicker: 'Entertaining food · local catering from Hilversum',
	h1: 'Catering in Hilversum, live bites on the spot',
	intro: [
		'Entertaining food is what it’s all about for us. Looking for catering in Hilversum that turns it into a real moment? We make fresh bites on the spot, walking around among your guests. Pick sweet, savoury or both, you can see what we make right below.'
	],
	productsLead: {
		heading: 'What we do: sweet, savoury or both',
		body: [
			"We come in two flavours, literally. Charlotte is <strong>De Toetjes Vrouw</strong>: she walks around with a tray slung from her neck and builds a fresh tiramisu for each guest. Classic, sweet and finished per portion. Gijs is <strong>De Borrel Baas</strong>: he makes savoury burrata bowls on the spot, a little different from what you're used to.",
			'Pick one, or both, and your guests choose sweet or savoury themselves. Everything is built live, so no empty or collapsed platters, and a chat for everyone. Pick De Toetjes Vrouw, De Borrel Baas, or both at your party in Hilversum:'
		]
	},
	sections: [
		{
			heading: 'Why a caterer from Hilversum itself',
			body: [
				"Because we're based in Hilversum, we're with you in no time. Whether your party is in Het Gooi, in Bussum, Laren, Blaricum or Naarden, or in Hilversum itself: the trip is short and travel costs are low or zero. We know the wedding venues, party halls, gardens and company spaces nearby and usually know exactly how things work on location.",
				'That saves you hassle: short lines, dropping by for a taste is easy, and no long travel fee on your quote. Ordering locally is simply easier.'
			]
		},
		{
			heading: 'For which parties in Hilversum and Het Gooi',
			body: [
				'We do weddings, receptions, birthdays and anniversaries, from an intimate get-together at home to a big party in a venue. Whether you want a dessert moment, a midnight snack or just something fun during drinks, we adapt to your party. We do business drinks and company parties too, there’s more on those just below.',
				'Getting married? Everything about bites, wedding cakes and prices for your big day is on our page about <strong><a href="/en/catering/bruiloft">wedding catering</a></strong>.'
			],
			bullets: [
				'Weddings and receptions in Het Gooi',
				'Birthdays and anniversaries, at home or in a venue',
				'Walking dinners, dessert moments and midnight snacks'
			],
			gallery: [
				{
					src: '/images/bruitstaart_120_pers.jpeg',
					alt: 'A couple cutting a tall classic wedding cake'
				},
				{
					src: '/images/tiramisutaart_bruiloft_aansnijden.jpeg',
					alt: 'A newlywed couple cutting a large tiramisu cake together'
				},
				{
					src: '/images/millefoglie_aansnijden.jpeg',
					alt: 'A couple cutting an Italian millefoglie wedding cake together'
				}
			]
		},
		{
			heading: 'Company parties and business drinks in Hilversum',
			reviewProductId: 'borrel',
			body: [
				'Whether your event is at the Mediapark, on the business campus at Nike or right in the centre of Hilversum, we’re always close by for a business drinks or a company party. We live here, so Friday afternoon drinks, an office opening or a staff party is easy for us to fit in.',
				'For the opening of their new office in Hilversum we spent an afternoon walking around with burrata bowls for <strong>Stip</strong>. Plenty of choice in toppings and sauces, so every guest could put together their own combination.',
				'How we handle business events, from quote to invoice, is on our page about <strong><a href="/en/catering/bedrijfsfeest">company party catering</a></strong>.'
			],
			bullets: [
				'Office openings, anniversaries and client events',
				'Staff parties and Friday afternoon drinks',
				'Receptions and business gatherings across Het Gooi'
			],
			gallery: [
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs finishing a burrata bowl with sauce among the guests at an event'
				},
				{
					src: '/images/charlotte_evenement.jpeg',
					alt: 'Charlotte handing a guest a freshly made portion from the hanging tray'
				},
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte with the hanging tray among the guests at a drinks reception'
				}
			]
		},
		{
			heading: 'What it costs and what we need',
			body: [
				'We work from 50 portions. Tiramisu starts from €425 for 50 portions, the burrata bowls from €450. In Hilversum and Het Gooi there are usually no travel costs; on location we only need a corner, a power socket and a tap.'
			]
		}
	],
	about: {
		heading: 'Meet Charlotte and Gijs from Hilversum',
		body: [
			'We live and work in Hilversum and make our bites ourselves on location. Want to see more of Hangende Hapjes, our concepts and who we are? <strong><a href="/en">Visit the homepage</a></strong>.'
		],
		imageAlt: 'Charlotte and Gijs of Hangende Hapjes, caterers from Hilversum'
	},
	areaServed: ['Hilversum', 'Bussum', 'Laren', 'Blaricum', 'Naarden', 'Het Gooi'],
	serviceName: 'Live catering in Hilversum',
	cta: {
		heading: 'Need catering in Hilversum? Send us your date.',
		body: "Send us your date, location and guest count, and you'll hear from us the same day with a tailored proposal. Tiramisu, burrata or both: we're happy to think along.",
		offerButton: 'Request a proposal',
		waButton: 'Send a WhatsApp',
		waText: 'Hi! I’d love catering in Hilversum from Hangende Hapjes 👋'
	},
	faqHeading: 'Frequently asked questions about catering in Hilversum',
	faqIntro: 'The questions we get most often about ordering snacks in Hilversum and Het Gooi.',
	faq: [
		{
			id: 'hilversum-omgeving',
			question: 'Do you also come outside Hilversum, to the rest of Het Gooi?',
			answer:
				'Absolutely. Hilversum is our home base, but we just as easily come to Bussum, Laren, Blaricum, Naarden and the rest of Het Gooi. Travel is included there, and the same goes for Amsterdam, Utrecht, Amersfoort and Almere. Want us somewhere further out? That works too, we just build the travel into your quote so you see one total.'
		},
		{
			id: 'hilversum-prijs',
			question: 'What does catering in Hilversum cost?',
			answer:
				'We work from 50 portions (1 portion = 1 guest). The live tiramisu starts from €425 for 50 portions, the burrata bowls from €450. Within Hilversum and Het Gooi travel is part of that price, so what you see in the quote is what you pay. Send your date and guest count and we’ll make a tailored proposal.'
		},
		{
			id: 'hilversum-zakelijk',
			question: 'Do you also do company parties and business drinks?',
			answer:
				'Yes, regularly, from the Mediapark to the centre of Hilversum. For companies we work with a fixed price and an invoice afterwards. How that works exactly is on our <a href=\"/en/catering/bedrijfsfeest\">company party catering page</a>.'
		},
		{
			id: 'allergies',
			question: 'Do you have options for allergies or dietary preferences?',
			answer:
				'Yes, we’re happy to think along. The tiramisu is based on mascarpone, egg and ladyfingers, so by default it isn’t lactose-free or gluten-free. The tiramisu can also be made alcohol-free and caffeine-free. The burrata bowl is vegetarian at its base and can be made gluten-free too. Tell us in your request which allergies or preferences are in play, and we’ll see which adjustments fit. For severe allergies we’re honest that we work on the spot, so we can’t guarantee fully cross-contamination-free production.'
		},
		{
			id: 'leadtime',
			question: 'How far in advance should I book Hangende Hapjes?',
			answer:
				'We can still be booked until shortly before the event and can move fast. Feel free to send us a request via the contact form, or call the number on the contact page. Even though we can sometimes cater your event the same day, we recommend booking at least 2 to 3 months ahead so we can line up availability.'
		}
	]
};

const WEDDING_CAKE_GALLERY_NL: CollageImage[] = [
	{
		src: '/images/bruitstaart_120_pers.jpeg',
		alt: 'Bruidspaar snijdt een hoge klassieke bruidstaart aan'
	},
	{
		src: '/images/tiramisutaart_bruiloft_aansnijden.jpeg',
		alt: 'Bruidspaar snijdt samen een grote tiramisutaart aan'
	},
	{
		src: '/images/millefoglie_ons.jpeg',
		alt: 'Charlotte en Gijs met een Italiaanse millefoglie bruidstaart op hun eigen bruiloft'
	}
];

const WEDDING_CAKE_GALLERY_EN: CollageImage[] = [
	{
		src: '/images/bruitstaart_120_pers.jpeg',
		alt: 'A couple cutting a tall classic wedding cake'
	},
	{
		src: '/images/tiramisutaart_bruiloft_aansnijden.jpeg',
		alt: 'A newlywed couple cutting a large tiramisu cake together'
	},
	{
		src: '/images/millefoglie_ons.jpeg',
		alt: 'Charlotte and Gijs with an Italian millefoglie wedding cake at their own wedding'
	}
];

const BRUILOFT_NL: LocationContent = {
	slug: 'bruiloft',
	title: 'Catering bruiloft: live hapjes op locatie | Hangende Hapjes',
	description:
		'Catering voor je bruiloft: verse tiramisu en burrata-bowls, ter plekke gemaakt tussen jullie gasten door. Ook bruidstaarten. Vanaf 50 porties, vanaf €425.',
	ogImage: 'https://hangendehapjes.nl/images/tiramisutaart_bruiloft_aansnijden.jpeg',
	kicker: 'Bruiloft catering · live tussen jullie gasten door',
	h1: 'Catering voor je bruiloft: hapjes die we live voor elke gast maken',
	intro: [
		'Zoeken jullie catering voor je bruiloft die meer is dan een schaal met hapjes? Wij lopen met een dienblad om de nek tussen jullie gasten door en maken voor iedere gast ter plekke een verse portie. Zoet, hartig of allebei, en als jullie willen ook de bruidstaart. Zo wordt eten gewoon een van de leuke momenten van de dag.'
	],
	productsLead: {
		heading: 'Zoet of hartig? Of allebei',
		body: [
			'De <strong>tiramisu</strong> bouwen we voor elke gast vers op: klassiek, zoet en per portie afgemaakt. De <strong>burrata-bowls</strong> maken we ter plekke met toppings en een saus naar keuze, hartig en net even anders dan je gewend bent.',
			'Jullie kunnen één concept kiezen of ze combineren. Sommige stellen kiezen de burrata tijdens de receptie en de tiramisu als dessert.'
		]
	},
	sections: [
		{
			heading: 'Op welk moment van jullie trouwdag?',
			body: [
				'Wij lopen minimaal een uur tussen de gasten door, op het moment dat jullie kiezen. Dit zijn de momenten waarop bruidsparen ons het vaakst inzetten:'
			],
			bullets: [
				'Receptie na de ceremonie: verse burrata-bowls bij de borrel',
				'Walking dinner: als voorgerecht of als aanvulling op de cateraar van de locatie',
				'Dessert: tiramisu die we per gast opbouwen, in plaats van een dessertbuffet of sweet table',
				'Taartmoment: een bruidstaart die we op locatie opbouwen',
				'Midnight snack: laat op de avond nog een ruime portie, in plaats van een frietje'
			],
			gallery: [
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte met het hangende dienblad om de nek tussen de gasten van een feest'
				},
				{
					src: '/images/tiramisu_dienblad_gijs.jpeg',
					alt: 'Gijs strooit cacao over een verse portie tiramisu boven het dienblad'
				},
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs maakt een burrata-bowl af met saus, tussen de gasten van een feest'
				}
			]
		},
		{
			heading: 'Hoeveel heb je nodig?',
			body: [
				'Een portie van ons staat gelijk aan ongeveer 2 à 3 standaard hapjes, dus reken op 1 à 2 porties per gast. Een volledig walking dinner vervangen we niet, maar we werken graag samen met de cateraar of locatie die de basis verzorgt. Meer over hoeveelheden lees je in <strong><a href="/blog/hoeveel-hapjes-per-persoon">hoeveel hapjes per persoon</a></strong>.'
			]
		},
		{
			heading: 'Ook de taart: klassiek, Italiaans of tiramisu',
			reviewProductId: 'toetjes',
			body: [
				'Ook voor de bruidstaart kun je bij ons terecht. We bakken een <strong><a href="/blog/bruidstaart">klassieke bruidstaart</a></strong> op maat in botercrème, met afwerking en bloemen naar keuze, en proeven zit bij de prijs in.',
				'De <strong><a href="/blog/italiaanse-bruidstaart">Italiaanse millefoglie</a></strong> maken we op locatie vers af. En de <strong><a href="/blog/tiramisu-bruiloft">tiramisutaart</a></strong> bouwen we ter plekke op, waarna jullie hem zelf afmaken met cacao. Wij weten hoe dat voelt: op onze eigen bruiloft stond er ook een millefoglie.'
			],
			gallery: WEDDING_CAKE_GALLERY_NL
		},
		{
			heading: 'Geen foodtruck, geen rij: wij komen naar je gasten',
			body: [
				'Bij een foodtruck of buffet staan gasten vaak even in de rij. Bij ons niet: we lopen met het dienblad om de nek tussen jullie gasten door en maken de portie waar ze staan. Zo blijft iedereen in gesprek en krijgt elke gast er een praatje bij.',
				'Op de trouwlocatie hebben we weinig nodig: een hoekje voor onze koelkast, en stroom en water als dat er is. De rest nemen we zelf mee. Onze kleding stemmen we af op jullie thema of dresscode.'
			]
		},
		{
			heading: 'Wat kost catering op je bruiloft?',
			body: [
				'We werken vanaf 50 porties, 1 portie is 1 gast. Alle prijzen zijn exclusief btw. Bij de live hapjes zit alles erin: het maken, het serveren tussen je gasten door, servies en servetten en de afwas.'
			],
			table: {
				head: ['', '50 gasten', '100 gasten'],
				rows: [
					['Tiramisu, live opgebouwd', '€425', '€650'],
					['Burrata-bowls, live opgemaakt', '€450', '€700'],
					['Klassieke bruidstaart', 'vanaf €11,50 p.p.', 'vanaf €11,50 p.p.'],
					['Italiaanse millefoglie', 'vanaf €495', 'op aanvraag'],
					['Tiramisutaart', 'vanaf €475', 'op aanvraag']
				],
				note: 'Tiramisu en burrata samen op één bruiloft? Dan krijg je ongeveer €125 korting op de vanafprijzen samen. Meer dan 100 gasten: op aanvraag.'
			}
		},
		{
			heading: 'Reiskosten en gasten die nog wisselen',
			body: [
				'In het Gooi, Amsterdam, Utrecht, Amersfoort en Almere zitten de reiskosten gewoon in de prijs. Daar voorbij rekenen we reiskosten voor de extra kilometers. Verandert het aantal gasten nog? Tot 14 dagen voor jullie bruiloft passen we het aantal porties aan.'
			]
		}
	],
	about: {
		heading: 'Even voorstellen: Charlotte en Gijs',
		body: [
			'Wij zijn Charlotte en Gijs uit Hilversum, net een jaar getrouwd. We weten dus nog precies hoe het is om een bruiloft te plannen. Meer over ons en onze concepten zie je op <strong><a href="/">de homepage</a></strong>.'
		],
		imageAlt: 'Charlotte en Gijs van Hangende Hapjes met hun hangende dienblad'
	},
	areaServed: ['Hilversum', 'Het Gooi', 'Amsterdam', 'Utrecht', 'Amersfoort', 'Almere'],
	serviceName: 'Live catering voor bruiloften',
	cta: {
		heading: 'Catering voor jullie bruiloft? Stuur ons je trouwdatum.',
		body: 'Geef je datum, locatie en aantal gasten door, dan hoor je dezelfde dag nog van ons met een voorstel op maat. Hapjes, bruidstaart of allebei: wij denken graag met jullie mee.',
		offerButton: 'Vraag een voorstel aan',
		waButton: 'Stuur een WhatsApp',
		waText: 'Hoi! Wij gaan trouwen en zijn benieuwd naar Hangende Hapjes 👋'
	},
	faqHeading: 'Veelgestelde vragen over catering op je bruiloft',
	faqIntro: 'De vragen die bruidsparen ons het vaakst stellen.',
	faq: [
		{
			id: 'bruiloft-gasten',
			question: 'Hoeveel gasten kunnen jullie bedienen?',
			answer:
				'Per bediende maken we ongeveer 50 porties per uur. Bij meer dan 100 gasten raden we een extra bediende aan, zodat iedereen binnen het tijdsblok aan de beurt komt. Dat kost iets meer en zie je gewoon terug in de offerte.'
		},
		{
			id: 'bruiloft-locatie',
			question: 'Wat hebben jullie nodig op de trouwlocatie?',
			answer:
				'Heel weinig. Met een klein hoekje voor onze koelkast zijn we al tevreden, en als er stroom en water is, is dat helemaal fijn. Verder nemen we alles zelf mee, dus de locatie hoeft nergens rekening mee te houden.'
		},
		{
			id: 'bruiloft-combi',
			question: 'Kunnen we tiramisu én burrata kiezen?',
			answer:
				'Zeker. Je kunt beide concepten los of samen op één bruiloft boeken, bijvoorbeeld burrata bij de receptie en tiramisu als dessert. Samen krijg je ongeveer €125 korting op de vanafprijzen.'
		},
		BLOG_FAQS_NL.allergies
	]
};

const BRUILOFT_EN: LocationContent = {
	slug: 'bruiloft',
	title: 'Wedding catering: live bites on the spot | Hangende Hapjes',
	description:
		'Wedding catering your guests remember: fresh tiramisu and burrata bowls, made on the spot among your guests. Wedding cakes too. From 50 portions, from €425.',
	ogImage: 'https://hangendehapjes.nl/images/tiramisutaart_bruiloft_aansnijden.jpeg',
	kicker: 'Wedding catering · live among your guests',
	h1: 'Wedding catering: bites we make live for every guest',
	intro: [
		'Looking for wedding catering that’s more than a platter of bites? We walk around among your guests with a tray slung from the neck and make a fresh portion for every guest on the spot. Sweet, savoury or both, and the wedding cake too if you like. That way the food becomes one of the fun moments of the day.'
	],
	productsLead: {
		heading: 'Sweet or savoury? Or both',
		body: [
			'We build the <strong>tiramisu</strong> fresh for every guest: classic, sweet and finished per portion. We make the <strong>burrata bowls</strong> on the spot with toppings and a sauce of choice: savoury, and a little different from what you’re used to.',
			'You can pick one concept or combine them. Some couples choose the burrata during the reception and the tiramisu for dessert.'
		]
	},
	sections: [
		{
			heading: 'Which moment of your wedding day?',
			body: [
				'We walk around among your guests for at least an hour, at the moment you choose. These are the moments couples book us for most:'
			],
			bullets: [
				'Reception after the ceremony: fresh burrata bowls with the drinks',
				'Walking dinner: as a starter or alongside the venue’s caterer',
				'Dessert: tiramisu built per guest, instead of a dessert buffet or sweet table',
				'Cake moment: a wedding cake we build on location',
				'Midnight snack: a generous portion late in the evening, instead of fries'
			],
			gallery: [
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte with the hanging tray among the guests at a party'
				},
				{
					src: '/images/tiramisu_dienblad_gijs.jpeg',
					alt: 'Gijs dusting cocoa over a fresh portion of tiramisu above the tray'
				},
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs finishing a burrata bowl with sauce among the guests at a party'
				}
			]
		},
		{
			heading: 'How much do you need?',
			body: [
				'One of our portions equals about 2 to 3 standard bites, so count on 1 to 2 portions per guest. We don’t replace a full walking dinner, but we’re happy to work alongside the caterer or venue that handles the main food.'
			]
		},
		{
			heading: 'The cake too: classic, Italian or tiramisu',
			reviewProductId: 'toetjes',
			body: [
				'We do wedding cakes too. We bake a classic buttercream wedding cake to order, with the finish and flowers of your choice, and a tasting is included in the price.',
				'We finish the Italian millefoglie fresh on location. And we build the tiramisu cake on the spot, after which you finish it yourselves with cocoa. We know the feeling: there was a millefoglie at our own wedding too.'
			],
			gallery: WEDDING_CAKE_GALLERY_EN
		},
		{
			heading: 'No food truck, no queue: we come to your guests',
			body: [
				'With a food truck or buffet, guests often end up waiting in line. Not with us: we walk around among your guests with the tray slung from the neck and make the portion where they stand. Everyone stays in conversation and every guest gets a chat.',
				'At the venue we need very little: a corner for our fridge, plus power and water if available. We bring everything else ourselves. We match our clothing to your theme or dress code.'
			]
		},
		{
			heading: 'What does wedding catering cost?',
			body: [
				'We work from 50 portions, 1 portion is 1 guest. All prices exclude VAT. For the live bites everything is included: making, serving among your guests, tableware and napkins, and the washing up.'
			],
			table: {
				head: ['', '50 guests', '100 guests'],
				rows: [
					['Tiramisu, built live', '€425', '€650'],
					['Burrata bowls, made live', '€450', '€700'],
					['Classic wedding cake', 'from €11.50 p.p.', 'from €11.50 p.p.'],
					['Italian millefoglie', 'from €495', 'on request'],
					['Tiramisu cake', 'from €475', 'on request']
				],
				note: 'Tiramisu and burrata together at one wedding? You get about €125 off the combined starting prices. More than 100 guests: on request.'
			}
		},
		{
			heading: 'Travel costs and changing guest numbers',
			body: [
				'In Het Gooi, Amsterdam, Utrecht, Amersfoort and Almere travel is simply included. Beyond that we charge travel for the extra kilometres. Guest count still changing? Up to 14 days before your wedding we adjust the number of portions.'
			]
		}
	],
	about: {
		heading: 'Meet Charlotte and Gijs',
		body: [
			'We’re Charlotte and Gijs from Hilversum, married just a year ago. So we still know exactly what planning a wedding is like. See more about us and our concepts on <strong><a href="/en">the homepage</a></strong>.'
		],
		imageAlt: 'Charlotte and Gijs of Hangende Hapjes with their hanging tray'
	},
	areaServed: ['Hilversum', 'Het Gooi', 'Amsterdam', 'Utrecht', 'Amersfoort', 'Almere'],
	serviceName: 'Live wedding catering',
	cta: {
		heading: 'Wedding catering? Send us your wedding date.',
		body: 'Send us your date, location and guest count, and you’ll hear from us the same day with a tailored proposal. Bites, wedding cake or both: we’re happy to think along.',
		offerButton: 'Request a proposal',
		waButton: 'Send a WhatsApp',
		waText: 'Hi! We’re getting married and would love to hear about Hangende Hapjes 👋'
	},
	faqHeading: 'Frequently asked questions about wedding catering',
	faqIntro: 'The questions couples ask us most often.',
	faq: [
		{
			id: 'bruiloft-gasten',
			question: 'How many guests can you serve?',
			answer:
				'Each server makes about 50 portions per hour. For more than 100 guests we recommend an extra server, so everyone gets their turn within the time slot. That costs a little more and simply shows up in the quote.'
		},
		{
			id: 'bruiloft-locatie',
			question: 'What do you need at the wedding venue?',
			answer:
				'Very little. A small corner for our fridge is enough, and power and water are a bonus. We bring everything else ourselves, so the venue doesn’t need to plan around us.'
		},
		{
			id: 'bruiloft-combi',
			question: 'Can we choose both tiramisu and burrata?',
			answer:
				'Absolutely. You can book both concepts separately or together at one wedding, for example burrata at the reception and tiramisu for dessert. Together you get about €125 off the combined starting prices.'
		},
		{
			id: 'allergies',
			question: 'Do you have options for allergies or dietary preferences?',
			answer:
				'Yes, we’re happy to think along. The tiramisu is based on mascarpone, egg and ladyfingers, so by default it isn’t lactose-free or gluten-free. The tiramisu can also be made alcohol-free and caffeine-free. The burrata bowl is vegetarian at its base and can be made gluten-free too. Tell us in your request which allergies or preferences are in play, and we’ll see which adjustments fit. For severe allergies we’re honest that we work on the spot, so we can’t guarantee fully cross-contamination-free production.'
		}
	]
};

const BEDRIJFSFEEST_NL: LocationContent = {
	slug: 'bedrijfsfeest',
	title: 'Live catering bedrijfsfeest en borrel | Hangende Hapjes',
	description:
		'Catering voor je bedrijfsfeest of zakelijke borrel: verse burrata-bowls en tiramisu, live gemaakt tussen je gasten door. Vaste prijs, factuur achteraf.',
	ogImage: 'https://hangendehapjes.nl/images/hero.jpeg',
	kicker: 'Zakelijk · bedrijfsfeest, borrel en events',
	h1: 'Catering voor je bedrijfsfeest: live hapjes die mensen met elkaar laten praten',
	intro: [
		'Organiseer je een bedrijfsfeest, personeelsfeest of zakelijke borrel? Wij lopen met een dienblad om de nek tussen je gasten door en maken voor iedereen ter plekke een verse portie. Hartig, zoet of allebei. Lekker eten, en een moment waar je collega’s en relaties het nog even over hebben.'
	],
	productsLead: {
		heading: 'Hartig bij de borrel, zoet als afsluiter',
		body: [
			'De <strong><a href="/blog/burrata-catering">burrata-bowls</a></strong> maken we ter plekke, hartig, met toppings en een saus naar keuze. De <strong>tiramisu</strong> bouwen we voor elke gast vers op. Je kiest één concept of combineert ze, bijvoorbeeld burrata tijdens de borrel en tiramisu aan het eind.'
		]
	},
	sections: [
		{
			heading: 'Waarom live catering werkt op een zakelijk event',
			body: [
				'Omdat we rondlopen en per gast een portie opmaken, komen mensen vanzelf met elkaar in gesprek. Je hoeft niemand aan te sporen om te mengen, dat gebeurt gewoon rond het dienblad. Bij een borrel met collega’s of relaties die elkaar nog niet kennen is dat precies wat je wil.',
				'En het blijft makkelijk: geen buffet om op te bouwen, geen schalen die leeg raken. Wij nemen alles mee en hebben alleen een hoekje, een stopcontact en een waterkraan nodig.'
			],
			gallery: [
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs maakt een burrata-bowl af met saus, tussen de gasten van een evenement'
				},
				{
					src: '/images/charlotte_evenement.jpeg',
					alt: 'Charlotte geeft een gast een vers opgemaakte portie vanaf het hangende dienblad'
				},
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte met het hangende dienblad om de nek tussen de gasten van een borrel'
				}
			]
		},
		{
			heading: 'Voor welke zakelijke events',
			body: [
				'We passen ons aan jouw programma aan, of het nu een vrijdagmiddagborrel is of een groot personeelsfeest. Verzorgt de locatie of een andere cateraar al het eten? Dan komen wij er gewoon bij, als live moment op het tijdstip dat jij kiest.'
			],
			bullets: [
				'Kantooropeningen en jubilea',
				'Personeelsfeesten en vrijdagmiddagborrels',
				'Relatie-events, recepties en netwerkborrels',
				'Als aanvulling naast de cateraar van de locatie'
			]
		},
		{
			featuredReview: 'Stip Hilversum',
			body: []
		},
		{
			heading: 'Zakelijk makkelijk geregeld',
			body: [
				'Je stuurt ons de datum, het aantal gasten en het tijdslot, en dezelfde dag nog ligt er een offerte met een vaste prijs.'
			],
			bullets: [
				'Prijzen exclusief btw',
				'Geen aanbetaling voor bedrijven: je krijgt de factuur achteraf',
				'Tijden afgestemd op jullie programma, precies tijdens de borrel of receptie',
				'Kleding afgestemd op het thema of de dresscode van je event'
			]
		},
		{
			heading: 'Wat het kost',
			body: [
				'We werken vanaf 50 porties, 1 portie is 1 gast. Alle prijzen zijn exclusief btw en alles zit erin: het maken, het serveren tussen je gasten door, servies en servetten en de afwas.'
			],
			table: {
				head: ['Porties', 'Tijd en bezetting', 'Burrata', 'Tiramisu'],
				rows: [
					['50', '1 uur, 1 bediende', '€450', '€425'],
					['100', '1 uur, 2 bedienden (of 2 uur, 1)', '€700', '€650'],
					['200', '2 uur, 2 bedienden', '€1.200', '€1.150']
				],
				note: 'Beide concepten op één event: ongeveer €125 korting op de vanafprijzen samen. Reiskosten zitten erin in het Gooi, Amsterdam, Utrecht, Amersfoort en Almere.'
			}
		}
	],
	about: {
		heading: 'Even voorstellen: Charlotte en Gijs',
		body: [
			'Hangende Hapjes zijn wij, Charlotte en Gijs uit Hilversum. Elke mail en elk hapje komt van ons zelf. Zit je event in de regio? Lees ook over <strong><a href="/catering/hilversum">catering in Hilversum</a></strong>, of bekijk <strong><a href="/">de homepage</a></strong>.'
		],
		imageAlt: 'Charlotte en Gijs van Hangende Hapjes met hun hangende dienblad'
	},
	areaServed: ['Hilversum', 'Het Gooi', 'Amsterdam', 'Utrecht', 'Amersfoort', 'Almere'],
	serviceName: 'Live catering voor bedrijfsfeesten en zakelijke borrels',
	cta: {
		heading: 'Bedrijfsfeest of borrel in de planning? Stuur ons je datum.',
		body: 'Geef je datum, locatie, aantal gasten en tijdslot door, dan hoor je dezelfde dag nog van ons met een offerte met vaste prijs.',
		offerButton: 'Vraag een offerte aan',
		waButton: 'Stuur een WhatsApp',
		waText: 'Hoi! Ik zoek catering voor een zakelijk event bij Hangende Hapjes 👋'
	},
	faqHeading: 'Veelgestelde vragen over catering voor je bedrijfsfeest',
	faqIntro: 'De vragen die we van bedrijven het vaakst krijgen.',
	faq: [
		{
			id: 'zakelijk-naast-cateraar',
			question: 'Kunnen jullie naast de cateraar van de locatie werken?',
			answer:
				'Ja, dat doen we vaak. De locatie of een andere cateraar verzorgt dan de basis, en wij komen erbij als live moment: burrata tijdens de borrel, tiramisu als afsluiter. Andere cateraars werken graag met ons samen, omdat we extra capaciteit en entertainment meebrengen.'
		},
		{
			id: 'zakelijk-groot',
			question: 'Kunnen jullie ook grote groepen aan?',
			answer:
				'Ja. Per bediende maken we ongeveer 50 porties per uur. Voor groepen boven de 100 gasten komt er een extra bediende mee, zodat iedereen binnen het tijdsblok aan de beurt komt. Dat zie je gewoon terug in de offerte.'
		},
		{
			id: 'zakelijk-ruimte',
			question: 'Wat hebben jullie nodig op locatie?',
			answer:
				'Een klein hoekje voor onze koelkast, en stroom en water als dat er is. Verder nemen we alles zelf mee, dus op kantoor of op de eventlocatie hoeft niemand iets voor ons te regelen.'
		},
		BLOG_FAQS_NL.leadtime
	]
};

const BEDRIJFSFEEST_EN: LocationContent = {
	slug: 'bedrijfsfeest',
	title: 'Live catering for company parties | Hangende Hapjes',
	description:
		'Catering for your company party or business drinks: fresh burrata bowls and tiramisu, made live among your guests. Fixed price, invoice afterwards.',
	ogImage: 'https://hangendehapjes.nl/images/hero.jpeg',
	kicker: 'Business · company parties, drinks and events',
	h1: 'Company party catering: live bites that get people talking',
	intro: [
		'Organising a company party, staff party or business drinks? We walk around among your guests with a tray slung from the neck and make a fresh portion for everyone on the spot. Savoury, sweet or both. Great food, and a moment your colleagues and clients will talk about afterwards.'
	],
	productsLead: {
		heading: 'Savoury with the drinks, sweet to finish',
		body: [
			'We make savoury <strong>burrata bowls</strong> on the spot, with toppings and a sauce of choice, and build a fresh <strong>tiramisu</strong> for every guest. Pick one concept or combine them, for example burrata during the drinks and tiramisu at the end.'
		]
	},
	sections: [
		{
			heading: 'Why live catering works at a business event',
			body: [
				'Because we walk around and finish a portion per guest, people end up talking to each other on their own. You don’t have to nudge anyone to mingle, it just happens around the tray. For drinks with colleagues or clients who haven’t met yet, that’s exactly what you want.',
				'And it stays easy: no buffet to set up, no platters running empty. We bring everything and only need a corner, a power socket and a tap.'
			],
			gallery: [
				{
					src: '/images/gijs_evenement.jpeg',
					alt: 'Gijs finishing a burrata bowl with sauce among the guests at an event'
				},
				{
					src: '/images/charlotte_evenement.jpeg',
					alt: 'Charlotte handing a guest a freshly made portion from the hanging tray'
				},
				{
					src: '/images/hero.jpeg',
					alt: 'Charlotte with the hanging tray among the guests at a drinks reception'
				}
			]
		},
		{
			heading: 'Which business events',
			body: [
				'We fit around your programme, whether it’s Friday afternoon drinks or a big staff party. Is the venue or another caterer already handling the food? Then we simply join in, as a live moment at the time you choose.'
			],
			bullets: [
				'Office openings and anniversaries',
				'Staff parties and Friday afternoon drinks',
				'Client events, receptions and networking drinks',
				'Alongside the venue’s own caterer'
			]
		},
		{
			featuredReview: 'Stip Hilversum',
			body: []
		},
		{
			heading: 'Easy to arrange for businesses',
			body: [
				'Send us the date, the guest count and the time slot, and the same day you’ll have a quote with a fixed price.'
			],
			bullets: [
				'Prices exclude VAT',
				'No deposit for companies: you get the invoice afterwards',
				'Timing fitted to your programme, right during the drinks or reception',
				'Clothing matched to the theme or dress code of your event'
			]
		},
		{
			heading: 'What it costs',
			body: [
				'We work from 50 portions, 1 portion is 1 guest. All prices exclude VAT and everything is included: making, serving among your guests, tableware and napkins, and the washing up.'
			],
			table: {
				head: ['Portions', 'Time and staffing', 'Burrata', 'Tiramisu'],
				rows: [
					['50', '1 hour, 1 server', '€450', '€425'],
					['100', '1 hour, 2 servers (or 2 hours, 1)', '€700', '€650'],
					['200', '2 hours, 2 servers', '€1,200', '€1,150']
				],
				note: 'Both concepts at one event: about €125 off the combined starting prices. Travel is included in Het Gooi, Amsterdam, Utrecht, Amersfoort and Almere.'
			}
		}
	],
	about: {
		heading: 'Meet Charlotte and Gijs',
		body: [
			'Hangende Hapjes is us, Charlotte and Gijs from Hilversum. Every email and every bite comes from us. Is your event in the area? Read about <strong><a href="/en/catering/hilversum">catering in Hilversum</a></strong>, or visit <strong><a href="/en">the homepage</a></strong>.'
		],
		imageAlt: 'Charlotte and Gijs of Hangende Hapjes with their hanging tray'
	},
	areaServed: ['Hilversum', 'Het Gooi', 'Amsterdam', 'Utrecht', 'Amersfoort', 'Almere'],
	serviceName: 'Live catering for company parties and business drinks',
	cta: {
		heading: 'Company party or drinks coming up? Send us your date.',
		body: 'Send us your date, location, guest count and time slot, and you’ll hear from us the same day with a fixed-price quote.',
		offerButton: 'Request a quote',
		waButton: 'Send a WhatsApp',
		waText: 'Hi! I’m looking for catering for a business event from Hangende Hapjes 👋'
	},
	faqHeading: 'Frequently asked questions about company party catering',
	faqIntro: 'The questions companies ask us most often.',
	faq: [
		{
			id: 'zakelijk-naast-cateraar',
			question: 'Can you work alongside the venue’s caterer?',
			answer:
				'Yes, we often do. The venue or another caterer handles the main food, and we join as a live moment: burrata during the drinks, tiramisu to finish. Other caterers like working with us because we bring extra capacity and entertainment.'
		},
		{
			id: 'zakelijk-groot',
			question: 'Can you handle large groups?',
			answer:
				'Yes. Each server makes about 50 portions per hour. For groups over 100 guests an extra server comes along, so everyone gets their turn within the time slot. That simply shows up in the quote.'
		},
		{
			id: 'zakelijk-ruimte',
			question: 'What do you need on location?',
			answer:
				'A small corner for our fridge, plus power and water if available. We bring everything else ourselves, so nobody at the office or venue has to arrange anything for us.'
		},
		{
			id: 'leadtime',
			question: 'How far in advance should I book Hangende Hapjes?',
			answer:
				'We can still be booked until shortly before the event and can move fast. Feel free to send us a request via the contact form, or call the number on the contact page. Even though we can sometimes cater your event the same day, we recommend booking at least 2 to 3 months ahead so we can line up availability.'
		}
	]
};

/** Typed slug to content map per locale. Add new slugs in both locales. */
export const cateringLocations: Record<Locale, Record<string, LocationContent>> = {
	nl: { hilversum: HILVERSUM_NL, bruiloft: BRUILOFT_NL, bedrijfsfeest: BEDRIJFSFEEST_NL },
	en: { hilversum: HILVERSUM_EN, bruiloft: BRUILOFT_EN, bedrijfsfeest: BEDRIJFSFEEST_EN }
};

export function getLocation(locale: Locale, slug: string): LocationContent | undefined {
	return cateringLocations[locale]?.[slug];
}
