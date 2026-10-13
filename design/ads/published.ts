/**
 * Wat er in Meta staat, per campagne. Dit is het enige dat we versioneren van
 * de advertenties zelf: de beelden zijn reproduceerbaar (copy.ts + build.ts) en
 * de bytes staan in de Meta-beeldbibliotheek onder de image hash. Geen JPG's in
 * git, geen static/ads map.
 *
 * Nieuwe variant publiceren:
 *   1. kaart toevoegen in copy.ts, `bun design/ads/build.ts <id>`
 *   2. beeld naar Meta (NotFair createAdImage met base64 uit out/<id>/, of
 *      tijdelijk hosten en de URL geven), hash hieronder noteren
 *   3. creative + ad aanmaken (PAUSED), ids hieronder noteren
 *
 * md5 is van het bestand in out/<id>/ op het moment van uploaden, zodat je
 * ziet of een render nog overeenkomt met wat live staat.
 */

export type PublishedCard = { card: string; md5: string; imageHash: string };
export type PublishedAd = {
	id: string;
	adId: string;
	creativeId: string;
	status: 'control' | 'variant';
	published: string;
	utmContent?: string;
	cards: PublishedCard[];
};

export const account = '1284397237145748';
export const campaignId = '120247368787730665';
export const adSetId = '120247368787710665';

export const published: PublishedAd[] = [
	{
		id: 'split',
		adId: '120247368787720665',
		creativeId: '1106453155192844',
		status: 'control',
		published: '2026-10-13',
		cards: [
			{
				card: 'card-1',
				md5: '3fe01ad13cd95e34cf859ed736004528',
				imageHash: 'f8c14d29a1fa6ae7f34c3e9737f02989'
			},
			{
				card: 'card-2',
				md5: '1ab6de750c1de74a52c082f316722474',
				imageHash: '5f7a21042edd1c328731dbb5eb5faeae'
			},
			{
				card: 'card-3',
				md5: 'e675379158f101b77720e1ab01d0806b',
				imageHash: 'b36cb5b73cb0211ac36b136411fdabdd'
			}
		]
	},
	{
		id: 'kasteel',
		adId: '120247371511950665',
		creativeId: '1630592771855964',
		status: 'variant',
		published: '2026-10-13',
		utmContent: 'kasteel',
		cards: [
			{
				card: 'card-1',
				md5: '1d135660df9d7d3c804a972593ea6609',
				imageHash: '254943fd5982623e96d17469343bdac7'
			},
			{
				card: 'card-2',
				md5: '6bef34f6b8efa45788baa642561a5ef5',
				imageHash: 'ff300ec0d8b1c5a6a1e9c17f966588d8'
			},
			{
				card: 'card-3',
				md5: 'e675379158f101b77720e1ab01d0806b',
				imageHash: 'b36cb5b73cb0211ac36b136411fdabdd'
			}
		]
	},
	{
		id: 'shoot',
		adId: '120247371514000665',
		creativeId: '1712026003218139',
		status: 'variant',
		published: '2026-10-13',
		utmContent: 'shoot',
		cards: [
			{
				card: 'card-1',
				md5: '6bef34f6b8efa45788baa642561a5ef5',
				imageHash: 'ff300ec0d8b1c5a6a1e9c17f966588d8'
			},
			{
				card: 'card-2',
				md5: '1d135660df9d7d3c804a972593ea6609',
				imageHash: '254943fd5982623e96d17469343bdac7'
			},
			{
				card: 'card-3',
				md5: 'e675379158f101b77720e1ab01d0806b',
				imageHash: 'b36cb5b73cb0211ac36b136411fdabdd'
			}
		]
	}
];
