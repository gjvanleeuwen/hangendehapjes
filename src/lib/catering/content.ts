import type { Locale } from '$lib/i18n/types';
import { BLOG_FAQS_NL, type BlogFaq } from '$lib/blog/faqs';

/**
 * Content model for the local landing pages under `/catering/[slug]`
 * (and their English mirrors under `/en/catering/[slug]`).
 *
 * Every user-facing string lives here, in both locales, so adding a new
 * location (`het-gooi`, `amsterdam`, `utrecht`, ...) is a matter of dropping a
 * new entry into both `nl` and `en` below, no template duplication. Paragraph
 * strings may contain inline first-party `<a>` links; they are rendered with
 * `{@html}` in CateringLocation.svelte (trusted static copy, no user input).
 */
export type LocationSection = {
	heading: string;
	/** Paragraphs. May contain inline `<a>` markup (first-party, static). */
	body: string[];
	bullets?: string[];
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
	h1: 'Heerlijke hapjes ter plekke gemaakt voor elke gast',
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
				'We doen bruiloften, recepties, borrels, verjaardagen en bedrijfsfeesten, van een intieme borrel thuis tot een groot personeelsfeest of congres. Of je nu een dessertmoment, een midnight snack of gewoon iets leuks tijdens de borrel zoekt, we passen ons aan jouw feest aan.'
			],
			bullets: [
				'Bruiloften en recepties in het Gooi',
				'Bedrijfsfeesten en borrels in en rond Hilversum',
				'Verjaardagen en feesten thuis of in een feestzaal'
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
		body: 'Geef je datum, locatie en aantal gasten door, dan komen we binnen 1–2 dagen terug met een voorstel op maat. Tiramisu, burrata of allebei: wij denken graag met je mee.',
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
				'Zeker. Hilversum is onze thuisbasis, maar we komen net zo makkelijk in Bussum, Laren, Blaricum, Naarden en de rest van het Gooi. Tot 50 km vanaf Hilversum zitten de reiskosten in de prijs, en het Gooi valt daar ruim binnen. Ook in Amsterdam en Utrecht zijn we te boeken; daarvoor rekenen we €0,45 per kilometer boven die 50 km.'
		},
		{
			id: 'hilversum-prijs',
			question: 'Wat kost catering in Hilversum?',
			answer:
				'We werken vanaf 50 porties (1 portie = 1 gast). De live tiramisu start vanaf €425 voor 50 porties, de burrata-bowls vanaf €450. Binnen Hilversum en het Gooi zijn de reiskosten meestal nul, omdat we tot 50 km vanaf Hilversum geen reiskosten rekenen. Stuur je datum en aantal gasten, dan maken we een voorstel op maat.'
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
				'We do weddings, receptions, drinks, birthdays and company parties, from an intimate get-together at home to a big staff party. Whether you want a dessert moment, a midnight snack or just something fun during drinks, we adapt to your party.'
			],
			bullets: [
				'Weddings and receptions in Het Gooi',
				'Company parties and drinks in and around Hilversum',
				'Birthdays and parties at home or in a venue'
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
		body: "Send us your date, location and guest count, and we'll get back within 1–2 days with a tailored proposal. Tiramisu, burrata or both: we're happy to think along.",
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
				'Absolutely. Hilversum is our home base, but we just as easily come to Bussum, Laren, Blaricum, Naarden and the rest of Het Gooi. Up to 50 km from Hilversum travel costs are included, and Het Gooi falls well within that. We can also be booked in Amsterdam and Utrecht; for those we charge €0.45 per kilometre beyond 50 km.'
		},
		{
			id: 'hilversum-prijs',
			question: 'What does catering in Hilversum cost?',
			answer:
				'We work from 50 portions (1 portion = 1 guest). The live tiramisu starts from €425 for 50 portions, the burrata bowls from €450. Within Hilversum and Het Gooi travel costs are usually zero, because we charge none up to 50 km from Hilversum. Send your date and guest count and we’ll make a tailored proposal.'
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

/** Typed slug to content map per locale. Add new slugs in both locales. */
export const cateringLocations: Record<Locale, Record<string, LocationContent>> = {
	nl: { hilversum: HILVERSUM_NL },
	en: { hilversum: HILVERSUM_EN }
};

export function getLocation(locale: Locale, slug: string): LocationContent | undefined {
	return cateringLocations[locale]?.[slug];
}
