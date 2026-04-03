"""
API routes for the Higher-or-Lower game.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.logging import logger
from app.models.schemas import (
    GameStateResponse,
    GuessRequest,
    GuessResponse,
    StartGameRequest,
    StartGameResponse,
)
from app.services import game_service

router = APIRouter(prefix="/game", tags=["Game"])


@router.post("/start", response_model=StartGameResponse, status_code=201)
async def start_game(req: StartGameRequest) -> StartGameResponse:
    """Start a new game session.

    Fetches episode data from OMDb (or cache), initialises game state,
    and returns the first pair of episodes.
    """
    try:
        return await game_service.start_game(req)
    except ValueError as exc:
        logger.warning("start_game validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in start_game")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")


@router.post("/guess", response_model=GuessResponse)
async def make_guess(req: GuessRequest) -> GuessResponse:
    """Submit a guess for the current round."""
    try:
        return game_service.make_guess(req.game_id, req.guess)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in make_guess")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")


@router.get("/{game_id}", response_model=GameStateResponse)
async def get_game_state(game_id: str) -> GameStateResponse:
    """Retrieve the current state of a game session."""
    try:
        return game_service.get_game_state(game_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in get_game_state")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")
