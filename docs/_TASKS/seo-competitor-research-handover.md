# Handover: competitor & keyword research with DataForSEO

**Written**: 2026-10-16, from the BandWeb research run (same owner, same DataForSEO account)
**For**: an agent working in this repo
**Goal**: add what Search Console can't show (search volumes, who ranks on google.nl, how strong they are, what their pages cover, where they get links) and turn it into concrete updates of the existing SEO docs.

---

## 1. Read first (don't redo this work)

This repo already has solid, GSC-driven SEO work. The new research **complements** it:

| Doc | What it already settles |
|---|---|
| `docs/_ANALYSIS/seo-analysis-2026-09-23.md` | Latest audit: GSC trends, indexation, priorities. Tiramisu is the commercial core (17/21 enquiries). City-page expansion deferred. |
| `docs/_ANALYSIS/enquiry-analysis-2026-09-23.md` | Which products/journeys actually convert |
| `docs/_TASKS/seo-keyword-targets.md` | Keyword tiers + **the intent filter** (live event catering vs supermarket/delivery/DIY intent; `hapjes bestellen hilversum` pos 4.4, 0 clicks = intent mismatch) |
| `docs/_TASKS/seo-content-plan.md` | Clusters, 6-month calendar, Tier S briefs |
| `scripts/pull-gsc.ts` → `data/gsc/*.json` | Our own query/page data (positions, impressions). **Join this into the research**; BandWeb didn't have it. |
| `CLAUDE.md` | Voice rules for any copy you draft (no em dashes, always jij/je, walking-between-guests framing, Charlotte = zoet / Gijs = hartig) |

Business facts that drive every filter: live walking catering (a tray slung from the neck, a portion made per guest), **minimum 50 portions, from €425 per 50 people**, based in **Hilversum**, weddings/receptions/corporate events/parties, **no delivery**, bookings are bespoke via email. Products: De Toetjes Vrouw (tiramisu, bruidstaart incl. Italian/millefoglie), De Borrel Baas (burrata bowls, hartige hapjes).

## 2. Questions to answer

1. **Volumes**: real monthly search volume for the existing keyword tiers (GSC only shows our impressions) and for terms we don't rank for yet.
2. **Competition per query**: who holds the google.nl top 10 for the core terms (tiramisu bruidstaart, tiramisu bruiloft, italiaanse bruidstaart, millefoglie bruidstaart, catering bruiloft, hapjes bruiloft/receptie, live cooking/walking dinner, catering hilversum / het gooi, bedrijfsfeest hilversum), how strong they are, and **which positions are realistically reachable** (now vs with more authority).
3. **Content gaps**: what the ranking pages cover that our pages don't (People also ask questions, subtopics, depth, prices), per existing page.
4. **Local**: who shows in the **local pack / Maps** for "catering hilversum", "catering het gooi", "bedrijfsfeest hilversum" and nearby towns; what their Google Business Profiles look like (reviews, categories).
5. **Links**: where comparable caterers and wedding vendors get links (wedding vendor directories, venues, planners, local media) → a short, realistic list.
6. **Decisions to revisit with data**: is a second city page (het Gooi / Utrecht / Amsterdam) worth it yet? Is millefoglie demand wedding demand? Which Tier A/B posts have volume?

## 3. Tooling: reuse the BandWeb pipeline

A working pipeline exists at `/Users/GijsvanLeeuwen/Documents/personal_projs/bandweb/scripts/seo_research/` (Python, standalone `uv` scripts, README inside). Read its `README.md`, `client.py`, `phases.py`, `analyze.py`. Context on how it was used: `bandweb/agent/tasks/93_seo_keyword_competitor_research.md` (incl. "Trial run" and "Deviations" sections) and `bandweb/agent/context/40-49_GROWTH/41_SEO_KEYWORD_ANALYSIS_2026-10.md`.

