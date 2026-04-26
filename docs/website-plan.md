# Website plan — Hangende Hapjes

> **Note:** This was the initial planning artifact. The **source of truth for live copy** is now [src/lib/i18n/nl.ts](../src/lib/i18n/nl.ts) and [src/lib/i18n/en.ts](../src/lib/i18n/en.ts). The voice & tone rules live in [CLAUDE.md](../CLAUDE.md). Keep this doc for structural / design decisions; don't lockstep its draft strings with the locale files.

A single-page SvelteKit site (Dutch primary, English mirror at `/en`) that introduces the business, explains the two product concepts, and routes interested guests into a contact form.

## Decided

- **Owners on the site:** Gijs (De Borrel Baas) and Charlotte (De Toetjes Vrouw).
- **Primary domain:** `hangendehapjes.nl`. Also owned: `detoetjesvrouw.nl`, `deborrelbaas.nl` — point both at the main site for now.
- **Contact destination:** `info@hangendehapjes.nl`.
- **Email transport:** Postmark via the `postmark` npm package. `POSTMARK_TOKEN` from `$env/static/private`. Sender uses a verified `hangendehapjes.nl` address.
- **Pricing on site:** show only the entry tier per product as *"vanaf €425 / vanaf €450 (50 porties)"*. Higher tiers are quoted on request.
- **Socials:** Instagram only — `@hangendehapjes`.
- **KvK:** hidden until they decide to register the business formally.

## Goals

- Look legitimate and on-brand for someone who was just told about us at a wedding or by a friend.
- Communicate the "live snack + entertainment" hook in the first screen.
- Make booking enquiries frictionless: one form, clear fields, sane reply expectation.
- Stay maintainable by two non-developers (us). Copy lives in typed locale files; nothing else needs editing for a copy tweak.

## Audience

Couples planning weddings, corporate event organisers, agencies, and people throwing receptions or parties — typically in or around the Randstad. They're comparing us against caterers and entertainment, so the site should make clear we are *both*.

## Page structure

One scrollable page, anchor-linked nav. Sections in order:

1. **Hero**
2. **About** (short)
3. **Products** — two concepts, each with an expandable "more info" panel
4. **Reviews** (placeholder, empty for now)
5. **Photos** (gallery)
6. **Contact** (form)
7. **Footer** (KvK, email, IG handle, language toggle)

A sticky-ish top bar with the logo/wordmark, the section anchors, and a NL / EN toggle.

---

## 1. Hero

**Goal:** in one screen, communicate "we walk around your event making snacks live."

- Full-bleed photo (one of the action shots in `static/images/` — pick one with a tray and a guest interaction).
- Wordmark "Hangende Hapjes" prominent.
- One-line tagline. Working drafts:
  - NL: *"Live hapjes, gemaakt aan tafel — bij u op locatie."*
  - EN: *"Live snacks, made tray-side — at your event."*
- Subline (one sentence): we cater weddings, receptions and corporate parties from Hilversum with two signature concepts: De Toetjes Vrouw and De Borrel Baas.
- Primary CTA button → scrolls to **Contact**.
- Secondary CTA → scrolls to **Products**.

## 2. About (short)

Two short paragraphs, max ~80 words total. Personal, warm, first-person plural.

Working draft (NL):

> Wij zijn Gijs en Charlotte, een stel uit Hilversum. We combineren twee dingen waar we van houden: lekker eten en mensen een leuke avond bezorgen. Met een dienblad om onze nek lopen we tussen uw gasten door en maken ter plekke een hapje voor ze klaar — een gesprek, een glimlach en iets bijzonders op een schaaltje.

EN mirror with the same warmth, not a literal translation.

## 3. Products

Card layout, two cards side-by-side on desktop, stacked on mobile. Each card has:

- A photo
- The product name
- A one-line pitch
- "Meer info" / "More info" toggle that expands an accordion with: what guests get, how it works, pace, indicative pricing, what we wear.

Pricing wording: show indicative tiers, but always pair with *"vanaf"* / *"from"* and a note that travel and extra serving staff are quoted in the proposal. We do not want a checkout vibe.

### Product 1 — De Toetjes Vrouw

- **Pitch (NL):** *Verse tiramisu, voor uw ogen gemaakt.*
- **Pitch (EN):** *Fresh tiramisu, made in front of your guests.*
- **What guests get:** a small cup with two lange vingers, espresso/likeur erover, traditionele mascarpone-crème met gepasteuriseerde eieren, afgewerkt met cacao.
- **Pace:** ±50 porties per uur per persoon. Sneller tempo = extra bediende (tegen meerprijs).
- **Pricing on site:** *"Vanaf €425 — 50 porties"*. Hogere aantallen op aanvraag.
- **Wear:** afgestemd op het thema van het feest.

### Product 2 — De Borrel Baas

