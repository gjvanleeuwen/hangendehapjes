# SEO Report: hangendehapjes.nl

**Completed on 23 September:** Search Console access is now working. Use the [updated performance report](seo-analysis-2026-09-23.md) for current traffic, indexing and priorities. This document preserves the earlier technical findings and the access limitation as it stood on 22 September.

_22 September 2026 · Previous audit: 9 August 2026 · Live technical/content review complete; fresh GSC performance and URL Inspection unavailable._

**The site has made verifiable implementation progress. Traffic, ranking and booking growth since August remain unmeasured in this update.** The most concrete new fix is the structured data shared by the dessert pages. Continue developing the tiramisu and local-event journeys, but restore measurement before changing successful titles or expanding the location-page pattern.

Scope: five production pages, robots.txt, sitemap, three redirects, and HEAD checks of 15 linked URLs/assets. Repository code was used to explain production findings. Existing uncommitted website changes were not treated as deployed improvements. No site code, publishing, account settings or customer communications were changed.

## Audit history

| Previously flagged                  | Status on 22 September                             | Evidence                                                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Millefoglie missing from title      | Implementation resolved; impact unknown            | Live title is `Millefoglie: de Italiaanse bruidstaart \| Hangende Hapjes`. The planned six-week CTR check still needs GSC.                                               |
| Weak Hilversum page/H1              | Implementation improved; rankings unknown          | H1 now begins `Live catering in Hilversum`; the business-event section and Stip example are live. The old H1 task is obsolete.                                           |
| Only one Google review              | Visible proof improved                             | Homepage displays two reviews at 5.0, including a tiramisu review dated 18 August. This is the site's displayed count, not an independently retrieved current GBP count. |
| Push tiramisu into top three        | Outcome unknown; internal linking partly addressed | Millefoglie and burrata pages already contain contextual tiramisu links. The earlier claim that links were only in the footer is obsolete.                               |
| HTTP/www and old burrata URL        | Still resolved                                     | All three return 301 to their intended canonical destinations.                                                                                                           |
| Dedicated product social images     | Resolved                                           | Tiramisu and burrata use their own OG images; both return 200.                                                                                                           |
| Missing LocalBusiness phone/address | Resolved                                           | Homepage JSON-LD includes telephone, street address and postcode.                                                                                                        |
| Snack-delivery intent mismatch      | Retain deliberate exclusion                        | Keep `hapjes bestellen` and DIY quantity searches outside the commercial growth priorities.                                                                              |

## Top priority actions

Ranking below is provisional, based on historic commercial relevance and current defects. **Fresh click-uplift estimates cannot be supported without current query/page data.** Historic impressions describe exposure, not forecast gains.

### 1. Restore the performance and booking comparison

**High · Effort: low for GSC access; medium for attribution**

**URLs:** `https://hangendehapjes.nl/` and `/blog/tiramisu-bruiloft`.

**Evidence:** the last available site baseline is 252 clicks / 5,690 impressions. The working API credentials list four properties, none for Hangende Hapjes. The existing `g.j.vanleeuwens@gmail.com` CLI account returns `403 ACCESS_TOKEN_SCOPE_INSUFFICIENT`. Browser fallback could not initialize. This is an access gap, not evidence of zero traffic.

**Fix:** reconnect the owning Google account with Search Console read access, verify the exact property from the returned list, then pull the windows below. Keep the unrelated working Google connection intact. Use an isolated credential/configuration when reconnecting.

For booking value, inspect existing Umami `blog_*_offerte`, `blog_*_whatsapp`, `contact_start`, `contact_submit` and `contact_callback_submit` events. They already exist in source; do not build duplicate tracking. Verify a Google-organic landing-page funnel in Umami and compare genuine submitted leads and booked revenue in the deal pipeline. The contact endpoint currently records the self-reported referral; it does not explicitly attach the originating SEO landing page to the deal. Add that attribution if the existing session reports cannot answer which page produces bookings. A WhatsApp click is not a confirmed lead.

**Success:** a reproducible 28-day comparison for search traffic, plus an organic landing-page-to-enquiry report. No current conversion claim is possible from this audit.

### 2. Separate dessert entities and correct review attribution

**High · Effort: low/medium · Click impact unquantified**

**URL:** `https://hangendehapjes.nl/blog/italiaanse-bruidstaart`.

**Evidence:** production identifies both live tiramisu and millefoglie as `https://hangendehapjes.nl/#service-toetjes`, despite different names, prices and minimum portions. Millefoglie advertises €395/25 portions while tiramisu advertises €425/50. Millefoglie's 5.0/one-review product aggregate comes from Michael's review explicitly about tiramisu. Source shows the same shared review filter and ID on `/blog/bruidstaart`; that page received a status check, not a full content audit.

