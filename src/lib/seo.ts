const SCRIPT_END = '</' + 'script>';
const SCRIPT_START_LD = '<' + 'script type="application/ld+json">';

export function jsonLdScript(data: unknown): string {
	const safe = JSON.stringify(data).replaceAll(SCRIPT_END, '<\\/script>');
	return SCRIPT_START_LD + safe + SCRIPT_END;
}

type ReviewInput = {
	name: string;
	rating: number;
	date: string;
	quote: string[];
};

/**
 * Build just the `aggregateRating` fragment for a set of reviews — the overall
 * "business profile style" score + count, with no individual review nodes.
 * Returns `{}` when there are none so it can be spread unconditionally.
 */
export function aggregateRatingJsonLd(items: ReviewInput[]) {
	if (items.length === 0) return {};
	const ratings = items.map((review) => review.rating);
	return {
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1),
			reviewCount: ratings.length,
			bestRating: 5,
			worstRating: 1
		}
	};
}

/**
 * Build the `aggregateRating` + individual `review` JSON-LD fragment for a set of
 * reviews, to be spread into a Product/Service node. Returns `{}` when there are
 * none. Only attach this to a node on a page where the review text is actually
 * visible to users (Google requires that).
 */
export function reviewsJsonLd(items: ReviewInput[]) {
	if (items.length === 0) return {};
	return {
		...aggregateRatingJsonLd(items),
		review: items.map((review) => ({
			'@type': 'Review',
			author: { '@type': 'Organization', name: review.name },
			datePublished: review.date,
			reviewRating: {
				'@type': 'Rating',
				ratingValue: review.rating,
				bestRating: 5,
				worstRating: 1
			},
			reviewBody: review.quote.join('\n\n')
		}))
	};
}
