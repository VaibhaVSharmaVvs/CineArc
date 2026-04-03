"""
Application configuration loaded from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central configuration for the application."""

    OMDB_API_KEY: str = os.getenv("OMDB_API_KEY", "")
    OMDB_BASE_URL: str = "http://www.omdbapi.com/"
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", str(24 * 60 * 60)))  # 24 hours
    REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "10.0"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    PRECISION_MAX_ROUNDS: int = int(os.getenv("PRECISION_MAX_ROUNDS", "10"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))


settings = Settings()
