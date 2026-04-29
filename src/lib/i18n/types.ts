export type Locale = 'nl' | 'en';

export type Product = {
	id: 'toetjes' | 'borrel';
	name: string;
	pitch: string;
	priceFrom: string;
	priceNote: string;
	bullets: string[];
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
	};
	photos: {
		heading: string;
		intro: string;
		cta: string;
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
			interests: string;
			toetjes: string;
			borrel: string;
			both: string;
			message: string;
		};
		placeholders: {
			message: string;
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
		emailLabel: string;
		readingHeading?: string;
		readingLinks?: { label: string; href: string }[];
	};
};
