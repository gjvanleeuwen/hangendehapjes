# Post-launch checklist

The SEO infra (canonical, hreflang, OG, Twitter card, JSON-LD `LocalBusiness`, sitemap, robots.txt) is already wired in code. Most of what follows is *external* setup.

## Today

### DNS / hosting sanity

- [x] Pick one canonical domain (`https://hangendehapjes.nl` is hardcoded in [src/lib/site-config.ts](src/lib/site-config.ts)) and 301-redirect `www.` to apex via Dokploy/Traefik (done as 308; `http://www` is a two-hop redirect — left as-is, negligible impact)
- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park
- [ ] **Lighthouse audit** — Chrome DevTools → Lighthouse → mobile + perf/SEO/accessibility. Hero image is large (`hero.jpeg`); if LCP is slow, generate a smaller variant.

## Search Console follow-ups

GSC + Bing were submitted on 2026-04-26. Indexing has fully landed: both `/` and `/en` are indexed on Google + Bing, sitemap is processed, no manual actions, branded "hangende hapjes" search ranks #1, and the blog post is already pulling 116 impressions. Also picked up by **ChatGPT** — first referral visit logged in Umami on 2026-05-09, so the GEO setup is producing citations earlier than expected.

<details>
<summary>Indexing checks (all completed — collapsed)</summary>

#### Around 2026-04-30 (3–5 days post-submit)

- [x] **GSC → Sitemaps**: status "Success" with ≥ 2 URLs discovered.
- [x] **GSC → URL Inspection**: `https://hangendehapjes.nl/` and `https://hangendehapjes.nl/en` both on Google.
- [x] GSC **Manual actions** and **Security issues** — both empty.
- [x] **Bing Webmaster Tools → Sitemaps**: "Processed".
- [x] **Bing → URL Submission**: `/` and `/en` submitted.

#### Around 2026-05-09 (10–14 days post-submit)

- [x] **GSC → Pages**: both `/` and `/en` in "Indexed".
- [x] Branded "hangende hapjes" search in incognito → ranking #1.
- [x] **GSC → Performance**: data is flowing (163 impressions across 5 pages in the first ~2 weeks).

</details>

### Findings from 2026-05-09 check-in

- **GSC anonymises low-volume queries.** The Queries report only shows queries that cross a privacy threshold; everything below is hidden but still counts in the Pages totals. That's why on 2026-05-09 the Pages report showed 163 total impressions but only 2 queries appeared in the Queries report. Not a bug — expect Queries to lag Pages by weeks until specific terms cross the threshold.
- [ ] **Improve `/blog/hoeveel-hapjes-per-persoon` CTR.** 116 impressions / 0.86% CTR after ~2 weeks = ranking somewhere on lower page 1 or top of page 2 but not getting clicked. Run URL Inspection in GSC to confirm position, then rewrite the title tag and meta description to better match search intent (lead with a concrete number/quantifier, e.g. "Hoeveel hapjes per persoon? Echte cijfers van een caterer"). Edit the post's `title` / `metaDescription` in [src/lib/i18n/nl.ts](src/lib/i18n/nl.ts).
- [ ] **Re-check GSC Queries report around 2026-06-06** (≈ 4 weeks after the post launched). Filter Performance → Pages = `/blog/hoeveel-hapjes-per-persoon` and read which queries it's ranking for now that volume has built. Use those long-tail terms to inform briefs for S4+ in [docs/seo-content-plan.md](docs/seo-content-plan.md).
- **NL-first is empirically confirmed.** `/en` got 4 impressions vs 31 on the NL homepage and 116 on the NL blog post. **Don't mirror new posts to EN until the NL version is ranking.** The blog seeds list already says this; data now backs it — bake it into the content cadence and resist the urge to dual-write.

## AI / LLM visibility

Goal: get cited by ChatGPT, Perplexity, Gemini, Claude when people ask "live catering Hilversum / Gooi" or "originele caterings bruiloft NL". They recommend what they've *read about elsewhere* — so this is mostly off-site work.

