"""
In-memory cache with TTL support and background refresh capability.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Callable, Coroutine

from app.core.config import settings
from app.core.logging import logger

# ── Cache Store ──────────────────────────────────────────────────────────────
# Structure: { key: { "data": Any, "timestamp": float } }
CACHE: dict[str, dict[str, Any]] = {}

# Track in-flight refresh tasks to avoid duplicate work
_refresh_locks: dict[str, bool] = {}


def _make_key(show: str, season: int | None) -> str:
    """Generate a deterministic cache key from show + optional season."""
    slug = show.strip().lower().replace(" ", "_")
    if season is not None:
        return f"{slug}_s{season}"
    return f"{slug}_all"


def get_cached(show: str, season: int | None = None) -> list[dict] | None:
    """Return cached data if present and not expired. Returns None otherwise."""
    key = _make_key(show, season)
    entry = CACHE.get(key)
    if entry is None:
        return None
    age = time.time() - entry["timestamp"]
    if age < settings.CACHE_TTL_SECONDS:
        logger.debug("Cache HIT (fresh) for key=%s  age=%.0fs", key, age)
        return entry["data"]
    # Expired but still present — caller should trigger background refresh
    logger.debug("Cache HIT (stale) for key=%s  age=%.0fs", key, age)
    return entry["data"]


def is_expired(show: str, season: int | None = None) -> bool:
    """Check whether the cache entry is expired (or missing)."""
    key = _make_key(show, season)
    entry = CACHE.get(key)
    if entry is None:
        return True
    return (time.time() - entry["timestamp"]) >= settings.CACHE_TTL_SECONDS


def set_cached(show: str, season: int | None, data: list[dict]) -> None:
    """Store data in cache with a fresh timestamp."""
    key = _make_key(show, season)
    CACHE[key] = {"data": data, "timestamp": time.time()}
    logger.info("Cache SET for key=%s  episodes=%d", key, len(data))


async def refresh_in_background(
    show: str,
    season: int | None,
    fetch_fn: Callable[..., Coroutine],
) -> None:
    """Trigger a background refresh if one is not already running."""
    key = _make_key(show, season)
    if _refresh_locks.get(key):
        logger.debug("Background refresh already in-flight for key=%s", key)
        return

    _refresh_locks[key] = True
    logger.info("Starting background cache refresh for key=%s", key)

    async def _do_refresh() -> None:
        try:
            data = await fetch_fn(show, season)
            set_cached(show, season, data)
            logger.info("Background refresh completed for key=%s", key)
        except Exception:
            logger.exception("Background refresh FAILED for key=%s", key)
        finally:
            _refresh_locks.pop(key, None)

    asyncio.create_task(_do_refresh())