**Copy it into this repo** as `scripts/seo-research/` (Python next to the bun scripts is fine; keep it uv-standalone with inline deps). Don't import from the bandweb repo. Also copy `bandweb/scripts/prospect_crawler/fetch.py` (the polite fetcher: robots.txt wildcards, per-host delay, disk cache) and fix the import in `phases.py`.

| Module | Reuse | Change for Hangende Hapjes |
|---|---|---|
| `client.py` | as is | nothing (cache, cost log, budget cap, sandbox, SERP standard queue) |
| `page_parse.py` | as is | nothing (`parse`, `faq_pairs`, fuzzy matching, topic clusters) |
| `report.py` + `report_template.html` | mostly | retitle; drop the "Act sites" tab; add a GSC column to Overtake |
| `config.py` | rewrite | `OUR_DOMAIN = "hangendehapjes.nl"`, `SITE_URL`; new vocabulary (below); `PAGE_TARGETS` per existing page; lower limits (small niche) |
| `vocab.py` | adapt | kinds: `service` (catering/booking intent), `answer` (questions, prices, "hoeveel per persoon"), `diy` (recipe/supermarket/delivery: always skip), `brand` (competitor names) |
| `our_site.py` | rewrite | no facets/discover API: read pages from `https://hangendehapjes.nl/sitemap.xml` (NL only; skip `/en` unless researching EN), map target keywords → page by hand in config, drop `BandCounts` |
| `phases.py` | mostly | keywords/serp/competitors/content/backlinks are generic; replace the facet-based `score` buckets with: **protect** (we already rank top 3 per GSC) · **improve page** · **new post** · **new service/location page** · **skip** |
| `analyze.py` | adapt | replace `_EQUIPMENT` with a DIY/recipe/delivery filter; extend the known-words list with catering vocabulary; **join GSC** (`data/gsc/*.json`: our position + impressions per query) |
| `act_links.py`, `scrape_evenses.py` | don't copy | BandWeb-specific. Optional replacement: a "vendor directories" step (which wedding directories link to the ranking caterers) |

### Vocabulary starting point (refine against `seo-keyword-targets.md`)

- **Products**: tiramisu, tiramisu taart, tiramisu bruidstaart, bruidstaart, italiaanse bruidstaart, millefoglie, millefoglie bruidstaart, dessert, dessertbuffet, toetjes, burrata, burrata bar, hapjes, hartige hapjes, italiaanse hapjes, borrelhapjes, fingerfood, live cooking, walking dinner, food entertainment, catering
- **Occasions**: bruiloft, trouwen, huwelijk, receptie, bedrijfsfeest, personeelsfeest, borrel, kerstborrel, verjaardag, jubileum, feest, event
- **Places**: Hilversum, het Gooi, Bussum, Laren, Blaricum, Huizen, Naarden, Baarn, Soest, Amersfoort, Utrecht, Amsterdam, Weesp, Loosdrecht, Maarssen
- **Modifiers**: catering, bestellen, huren, op locatie, live, kosten, prijs, per persoon, 50 personen, 100 personen
- **Hard negatives** (the intent filter): recept, zelf maken, maken, supermarkt, ah, albert heijn, jumbo, lidl, hema, thuisbezorgd, bezorgen, afhalen, kcal, calorie, gezond, airfryer, "hoeveel hapjes per persoon" stays (answer) but its SERP will be DIY-heavy, so judge it on intent, not volume

### Seeds

product × occasion (`tiramisu bruiloft`, `hapjes receptie`, `catering bedrijfsfeest`), product × modifier (`bruidstaart prijs`, `tiramisu taart bestellen`), catering × place (`catering hilversum`, `catering het gooi`, `bedrijfsfeest hilversum`), the question set (`wat kost een bruidstaart`, `hoeveel hapjes per persoon`, `wat kost catering per persoon`, `live cooking bruiloft`), and every query in GSC with ≥20 impressions (pull fresh first: `bun run gsc:pull`).

### Local pack / Maps

