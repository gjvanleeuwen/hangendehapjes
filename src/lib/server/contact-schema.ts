import * as v from 'valibot';

const HEADER_CHARS = /[<>"\\\r\n]/g;
const CRLF = /[\r\n]/g;
const CRLF_NORMALIZE = /\r\n/g;

// First/last-touch JSON captured client-side (see $lib/attribution). Opaque
// here; the endpoint stores it and summarises it for the email. Oversized
// values (long utm tags, click ids) are dropped rather than rejected: tracking
// metadata must never cost us a real aanvraag.
const ATTRIBUTION_MAX = 4000;
const attributionField = v.optional(
	v.pipe(
		v.string(),
		v.transform((s) => (s.length > ATTRIBUTION_MAX ? '' : s))
	),
	''
);

/**
 * Compact, log-safe summary of why a payload failed validation: which field,
 * the rule's message, and a short preview of what was received.
 */
export function summarizeIssues(issues: readonly v.BaseIssue<unknown>[]) {
	return issues.map((i) => ({
		field: i.path?.map((p) => String(p.key)).join('.') || '(root)',
		message: i.message,
		received: typeof i.input === 'string' ? i.input.slice(0, 50) : typeof i.input
	}));
}

/**
 * Step-1 snapshot sent when a visitor clicks "Volgende": just enough to follow
 * up if they never finish step 2. Same cleaning rules as the full payload.
 */
export const LeadSchema = v.object({
	// Lower-cased: leads upsert on the exact email, while completeLead matches
	// case-insensitively, so Foo@x.nl and foo@x.nl must be one row.
	email: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, '').trim().toLowerCase()),
		v.maxLength(254, 'email too long'),
		v.email('invalid email')
	),
	name: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(HEADER_CHARS, '').trim()),
			v.maxLength(100, 'name too long')
		),
		''
	),
	phone: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(30, 'phone too long')
		),
		''
	),
	serviceType: v.optional(v.picklist(['', 'hapjes', 'taart', 'anders']), ''),
	choice: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(120, 'choice too long')
		),
		''
	),
	locale: v.optional(v.picklist(['nl', 'en']), 'nl'),
	attribution: attributionField,
	// Honeypot: bots fill every field. Non-empty means we silently drop it.
	subject: v.optional(v.string(), '')
});

export const PayloadSchema = v.object({
	name: v.pipe(
		v.string(),
		v.transform((s) => s.replace(HEADER_CHARS, '').trim()),
		v.minLength(1, 'name is required'),
		v.maxLength(100, 'name too long')
	),
	email: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, '').trim()),
		v.maxLength(254, 'email too long'),
		v.email('invalid email')
	),
	phone: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(30, 'phone too long')
		),
		''
	),
	eventDate: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(1, 'eventDate is required'),
		v.maxLength(25, 'eventDate too long')
	),
	location: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(200, 'location too long')
		),
		''
	),
	guests: v.pipe(
		v.union([v.string(), v.number()]),
		v.transform((s) => String(s).replace(CRLF, ' ').trim()),
		v.minLength(1, 'guests is required'),
		v.maxLength(10, 'guests too long')
	),
	serviceType: v.picklist(['hapjes', 'taart', 'anders'], 'service type is required'),
	choice: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(1, 'choice is required'),
		v.maxLength(120, 'choice too long')
	),
	dagdeel: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(40, 'dagdeel too long')
		),
		''
	),
	servingTime: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(20, 'servingTime too long')
		),
		''
	),
	referral: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s.replace(CRLF, ' ').trim()),
			v.maxLength(200, 'referral too long')
		),
		''
	),
	message: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF_NORMALIZE, '\n').trim()),
		v.minLength(1, 'message is required'),
		v.maxLength(5000, 'message too long')
	),
	attribution: attributionField,
	// Honeypot. Hidden from real users; bots fill every field. Named `subject`
	// (not `website`/`url`) so password managers don't autofill it and trip real
	// visitors. Must stay empty — a non-empty value is handled in the endpoint.
	subject: v.optional(v.string(), ''),
	locale: v.optional(v.picklist(['nl', 'en']), 'nl'),
	// Optional opt-in to share a hashed email + Meta click id with the
	// Conversions API (see $lib/server/meta-capi). Unchecked by default.
	metaConsent: v.optional(v.boolean(), false)
});

export type Clean = v.InferOutput<typeof PayloadSchema>;

/**
 * Low-friction "just reach out to me" path: the visitor leaves only a phone
 * number or email and we call/mail them — no choices to make up front. A single
 * `contact` field keeps it as light as possible; the endpoint decides whether
 * it's an email (has `@`) or a phone number.
 */
export const CallbackSchema = v.object({
	mode: v.literal('callback'),
	contact: v.pipe(
		v.string(),
		v.transform((s) => s.replace(CRLF, ' ').trim()),
		v.minLength(3, 'contact is required'),
		v.maxLength(254, 'contact too long')
	),
	attribution: attributionField,
	// Honeypot — see PayloadSchema.subject.
	subject: v.optional(v.string(), ''),
	locale: v.optional(v.picklist(['nl', 'en']), 'nl')
});

export type CleanCallback = v.InferOutput<typeof CallbackSchema>;
