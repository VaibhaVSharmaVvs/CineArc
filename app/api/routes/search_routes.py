"""
API routes for TV show search via OMDb.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

import httpx

from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
async def search_shows(q: str = Query(..., min_length=1, description="Search query")):
    """Search for TV series on OMDb. Returns top 5 results."""
    params = {
        "apikey": settings.OMDB_API_KEY,
        "s": q,
        "type": "series",
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                settings.OMDB_BASE_URL,
                params=params,
                timeout=settings.REQUEST_TIMEOUT_SECONDS,
            )
            resp.raise_for_status()
            body = resp.json()

        if body.get("Response") == "False":
            return {"results": []}

        raw_results = body.get("Search", [])[:5]
        results = [
            {
                "title": item.get("Title", ""),
                "year": item.get("Year", ""),
                "poster": item.get("Poster", "N/A"),
                "imdb_id": item.get("imdbID", ""),
            }
            for item in raw_results
        ]
        return {"results": results}

    except Exception as exc:
        logger.exception("Search failed for query: %s", q)
        raise HTTPException(status_code=500, detail=f"Search failed: {exc}")
