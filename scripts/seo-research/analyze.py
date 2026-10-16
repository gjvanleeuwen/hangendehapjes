"""Overtakability: for each main query, how strong is the current top 10 and
which position is realistic for us, now (content only) and with modest authority.

- Close variants are merged ("tiramisu bruiloft" / "tiramisu op bruiloft" / "bruiloft tiramisu"):
  Google reports one shared volume for them, so summing them double counts.
- DIY / recipe / supermarket / delivery queries and named businesses are dropped.
- Our GSC position + impressions are joined per query (data/gsc, newest pull).
- Domain strength = DataForSEO backlinks rank (0-1000) for every domain in the
  analysed top 10s, fetched in one bulk call.
"""

from __future__ import annotations

import logging
import re
from collections import Counter, defaultdict
from urllib.parse import urlsplit

import config
import our_site
import vocab
from phases import _gsc, _map, init_vocab, is_recipe, recipe_serp

log = logging.getLogger(__name__)

_STOP = set("op voor een de het bij van met in te je jullie mijn onze uw en".split())
_PLURAL = {"bruiloften": "bruiloft", "feesten": "feest", "feestje": "feest", "hapje": "hapjes",
           "borrelhapje": "borrelhapjes", "bruidstaarten": "bruidstaart", "taarten": "taart",
           "desserts": "dessert", "toetje": "toetjes", "prijzen": "prijs", "kost": "kosten",
           "inhuren": "huren", "klassiek": "klassieke", "italiaans": "italiaanse", "diner": "dinner",
           "cateraar": "catering", "amuses": "amuse", "trouwen": "bruiloft", "huwelijk": "bruiloft"}
# Results that answer "what is X / how do I make X" rather than "hire someone for X".
_MEDIA = re.compile(r"(wikipedia|youtube|instagram|facebook|tiktok|pinterest|reddit|quora|"
                    r"allerhande|leukerecepten|24kitchen|smulweb|culy|libelle|margriet|ah\.nl|jumbo\.com)")
_ARTICLE = re.compile(r"/(blog|inspiratie|nieuws|tips|artikel|artikelen|magazine|kennisbank|gids|vraag|"
                      r"wat-kost|hoe-|recept|recepten|weetjes|advies)", re.I)

_KNOWN: set[str] = set()


def _known_words() -> set[str]:
    if not _KNOWN:
        words = set(_STOP) | set(_PLURAL) | set(_PLURAL.values())
        for aliases in config.PRODUCTS.values():
            words |= {w for a in aliases for w in vocab.normalize(a).split()}
        for aliases in config.OCCASIONS.values():
            words |= {w for a in aliases for w in vocab.normalize(a).split()}
        for group in (config.COMMERCIAL, config.QUESTION_WORDS, config.PRICE_WORDS, config.PROVINCES, config.PLACES):
            words |= {w for item in group for w in vocab.normalize(item).replace("-", " ").split()}
        words |= set(
            "live goedkoop goedkope bekende beste top kleine kleinschalige grote luxe originele origineel leuke "
            "unieke bijzondere avond middag uur nodig ideeen idee lijst menu soorten welke hoeveel wat hoe "
            "wanneer per persoon personen gasten mensen 25 30 40 50 60 75 80 100 120 150 200 250 300 jaar "
            "klassieke klassiek moderne modern italiaanse italiaans hartige hartig zoete zoet warme koude "
            "verse vers ter plekke lopend lopende rondlopend op locatie aan huis thuis buiten binnen "
            "taart taarten etage etages lagen naked semi fondant botercreme slagroom aardbeien chocolade "
            "proeven proeverij smaak smaken maat op versieren decoratie bloemen topper "
            "dinner diner lunch brunch high tea bbq barbecue buffet walking staand foodtruck food truck "
            "bestellen boeken huren inhuren kosten prijs prijzen tarief offerte vergelijken verschil of vs "
            "catering cateraar cateringbedrijf traiteur partyservice service bedrijf concept act entertainment "
            "nederland regio omgeving buurt in de bij provincie noord holland kerst oud nieuw zomer "
            "receptiehapjes borrelplank borrelplanken kaas worst olijven bitterballen".split())
        _KNOWN.update(words)
    return _KNOWN


def group_key(keyword: str) -> str:
    words = [_PLURAL.get(w, w) for w in vocab.normalize(keyword).replace("-", " ").split() if w not in _STOP]
    return " ".join(sorted(dict.fromkeys(words)))


def unknown_words(keyword: str) -> list[str]:
    known = _known_words()
    return [w for w in vocab.normalize(keyword).replace("-", " ").split() if w not in known and not w.isdigit()]


def result_type(o: dict) -> str:
    url = o.get("url") or ""
    if _MEDIA.search(o["domain"]) or is_recipe(o):
        return "media"
    if "marktplaats" in o["domain"]:
        return "classifieds"
    if _ARTICLE.search(url) or (o.get("title") or "").rstrip().endswith("?"):
        return "article"
    path = urlsplit(url).path.strip("/")
    return "homepage" if not path else "listing/service"


