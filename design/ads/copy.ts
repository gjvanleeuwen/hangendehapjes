/**
 * Foto's en tekst van de tiramisu-nov26 carrousels. Geen tekst op de beelden:
 * de woorden staan in Ads Manager (primaire tekst, kop per kaart). Herschrijf
 * hier, dan staat alles bij elkaar; de beelden bouw je met `bun design/ads/build.ts`.
 *
 * Het verhaal, in drie foto's: het taartmoment op een echte bruiloft, het stel
 * dat de laatste cacao strooit, en pas als laatste wij.
 *
 * Drie varianten tegelijk, zelfde kaarten, andere opening:
 *   kasteel  opent op de kasteelfoto
 *   shoot    opent op de cacao-foto, kasteel als tweede
 *   split    opent op kasteel en cacao samen in één diagonale split
 *
 * De renders in out/ staan niet in git (zie .gitignore): ze zijn hieruit te
 * herbouwen en de bytes leven in de Meta-beeldbibliotheek. Wat er live staat
 * (ad/creative ids, image hashes) staat in published.ts.
 */

export const campaign = 'tiramisu-nov26';
export const landing = 'https://hangendehapjes.nl/blog/tiramisu-bruiloft';
export const link = (content: string) =>
	`${landing}?utm_source=instagram&utm_medium=paid&utm_campaign=${campaign}&utm_content=${content}`;

export type Card = {
	photo: string;
	/** object-position van de foto, bijv. '50% 40%' */
	position?: string;
	/** tweede foto onder een diagonale naad, zoals de hero op de site */
	bottom?: { photo: string; position?: string };
	/** kop onder de kaart in Ads Manager (max ~40 tekens), Gijs herschrijft */
	headline: string;
};

export type Ad = { id: string; name: string; cards: Card[] };

const kasteel: Card = {
	photo: 'tiramisutaart_bruiloft_aansnijden.jpeg',
	position: '50% 50%',
	headline: 'Tiramisutaart op jullie bruiloft'
};
const cacao: Card = {
	photo: 'tiramisutaart_cacao.jpg',
	position: '50% 50%',
	headline: 'Samen afmaken met cacao'
};
const proeven: Card = {
	photo: 'tiramisutaart_hapje.jpg',
	position: '50% 15%',
	headline: 'Een echte showstopper'
};
const wij: Card = {
	photo: 'owners.jpeg',
	position: '50% 40%',
	headline: 'Vanaf €375 voor 30 gasten'
};

export const ads: Ad[] = [
	{ id: 'kasteel', name: 'tiramisu-nov26 carousel kasteel', cards: [kasteel, cacao, wij] },
	{ id: 'shoot', name: 'tiramisu-nov26 carousel shoot', cards: [cacao, kasteel, wij] },
	{
		id: 'split',
		name: 'tiramisu-nov26 carousel split',
		cards: [
			{
				...kasteel,
				position: '50% 60%',
				bottom: { photo: 'tiramisutaart_cacao.jpg', position: '50% 55%' }
			},
			proeven,
			wij
		]
	}
];

/** Primaire tekst en knop, zelfde voor alle drie. De hook is de eerste zin; Gijs herschrijft. */
export const adCopy = {
	primary:
		'Een tiramisutaart als bruidstaart. Wij bouwen hem op locatie op, met jullie namen of Just Married in de cacao, en jullie snijden hem samen aan. Vanaf €375 voor 30 gasten, reiskosten inbegrepen tot 30 km rond Hilversum. Check of jullie datum nog vrij is.',
	cta: 'Meer informatie'
};
