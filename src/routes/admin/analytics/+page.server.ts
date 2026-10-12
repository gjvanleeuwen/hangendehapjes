import { isDbConfigured } from '$lib/server/db';
import { listDeals } from '$lib/server/deals';
import { computeMetrics, periodLeadTrend } from '$lib/deals';
import type { PageServerLoad } from './$types';

// Dashboard: the funnel tiles and the analytics block that used to sit on top
// of the aanvragen list. The full report lives in `bun run report`.
export const load: PageServerLoad = async () => {
	const dbConfigured = isDbConfigured();
	const deals = dbConfigured ? await listDeals() : [];
	return {
		dbConfigured,
		metrics: computeMetrics(deals),
		trend: periodLeadTrend(deals, 14, new Date().toISOString())
	};
};
