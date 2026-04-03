"""
Game engine — session management, move validation, and scoring.
"""

from __future__ import annotations

import uuid
from typing import Any

from app.core.config import settings
from app.core.logging import logger
from app.models.schemas import (
    BinaryGuess,
    Episode,
    EpisodePublic,
    GameMode,
    GameStateResponse,
    GuessResponse,
    PoolType,
    StartGameRequest,
    StartGameResponse,
)
from app.services import omdb_service

# ── In-Memory Game Store ─────────────────────────────────────────────────────
# { game_id: { ... game state ... } }
GAMES: dict[str, dict[str, Any]] = {}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _episode_public(ep: dict, reveal_rating: bool = False, clues_enabled: bool = False) -> EpisodePublic:
    """Convert an internal episode dict to a public-facing schema."""
    return EpisodePublic(
        title=ep["title"],
        season=ep["season"],
        episode=ep["episode"],
        runtime=ep["runtime"] if clues_enabled else None,
        description=ep["description"] if clues_enabled else None,
        rating=ep["rating"] if reveal_rating else None,
    )


# ── Start Game ───────────────────────────────────────────────────────────────

async def start_game(req: StartGameRequest) -> StartGameResponse:
    """Create a new game session.

    Fetches (or retrieves from cache) the episode pool, validates it,
    and initialises game state.
    """
    logger.info("Starting new game — show=%s  mode=%s  pool=%s  season=%s",
                req.show, req.mode, req.pool_type, req.season)

    if req.pool_type == PoolType.SEASON and req.season is None:
        raise ValueError("Season number is required when pool_type is 'season'.")

    episodes = await omdb_service.get_episodes(req.show, req.season, req.pool_type.value)

    if len(episodes) < 2:
        raise ValueError(
            f"Not enough rated episodes found for '{req.show}' "
            f"(need ≥ 2, got {len(episodes)}). Check the show title or season number."
        )

    game_id = str(uuid.uuid4())
    max_rounds = settings.PRECISION_MAX_ROUNDS if req.mode == GameMode.PRECISION else len(episodes) - 1

    game_state: dict[str, Any] = {
        "game_id": game_id,
        "mode": req.mode.value,
        "pool_type": req.pool_type.value,
        "show": req.show,
        "season": req.season,
        "episodes": episodes,
        "current_index": 0,
        "score": 0.0,
        "rounds_played": 0,
        "game_over": False,
        "clues_enabled": req.clues_enabled,
        "max_rounds": max_rounds,
    }
    GAMES[game_id] = game_state
    logger.info("Game created id=%s  total_episodes=%d  max_rounds=%d", game_id, len(episodes), max_rounds)

    current_ep = episodes[0]
    next_ep = episodes[1]

    return StartGameResponse(
        game_id=game_id,
        mode=req.mode,
        current_episode=_episode_public(current_ep, reveal_rating=True, clues_enabled=req.clues_enabled),
        next_episode=_episode_public(next_ep, reveal_rating=False, clues_enabled=req.clues_enabled),
        total_episodes=len(episodes),
        clues_enabled=req.clues_enabled,
    )


# ── Make Guess ───────────────────────────────────────────────────────────────

def make_guess(game_id: str, guess: str | float) -> GuessResponse:
    """Process a player's guess and advance the game state."""
    game = GAMES.get(game_id)
    if game is None:
        raise KeyError(f"Game session '{game_id}' not found.")
    if game["game_over"]:
        raise ValueError("This game is already over.")

    episodes: list[dict] = game["episodes"]
    idx = game["current_index"]
    current_ep = episodes[idx]
    next_ep = episodes[idx + 1]
    mode = game["mode"]

    current_rating = current_ep["rating"]
    next_rating = next_ep["rating"]

    correct: bool | None = None
    game_over = False

    if mode == GameMode.BINARY.value:
        # Validate guess
        guess_str = str(guess).strip().lower()
        if guess_str not in (BinaryGuess.HIGHER.value, BinaryGuess.LOWER.value):
            raise ValueError(f"Invalid binary guess: '{guess}'. Must be 'higher' or 'lower'.")

        if guess_str == BinaryGuess.HIGHER.value:
            correct = next_rating >= current_rating
        else:
            correct = next_rating <= current_rating

        if correct:
            game["score"] += 1
        else:
            game_over = True

    elif mode == GameMode.PRECISION.value:
        try:
            guess_val = float(guess)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid precision guess: '{guess}'. Must be a number.")

        error = abs(next_rating - guess_val)
        game["score"] = round(game["score"] + error, 2)
        correct = None  # no "correct" concept in precision mode

    game["rounds_played"] += 1

    # Check if sequence is exhausted or max rounds reached
    has_more = (idx + 2) < len(episodes)
    if not has_more or game["rounds_played"] >= game["max_rounds"]:
        game_over = True

    game["game_over"] = game_over

    # Advance pointer
    if not game_over:
        game["current_index"] = idx + 1

    # Build next episode payload (if game continues)
    upcoming: EpisodePublic | None = None
    if not game_over and (idx + 2) < len(episodes):
        upcoming = _episode_public(
            episodes[idx + 2],
            reveal_rating=False,
            clues_enabled=game["clues_enabled"],
        )

    logger.info(
        "Guess processed game=%s  round=%d  correct=%s  score=%.2f  game_over=%s",
        game_id, game["rounds_played"], correct, game["score"], game_over,
    )

    return GuessResponse(
        correct=correct,
        actual_rating=next_rating,
        score=game["score"],
        next_episode=upcoming,
        game_over=game_over,
        rounds_played=game["rounds_played"],
    )


# ── Get State ────────────────────────────────────────────────────────────────

def get_game_state(game_id: str) -> GameStateResponse:
    """Return the full state of an active (or finished) game."""
    game = GAMES.get(game_id)
    if game is None:
        raise KeyError(f"Game session '{game_id}' not found.")

    episodes = game["episodes"]
    idx = game["current_index"]

    current = _episode_public(episodes[idx], reveal_rating=True, clues_enabled=game["clues_enabled"])

    upcoming: EpisodePublic | None = None
    if not game["game_over"] and (idx + 1) < len(episodes):
        upcoming = _episode_public(episodes[idx + 1], reveal_rating=False, clues_enabled=game["clues_enabled"])

    return GameStateResponse(
        game_id=game["game_id"],
        mode=GameMode(game["mode"]),
        show=game["show"],
        pool_type=PoolType(game["pool_type"]),
        season=game["season"],
        current_episode=current,
        next_episode=upcoming,
        score=game["score"],
        rounds_played=game["rounds_played"],
        game_over=game["game_over"],
        clues_enabled=game["clues_enabled"],
        total_episodes=len(episodes),
    )
