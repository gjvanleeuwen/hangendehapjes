"""Extract what matters for depth comparison from one HTML page."""

from __future__ import annotations

import json
import re
from difflib import SequenceMatcher
from statistics import median
from urllib.parse import urlsplit

from bs4 import BeautifulSoup
from vocab import normalize

_STOPWORDS = set("de het een en of van voor op in met je jullie u uw is zijn wat hoe welke "
                 "waar wanneer kan ik we wij mijn onze bij aan te om die dat er als ook "
                 "nog naar door".split())


def parse(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    robots = (soup.find("meta", attrs={"name": "robots"}) or {}).get("content", "") if soup else ""
    title = soup.title.get_text(" ", strip=True) if soup.title else ""
    description = (soup.find("meta", attrs={"name": "description"}) or {}).get("content", "")
    schema_types, faq = _json_ld(soup)
    for tag in soup(["script", "style", "noscript", "svg", "template"]):
        tag.decompose()
    main = soup.find("main") or soup.body or soup
    for tag in main.find_all(["nav", "header", "footer", "aside", "form"]):
        tag.decompose()
    text = main.get_text(" ", strip=True)
    headings = [{"level": int(h.name[1]), "text": h.get_text(" ", strip=True)}
                for h in main.find_all(["h1", "h2", "h3"]) if h.get_text(strip=True)]
    visible_q = [s.get_text(" ", strip=True) for s in main.find_all(["summary", "button", "dt"])
                 if s.get_text(strip=True).endswith("?")]
    visible_q += [h["text"] for h in headings if h["text"].endswith("?")]
    questions = list(dict.fromkeys(q for q in faq + visible_q if 8 < len(q) < 200))
    host = urlsplit(url).netloc
    links = [a.get("href", "") for a in main.find_all("a")]
    internal = sum(1 for href in links if href.startswith("/") or host in href)
    return {
        "url": url,
        "title": title,
        "description": description,
        "robots": robots,
        "noindex": "noindex" in robots.lower(),
        "words": len(re.findall(r"\w+", text)),
        "headings": headings,
        "questions": questions,
        "schema_types": sorted(schema_types),
        "prices": len(re.findall(r"€\s?\d", text)),
        "internal_links": internal,
        "outbound_links": len(links) - internal,
        "images": len(main.find_all("img")),
        "videos": len(main.find_all(["video", "iframe"])),
    }


def _json_ld(soup) -> tuple[set[str], list[str]]:
    types: set[str] = set()
    questions: list[str] = []

    def walk(node):
        if isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            kind = node.get("@type")
            for t in kind if isinstance(kind, list) else [kind]:
                if isinstance(t, str):
                    types.add(t)
            if kind == "Question" and isinstance(node.get("name"), str):
                questions.append(node["name"].strip())
            for value in node.values():
                if isinstance(value, (dict, list)):
                    walk(value)

    for script in soup.find_all("script", type="application/ld+json"):
        try:
            walk(json.loads(script.string or ""))
        except (json.JSONDecodeError, TypeError):
            continue
    return types, questions


def faq_pairs(html: str) -> list[dict]:
    """Question + answer pairs from FAQPage JSON-LD and from <details>/<summary>
    accordions (many sites, e.g. evenses, ship visible FAQs without markup)."""
    soup = BeautifulSoup(html, "html.parser")
    pairs: list[dict] = []

    def walk(node):
        if isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            if node.get("@type") == "Question" and isinstance(node.get("name"), str):
                answer = (node.get("acceptedAnswer") or {}).get("text") or ""
                pairs.append({"question": node["name"].strip(), "source": "json-ld",
                              "answer": BeautifulSoup(answer, "html.parser").get_text(" ", strip=True)})
            for value in node.values():
                if isinstance(value, (dict, list)):
                    walk(value)

    for script in soup.find_all("script", type="application/ld+json"):
        try:
            walk(json.loads(script.string or ""))
        except (json.JSONDecodeError, TypeError):
            continue
    for details in soup.find_all("details"):
        summary = details.find("summary")
        if not summary:
            continue
        question = summary.get_text(" ", strip=True)
        summary.extract()
        pairs.append({"question": question, "source": "details", "answer": details.get_text(" ", strip=True)})
    seen: set[str] = set()
    out = []
    for p in pairs:
        key = normalize(p["question"])
        if key and key not in seen and 8 < len(p["question"]) < 250:
            seen.add(key)
            out.append({**p, "answer_words": len(re.findall(r"\w+", p["answer"]))})
    return out


# --- matching ----------------------------------------------------------------------

def _content_words(text: str) -> list[str]:
    return [w for w in normalize(text).split() if w not in _STOPWORDS and len(w) > 1]


def tokens(text: str) -> set[str]:
    return set(_content_words(text))


def similarity(a: str, b: str) -> float:
    """Token overlap, or character similarity of the content words (catches
    plural/compound variants). Stopwords are dropped first so a shared
    'wat kost een ...' doesn't make two different questions look alike."""
    ta, tb = tokens(a), tokens(b)
    jaccard = len(ta & tb) / len(ta | tb) if ta and tb else 0.0
    chars = SequenceMatcher(None, " ".join(_content_words(a)), " ".join(_content_words(b))).ratio()
    return max(jaccard, chars * 0.75)


def best_match(question: str, candidates: list[str]) -> tuple[float, str | None]:
    best = (0.0, None)
    for c in candidates:
        score = similarity(question, c)
        if score > best[0]:
            best = (score, c)
    return best


def topic_clusters(pages: list[dict], min_pages: int = 3) -> list[dict]:
    """Greedy-cluster H2/H3 headings across competitor pages; keep themes that
    appear on at least `min_pages` different sites (two pages of one site count once)."""
    clusters: list[dict] = []
    for page in pages:
        for h in page["headings"]:
            if h["level"] == 1 or len(tokens(h["text"])) == 0:
                continue
            for cluster in clusters:
                if similarity(h["text"], cluster["label"]) >= 0.5:
                    cluster["pages"].add(urlsplit(page["url"]).netloc)
                    cluster["examples"].append(h["text"])
                    break
            else:
                clusters.append({"label": h["text"], "pages": {urlsplit(page["url"]).netloc}, "examples": [h["text"]]})
    keep = [c for c in clusters if len(c["pages"]) >= min_pages]
    keep.sort(key=lambda c: -len(c["pages"]))
    return [{"label": c["label"], "pages": len(c["pages"]),
             "examples": list(dict.fromkeys(c["examples"]))[:4]} for c in keep]


def depth_stats(pages: list[dict]) -> dict:
    def med(key):
        values = [p[key] if not isinstance(p[key], list) else len(p[key]) for p in pages]
        return median(values) if values else 0
    return {"words": med("words"), "questions": med("questions"), "headings": med("headings"),
            "prices": med("prices"), "images": med("images"), "pages": len(pages)}