def analyze(ctx) -> None:
    init_vocab(ctx)
    universe = ctx.load("keywords")
    serp_data = ctx.load("serp")
    serps, volumes = serp_data["serps"], serp_data["volumes"]
    comp = ctx.load("competitors", required=False) or {"gaps": []}

    # 1. Variant groups (max volume, not sum), filtered.
    rows = {r["keyword"]: r for r in universe}
    for g in comp["gaps"]:
        rows.setdefault(g["keyword"], {"keyword": g["keyword"], "volume": g["volume"], "intent": None,
                                       **_map({"keyword": g["keyword"]})})
    for kw, vol in volumes.items():
        rows.setdefault(kw, {"keyword": kw, "volume": vol, "intent": None, **_map({"keyword": kw})})
    groups: dict[str, list[dict]] = defaultdict(list)
    for r in rows.values():
        groups[group_key(r["keyword"])].append(r)

    # 2. Domain strength for every domain in the analysed top 10s (one bulk call).
    domains = sorted({o["domain"] for s in serps.values() for o in s["organic"][:10]})
    ranks = _bulk_ranks(ctx, domains)
    ours_rank = ranks.get(config.OUR_DOMAIN, 0)

    out, dropped = [], Counter()
    for key, variants in groups.items():
        variants.sort(key=lambda r: (-(r["keyword"] in serps), -r["volume"]))
        rep = variants[0]
        volume = max(r["volume"] for r in variants)
        kw = rep["keyword"]
        if rep.get("kind") == "brand":
            dropped["competitor brand"] += 1
            continue
        if rep.get("kind") == "diy" or vocab.is_diy(kw):
            dropped["DIY / supermarket / delivery"] += 1
            continue
        s = serps.get(kw)
        unknown = unknown_words(kw)
        media = sum(1 for o in (s or {}).get("organic", [])[:10] if _MEDIA.search(o["domain"]))
        if unknown and (media >= 2 or not s):
            dropped["named business / other topic"] += 1
            continue
        if not s or volume < config.MIN_VOLUME:
            continue
        if recipe_serp(s):
            dropped["recipe-dominated SERP (DIY intent)"] += 1
            continue
        top = s["organic"][:10]
        types = Counter(result_type(o) for o in top)
        enriched = [{"pos": o["pos"], "domain": o["domain"], "rank": ranks.get(o["domain"]),
                     "type": result_type(o), "url": o["url"]} for o in top]
        soft = lambda e: e["type"] in ("media", "classifieds") or (e["rank"] or 0) < config.RANK_NOW  # noqa: E731
        strong_now = [e for e in enriched if not soft(e) and not vocab_ours(e["domain"])]
        strong_later = [e for e in enriched if (e["rank"] or 0) >= config.RANK_LATER
                        and e["type"] not in ("media", "classifieds") and not vocab_ours(e["domain"])]
        reach_now = len(strong_now) + 1
        reach_later = len(strong_later) + 1
        content = "article" if types["article"] + types["media"] >= 4 else "listing"
        page = our_site.page_for(rep.get("product"), rep.get("occasion"), rep.get("place"), rep.get("kind"),
                                 set(serp_data["targets"]))
        g = max((_gsc({"keyword": r["keyword"]}) for r in variants), key=lambda x: x.get("gsc_impr") or 0)
        ctr = lambda p: config.CTR[p - 1] if p <= 10 else 0.005  # noqa: E731
        out.append({
            "query": kw, "variants": [r["keyword"] for r in variants[:6]], "volume": volume,
            "kind": rep.get("kind"), "product": rep.get("product"), "intent": rep.get("intent"),
            "content_type": content, "our_page": ("/" + page) if page is not None else None,
            "ours": s["ours"], "ours_url": s.get("ours_url"), "gsc_pos": g.get("gsc_pos"),
            "gsc_impr": g.get("gsc_impr"), "gsc_clicks": g.get("gsc_clicks"),
            "focus": rep.get("product") in config.FOCUS_PRODUCTS,
            "protect": rep.get("product") in config.PROTECT_PRODUCTS or (s["ours"] or 99) <= 3,
            "reach_now": reach_now, "reach_later": reach_later,
            "clicks_now": round(volume * ctr(min(reach_now, 11))),
            "clicks_later": round(volume * ctr(min(reach_later, 11))),
            "weak_slots": sum(1 for e in enriched if soft(e)),
            "median_rank": sorted(e["rank"] or 0 for e in enriched)[len(enriched) // 2] if enriched else None,
            "features": [f for f in s["features"] if f in ("ai_overview", "local_pack", "people_also_ask", "video", "featured_snippet", "images")],
            "ours_in_ai": s.get("ours_in_ai", False),
            "mismatch": config.INTENT_MISMATCH.get(vocab.normalize(kw)),
            "paa": s["paa"][:6], "top10": enriched,
        })
    out.sort(key=lambda r: -r["clicks_later"])
    ctx.save("analysis", {"ours_rank": ours_rank, "dropped": dropped, "ranks": ranks, "queries": out})
    ctx.csv("overtake", [{k: v for k, v in r.items() if k not in ("top10", "paa")} for r in out])
    print(f"analyze: {len(out)} query groups with SERP data; dropped {dict(dropped)}; "
          f"{sum(1 for r in out if r['reach_now'] <= 5)} reachable top-5 on content alone")


def vocab_ours(domain: str) -> bool:
    return domain == config.OUR_DOMAIN or domain.endswith("." + config.OUR_DOMAIN)


def _bulk_ranks(ctx, domains: list[str]) -> dict[str, int]:
    out: dict[str, int] = {}
    targets = [d.removeprefix("www.") for d in domains] + [config.OUR_DOMAIN]
    for i in range(0, len(targets), 1000):
        batch = targets[i:i + 1000]
        result = ctx.client.live("/v3/backlinks/bulk_ranks/live", {"targets": batch},
                                 config.COST["backlinks_task"] + len(batch) * config.COST["backlinks_row"])
        for item in (result or {}).get("items") or []:
            out[item.get("target")] = item.get("rank") or 0
    return {d: out.get(d.removeprefix("www."), 0) for d in domains} | {config.OUR_DOMAIN: out.get(config.OUR_DOMAIN, 0)}
