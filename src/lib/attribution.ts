// First- and last-touch attribution, captured in the browser and sent along
// with the contact form, so every aanvraag records where it came from (an
// Instagram ad, Google, a blog post…) independent of what the visitor types in
// "hoe ons gevonden". Pure module without SvelteKit imports: it is also used by
// the server (email summary) and by scripts/funnel-report.ts.

export type Touch = {
	ts: string; // YYYY-MM-DD the touch happened
	src: string; // utm_source
	med: string; // utm_medium
	cmp: string; // utm_campaign
	cnt: string; // utm_content (creative / placement)
	ref: string; // referrer hostname, '' when none (direct)
	land: string; // landing path
	fbclid?: string; // Meta click id, '' when absent (older stored touches lack the key)
	fbat?: number; // ms the fbclid was first seen, Meta's fbc creation time (older touches lack it)
};

export type Attribution = { first: Touch; last: Touch };

const META_SOURCE = /^(ig|fb|instagram|insta|facebook|meta)$/;

/**
 * Did this visitor arrive from Instagram or Facebook (first or last touch)?
 * Decides whether the Meta consent checkbox is shown on the contact form.
 */
export function isMetaAttribution(a: Attribution | null): boolean {
	if (!a) return false;
	return [a.first, a.last].some((t) => !!t.fbclid || META_SOURCE.test((t.src ?? '').toLowerCase()));
}

/** The touch whose click id goes to Meta: the last one with an fbclid, else the first. */
export function metaTouch(a: Attribution | null): Touch | null {
	if (!a) return null;
	if (a.last.fbclid) return a.last;
	if (a.first.fbclid) return a.first;
	return null;
}

const FIRST_KEY = 'hh_touch_first';
const LAST_KEY = 'hh_touch_last';
const TTL_MS = 180 * 24 * 3600 * 1000;
const OWN_HOST = /(^|\.)hangendehapjes\.nl$/;
const CLICK_IDS = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'ttclid'];
const PAID_MEDIUM = /^(paid|cpc|ppc|paid[-_]?social|ads?|display|sponsored)$/;

/**
 * Collapse utm / referrer into one channel label. Paid vs organic is decided
 * by utm_medium, so always tag ads with e.g. `utm_medium=paid`. Used for
 * Umami event data, the admin, and the funnel report, so keep it stable.
 */
export function sourceBucket(t: Partial<Touch>): string {
	const src = (t.src ?? '').toLowerCase();
	const med = (t.med ?? '').toLowerCase();
	const ref = (t.ref ?? '').toLowerCase();
	const paid = PAID_MEDIUM.test(med);
	const is = (...keys: string[]) => keys.some((k) => src.includes(k) || ref.includes(k));

	if (src === 'ig' || is('instagram', 'insta')) return paid ? 'instagram_ads' : 'instagram';
	if (src === 'fb' || is('facebook')) return paid ? 'facebook_ads' : 'facebook';
	if (is('tiktok')) return paid ? 'tiktok_ads' : 'tiktok';
	if (is('chatgpt', 'openai')) return 'chatgpt';
	if (/mail\.|android\.gm|outlook/.test(ref)) return 'email';
	if (is('google')) return paid ? 'google_ads' : 'google';
	if (/bing|duckduckgo|ecosia|yahoo|yandex/.test(ref)) return 'other_search';
	if (src) return src; // custom tag, e.g. utm_source=flyer
	if (!ref) return 'direct';
	return ref.replace(/^www\./, '');
}

function parseTouch(raw: string | null): Touch | null {
	if (!raw) return null;
	try {
		const t = JSON.parse(raw) as Touch;
		if (!t || typeof t.ts !== 'string') return null;
		if (Date.now() - Date.parse(t.ts) > TTL_MS) return null;
		return t;
	} catch {
		return null;
	}
}

function currentTouch(): { touch: Touch; isNew: boolean } {
	const url = new URL(window.location.href);
	const p = url.searchParams;
	let ref = '';
	try {
		ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
	} catch {
		ref = '';
	}
	// Navigating within our own site is not a new touch.
	if (OWN_HOST.test(ref) || ref === window.location.hostname) ref = '';
	const tagged = CLICK_IDS.some((k) => p.has(k));
	const touch: Touch = {
		ts: new Date().toISOString().slice(0, 10),
		src: p.get('utm_source') ?? '',
		med: p.get('utm_medium') ?? (p.has('gclid') ? 'cpc' : ''),
		cmp: p.get('utm_campaign') ?? '',
		cnt: p.get('utm_content') ?? '',
		ref,
		land: url.pathname,
		fbclid: (p.get('fbclid') ?? '').slice(0, 255)
	};
	if (touch.fbclid) touch.fbat = Date.now();
	return { touch, isNew: tagged || ref !== '' };
}

/**
 * Call once per full page load (root layout). Stores the first touch for 180
 * days and refreshes the last touch whenever the visitor arrives from outside.
 */
export function captureAttribution(): Attribution | null {
	if (typeof window === 'undefined') return null;
	try {
		const { touch, isNew } = currentTouch();
		const first = parseTouch(localStorage.getItem(FIRST_KEY)) ?? touch;
		const storedLast = parseTouch(localStorage.getItem(LAST_KEY));
		const last = isNew || !storedLast ? touch : storedLast;
		localStorage.setItem(FIRST_KEY, JSON.stringify(first));
		localStorage.setItem(LAST_KEY, JSON.stringify(last));
		return { first, last };
	} catch {
		return null; // private mode / storage blocked: attribution is best-effort
	}
}

export function getAttribution(): Attribution | null {
	if (typeof window === 'undefined') return null;
	try {
		const first = parseTouch(localStorage.getItem(FIRST_KEY));
		const last = parseTouch(localStorage.getItem(LAST_KEY));
		if (!first && !last) return null;
		return { first: (first ?? last) as Touch, last: (last ?? first) as Touch };
	} catch {
		return null;
	}
}

/** JSON for the contact form payload; '' when nothing is known. */
export function attributionJson(): string {
	const a = getAttribution();
	return a ? JSON.stringify(a) : '';
}

export function parseAttribution(json: string | null | undefined): Attribution | null {
	if (!json) return null;
	try {
		const a = JSON.parse(json) as Partial<Attribution>;
		if (!a || typeof a !== 'object') return null;
		const first = (a.first ?? a.last) as Touch | undefined;
		const last = (a.last ?? a.first) as Touch | undefined;
		return first && last ? { first, last } : null;
	} catch {
		return null;
	}
}

function touchLabel(t: Touch): string {
	const bucket = sourceBucket(t);
	const bits = [bucket, t.cmp ? `campagne ${t.cmp}` : '', t.cnt ? `(${t.cnt})` : ''].filter(
		Boolean
	);
	return `${bits.join(' ')} → ${t.land || '/'}${t.ts ? ` op ${t.ts}` : ''}`;
}

/** Short human-readable summary for emails and the admin, e.g.
 *  "google → /blog/tiramisu-bruiloft op 2026-09-02 · later via instagram_ads campagne zomer → / op 2026-09-10". */
export function describeAttribution(json: string | null | undefined): string {
	const a = parseAttribution(json);
	if (!a) return '';
	const first = touchLabel(a.first);
	const sameTouch =
		a.first.ts === a.last.ts &&
		a.first.land === a.last.land &&
		sourceBucket(a.first) === sourceBucket(a.last);
	return sameTouch ? first : `${first} · later via ${touchLabel(a.last)}`;
}
