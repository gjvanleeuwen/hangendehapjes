# Task: Meta Conversions API lead events, with consent, no pixel

## Why

We are testing Instagram ads (`docs/instagram-ads-plan.md`). Meta can only report which ad produced a lead if we tell it. We do not want the Meta pixel on the site: it sets cookies and would force a cookie banner on every visitor, and the site is deliberately cookieless (Umami). Instead the server sends one `Lead` event per aanvraag through the Conversions API, and only when the visitor ticked a consent box on the contact form. Later, when that aanvraag becomes a booking, the server sends a `Purchase` event with the amount, so Meta also shows revenue per ad.

Consent is the legal basis (AVG; sharing personal data with Meta for advertising). Server-side only removes the cookie rule, not the consent requirement. The checkbox must be unchecked by default, optional, and clearly worded.

## What exists already

- `src/lib/attribution.ts`: first and last touch stored in `localStorage` (utm fields, referrer, landing, date). It detects `fbclid` but does not store its value. The contact form sends the attribution JSON; it lands in `deals.first_touch`.
- `src/routes/api/contact/+server.ts`: validates with `PayloadSchema` (`src/lib/server/contact-schema.ts`), captures the deal via `createDeal`, sends mail via Postmark, reports errors via `notifyError` (`src/lib/server/notify.ts`, Telegram). Fire-and-forget pattern for the DB capture is the model to copy.
- `src/lib/components/Contact.svelte`: two-step form; step 2 has the optional "hoe ons gevonden" field and the submit button. Umami `contact_submit` event with properties.
- Admin `update` action in `src/routes/admin/aanvragen/+page.server.ts` auto-stamps dates on status changes; `geaccepteerd` is the moment a deal is won.
- Terms page at `src/routes/terms/+page.svelte`; there is no separate privacy page. i18n strings in `src/lib/i18n/nl.ts` and `en.ts`; every user-facing string must exist in both.

## Build

### 1. Store the Meta click id

In `src/lib/attribution.ts` add `fbclid: string` to `Touch` (empty when absent), captured from the `fbclid` query parameter like the utm fields. Keep it in both first and last touch. The site uses `sourceBucket()` for channel labels; do not change that.

### 2. Consent checkbox in the form

In `Contact.svelte`, step 2, directly above the submit row: an unchecked checkbox bound to `metaConsent`, with i18n strings (`t.contact.metaConsent.label`, `t.contact.metaConsent.hint`):

- NL label: "Je mag Meta (Instagram) laten weten dat ik via een advertentie kwam, en of het een boeking werd."
- NL hint: "Alleen een hash van je e-mailadres en de advertentie-klik, zodat we weten welke advertenties werken. Geen cookies. Optioneel."
- EN equivalents in the same tone.

Send `metaConsent: boolean` in the submit payload. Add it to `PayloadSchema` as `v.optional(v.boolean(), false)`. Add `metaConsent: 'yes' | 'no'` to the Umami `contact_submit` event data so the opt-in rate is visible in Umami and later in the report.

Only show the checkbox when the stored attribution has an `fbclid` or `utm_source` of instagram/facebook (first or last touch). Visitors who did not come from Meta have nothing to consent to, and the form stays clean for them.

### 3. Deal columns

Add to `deals` via `ensureSchema` in `src/lib/server/db.ts` (idempotent `ADD COLUMN IF NOT EXISTS`), to the `Deal` type and `DealInput` in `src/lib/deals.ts`, `rowToDeal`, `createDeal` and the `updateDeal` map in `src/lib/server/deals.ts`:

| Column                  | Type        | Meaning                                                          |
| ----------------------- | ----------- | ---------------------------------------------------------------- |
| `meta_consent_at`       | timestamptz | when the box was ticked (null = no consent, never send anything) |
| `meta_lead_sent_at`     | timestamptz | Lead event accepted by Meta                                      |
| `meta_purchase_sent_at` | timestamptz | Purchase event accepted by Meta                                  |

Include `metaConsentAt` in `/admin/aanvragen/export.json` so the report can show the opt-in rate.

### 4. Server module `src/lib/server/meta-capi.ts`

