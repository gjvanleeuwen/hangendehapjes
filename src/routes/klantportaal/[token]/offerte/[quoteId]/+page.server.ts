import { error } from '@sveltejs/kit';
import { getDealByAcceptanceToken } from '$lib/server/deals';
import { clientVisibleQuotes, toPublicQuote } from '$lib/deals';
import type { PageServerLoad } from './$types';

const tokenPattern = /^[A-Za-z0-9_-]{24,120}$/;

export const load: PageServerLoad = async ({ params }) => {
	if (!tokenPattern.test(params.token)) throw error(404, 'Niet gevonden');
	const deal = await getDealByAcceptanceToken(params.token);
	if (!deal) throw error(404, 'Niet gevonden');
	// Look the id up in the visible set, not the full list: a hidden version is
	// gone from the overview but its URL would otherwise still resolve for
	// anyone who kept the link from before we hid it.
	const quote = clientVisibleQuotes(deal).find((q) => q.id === params.quoteId);
	if (!quote) throw error(404, 'Offerte niet gevonden');
	return { quote: toPublicQuote(quote) };
};
