"""
OMDb API integration — async episode fetching with retry & concurrency.
"""

from __future__ import annotations

import asyncio
import re
from typing import Any

import httpx

from app.core.config import settings
from app.core.logging import logger
from app.models.schemas import Episode
from app.services import cache_service

# ── Helpers ──────────────────────────────────────────────────────────────────

_RUNTIME_RE = re.compile(r"(\d+)")


def _parse_runtime(raw: str | None) -> int:
    """Extract integer minutes from strings like '47 min'. Returns 0 on failure."""
    if not raw:
        return 0
    m = _RUNTIME_RE.search(raw)
    return int(m.group(1)) if m else 0


def _normalize_episode(data: dict[str, Any], season: int, ep_num: int) -> Episode | None:
    """Convert a raw OMDb episode response into our normalized Episode model.

    Returns None if the episode has no valid rating.
    """
    rating_raw = data.get("imdbRating", "N/A")
    if rating_raw in ("N/A", None, ""):
        return None

    try:
        rating = float(rating_raw)
    except (ValueError, TypeError):
        return None

    return Episode(
        title=data.get("Title", f"Episode {ep_num}"),
        season=season,
        episode=ep_num,
        runtime=_parse_runtime(data.get("Runtime")),
        description=data.get("Plot", ""),
        rating=rating,
    )


# ── Low-level fetch with retry ──────────────────────────────────────────────

async def _fetch_episode(
    client: httpx.AsyncClient,
    show: str,
    season: int,
    episode: int,
) -> dict[str, Any] | None:
    """Fetch a single episode from OMDb with basic retry logic."""
    params = {
        "apikey": settings.OMDB_API_KEY,
        "t": show,
        "Season": season,
        "Episode": episode,
        "plot": "short",
    }
    last_exc: Exception | None = None
    for attempt in range(1, settings.MAX_RETRIES + 1):
        try:
            resp = await client.get(settings.OMDB_BASE_URL, params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)
            resp.raise_for_status()
            body = resp.json()
            if body.get("Response") == "False":
                logger.debug("OMDb returned Response=False for %s S%02dE%02d: %s",
                             show, season, episode, body.get("Error"))
                return None
            return body
        except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException) as exc:
            last_exc = exc
            wait = 0.5 * attempt
            logger.warning("Attempt %d/%d failed for %s S%02dE%02d — %s. Retrying in %.1fs…",
                           attempt, settings.MAX_RETRIES, show, season, episode, exc, wait)
            await asyncio.sleep(wait)

    logger.error("All retries exhausted for %s S%02dE%02d: %s", show, season, episode, last_exc)
    return None


# ── Season-level fetch ───────────────────────────────────────────────────────

async def _get_season_episode_count(client: httpx.AsyncClient, show: str, season: int) -> int:
    """Query OMDb for the number of episodes in a given season."""
    params = {
        "apikey": settings.OMDB_API_KEY,
        "t": show,
        "Season": season,
    }
    try:
        resp = await client.get(settings.OMDB_BASE_URL, params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        body = resp.json()
        if body.get("Response") == "False":
            return 0
        episodes_list = body.get("Episodes", [])
        return len(episodes_list)
    except Exception:
        logger.exception("Failed to get season episode count for %s S%d", show, season)
        return 0


async def _get_total_seasons(client: httpx.AsyncClient, show: str) -> int:
    """Determine how many seasons a show has via OMDb search."""
    params = {
        "apikey": settings.OMDB_API_KEY,
        "t": show,
        "type": "series",
    }
    try:
        resp = await client.get(settings.OMDB_BASE_URL, params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        body = resp.json()
        if body.get("Response") == "False":
            return 0
        return int(body.get("totalSeasons", 0))
    except Exception:
        logger.exception("Failed to get total seasons for %s", show)
        return 0


async def fetch_season_episodes(show: str, season: int) -> list[dict]:
    """Fetch all episodes for a single season concurrently.

    Returns a list of normalized episode dicts sorted by episode number.
    """
    async with httpx.AsyncClient() as client:
        ep_count = await _get_season_episode_count(client, show, season)
        if ep_count == 0:
            logger.warning("No episodes found for %s S%d", show, season)
            return []

        logger.info("Fetching %d episodes for %s S%d…", ep_count, show, season)
        tasks = [_fetch_episode(client, show, season, ep) for ep in range(1, ep_count + 1)]
        raw_results = await asyncio.gather(*tasks)

    episodes: list[Episode] = []
    for idx, raw in enumerate(raw_results, start=1):
        if raw is None:
            continue
        ep = _normalize_episode(raw, season, idx)
        if ep is not None:
            episodes.append(ep)

    episodes.sort(key=lambda e: e.episode)
    logger.info("Normalized %d valid episodes for %s S%d", len(episodes), show, season)
    return [ep.model_dump() for ep in episodes]


async def fetch_series_episodes(show: str, _season: int | None = None) -> list[dict]:
    """Fetch all episodes across every season of a series."""
    async with httpx.AsyncClient() as client:
        total_seasons = await _get_total_seasons(client, show)
        if total_seasons == 0:
            logger.warning("Could not determine season count for %s", show)
            return []

    all_episodes: list[dict] = []
    for s in range(1, total_seasons + 1):
        season_eps = await fetch_season_episodes(show, s)
        all_episodes.extend(season_eps)

    logger.info("Total episodes fetched for %s (all seasons): %d", show, len(all_episodes))
    return all_episodes


# ── Public API ───────────────────────────────────────────────────────────────

async def get_episodes(show: str, season: int | None, pool_type: str) -> list[dict]:
    """Get episodes with cache-aware logic.

    1. If cached & fresh → return immediately.
    2. If cached & stale → return stale, kick off background refresh.
    3. If not cached → fetch, cache, return.
    """
    cache_season = season if pool_type == "season" else None

    cached = cache_service.get_cached(show, cache_season)

    if cached is not None:
        if cache_service.is_expired(show, cache_season):
            # Serve stale, refresh in background
            fetch_fn = fetch_season_episodes if pool_type == "season" else fetch_series_episodes
            await cache_service.refresh_in_background(show, cache_season, fetch_fn)
        return cached

    # Not cached — must fetch now
    if pool_type == "season":
        if season is None:
            raise ValueError("season is required when pool_type is 'season'")
        data = await fetch_season_episodes(show, season)
    else:
        data = await fetch_series_episodes(show)

    cache_service.set_cached(show, cache_season, data)
    return data