- [x] List on **theperfectwedding.nl** (highest-authority NL wedding directory, often cited by LLMs). Free, ~15 min.
- [~] ~~ThePerfectWedding sponsored-article offer (€480 for "1000 guaranteed views" in a new article, evaluated 2026-05-09)~~ — **passing for now.** Direct ROI math is roughly break-even (1000 views → ~30 site sessions → ~1 lead → ~0.3 booking → ~€500–800 revenue, before time cost). The 3500 views on their existing "speciale hapjes" piece is almost certainly all-time, not monthly, so the post-launch tail is small. Real value would be the backlink + AI-citation surface, but: (a) we already have a free directory listing on the same domain so the marginal AI lift is small, and (b) sponsored articles are usually `rel="sponsored"` / `nofollow`, which Google discounts. **Revisit only if** they confirm the link is `dofollow` *and* show 12-month organic-search traffic for a comparable sponsored (not editorial) post — at that point €300 would be interesting, €480 still steep. Better uses of the same €480 right now: pro photography (compounds across all channels and fixes the hero LCP), Google Ads (~150 clicks, measurable), or banking it for when more press hits accumulate and TPW's *editorial* team picks up the founder story for free.
- [~] ~~List on at least one of **bruiloft.nl**, **trouwen.nl**, **eventbranche.nl**~~ — skipped, the sites are spammy / barely reachable and not worth the cycles.
- [ ] Pitch one NL wedding/event blog for a feature ("originele caterings", "live food trends"). The founding story (couple, complementary characters, ~15 years together) is genuinely pitchable. One blog mention = disproportionate AI signal.
- [ ] **Build location pages under `/catering/[slug]`** (higher priority than the blog — Google location-biases catering queries hard, and competitors like `hapjesaanhuis.nl` rank entirely off this pattern). Scope: a small set of *substantive* pages (~300–500 words each, real copy, no city-name-swap templating — Google penalises that as doorway pages). Slugs to start:
  - `/catering/hilversum` — home turf, most depth
  - `/catering/het-gooi` — umbrella for Bussum, Laren, Blaricum, Naarden
  - `/catering/amsterdam`
  - `/catering/utrecht`

  Each page emits its own `LocalBusiness` JSON-LD with the city in `areaServed` (not just `Country`). Mirror to `/en/catering/...`. SvelteKit dynamic route `[slug]/+page.svelte` with a typed slug→content map keeps it simple and keeps content in git. GBP is already doing the heavy lifting for the map pack — these pages are reinforcement.

- [ ] **Build an in-app `/blog` route** with hardcoded posts (SvelteKit-native markdown via `mdsvex`, or just `+page.svelte` per post — start simple, no CMS). Goal: rank for *question-intent* queries (different from location pages above, which target *geographic intent*). Each post = one clean answer to a real Google query. Topic seeds:
  - "Originele catering voor een bruiloft"
  - "Live cooking op een bruiloft of receptie — hoe werkt het?"
  - "Wat kost catering voor 50/100/200 personen?" (price-curiosity intent is huge)
  - "Hoeveel hapjes per persoon op een receptie?"
  - "Tiramisu live serveren op een feest"
  - "Burrata bar — wat is het en wanneer past het?"

  Per post, add an `Article` JSON-LD node and link from the homepage footer. NL first; mirror to EN only once a post is ranking.
