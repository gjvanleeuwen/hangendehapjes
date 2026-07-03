import { error } from '@sveltejs/kit';
import { getDealByAcceptanceToken } from '$lib/server/deals';
import { toPublicQuote } from '$lib/deals';
import type { PageServerLoad } from './$types';

const tokenPattern = /^[A-Za-z0-9_-]{24,120}$/;

export const load: PageServerLoad = async ({ params }) => {
	if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
	const deal = await getDealByAcceptanceToken(params.token);
	if (!deal) throw error(404, 'Niet gevonden');
	const quote = deal.quoteVersions.find((q) => q.id === params.quoteId);
	if (!quote) throw error(404, 'Offerte niet gevonden');
	return { quote: toPublicQuote(quote) };
};
