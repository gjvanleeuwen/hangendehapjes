import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const TOETJES_IMAGE = '/images/07.jpeg';
const BORREL_IMAGE = '/images/01.jpeg';

export const en: Translations = {
	meta: {
		title: 'Hangende Hapjes — live bites for your wedding or event',
		description:
			'Live tiramisu and burrata bowls, made on the spot for your guests. For weddings, receptions and parties. From Hilversum.'
	},
	nav: {
		about: 'About',
		products: 'Concepts',
		photos: 'Photos',
		contact: 'Contact',
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
			'That’s Charlotte and Gijs. Just 1 year married, almost 15 years together, and if there’s one thing that genuinely makes us happy, it’s putting on food for other people.',
			'After countless parties and dinners at home, we’re channelling that experience into our first catering concept. With a tray full of homemade bites, we walk between your guests. We have a chat, offer a smile and something tasty on a small plate.',
			'We don’t actually see eye to eye on food: Charlotte is more sweet and classic, Gijs more savoury and new. That only works in your favour, two concepts that complement each other nicely.'
		]
	},
	products: {
		heading: 'Will you pick sweet or savoury?',
		intro: 'One for the drinks, one for dessert. Bookable separately or together at the same party.',
		moreInfo: 'More info',
		lessInfo: 'Less info',
		items: [
			{
				id: 'toetjes',
				name: 'De Toetjes Vrouw',
				pitch: 'Fresh tiramisu that we build up like a tower while serving.',
				priceFrom: 'From €425',
				priceNote: '50 portions',
				bullets: [
					'Two ladyfingers, drenched with espresso and liqueur',
					'Classic mascarpone cream with pasteurised eggs',
					'And of course a nice layer of cocoa',
					'Homemade by Charlotte',
					'From €425 for 50 portions · €650 for 100 · €1,125 for 200'
				],
				image: TOETJES_IMAGE,
				imageAlt: 'Charlotte making live tiramisu for a guest'
			},
			{
				id: 'borrel',
				name: 'De Borrel Baas',
				pitch: 'Burrata bowl with toppings and dips of your choice for extra variety.',
				priceFrom: 'From €450',
				priceNote: '50 portions',
				bullets: [
					'Stracciatella — the creamy inside of a burrata',
					'Scrocchi toasts to dip with',
					'Two toppings of your choice (parma ham, tomatoes etc.)',
					'A sauce like pesto or balsamic vinaigrette',
					'From €450 for 50 portions · €700 for 100 · €1,225 for 200'
				],
				image: BORREL_IMAGE,
				imageAlt: 'Gijs making a live burrata bowl for a guest'
			}
		]
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
				id: 'booking',
				question: 'How does booking work?',
				answer:
					'Fill in the contact form with your date, location and number of guests. We’ll get back to you within 1–2 days with a tailored proposal. Sound good? Then the booking is set.'
			},
			{
				id: 'travel',
				question: 'Do you charge travel costs?',
				answer:
					'For parties up to 50 km from Hilversum we don’t charge any extra travel costs. Beyond that, we charge €0.45 per km.'
			},
			{
				id: 'combine',
				question: 'Can I book both concepts — and who comes?',
				answer:
					'Sure, separately or together at the same party. Some hosts pick De Borrel Baas during drinks and De Toetjes Vrouw at the dessert moment. Your guests can also say whether they’d rather see Charlotte or Gijs — including cross-overs, because Gijs makes great tiramisu and Charlotte makes great burrata bowls.'
			},
			{
				id: 'portion',
				question: 'How big is a portion?',
				answer:
					'A portion is about the same size as 3 or 4 standard bites (crostini, bar snacks etc.). Guests get a tidy little dish that’s well-filled with something tasty. We go for quality and you see it in how we present the bites and how they taste.'
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
		handle: '@hangendehapjes',
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
			message: 'Tell us about your party — vibe, venue, any wishes…'
		},
		optional: 'optional',
		submit: 'Send',
		submitting: 'Sending…',
		successTitle: 'Thanks!',
		successBody: 'We usually reply within 1–2 days.',
		errorTitle: 'Sending failed',
		errorBody:
			'Something went wrong. Try again in a bit, or email us directly at info@hangendehapjes.nl.'
	},
	footer: {
		tagline: 'Live bites, made on the spot.',
		basedIn: 'From Hilversum, the Netherlands',
		instagram: 'Instagram',
		emailLabel: 'Email'
	}
};
