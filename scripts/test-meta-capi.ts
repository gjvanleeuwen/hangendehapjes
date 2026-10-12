// Checks for the Meta Conversions API event builder. Run with
// `bun run test:meta`. Covers the pure half only (src/lib/server/meta-capi-event):
// hashing, phone normalisation, fbc, dedupe ids, and above all that nothing is
// built without consent or for suspected spam. No network.
import {
	buildMetaEvent,
	fbcFor,
	metaEventId,
	metaSkipReason,
	normalizePhone
} from '../src/lib/server/meta-capi-event';
import type { Deal } from '../src/lib/deals';

const sha = async (s: string) => {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
};

const touch = (over: Record<string, unknown> = {}) => ({
	ts: '2026-10-01',
	src: 'instagram',
	med: 'paid',
	cmp: 'capi-test',
	cnt: '',
	ref: '',
	land: '/blog/tiramisu-bruiloft',
	fbclid: '',
	...over
});

const deal = (over: Partial<Deal> = {}): Deal =>
	({
		id: 'deal-1',
		email: ' Gijs@Example.com ',
		phone: '06 12 34 56 78',
		choice: 'Tiramisu',
		serviceType: 'hapjes',
		origin: 'contact_form',
		offerteAmount: 1210,
		firstTouch: JSON.stringify({ first: touch(), last: touch({ fbclid: 'abc123' }) }),
		metaConsentAt: '2026-10-01T10:00:00.000Z',
		metaLeadSentAt: null,
		metaPurchaseSentAt: null,
		...over
	}) as Deal;

let passed = 0;
let failed = 0;
const check = (name: string, ok: boolean, detail = '') => {
	if (ok) {
		passed++;
		console.log(`✓ ${name}`);
	} else {
		failed++;
		console.log(`✗ ${name}${detail ? `\n    ${detail}` : ''}`);
	}
};

// Consent gate: the whole point of the module.
check(
	'no consent → skipped',
	metaSkipReason(deal({ metaConsentAt: null }), 'Lead') === 'no consent'
);
check(
	'suspect origin → skipped even with consent',
	metaSkipReason(deal({ origin: 'contact_form_suspect' }), 'Lead') === 'suspect origin'
);
check('consent + clean origin → Lead allowed', metaSkipReason(deal(), 'Lead') === null);
check(
	'Lead already sent → skipped',
	metaSkipReason(deal({ metaLeadSentAt: '2026-10-01T10:00:01.000Z' }), 'Lead') ===
		'lead already sent'
);
check(
	'Purchase already sent → skipped',
	metaSkipReason(deal({ metaPurchaseSentAt: '2026-10-02T10:00:00.000Z' }), 'Purchase') ===
		'purchase already sent'
);
check(
	'Purchase without amount → skipped',
	metaSkipReason(deal({ offerteAmount: null }), 'Purchase') === 'no offerte amount'
);
check('Purchase with amount → allowed', metaSkipReason(deal(), 'Purchase') === null);

// Phone normalisation (NL default country code).
check('phone 06 → 316', normalizePhone('06 12 34 56 78') === '31612345678');
check('phone +31 6 → 316', normalizePhone('+31 6 1234 5678') === '31612345678');
check('phone 0031 → 31', normalizePhone('0031612345678') === '31612345678');
check('phone 9 digits starting with 6 → 316', normalizePhone('612345678') === '31612345678');
check('phone too short → empty', normalizePhone('1234') === '');

// fbc format.
check(
	'fbc uses the ms the click id was seen',
	fbcFor({ ts: '2026-10-01', fbclid: 'abc', fbat: 1_700_000_000_000 }) === 'fb.1.1700000000000.abc'
);
check(
	'fbc falls back to the touch day for older touches',
	fbcFor({ ts: '2026-10-01', fbclid: 'abc' }) === `fb.1.${Date.parse('2026-10-01')}.abc`
);

// Deterministic ids for dedupe.
check('Lead event id = deal id', metaEventId('deal-1', 'Lead') === 'deal-1');
check('Purchase event id = deal id + :won', metaEventId('deal-1', 'Purchase') === 'deal-1:won');

// Full Lead event.
const lead = await buildMetaEvent(
	deal(),
	'Lead',
	{ ip: '1.2.3.4', userAgent: 'UA' },
	1_700_000_000_000
);
check('Lead: event_name', lead.event_name === 'Lead');
check('Lead: event_time in seconds', lead.event_time === 1_700_000_000);
check('Lead: action_source website', lead.action_source === 'website');
check(
	'Lead: source url = landing page on hangendehapjes.nl',
	lead.event_source_url === 'https://hangendehapjes.nl/blog/tiramisu-bruiloft',
	lead.event_source_url
);
check(
	'Lead: em = sha256 of lowercased trimmed email',
	lead.user_data.em[0] === (await sha('gijs@example.com'))
);
check('Lead: ph = sha256 of 31612345678', lead.user_data.ph?.[0] === (await sha('31612345678')));
check(
	'Lead: ip + ua passed through',
	lead.user_data.client_ip_address === '1.2.3.4' && lead.user_data.client_user_agent === 'UA'
);
check(
	'Lead: fbc from the last touch with an fbclid',
	lead.user_data.fbc === `fb.1.${Date.parse('2026-10-01')}.abc123`,
	String(lead.user_data.fbc)
);
check('Lead: no fbp (no pixel)', !('fbp' in lead.user_data));
check(
	'Lead: custom_data = choice + serviceType, no value',
	lead.custom_data.content_name === 'Tiramisu' &&
		lead.custom_data.content_category === 'hapjes' &&
		!('value' in lead.custom_data)
);
check(
	'Lead: raw email never in payload',
	!JSON.stringify(lead).toLowerCase().includes('example.com')
);
check('Lead: raw phone never in payload', !JSON.stringify(lead).includes('12 34 56 78'));

// Variants.
const noPhone = await buildMetaEvent(deal({ phone: '' }), 'Lead');
check('no phone → no ph key', !('ph' in noPhone.user_data));
const noCtx = await buildMetaEvent(deal(), 'Purchase');
check(
	'no ctx → no ip / ua keys (admin is not the customer)',
	!('client_ip_address' in noCtx.user_data) && !('client_user_agent' in noCtx.user_data)
);
const firstOnly = await buildMetaEvent(
	deal({ firstTouch: JSON.stringify({ first: touch({ fbclid: 'first1' }), last: touch() }) }),
	'Lead'
);
check('fbclid only on first touch → used', firstOnly.user_data.fbc?.endsWith('.first1') === true);
const noClick = await buildMetaEvent(
	deal({ firstTouch: JSON.stringify({ first: touch(), last: touch() }) }),
	'Lead'
);
check('no fbclid anywhere → no fbc key', !('fbc' in noClick.user_data));
const noTouch = await buildMetaEvent(deal({ firstTouch: '' }), 'Lead', {
	sourceUrl: 'https://hangendehapjes.nl/x'
});
check(
	'no touch → ctx.sourceUrl fallback',
	noTouch.event_source_url === 'https://hangendehapjes.nl/x'
);

// Purchase event.
const purchase = await buildMetaEvent(deal(), 'Purchase');
check('Purchase: event_id dedupes on :won', purchase.event_id === 'deal-1:won');
check(
	'Purchase: value incl. BTW + EUR',
	purchase.custom_data.value === 1210 && purchase.custom_data.currency === 'EUR'
);

console.log(`\n${passed}/${passed + failed} passed`);
process.exit(failed === 0 ? 0 : 1);
