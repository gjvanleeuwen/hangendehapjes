// Sends one test Lead event to the Meta dataset so Events Manager shows the
// connection works. Refuses to run without META_TEST_EVENT_CODE: test events
// land only in the "Test events" tab and never count as real leads.
//
//   bun run meta:ping
//
// Reads META_DATASET_ID, META_CAPI_TOKEN and META_TEST_EVENT_CODE from .env
// (bun loads it) or from the shell. Uses the same event builder as the site, so
// what Meta sees here is what a real consented aanvraag produces.
import { buildMetaEvent } from '../src/lib/server/meta-capi-event';
import type { Deal } from '../src/lib/deals';

const datasetId = process.env.META_DATASET_ID;
const token = process.env.META_CAPI_TOKEN;
const testCode = process.env.META_TEST_EVENT_CODE;

if (!datasetId || !token || datasetId.startsWith('replace-') || token.startsWith('replace-')) {
	console.error('META_DATASET_ID en META_CAPI_TOKEN ontbreken (zie .env.example)');
	process.exit(1);
}
if (!testCode || testCode.startsWith('TEST12345')) {
	console.error(
		'META_TEST_EVENT_CODE ontbreekt: Events Manager > dataset > Test events. Zonder code wordt niets verstuurd.'
	);
	process.exit(1);
}

const now = Date.now();
const fakeDeal = {
	id: `ping-${now}`,
	origin: 'website',
	email: 'ping@hangendehapjes.nl',
	phone: '0612345678',
	choice: 'tiramisu-taart',
	serviceType: 'bruiloft',
	metaConsentAt: new Date(now).toISOString(),
	metaLeadSentAt: null,
	metaPurchaseSentAt: null,
	offerteAmount: null,
	firstTouch: JSON.stringify({
		first: {
			ts: new Date(now).toISOString(),
			src: 'instagram',
			med: 'paid',
			cmp: 'capi-ping',
			cnt: '',
			ref: '',
			land: '/blog/tiramisu-bruiloft',
			fbclid: 'ping',
			fbat: now
		},
		last: {
			ts: new Date(now).toISOString(),
			src: 'instagram',
			med: 'paid',
			cmp: 'capi-ping',
			cnt: '',
			ref: '',
			land: '/blog/tiramisu-bruiloft',
			fbclid: 'ping',
			fbat: now
		}
	})
} as unknown as Deal;

const event = await buildMetaEvent(fakeDeal, 'Lead', {
	ip: '127.0.0.1',
	userAgent: 'hangendehapjes-capi-ping'
});

const res = await fetch(
	`https://graph.facebook.com/v26.0/${encodeURIComponent(datasetId)}/events`,
	{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data: [event], access_token: token, test_event_code: testCode })
	}
);
const text = await res.text();
console.log(`event_id ${event.event_id}`);
console.log(`Meta ${res.status}: ${text}`);
process.exit(res.ok ? 0 : 1);
