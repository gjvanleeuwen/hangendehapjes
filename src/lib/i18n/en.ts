import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const TOETJES_IMAGE = '/images/07.jpeg';
const BORREL_IMAGE = '/images/01.jpeg';

export const en: Translations = {
	meta: {
		title: 'Hangende Hapjes | Live catering for your wedding or event',
		description:
			'Fresh tiramisu and burrata bowls, made on the spot for your guests. Bites & drinks catering for weddings, receptions and corporate events. From €395.'
	},
	nav: {
		about: 'About',
		products: 'Concepts',
		photos: 'Photos',
		contact: 'Contact',
		homeHref: '/en',
		switchLabel: 'NL',
		switchHref: '/',
		otherLabel: 'Nederlands'
	},
	hero: {
		eyebrow: 'Entertaining Food',
		title: 'Bites your guests will remember.',
		subtitle:
			'With a tray full of homemade bites, we walk between your guests. Something for everyone in a unique way, with a chat and a smile.',
		secondaryCta: 'See our concepts',
		image: HERO_IMAGE,
		imageAlt: 'Charlotte and Gijs of Hangende Hapjes with a tray hanging from their neck between guests'
	},
	about: {
		heading: 'Who do the bites hang from?',
		body: [
			'That’s Charlotte and Gijs. Almost one year married and 12 years together, and if there’s one thing that genuinely makes us happy, it’s putting on food for other people. We’re bringing the experience of countless parties and dinners at home into our first catering concept.',
			'But if there’s one thing we don’t see eye to eye on, it’s food. Charlotte has a real sweet tooth and loves baking, but is also a fan of "hearty" and "classic" food. Gijs on the other hand loves everything new and different, and savoury cooking is more his passion.',
			'Lucky for you, that only works in your favour! Two really fun concepts, savoury and sweet, for your wedding, drinks, reception, walking dinner or corporate event.'
		]
	},
	products: {
		heading: 'Will you pick sweet or savoury?',
		intro:
			'One for the drinks, one for dessert — or maybe both, as a midnight snack or walking dinner?',
		items: [
			{
				id: 'toetjes',
				name: 'De Toetjes Vrouw',
				pitch: 'Fresh tiramisu that we build up like a tower while serving.',
				priceFrom: 'From €395',
				priceNote: 'for 45 guests',
				portionNote: '1 portion per guest, about 2 to 3 standard bites in size.',
				bullets: [
					'Two ladyfingers, drenched with espresso and liqueur',
					'Classic mascarpone cream with pasteurised eggs',
					'And of course a nice layer of cocoa',
					'Homemade by Charlotte',
					'From €395 for 45 guests · €650 for 100 · €1,125 for 200'
				],
				image: TOETJES_IMAGE,
				imageAlt: 'Charlotte making live tiramisu for a guest'
			},
			{
				id: 'borrel',
				name: 'De Borrel Baas',
				pitch: 'Burrata bowl with your choice of toppings and dips.',
				priceFrom: 'From €420',
				priceNote: 'for 45 guests',
				portionNote: '1 portion per guest, about 2 to 3 standard bites in size.',
				bullets: [
					'Stracciatella — the creamy inside of a burrata',
					'Scrocchi toasts to dip with',
					{
						label: '2 toppings of your choice',
						options: [
							'crispy prosciutto',
							'tomato salsa',
							'pine nuts',
							'figs',
							'grilled peach',
							'spicy nduja',
							'pistachios',
							'parmigiano flakes'
						]
					},
					{
						label: '1 sauce of your choice',
						options: ['olive oil', 'balsamic', 'truffle oil', 'pesto', 'spicy honey']
					},
					'From €420 for 45 guests · €700 for 100 · €1,225 for 200'
				],
				image: BORREL_IMAGE,
				imageAlt: 'Gijs making a live burrata bowl for a guest'
			}
		],
		priceFooter: 'Prices exclude VAT · Travel costs free up to 50 km from Hilversum.'
	},
	faq: {
		eyebrow: 'Why Hangende Hapjes',
		why: [
			{
				heading: 'Food as Entertainment',
				body: 'Nobody forgets a bite that’s plated up live in front of them. We love dancing and chatting along with your guests while they get an experience to remember the event by.'
			},
			{
				heading: 'Personal & seriously tasty',
				body: 'It’s always Charlotte or Gijs, every email and every bite. We’re happy to adapt our clothing, bite choices and timing so it’s exactly what you’re looking for. And homemade tastes best, of course.'
			}
		],
		srHeading: 'Frequently asked questions',
		items: [
			{
				id: 'occasions',
				question: 'What kind of events do you serve?',
				answer:
					'Weddings, receptions, drinks parties and corporate events. Our bites work just as well as a walking dinner, a “grazing” moment during drinks, or a midnight snack late in the night. Drop us a line and we’ll think along.'
			},
			{
				id: 'booking',
				question: 'How does booking work?',
				answer:
					'Fill in the contact form with your date, location and number of guests. We’ll get back to you within 1–2 days with a tailored proposal. Sound good? Then the booking is set.'
			},
			{
				id: 'leadtime',
				question: 'How far in advance should I book?',
				answer:
					'We can often turn things around quickly, sometimes even same-day. To be safe, we recommend booking at least 2 to 3 months ahead. Send us your date and we’ll check straight away if it fits.'
			},
			{
				id: 'travel',
				question: 'Do you charge travel costs?',
				answer:
					'For parties up to 50 km from Hilversum we don’t charge any extra travel costs. Beyond that, we charge €0.45 per km.'
			},
			{
				id: 'combine',
				question: 'Can I book both concepts, and who comes to serve?',
				answer:
					'Sure, you can book both concepts separately or together at the same party. Some hosts pick De Borrel Baas during the drinks/reception and De Toetjes Vrouw for dessert. For the combination we charge around €80 extra for the additional prep across two menus. Both Gijs and Charlotte make delicious tiramisu and burrata bowls — who comes depends on availability and isn’t tied to which concept you pick.'
			},
			{
				id: 'portion',
				question: 'How big is a portion?',
				answer:
					'A portion is about the same size as 2 or 3 standard bites (crostini, bar snacks etc.). Guests get a tidy little dish that’s well-filled with something tasty. We go for quality and you see it in how we present the bites and how they taste.'
			},
			{
				id: 'diet',
				question: 'Do you cater for allergies or dietary preferences?',
				answer:
					'Yes, we’re happy to think along. The tiramisu uses mascarpone, egg and ladyfingers (not lactose- or gluten-free), but can be made alcohol-free and caffeine-free. The burrata bowl is vegetarian and can also be made gluten-free. Let us know in your request and we’ll see what works.'
			},
			{
				id: 'pace',
				question: 'How fast do you serve?',
				answer:
					'About 50 portions per hour per person. Want it faster? Then we bring an extra server along, at additional cost.'
			},
			{
				id: 'wear',
				question: 'What do you wear?',
				answer:
					'We match our clothing to the theme or dress code of your party. Just let us know in your request.'
			}
		]
	},
	reviews: {
		heading: 'What guests are saying',
		empty:
			'Hangende Hapjes has just started, quotes and reviews are coming here soon. Already tasted the bites? Feel free to send us a note.'
	},
	photos: {
		heading: 'In action',
		intro: 'The latest moments from our events are on Instagram.',
		cta: 'View Instagram'
	},
	contact: {
		heading: 'Book us for your party',
		intro:
			'Tell us briefly what you’re planning, then we’ll get back to you within 1–2 days with a proposal.',
		labels: {
			name: 'Name',
			email: 'Email',
			phone: 'Phone number',
			eventDate: 'Date',
			location: 'Location',
			guests: 'Number of guests',
			interests: 'What’s your pick?',
			toetjes: 'Tiramisu (De Toetjes Vrouw)',
			borrel: 'Burrata (De Borrel Baas)',
			both: 'Both',
			message: 'Message'
		},
		placeholders: {
			message: 'Tell us about your party, the vibe, venue, any wishes and more.'
		},
		optional: 'optional',
		submit: 'Send',
		submitting: 'Sending…',
		successTitle: 'Thanks!',
		successBody: 'We usually reply within 1–2 days.',
		errorTitle: 'Sending failed',
		errorBody:
			'Something went wrong. Try again in a bit, or email us directly at info@hangendehapjes.nl.',
		errorRateTitle: 'Just a moment',
		errorRateBody: 'You just submitted something. Try again in a minute.'
	},
	footer: {
		tagline: 'Live bites, deliciously entertaining food.',
		instagram: 'Instagram',
		facebook: 'Facebook',
		tiktok: 'TikTok',
		emailLabel: 'Email'
	}
};
