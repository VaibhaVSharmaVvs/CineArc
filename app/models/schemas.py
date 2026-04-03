"""
Pydantic v2 schemas for requests, responses, and internal data models.
"""

from __future__ import annotations

import uuid
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────────────────────

class GameMode(str, Enum):
    BINARY = "binary"
    PRECISION = "precision"


class PoolType(str, Enum):
    SEASON = "season"
    SERIES = "series"


class BinaryGuess(str, Enum):
    HIGHER = "higher"
    LOWER = "lower"


# ── Internal / Normalized ────────────────────────────────────────────────────

class Episode(BaseModel):
    """Normalized episode data derived from OMDb responses."""
    title: str
    season: int
    episode: int
    runtime: int = Field(description="Runtime in minutes")
    description: str = ""
    rating: float


# ── Request Schemas ──────────────────────────────────────────────────────────

class StartGameRequest(BaseModel):
    """Payload for POST /game/start."""
    mode: GameMode
    pool_type: PoolType
    show: str = Field(min_length=1, description="TV show title")
    season: Optional[int] = Field(default=None, ge=1, description="Season number (required for pool_type=season)")
    clues_enabled: bool = False


class GuessRequest(BaseModel):
    """Payload for POST /game/guess.

    For binary mode send a string like "higher" / "lower".
    For precision mode send a float like 8.7.
    """
    game_id: str
    guess: str | float


# ── Response Helpers ─────────────────────────────────────────────────────────

class EpisodePublic(BaseModel):
    """Episode info exposed to the player (rating hidden for the *next* episode)."""
    title: str
    season: int
    episode: int
    runtime: Optional[int] = None
    description: Optional[str] = None
    rating: Optional[float] = None  # None when hidden


class StartGameResponse(BaseModel):
    game_id: str
    mode: GameMode
    current_episode: EpisodePublic
    next_episode: EpisodePublic
    total_episodes: int
    clues_enabled: bool


class GuessResponse(BaseModel):
    correct: Optional[bool] = None  # None for precision mode
    actual_rating: float
    score: float = Field(description="Streak for binary, cumulative error for precision")
    next_episode: Optional[EpisodePublic] = None
    game_over: bool
    rounds_played: int


class GameStateResponse(BaseModel):
    game_id: str
    mode: GameMode
    show: str
    pool_type: PoolType
    season: Optional[int] = None
    current_episode: EpisodePublic
    next_episode: Optional[EpisodePublic] = None
    score: float
    rounds_played: int
    game_over: bool
    clues_enabled: bool
    total_episodes: int
