# Post-launch checklist

The SEO infra (canonical, hreflang, OG, Twitter card, JSON-LD `LocalBusiness`, sitemap, robots.txt) is already wired in code. Most of what follows is *external* setup.

## Today

### Sanity checks in a real browser

- [ ] `https://hangendehapjes.nl` loads over HTTPS, renders, no console errors
- [ ] `/en` works
- [ ] Submit the contact form once with a real address — verify the admin email and the confirmation email both land
- [ ] View source on `/` — confirm `<title>`, canonical, hreflang, OG tags, JSON-LD all present
- [x] `https://hangendehapjes.nl/sitemap.xml` returns the XML
- [x] `https://hangendehapjes.nl/robots.txt` returns and references the sitemap

### Submit to search engines

- [x] **Google Search Console** (search.google.com/search-console): add property → verify via DNS TXT → submit `sitemap.xml`. Single most impactful step.
- [x] **Bing Webmaster Tools** (bing.com/webmasters): import from GSC, ~2 min.

### Validate structured / social data

- [x] Google Rich Results Test — paste the URL, confirm `LocalBusiness` JSON-LD parses without warnings
- [~] ~~Facebook Sharing Debugger~~ / ~~LinkedIn Post Inspector~~ — skipped, OG previews on FB/LinkedIn aren't a channel we care about

### Update inbound links

- [x] Instagram bio: link to `https://hangendehapjes.nl`
- [ ] Facebook page bio: add link to `https://hangendehapjes.nl`
- [ ] TikTok bio: add link to `https://hangendehapjes.nl`
- [ ] Any wedding-planner directories / personal sites that already mention the business

### DNS / hosting sanity

- [x] Pick one canonical domain (`https://hangendehapjes.nl` is hardcoded in [src/lib/site-config.ts](src/lib/site-config.ts)) and 301-redirect `www.` to apex via Dokploy/Traefik (done as 308; `http://www` is a two-hop redirect — left as-is, negligible impact)
- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park

## Within a week or two

- [x] **Google Business Profile** for "Hangende Hapjes" in Hilversum — biggest lever for local discovery ("catering Hilversum", "burrata bar Gooi"). Free, ~15 min, ~1 week to verify by postcard/phone.
- [x] **Plausible or simple analytics** (optional). Plausible is privacy-friendly so no cookie banner needed under GDPR. GA4 works but is heavier and triggers cookie-consent obligations. — done with Umami (self-hosted, same GDPR-friendly profile).
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

## Worth knowing, not urgent

- [ ] JSON-LD `LocalBusiness` is missing `telephone`, `streetAddress`, and `postalCode` (all flagged as non-critical by Rich Results Test). Add as a bundle if/when you want a richer Google Knowledge Panel — adding only `telephone` won't unlock it on its own. Fine to keep just city while the business is new, and don't put a home address in there if you'd rather not. Edit in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte).
- [ ] Sitemap omits `<lastmod>` — fine for two URLs, would matter at scale.
- [x] No `Service` schema for the two products. Worth adding when you have reviews/quotes to attach. — added entry-tier `Service` nodes (with `Offer` + `UnitPriceSpecification` per 50-portion reference quantity) into a `@graph` alongside `LocalBusiness` in [src/lib/components/SEO.svelte](src/lib/components/SEO.svelte). Add `aggregateRating` later once reviews exist.

## Indexing reality check

Even with everything submitted, expect **5–14 days** before the site shows up for "hangende hapjes" branded searches on Google, and **weeks-to-months** for competitive terms like "live tiramisu Hilversum." Word-of-mouth + Instagram is going to be your main funnel for a while regardless — the site's job is to be a credible landing page for inbound prospects, which it is.
