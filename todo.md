really good cake website to model after: https://welovecakes.nl/trouwen/bruidstaarten-1

reference for prices: https://welovecakes.nl/trouwen/prijzen

### DNS / hosting sanity

- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park
- [ ] **Lighthouse audit** — Chrome DevTools → Lighthouse → mobile + perf/SEO/accessibility. Hero image is large (`hero.jpeg`); if LCP is slow, generate a smaller variant.

### Funnel tracking (do before any ad spend or referral payouts)

- [ ] **Wire end-to-end funnel into Umami** — without this every later channel decision (ads, referrals, content prioritisation) is guessing. Three pieces:
  1. **UTM-tag every external link** that points at the site: Instagram bio link, IG story link stickers, Linktree (if any), every directory listing (theperfectwedding.nl, future Showbird/Gigstarter), email signature, press follow-ups. Convention: `?utm_source=instagram&utm_medium=bio&utm_campaign=2026q2`. Umami already captures referrer + UTM; no setup needed beyond the tagging discipline. Maintain a small reference list of "where this URL is posted" in [docs/](docs/) so we don't lose the mapping.
- [ ] **Exclude `contact_form_suspect` from `computeMetrics`.** `periodLeadTrend` already filters honeypot/spam captures, but `computeMetrics` ([src/lib/deals.ts](src/lib/deals.ts)) counts every deal regardless of origin — so honeypot trips (captured `status: 'nieuw'`, `origin: 'contact_form_suspect'`) inflate the `/admin` dashboard's `total`/`open`/monthly `leads` and add a junk `bySource` bucket, drifting from the trend widget right next to them. Either filter suspects in `computeMetrics` too, or give captures a status the funnel ignores.
- [ ] **Spin up a "Deals" tracking sheet** (Notion DB or Google Sheet, doesn't matter). Columns: `date / source / lead name / status (lead → quote → booked → paid) / quote € / booking €`. Manual entry, ~30 sec per lead. This is the only place that knows deal value; Umami knows volume + source. Together they give CAC + conversion rate by source. Don't build software for this until 50+ rows exist.
- [ ] **Automated conversion-rate significance monitor** (defer until the funnel events have ~4–6 weeks of data — they'd just read "insufficient" today). The lead-only monitor already shipped (`/admin` dashboard, `periodLeadTrend`/`leadDropTest`/`binomialTwoSidedP` in [src/lib/deals.ts](src/lib/deals.ts)) tests whether **lead volume** dropped — but it assumes traffic was stable across the two windows (no denominator). To test whether the **conversion rate** dropped independent of traffic, pull period counts from the **Umami API** (website id `cb19fa03-37f1-4594-8c87-d618ee43bcc4`, needs an API key) and run a **two-proportion test** (Fisher's exact / chi-square) on the ideal ratio: `contact_submit ÷ contact_view` per period — "of the people who actually reached the form, what fraction submitted?". `contact_view` only exists since 2026-06-26, so this is forward-looking. NOT GSC: GSC is organic-search-only and lags ~3 days; Umami sees all channels (IG, direct, word-of-mouth) + our funnel events. Until built, read the funnel by eye in Umami's UI (`contact_view` → `contact_start` → `contact_submit`) — it answers reach/start/finish for free. See [[umami-events]].

### Findings from 2026-05-09 check-in

- **GSC anonymises low-volume queries.** The Queries report only shows queries that cross a privacy threshold; everything below is hidden but still counts in the Pages totals. That's why on 2026-05-09 the Pages report showed 163 total impressions but only 2 queries appeared in the Queries report. Not a bug — expect Queries to lag Pages by weeks until specific terms cross the threshold.
- [~] ~~**Improve `/blog/hoeveel-hapjes-per-persoon` CTR.**~~ **Retired 2026-08-09** — see the 2026-08-09 audit findings below. The title/description were rewritten as suggested here and CTR did not move (0.86% → 0.51% on 24× the impressions). The diagnosis was wrong: it's not a snippet problem, it's a low-value audience. Keep the post as top-of-funnel and stop optimising it. Original note kept for context: 116 impressions / 0.86% CTR after ~2 weeks = ranking somewhere on lower page 1 or top of page 2 but not getting clicked. Run URL Inspection in GSC to confirm position, then rewrite the title tag and meta description to better match search intent (lead with a concrete number/quantifier, e.g. "Hoeveel hapjes per persoon? Echte cijfers van een caterer"). Edit the post's `title` / `metaDescription` in [src/lib/i18n/nl.ts](src/lib/i18n/nl.ts).
- [ ] **Re-check GSC Queries report around 2026-06-06** (≈ 4 weeks after the post launched). Filter Performance → Pages = `/blog/hoeveel-hapjes-per-persoon` and read which queries it's ranking for now that volume has built. Use those long-tail terms to inform briefs for S4+ in [docs/seo-content-plan.md](docs/seo-content-plan.md).
- **NL-first is empirically confirmed.** `/en` got 4 impressions vs 31 on the NL homepage and 116 on the NL blog post. **Don't mirror new posts to EN until the NL version is ranking.** The blog seeds list already says this; data now backs it — bake it into the content cadence and resist the urge to dual-write.

### Findings from 2026-06-26 GSC audit (first /seo-analysis run)

90-day GSC: 113 clicks / 1,903 impressions / 5.94% CTR / pos 8.1. Search is healthy and **not declining** (28d-vs-prior shows zero declining pages/queries). Two threads untangled below.

- **Lead-drop diagnosis (the trigger for all of this).** 6 real offertes end-May→early-June, then 0 in the next 2 weeks. Confirmed `contact_submit` (Umami) = 0 **and** Postmark = 0 for those 2 weeks → nobody submitted. The form is innocent (it delivered the earlier 6 fine) — this is demand fluctuation or a top-of-funnel gap, not a delivery bug or the honeypot. At n≈6 it's within statistical noise, not yet a trend. Capture, don't keep guessing.
  - Shipped 2026-06-26 to make the next dry spell legible: `contact_start` (first field focus), `contact_view` / `home_products_view` (passive scroll-into-view via `src/lib/inView.ts`), progressive-disclosure form, location now optional, and a hardened honeypot that **captures** suspected spam (`origin='contact_form_suspect'`) + Telegram-pings instead of silently dropping. See [[umami-events]] / [[aanvragen-pipeline]].

- [x] **PRIORITISE `/catering/hilversum` + `/catering/het-gooi`** — Hilversum shipped 2026-07-01. **Numbers below are stale; see the 2026-08-09 findings for the current read** (the page now sits at pos ~36 on 526 imp/mo and the real gate turned out to be GBP reviews, not on-page copy). `/catering/het-gooi` is deferred until Hilversum proves the pattern. Original note: this is the biggest untapped lever and the GSC data now quantifies how _close_ we already are. Sharpens the "Build location pages under `/catering/[slug]`" task below; bump it above the blog backlog. Target queries (high-intent local buyers, currently ranking only via the homepage by accident):
  - `hapjes bestellen hilversum` — pos 7.6, 36 imp, **0 clicks** (bottom of page 1, no dedicated page)
  - `cateraar hilversum` — pos 13.4 (page 2)
  - `catering hilversum` — pos 21.6 (page 3)
    Put these phrases in the title/H1/body of the Hilversum page; emit `LocalBusiness` JSON-LD with the city in `areaServed`. Note: volume is low per query, but intent is maximal — this is where buyers (not browsers) are.

- [ ] **Funnel significance monitor** (the "is this drop real or noise?" tool). Build into the `/admin` dashboard — we already have the data (`deals.created_at` + `computeMetrics`). Model leads/period as Poisson with baseline rate λ (trailing weeks): P(0 leads in a period) = e^(−λ), so a zero-period is only statistically surprising (p<0.05) once **λ > 3 leads/period**. Right now λ is unestablished (one burst of 6, one of 0 — n too small to fit). Once ~6–8 weeks of post-fix data accumulate, compute λ from the trailing window and flag any period below the 5% lower Poisson bound; until then treat a single dry fortnight as noise. Keeps us from both panicking early and missing a real decline late.

- **http→https + www redirects verified correct** (2026-06-26): both 308-redirect to `https://hangendehapjes.nl`. The stray `http://` entry in GSC is Google re-checking legacy URLs — it'll consolidate, no action.

- [ ] **Sitelinks: push the 3 product pages, not via the sitemap.** Goal is for a "Hangende Hapjes" brand search to show the 3 products (tiramisu / burrata / bruidstaart) as sitelinks. Sitemap `<priority>` does NOT control this (Google largely ignores the field, and `hoeveel-hapjes` is already at 0.7 like everything else, so deprioritising it changes nothing). Sitelinks are algorithmic, driven by internal-link prominence + clicks + distinct URLs/titles. Real blocker: [Nav.svelte](src/lib/components/Nav.svelte) points at homepage anchors (`#products`, `#bruidstaarten`), not 3 distinct product URLs, so Google's only product-page candidates are the blog posts, and `hoeveel-hapjes` surfaces because it gets the most impressions, not because of the sitemap. Levers: (a) give each product a prominent, distinctly-titled internal link (nav + footer) pointing at its canonical URL (`/blog/tiramisu-bruiloft`, `/blog/burrata-catering`, `/blog/bruidstaart`), (b) consistent descriptive anchor text across the site, (c) drive clicks (ads help). Can't hard-specify the set (the GSC sitelink-demotion tool was removed years ago) and a young low-authority site may get few/none for a while.

### Findings from 2026-08-09 GSC audit (second /seo-analysis run)

90-day GSC (2026-05-08 → 2026-08-06): **252 clicks / 5,690 impressions / 4.43% CTR / pos 10.2**. Versus the June audit: **clicks +123%, impressions +199%**. The falling site-wide CTR and average position are _not_ a decline — they're the arithmetic of `/blog/hoeveel-hapjes-per-persoon` and `/catering/hilversum` adding thousands of deep-position impressions. Resolved since June: http:// and www both 301 correctly, and `/blog/burrata-bruiloft` now 301s to `/blog/burrata-catering`.

- [x] **Put "millefoglie" in the `/blog/italiaanse-bruidstaart` title.** Shipped 2026-08-09. The page's own biggest query (`millefoglie`, 107 imp, pos 9.1) wasn't in the title tag, and `wat is millefoglie` sat at **pos 5.8 with 0 clicks on 48 impressions**. Result: 3.43% CTR on that page versus **15.57%** on `/blog/tiramisu-bruiloft`, which does have its query word in the title. Same template, same author, so the title is the variable. Now `Millefoglie: de Italiaanse bruidstaart | Hangende Hapjes`. **Re-check the CTR around 2026-09-20** (~6 weeks); if it hasn't moved off ~3.5%, the problem is the SERP, not the title.
  - Slug deliberately left as `/blog/italiaanse-bruidstaart`. URL keywords are a weak signal and renaming would throw away the ranking the page has already built. Title is the strong lever; slug isn't worth the reset.

- [ ] **Strengthen `/catering/hilversum` — decided 2026-08-09 to keep it, not canonical it away.** First read of the data looked like the page was failing (pos 39.4 for `catering hilversum` while the homepage ranks 20.0 for the same query, which is real cannibalization). But the page only shipped **2026-07-01**: impressions went 61 → 526 in its first five weeks while position stayed flat at ~36. That's Google discovering and evaluating a young page, not a failing one. Canonicalling it to the homepage after five weeks would have been premature and would have killed the `/catering/het-gooi` + `amsterdam` + `utrecht` roadmap below. **Give it until ~2026-10-01, then reassess.**
  - [x] **First deepening pass shipped 2026-08-09** (~862 → ~1,180 words, now ahead of the homepage's 1,123). Added a `Bedrijfsfeest of zakelijke borrel in Hilversum` section plus a matching FAQ, in both locales, in [src/lib/catering/content.ts](src/lib/catering/content.ts). Targets `bedrijfsfeest hilversum` (50 imp, **pos 49.6**, 0 clicks) and `restaurantcatering hilversum` (49 imp, pos 37) which nothing on the site was aimed at. Uses Stip as named local B2B proof, Mediapark + Nike campus as **proximity only** (we have not catered at either, and the copy must never imply we have), and links to `/blog/burrata-catering`, which already links back. Purely additive, existing copy untouched.
  - [ ] **Still to do on this page:** more first-party proof. Right now Stip is the only named event. Anything concrete helps, even unnamed ("een personeelsfeest in Bussum", "een receptie in Laren"). Also consider adding the Stip review to this page's `Service` JSON-LD, but only once the **full** quote is visible on the page: Google requires review text to be on-page, and a one-line excerpt plus a `reviewCount: 1` aggregate is not worth the risk today.
  - [ ] **Considered and skipped: changing the H1.** It's `Heerlijke hapjes ter plekke gemaakt voor elke gast` and carries no local or category signal in the page's strongest on-page slot. Changing it is probably the single highest-value remaining edit here, but it's existing copy and Gijs asked for additive-only changes on 2026-08-09. Pick this up deliberately, not incidentally.
  - **The actual gate on the whole Hilversum cluster is GBP reviews, not on-page work.** These are local-pack SERPs and the profile has **1 review** (`aggregateRating.reviewCount: 1`). The cluster — `catering hilversum` (432 imp), `hapjes bestellen hilversum` (141), `cateraar hilversum` (77), `bedrijfsfeest hilversum` (50), `restaurantcatering hilversum` (49), `catering het gooi` (11) — is **760 impressions in 90 days and 1 total click**. Blocked on the post-event review flow under GEO follow-ups; that task is now the highest-leverage item on this list.

- [ ] **Homepage meta deliberately left unchanged (2026-08-09).** Considered putting Hilversum in the homepage title/description to chase the local queries, then reverted: the Hilversum page keeps that job, and the homepage stays focused on weddings and events. Revisit only if `/catering/hilversum` is abandoned.

- **`hapjes bestellen hilversum` is an intent mismatch, not an opportunity.** Pos 4.4, 136 impressions, **0 clicks** in 90 days. Position 4 with 0% CTR means the searcher wants snacks delivered to their door and we sell a live act from €425. Don't optimise for it. Same logic retires the old "improve `/blog/hoeveel-hapjes-per-persoon` CTR" task above: that page is **2,742 impressions (48% of the site) at 0.51% CTR**, its head term sits at pos 14.4, and the queries around it (`hoeveel bittergarnituur per persoon`, `goedkope hapjes voor veel mensen`, `borrelhapjes goedkoop`) are DIY hosts shopping at the supermarket. It's a fine top-of-funnel asset. Stop reading its impression count as opportunity.

- [ ] **Push `/blog/tiramisu-bruiloft` from pos 4.7 into the top 3** — the single biggest prize on the site, and it serves the highest-value audience. 1,066 imp / 166 clicks / **15.57% CTR at pos 4.7**. At pos 3 the CTR curve gives roughly +23 clicks/mo. On-page is already strong (1,786 words, Article + FAQPage + Service/Product), so the lever is authority and coverage, not metadata: point contextual in-body internal links at it from the other posts using the anchor _"tiramisu bruidstaart"_ (currently only generic footer links), and spend any link-building or ads traffic here. **Explicitly not doing:** adding a `tiramisu bar` section. It ranks (pos 9.6) but "Tiramisu Bar" is a direct competitor's brand name, we don't serve from a static bar, and there's a restaurant called Tiramisu in Hilversum already owning `tiramisu catering` locally. Not worth diluting a page that's working.

- [ ] **Content goals from the keyword wishlist** — full tiered list with GSC annotations in [docs/seo-keyword-targets.md](docs/seo-keyword-targets.md). Next three worth writing, all wedding/event intent:
  1. **"Wat kost een bruidstaart?"** — highest-intent term on the list, we have real numbers, and price-transparency posts rank. Feeds `/blog/bruidstaart`.
  2. **Guest-count cluster** — `bruidstaart 50 personen` (pos 12.5), `bruidstaart 25 personen` (pos 12), `bruidstaart klassiek` (pos 14), `klassieke bruidstaart` (pos 11.7). Four page-2 rankings with nothing targeting them directly.
  3. **`hapjes receptie` / `hapjes bruiloft`** (pos 31.0 / 21.4) — the receptie moment is exactly our slot and no page owns it.
     Deliberately skipped: `hapjes bestellen`, `snacks`, `borrel`, `partyservice`, `pizza catering`, `bruidstaart maken`. Reasons per term in the doc.

- [ ] **Set `PAGESPEED_API_KEY`** so future audits can pull Lighthouse + Core Web Vitals. The PageSpeed API returns quota `0` for GCP project `hangendehapjes-seo` even with the API enabled; it needs a key from https://console.cloud.google.com/apis/credentials. Low priority: manual checks are all healthy (TTFB **89ms**, 87KB HTML, 449 DOM nodes, one deferred third-party script, all images AVIF/WebP with explicit `width`+`height`, 6/7 lazy) and traffic is below the CrUX threshold so there's no field data to fetch anyway. This also covers the "Lighthouse audit" item under DNS / hosting sanity.

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

## Paid acquisition

Full strategy, campaign structure, creative sets and pixel/consent detail live in
[docs/meta-ads-plan.md](docs/meta-ads-plan.md). This is the actionable checklist.

**Direction change (2026-07):** the old note here said "skip Meta for now" — that assumed we'd
optimise for conversions (which our lead volume can't feed) and that the pixel was a prerequisite.
New plan sidesteps both: **Meta-first, optimised for engagement/video-views**, which needs no site
pixel and builds warm audiences for free. Two campaigns split by audience (Consumer, Zakelijk),
sequenced. Meta = demand generation for the novel concept; Google Search stays a narrow
demand-capture play for the classic bruidstaart only (see below).

### Phase 0 — tracking foundation (dev, optional-but-nice, does NOT block Phase 1)

- [ ] **Meta Pixel, consent-gated.** Install via [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte) or a layout hook; loads only on consent. No GA4 ever (Umami covers analytics). See plan doc for why the early ads don't actually need this.
- [ ] **Minimal cookie banner** — two buttons (accepteren/weigeren), localStorage flag, pixel off by default. Gates only the Meta pixel; Umami stays cookieless and consent-free. Protect the "we don't collect" advantage: add only what a live channel needs.
- [ ] **Fire Meta `Lead` event on the existing `contact_submit`** Umami event, so future conversion campaigns/measurement have data.
- [ ] **Build Custom Audiences** once data flows: video-viewers 50%+, IG/FB engagers (available with no pixel), and `/blog/tiramisu-bruiloft` visitors (needs pixel + volume).

### Phase 1 — Consumer campaign (launch now)

- [ ] **Re-cut the 2 existing tiramisu clips into 2–3 vertical 9:16 hooks** (<15s, hook in second 1, burned-in captions, sound-off legible). Organic underperformance is not a paid predictor — don't reshoot before testing paid.
- [ ] **Produce statics** (9:16 master + 4:5 feed crop) for the Consumer set: product-beauty + offer (`tiramisutaart_hapje`), real-event proof (`charlotte_evenement`), optional "hartig of zoet" duo. See creative table in plan doc.
- [ ] **Write ad copy** (primary text / headline / CTA) NL + EN per creative, in the brand voice.
- [ ] **Set up the Consumer campaign**: objective = video views/engagement (NOT conversions — volume can't feed it); mixed video+static in one ad set; target engaged couples / party hosts (Gooi + Randstad); start ~€10/day, 2–3 week test. Land clicks on `/blog/tiramisu-bruiloft` (proven converter).
- [ ] **Read results after 2–3 weeks**, double down on the winning creative/angle, prune the rest.

### Phase 2 — Zakelijk campaign (gated on burrata video)

- [ ] **Shoot burrata video** — Gijs making a bowl live + guest reaction, vertical. This is the bottleneck for the whole Zakelijk campaign; no motion = weak for a live concept.
- [ ] **Produce Zakelijk statics + copy** (burrata bar op je borrel, Borrel Baas in actie).
- [ ] **Launch Zakelijk**: objective engagement, target corporate / event planners. Until the video exists, at most run the two statics at a token budget just to seed the audience.

### Ongoing

- [ ] **Capture vertical burrata + tiramisu footage at every event.** Footage is the real constraint, not budget.
- [ ] **Graduate to a lead objective + website retargeting** only once a warm audience pool + pixel history exist.

### Google Search — narrow demand-capture (separate track, later)

- [ ] **Classic bruidstaart search ads** — the one live search pond (real demand, we don't rank yet). Geo/intent-qualified keywords only: "bruidstaart op maat", "bruidstaart Hilversum / Het Gooi", "bruidstaart proeven", "botercrèmetaart bruiloft". NOT generic "bruidstaart" (national ocean). Do NOT bid on `tiramisu-bruiloft` terms — we already rank organically. Land on [/blog/bruidstaart](src/routes/blog/bruidstaart/+page.svelte), use the page to upsell the live concept. Conversion goal = `contact_submit`. No Performance Max at this budget. Only worth adding the Google Ads tag (not GA4) when this launches. Supersedes the earlier broad "live catering Hilversum" Search Ads idea.

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
