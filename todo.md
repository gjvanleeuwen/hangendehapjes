# Post-launch checklist

The SEO infra (canonical, hreflang, OG, Twitter card, JSON-LD `LocalBusiness`, sitemap, robots.txt) is already wired in code. Most of what follows is *external* setup.

## Today

### DNS / hosting sanity

- [x] Pick one canonical domain (`https://hangendehapjes.nl` is hardcoded in [src/lib/site-config.ts](src/lib/site-config.ts)) and 301-redirect `www.` to apex via Dokploy/Traefik (done as 308; `http://www` is a two-hop redirect — left as-is, negligible impact)
- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park
- [ ] **Lighthouse audit** — Chrome DevTools → Lighthouse → mobile + perf/SEO/accessibility. Hero image is large (`hero.jpeg`); if LCP is slow, generate a smaller variant.

## Search Console follow-ups

GSC + Bing were submitted on 2026-04-26. Two natural check-ins:

### Around 2026-04-30 (3–5 days post-submit)

- [ ] **GSC → Sitemaps**: status should be "Success" with ≥ 2 URLs discovered. If "Couldn't fetch" or stuck Pending, debug (sitemap URL typo, robots.txt blocking).
- [ ] **GSC → URL Inspection**: run on `https://hangendehapjes.nl/` and `https://hangendehapjes.nl/en`. If either says "URL is not on Google", click **Request Indexing** to nudge it forward.
- [ ] Glance at GSC **Manual actions** and **Security issues** — both should be empty.
- [ ] **Bing Webmaster Tools → Sitemaps**: status should be "Processed".
- [ ] **Bing → URL Submission**: manually submit `/` and `/en` (10/day quota; Bing weights this signal more than Google does).

### Around 2026-05-09 (10–14 days post-submit)

- [ ] **GSC → Pages**: both `/` and `/en` should be in "Indexed". If they're sitting in "Discovered – not indexed" or "Crawled – not indexed" past ~3 weeks, dig in.
- [ ] Search "hangende hapjes" in incognito on Google. Should be ranking #1 for the branded query by now. If not, that's the first concrete signal something's off.
- [ ] **GSC → Performance**: impressions/clicks will be tiny — that's fine, brand-new site. Just confirm there's *some* data, meaning the site has actually been served in results.

## AI / LLM visibility

Goal: get cited by ChatGPT, Perplexity, Gemini, Claude when people ask "live catering Hilversum / Gooi" or "originele caterings bruiloft NL". They recommend what they've *read about elsewhere* — so this is mostly off-site work.

- [x] List on **theperfectwedding.nl** (highest-authority NL wedding directory, often cited by LLMs). Free, ~15 min.
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


## Worth knowing, not urgent

- [ ] **Embed live social proof on the homepage**: latest Instagram post (or a small grid) and a Google Reviews block once GBP has a few reviews. Instagram has no clean official embed for SvelteKit — either oEmbed iframe per post (simple, ~okay perf) or fetch via Instagram Basic Display API and render natively (more work, better LCP). Google reviews: use the Places API `place_details` → render server-side; avoid third-party widgets that ship a tracker. Wire `aggregateRating` into the `Service` JSON-LD at the same time.
- [ ] JSON-LD `LocalBusiness` is missing `telephone`, `streetAddress`, and `postalCode` (all flagged as non-critical by Rich Results Test). Add as a bundle if/when you want a richer Google Knowledge Panel — adding only `telephone` won't unlock it on its own. Fine to keep just city while the business is new, and don't put a home address in there if you'd rather not. Edit in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] Sitemap omits `<lastmod>` — fine for two URLs, would matter at scale.
- [x] No `Service` schema for the two products. Worth adding when you have reviews/quotes to attach. — added entry-tier `Service` nodes (with `Offer` + `UnitPriceSpecification` per 50-portion reference quantity) into a `@graph` alongside `LocalBusiness` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Add `aggregateRating` later once reviews exist.

## Indexing reality check

Even with everything submitted, expect **5–14 days** before the site shows up for "hangende hapjes" branded searches on Google, and **weeks-to-months** for competitive terms like "live tiramisu Hilversum." Word-of-mouth + Instagram is going to be your main funnel for a while regardless — the site's job is to be a credible landing page for inbound prospects, which it is.
