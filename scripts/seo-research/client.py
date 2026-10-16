"""DataForSEO client: the only module that spends money.

- Every task result is cached on disk (keyed by endpoint + payload), so re-runs
  and re-analysis are free; `refresh=True` bypasses the cache.
- Every paid call is logged to output/costs.csv with the cost the API reports.
- A per-invocation budget cap aborts *before* the call that would cross it.
- `sandbox` talks to sandbox.dataforseo.com (free dummy data, separate cache).
"""

from __future__ import annotations

import base64
import csv
import hashlib
import json
import logging
import os
import time
from datetime import UTC, datetime
from pathlib import Path

import config
import httpx

log = logging.getLogger(__name__)


class BudgetExceeded(RuntimeError):
    pass


def load_credentials() -> tuple[str, str]:
    login, password = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and password) and config.ENV_FILE.exists():
        for line in config.ENV_FILE.read_text().splitlines():
            key, _, value = line.partition("=")
            value = value.strip().strip("'\"")
            if key.strip() == "DATAFORSEO_LOGIN" and not login:
                login = value
            elif key.strip() == "DATAFORSEO_PASSWORD" and not password:
                password = value
    if not (login and password):
        raise SystemExit(
            "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing: set them in the environment "
            f"or in {config.ENV_FILE}"
        )
    return login, password


