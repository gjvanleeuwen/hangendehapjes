// Pure half of the Meta Conversions API integration: builds the event payload
// from a deal, no network, no SvelteKit imports, so scripts/test-meta-capi.ts
// can exercise it with bun. The sending (env, fetch, DB stamp, Telegram on
// failure) lives in ./meta-capi.ts.
import { metaTouch, parseAttribution, type Touch } from '$lib/attribution';
import type { Deal } from '$lib/deals';

// Not imported from $lib/site-config: that module reads a Vite define
// (__BUILD_DATE__) and cannot load under plain bun for the test script.
const SITE_URL = 'https://hangendehapjes.nl';

export type MetaEventKind = 'Lead' | 'Purchase';

export type MetaRequestContext = {
	/** The customer's IP, only on the request that carried their consent. */
	ip?: string;
	/** The customer's user agent, same rule. */
	userAgent?: string;
	/** Fallback when the touch has no landing path. */
	sourceUrl?: string;
};

export type MetaUserData = {
	em: string[];
	ph?: string[];
	client_ip_address?: string;
	client_user_agent?: string;
	fbc?: string;
};

export type MetaEvent = {
	event_name: MetaEventKind;
	event_time: number;
	event_id: string;
	action_source: 'website';
	event_source_url: string;
	user_data: MetaUserData;
	custom_data: Record<string, string | number>;
};

/** Hex SHA-256 via Web Crypto, same as the rest of the server code (no node types here). */
export async function sha256(s: string): Promise<string> {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
	return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Email the way Meta wants it hashed: trimmed and lowercased. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Phone as digits with country code: "06 12 34 56 78" → "31612345678",
 * "+31 6 1234 5678" → "31612345678", "0031..." → "31...". Nine digits starting
 * with 6 is a Dutch mobile number without the leading 0. Returns '' when there
 * are not enough digits to be a phone number.
 */
export function normalizePhone(phone: string, countryCode = '31'): string {
	let digits = phone.replace(/\D/g, '');
	if (digits.startsWith('00')) digits = digits.slice(2);
	else if (digits.startsWith('0')) digits = countryCode + digits.slice(1);
	else if (digits.length === 9 && digits.startsWith('6')) digits = countryCode + digits;
	return digits.length >= 10 ? digits : '';
}

/**
 * Meta's fbc format: fb.1.<ms the click id was first seen>.<fbclid>. Touches
 * stored before `fbat` existed only know the day, so fall back to midnight.
 */
export const fbcFor = (t: Pick<Touch, 'ts' | 'fbclid' | 'fbat'>) => {
	const ms = t.fbat ?? Date.parse(t.ts);
	return `fb.1.${Number.isFinite(ms) ? ms : Date.now()}.${t.fbclid}`;
};

/** Deterministic id so a retry (or a later pixel) dedupes instead of double counting. */
export const metaEventId = (dealId: string, kind: MetaEventKind) =>
	kind === 'Lead' ? dealId : `${dealId}:won`;

/**
 * Whether we are allowed to send anything for this deal at all: consent must
 * be on record and the aanvraag must be genuine. Returns the reason to skip,
 * or null when sending is fine.
 */
export function metaSkipReason(deal: Deal, kind: MetaEventKind): string | null {
	if (!deal.metaConsentAt) return 'no consent';
	if (deal.origin.endsWith('_suspect')) return 'suspect origin';
	if (!deal.email) return 'no email';
	if (kind === 'Lead' && deal.metaLeadSentAt) return 'lead already sent';
	if (kind === 'Purchase') {
		if (deal.metaPurchaseSentAt) return 'purchase already sent';
		if (!deal.offerteAmount || deal.offerteAmount <= 0) return 'no offerte amount';
	}
	return null;
}

export async function buildMetaEvent(
	deal: Deal,
	kind: MetaEventKind,
	ctx: MetaRequestContext = {},
	now = Date.now()
): Promise<MetaEvent> {
	const attribution = parseAttribution(deal.firstTouch);
	const click = metaTouch(attribution);
	const landing = attribution?.first.land || attribution?.last.land || '';
	const event_source_url = landing ? `${SITE_URL}${landing}` : ctx.sourceUrl || SITE_URL;

	const user_data: MetaUserData = { em: [await sha256(normalizeEmail(deal.email))] };
	const phone = normalizePhone(deal.phone);
	if (phone) user_data.ph = [await sha256(phone)];
	if (ctx.ip) user_data.client_ip_address = ctx.ip;
	if (ctx.userAgent) user_data.client_user_agent = ctx.userAgent;
	if (click?.fbclid) user_data.fbc = fbcFor(click);

	const custom_data: Record<string, string | number> = {
		content_name: deal.choice,
		content_category: deal.serviceType
	};
	if (kind === 'Purchase') {
		custom_data.value = deal.offerteAmount ?? 0;
		custom_data.currency = 'EUR';
	}

	return {
		event_name: kind,
		event_time: Math.floor(now / 1000),
		event_id: metaEventId(deal.id, kind),
		action_source: 'website',
		event_source_url,
		user_data,
		custom_data
	};
}
