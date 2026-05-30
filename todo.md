### DNS / hosting sanity

- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park
- [ ] **Lighthouse audit** — Chrome DevTools → Lighthouse → mobile + perf/SEO/accessibility. Hero image is large (`hero.jpeg`); if LCP is slow, generate a smaller variant.

### Funnel tracking (do before any ad spend or referral payouts)

- [ ] **Wire end-to-end funnel into Umami** — without this every later channel decision (ads, referrals, content prioritisation) is guessing. Three pieces:
  1. **UTM-tag every external link** that points at the site: Instagram bio link, IG story link stickers, Linktree (if any), every directory listing (theperfectwedding.nl, future Showbird/Gigstarter), email signature, press follow-ups. Convention: `?utm_source=instagram&utm_medium=bio&utm_campaign=2026q2`. Umami already captures referrer + UTM; no setup needed beyond the tagging discipline. Maintain a small reference list of "where this URL is posted" in [docs/](docs/) so we don't lose the mapping.
- [ ] **Spin up a "Deals" tracking sheet** (Notion DB or Google Sheet, doesn't matter). Columns: `date / source / lead name / status (lead → quote → booked → paid) / quote € / booking €`. Manual entry, ~30 sec per lead. This is the only place that knows deal value; Umami knows volume + source. Together they give CAC + conversion rate by source. Don't build software for this until 50+ rows exist.

### Findings from 2026-05-09 check-in

- **GSC anonymises low-volume queries.** The Queries report only shows queries that cross a privacy threshold; everything below is hidden but still counts in the Pages totals. That's why on 2026-05-09 the Pages report showed 163 total impressions but only 2 queries appeared in the Queries report. Not a bug — expect Queries to lag Pages by weeks until specific terms cross the threshold.
- [ ] **Improve `/blog/hoeveel-hapjes-per-persoon` CTR.** 116 impressions / 0.86% CTR after ~2 weeks = ranking somewhere on lower page 1 or top of page 2 but not getting clicked. Run URL Inspection in GSC to confirm position, then rewrite the title tag and meta description to better match search intent (lead with a concrete number/quantifier, e.g. "Hoeveel hapjes per persoon? Echte cijfers van een caterer"). Edit the post's `title` / `metaDescription` in [src/lib/i18n/nl.ts](src/lib/i18n/nl.ts).
- [ ] **Re-check GSC Queries report around 2026-06-06** (≈ 4 weeks after the post launched). Filter Performance → Pages = `/blog/hoeveel-hapjes-per-persoon` and read which queries it's ranking for now that volume has built. Use those long-tail terms to inform briefs for S4+ in [docs/seo-content-plan.md](docs/seo-content-plan.md).
- **NL-first is empirically confirmed.** `/en` got 4 impressions vs 31 on the NL homepage and 116 on the NL blog post. **Don't mirror new posts to EN until the NL version is ranking.** The blog seeds list already says this; data now backs it — bake it into the content cadence and resist the urge to dual-write.

## AI / LLM visibility

Goal: get cited by ChatGPT, Perplexity, Gemini, Claude when people ask "live catering Hilversum / Gooi" or "originele caterings bruiloft NL". They recommend what they've _read about elsewhere_ — so this is mostly off-site work.

- [x] List on **theperfectwedding.nl** (highest-authority NL wedding directory, often cited by LLMs). Free, ~15 min.
- [~] ~~ThePerfectWedding sponsored-article offer (€480 for "1000 guaranteed views" in a new article, evaluated 2026-05-09)~~ — **passing for now.** Direct ROI math is roughly break-even (1000 views → ~30 site sessions → ~1 lead → ~0.3 booking → ~€500–800 revenue, before time cost). The 3500 views on their existing "speciale hapjes" piece is almost certainly all-time, not monthly, so the post-launch tail is small. Real value would be the backlink + AI-citation surface, but: (a) we already have a free directory listing on the same domain so the marginal AI lift is small, and (b) sponsored articles are usually `rel="sponsored"` / `nofollow`, which Google discounts. **Revisit only if** they confirm the link is `dofollow` _and_ show 12-month organic-search traffic for a comparable sponsored (not editorial) post — at that point €300 would be interesting, €480 still steep. Better uses of the same €480 right now: pro photography (compounds across all channels and fixes the hero LCP), Google Ads (~150 clicks, measurable), or banking it for when more press hits accumulate and TPW's _editorial_ team picks up the founder story for free.
- [~] ~~List on at least one of **bruiloft.nl**, **trouwen.nl**, **eventbranche.nl**~~ — skipped, the sites are spammy / barely reachable and not worth the cycles.
- [ ] Pitch one NL wedding/event blog for a feature ("originele caterings", "live food trends"). The founding story (couple, complementary characters, ~15 years together) is genuinely pitchable. One blog mention = disproportionate AI signal.
- [ ] **Build location pages under `/catering/[slug]`** (higher priority than the blog — Google location-biases catering queries hard, and competitors like `hapjesaanhuis.nl` rank entirely off this pattern). Scope: a small set of _substantive_ pages (~300–500 words each, real copy, no city-name-swap templating — Google penalises that as doorway pages). Slugs to start:
  - `/catering/hilversum` — home turf, most depth
  - `/catering/het-gooi` — umbrella for Bussum, Laren, Blaricum, Naarden
  - `/catering/amsterdam`
  - `/catering/utrecht`

  Each page emits its own `LocalBusiness` JSON-LD with the city in `areaServed` (not just `Country`). Mirror to `/en/catering/...`. SvelteKit dynamic route `[slug]/+page.svelte` with a typed slug→content map keeps it simple and keeps content in git. GBP is already doing the heavy lifting for the map pack — these pages are reinforcement.

## GEO strategy follow-ups (added 2026-04-28)

From the `/geo-optimizer` strategy run. Off-site authority work to increase AI citation odds across ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews. The on-site enabler edits (NL+BE `areaServed`, `dateModified` via `__BUILD_DATE__`, explicit AI-bot rules in robots.txt, Person `sameAs`) are already in code.

- [ ] **Apple Maps Connect + Bing Places for Business** — separate from GBP, broadens the local-pack citation graph. Same NAP as GBP (name, address, phone, email).
- [ ] **Wikidata entity for Hangende Hapjes** — free, ~30 min, biggest ChatGPT lever short of Wikipedia (and Wikipedia is gated on press, see below). Properties: _instance of_ (catering company), _country_ (NL), _HQ location_ (Hilversum), _founder_ (Charlotte + Gijs van Leeuwen as new items), _inception_, _official website_, _sameAs_ Instagram. Reference each property to homepage / Insta. Then add the Q-number to `LocalBusiness.sameAs` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] **List on Cateron**
- [ ] **Gooi en Eemlander backlink follow-up** — article is published; follow up with the editor / journalist to confirm the online version has a clickable link to `hangendehapjes.nl`. Local-press editorial backlinks support the Wikipedia notability case below.
- [ ] **Pitch 1–2 more press outlets** — candidates: Bruidsmagazine, ThePerfectWedding.nl editorial (not just the listing), Het Parool food, NRC Lux. Angle: novel live-walking duo, NL-first concept, real prices, founder quote. One pitch deck reused. Goal: 1 additional press hit in the next 60 days. (Overlaps with the existing "Pitch one NL wedding/event blog" bullet — treat that as the same item, this just makes it concrete.)
- [ ] **Set up Reddit account + first 5–10 helpful comments** — operationalises the "be a real participant" bullet above with concrete subreddits and a starter cadence: r/thenetherlands, r/Amsterdam, r/Hilversum, r/Wedding. Useful first; the named account itself becomes the citation surface for Gemini.
- [ ] **Post-event review-request flow** — automated Postmark email 3 days after each event with a one-click link to leave a Google review on GBP. Goal: 5+ real reviews on the profile.
- [ ] **Populate Reviews section + add `Review` schema** — once 5+ reviews exist: replace the empty-state copy in [src/lib/i18n/nl.ts](src/lib/i18n/nl.ts) and `en.ts`, add `Review` nodes and `aggregateRating` to `LocalBusiness` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Blocked on the review-request flow producing reviews. (Subsumes the `aggregateRating` note further down under "Worth knowing, not urgent".)