class DataForSEO:
    def __init__(self, *, max_spend: float, sandbox: bool = False, refresh: bool = False):
        self.max_spend = max_spend
        self.sandbox = sandbox
        self.refresh = refresh
        self.spent = 0.0
        self.calls = 0
        base = "https://sandbox.dataforseo.com" if sandbox else "https://api.dataforseo.com"
        self.cache_dir = config.OUTPUT / ("raw-sandbox" if sandbox else "raw")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cost_log = config.OUTPUT / ("costs-sandbox.csv" if sandbox else "costs.csv")
        login, password = load_credentials()
        token = base64.b64encode(f"{login}:{password}".encode()).decode()
        self.http = httpx.Client(
            base_url=base, timeout=180,
            headers={"Authorization": f"Basic {token}", "Content-Type": "application/json"},
        )

    # --- public API ---------------------------------------------------------------

    def get(self, path: str) -> dict:
        """Free GET (appendix, task_get, tasks_ready). Not cached."""
        return self._send("GET", path)

    def live(self, path: str, payload: dict, estimate: float, whole: bool = False):
        """One Live task. Returns the task's result[0] (None when empty), or the whole
        result list with `whole=True` (endpoints that return one item per keyword)."""
        key = self._key(path + ("#whole" if whole else ""), payload)
        cached = self._read_cache(key)
        if cached is not None:
            return cached
        self._reserve(estimate, path)
        body = self._send("POST", path, [payload])
        task = self._task(body, path)
        self._log_cost(path, payload, task.get("cost", 0.0))
        result = task.get("result") if whole else (task.get("result") or [None])[0]
        self._write_cache(key, result)
        return result

    def serp(self, keywords: list[str], depth: int, engine: str = "organic",
             coordinate: str | None = None) -> dict[str, dict | None]:
        """Google organic or Maps SERPs via the standard queue (cheapest). Pending task ids
        are kept on disk, so an interrupted run resumes without paying twice.
        `coordinate` ("lat,lng,zoom") localises the search instead of the whole country."""
        path = f"/v3/serp/google/{engine}/task_post"
        params = {"language_code": config.LANGUAGE_CODE, "depth": depth}
        if coordinate:
            params["location_coordinate"] = coordinate
        else:
            params["location_code"] = config.LOCATION_CODE
        if engine == "organic":
            params["device"] = "desktop"
        cache_ns = "serp" if engine == "organic" else f"serp-{engine}"
        # Billed per started page of 10 results (standard queue).
        unit = config.COST["serp_task"] * max(1, -(-depth // 10))
        out: dict[str, dict | None] = {}
        missing = []
        for kw in dict.fromkeys(keywords):
            cached = self._read_cache(self._key(cache_ns, {"keyword": kw, **params}))
            if cached is not None:
                out[kw] = cached
            else:
                missing.append(kw)
        pending_file = self.cache_dir / f"{cache_ns}_pending.json"
        pending: dict[str, str] = json.loads(pending_file.read_text()) if pending_file.exists() else {}
        tag = json.dumps(params, sort_keys=True)
        pkey = lambda kw: f"{kw}\x00{tag}"  # noqa: E731  (same keyword, other location = other task)
        to_post = [kw for kw in missing if pkey(kw) not in pending]
        for i in range(0, len(to_post), 100):
            batch = to_post[i:i + 100]
            self._reserve(unit * len(batch), path)
            body = self._send("POST", path, [{"keyword": kw, "tag": kw, **params} for kw in batch])
            for task in body.get("tasks") or []:
                kw = (task.get("data") or {}).get("keyword")
                if task.get("status_code") == 20100 and kw:
                    pending[pkey(kw)] = task["id"]
                    self._log_cost(path, {"keyword": kw}, task.get("cost", 0.0))
                else:
                    log.warning("SERP task_post failed for %r: %s", kw, task.get("status_message"))
            pending_file.write_text(json.dumps(pending, ensure_ascii=False, indent=1))
        waiting = {kw: pending[pkey(kw)] for kw in missing if pkey(kw) in pending}
        deadline = time.monotonic() + 30 * 60
        while waiting and time.monotonic() < deadline:
            for kw, tid in list(waiting.items()):
                body = self._send("GET", f"/v3/serp/google/{engine}/task_get/advanced/{tid}")
                task = (body.get("tasks") or [{}])[0]
                code = task.get("status_code")
                if code == 20000:
                    result = (task.get("result") or [None])[0]
                    self._write_cache(self._key(cache_ns, {"keyword": kw, **params}), result)
                    out[kw] = result
                elif code in (40601, 40602):  # task handed / in queue
                    continue
                else:
                    log.warning("SERP task %s for %r: %s %s", tid, kw, code, task.get("status_message"))
                    out[kw] = None
                del waiting[kw]
                pending.pop(pkey(kw), None)
            pending_file.write_text(json.dumps(pending, ensure_ascii=False, indent=1))
            if waiting:
                log.info("waiting for %d SERP tasks…", len(waiting))
                time.sleep(15)
        if waiting:
            log.warning("%d SERP tasks still pending; re-run the serp step later to collect them",
                        len(waiting))
        return out

    def summary(self) -> str:
        return f"{self.calls} paid calls, spent ${self.spent:.4f} (cap ${self.max_spend:.2f})"

    # --- internals ------------------------------------------------------------------

    def _reserve(self, estimate: float, path: str) -> None:
        """Raises before a call that would cross the cap."""
        self.calls += 1
        if self.spent + estimate > self.max_spend:
            raise BudgetExceeded(
                f"{path}: next call (~${estimate:.3f}) would exceed --max-spend "
                f"${self.max_spend:.2f} (spent ${self.spent:.4f}). Cached results are kept; "
                "re-run with a higher cap to continue."
            )

    def _send(self, method: str, path: str, payload: list | None = None) -> dict:
        for attempt in range(4):
            try:
                resp = self.http.request(method, path, json=payload)
                if resp.status_code in (429, 500, 502, 503, 504):
                    raise httpx.HTTPStatusError("retryable", request=resp.request, response=resp)
                resp.raise_for_status()
                body = resp.json()
                if body.get("status_code", 20000) >= 50000:
                    raise httpx.HTTPError(f"API error {body.get('status_message')}")
                if body.get("status_code") != 20000:
                    raise SystemExit(f"{path}: {body.get('status_code')} {body.get('status_message')}")
                return body
            except (httpx.TransportError, httpx.HTTPStatusError, httpx.HTTPError) as exc:
                if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code in (401, 402, 403):
                    raise SystemExit(f"{path}: HTTP {exc.response.status_code} {_api_message(exc.response)} "
                                     "(40200 = balance not spendable, 40203 = daily limit; cached work is kept)")
                if attempt == 3:
                    raise
                wait = 2 ** attempt * 5
                log.warning("%s %s failed (%s), retrying in %ss", method, path, exc, wait)
                time.sleep(wait)
        raise AssertionError("unreachable")

    def _task(self, body: dict, path: str) -> dict:
        task = (body.get("tasks") or [{}])[0]
        if task.get("status_code") != 20000:
            log.warning("%s: task %s %s", path, task.get("status_code"), task.get("status_message"))
        return task

    @staticmethod
    def _key(path: str, payload: dict) -> str:
        return hashlib.sha256((path + json.dumps(payload, sort_keys=True)).encode()).hexdigest()[:40]

    def _read_cache(self, key: str):
        if self.refresh:
            return None
        file = self.cache_dir / f"{key}.json"
        return json.loads(file.read_text()) if file.exists() else None

    def _write_cache(self, key: str, result) -> None:
        if result is not None:
            (self.cache_dir / f"{key}.json").write_text(json.dumps(result, ensure_ascii=False))

    def _log_cost(self, path: str, payload: dict, cost: float) -> None:
        self.spent += cost or 0.0
        new = not self.cost_log.exists()
        with self.cost_log.open("a", newline="") as f:
            writer = csv.writer(f)
            if new:
                writer.writerow(["timestamp", "endpoint", "payload", "cost_usd"])
            summary = payload.get("keyword") or payload.get("target") or ",".join(payload.get("keywords", [])[:3])
            writer.writerow([datetime.now(UTC).isoformat(timespec="seconds"), path,
                             str(summary)[:80], f"{cost or 0:.6f}"])


def _api_message(resp: httpx.Response) -> str:
    """The task-level code + message DataForSEO puts in an error body."""
    try:
        task = (resp.json().get("tasks") or [{}])[0]
        return f"{task.get('status_code')} {task.get('status_message')}"
    except ValueError:
        return resp.text[:200]


def read_costs(sandbox: bool = False) -> list[dict]:
    file = config.OUTPUT / ("costs-sandbox.csv" if sandbox else "costs.csv")
    if not file.exists():
        return []
    with file.open() as f:
        return list(csv.DictReader(f))


def path_for_run(run: str) -> Path:
    path = config.OUTPUT / run
    path.mkdir(parents=True, exist_ok=True)
    return path