The organic SERP result already includes `local_pack` items. For the local questions also run a few **Google Maps SERPs** (`/v3/serp/google/maps/task_post`, same pricing order as organic; check `appendix/user_data` prices) for "catering hilversum", "catering het gooi", "bedrijfsfeest catering hilversum", "bruidstaart hilversum": these return business names, ratings, review counts and categories of the GBP competitors.

## 4. DataForSEO: account, budget, gotchas

- Credentials are already in this repo's `.env` (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`). Same account as BandWeb (balance ~$46 on 2026-10-16). **Never print or commit them.**
- Budget: this niche is small. Expect **$1–5** for the full run; set `--max-spend 5`. Run `--dry-run` and `--sandbox` first, then a real `--sample`.
- Market: `location_code` 2528 (NL), `language_code` `nl`.
- Learned the hard way on BandWeb:
  - SERP: use the **standard queue** (`task_post` + `task_get/advanced`), $0.0006/keyword, includes People also ask, related searches, AI overview, local pack.
  - Labs `keyword_ideas` drifts off-intent ("band bruiloft" → wedding dresses): use `keyword_suggestions` + `related_keywords` + a relevance filter.
  - Labs **keyword difficulty is ~0 for Dutch terms**: ignore it; judge winnability from the SERP (domain ranks via `backlinks/bulk_ranks`, ~$0.05 for 600 domains).
  - `dataforseo_labs/google/bulk_search_volume` doesn't exist (40402): use `google/keyword_overview/live` (≤700 keywords).
  - Google reports one shared volume for close variants ("tiramisu bruiloft" / "tiramisu op bruiloft" / "bruiloft tiramisu"): **merge variants, take the max, never sum** (the first BandWeb scoring summed them and inflated clusters 3–8×).
  - Labs monthly series have half-filled first/last months: trim before plotting seasonality.
  - HTTP 402 / task code 40200 = funds not spendable (on BandWeb a fresh top-up took a while to clear); 40203 = daily limit.
  - Named-entity noise (celebrities, specific businesses) and off-topic SERPs need filtering before scoring.

## 5. Deliverables

1. `scripts/seo-research/` (copied + adapted pipeline, with a short README).
2. `reports/seo-research-<date>.html` (the self-contained report) + raw output in a gitignored folder.
3. `docs/_ANALYSIS/seo-competitor-research-<date>.md`: findings, with the same discipline as the existing analyses (state sample sizes and caveats; volumes are Google Ads buckets; one SERP snapshot; correlation isn't causation).
4. **Updates to the existing plan docs**, not a parallel plan: add volume + reachable position + top-3 columns to `seo-keyword-targets.md` tiers; adjust `seo-content-plan.md` priorities/briefs where the data disagrees (say so explicitly, with the evidence); add a short local/GBP section and a backlink shortlist (5–10 realistic targets).
5. A one-screen summary for Gijs: the 3–5 biggest/easiest wins, what's reachable, and what to stop doing.

## 6. Rules

- **Ask before**: spending more than $5, committing, or contacting/submitting anything to third-party sites.
- **No bulk or automated link submission.** Startpagina-style link pages are mostly paid link networks (backlinks.nl marketplace, reCAPTCHA, no API); paid followed links are a Google link scheme. Business profiles (GBP, Bing Places, wedding vendor directories with real traffic) and partner/venue links are the realistic options.
- **Never copy competitor text**; use their pages for gap analysis only. Crawl politely (robots.txt, 1 req/s per host, cache).
- Drafted copy follows `CLAUDE.md` voice rules (no em dashes, jij/je, walking-around framing).
- Keep the existing intent filter: an impression from a supermarket/delivery/DIY searcher is not demand for a €425 live act.

## 7. Suggested order

1. Read §1 docs; `bun run gsc:pull` for fresh GSC data.
2. Copy + adapt the pipeline (§3); `--sandbox` end to end.
3. `--dry-run`, then `--sample` (cents), check the keyword list for intent noise, tune the filter.
4. Full run (`--max-spend 5`) + Maps SERPs for the local queries.
5. `analyze` with GSC joined; review the Overtake table by hand.
6. Write the analysis doc and update the plan docs; summary for Gijs.
