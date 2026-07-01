import { isDbConfigured } from '$lib/server/db';
import { listDeals } from '$lib/server/deals';
import { computeMetrics, periodLeadTrend } from '$lib/deals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const dbConfigured = isDbConfigured();
	const deals = dbConfigured ? await listDeals() : [];
	return {
		dbConfigured,
		metrics: computeMetrics(deals),
		// 14 days vs the prior 14 — "is this dip real or noise?"
		trend: periodLeadTrend(deals, 14, new Date().toISOString())
	};
};
