"""Where hangendehapjes.nl ranks: one row per tracked keyword, plus history across runs.

Built from data the run already paid for (serp.json + local.json organic), joined with
Search Console. Every dated run (YYYY-MM-DD, not sandbox-/sample-) is written to
docs/_ANALYSIS/seo/rankings.csv, which is tracked in git so the trend survives the
gitignored data/ folder. Re-running `report` for the same run replaces its rows.
"""

from __future__ import annotations

import csv
import re

import config
import our_site
import vocab

HISTORY = config.REPO / "docs" / "_ANALYSIS" / "seo" / "rankings.csv"
FIELDS = ["run", "source", "keyword", "volume", "pos", "url", "ai", "images", "gsc_pos", "gsc_impr", "gsc_clicks"]
SOURCES = {"nl": "Netherlands", "hilversum": "from Hilversum"}
_DATED = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _ours(serp: dict) -> tuple[int | None, str]:
    for o in serp.get("organic") or []:
        d = o.get("domain") or ""
        if d == config.OUR_DOMAIN or d.endswith("." + config.OUR_DOMAIN):
            return o["pos"], (o.get("url") or "").removeprefix(config.SITE_URL).split("?")[0] or "/"
    return None, ""


def _path(url: str | None) -> str:
    return (url or "").removeprefix(config.SITE_URL).split("?")[0] or "/" if url else ""


def snapshot(run: str, serp: dict, local: dict) -> list[dict]:
    gsc = our_site.gsc()
    rows = []
    for source, serps, volumes in (("nl", serp.get("serps") or {}, serp.get("volumes") or {}),
                                   ("hilversum", local.get("organic") or {}, serp.get("volumes") or {})):
        for kw, s in serps.items():
            pos, url = _ours(s)
            g = gsc.get(vocab.normalize(kw)) or {}
            rows.append({"run": run, "source": source, "keyword": kw, "volume": volumes.get(kw) or 0,
                         "pos": pos, "url": url or _path(s.get("ours_ai_url") or s.get("ours_images_url")),
                         "ai": int(bool(s.get("ours_in_ai"))), "images": s.get("ours_images") or 0,
                         "gsc_pos": round(g["position"], 1) if g.get("position") else None,
                         "gsc_impr": g.get("impressions"), "gsc_clicks": g.get("clicks")})
    return rows


def _read() -> list[dict]:
    if not HISTORY.exists():
        return []
    with HISTORY.open() as f:
        out = []
        for r in csv.DictReader(f):
            for k in ("volume", "pos", "ai", "images", "gsc_impr", "gsc_clicks"):
                r[k] = int(r[k]) if r.get(k) else None
            r["gsc_pos"] = float(r["gsc_pos"]) if r["gsc_pos"] else None
            out.append(r)
        return out


def _write(rows: list[dict]) -> None:
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    rows = sorted(rows, key=lambda r: (r["run"], r["source"], -(r["volume"] or 0), r["keyword"]))
    with HISTORY.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows({k: ("" if r.get(k) is None else r[k]) for k in FIELDS} for r in rows)


def build(run: str, serp: dict, local: dict) -> dict:
    """{runs, previous, rows}: rows = this run with prev position, change and history per keyword."""
    current = snapshot(run, serp, local)
    history = [r for r in _read() if r["run"] != run]
    if _DATED.match(run) and current:
        _write(history + current)  # sandbox/sample runs are never recorded
    runs = sorted({r["run"] for r in history if r["run"] < run})
    previous = runs[-1] if runs else None
    by_key: dict[tuple[str, str], dict[str, int | None]] = {}
    for r in history:
        if r["run"] < run:
            by_key.setdefault((r["source"], r["keyword"]), {})[r["run"]] = r["pos"]
    for r in current:
        past = by_key.get((r["source"], r["keyword"]), {})
        r["history"] = [[x, past[x]] for x in runs if x in past] + [[run, r["pos"]]]
        if previous is None or previous not in past:
            r["prev"], r["change"] = None, "new" if previous else None
        else:
            prev = past[previous]
            r["prev"] = prev
            if prev is None and r["pos"] is None:
                r["change"] = None
            elif prev is None:
                r["change"] = "entered"
            elif r["pos"] is None:
                r["change"] = "dropped"
            else:
                r["change"] = prev - r["pos"]  # positive = moved up
    return {"runs": runs + [run], "previous": previous, "sources": SOURCES, "rows": current}


def summary(rows: list[dict]) -> dict[str, int]:
    nl = [r for r in rows if r["source"] == "nl"]
    pos = [r["pos"] for r in nl if r["pos"]]
    return {"tracked": len(nl), "top1": sum(p == 1 for p in pos), "top3": sum(p <= 3 for p in pos),
            "top10": sum(p <= 10 for p in pos), "top20": len(pos), "ai": sum(bool(r["ai"]) for r in nl),
            "images": sum(bool(r["images"]) for r in nl)}