## Recurring (added 2026-04-28)

GEO is mostly cadence work. Calendar reminders or scheduled background agents.

- [ ] **Monthly: AI citation baseline check** (~15 min). Run these 5 queries against ChatGPT, Claude, Perplexity, Gemini: _"live catering Hilversum"_, _"walking dinner alternatief Nederland"_, _"live tiramisu bruiloft"_, _"Hangende Hapjes"_, _"catering bruiloft 50 gasten Nederland"_. Log per query: cited (Y/N), position in answer, sentiment. Spreadsheet is fine — no need for gego/llmopt at this volume.
- [ ] **Monthly: GBP photo upload + review responses** — 5–10 fresh event photos to Google Business Profile, respond to every new review.
- [ ] **Weekly: 1 substantive Reddit comment** under the named account. Catering / weddings / event subreddits. No drive-by self-promotion — usefulness first.
- [ ] **Every 60 days: refresh homepage** — update at least one element (price detail, stat, photo, copy tweak); `dateModified` bumps automatically via `__BUILD_DATE__` in [vite.config.ts](vite.config.ts) on each deploy. Perplexity weights freshness heavily.
- [ ] **Quarterly: first-party data blog post** — real numbers from your bookings (portions served, popular topping combos, Q-on-Q growth, average guest count). Original first-party data is the single strongest GEO signal — becomes the only citable source for niche queries.

