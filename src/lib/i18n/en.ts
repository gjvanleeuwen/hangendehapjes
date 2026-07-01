import type { Translations } from './types';

const HERO_IMAGE = '/images/hero.jpeg';
const TOETJES_IMAGE = '/images/charlotte_main.jpeg';
const BORREL_IMAGE = '/images/HH_burrata_Parma.jpeg';

export const en: Translations = {
	meta: {
		title: 'Hangende Hapjes | Live catering for your wedding or event',
		description:
			'Fresh tiramisu and burrata bowls, made on the spot for your guests. Bites & drinks catering for weddings, receptions and corporate events. From €425.'
	},
	nav: {
		about: 'About',
		products: 'Concepts',
		cakes: 'Wedding cakes',
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
		imageAlt:
			'Charlotte and Gijs of Hangende Hapjes with a tray hanging from their neck between guests'
	},
	about: {
		heading: 'Who do the bites hang from?',
		body: [
			'That’s Charlotte and Gijs. Almost one year married and 12 years together, and if there’s one thing that genuinely makes us happy, it’s putting on food for other people. We’re bringing the experience of countless parties and dinners at home into our first catering concept.',
			'But if there’s one thing we don’t see eye to eye on, it’s food. Charlotte has a real sweet tooth and loves baking, but is also a fan of "hearty" and "classic" food. Gijs on the other hand loves everything new and different, and savoury cooking is more his passion.',
			'Lucky for you, that only works in your favour! Two really fun concepts, savoury and sweet, for your wedding, drinks, reception, walking dinner or corporate event.'
		],
		photo: {
			src: '/images/owners.jpeg',
			alt: 'Charlotte and Gijs of Hangende Hapjes together with their hanging tray'
		}
	},
	products: {
		heading: 'Will you pick sweet or savoury?',
		intro:
			'One for the drinks, one for dessert — or maybe both, as a midnight snack or walking dinner?',
		items: [
			{
				id: 'toetjes',
				kicker: 'Sweet · classic',
				name: 'Tiramisu',
				pitch: 'Fresh tiramisu built live for each guest while serving.',
				priceFrom: 'From €425',
				priceNote: 'for 50 guests',
				bullets: [
					'Two ladyfingers, drenched with espresso and liqueur',
					'Classic mascarpone cream with pasteurised eggs',
					'And of course a nice layer of cocoa',
					'Homemade by Charlotte',
					'From €425 for 50 portions · €650 for 100 · larger events on request'
				],
				image: TOETJES_IMAGE,
				imageAlt: 'Charlotte making live tiramisu for a guest',
				video: {
					playbackId: 'wAh8024FDNRT8VtuMTapIO5uHxiWIpr00d4t2aKMV8Stc',
					title: 'Fresh tiramisu built on the spot'
				}
			},
			{
				id: 'borrel',
				kicker: 'Savoury · new & different',
				name: 'Burrata',
				pitch: 'Burrata bowl with your choice of toppings and dips.',
				priceFrom: 'From €450',
				priceNote: 'for 50 guests',
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
					'From €450 for 50 portions · €700 for 100 · larger events on request'
				],
				image: BORREL_IMAGE,
				imageAlt:
					'A freshly built burrata bowl with crispy prosciutto, pine nuts and scrocchi toasts'
			}
		],
		cakeBanner: {
			kicker: 'Showstoppers by Charlotte',
			heading: 'We also make wedding cakes',
			body: 'From a classic tiered wedding cake to an Italian millefoglie or tiramisu for your wedding: the same homemade character, shaped into a cake moment for your celebration.',
			links: [
				{
					label: 'Classic wedding cake',
					href: '/blog/bruidstaart',
					image: '/images/bruitstaart_120_pers.jpeg',
					imageAlt: 'A couple cutting a tall classic wedding cake'
				},
				{
					label: 'Italian wedding cake',
					href: '/blog/italiaanse-bruidstaart',
					image: '/images/millefoglie_aansnijden.jpeg',
					imageAlt: 'A couple cutting an Italian millefoglie wedding cake together'
				},
				{
					label: 'Tiramisu at your wedding',
					href: '/blog/tiramisu-bruiloft',
					image: '/images/tiramisutaart_cacao.jpg',
					imageAlt: 'Tiramisu cake with cocoa as a wedding cake alternative'
				}
			]
		},
		priceFooter: 'Prices exclude VAT · Travel costs free up to 50 km from Hilversum.',
		priceCta: 'Request a quote'
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
				question: 'How does booking work and how far in advance?',
				answer:
					'Fill in the contact form with your date, location and number of guests. We’ll get back to you within 1–2 days with a tailored proposal. Sound good? Then the booking is set. We can often turn things around quickly, sometimes even same-day, but to be safe we recommend booking at least 2 to 3 months ahead.'
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
					'Sure, you can book both concepts separately or together at the same party. Some hosts pick the burrata during the drinks/reception and the tiramisu for dessert. Combine both at one event and you get €125 off, because we only have to travel out and set up once. Both Gijs and Charlotte make delicious tiramisu and burrata bowls — who comes depends on availability and isn’t tied to which concept you pick.'
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
			'Hangende Hapjes has just started, quotes and reviews are coming here soon. Already tasted the bites? Feel free to send us a note.',
		items: [
			{
				name: 'Stip Hilversum',
				rating: 5,
				date: '2026-06-11',
				productId: 'borrel',
				avatar:
					'https://lh3.googleusercontent.com/a-/ALV-UjV6dVUTj84XE0qV3PZrYxq7J4LroeRxqpwC99z7kGh-43-jYN4=w144-h144-p-rp-mo-br100',
				quote: [
					'For the opening of our new Stip office we brought in "Hangende Hapjes" for the catering, and that was an excellent choice. All afternoon they walked around with delicious Burrata Bowls, which went down a treat with our guests. There was plenty of choice between different toppings and sauces, so everyone could put together their own favourite combination.',
					'Beyond the excellent quality of the food, "Hangende Hapjes" also stands out for their personal and welcoming approach. They are always up for a chat or an explanation of the dishes and make sure guests feel welcome. The friendly service, professional look and tasteful dishes made our opening complete.',
					'We look back on a very successful collaboration and can wholeheartedly recommend "Hangende Hapjes" for any event.'
				]
			}
		],
		reviewNoun: { one: 'review', other: 'reviews' },
		cta: {
			text: 'Tasted our bites? Tell us how good they were.',
			button: 'Write a review',
			href: 'https://g.page/r/CYBafahKAvrMEBM/review'
		}
	},
	photos: {
		heading: 'In action',
		intro: 'The latest moments from our events are on Instagram.',
		cta: 'View Instagram',
		blockedTitle: 'The Instagram posts couldn’t load',
		blockedBody:
			'Your browser or an extension (like a tracker or cookie blocker) is blocking the embeds. No worries, you can find all our footage directly on Instagram.'
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
			serviceType: 'What’s your pick?',
			choice: 'And which one?',
			dagdeel: 'When should we serve?',
			servingTime: 'Or a time',
			referral: 'How did you hear about us?',
			message: 'Message'
		},
		serviceTypes: {
			hapjes: {
				title: 'Our hanging snacks',
				description: 'Made live in front of your guests, straight from the tray.'
			},
			taart: {
				title: 'A dessert or cake',
				description: 'A full dessert or cake, made by Charlotte.'
			}
		},
		options: {
			tiramisuLive: 'Tiramisu',
			burrataLive: 'Burrata',
			bruidstaart: 'Classic wedding cake',
			millefeuille: 'Italian millefeuille',
			tiramisuTaart: 'Tiramisu cake'
		},
		dagdelen: {
			placeholder: 'Pick a moment',
			taartmoment: 'Cake cutting',
			receptie: 'Reception/drinks',
			feest: 'Party',
			dessert: 'Dessert',
			voorgerecht: 'Starter/walking dinner'
		},
		whatsapp: {
			cta: 'Message us on WhatsApp',
			or: 'or'
		},
		steps: {
			choice: 'Your pick',
			event: 'Your party'
		},
		nav: {
			next: 'Next',
			back: 'Back'
		},
		modes: {
			form: 'Send an inquiry',
			direct: 'Message or call me'
		},
		callback: {
			heading: 'Fastest: a quick message or call',
			intro: 'Message us directly or leave your number and we’ll call you back.',
			label: 'Phone number',
			placeholder: 'Your number',
			submit: 'Call me back'
		},
		placeholders: {
			name: 'E.g. Charlotte de Vries',
			email: 'e.g. you@email.com',
			phone: 'e.g. 06 12 34 56 78',
			guests: 'e.g. 75',
			location: 'E.g. De Vorstin, Hilversum',
			message: 'Tell us about your party, the vibe, venue, any wishes and more.',
			referral: 'E.g. via Instagram, a friend, Google…',
			choice: 'Make a choice…'
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
		whatsapp: 'WhatsApp',
		emailLabel: 'Email',
		photoCredit: 'Photography by',
		resourceLinks: [
			{
				label: 'Catering in Hilversum',
				href: '/en/catering/hilversum'
			}
		]
	}
};