- **Pitch (NL):** *Burrata-bowl, live opgemaakt aan uw tafel.*
- **Pitch (EN):** *Burrata bowl, plated live tray-side.*
- **What guests get:** een schaaltje met stracciatella (het binnenste van de burrata), scrocchi-toastjes om in te dippen, twee toppings naar keuze (krokante parmaham, parmezaan, pijnboompitten, tomaat, …) en een saus (pesto of balsamico-vinaigrette).
- **Pace:** ±50 porties per uur per persoon. Sneller tempo = extra bediende (tegen meerprijs).
- **Pricing on site:** *"Vanaf €450 — 50 porties"*. Hogere aantallen op aanvraag.
- **Wear:** afgestemd op het thema van het feest.

### Cross-product notes (display once, e.g. under the cards)

- Beide concepten kunnen gecombineerd worden op één event.
- Gasten mogen aangeven of ze liever Gijs of Charlotte zien — ook kruislings (Gijs maakt prima tiramisu, Charlotte prima burrata-bowls).
- We rijden vanuit Hilversum. De eerste 50 km zijn inbegrepen, daarna rekenen we **€0,45 per km** reiskosten.
- Eindprijs altijd op offerte: locatie, duur, aantal gasten en eventuele extra bediening bepalen het totaal.

## 4. Reviews

Section is built but renders an empty state for now:

- Heading + one-line copy: *"Onze eerste gasten zijn net geweest — quotes komen binnenkort."* / *"Our first guests just had us — quotes coming soon."*
- Component is ready to receive an array of `{ quote, author, event }` objects from the locale file. Adding a review = editing the locale file, no code.

## 5. Photos

A simple, responsive grid (3 columns desktop, 2 tablet, 1 mobile). Pulls from the existing files in [static/images/](static/images/):

- WhatsApp Image 2026-04-25 at 23.04.03.jpeg
- WhatsApp Image 2026-04-25 at 23.14.16.jpeg
- WhatsApp Image 2026-04-25 at 23.14.17.jpeg
- WhatsApp Image 2026-04-25 at 23.14.17 (1).jpeg
- WhatsApp Image 2026-04-25 at 23.37.50.jpeg
- WhatsApp Image 2026-04-26 at 10.50.09.jpeg
- WhatsApp Image 2026-04-26 at 10.50.09 (1).jpeg
- WhatsApp Image 2026-04-26 at 10.50.09 (2).jpeg
- WhatsApp Image 2026-04-26 at 10.50.09 (3).jpeg
- WhatsApp Image 2026-04-26 at 10.50.10.jpeg
- WhatsApp Image 2026-04-26 at 10.50.54.jpeg

Notes:

- Rename to slugged filenames before shipping (e.g. `tiramisu-tray-01.jpeg`) — WhatsApp filenames are noisy and leak dates.
- Compress / convert to AVIF or WebP via a Vite import or build step to keep page weight reasonable. Originals are 0.7–1.3 MB each.
- Lightbox on click is a nice-to-have, not v1.

## 6. Contact

A single form. Fields:

- Naam / Name *(required)*
- Email *(required)*
- Telefoon / Phone *(optional)*
- Datum van het event / Event date *(optional, date picker)*
- Locatie / Location *(optional)*
- Aantal gasten / Number of guests *(optional, number)*
- Geïnteresseerd in / Interested in *(checkboxes: De Toetjes Vrouw, De Borrel Baas, Beide)*
- Bericht / Message *(required, textarea)*
- Honeypot field (hidden)

Submit handler is a SvelteKit server endpoint (`src/routes/api/contact/+server.ts`) that:

1. Validates input server-side.
2. Sends an email to our inbox via Postmark (preferred) or SMTP fallback.
3. Returns JSON `{ ok: true }` or a friendly error.

After submit:

- Optimistic success state with copy: *"Bedankt — we reageren meestal binnen 1–2 dagen."* / *"Thanks — we usually reply within 1–2 days."*
- No double submits; disable button while in flight.

Anti-spam: honeypot + simple per-IP rate limit (e.g. 5/hour). No captcha for v1.

## 7. Footer

- Hangende Hapjes — Hilversum, NL
- Email link, IG handle (if any)
- KvK number (placeholder until registered)
- Language toggle (NL / EN)
- Year, "Built with care."

---

## Visual direction (to validate together)

- Warm, slightly editorial. Think small Italian deli meets a wedding magazine.
- Type: a friendly serif for headlines (e.g. Fraunces, DM Serif), a clean sans for body (Inter / Geist).
- Colour: cream/off-white background, deep espresso-brown text, one accent (tomato red or olive green). Avoid black-on-white sterility.
- Lots of whitespace. Photos do the heavy lifting.

## Out of scope for v1

- Online booking / availability calendar
- Payments
- Blog
- CMS — copy lives in code, edited via PR
- Reviews collection mechanism (hard-coded in locale file when we have them)
- Analytics beyond plausible-style basic pageview counts (decide later)

---

## Still open

- Final visual design (Gijs will provide). Until then, scaffolding uses neutral cream / espresso minimal styling.
- Postmark sender verification (the `From:` address on `hangendehapjes.nl` needs to be DKIM-verified in Postmark before live sends).
- DNS — primary domain still needs to be pointed at the deploy target once we pick one (Vercel / Netlify / Cloudflare Pages).
