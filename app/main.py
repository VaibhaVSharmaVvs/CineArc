"""
IMDb Higher-or-Lower Game — FastAPI Application Entry Point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.game_routes import router as game_router
from app.api.routes.search_routes import router as search_router
from app.core.config import settings
from app.core.logging import logger

app = FastAPI(
    title="IMDb Higher or Lower",
    description=(
        "A web-based game where players guess whether the next TV episode's "
        "IMDb rating is higher or lower (binary mode) or predict the exact "
        "rating (precision mode). Powered by the OMDb API."
    ),
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(game_router)
app.include_router(search_router)


@app.get("/", tags=["Health"])
async def root():
    """Health-check / welcome endpoint."""
    return {
        "status": "ok",
        "game": "IMDb Higher or Lower",
        "docs": "/docs",
    }


@app.on_event("startup")
async def on_startup():
    if not settings.OMDB_API_KEY:
        logger.warning("⚠️  OMDB_API_KEY is not set — API calls to OMDb will fail!")
    else:
        logger.info("✅ OMDB_API_KEY loaded successfully.")
    logger.info("🚀 Server starting on %s:%d", settings.HOST, settings.PORT)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
