# Offerte acceptance automation plan

Goal: keep acceptance, pre-payment, and practical event details in one simple, secure flow without building a full CRM.

## Scope

- [x] Add revocable magic links per deal.
- [x] Add one public `/klantportaal/[token]` page.
- [x] Let clients accept terms, fill practical details, and continue to payment from the same page.
- [x] Keep payment manual for now: create a payment link elsewhere and paste it into admin.
- [x] Store operational details as JSON first, not many rigid columns.
- [x] Avoid exposing unnecessary PII on the public page.

## Security Rules

- [x] Token must be long, random, and unguessable.
- [x] Page returns `404` when disabled, expired, or missing.
- [x] Page has `noindex,nofollow`.
- [x] Admin can disable/regenerate the link.
- [x] Link expires by default.
- [x] Public page shows only necessary quote summary.
- [x] Never expose internal notes, source, costs, margins, phone, email, or admin metadata.

## V1 DB Fields

- [x] `acceptance_token text`
- [x] `acceptance_enabled boolean default false`
- [x] `acceptance_expires_at timestamptz`
- [x] `accepted_terms_at timestamptz`
- [x] `accepted_terms_version text`
- [x] `deposit_amount numeric(10,2)`
- [x] `deposit_link text`
- [x] `deposit_status text default 'not_sent'`
- [x] `final_payment_amount numeric(10,2)`
- [x] `final_payment_link text`
- [x] `final_payment_status text default 'not_sent'`
- [x] `ops_json text default '{}'`
- [x] `ops_completed_at timestamptz`

## Admin V1

- [x] Generate/regenerate token.
- [x] Enable/disable acceptance page.
- [x] Set expiry date.
- [x] Copy client link.
- [x] Set deposit and final payment amount/link/status.
- [x] Show accepted terms timestamp.
- [x] Show questionnaire completed timestamp.

## Public Page V1

- [x] Validate token server-side.
- [x] Show event/date/service/amount summary.
- [x] Show terms checkbox.
- [x] Show practical questionnaire.
- [x] Save terms acceptance and questionnaire together.
- [x] Show payment link after saving.
- [x] If payment already marked paid, show that the aanbetaling is received.

## Later, Only If Needed

- [ ] Payment webhooks.
- [ ] Automatic reminder emails.
- [ ] Separate client portal/login.
- [ ] Normalized operation fields.
- [ ] PDF contract/signature flow.