- [x] Add an **FAQ section** to the site with clean Q→A pairs (voor hoeveel personen, kosten vanaf, reisafstand, wat hebben jullie op locatie nodig, vegetarisch/allergieën, etc.) and wrap it in `FAQPage` JSON-LD. LLMs extract these almost verbatim. — FAQ section already existed; added `FAQPage` node with `Question`/`Answer` mapped from `t.faq.items` to the `@graph` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Worth revisiting copy for vegetarisch/allergieën coverage when the menu firms up.
- [x] Add **`/llms.txt`** — short markdown file at the site root describing who/what/where in plain text. Five minutes, low certainty of payoff but harmless. Convention: [llmstxt.org](https://llmstxt.org).
- [ ] (Ongoing, low priority) Be a real participant in NL wedding-adjacent Reddit/forum threads when genuinely useful. LLMs weight Reddit heavily. Do not spam.

## GEO strategy follow-ups (added 2026-04-28)

From the `/geo-optimizer` strategy run. Off-site authority work to increase AI citation odds across ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews. The on-site enabler edits (NL+BE `areaServed`, `dateModified` via `__BUILD_DATE__`, explicit AI-bot rules in robots.txt, Person `sameAs`) are already in code.

- [ ] **Apple Maps Connect + Bing Places for Business** — separate from GBP, broadens the local-pack citation graph. Same NAP as GBP (name, address, phone, email).
- [ ] **Wikidata entity for Hangende Hapjes** — free, ~30 min, biggest ChatGPT lever short of Wikipedia (and Wikipedia is gated on press, see below). Properties: *instance of* (catering company), *country* (NL), *HQ location* (Hilversum), *founder* (Charlotte + Gijs van Leeuwen as new items), *inception*, *official website*, *sameAs* Instagram. Reference each property to homepage / Insta. Then add the Q-number to `LocalBusiness.sameAs` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] **List on Showbird + Gigstarter** (NL entertainment-booking platforms). Fits the "eten als entertainment" positioning — different audience than wedding directories. The other NL wedding directories have already been evaluated above; not re-listing them here.
- [ ] **Gooi en Eemlander backlink follow-up** — article is published; follow up with the editor / journalist to confirm the online version has a clickable link to `hangendehapjes.nl`. Local-press editorial backlinks support the Wikipedia notability case below.
- [ ] **Pitch 1–2 more press outlets** — candidates: Bruidsmagazine, ThePerfectWedding.nl editorial (not just the listing), Het Parool food, NRC Lux. Angle: novel live-walking duo, NL-first concept, real prices, founder quote. One pitch deck reused. Goal: 1 additional press hit in the next 60 days. (Overlaps with the existing "Pitch one NL wedding/event blog" bullet — treat that as the same item, this just makes it concrete.)
- [ ] **Set up Reddit account + first 5–10 helpful comments** — operationalises the "be a real participant" bullet above with concrete subreddits and a starter cadence: r/thenetherlands, r/Amsterdam, r/Hilversum, r/Wedding. Useful first; the named account itself becomes the citation surface for Gemini.
- [ ] **Post-event review-request flow** — automated Postmark email 3 days after each event with a one-click link to leave a Google review on GBP. Goal: 5+ real reviews on the profile.
- [ ] **Populate Reviews section + add `Review` schema** — once 5+ reviews exist: replace the empty-state copy in [src/lib/i18n/nl.ts](src/lib/i18n/nl.ts) and `en.ts`, add `Review` nodes and `aggregateRating` to `LocalBusiness` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Blocked on the review-request flow producing reviews. (Subsumes the `aggregateRating` note further down under "Worth knowing, not urgent".)
- [ ] **Prioritise the "hoeveel hapjes per persoon" blog post** — already listed in the blog seeds above. It's the strongest first-party-data candidate: niche query, real numbers from your bookings (50 porties/uur, ~2–3 standaard hapjes per portie), nobody else has written it. Ship it as the *first* post when the `/blog` route lands.
- [ ] **Dutch Wikipedia draft** — later. Notability bar = significant coverage in multiple independent sources; blocked on at least 2 press hits (Gooi en Eemlander + 1 more). Draft on `nl.wikipedia.org` first; cross-link from the Wikidata item. Big lever — ChatGPT cites Wikipedia in ~48% of its top citations.

## Recurring (added 2026-04-28)

GEO is mostly cadence work. Calendar reminders or scheduled background agents.

- [ ] **Monthly: AI citation baseline check** (~15 min). Run these 5 queries against ChatGPT, Claude, Perplexity, Gemini: *"live catering Hilversum"*, *"walking dinner alternatief Nederland"*, *"live tiramisu bruiloft"*, *"Hangende Hapjes"*, *"catering bruiloft 50 gasten Nederland"*. Log per query: cited (Y/N), position in answer, sentiment. Spreadsheet is fine — no need for gego/llmopt at this volume.
- [ ] **Monthly: GBP photo upload + review responses** — 5–10 fresh event photos to Google Business Profile, respond to every new review.
- [ ] **Weekly: 1 substantive Reddit comment** under the named account. Catering / weddings / event subreddits. No drive-by self-promotion — usefulness first.
- [ ] **Every 60 days: refresh homepage** — update at least one element (price detail, stat, photo, copy tweak); `dateModified` bumps automatically via `__BUILD_DATE__` in [vite.config.ts](vite.config.ts) on each deploy. Perplexity weights freshness heavily.
- [ ] **Quarterly: first-party data blog post** — real numbers from your bookings (portions served, popular topping combos, Q-on-Q growth, average guest count). Original first-party data is the single strongest GEO signal — becomes the only citable source for niche queries.


## Content plan (added 2026-04-28)

Full ranked content calendar — target queries, intent, difficulty, per-post briefs, source SERP probes — lives in [docs/seo-content-plan.md](docs/seo-content-plan.md). Re-run `/toprank:keyword-research` quarterly to refresh.

The three concrete next-up posts pulled from there:

