# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx>=0.27", "beautifulsoup4>=4.12"]
# ///
"""SEO keyword & competitor research on google.nl via DataForSEO, for hangendehapjes.nl.

    uv run scripts/seo-research/research.py all --sandbox          # free, fake data: test the pipeline
    uv run scripts/seo-research/research.py all --dry-run          # estimated cost, sends nothing
    uv run scripts/seo-research/research.py all --sample           # a real run with tiny limits (cents)
    uv run scripts/seo-research/research.py all --max-spend 5      # the full run (~$2-4)
    uv run scripts/seo-research/research.py report                 # rebuild the report from cached data

See README.md next to this file.
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import ads_volume  # noqa: E402
import analyze  # noqa: E402
import config  # noqa: E402
import phases  # noqa: E402
import report  # noqa: E402
from client import BudgetExceeded, DataForSEO, path_for_run  # noqa: E402

STEPS = {
    "setup": phases.setup,
    "keywords": phases.keywords,
    "serp": phases.serp,
    "competitors": phases.competitors,
    "content": phases.content,
    "backlinks": phases.backlinks,
    "local": phases.local,
    "ads_volume": ads_volume.ads_volume,
    "score": phases.score,
    "analyze": analyze.analyze,
    "report": report.write,
}
ALL = ["keywords", "serp", "local", "ads_volume", "competitors", "content", "backlinks", "score", "analyze", "report"]
FREE = {"report", "score"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("step", choices=[*STEPS, "all"])
    parser.add_argument("--run", help="run directory name under output/ (default: today, or sandbox-/sample- prefixed)")
    parser.add_argument("--sandbox", action="store_true", help="sandbox.dataforseo.com: free fake data")
    parser.add_argument("--dry-run", action="store_true", help="print the estimated cost per phase, send nothing")
    parser.add_argument("--sample", action="store_true", help="tiny limits for a cheap real end-to-end check")
    parser.add_argument("--refresh", action="store_true", help="ignore the response cache (pays again)")
    parser.add_argument("--max-spend", type=float, default=config.DEFAULT_MAX_SPEND,
                        help=f"abort before exceeding this many USD in this invocation (default {config.DEFAULT_MAX_SPEND})")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING,
                        format="%(levelname)s %(name)s: %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)

    if args.dry_run:
        estimate(args.sample)
        return
    prefix = "sandbox-" if args.sandbox else "sample-" if args.sample else ""
    run_dir = path_for_run(args.run or f"{prefix}{date.today().isoformat()}")
    steps = ALL if args.step == "all" else [args.step]
    needs_api = any(s not in FREE for s in steps)
    client = DataForSEO(max_spend=args.max_spend, sandbox=args.sandbox,
                        refresh=args.refresh) if needs_api else None
    ctx = phases.Ctx(run_dir=run_dir, client=client, sample=args.sample)
    print(f"run: {run_dir}")
    try:
        for step in steps:
            print(f"--- {step}")
            STEPS[step](ctx)
    except BudgetExceeded as exc:
        print(f"\nSTOPPED: {exc}")
        sys.exit(2)
    finally:
        if client:
            print(f"\n{client.summary()}")


def estimate(sample: bool) -> None:
    """Upper-bound cost of a fresh run (cache empty), from the published per-task/item prices."""
    c, s = config.COST, config.SAMPLE if sample else {}
    get = lambda name, default: s.get(name, default)  # noqa: E731
    n_seeds = min(len(phases.seeds()), get("seeds", 10_000))
    serp_unit = c["serp_task"] * max(1, -(-config.SERP_DEPTH // 10))
    sug, rel = get("suggestion_limit", config.SUGGESTION_LIMIT), get("related_limit", config.RELATED_LIMIT)
    n_rel = min(len(config.RELATED_SEEDS), get("related_seeds", 100))
    kws = n_seeds * sug + n_rel * rel
    serp_n = get("serp_top_n", config.SERP_TOP_N) + 60
    comp, ranked = get("competitor_domains", config.COMPETITOR_DOMAINS), get("ranked_limit", config.RANKED_LIMIT)
    n_sum = get("backlink_summary_domains", config.BACKLINK_SUMMARY_DOMAINS) + 1
    n_ref = get("backlink_referring_domains", config.BACKLINK_REFERRING_DOMAINS) + 1
    ref = get("referring_limit", config.REFERRING_LIMIT)
    rows = [
        ("keywords", n_seeds * (c["labs_task"] + sug * c["labs_item"]) + n_rel * (c["labs_task"] + rel * c["labs_item"])
         + (kws // 1000 + 1) * c["intent_task"] + kws * c["intent_item"]),
        ("serp", serp_n * serp_unit + c["labs_task"] + 60 * c["labs_item"]),
        ("local", get("maps_queries", len(config.MAPS_QUERIES)) * c["serp_task"] * 2
         + get("local_organic", len(config.LOCAL_ORGANIC)) * serp_unit),
        ("competitors", comp * (c["labs_task"] + ranked * c["labs_item"]) + c["labs_task"] + 200 * c["labs_item"]),
        ("content", 30 * serp_unit),
        ("analyze", c["backlinks_task"] + 400 * c["backlinks_row"]),
        ("backlinks", n_sum * c["backlinks_task"] + n_ref * (c["backlinks_task"] + ref * c["backlinks_row"])),
        ("score + report", 0.0),
    ]
    print(f"Estimated upper bound for a fresh {'sample' if sample else 'full'} run (items are billed only when returned):")
    for name, cost in rows:
        print(f"  {name:<15} ${cost:7.3f}")
    print(f"  {'total':<15} ${sum(r[1] for r in rows):7.3f}   (default --max-spend ${config.DEFAULT_MAX_SPEND})")


if __name__ == "__main__":
    main()