Env (add to `.env.example` with comments): `META_DATASET_ID`, `META_CAPI_TOKEN`, optional `META_TEST_EVENT_CODE`. When the first two are missing the module is a no-op that logs once in dev; nothing on the site may break without them.

`sendMetaEvent(deal, kind: 'Lead' | 'Purchase', ctx: { ip, userAgent, sourceUrl })`:

- POST `https://graph.facebook.com/<current version>/{META_DATASET_ID}/events` with `access_token` in the body, JSON `{ data: [event], test_event_code? }`.
- Event fields: `event_name`, `event_time` (unix seconds, now), `event_id` (`deal.id` for Lead, `${deal.id}:won` for Purchase; deterministic so a retry or a later pixel dedupes), `action_source: 'website'`, `event_source_url` (landing page from the touch, full URL on hangendehapjes.nl).
- `user_data`: `em` = sha256 of the lowercased, trimmed email; `ph` = sha256 of the phone as digits with country code (NL default `31`, drop leading 0), only when a phone was given; `client_ip_address` and `client_user_agent` from the request; `fbc` = `fb.1.<touch timestamp in ms>.<fbclid>` from the last touch that has an fbclid, else the first; no `fbp` (no pixel).
- `custom_data`: Lead: `content_name` = choice, `content_category` = serviceType. Purchase: `value` = offerte amount incl. BTW, `currency: 'EUR'`, same content fields.
- On HTTP 200 with `events_received >= 1`: stamp the matching `*_sent_at`. On failure: `notifyError` with the response body, do not retry in the request; a later admin status change may retry Purchase, Lead is one-shot.
- Never send when `meta_consent_at` is null. Never send for `contact_form_suspect` origin.

### 5. Wire it up

- `/api/contact`: after `createDeal` succeeds and the deal id is known, if `clean.metaConsent` is true: set `metaConsentAt` on the deal (pass it into `createDeal`) and call `sendMetaEvent(..., 'Lead')` fire-and-forget, same pattern as the DB capture. The honeypot path and the callback path do not send.
- Admin `update` action: when the status becomes `geaccepteerd` (or `afgerond` without a prior Purchase) and `metaConsentAt` is set and `metaPurchaseSentAt` is null and there is an offerte amount: send `Purchase` fire-and-forget. Use the request IP and user agent of the admin only if Meta requires them; otherwise omit (they are not the customer's).
- Admin detail: show a small read-only line "Meta: toestemming <datum> · lead verstuurd <datum> · boeking verstuurd <datum>" next to the measured source, so it is visible without opening anything.

### 6. Privacy text

Add a short paragraph to the terms page (NL and EN) under a "Privacy" heading: what we store from the contact form, that analytics is cookieless, and that only with the checkbox we share a hashed e-mail address and the ad click id with Meta to measure advertising, with a link to Meta's data policy. Informal voice, no em dashes.

### 7. Report (optional, small)

In `scripts/funnel-report.ts`, the deals loader already carries `firstTouch`; add `metaConsentAt` and show "Meta opt-in: x of y Meta leads" in the "More numbers" of the Overall section. Nothing else in the report changes; attribution of leads to campaigns already works through the first touch.

## Verify

1. Events Manager → the dataset → Test events: set `META_TEST_EVENT_CODE`, submit the form locally from a URL with `?fbclid=test&utm_source=instagram&utm_medium=paid&utm_campaign=capi-test`, tick the box, confirm the Lead arrives with event id = deal id and a match quality that lists email and fbc.
2. Mark the deal `geaccepteerd` in the admin with an amount; confirm the Purchase arrives with the value.
3. Submit without the box ticked: no request to Meta (assert in a unit test on the module, or log in dev).
4. Submit with the env vars unset: form works, mail sent, deal captured, nothing logged as an error.
5. `bun run check`, `bun run lint`, and `bun scripts/test-contact-schema.ts` pass; extend that schema test with `metaConsent`.
6. Both locales render the checkbox and the privacy paragraph.

## Out of scope

Loading any Meta script in the browser, a cookie banner, sending page views or form starts, retargeting audiences, Google Ads conversion tracking.
