"""Polite HTTP: robots.txt respected, one request per `delay` seconds per host,
every response cached on disk so re-runs and parser tweaks cost no traffic."""

from __future__ import annotations

import gzip
import hashlib
import re
import threading
import time
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit

import httpx

USER_AGENT = (
    "Mozilla/5.0 (compatible; HangendeHapjesSeoResearch/0.1; +https://hangendehapjes.nl)"
)
CACHE_DIR = Path(__file__).parent / ".cache"
DEAD_HOST = "\x00dead-host"


class Fetcher:
    def __init__(
        self,
        delay: float = 1.0,
        refresh: bool = False,
        cache_dir: Path = CACHE_DIR,
        user_agent: str = USER_AGENT,
    ):
        self.delay = delay
        self.refresh = refresh
        self.cache_dir = cache_dir
        self._last: dict[str, float] = {}
        self._locks: defaultdict[str, threading.Lock] = defaultdict(threading.Lock)
        self._robots: dict[str, list[tuple[bool, re.Pattern, int]]] = {}
        self.client = httpx.Client(
            headers={"User-Agent": user_agent, "Accept-Language": "nl,en;q=0.8"},
            follow_redirects=True,
            timeout=30,
        )
        cache_dir.mkdir(parents=True, exist_ok=True)

    def allowed(self, url: str) -> bool:
        parts = urlsplit(url)
        host = f"{parts.scheme}://{parts.netloc}"
        rules = self._robots.get(host)
        if rules is None:
            try:
                rules = parse_robots(self._get(f"{host}/robots.txt", check_robots=False))
            except httpx.HTTPError:
                rules = []  # unreachable robots.txt → treat as allow-all
            self._robots[host] = rules
        path = parts.path or "/"
        if parts.query:
            path += "?" + parts.query
        return robots_allows(rules, path)

    def get(self, url: str) -> str:
        """Fetch text (gunzips .gz sitemaps). Raises PermissionError if robots
        disallows, httpx.HTTPError on network/HTTP failure."""
        return self._get(url, check_robots=True)

    def post(self, url: str, data: dict) -> str:
        """For WordPress admin-ajax style listings. Cached by url+body."""
        key = url + "?" + "&".join(f"{k}={v}" for k, v in sorted(data.items()))
        cached = self._cache_path(key)
        if cached.exists() and not self.refresh:
            return cached.read_text()
        if not self.allowed(url):
            raise PermissionError(f"robots.txt disallows {url}")
        self._wait(url)
        resp = self.client.post(url, data=data)
        resp.raise_for_status()
        cached.write_text(resp.text)
        return resp.text

    def _get(self, url: str, check_robots: bool) -> str:
        cached = self._cache_path(url)
        if cached.exists() and not self.refresh:
            text = cached.read_text()
            if text == DEAD_HOST:
                raise httpx.ConnectError(f"{url}: host unreachable (cached)")
            return text
        if check_robots and not self.allowed(url):
            raise PermissionError(f"robots.txt disallows {url}")
        self._wait(url)
        try:
            resp = self.client.get(url)
        except httpx.ConnectError:
            # Remember dead hosts (mostly guessed domains) so re-runs skip them.
            cached.write_text(DEAD_HOST)
            raise
        resp.raise_for_status()
        body = resp.content
        if url.endswith(".gz") and body[:2] == b"\x1f\x8b":
            body = gzip.decompress(body)
        text = body.decode(resp.encoding or "utf-8", errors="replace")
        cached.write_text(text)
        return text

    def _wait(self, url: str) -> None:
        host = urlsplit(url).netloc
        # Per-host lock: enrichment threads can share a host (linktr.ee etc.).
        with self._locks[host]:
            elapsed = time.monotonic() - self._last.get(host, 0.0)
            if elapsed < self.delay:
                time.sleep(self.delay - elapsed)
            self._last[host] = time.monotonic()

    def _cache_path(self, key: str) -> Path:
        return self.cache_dir / hashlib.sha256(key.encode()).hexdigest()[:32]


def parse_robots(text: str) -> list[tuple[bool, re.Pattern, int]]:
    """Rules for `User-agent: *` as (allow, pattern, specificity). Supports the
    `*` and `$` wildcards Google honours; urllib.robotparser does not."""
    rules, in_star, prev_was_agent = [], False, False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        key, value = (x.strip() for x in line.split(":", 1))
        key = key.lower()
        if key == "user-agent":
            # Consecutive User-agent lines share one group.
            in_star = (in_star and prev_was_agent) or value == "*"
            prev_was_agent = True
            continue
        prev_was_agent = False
        if in_star and key in ("allow", "disallow") and value:
            regex = re.escape(value).replace(r"\*", ".*")
            if regex.endswith(r"\$"):
                regex = regex[:-2] + "$"
            rules.append((key == "allow", re.compile(regex), len(value)))
    return rules


def robots_allows(rules: list[tuple[bool, re.Pattern, int]], path: str) -> bool:
    """Longest matching rule wins; Allow wins a tie."""
    best: tuple[int, bool] | None = None
    for allow, pattern, length in rules:
        if pattern.match(path) and (best is None or (length, allow) > best):
            best = (length, allow)
    return True if best is None else best[1]