## Content plan (added 2026-04-28)

Full ranked content calendar — target queries, intent, difficulty, per-post briefs, source SERP probes — lives in [docs/seo-content-plan.md](docs/seo-content-plan.md). Re-run `/toprank:keyword-research` quarterly to refresh.

The three concrete next-up posts pulled from there:

- [x] **Post — "Hoeveel hapjes per persoon op een receptie of bruiloft?"** (S1 in the plan). First-party-data anchor for the "Catering planning facts" cluster. Already echoed above as the priority blog post; this is the same item.
- [x] **Post — "Tiramisu op je bruiloft"** (S2 in the plan). User-priority target. SERP for "tiramisu bruiloft" is owned by recipe sites and Tiktok — _zero_ NL caterer is positioned on the phrase. Land-grab opportunity. Optionally merge with the existing "Tiramisu live serveren" blog seed into one master post (broader phrase wins more intent). Slug: `/blog/tiramisu-bruiloft`. Schema: `Article` + nested `Service` ref to De Toetjes Vrouw.
- [x] **Post — "Burrata op je bruiloft"** (S3 in the plan). Sister to the tiramisu post — same own-the-term play for De Borrel Baas. **Confirmed AI Overview win**: searching "burrata bruiloft" already triggers a Google AI Overview describing the burrata-bar concept, citing OhMyFoodness + 3 recipe sites — _zero_ caterer cited. Once our service-side page exists we should land in that citation set fast. Slug: `/blog/burrata-bruiloft` (broader than the original `/burrata-bar-bruiloft` slug to capture both queries). Ship in tandem with the tiramisu post for symmetry.
- [ ] **Dedicated OG images for the tiramisu and burrata blog posts** — both posts currently reuse a generic image (`/images/07.jpeg` for tiramisu, `/images/borrel.jpeg` for burrata) instead of a purpose-built social card like `og-blog-hoeveel-hapjes-per-persoon.jpg`. Produce `static/og-blog-tiramisu-bruiloft.jpg` and `static/og-blog-burrata-bruiloft.jpg` at 1200×630, then swap the `ogImage` constant in [src/routes/blog/tiramisu-bruiloft/+page.svelte](src/routes/blog/tiramisu-bruiloft/+page.svelte) and [src/routes/blog/burrata-bruiloft/+page.svelte](src/routes/blog/burrata-bruiloft/+page.svelte). Matching OG cards lift social CTR and improve LLM thumbnail rendering when the posts get cited.
- [ ] **Post — "Charlotte's tiramisu recept" (publiek, geen email-gate)** — Charlotte's actual recipe with photos, written in her voice, no form. Targets long-tail "tiramisu recept" variants ("tiramisu zonder alcohol", "tiramisu met amaretto", "echte Italiaanse tiramisu thuis") rather than the impossibly competitive "tiramisu recept" head term. Strong E-E-A-T signal (real person, real baker background, real photos) and prime LLM-citation material — recipe content gets quoted heavily by ChatGPT/Perplexity. Considered (and rejected) gating it behind email capture: audience-intent mismatch — recipe-grabbers are home cooks, not event hosts, and we have no nurture system to monetise the list yet. Public ranking + AI citations beat a list of unqualified emails. Slug: `/blog/tiramisu-recept`. Schema: `Recipe` JSON-LD (Google rewards this with rich-result rendering) + nested `Service` ref to De Toetjes Vrouw at the bottom of the post for the live-serving alternative.

