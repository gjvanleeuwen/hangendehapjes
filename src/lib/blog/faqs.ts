export type BlogFaq = {
	id: string;
	question: string;
	answer: string;
};

export const BLOG_FAQS_NL = {
	allergies: {
		id: 'allergies',
		question: 'Hebben jullie opties voor allergieën of dieetwensen?',
		answer:
			'Ja, we denken graag mee. De tiramisu heeft mascarpone, ei en lange vingers als basis en is dus standaard niet lactosevrij of glutenvrij. De tiramisu kan ook alcoholvrij en cafeïnevrij gemaakt worden. De burrata-bowl is in basis vegetarisch en kan ook glutenvrij gemaakt worden. Geef in je aanvraag door welke allergieën of voorkeuren er spelen, dan kijken we welke aanpassingen passen. Voor strenge allergieën zijn we eerlijk dat we ter plekke werken, dus volledige kruisbesmettingsvrije productie kunnen we niet garanderen.'
	},
	leadtime: {
		id: 'leadtime',
		question: 'Hoe ver van tevoren moet ik Hangende Hapjes boeken?',
		answer:
			'Wij zijn nog tot kort voor het evenement te boeken en kunnen snel schakelen. Stuur ons gerust een verzoek via het contactformulier of bel ons op het telefoonnummer op de contactpagina. Ook al kunnen wij soms dezelfde dag nog jouw evenement van hapjes voorzien, wij raden aan om zeker 2 á 3 maanden van tevoren te boeken, zodat we de beschikbaarheid kunnen afstemmen.'
	}
} as const satisfies Record<string, BlogFaq>;

export type SharedBlogFaqId = keyof typeof BLOG_FAQS_NL;

export function buildFaqJsonLd(
	items: BlogFaq[],
	opts: { id: string; locale?: string }
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': opts.id,
		inLanguage: opts.locale ?? 'nl-NL',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer }
		}))
	};
}
