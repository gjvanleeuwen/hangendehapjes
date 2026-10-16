"""Our side: indexable pages (from the live sitemap), keyword → page mapping, GSC.

Read-only and public: pages come from hangendehapjes.nl/sitemap.xml (NL only),
Search Console data from the newest data/gsc/*.json written by `bun run gsc:pull`.
"""

from __future__ import annotations

import json
import logging
import re
from functools import lru_cache

import config
import httpx
import vocab

log = logging.getLogger(__name__)


def sitemap_urls() -> list[str]:
    resp = httpx.get(f"{config.SITE_URL}/sitemap.xml", timeout=30, headers={"User-Agent": config.USER_AGENT})
    resp.raise_for_status()
    return re.findall(r"<loc>([^<]+)</loc>", resp.text)


@lru_cache
def our_pages() -> dict[str, str]:
    """page key (path without leading slash, "" = homepage) → URL. NL pages only; /en and /terms skipped."""
    try:
        urls = sitemap_urls()
    except httpx.HTTPError as exc:
        log.warning("sitemap unavailable (%s): using PAGE_TARGETS keys", exc)
        urls = [f"{config.SITE_URL}/{k}".rstrip("/") + ("/" if not k else "") for k in config.PAGE_TARGETS]
    pages = {}
    for url in urls:
        path = url.removeprefix(config.SITE_URL).strip("/")
        if path == "en" or path.startswith("en/") or path == "terms":
            continue
        pages[path] = url
    return pages


def page_for(product: str | None, occasion: str | None, place: str | None, kind: str,
             indexable: set[str]) -> str | None:
    """The existing page a keyword maps onto, if any. Hand rules, mirrors PAGE_TARGETS."""
    def has(key: str) -> str | None:
        return key if key in indexable else None

    if place and place in config.NEAR_PLACES:
        return has("catering/hilversum")
    if place:
        return None  # a place we don't have a page for
    if product == "tiramisu":
        return has("blog/tiramisu-bruiloft")
    if product == "millefoglie":
        return has("blog/italiaanse-bruidstaart")
    if product == "bruidstaart":
        return has("blog/bruidstaart")
    if product == "burrata":
        return has("blog/burrata-catering")
    if product in ("hapjes", None) and kind == "answer" and occasion != "bruiloft":
        return has("blog/hoeveel-hapjes-per-persoon")
    if product in ("hapjes", "live", "catering", "dessert") or occasion:
        return has("")  # the homepage is our only service page today
    return None


# --- Search Console -------------------------------------------------------------------

@lru_cache
def gsc() -> dict[str, dict]:
    """normalised query → {position, impressions, clicks, page} from the newest GSC pull.
    Position is GSC's impression-weighted average over the pulled window."""
    files = sorted(config.GSC_DIR.glob("gsc-*.json"))
    if not files:
        log.warning("no GSC data in %s: run `bun run gsc:pull`", config.GSC_DIR)
        return {}
    data = json.loads(files[-1].read_text())
    out: dict[str, dict] = {}
    for r in data.get("queries", []):
        out[vocab.normalize(r["query"])] = {"position": r["position"], "impressions": r["impressions"],
                                            "clicks": r["clicks"], "page": None}
    best_page: dict[str, tuple[int, str]] = {}
    for r in data.get("queryPage", []):
        key = vocab.normalize(r["query"])
        if r["impressions"] > best_page.get(key, (-1, ""))[0]:
            best_page[key] = (r["impressions"], r["page"].removeprefix(config.SITE_URL) or "/")
    for key, (_, page) in best_page.items():
        if key in out:
            out[key]["page"] = page
    return out


def gsc_window() -> str:
    files = sorted(config.GSC_DIR.glob("gsc-*.json"))
    if not files:
        return "none"
    d = json.loads(files[-1].read_text())
    return f"{d['start']} → {d['end']}"


def gsc_seeds(min_impressions: int) -> list[str]:
    return [r for r, v in sorted(gsc().items(), key=lambda kv: -kv[1]["impressions"])
            if v["impressions"] >= min_impressions]