After these four, the next batch (S4 live cooking, S5 wat kost catering, S6 /catering/hilversum) is in the calendar in the plan doc. Don't add them as tasks until the first batch ships.

## Product roadmap

- [ ] **Wedding cake / bruidstaart options** — extend De Toetjes Vrouw with a bruidstaart aanbod. Charlotte's baking background already supports this. Decide: separate product or sub-offer of De Toetjes Vrouw? Pricing tiers, sizes, flavours. Once decided, add a `Service` node to JSON-LD, a section on the homepage, copy in `nl.ts` / `en.ts`, photos. Likely also opens up content angles (`/blog/bruidstaart-of-tiramisu`, `bruidstaart` keyword cluster) — log those in [docs/seo-content-plan.md](docs/seo-content-plan.md) when scoping.

- [ ] **In-person tasting / sampling in Hilversum (potential lead magnet)** — we're happy to host couples or planners for a tasting if they come to Hilversum. Productise: define what's included (1 tira portion + 1 burrata bowl per person? small fee or free? what timeslots?), how it's booked (separate form on site or via existing contact?), and what happens after (hard CTA to book). Once productised this becomes the **strongest lead magnet we have** — far higher conversion than any PDF download because it's intent-loaded (you don't drive 30+ min to Hilversum unless you're seriously considering booking). Recipe-as-email-magnet was rejected (audience-intent mismatch, no nurture system); a tasting voucher is the better play once we have:
  - A clear tasting product (price, scope, time)
  - A booking flow (could be as simple as a calendar link in a "Boek een proeverij" CTA)
  - A follow-up email template that converts taste → quote within ~3 days
    Until those exist, leave this as a dormant lead-gen channel.

- [ ] **Calibrate mix surcharge in the admin calculator** — current model in [src/lib/admin/pricing.ts](src/lib/admin/pricing.ts) uses tiramisu's prep curve (the higher of the two) at the smaller-batch portion count, so 55/50 and 50/55 splits price symmetrically. Side effect: a 50/50 mix of 100 lands at €7.69/portion vs €6.50 for pure tira-100 (~+18%), which is on the high side for catering mix premiums (typical 10–15%). Three knobs to evaluate once real-world quotes come in: (1) drop default `mixPrepFactor` from 1.0 to 0.75, (2) switch to the average of tira+burr prep curves instead of using the max, (3) leave as-is and rely on the per-quote override in the calculator's advanced section. Revisit after the first ~5 real mixed-quote requests so we have actual data to calibrate against. Same review should sanity-check the extra-person tier formula (`setup + ceil(N/50) × per_50`) and the travel-cost defaults (€100 free retour, €0,45/km).

