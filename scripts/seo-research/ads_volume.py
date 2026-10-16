"""Cross-check Labs volumes against Google Ads Keyword Planner volumes for the core terms.

    uv run scripts/seo-research/research.py ads_volume --run <run>

Labs reports 0 for several local terms that Search Console shows real impressions for
("catering hilversum"), so the core list gets one Keyword Planner call (~$0.075 for up to
1,000 keywords). Output: ads_volume.json/.csv in the run directory.
"""

from __future__ import annotations

import config
import our_site
import vocab

CORE = [
    # live / hapjes concept
    "hapjes catering", "luxe hapjes", "hapjes bruiloft", "hapjes receptie", "hapjes op locatie",
    "italiaanse hapjes catering", "borrelhapjes catering", "fingerfood catering", "live cooking",
    "live cooking catering", "live cooking bruiloft", "walking dinner", "walking dinner bruiloft",
    "food entertainment", "walking act", "eetbare act", "live catering", "catering op locatie",
    "catering bruiloft", "catering receptie", "catering bedrijfsfeest", "event catering", "catering feest",
    "foodtruck bruiloft", "dessertbuffet", "dessert catering", "burrata bar", "burrata catering",
    "originele catering", "catering idee bruiloft", "bijzondere catering bruiloft",
    # bruidstaart
    "bruidstaart", "klassieke bruidstaart", "bruidstaart klassiek", "bruidstaart bestellen",
    "bruidstaart op maat", "wat kost een bruidstaart", "prijs bruidstaart", "bruidstaart prijs",
    "bruidstaart 50 personen", "bruidstaart 100 personen", "bruidstaart 25 personen",
    "bruidstaart proeven", "bruidstaart proeverij", "moderne bruidstaart", "naked cake bruiloft",
    "bruidstaart hilversum", "bruidstaart utrecht", "bruidstaart amsterdam", "bruidstaart het gooi",
    # protect
    "tiramisu bruiloft", "tiramisu bruidstaart", "tiramisu taart bestellen", "tiramisu toren",
    "millefoglie", "millefoglie bruidstaart", "italiaanse bruidstaart",
    # local
    "catering hilversum", "cateraar hilversum", "catering het gooi", "catering bussum", "catering laren",
    "catering huizen", "catering naarden", "catering baarn", "catering soest", "catering blaricum",
    "catering amersfoort", "catering utrecht", "catering amsterdam", "bedrijfsfeest hilversum",
    "personeelsfeest hilversum", "hapjes catering hilversum", "trouwen hilversum", "trouwlocatie hilversum",
    # questions
    "hoeveel hapjes per persoon", "wat kost catering per persoon", "wat kost catering bruiloft",
    "catering bruiloft kosten", "catering bruiloft 50 personen", "catering bruiloft 100 personen",
]


def ads_volume(ctx) -> None:
    result = ctx.client.live(
        "/v3/keywords_data/google_ads/search_volume/live",
        {"keywords": CORE, "location_code": config.LOCATION_CODE, "language_code": config.LANGUAGE_CODE},
        0.08, whole=True)
    items = result or []
    labs = {vocab.normalize(r["keyword"]): r["volume"] for r in ctx.load("keywords", required=False) or []}
    gsc = our_site.gsc()
    rows = []
    for it in items:
        kw = it.get("keyword")
        if not kw:
            continue
        g = gsc.get(vocab.normalize(kw)) or {}
        rows.append({"keyword": kw, "ads_volume": it.get("search_volume"), "competition": it.get("competition"),
                     "cpc": it.get("cpc"), "labs_volume": labs.get(vocab.normalize(kw)),
                     "gsc_pos": g.get("position"), "gsc_impr": g.get("impressions"),
                     "monthly": [[m["year"], m["month"], m.get("search_volume")] for m in it.get("monthly_searches") or []]})
    rows.sort(key=lambda r: -(r["ads_volume"] or 0))
    ctx.save("ads_volume", rows)
    # Merge into the keyword universe: Keyword Planner wins where Labs is missing or lower.
    universe = ctx.load("keywords", required=False)
    if universe is not None:
        by_kw = {vocab.normalize(r["keyword"]): r for r in universe}
        added = 0
        for r in rows:
            vol = r["ads_volume"] or 0
            key = vocab.normalize(r["keyword"])
            if key in by_kw:
                by_kw[key]["volume"] = max(by_kw[key]["volume"] or 0, vol)
            elif vol >= config.MIN_VOLUME and vocab.is_relevant(r["keyword"]):
                row = {"keyword": r["keyword"], "volume": vol, "cpc": r["cpc"], "competition": r["competition"],
                       "kd": None, "intent": None, "monthly": r["monthly"], "seeds": ["ads"]}
                m = vocab.classify(r["keyword"])
                g = our_site.gsc().get(key) or {}
                row.update(product=m.product, occasion=m.occasion, place=m.place, kind=m.kind, cluster=m.cluster,
                           gsc_pos=g.get("position"), gsc_impr=g.get("impressions"), gsc_clicks=g.get("clicks"),
                           gsc_page=g.get("page"))
                universe.append(row)
                added += 1
        universe.sort(key=lambda r: -r["volume"])
        ctx.save("keywords", universe)
        print(f"  merged into keywords.json: {added} new keywords, volumes raised where Ads > Labs")
    ctx.csv("ads_volume", [{k: v for k, v in r.items() if k != "monthly"} for r in rows])
    print(f"ads_volume: {len(rows)} keywords, {sum(1 for r in rows if r['ads_volume'])} with volume")
