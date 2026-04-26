# Post-launch checklist

The SEO infra (canonical, hreflang, OG, Twitter card, JSON-LD `LocalBusiness`, sitemap, robots.txt) is already wired in code. Most of what follows is *external* setup.

## Today

### Sanity checks in a real browser

- [ ] `https://hangendehapjes.nl` loads over HTTPS, renders, no console errors
- [ ] `/en` works
- [ ] Submit the contact form once with a real address — verify the admin email and the confirmation email both land
- [ ] View source on `/` — confirm `<title>`, canonical, hreflang, OG tags, JSON-LD all present
- [ ] `https://hangendehapjes.nl/sitemap.xml` returns the XML
- [ ] `https://hangendehapjes.nl/robots.txt` returns and references the sitemap

### Submit to search engines

- [ ] **Google Search Console** (search.google.com/search-console): add property → verify via DNS TXT → submit `sitemap.xml`. Single most impactful step.
- [ ] **Bing Webmaster Tools** (bing.com/webmasters): import from GSC, ~2 min.

### Validate structured / social data

- [ ] Google Rich Results Test — paste the URL, confirm `LocalBusiness` JSON-LD parses without warnings
- [ ] Facebook Sharing Debugger (developers.facebook.com/tools/debug) — paste URL, click "Scrape Again" so FB caches the OG card before anyone shares it
- [ ] LinkedIn Post Inspector (linkedin.com/post-inspector) — same idea

### Update inbound links

- [ ] Instagram bio: link to `https://hangendehapjes.nl`
- [ ] Any wedding-planner directories / personal sites that already mention the business

### DNS / hosting sanity

- [ ] Pick one canonical domain (`https://hangendehapjes.nl` is hardcoded in [src/lib/site-config.ts](src/lib/site-config.ts)) and 301-redirect `www.` to apex via Dokploy/Traefik
- [ ] Decide what to do with the alt domains in [site-config.ts](src/lib/site-config.ts) (`detoetjesvrouw.nl`, `deborrelbaas.nl`): 301 to the main site, or park

## Within a week or two

- [ ] **Google Business Profile** for "Hangende Hapjes" in Hilversum — biggest lever for local discovery ("catering Hilversum", "burrata bar Gooi"). Free, ~15 min, ~1 week to verify by postcard/phone.
- [ ] **Plausible or simple analytics** (optional). Plausible is privacy-friendly so no cookie banner needed under GDPR. GA4 works but is heavier and triggers cookie-consent obligations.
- [ ] **Lighthouse audit** — Chrome DevTools → Lighthouse → mobile + perf/SEO/accessibility. Hero image is large (`hero.jpeg`); if LCP is slow, generate a smaller variant.

## Worth knowing, not urgent

- [ ] JSON-LD doesn't include `telephone` or full street address. Add only if you want a richer Google Knowledge Panel — fine to keep just city while the business is new (and don't put your home address in there if you'd rather not).
- [ ] Sitemap omits `<lastmod>` — fine for two URLs, would matter at scale.
- [ ] No `Service` schema for the two products. Worth adding when you have reviews/quotes to attach.

## Indexing reality check

Even with everything submitted, expect **5–14 days** before the site shows up for "hangende hapjes" branded searches on Google, and **weeks-to-months** for competitive terms like "live tiramisu Hilversum." Word-of-mouth + Instagram is going to be your main funnel for a while regardless — the site's job is to be a credible landing page for inbound prospects, which it is.
