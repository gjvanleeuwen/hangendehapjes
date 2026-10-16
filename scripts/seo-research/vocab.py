"""Map a Dutch keyword onto our offer: product, occasion, place, kind.

kind:
- "service": catering / booking intent (someone with an event looking for a supplier)
- "answer":  a question, price or comparison query (content can win it)
- "diy":     recipe, supermarket, delivery, nutrition: never a target (the intent filter)
- "brand":   contains a competitor's brand name (never a target)
- "other":   relevant but not mappable
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

import config


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s'-]", " ", text)).strip()


_RELEVANT = re.compile(config.RELEVANT_PATTERN)
_DIY = re.compile(config.DIY_PATTERN)
_NEGATIVE = re.compile(config.NEGATIVE_PATTERN)
# "hapjes bestellen" = a tray delivered to the door (GSC: pos 6.6, 300 impressions, 0 clicks).
# "bruidstaart bestellen" / "tiramisu taart bestellen" = a buyer; those stay.
_DELIVERY = re.compile(r"\b(hapjes|hapje|borrelhapjes|fingerfood|finger food|bittergarnituur|snacks|"
                       r"tapas|buffet|amuses?)\b.*\b(bestellen|besteld|aan huis bezorgd|thuis)\b|"
                       r"\b(bestellen)\b.*\b(hapjes|borrelhapjes|fingerfood|bittergarnituur)\b")


def is_relevant(keyword: str) -> bool:
    kw = normalize(keyword)
    return bool(_RELEVANT.search(kw)) and not _NEGATIVE.search(kw)


def is_diy(keyword: str) -> bool:
    kw = normalize(keyword).replace("laten maken", "laten_maken")
    return bool(_DIY.search(kw) or _DELIVERY.search(kw))


def _phrase_index(mapping: dict[str, list[str]]) -> list[tuple[re.Pattern, str]]:
    """Longest alias first, so 'klassieke bruidstaart' wins over 'bruidstaart'."""
    pairs = [(normalize(alias), key) for key, aliases in mapping.items() for alias in aliases]
    pairs.sort(key=lambda p: -len(p[0]))
    return [(re.compile(rf"(?<!\w){re.escape(alias)}(?!\w)"), key) for alias, key in pairs]


_PRODUCTS = _phrase_index(config.PRODUCTS)
_OCCASIONS = _phrase_index(config.OCCASIONS)
_PLACES = _phrase_index({p: [p] for p in config.PLACES + config.PROVINCES})
_BRANDS: list[str] = []


def set_brands(domains: list[str]) -> None:
    """Brand tokens from ranking domains ('hapjesaanhuis' from www.hapjesaanhuis.nl).
    Generic words that happen to be a domain ('catering', 'bruidstaart') are not brands."""
    generic = {normalize(a).replace(" ", "") for aliases in config.PRODUCTS.values() for a in aliases}
    generic |= {"cateringhilversum", "bruidstaarten", "trouwen", "bruiloft", "hapjes"}
    tokens = set()
    for d in domains:
        host = d.removeprefix("www.").split(".")[0].replace("-", "")
        if len(host) >= 6 and host != config.OUR_DOMAIN.split(".")[0] and host not in generic:
            tokens.add(host)
    _BRANDS[:] = sorted(tokens)


def _first(index: list[tuple[re.Pattern, str]], text: str) -> str | None:
    for pattern, key in index:
        if pattern.search(text):
            return key
    return None


@dataclass(frozen=True)
class Mapping:
    product: str | None
    occasion: str | None
    place: str | None
    kind: str

    @property
    def cluster(self) -> str:
        parts = [f"{name}:{value}" for name, value in
                 (("product", self.product), ("occasion", self.occasion), ("place", self.place)) if value]
        return f"{self.kind}|" + ("|".join(parts) or "generic")


def classify(keyword: str) -> Mapping:
    kw = normalize(keyword)
    compact = kw.replace(" ", "").replace("-", "")
    product, occasion, place = _first(_PRODUCTS, kw), _first(_OCCASIONS, kw), _first(_PLACES, kw)
    words = kw.split()
    if any(b in compact for b in _BRANDS):
        kind = "brand"
    elif is_diy(kw):
        kind = "diy"
    elif (words and words[0] in config.QUESTION_WORDS) or kw.endswith("?") \
            or any(re.search(rf"\b{w}\b", kw) for w in config.PRICE_WORDS) \
            or re.search(r"\b\w+ of \w+\b", kw) or re.search(r"\b(tips|checklist|ideeen|ideeën|vs|inspiratie)\b", kw):
        kind = "answer"
    elif product or occasion or place:
        kind = "service"
    else:
        kind = "other"
    return Mapping(product, occasion, place, kind)