- [ ] **Post — "Hoeveel hapjes per persoon op een receptie of bruiloft?"** (S1 in the plan). First-party-data anchor for the "Catering planning facts" cluster. Already echoed above as the priority blog post; this is the same item.
- [ ] **Post — "Tiramisu op je bruiloft"** (S2 in the plan). User-priority target. SERP for "tiramisu bruiloft" is owned by recipe sites and Tiktok — *zero* NL caterer is positioned on the phrase. Land-grab opportunity. Optionally merge with the existing "Tiramisu live serveren" blog seed into one master post (broader phrase wins more intent). Slug: `/blog/tiramisu-bruiloft`. Schema: `Article` + nested `Service` ref to De Toetjes Vrouw.
- [ ] **Post — "Burrata op je bruiloft"** (S3 in the plan). Sister to the tiramisu post — same own-the-term play for De Borrel Baas. **Confirmed AI Overview win**: searching "burrata bruiloft" already triggers a Google AI Overview describing the burrata-bar concept, citing OhMyFoodness + 3 recipe sites — *zero* caterer cited. Once our service-side page exists we should land in that citation set fast. Slug: `/blog/burrata-bruiloft` (broader than the original `/burrata-bar-bruiloft` slug to capture both queries). Ship in tandem with the tiramisu post for symmetry.

After these three, the next batch (S4 live cooking, S5 wat kost catering, S6 /catering/hilversum) is in the calendar in the plan doc. Don't add them as tasks until the first batch ships.

## Product roadmap

- [ ] **Wedding cake / bruidstaart options** — extend De Toetjes Vrouw with a bruidstaart aanbod. Charlotte's baking background already supports this. Decide: separate product or sub-offer of De Toetjes Vrouw? Pricing tiers, sizes, flavours. Once decided, add a `Service` node to JSON-LD, a section on the homepage, copy in `nl.ts` / `en.ts`, photos. Likely also opens up content angles (`/blog/bruidstaart-of-tiramisu`, `bruidstaart` keyword cluster) — log those in [docs/seo-content-plan.md](docs/seo-content-plan.md) when scoping.

- [ ] **Calibrate mix surcharge in the admin calculator** — current model in [src/lib/admin/pricing.ts](src/lib/admin/pricing.ts) uses tiramisu's prep curve (the higher of the two) at the smaller-batch portion count, so 55/50 and 50/55 splits price symmetrically. Side effect: a 50/50 mix of 100 lands at €7.69/portion vs €6.50 for pure tira-100 (~+18%), which is on the high side for catering mix premiums (typical 10–15%). Three knobs to evaluate once real-world quotes come in: (1) drop default `mixPrepFactor` from 1.0 to 0.75, (2) switch to the average of tira+burr prep curves instead of using the max, (3) leave as-is and rely on the per-quote override in the calculator's advanced section. Revisit after the first ~5 real mixed-quote requests so we have actual data to calibrate against. Same review should sanity-check the extra-person tier formula (`setup + ceil(N/50) × per_50`) and the travel-cost defaults (€100 free retour, €0,45/km).


## Worth knowing, not urgent

- [ ] **Embed live social proof on the homepage**: latest Instagram post (or a small grid) and a Google Reviews block once GBP has a few reviews. Instagram has no clean official embed for SvelteKit — either oEmbed iframe per post (simple, ~okay perf) or fetch via Instagram Basic Display API and render natively (more work, better LCP). Google reviews: use the Places API `place_details` → render server-side; avoid third-party widgets that ship a tracker. Wire `aggregateRating` into the `Service` JSON-LD at the same time.
- [ ] JSON-LD `LocalBusiness` is missing `telephone`, `streetAddress`, and `postalCode` (all flagged as non-critical by Rich Results Test). Add as a bundle if/when you want a richer Google Knowledge Panel — adding only `telephone` won't unlock it on its own. Fine to keep just city while the business is new, and don't put a home address in there if you'd rather not. Edit in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] Sitemap omits `<lastmod>` — fine for two URLs, would matter at scale.
- [x] No `Service` schema for the two products. Worth adding when you have reviews/quotes to attach. — added entry-tier `Service` nodes (with `Offer` + `UnitPriceSpecification` per 50-portion reference quantity) into a `@graph` alongside `LocalBusiness` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Add `aggregateRating` later once reviews exist.

## Indexing reality check

Even with everything submitted, expect **5–14 days** before the site shows up for "hangende hapjes" branded searches on Google, and **weeks-to-months** for competitive terms like "live tiramisu Hilversum." Word-of-mouth + Instagram is going to be your main funnel for a while regardless — the site's job is to be a credible landing page for inbound prospects, which it is.
