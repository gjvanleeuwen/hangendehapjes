export type Locale = 'nl' | 'en';

export type ProductBullet = string | { label: string; options: string[] };

export type Product = {
	id: 'toetjes' | 'borrel';
	name: string;
	pitch: string;
	priceFrom: string;
	priceNote: string;
	bullets: ProductBullet[];
	image: string;
	imageAlt: string;
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
		image: string;
		imageAlt: string;
	};
	about: {
		heading: string;
		body: string[];
	};
	products: {
		heading: string;
		intro: string;
		items: Product[];
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
		serviceTypes: {
			hapjes: { title: string; description: string };
			taart: { title: string; description: string };
		};
		options: {
			tiramisuLive: string;
			burrataLive: string;
			bruidstaart: string;
			millefeuille: string;
			tiramisuTaart: string;
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
			or: string;
		};
		placeholders: {
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
		readingHeading?: string;
		readingLinks?: { label: string; href: string }[];
	};
};
