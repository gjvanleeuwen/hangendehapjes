// Meta Conversions API, server-side only: one Lead event per aanvraag and one
// Purchase event once it books, so Meta can report which Instagram ad
// produced which lead and how much it was worth. No pixel, no cookies. Sends
// only for deals whose meta_consent_at is set (the visitor ticked the box).
//
// With META_DATASET_ID / META_CAPI_TOKEN unset this is a no-op: the site and
// the contact form must keep working without Meta.
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Deal } from '$lib/deals';
import { updateDeal } from '$lib/server/deals';
import { notifyError } from '$lib/server/notify';
import {
	buildMetaEvent,
	metaSkipReason,
	type MetaEventKind,
	type MetaRequestContext
} from '$lib/server/meta-capi-event';

export type { MetaEventKind, MetaRequestContext } from '$lib/server/meta-capi-event';

const GRAPH_VERSION = 'v26.0';

let warnedUnconfigured = false;

const config = () => {
	const datasetId = env.META_DATASET_ID;
	const token = env.META_CAPI_TOKEN;
	const ok =
		!!datasetId && !!token && !datasetId.startsWith('replace-') && !token.startsWith('replace-');
	// Only reached when a consented event was about to go out, so one warning
	// per process is enough to explain an empty "lead verstuurd" in the admin.
	if (!ok && !warnedUnconfigured) {
		warnedUnconfigured = true;
		console.warn('[meta-capi] META_DATASET_ID / META_CAPI_TOKEN not set, events are not sent');
	}
	return ok ? { datasetId: datasetId!, token: token!, testCode: env.META_TEST_EVENT_CODE } : null;
};

/**
 * Send one event for a deal. Resolves (never throws) so callers can fire and
 * forget. On success the matching `meta_*_sent_at` is stamped; on failure we
 * ping Telegram and leave the stamp empty, so a later status change can retry
 * the Purchase. Lead is one-shot: the request that carried the consent is the
 * only moment we have the customer's IP and user agent.
 */
export async function sendMetaEvent(
	deal: Deal,
	kind: MetaEventKind,
	ctx: MetaRequestContext = {}
): Promise<boolean> {
	const skip = metaSkipReason(deal, kind);
	if (skip) {
		if (dev) console.log(`[meta-capi] skip ${kind} for ${deal.id}: ${skip}`);
		return false;
	}
	const cfg = config();
	if (!cfg) return false;

	let event;
	try {
		event = await buildMetaEvent(deal, kind, ctx);
	} catch (err) {
		void notifyError(err, {
			source: `meta capi — build ${kind} (non-fatal)`,
			extra: { dealId: deal.id }
		});
		return false;
	}
	const body: Record<string, unknown> = { data: [event], access_token: cfg.token };
	if (cfg.testCode) body.test_event_code = cfg.testCode;

	try {
		const res = await fetch(
			`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(cfg.datasetId)}/events`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}
		);
		const text = await res.text();
		let received = 0;
		try {
			received = Number((JSON.parse(text) as { events_received?: number }).events_received ?? 0);
		} catch {
			received = 0;
		}
		if (!res.ok || received < 1) {
			throw new Error(`Meta responded ${res.status}: ${text.slice(0, 500)}`);
		}
		const sentAt = new Date().toISOString();
		await updateDeal(
			deal.id,
			kind === 'Lead' ? { metaLeadSentAt: sentAt } : { metaPurchaseSentAt: sentAt }
		);
		if (dev) console.log(`[meta-capi] ${kind} accepted for ${deal.id} (${event.event_id})`);
		return true;
	} catch (err) {
		void notifyError(err, {
			source: `meta capi — ${kind} (non-fatal)`,
			extra: { dealId: deal.id, eventId: event.event_id, test: !!cfg.testCode }
		});
		return false;
	}
}
