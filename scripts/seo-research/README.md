# SEO research (DataForSEO)

Keyword, SERP, local and backlink research on google.nl for hangendehapjes.nl. Adapted from the
BandWeb pipeline (2026-10-16); standalone Python run with `uv` (dependencies inline in
`research.py`), next to the bun scripts. Reads `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` from the
environment or the repo `.env`. Joins our Search Console data from the newest `data/gsc/*.json`
(`bun run gsc:pull` first).

```bash
uv run scripts/seo-research/research.py all --dry-run          # estimated cost, sends nothing
uv run scripts/seo-research/research.py all --sandbox --sample # free fake data: pipeline check
uv run scripts/seo-research/research.py all --sample           # real data, tiny limits (~$0.25)
uv run scripts/seo-research/research.py all --max-spend 5      # full run (~$3.50)
uv run scripts/seo-research/research.py report --run 2026-10-16  # rebuild report from cache (free)
```

If uv can't write its cache in a sandbox, prefix `UV_CACHE_DIR=$TMPDIR/uv-cache`.

Output goes to `data/seo-research/<run>/` (gitignored via `/data`). Open `report.html` in a browser.
Copy it to `reports/seo-research-<date>.html` to keep it next to the funnel reports.

The first tab, **Where we rank**, shows our own position per tracked keyword (national desktop SERP +
searched from Hilversum) next to the GSC average, with the change since the previous dated run. Every
dated run appends its positions to `docs/_ANALYSIS/seo/rankings.csv` (tracked in git, so the trend
survives); sandbox/sample runs are never recorded. Rebuilding `report` for the same run replaces its rows.

## Steps

| Step          | What                                                                                                                                                         | Paid endpoints                                                                      | 2026-10-16 cost |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------- |
| `setup`       | balance + Labs NL support                                                                                                                                    | none                                                                                | free            |
| `keywords`    | seeds (product × occasion, extras, GSC queries ≥20 impressions) → suggestions + related → relevance + intent filter                                          | Labs `keyword_suggestions`, `related_keywords`, `search_intent`, `keyword_overview` | ~$1.05          |
| `serp`        | top keywords + page targets + `EXTRA_SERP_KEYWORDS` → google.nl top 20, PAA, related, AI overview, local pack                                                | SERP standard queue                                                                 | ~$0.35          |
| `local`       | Google Maps SERPs + organic SERPs searched from Hilversum coordinates                                                                                        | SERP standard queue (maps + organic)                                                | ~$0.01          |
| `ads_volume`  | Keyword Planner volumes for ~80 core terms, merged into the keyword universe (Labs misses local terms)                                                       | Keywords Data `google_ads/search_volume`                                            | ~$0.09          |
| `competitors` | ranked keywords of `PEER_DOMAINS` → gaps + URL patterns; our own ranked keywords                                                                             | Labs `ranked_keywords`                                                              | ~$0.30          |
| `content`     | our NL pages vs the top ranking pages per target keyword: depth, missing questions/subtopics                                                                 | none (polite fetch, cached)                                                         | free            |
| `backlinks`   | backlink summary + referring domains of us and the peers → shared link sources                                                                               | Backlinks `summary`, `referring_domains`                                            | ~$0.45          |
| `score`       | cluster keywords → protect / improve / new_post / new_page / skip                                                                                            | none                                                                                | free            |
| `analyze`     | merge close variants (max volume, never sum), drop DIY + recipe-dominated SERPs, domain rank of every top-10 site → reachable position now/later, GSC joined | Backlinks `bulk_ranks`                                                              | ~$0.05          |
| `report`      | `report.html` + `report.md`                                                                                                                                  | none                                                                                | free            |

Every step reads the previous steps' JSON from the run directory and can be re-run on its own.

## The intent filter

A keyword is dropped from targeting when any of these hold:

- `vocab.is_diy`: recipe, supermarket, delivery, nutrition words (`DIY_PATTERN`), or "hapjes … bestellen"
  (delivery; "bruidstaart bestellen" stays, that's a buyer).
- `phases.recipe_serp`: at least `RECIPE_SERP_MIN` of the top 10 are recipe sites (`RECIPE_DOMAINS`
  or a `/recept` URL). This catches "hartige hapjes", "italiaanse hapjes", "hapjes receptie".
- `HEAD_TERMS`: bare national head terms (Tier 4 in `docs/_TASKS/seo-keyword-targets.md`).
- `INTENT_MISMATCH`: hand-reviewed SERPs whose result type isn't a walking live act
  ("walking dinner" = restaurant walking tours, "live cooking" = Van der Valk buffets).

## Money safety

- Every API result is cached in `data/seo-research/raw/` (keyed by endpoint + payload): re-runs
  cost $0. `--refresh` ignores the cache and pays again.
- `--max-spend` (default $5) stops before the call that would cross it.
- Every paid call is appended to `data/seo-research/costs.csv`.
- SERP tasks use the standard queue; pending task ids are kept, so an interrupted run resumes.

## Gotchas

- Labs keyword difficulty is ~0 for Dutch terms: winnability comes from the SERP (domain ranks).
- Labs reports 0 for some real local terms ("catering hilversum" has ~185 GSC impressions/month):
  the `ads_volume` step fixes the core list with Keyword Planner numbers.
- Close variants share one Google volume: merge, take the max, never sum.
- The content step fetches competitor sites (robots.txt, 1 req/s/host, cached in
  `data/seo-research/html/`). In a network sandbox, blocked hosts get cached as dead; delete those
  cache files (`grep -l $'^\x00dead-host' -r data/seo-research/html | xargs rm`) before re-running.
- Never copy competitor text: the content gaps are for gap analysis only.

## Tuning

Everything is in `config.py`: vocabulary (`PRODUCTS`, `OCCASIONS`, `PLACES`), the intent filter,
seeds, `PEER_DOMAINS` (hand-picked competitors for the competitor + backlink steps; the visibility
ranking alone is dominated by recipe sites), `PAGE_TARGETS` (focus pages first: the content step
fetches in that order under a page budget), `FOCUS_PRODUCTS` / `PROTECT_PRODUCTS`, limits, and the
`RANK_NOW` / `RANK_LATER` thresholds for "reachable".
