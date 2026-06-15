import { isDbConfigured } from '$lib/server/db';
import { listDeals } from '$lib/server/deals';
import { computeMetrics } from '$lib/deals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const dbConfigured = isDbConfigured();
	const deals = dbConfigured ? await listDeals() : [];
	return { dbConfigured, metrics: computeMetrics(deals) };
};