## Paid acquisition (defer ~1–2 months)

Hold ad spend until the funnel is measurable and organic has produced a baseline pulse. Right now (2026-05-10): ~60k Insta Reel views and the first contact-form lead just landed — too small a sample to know whether organic + word-of-mouth sustains a steady cadence. Ads on top of unmeasured organic confound attribution.

Gates before turning ads on (all three must be true):

1. **Funnel tracking is live** — UTM tagging on every external link, custom Umami events on contact submit + admin offerte/factuur generation, "Hoe heb je over ons gehoord?" field on the contact form. See "Funnel tracking" under _Today_ above.
2. **Organic baseline established** — at minimum 3 contact-form leads in a 30-day window without ad spend, so we know the floor we're paying ads to lift above.
3. **Durable assets shipped** — at least 3 location pages (`/catering/hilversum` + 2 others) and 2 more blog posts beyond `hoeveel-hapjes-per-persoon`, so ad clicks land somewhere with substance.

When activated, start narrow and measurable:

- [ ] **Google Search Ads — €15–25/day, 2-week test**. Geo-fence to Hilversum + Het Gooi only. 5–10 hand-picked high-intent keywords (e.g. "live catering Hilversum", "originele bruiloftscatering Gooi", "tiramisu bruiloft Nederland", "burrata bar bruiloft"). Single ad group, exact + phrase match only (no broad). Conversion goal in Google Ads = the `contact_submit` Umami event (mirror to GA4 if needed for the conversion bidding model, otherwise stick to Manual CPC). Kill any keyword with 0 conversions after 50 clicks; scale any with CAC < €100. Do NOT enable Performance Max — it's a black box and at this budget the bid system has nothing to optimise toward.
- [ ] **Skip Meta Ads for now**. Insta Reels are doing brand-level top-of-funnel reach for free (60k organic views in the same window a paid campaign would burn through €500+ to match). Revisit only when organic IG reach plateaus AND we want retargeting on warm pixel audiences — at that point install the Meta pixel via [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte) or hooks, with a privacy banner if needed.

Mental model for spend timing: ads buy _speed_ when the calendar has gaps and you need a booking _this month_, not as a permanent line item. Treat them as a faucet, not a foundation.

## Partnerships / referrals (start now, real outreach within ~30 days)

The single highest-leverage acquisition channel for catering: **wedding venues** and **wedding planners**. One preferred-vendor slot at a busy venue or planner book = tens of weddings/year of inbound, dwarfing any ad campaign at this stage. Strategic framing decided 2026-05-10:

- **Lead with relationship, not money.** Cash kickbacks as the opening move can actually kill the conversation at the best venues (NL norm: many treat direct referral fees as a conflict-of-interest with their clients). The pitch is reciprocal recommendation + a free tasting at their next staff event — _not_ a finder's fee. Money comes in stage 2.
- **We're not stepping on existing caterers' toes.** Frame as receptie/borrel add-on, not dinner replacement: 30–60 minutes of live walking-tray experience between ceremony and dinner. We're adjacent to seated catering, not competitive — and most full-service caterers don't do walking-around live prep.

### Outreach plan

