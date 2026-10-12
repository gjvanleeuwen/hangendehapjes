import { json } from '@sveltejs/kit';
import { listDeals } from '$lib/server/deals';
import type { RequestHandler } from './$types';

// Download of the aanvragen pipeline for scripts/funnel-report.ts. Lives under
// /admin, so hooks.server.ts only lets the logged-in admin reach it. Save the
// file as data/deals-<date>.json and run `bun run report`.
//
// Acceptance evidence (IP, user agent, snapshot) and payment links stay out:
// the report never needs them.
export const GET: RequestHandler = async () => {
	const deals = (await listDeals()).map((d) => ({
		id: d.id,
		createdAt: d.createdAt,
		updatedAt: d.updatedAt,
		name: d.name,
		email: d.email,
		source: d.source,
		attribution: d.attribution,
		firstTouch: d.firstTouch,
		origin: d.origin,
		eventDate: d.eventDate,
		location: d.location,
		guests: d.guests,
		serviceType: d.serviceType,
		choice: d.choice,
		dagdeel: d.dagdeel,
		status: d.status,
		offerteAmount: d.offerteAmount,
		btwAmount: d.btwAmount,
		costs: d.costs,
		timeSpent: d.timeSpent,
		firstReplyOn: d.firstReplyOn,
		offerteVerstuurdOp: d.offerteVerstuurdOp,
		geldigTot: d.geldigTot,
		geaccepteerdOp: d.geaccepteerdOp,
		afgewezenOp: d.afgewezenOp,
		factuurVerstuurdOp: d.factuurVerstuurdOp,
		betaaldOp: d.betaaldOp,
		herinnering1Op: d.herinnering1Op,
		herinnering2Op: d.herinnering2Op,
		gebeldOp: d.gebeldOp,
		kans: d.kans,
		lostReason: d.lostReason,
		notes: d.notes
	}));

	const date = new Date().toISOString().slice(0, 10);
	return json(
		{ exportedAt: new Date().toISOString(), count: deals.length, deals },
		{
			headers: {
				'Cache-Control': 'no-store',
				'Content-Disposition': `attachment; filename="deals-${date}.json"`
			}
		}
	);
};
