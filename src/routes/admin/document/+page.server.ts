import { fail, redirect } from '@sveltejs/kit';
import { getDeal, saveQuoteVersion } from '$lib/server/deals';
import { normalizeQuoteVersions } from '$lib/deals';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const dealId = url.searchParams.get('deal') ?? '';
	if (!dealId) throw redirect(303, '/admin/aanvragen?add=1');
	const deal = dealId ? await getDeal(dealId) : null;
	if (!deal) throw redirect(303, '/admin/aanvragen');
	return { deal };
};

export const actions: Actions = {
	saveQuote: async ({ request }) => {
		const fd = await request.formData();
		const dealId = String(fd.get('dealId') ?? '').trim();
		const raw = String(fd.get('quote') ?? '');
		if (!dealId || !raw) return fail(400, { error: 'Deal of offerte ontbreekt.' });

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return fail(400, { error: 'Offertegegevens konden niet gelezen worden.' });
		}

		const [quote] = normalizeQuoteVersions([parsed]);
		if (!quote) return fail(400, { error: 'Offertegegevens zijn niet geldig.' });

		const updated = await saveQuoteVersion(dealId, quote, true);
		if (!updated) return fail(404, { error: 'Aanvraag niet gevonden.' });
		return { savedQuote: true };
	}
};