- [ ] **Pick 3 first-target venues in Het Gooi** that allow / require external catering ("trouwen zonder catering" / flexibele locaties). Easy wins because there's no political tension with an exclusive caterer. Candidates to evaluate: Kasteel Groeneveld (verify external-catering policy), Landgoed Zonnestraal, Sypesteyn, museums and country-house locations in Bussum/Laren/Blaricum/Naarden. Avoid full-service / exclusive-catering venues for the first batch.
- [ ] **Approach script (no money in it):** "We're a new live-catering concept based in Hilversum — couple walking around with a tray, making fresh tiramisu / burrata per guest as part of the receptie. Not a dinner replacement, more an entertainment add-on. We'd love to do a 50-portion tasting at your next staff event, no strings, so you and your coordinators can taste it. If you like it, we'd be honoured to be on your preferred-vendor list." That's it for the first contact. Cost to us: ~€100 in food + a Saturday afternoon. Cheaper and far more memorable than a kickback offer.
- [ ] **Target a parallel cohort of wedding planners.** Different rules: planners run on a vendor-fee model, _expect_ commission. Lead with **10% of booking value** (cap at €300/event) or a flat **€150–250/booking** from the first contact. Find candidates via theperfectwedding.nl planner listings, recent "in the press" articles about NL wedding planners, and Insta hashtags `#weddingplannernl` `#trouwplanner`. Pick 3 planners covering Gooi/Amsterdam/Utrecht to start.
- [ ] **Track everything in the Deals sheet** (defined under _Today_ → _Funnel tracking_) plus a per-partner row in a small "Partners" tab: `partner / first contact date / status (cold → tasted → preferred-vendor → producing leads) / leads sent / bookings closed`. Without this, we'll forget who said what after partner #4.

### Stage 2 (only after the first organic referral lands)

- [ ] **Formalise with a flat €100–150 per booked event** for venues that have sent at least one lead. Communicate as "thank you for trusting us" rather than "here's why you should". One-pager (PDF or email) with the terms — keep it simple, no contracts.
- [ ] **Bump to 5–8% of booking value (capped €300/event)** only if a partner explicitly asks for percentage. Most won't.
- [ ] **In-kind alternatives** for venues whose policies forbid cash: free 50-portion catering at their next staff/team event, or a tasting voucher couples can redeem when booking via that venue. Same economics, none of the policy friction.

The whole partnership track is gated on having the funnel tracking in place — we need to know which leads came via which partner before paying anything out. Do _Today → Funnel tracking_ first, then this.

## Worth knowing, not urgent

- [ ] **Surface "geen schotelgeld" as a differentiator** — most wedding/event venues charge schotelgeld (a per-guest or flat plating fee, typically €2–5 p.p.) when external dessert is served _by the venue_ off plates. Because we walk between guests with our own tray and serve directly into our own bakjes, that fee doesn't apply — the venue isn't doing any plating. Useful angle for cost-conscious couples comparing De Toetjes Vrouw against a traditional bruidstaart. Surface as: (a) an FAQ entry ("Moeten we schotelgeld betalen aan onze locatie?"), (b) a paragraph in the `/blog/tiramisu-bruiloft` post (and the upcoming bruidstaart copy), and/or (c) a bullet on the Toetjes product card. Concrete and money-saving; fits the voice rule about "concrete beats vague". Verify with one or two recent venue contracts before claiming it as universally true — a small minority of venues charge a flat external-catering fee regardless of plating.
- [ ] **Embed live social proof on the homepage**: latest Instagram post (or a small grid) and a Google Reviews block once GBP has a few reviews. Instagram has no clean official embed for SvelteKit — either oEmbed iframe per post (simple, ~okay perf) or fetch via Instagram Basic Display API and render natively (more work, better LCP). Google reviews: use the Places API `place_details` → render server-side; avoid third-party widgets that ship a tracker. Wire `aggregateRating` into the `Service` JSON-LD at the same time.
- [ ] JSON-LD `LocalBusiness` is missing `telephone`, `streetAddress`, and `postalCode` (all flagged as non-critical by Rich Results Test). Add as a bundle if/when you want a richer Google Knowledge Panel — adding only `telephone` won't unlock it on its own. Fine to keep just city while the business is new, and don't put a home address in there if you'd rather not. Edit in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] Sitemap omits `<lastmod>` — fine for two URLs, would matter at scale.
