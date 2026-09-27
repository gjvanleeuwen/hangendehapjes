export type Locale = 'nl' | 'en';

export type ProductBullet = string | { label: string; options: string[] };

export type Product = {
	id: 'toetjes' | 'borrel';
	kicker: string;
	name: string;
	pitch: string;
	priceFrom: string;
	priceNote: string;
	bullets: ProductBullet[];
	image: string;
	imageAlt: string;
	video?: { playbackId: string; title: string };
	article?: { href: string; label: string };
};

/** A wedding cake card on the homepage; same shape as the live-concept cards. */
export type CakeCard = {
	id: string;
	kicker: string;
	name: string;
	pitch: string;
	priceFrom: string;
	priceNote: string;
	href: string;
	image: string;
	imageAlt: string;
	/** Optional Tailwind object-position class for the photo crop. */
	position?: string;
};

export type Translations = {
	meta: {
		title: string;
		description: string;
	};
	nav: {
		about: string;
		products: string;
		photos: string;
		contact: string;
		homeHref: string;
		switchLabel: string;
		switchHref: string;
		otherLabel: string;
	};
	hero: {
		eyebrow: string;
		title: string;
		subtitle: string;
		secondaryCta: string;
		/** Left half of the diagonal split: the hanging-tray concept. Also used as og:image alt. */
		image: string;
		imageAlt: string;
		/** Right half of the diagonal split: the tiramisu taart. */
		cakeImage: string;
		cakeImageAlt: string;
	};
	about: {
		heading: string;
		body: string[];
		photo: { src: string; alt: string };
	};
	products: {
		heading: string;
		intro: string;
		items: Product[];
		/** Sub-heading above the live-concept cards, e.g. "Hangende hapjes". */
		hapjesHeading: string;
		/** Wedding cakes, rendered inside the products section (anchor #bruidstaarten). */
		cakes?: {
			heading: string;
			items: CakeCard[];
		};
		priceFooter: string;
		priceCta: string;
	};
	faq: {
		eyebrow: string;
		why: { heading: string; body: string }[];
		srHeading: string;
		items: { id: string; question: string; answer: string }[];
	};
	reviews: {
		heading: string;
		empty: string;
		items: {
			name: string;
			rating: number;
			date: string;
			productId?: string;
			avatar?: string;
			quote: string[];
		}[];
		reviewNoun: { one: string; other: string };
		/** Suffix after the review count, e.g. "op Google". */
		sourceLabel: string;
		/** Link label on the review teaser, e.g. "Lees al onze reviews". */
		readAll: string;
		cta: {
			text: string;
			button: string;
			href: string;
		};
	};
	photos: {
		heading: string;
		intro: string;
		cta: string;
		blockedTitle: string;
		blockedBody: string;
	};
	contact: {
		heading: string;
		intro: string;
		labels: {
			name: string;
			email: string;
			phone: string;
			eventDate: string;
			location: string;
			guests: string;
			serviceType: string;
			choice: string;
			dagdeel: string;
			servingTime: string;
			referral: string;
			message: string;
		};
		options: {
			tiramisuLive: string;
			burrataLive: string;
			bruidstaart: string;
			millefeuille: string;
			tiramisuTaart: string;
			/** Sixth card: a custom request. */
			anders: string;
			andersNote: string;
		};
		dagdelen: {
			placeholder: string;
			taartmoment: string;
			receptie: string;
			feest: string;
			dessert: string;
			voorgerecht: string;
		};
		whatsapp: {
			cta: string;
			/** Word between the main button and the WhatsApp button, e.g. "of". */
			or: string;
			/** Lines of the prefilled WhatsApp message; only filled-in fields are added. */
			prefill: {
				greeting: string;
				choice: string;
				name: string;
				email: string;
				phone: string;
				date: string;
				guests: string;
				location: string;
			};
		};
		nav: {
			next: string;
			back: string;
		};
		placeholders: {
			name: string;
			email: string;
			phone: string;
			guests: string;
			location: string;
			message: string;
			referral: string;
			choice: string;
		};
		optional: string;
		submit: string;
		submitting: string;
		successTitle: string;
		successBody: string;
		errorTitle: string;
		errorBody: string;
		errorRateTitle: string;
		errorRateBody: string;
	};
	footer: {
		tagline: string;
		instagram: string;
		facebook: string;
		tiktok: string;
		whatsapp: string;
		emailLabel: string;
		photoCredit: string;
		readingLinks?: { label: string; href: string }[];
		resourceLinks?: { label: string; href: string }[];
	};
};