**Fix:** give tiramisu, millefoglie and classic cake distinct stable service IDs; update their Article `about`/`mentions` references. Keep the tiramisu testimonial as clearly labelled general business proof on other dessert pages, without representing it as a cake-specific rating. Remove Google-sourced aggregate ratings from product rich-result markup and review the homepage aggregate's purpose. Preserve the visible authentic reviews.

Google requires reviews to describe the specific item, disallows aggregating ratings from other websites, and does not award self-serving LocalBusiness review stars. This is a correctness/eligibility issue; **no penalty or lost rankings were observed**. [Google review guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).

**Success:** distinct entities, accurately scoped testimonials, and validation of the resulting JSON-LD followed by URL Inspection when access returns.

### 3. Strengthen the proven tiramisu journey with real event proof

**High · Effort: medium · Historic exposure: 1,066 impressions / 166 clicks in the August baseline**

**URL:** `https://hangendehapjes.nl/blog/tiramisu-bruiloft`.

**Evidence:** August's 15.57% CTR at average position 4.7 was strong. Production already has pricing, a cake-versus-portions explanation, a testimonial and contextual incoming links. The current working tree also contains new tiramisu photography/layout work, so coordinate the next improvement with that work.

**Fix:** add one real wedding example with permission-cleared photos, guest count, serving format and timing. Make the choice between a whole cake and walking portions easy before the enquiry CTA. Where context fits, make one existing cake-comparison link read `tiramisu bruidstaart`; avoid repetitive exact-match links. Keep the existing URL. Do not add a competitor-branded `tiramisu bar` section or imply that you supply a prebuilt glass tower, which the live FAQ explicitly says you do not.

**Persona:** Het Bruidspaar; use its recorded language `tiramisu bruidstaart`, `ter plekke`, `vers afgemaakt` and `bruiloft` where accurate.

**Success:** qualified enquiries from this landing page, supported by query-level clicks/CTR. Retire the old “+23 clicks/month from top three” forecast: a generic 11% position-three CTR is below the page's already observed 15.57%, so that calculation cannot justify an uplift.

### 4. Build local evidence before multiplying city pages

**Medium · Effort: medium · Historic exposure: 526 Hilversum-page impressions; current exposure unknown**

**URL:** `https://hangendehapjes.nl/catering/hilversum`.

**Evidence:** the H1 and business-event section are already fixed. Stip remains the named event example in the audited page. Its body says travel is “meestal” free in Hilversum/Het Gooi while its FAQ says travel is included. Power/water requirements also differ between this page, the homepage and the burrata FAQ.

**Fix:** add one genuine local case with event type, guest count, photos and the client's words. Make travel and venue requirements consistent with the actual offer. Establish a neutral review request after completed events; use five authentic reviews as an operational milestone, not a Google eligibility threshold. No requests were sent during this audit.

**Persona:** De Lokale Feestorganisator; use `catering Hilversum`, `bedrijfsfeest`, `Het Gooi` and `op locatie`. Use `geen reiskosten` only where it matches the actual quotation policy.

**Success:** reassess around 1 October using Netherlands query-plus-page data for local event intent and enquiries. Keep the location page self-canonical. Two URLs receiving impressions for a query do not by themselves prove harmful cannibalization. Continue deferring Amsterdam/Utrecht pages until the local pattern shows useful visibility or leads. Reviews help local prominence; the earlier claim that one review “blocks all local-pack queries” was too strong.

## Traffic snapshot

| Metric           | Last available baseline, 8 May–6 August | Current 28 days | Change         |
| ---------------- | --------------------------------------: | --------------- | -------------- |
| Clicks           |                                     252 | Unavailable     | Not measurable |
| Impressions      |                                   5,690 | Unavailable     | Not measurable |
| CTR              |                                   4.43% | Unavailable     | Not measurable |
| Average position |                                    10.2 | Unavailable     | Not measurable |

The old window contains 91 inclusive calendar dates despite being labelled “90 days” by the skill. Its June-to-August growth is historical, not September progress. Branded/non-branded, device, country, query declines and index coverage could not be refreshed.

Use these explicit inclusive windows when access returns:

- Current 28 days: **23 August–19 September**; preceding 28: **26 July–22 August**. Verify final-data availability and shift both together if necessary.
- Comparable long window: **21 June–19 September**, 91 inclusive dates to match the saved baseline. These windows overlap; do not present their difference as a clean month-on-month result.
- Millefoglie title assessment: **9 July–5 August** versus **23 August–19 September**, excluding the rollout interval. This is observational, not a controlled experiment: segment identical queries, Netherlands and device, and compare impressions/position alongside CTR.
- GSC property totals should come from unfiltered totals. Query-level branded segments omit anonymized queries and need not sum to those totals.

## Supporting findings

### Crawl and metadata

