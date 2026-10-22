"""Bundle every phase's output into report.md and a self-contained report.html."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date

import client
import config
import our_site
import rankings
from phases import BUCKETS


def build(ctx) -> dict:
    load = lambda name: ctx.load(name, required=False)  # noqa: E731
    keywords = load("keywords") or []
    serp = load("serp") or {"serps": {}, "volumes": {}, "targets": {}}
    comp = load("competitors") or {}
    sandbox = ctx.client.sandbox if ctx.client else False
    costs = client.read_costs(sandbox)
    season: dict[str, int] = defaultdict(int)
    wedding: dict[str, int] = defaultdict(int)
    reporting: Counter = Counter()
    for r in keywords:
        if r.get("kind") == "diy":
            continue
        for y, m, v in r.get("monthly") or []:
            month = f"{y}-{m:02d}"
            season[month] += v
            reporting[month] += v > 0
            if r.get("occasion") == "bruiloft" and r.get("kind") != "diy":
                wedding[month] += v
    # Labs leaves the oldest and the newest month half-filled; plotting them
    # draws a fake ramp-up and a fake collapse. Keep months most keywords report.
    full = max(reporting.values(), default=0)
    months = sorted(m for m in season if reporting[m] >= 0.6 * full)
    return {
        "meta": {"run": ctx.run_dir.name, "generated": date.today().isoformat(),
                 "sandbox": sandbox, "sample": ctx.sample,
                 "spend_total": round(sum(float(c["cost_usd"]) for c in costs), 4),
                 "paid_calls": len(costs), "market": f"google.nl · {config.LANGUAGE_CODE}",
                 "our_domain": config.OUR_DOMAIN, "gsc_window": our_site.gsc_window()},
        "buckets": BUCKETS,
        "opportunities": load("opportunities") or [],
        "analysis": load("analysis") or {"queries": [], "ours_rank": None},
        "local": load("local") or {"maps": {}, "organic": {}},
        "rankings": rankings.build(ctx.run_dir.name, serp, load("local") or {}),
        "keywords": [{k: v for k, v in r.items() if k != "monthly"} for r in keywords[:5000]],
        "season": [(m, season[m]) for m in months], "season_wedding": [(m, wedding[m]) for m in months],
        "serps": [{"keyword": kw, "volume": serp["volumes"].get(kw, 0), **s} for kw, s in serp["serps"].items()],
        "ranking_domains": (load("ranking_domains") or [])[:60],
        "competitors": {"domains": comp.get("domains", []), "patterns": comp.get("patterns", {}),
                        "gaps": comp.get("gaps", [])[:1000], "ours": comp.get("ours", [])},
        "content": load("content") or {},
        "backlinks": load("backlinks") or {"summary": {}, "targets": [], "ours": []},
        "costs": costs[-400:],
    }


def write(ctx) -> None:
    data = build(ctx)
    template = (config.ROOT / "report_template.html").read_text()
    payload = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")
    (ctx.run_dir / "report.html").write_text(template.replace("/*__DATA__*/null", payload))
    (ctx.run_dir / "report.md").write_text(markdown(data))
    print(f"report: {ctx.run_dir / 'report.html'}")


def markdown(d: dict) -> str:
    m = d["meta"]
    opp = d["opportunities"]
    lines = [f"# Hangende Hapjes SEO research ({m['run']})", "",
             f"{m['market']} · generated {m['generated']} · spend ${m['spend_total']} over {m['paid_calls']} paid calls"
             + (" · **SANDBOX DATA (fake)**" if m["sandbox"] else "") + (" · sample run" if m["sample"] else ""), ""]
    lines += rankings_md(d["rankings"])
    counts = Counter(o["bucket"] for o in opp)
    volume = Counter()
    for o in opp:
        volume[o["bucket"]] += o["volume"]
    lines += ["## Buckets", "", "| bucket | clusters | monthly searches |", "|---|---|---|"]
    lines += [f"| {label} | {counts.get(key, 0)} | {volume.get(key, 0):,} |" for key, label in d["buckets"]]
    for key, label in d["buckets"][:4]:
        top = [o for o in opp if o["bucket"] == key][:20]
        if not top:
            continue
        lines += ["", f"## {label}", "", "| score | top keyword | volume | win | GSC pos | top 3 | why |", "|---|---|---|---|---|---|---|"]
        lines += [f"| {o['score']} | {o['top_keyword']} | {o['volume']:,} | {o['winnability']} | "
                  f"{o['gsc_pos'] or '–'} | {', '.join(o['top3'])} | {o['reason']} |" for o in top]
    lines += ["", "## Ranking domains (volume-weighted visibility)", "", "| domain | visibility | keywords | top 3 | best |", "|---|---|---|---|---|"]
    lines += [f"| {r['domain']} | {r['visibility']} | {r['keywords']} | {r['top3']} | {r['best']} |" for r in d["ranking_domains"][:25]]
    lines += ["", "## Content pages", ""]
    for key, g in d["content"].items():
        lines.append(f"- **/{key}**: {g['ours']['words']} words vs {g['competitors']['words']} median, "
                     f"{len(g['missing_questions'])} missing questions, {len(g['missing_topics'])} missing subtopics "
                     f"(content_gaps/{(key or 'home').replace('/', '_')}.md)")
    q = d["analysis"]["queries"]
    if q:
        lines += ["", f"## Overtake (our rank {d['analysis'].get('ours_rank')}; GSC {m['gsc_window']})", "",
                  "| query | vol | SERP | GSC pos | GSC impr | now | later | top 3 | mismatch |", "|---|---|---|---|---|---|---|---|---|"]
        fmt_pos = lambda p: "page 2+" if p > 10 else f"#{p}"  # noqa: E731
        for r in sorted(q, key=lambda r: -r["volume"])[:60]:
            lines.append(f"| {r['query']} | {r['volume']} | {r['ours'] or '–'} | {r['gsc_pos'] or '–'} | {r['gsc_impr'] or '–'} | "
                         f"{fmt_pos(r['reach_now'])} | {fmt_pos(r['reach_later'])} | "
                         f"{', '.join(e['domain'] for e in r['top10'][:3])} | {r.get('mismatch') or ''} |")
    maps = d["local"].get("maps") or {}
    if maps:
        lines += ["", "## Local: Google Maps from Hilversum", "", "| query | our position | top 3 (rating, reviews) |", "|---|---|---|"]
        for kw, its in maps.items():
            ours = next((f"#{i['pos']} ({i['rating']}★, {i['reviews']})" for i in its if i["ours"]), "not in top 20")
            top = "; ".join(f"{i['title']} ({i['rating']}★, {i['reviews']})" for i in its[:3])
            lines.append(f"| {kw} | {ours} | {top} |")
    targets = d["backlinks"]["targets"][:25]
    if targets:
        lines += ["", "## Link targets", "", "| domain | type | rank | links to |", "|---|---|---|---|"]
        lines += [f"| {t['domain']} | {t['type']} | {t['rank']} | {', '.join(t['links_to'])} |" for t in targets]
    return "\n".join(lines) + "\n"


def rankings_md(rk: dict) -> list[str]:
    rows = rk["rows"]
    if not rows:
        return []
    fmt_pos = lambda p: f"#{p}" if p else "–"  # noqa: E731

    def change(r: dict) -> str:
        c = r.get("change")
        if c in (None, 0):
            return "=" if c == 0 else ""
        if isinstance(c, str):
            return c
        return f"▲{c}" if c > 0 else f"▼{-c}"

    s = rankings.summary(rows)
    prev = f" vs {rk['previous']}" if rk["previous"] else " (first tracked run)"
    out = ["## Where we rank", "",
           f"Our position in one desktop Google snapshot per keyword (top 20){prev}. "
           f"{s['top20']} of {s['tracked']} tracked keywords in the top 20, {s['top10']} in the top 10, "
           f"{s['top3']} in the top 3, {s['top1']} at #1. Cited in {s['ai']} AI Overviews, in the image block on {s['images']}. "
           "GSC = Search Console average position (it counts AI Overview citations and images too).", "",
           "| keyword | where | vol | pos | AI | images | change | page | GSC pos | GSC impr |", "|---|---|---|---|---|---|---|---|---|---|"]
    shown = [r for r in rows if r["pos"] or r["ai"] or r["images"] or r.get("prev") or (r["gsc_pos"] and r["gsc_pos"] <= 20)]
    for r in sorted(shown, key=lambda r: (r["pos"] or 99, -(r["volume"] or 0))):
        out.append(f"| {r['keyword']} | {rk['sources'][r['source']]} | {r['volume']} | {fmt_pos(r['pos'])} | {'cited' if r['ai'] else ''} | {r['images'] or ''} | {change(r)} | "
                   f"{r['url'] or '–'} | {r['gsc_pos'] or '–'} | {r['gsc_impr'] or '–'} |")
    return out + [""]
