"""The research phases. Each reads earlier phases' JSON from the run directory
and writes its own JSON + CSV, so any step can be re-run on its own."""

from __future__ import annotations

import csv
import json
import logging
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

import config
import httpx
import our_site
import page_parse
import vocab
from client import DataForSEO
from fetch import Fetcher  # polite fetcher: robots.txt, per-host delay, disk cache

log = logging.getLogger(__name__)
LOC = {"location_code": config.LOCATION_CODE, "language_code": config.LANGUAGE_CODE}


@dataclass
class Ctx:
    run_dir: Path
    client: DataForSEO | None
    sample: bool = False
    limits: dict = field(default_factory=dict)

    def limit(self, name: str, default):
        return config.SAMPLE[name] if self.sample and name in config.SAMPLE else default

    def save(self, name: str, data) -> None:
        (self.run_dir / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))

    def load(self, name: str, required: bool = True):
        file = self.run_dir / f"{name}.json"
        if not file.exists():
            if required:
                raise SystemExit(f"{file.name} missing: run the '{name}' step first")
            return None
        return json.loads(file.read_text())

    def csv(self, name: str, rows: list[dict]) -> None:
        if not rows:
            return
        with (self.run_dir / f"{name}.csv").open("w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0]), extrasaction="ignore")
            writer.writeheader()
            for row in rows:
                writer.writerow({k: ("; ".join(map(str, v)) if isinstance(v, list) else v)
                                 for k, v in row.items()})


def init_vocab(ctx: Ctx) -> None:
    domains = ctx.load("ranking_domains", required=False) or []
    vocab.set_brands([d["domain"] for d in domains[:40] if d["domain"] not in config.GENERIC_DOMAINS])


def _host(url: str) -> str:
    return urlsplit(url).netloc.lower()


def _generic(domain: str) -> bool:
    return domain in config.GENERIC_DOMAINS or domain in config.RECIPE_DOMAINS \
        or bool(re.search(config.GENERIC_PATTERN, domain))


def is_recipe(o: dict) -> bool:
    return o["domain"] in config.RECIPE_DOMAINS or bool(re.search(config.RECIPE_URL, o.get("url") or ""))


def recipe_serp(s: dict | None) -> bool:
    """DIY intent judged from the SERP itself: most of the top 10 are recipes."""
    return bool(s) and sum(is_recipe(o) for o in s["organic"][:10]) >= config.RECIPE_SERP_MIN


def peers(ctx: Ctx, n: int) -> list[str]:
    if config.PEER_DOMAINS:
        return config.PEER_DOMAINS[:n]
    return [d["domain"] for d in ctx.load("ranking_domains") if not d["ours"] and not _generic(d["domain"])][:n]


def _ours(domain: str) -> bool:
    return domain == config.OUR_DOMAIN or domain.endswith("." + config.OUR_DOMAIN)


# --- setup -----------------------------------------------------------------------

def setup(ctx: Ctx) -> None:
    user = ctx.client.get("/v3/appendix/user_data")["tasks"][0]["result"][0]
    money = user.get("money", {})
    print(f"balance ${money.get('balance')}  ·  account day limit: {money.get('limits', {}).get('day', {}).get('total')}")
    body = ctx.client.get("/v3/dataforseo_labs/locations_and_languages")
    nl = [r for r in body["tasks"][0].get("result") or [] if r.get("location_code") == config.LOCATION_CODE]
    langs = [lang.get("language_code") for r in nl for lang in r.get("available_languages", [])]
    print(f"Labs NL ({config.LOCATION_CODE}): {'yes' if nl else 'NO'}; languages: {langs}")
    if config.LANGUAGE_CODE not in langs and not ctx.client.sandbox:
        print("  ! Dutch not listed for Labs NL: keyword discovery will be thin")


# --- phase 1: keywords ----------------------------------------------------------

def _kw_row(item: dict) -> dict | None:
    data = item.get("keyword_data", item)
    keyword = data.get("keyword")
    if not keyword:
        return None
    info = data.get("keyword_info") or {}
    props = data.get("keyword_properties") or {}
    return {
        "keyword": keyword,
        "volume": info.get("search_volume") or 0,
        "cpc": info.get("cpc"),
        "competition": info.get("competition_level"),
        "kd": props.get("keyword_difficulty"),
        "intent": (data.get("search_intent_info") or {}).get("main_intent"),
        "monthly": [[m["year"], m["month"], m.get("search_volume") or 0]
                    for m in info.get("monthly_searches") or [] if m.get("year")],
    }


def seeds() -> list[str]:
    out = [f"{p} {o}" for p, occasions in config.SEED_PAIRS.items() for o in occasions]
    out += config.SEED_EXTRA
    # Every GSC query with enough impressions that passes the intent filter.
    out += [q for q in our_site.gsc_seeds(config.GSC_SEED_MIN_IMPRESSIONS)
            if vocab.is_relevant(q) and not vocab.is_diy(q) and not re.search(config.GSC_SEED_SKIP, q)
            and q != "hapjes"]  # bare head term: suggestions are all recipes
    return list(dict.fromkeys(out))


def keywords(ctx: Ctx) -> None:
    init_vocab(ctx)
    merged: dict[str, dict] = {}

    def add(row: dict | None, seed: str) -> None:
        if not row:
            return
        key = vocab.normalize(row["keyword"])
        current = merged.get(key)
        if current is None or row["volume"] > current["volume"]:
            row["seeds"] = (current or {}).get("seeds", [])
            merged[key] = current = row
        if seed not in current["seeds"]:
            current["seeds"].append(seed)

    all_seeds = seeds()[: ctx.limit("seeds", 10_000)]
    limit = ctx.limit("suggestion_limit", config.SUGGESTION_LIMIT)
    for i, seed in enumerate(all_seeds, 1):
        log.info("[%d/%d] suggestions: %s", i, len(all_seeds), seed)
        result = ctx.client.live(
            "/v3/dataforseo_labs/google/keyword_suggestions/live",
            {"keyword": seed, **LOC, "limit": limit, "include_seed_keyword": True,
             "order_by": ["keyword_info.search_volume,desc"]},
            config.COST["labs_task"] + limit * config.COST["labs_item"])
        if result:
            add(_kw_row(result.get("seed_keyword_data") or {}), seed)
            for item in result.get("items") or []:
                add(_kw_row(item), seed)
    rel_limit = ctx.limit("related_limit", config.RELATED_LIMIT)
    for seed in config.RELATED_SEEDS[: ctx.limit("related_seeds", 100)]:
        log.info("related: %s", seed)
        result = ctx.client.live(
            "/v3/dataforseo_labs/google/related_keywords/live",
            {"keyword": seed, **LOC, "depth": 1, "limit": rel_limit},
            config.COST["labs_task"] + rel_limit * config.COST["labs_item"])
        for item in (result or {}).get("items") or []:
            add(_kw_row(item), f"related:{seed}")

    rows = [r for r in merged.values() if vocab.is_relevant(r["keyword"])]
    # GSC queries Labs doesn't return still belong in the universe (volume filled below).
    known = {vocab.normalize(r["keyword"]) for r in rows}
    gsc_only = [q for q in our_site.gsc_seeds(config.GSC_SEED_MIN_IMPRESSIONS // 2)
                if q not in known and vocab.is_relevant(q) and not re.search(config.GSC_SEED_SKIP, q)]
    if gsc_only:
        vols = _volumes(ctx, gsc_only)
        rows += [{"keyword": q, "volume": vols.get(q, 0), "cpc": None, "competition": None, "kd": None,
                  "intent": None, "monthly": [], "seeds": ["gsc"]} for q in gsc_only]
    log.info("%d keywords collected, %d relevant", len(merged), len(rows))
    _fill_intent(ctx, rows)
    for row in rows:
        _map(row)
        _gsc(row)
    rows.sort(key=lambda r: -r["volume"])
    ctx.save("keywords", rows)
    ctx.csv("keywords", [{k: v for k, v in r.items() if k != "monthly"} for r in rows])
    diy = sum(1 for r in rows if r["kind"] == "diy")
    print(f"keywords: {len(rows)} relevant (of {len(merged)}), {diy} DIY/delivery (kept, never targeted), "
          f"total volume {sum(r['volume'] for r in rows if r['kind'] != 'diy'):,}")


def _fill_intent(ctx: Ctx, rows: list[dict]) -> None:
    missing = [r for r in rows if not r.get("intent")]
    for i in range(0, len(missing), 1000):
        batch = missing[i:i + 1000]
        result = ctx.client.live(
            "/v3/dataforseo_labs/google/search_intent/live",
            {"keywords": [r["keyword"] for r in batch], "language_code": config.LANGUAGE_CODE},
            config.COST["intent_task"] + len(batch) * config.COST["intent_item"])
        by_kw = {it.get("keyword"): (it.get("keyword_intent") or {}).get("label")
                 for it in (result or {}).get("items") or []}
        for r in batch:
            r["intent"] = by_kw.get(r["keyword"])


def _map(row: dict) -> dict:
    m = vocab.classify(row["keyword"])
    row.update(product=m.product, occasion=m.occasion, place=m.place, kind=m.kind, cluster=m.cluster)
    return row


def _gsc(row: dict) -> dict:
    g = our_site.gsc().get(vocab.normalize(row["keyword"])) or {}
    row.update(gsc_pos=g.get("position"), gsc_impr=g.get("impressions"), gsc_clicks=g.get("clicks"),
               gsc_page=g.get("page"))
    return row


def _volumes(ctx: Ctx, keywords_: list[str]) -> dict[str, int]:
    """Volumes for keywords not in the phase 1 universe (page targets, gaps)."""
    out: dict[str, int] = {}
    for i in range(0, len(keywords_), 700):
        batch = keywords_[i:i + 700]
        result = ctx.client.live(
            "/v3/dataforseo_labs/google/keyword_overview/live",
            {"keywords": batch, **LOC},
            config.COST["labs_task"] + len(batch) * config.COST["labs_item"])
        for item in (result or {}).get("items") or []:
            if row := _kw_row(item):
                out[vocab.normalize(row["keyword"])] = row["volume"]
    return out


# --- phase 2: SERPs ------------------------------------------------------------

def page_targets() -> dict[str, list[str]]:
    pages = our_site.our_pages()
    return {key: list(kws) for key, kws in config.PAGE_TARGETS.items() if key in pages}


def _parse_serp(result: dict | None) -> dict | None:
    if not result:
        return None
    out = {"features": result.get("item_types") or [], "organic": [], "paa": [], "related": [],
           "local_pack": [], "ai_refs": [], "ours": None, "ours_url": None, "ours_in_ai": False}
    for it in result.get("items") or []:
        kind = it.get("type")
        if kind == "organic":
            domain = (it.get("domain") or "").lower()
            out["organic"].append({"pos": it.get("rank_group"), "domain": domain,
                                   "url": it.get("url"), "title": it.get("title") or ""})
            if _ours(domain) and out["ours"] is None:
                out["ours"] = it.get("rank_group")
                out["ours_url"] = it.get("url")
        elif kind == "people_also_ask":
            out["paa"] += [q.get("title") for q in it.get("items") or [] if q.get("title")]
        elif kind == "related_searches":
            out["related"] += [q for q in it.get("items") or [] if isinstance(q, str)]
        elif kind == "local_pack":
            rating = it.get("rating") or {}
            out["local_pack"].append({"title": it.get("title") or "", "domain": (it.get("domain") or "").lower(),
                                      "rating": rating.get("value"), "reviews": rating.get("votes_count"),
                                      "ours": "hangende" in (it.get("title") or "").lower()})
        elif kind == "ai_overview":
            out["ai_refs"] += list(dict.fromkeys(
                (r.get("domain") or "").lower() for r in it.get("references") or [] if r.get("domain")))
    out["ours_in_ai"] = any(_ours(d) for d in out["ai_refs"])
    return out


def serp(ctx: Ctx) -> None:
    init_vocab(ctx)
    universe = ctx.load("keywords")
    top_n = ctx.limit("serp_top_n", config.SERP_TOP_N)
    chosen = [r["keyword"] for r in universe if r["kind"] not in ("brand", "diy")][:top_n]
    targets = page_targets()
    target_kws = [kw for kws in targets.values() for kw in kws] + config.EXTRA_SERP_KEYWORDS
    if ctx.sample:
        target_kws = target_kws[:2]
    keywords_ = list(dict.fromkeys(chosen + target_kws))
    log.info("SERPs for %d keywords (%d page targets)", len(keywords_), len(target_kws))
    results = ctx.client.serp(keywords_, config.SERP_DEPTH)
    serps = {kw: parsed for kw in keywords_ if (parsed := _parse_serp(results.get(kw))) is not None}
    known = {vocab.normalize(r["keyword"]) for r in universe}
    extra = [kw for kw in target_kws if vocab.normalize(kw) not in known]
    volumes = {vocab.normalize(r["keyword"]): r["volume"] for r in universe}
    volumes.update(_volumes(ctx, extra) if extra else {})
    ctx.save("serp", {"targets": targets, "volumes": {kw: volumes.get(vocab.normalize(kw), 0) for kw in keywords_},
                      "serps": serps})

    visibility: dict[str, dict] = defaultdict(lambda: {"visibility": 0.0, "keywords": 0, "top3": 0,
                                                       "best": 99, "examples": []})
    for kw, s in serps.items():
        if vocab.classify(kw).kind in ("diy", "brand") or recipe_serp(s):
            continue  # visibility on DIY SERPs isn't competition for a live act
        vol = max(volumes.get(vocab.normalize(kw), 0), 10)
        for o in s["organic"][:10]:
            d = o["domain"]
            if _generic(d) or not o.get("pos"):
                continue
            v = visibility[d]
            v["visibility"] += vol * config.CTR[min(o["pos"], 10) - 1]
            v["keywords"] += 1
            v["top3"] += o["pos"] <= 3
            v["best"] = min(v["best"], o["pos"])
            if len(v["examples"]) < 5:
                v["examples"].append(f"{kw} (#{o['pos']})")
    domains = [{"domain": d, **v, "visibility": round(v["visibility"], 1), "ours": _ours(d)}
               for d, v in visibility.items()]
    domains.sort(key=lambda d: -d["visibility"])
    ctx.save("ranking_domains", domains)
    ctx.csv("ranking_domains", domains)
    ctx.csv("serp", [{"keyword": kw, "volume": volumes.get(vocab.normalize(kw), 0), **o}
                     for kw, s in serps.items() for o in s["organic"]])
    ctx.csv("paa", [{"keyword": kw, "question": q} for kw, s in serps.items() for q in s["paa"]])
    print(f"serp: {len(serps)}/{len(keywords_)} SERPs, {len(domains)} ranking domains, "
          f"{config.OUR_DOMAIN} in top 10 for {sum(1 for s in serps.values() if s['ours'] and s['ours'] <= 10)}, "
          f"top 20 for {sum(1 for s in serps.values() if s['ours'])}")


# --- phase 3: competitors ---------------------------------------------------------

def url_pattern(path: str) -> str:
    segs = [s for s in path.split("?")[0].split("/") if s]
    if len(segs) <= 1:
        return "/" + "/".join(segs)
    if len(segs) == 2:
        return f"/{segs[0]}/*"
    return f"/{segs[0]}/*/{segs[-1]}"


def _ranked(ctx: Ctx, domain: str, limit: int) -> list[dict]:
    result = ctx.client.live(
        "/v3/dataforseo_labs/google/ranked_keywords/live",
        {"target": domain.removeprefix("www."), **LOC, "limit": limit,
         "order_by": ["ranked_serp_element.serp_item.etv,desc"]},
        config.COST["labs_task"] + limit * config.COST["labs_item"])
    rows = []
    for item in (result or {}).get("items") or []:
        data, serp_item = item.get("keyword_data") or {}, (item.get("ranked_serp_element") or {}).get("serp_item") or {}
        if not data.get("keyword"):
            continue
        rows.append({"keyword": data["keyword"], "volume": (data.get("keyword_info") or {}).get("search_volume") or 0,
                     "pos": serp_item.get("rank_group"), "url": serp_item.get("relative_url") or serp_item.get("url") or "",
                     "etv": round(serp_item.get("etv") or 0, 1)})
    return rows


def competitors(ctx: Ctx) -> None:
    init_vocab(ctx)
    domains = peers(ctx, ctx.limit("competitor_domains", config.COMPETITOR_DOMAINS))
    limit = ctx.limit("ranked_limit", config.RANKED_LIMIT)
    ranked = {}
    for d in domains:
        log.info("ranked keywords: %s", d)
        ranked[d] = [r for r in _ranked(ctx, d, limit)
                     if vocab.is_relevant(r["keyword"]) and not vocab.is_diy(r["keyword"])]
    ours = [_gsc(r) for r in _ranked(ctx, config.OUR_DOMAIN, 300)]
    our_kws = {vocab.normalize(r["keyword"]) for r in ours}

    by_kw: dict[str, dict] = {}
    for d, rows in ranked.items():
        for r in rows:
            if not r["pos"] or r["pos"] > 20:
                continue
            key = vocab.normalize(r["keyword"])
            g = by_kw.setdefault(key, {"keyword": r["keyword"], "volume": r["volume"], "domains": [], "best_pos": 99})
            g["domains"].append(f"{d} #{r['pos']}")
            g["best_pos"] = min(g["best_pos"], r["pos"])
    gaps = [{**g, "n_domains": len(g["domains"]), **_map({"keyword": g["keyword"]})}
            for key, g in by_kw.items() if len(g["domains"]) >= 2 and key not in our_kws]
    gaps.sort(key=lambda g: (-g["n_domains"], -g["volume"]))

    patterns = {}
    for d, rows in ranked.items():
        agg: dict[str, dict] = defaultdict(lambda: {"keywords": 0, "etv": 0.0, "volume": 0, "examples": []})
        for r in rows:
            p = agg[url_pattern(r["url"])]
            p["keywords"] += 1
            p["etv"] += r["etv"]
            p["volume"] += r["volume"]
            if len(p["examples"]) < 3:
                p["examples"].append(f"{r['keyword']} #{r['pos']}")
        patterns[d] = sorted(({"pattern": k, **v, "etv": round(v["etv"], 1)} for k, v in agg.items()),
                             key=lambda p: -p["etv"])[:15]
    ctx.save("competitors", {"domains": domains, "ranked": ranked, "ours": ours, "gaps": gaps, "patterns": patterns})
    ctx.csv("competitor_keywords", [{"domain": d, **r} for d, rows in ranked.items() for r in rows])
    ctx.csv("gaps", gaps)
    print(f"competitors: {len(domains)} domains, {sum(map(len, ranked.values()))} relevant ranked keywords, "
          f"{len(gaps)} gaps (≥2 competitors in top 20, we're absent); we rank for {len(ours)} keywords (Labs)")


# --- phase 4: content depth ------------------------------------------------------

def content(ctx: Ctx) -> None:
    init_vocab(ctx)
    serp_data = ctx.load("serp")
    universe = ctx.load("keywords")
    targets: dict[str, list[str]] = serp_data["targets"]
    indexable = set(targets)
    for row in universe:  # add the strongest mapped keywords per page
        page = our_site.page_for(row["product"], row["occasion"], row["place"], row["kind"], indexable)
        if page is not None and row["kind"] not in ("brand", "diy"):
            bucket = targets.setdefault(page, [])
            extra = [k for k in bucket if k not in config.PAGE_TARGETS.get(page, [])]
            if len(extra) < config.CONTENT_TARGETS_PER_PAGE and row["keyword"] not in bucket:
                bucket.append(row["keyword"])
    if ctx.sample:
        targets = dict(list(targets.items())[:2])
    all_kws = [kw for kws in targets.values() for kw in kws]
    serps = {**serp_data["serps"],
             **{kw: p for kw, r in ctx.client.serp(all_kws, config.SERP_DEPTH).items()
                if (p := _parse_serp(r)) is not None}}
    volumes = {**serp_data["volumes"], **{r["keyword"]: r["volume"] for r in universe}}

    cache = config.OUTPUT / "html"
    fetcher = Fetcher(delay=1.0, cache_dir=cache, user_agent=config.USER_AGENT)
    own = Fetcher(delay=0.5, refresh=True, cache_dir=cache / "ours", user_agent=config.USER_AGENT)
    pages_url = our_site.our_pages()
    budget = ctx.limit("content_max_pages", config.CONTENT_MAX_PAGES)
    parsed_cache: dict[str, dict | None] = {}

    def fetch(url: str, f: Fetcher) -> dict | None:
        if url not in parsed_cache:
            try:
                parsed_cache[url] = page_parse.parse(f.get(url), url)
            except (httpx.HTTPError, PermissionError, UnicodeError) as exc:
                log.info("skip %s: %s", url, exc)
                parsed_cache[url] = None
        return parsed_cache[url]

    out = {}
    out_dir = ctx.run_dir / "content_gaps"
    out_dir.mkdir(exist_ok=True)
    for key, kws in targets.items():
        url = pages_url.get(key)
        ours = fetch(url, own) if url else None
        if not ours:
            log.warning("could not fetch our page %r", key)
            continue
        comp_urls = []
        for kw in kws:
            for o in (serps.get(kw) or {}).get("organic", [])[: config.CONTENT_TOP_N + 2]:
                if not _ours(o["domain"]) and not _generic(o["domain"]) and o["url"] not in comp_urls:
                    comp_urls.append(o["url"])
        comp = []
        for u in comp_urls:
            if budget <= 0:
                break
            if u not in parsed_cache:
                budget -= 1
            if (p := fetch(u, fetcher)) and p["words"] > 50:
                comp.append(p)
        out[key] = _page_gaps(key, url, ours, comp, kws, serps, volumes)
        (out_dir / f"{(key or 'home').replace('/', '_')}.md").write_text(_gaps_md(out[key]))
        log.info("content %s: %d competitor pages, %d missing questions", key or "home", len(comp),
                 len(out[key]["missing_questions"]))
    ctx.save("content", out)
    print(f"content: {len(out)} pages compared, {len([u for u, p in parsed_cache.items() if p])} pages parsed")


def _page_gaps(key, url, ours, comp, kws, serps, volumes) -> dict:
    candidates = ours["questions"] + [h["text"] for h in ours["headings"]] + [ours["title"]]
    # Off-topic SERP noise ("welke boeken moet je gelezen hebben") is dropped.
    ok = lambda q: vocab.is_relevant(q) and not vocab.is_diy(q)  # noqa: E731
    paa = Counter(q for kw in kws for q in (serps.get(kw) or {}).get("paa", []) if ok(q))
    related = Counter(q for kw in kws for q in (serps.get(kw) or {}).get("related", []) if ok(q))
    # Count competitor FAQs per domain: two pages of one site are one opinion.
    comp_faq = Counter(q for domain, qs in _questions_by_domain(comp).items() for q in qs)
    missing, near, covered = [], [], []
    for q, n in (paa + Counter({q: c for q, c in comp_faq.items() if c >= 2})).most_common():
        score, match = page_parse.best_match(q, candidates)
        row = {"question": q, "serps": paa.get(q, 0), "competitor_pages": comp_faq.get(q, 0),
               "score": round(score, 2), "closest": match}
        if score >= config.QUESTION_MATCH:
            covered.append(row)
        elif score >= config.QUESTION_NEAR_MISS:
            near.append(row)
        else:
            missing.append(row)
    min_pages = 3 if len({_host(p["url"]) for p in comp}) >= 5 else 2
    topics = []
    for t in page_parse.topic_clusters(comp, min_pages=min_pages):
        score, match = page_parse.best_match(t["label"], candidates)
        if score < config.QUESTION_MATCH:
            topics.append({**t, "closest": match, "score": round(score, 2)})
    related_missing = [{"search": q, "serps": n} for q, n in related.most_common()
                       if page_parse.best_match(q, candidates)[0] < config.QUESTION_NEAR_MISS]
    ours_depth = {"words": ours["words"], "questions": len(ours["questions"]),
                  "headings": len(ours["headings"]), "prices": ours["prices"], "images": ours["images"]}
    return {
        "key": key, "url": url, "noindex": ours["noindex"], "title": ours["title"],
        "targets": [{"keyword": kw, "volume": volumes.get(kw, 0),
                     "ours": (serps.get(kw) or {}).get("ours"),
                     "top3": [o["domain"] for o in (serps.get(kw) or {}).get("organic", [])[:3]]} for kw in kws],
        "ours": ours_depth, "competitors": page_parse.depth_stats(comp),
        "competitor_pages": [{"url": p["url"], "words": p["words"], "questions": len(p["questions"]),
                              "headings": len(p["headings"]), "schema": p["schema_types"]} for p in comp],
        "outline": [h for h in ours["headings"] if h["level"] <= 3],
        "missing_questions": missing, "near_misses": near, "covered": covered,
        "missing_topics": topics, "related_missing": related_missing[:20],
    }


def _questions_by_domain(pages: list[dict]) -> dict[str, set[str]]:
    out: dict[str, set[str]] = defaultdict(set)
    for p in pages:
        out[_host(p["url"])].update(p["questions"])
    return out


def _gaps_md(g: dict) -> str:
    c, o = g["competitors"], g["ours"]
    lines = [f"# Content gaps: /{g['key']}" if g["key"] else "# Content gaps: homepage", "",
             "Generated by scripts/seo-research. Gap analysis only: never copy competitor text.", "",
             f"{g['url']}{'  ⚠️ noindex' if g['noindex'] else ''}", "",
             "## Target keywords", "", "| keyword | volume | our position | top 3 |", "|---|---|---|---|"]
    lines += [f"| {t['keyword']} | {t['volume']} | {t['ours'] or '–'} | {', '.join(t['top3'])} |" for t in g["targets"]]
    lines += ["", f"## Depth (ours vs median of {c['pages']} competitor pages)", "",
              "| | ours | competitors |", "|---|---|---|"]
    lines += [f"| {k} | {o[k]} | {c[k]} |" for k in ("words", "questions", "headings", "prices", "images")]
    lines += ["", "## Missing questions", "", ("Questions from Google's 'People also ask' (serps = in how many target SERPs) "
               "and FAQ questions on ≥2 competitor sites, with no close match on our page."), ""]
    lines += [f"- {m['question']} (serps {m['serps']}, competitor sites {m['competitor_pages']})" for m in g["missing_questions"]] or ["- none"]
    if g["near_misses"]:
        lines += ["", "## Near misses (check by hand)", ""]
        lines += [f"- {m['question']} ≈ “{m['closest']}” ({m['score']})" for m in g["near_misses"]]
    lines += ["", "## Subtopics competitors cover and we don't", ""]
    lines += [f"- **{t['label']}** ({t['pages']} sites; e.g. {' / '.join(t['examples'][1:3]) or '–'})" for t in g["missing_topics"]] or ["- none"]
    if g["related_missing"]:
        lines += ["", "## Related searches not addressed", ""]
        lines += [f"- {r['search']}" for r in g["related_missing"]]
    lines += ["", "## Our outline", ""] + [f"{'  ' * (h['level'] - 1)}- {h['text']}" for h in g["outline"]]
    return "\n".join(lines) + "\n"


# --- phase 5: backlinks -------------------------------------------------------------

_LINK_TYPES = [
    ("wedding", r"trouw|bruilof|bruid|wedding|huwelijk|weddingplanner"),
    ("event / venue", r"agenda|uitgaan|event|evenement|feest|locatie|zaal|venue|party|kasteel|landgoed|buitenplaats"),
    ("food", r"food|eten|culinair|horeca|catering|chef|recept|smaak|proef|gastro|restaurant"),
    ("local", r"hilversum|gooi|bussum|laren|huizen|naarden|baarn|soest|blaricum|utrecht|amersfoort"),
    ("municipality", r"gemeente|overheid|provincie"),
    ("press", r"nieuws|krant|dagblad|courant|omroep|rtv|nu\.nl|telegraaf|ad\.nl|regio"),
    ("directory", r"gids|startpagina|bedrijven|vergelijk|top10|beste|listing|directory|links|telefoongids|openingstijden|cylex|yelp|tripadvisor|werkspot|trustoo"),
    ("blog", r"blog|wordpress|blogspot|medium\.com"),
]


_SPAM = re.compile(r"seo|rank|backlink|traffic|linkbuild|casino|bet|loan|crypto|porn|xxx|viagra")


def link_type(domain: str) -> str:
    for name, pattern in _LINK_TYPES:
        if re.search(pattern, domain):
            return name
    return "other"


def backlinks(ctx: Ctx) -> None:
    ranking = peers(ctx, 50)
    n_summary = ctx.limit("backlink_summary_domains", config.BACKLINK_SUMMARY_DOMAINS)
    n_ref = ctx.limit("backlink_referring_domains", config.BACKLINK_REFERRING_DOMAINS)
    limit = ctx.limit("referring_limit", config.REFERRING_LIMIT)
    summary = {}
    for d in [config.OUR_DOMAIN] + ranking[:n_summary]:
        r = ctx.client.live("/v3/backlinks/summary/live",
                            {"target": d.removeprefix("www."), "include_subdomains": True},
                            config.COST["backlinks_task"])
        if r:
            summary[d] = {k: r.get(k) for k in ("rank", "backlinks", "referring_domains", "referring_main_domains")}
    referring: dict[str, dict[str, int]] = {}
    for d in [config.OUR_DOMAIN] + ranking[:n_ref]:
        r = ctx.client.live("/v3/backlinks/referring_domains/live",
                            {"target": d.removeprefix("www."), "limit": limit, "order_by": ["rank,desc"],
                             "exclude_internal_backlinks": True},
                            config.COST["backlinks_task"] + limit * config.COST["backlinks_row"])
        referring[d] = {i["domain"]: i.get("rank") or 0 for i in (r or {}).get("items") or [] if i.get("domain")}
    our_refs = referring.pop(config.OUR_DOMAIN, {})
    ours = set(our_refs)
    linkers: dict[str, dict] = {}
    for comp, refs in referring.items():
        for dom, rank in refs.items():
            if dom in ours or _ours(dom) or (rank or 0) < 10 or _SPAM.search(dom):
                continue  # ours, unranked, or obvious link spam
            entry = linkers.setdefault(dom, {"domain": dom, "rank": rank, "links_to": []})
            entry["links_to"].append(comp)
    targets = [{**e, "n": len(e["links_to"]), "type": link_type(e["domain"])}
               for e in linkers.values() if len(e["links_to"]) >= 2 or len(referring) == 1]
    targets.sort(key=lambda t: (-t["n"], -t["rank"]))
    our_list = sorted(({"domain": d, "rank": r, "type": link_type(d)} for d, r in our_refs.items()),
                      key=lambda x: -(x["rank"] or 0))
    ctx.save("backlinks", {"summary": summary, "targets": targets, "checked": list(referring), "ours": our_list})
    ctx.csv("our_referring_domains", our_list)
    ctx.csv("link_targets", targets)
    print(f"backlinks: {len(summary)} summaries, {len(targets)} link targets "
          f"(domains linking to ≥2 of {len(referring)} competitors, not to us)")


# --- phase 5b: local pack / Maps -------------------------------------------------------

def local(ctx: Ctx) -> None:
    """Google Maps SERPs + organic SERPs searched from Hilversum: who owns the local pack,
    with what ratings, review counts and categories."""
    maps_q = config.MAPS_QUERIES[: ctx.limit("maps_queries", 100)]
    org_q = config.LOCAL_ORGANIC[: ctx.limit("local_organic", 100)]
    maps_raw = ctx.client.serp(maps_q, config.MAPS_DEPTH, engine="maps", coordinate=config.HILVERSUM_COORD)
    maps = {}
    for kw in maps_q:
        items = []
        for it in (maps_raw.get(kw) or {}).get("items") or []:
            if it.get("type") != "maps_search":
                continue
            rating = it.get("rating") or {}
            title = it.get("title") or ""
            items.append({"pos": it.get("rank_group"), "title": title, "domain": (it.get("domain") or "").lower(),
                          "category": it.get("category"), "categories": it.get("additional_categories") or [],
                          "rating": rating.get("value"), "reviews": rating.get("votes_count"),
                          "address": it.get("address"), "claimed": it.get("is_claimed"),
                          "ours": "hangende" in title.lower() or _ours((it.get("domain") or "").lower())})
        maps[kw] = items
    coord = config.HILVERSUM_COORD.rsplit(",", 1)[0] + ",10000"  # organic: lat,lng,radius(m)
    org_raw = ctx.client.serp(org_q, config.SERP_DEPTH, coordinate=coord)
    organic = {kw: p for kw in org_q if (p := _parse_serp(org_raw.get(kw))) is not None}
    ctx.save("local", {"maps": maps, "organic": organic})
    ctx.csv("maps", [{"query": kw, **{k: v for k, v in it.items() if k != "categories"},
                      "categories": it["categories"]} for kw, its in maps.items() for it in its])
    us = {kw: next((it["pos"] for it in its if it["ours"]), None) for kw, its in maps.items()}
    print(f"local: {len(maps)} Maps SERPs (we appear in {sum(1 for v in us.values() if v)}), "
          f"{len(organic)} Hilversum-localised organic SERPs")


# --- phase 6: scoring ----------------------------------------------------------------

BUCKETS = [
    ("protect", "Protect (we're top 3)"),
    ("improve", "Improve an existing page"),
    ("new_post", "New post / article"),
    ("new_page", "New service or location page"),
    ("skip", "Skip"),
]


def score(ctx: Ctx) -> None:
    init_vocab(ctx)
    universe = ctx.load("keywords")
    serp_data = ctx.load("serp", required=False) or {"serps": {}, "targets": {}}
    comp = ctx.load("competitors", required=False) or {"gaps": []}
    bl = ctx.load("backlinks", required=False) or {"summary": {}}
    ranking = ctx.load("ranking_domains", required=False) or []
    strong = {d["domain"] for d in ranking[:5] if d["domain"] not in config.GENERIC_DOMAINS}
    strong |= {d for d, s in bl["summary"].items()
               if (s.get("referring_domains") or 0) >= config.STRONG_DOMAIN_REFERRING}
    indexable = set(serp_data["targets"]) or set(our_site.our_pages())

    rows = {vocab.normalize(r["keyword"]): r for r in universe}
    for g in comp["gaps"]:
        rows.setdefault(vocab.normalize(g["keyword"]),
                        _gsc({"keyword": g["keyword"], "volume": g["volume"], "intent": None, "seeds": ["gap"],
                              **_map({"keyword": g["keyword"]})}))
    clusters: dict[str, list[dict]] = defaultdict(list)
    for r in rows.values():
        clusters[r["cluster"]].append(r)
    gap_kws = {vocab.normalize(g["keyword"]) for g in comp["gaps"]}

    out = []
    for cluster, kws in clusters.items():
        kws.sort(key=lambda r: -r["volume"])
        top = kws[0]
        # Google shares one volume between close variants: max, never sum (analyze merges properly).
        volume = max(r["volume"] for r in kws)
        intents = Counter()
        for r in kws:
            intents[r.get("intent")] += r["volume"] or 1
        intent = intents.most_common(1)[0][0]
        serp_kw = next((r["keyword"] for r in kws if r["keyword"] in serp_data["serps"]), None)
        s = serp_data["serps"].get(serp_kw) if serp_kw else None
        win, ours_pos = 0.5, None
        if s and s["organic"]:
            top10 = s["organic"][:10]
            win = sum(0.9 if o["domain"] in config.GENERIC_DOMAINS else 0.25 if o["domain"] in strong else 0.75
                      for o in top10) / len(top10)
            ours_pos = s["ours"]
            if ours_pos and ours_pos <= 10:
                win = min(1.0, win + 0.15)
        gsc_rows = [r for r in kws if r.get("gsc_impr")]
        gsc_best = min(gsc_rows, key=lambda r: r["gsc_pos"]) if gsc_rows else None
        gsc_impr = sum(r["gsc_impr"] for r in gsc_rows)
        kind = top["kind"]
        page = our_site.page_for(top["product"], top["occasion"], top["place"], kind, indexable)
        weight = config.INTENT_WEIGHT.get(intent, 0.7)
        if top["product"] in config.FOCUS_PRODUCTS:
            weight *= config.FOCUS_WEIGHT
        protected = (gsc_best and gsc_best["gsc_pos"] <= config.PROTECT_POSITION and gsc_best["gsc_impr"] >= 10) \
            or (ours_pos is not None and ours_pos <= 3)
        if kind == "brand":
            bucket, reason = "skip", "competitor brand"
        elif kind == "diy":
            bucket, reason = "skip", "DIY / supermarket / delivery intent"
        elif recipe_serp(s):
            bucket, reason = "skip", "recipe-dominated SERP (DIY intent)"
        elif vocab.normalize(top["keyword"]) in config.HEAD_TERMS:
            bucket, reason = "skip", "bare national head term (Tier 4)"
        elif vocab.normalize(top["keyword"]) in config.INTENT_MISMATCH:
            bucket, reason = "skip", "intent mismatch: " + config.INTENT_MISMATCH[vocab.normalize(top["keyword"])]
        elif top["product"] in config.PROTECT_PRODUCTS and (gsc_best or {}).get("gsc_pos", 99) <= 10:
            bucket, reason = "protect", f"tiramisu/millefoglie already rank (GSC {gsc_best['gsc_pos']})"
        elif volume < config.MIN_VOLUME and gsc_impr < 20:
            bucket, reason = "skip", "no measurable volume"
        elif kind == "other":
            bucket, reason = "skip", "not mapped (check by hand)"
        elif protected:
            bucket, reason = "protect", f"top 3 (SERP #{ours_pos or '–'}, GSC {gsc_best['gsc_pos'] if gsc_best else '–'})"
        elif top["place"] and top["place"] not in config.NEAR_PLACES:
            bucket, reason = "new_page", f"no page for {top['place']}"
        elif page is not None and kind == "service":
            bucket, reason = "improve", f"maps to /{page}"
        elif page is not None and kind == "answer" and page not in ("",):
            bucket, reason = "improve", f"answer on /{page}"
        elif kind == "answer":
            bucket, reason = "new_post", "question/price content we don't have"
        else:
            bucket, reason = "new_page", "service intent without a dedicated page"
        out.append({
            "cluster": cluster, "bucket": bucket, "reason": reason, "kind": kind,
            "product": top["product"], "occasion": top["occasion"], "place": top["place"],
            "top_keyword": top["keyword"], "volume": volume, "keywords": len(kws),
            "intent": intent, "winnability": round(win, 2), "has_serp": s is not None,
            "our_position": ours_pos, "gsc_pos": gsc_best["gsc_pos"] if gsc_best else None,
            "gsc_impr": gsc_impr, "page": page,
            "gap": any(vocab.normalize(r["keyword"]) in gap_kws for r in kws),
            "score": round(max(volume, gsc_impr / 6) * weight * win, 1),
            "top3": [o["domain"] for o in (s or {}).get("organic", [])[:3]],
            "examples": [f"{r['keyword']} ({r['volume']})" for r in kws[:6]],
        })
    out.sort(key=lambda o: -o["score"])
    ctx.save("opportunities", out)
    ctx.csv("opportunities", out)
    by_bucket = Counter(o["bucket"] for o in out)
    print("opportunities: " + ", ".join(f"{b} {n}" for b, n in by_bucket.most_common()))