All five fully audited pages returned 200, one self-canonical and one H1; none has a noindex directive or X-Robots-Tag blocking indexing. They appear in the ten-URL sitemap and are linked from the homepage. All 15 HEAD-checked internal targets, language alternates and OG assets returned 200. This verifies accessibility, **not Google's indexed status**. English alternates were status-checked; reciprocal English HTML was outside this five-page audit.

| Page                           | Actual title                                                         | Characters | Description characters | OG complete |
| ------------------------------ | -------------------------------------------------------------------- | ---------: | ---------------------: | ----------- |
| `/`                            | Hangende Hapjes \| Live catering voor jouw bruiloft of evenement     |         63 |                    155 | Yes         |
| `/blog/tiramisu-bruiloft`      | Tiramisu op je bruiloft: vers hapje of hele taart \| Hangende Hapjes |         67 |                    177 | Yes         |
| `/blog/italiaanse-bruidstaart` | Millefoglie: de Italiaanse bruidstaart \| Hangende Hapjes            |         56 |                    161 | Yes         |
| `/catering/hilversum`          | Live Catering Hilversum \| Entertainend eten \| Hangende Hapjes      |         61 |                    147 | Yes         |
| `/blog/burrata-catering`       | Burrata bar huren voor feest, borrel of bruiloft \| Hangende Hapjes  |         66 |                    170 | Yes         |

Character counts are editorial heuristics, not fixed Google limits. No duplicate or missing titles/descriptions were found. Keep the millefoglie title while measuring it. If query data later supports a tiramisu snippet test, a concise candidate is `Tiramisu bruidstaart of live hapjes | Hangende Hapjes`; do not deploy merely because the present title is longer.

### Additional structured-data fixes

- **Dates:** burrata uses `BUILD_DATE` as `datePublished`; all five blog sources use it as `dateModified`, and all ten sitemap URLs share the build-derived lastmod. Preserve actual first-publication dates and per-page substantial-update dates. The live 19 August dates are not proof the site has been abandoned. [Google date guidance](https://developers.google.com/search/docs/appearance/structured-data/article), [sitemap lastmod guidance](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping).
- **Authors:** the three audited articles reference author IDs defined only on the homepage. Include Person `name`, `@type` and `url` alongside the stable IDs on the articles. This improves completeness; it is not evidence of a current indexing failure. [Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article).
- **Breadcrumbs:** present on Hilversum, absent on the three audited blog pages. Useful secondary work after entity/rating corrections, without a promised click gain.

### Performance

PageSpeed was attempted for all five pages on mobile and desktop. All ten requests failed with HTTP 429 / daily quota 0; no new Lighthouse scores or CrUX metrics were returned. Their absence does not establish that the site has no CrUX coverage. Supply a working PageSpeed API key/project quota or run a local Lighthouse audit.

The fetched homepage contains 489 elements and about 99 KB HTML. All 19 images across the sample have alt text and explicit dimensions; the first-party image blocks use responsive picture sources. These are healthy implementation signals, not substitutes for mobile LCP/INP/CLS measurements. No performance penalty is inferred.

### Content roadmap

Prioritize existing commercial pages before the April publishing calendar. Expand cake-price and guest-count answers on `/blog/bruidstaart` before creating a competing price article; decide the separate-page need from fresh queries. Recipes and generic quantity advice remain supporting content. New searches also surface service competitors such as [Bakverhalen's tiramisu tower](https://www.bakverhalen.nl/tiramisu-toren-voor-dessert) and [Deliscu's live millefoglie](https://deliscu.nl/), so the old “zero caterer competition” premise should not guide investment. These are competitor examples, not a Dutch location-controlled ranking report or evidence of a ranking loss.

## What to ignore for now

- Bulk city-page rollout, delivery keywords and improving DIY-page CTR without evidence of booking value.
- Extra FAQ/HowTo markup as a rich-result growth tactic. FAQ rich results are restricted and HowTo rich results are deprecated. [Google guidance](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
- Rewriting already relevant titles or adding words merely to reach an arbitrary length. Measure query intent and qualified enquiries first.

## Next 30 days

1. **22–28 September:** restore GSC access, capture the explicit comparison windows, correct service/review entities and content-date handling; verify the existing organic enquiry funnel.
2. **29 September–5 October:** review Hilversum performance at the planned checkpoint; publish one real local case and standardize travel/logistics copy. Keep the self-canonical unless new evidence warrants another decision.
3. **6–12 October:** complete the tiramisu photography/case improvement alongside current work; refine one or two contextual links and review cake pricing coverage.
4. **13–22 October:** review early query and enquiry signals, validate recrawling and run mobile performance checks. Allow a full comparable post-change window before declaring a winner; low counts may require longer.

Evidence: [machine-readable audit snapshot](seo/2026-09-22/evidence.json). Historical baseline: `~/.toprank/audit-log/hangendehapjes.nl.json`, 9 August entry. Business context and the three existing personas were reused; no new speculative audience profile was introduced.
