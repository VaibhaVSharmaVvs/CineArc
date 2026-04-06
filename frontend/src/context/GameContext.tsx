import React, { createContext, useContext, useState, useCallback } from "react";
import { startGame as apiStart, makeGuess as apiGuess } from "@/api/gameApi";
import type { EpisodeData } from "@/api/gameApi";

export type GameMode = "binary" | "precision";
export type PoolType = "season" | "series";
export type GamePhase = "setup" | "playing" | "reveal" | "gameover";

export interface Episode {
  title: string;
  season: number;
  episode: number;
  rating: number;
  runtime: string;
  description: string;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  poolType: PoolType;
  show: string;
  season: number;
  cluesEnabled: boolean;
  gameId: string | null;
  currentRound: number;
  totalRounds: number;
  currentEpisode: Episode | null;
  nextEpisode: Episode | null;
  streak: number;
  cumulativeError: number;
  lastGuessCorrect: boolean | null;
  revealedRating: number | null;
  loading: boolean;
  loadingMsg: string;
  error: string | null;
}

interface GameContextType {
  state: GameState;
  setShow: (show: string) => void;
  setMode: (mode: GameMode) => void;
  setPoolType: (poolType: PoolType) => void;
  setSeason: (season: number) => void;
  setCluesEnabled: (enabled: boolean) => void;
  startGame: () => void;
  guessBinary: (higher: boolean) => void;
  guessPrecision: (rating: number) => void;
  resetGame: () => void;
  clearError: () => void;
}

function mapEpisode(ep: EpisodeData): Episode {
  return {
    title: ep.title,
    season: ep.season,
    episode: ep.episode,
    rating: ep.rating,
    runtime: ep.runtime || "",
    description: ep.description || "",
  };
}

const initialState: GameState = {
  phase: "setup",
  mode: "binary",
  poolType: "season",
  show: "",
  season: 1,
  cluesEnabled: true,
  gameId: null,
  currentRound: 0,
  totalRounds: 0,
  currentEpisode: null,
  nextEpisode: null,
  streak: 0,
  cumulativeError: 0,
  lastGuessCorrect: null,
  revealedRating: null,
  loading: false,
  loadingMsg: "",
  error: null,
};

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(initialState);

  const setShow = useCallback((show: string) => setState(s => ({ ...s, show })), []);
  const setMode = useCallback((mode: GameMode) => setState(s => ({ ...s, mode })), []);
  const setPoolType = useCallback((poolType: PoolType) => setState(s => ({ ...s, poolType })), []);
  const setSeason = useCallback((season: number) => setState(s => ({ ...s, season })), []);
  const setCluesEnabled = useCallback((cluesEnabled: boolean) => setState(s => ({ ...s, cluesEnabled })), []);
  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  const startGame = useCallback(async () => {
    const { mode, poolType, show, season, cluesEnabled } = state;
    if (!show.trim()) {
      setState(s => ({ ...s, error: "Please enter a TV show name." }));
      return;
    }

    setState(s => ({ ...s, loading: true, loadingMsg: `Fetching episodes for ${show}...`, error: null }));

    try {
      const data = await apiStart({ mode, poolType, show: show.trim(), season, cluesEnabled });
      setState(s => ({
        ...s,
        phase: "playing",
        gameId: data.game_id,
        currentRound: 1,
        totalRounds: data.total_episodes - 1,
        currentEpisode: mapEpisode(data.current_episode),
        nextEpisode: mapEpisode(data.next_episode),
        streak: 0,
        cumulativeError: 0,
        lastGuessCorrect: null,
        revealedRating: null,
        loading: false,
        loadingMsg: "",
      }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message, loading: false, loadingMsg: "" }));
    }
  }, [state]);

  const guessBinary = useCallback(async (higher: boolean) => {
    if (!state.gameId || state.phase !== "playing") return;

    const guessValue = higher ? "higher" : "lower";

    try {
      const data = await apiGuess(state.gameId, guessValue);

      // Show reveal animation
      setState(s => ({
        ...s,
        phase: "reveal",
        revealedRating: data.actual_rating,
        lastGuessCorrect: data.correct,
        streak: data.score,
      }));

      // Wait for reveal animation
      await new Promise(r => setTimeout(r, 2000));

      if (data.game_over) {
        setState(s => ({
          ...s,
          phase: "gameover",
          currentRound: data.rounds_played,
        }));
      } else {
        // Advance round
        setState(s => ({
          ...s,
          phase: "playing",
          currentRound: data.rounds_played + 1,
          currentEpisode: s.nextEpisode ? { ...s.nextEpisode, rating: data.actual_rating } : s.nextEpisode,
          nextEpisode: data.next_episode ? mapEpisode(data.next_episode) : null,
          lastGuessCorrect: null,
          revealedRating: null,
        }));
      }
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message }));
    }
  }, [state.gameId, state.phase]);

  const guessPrecision = useCallback(async (rating: number) => {
    if (!state.gameId || state.phase !== "playing") return;

    try {
      const data = await apiGuess(state.gameId, rating);
      const error = Math.abs(rating - data.actual_rating);

      // Show reveal animation
      setState(s => ({
        ...s,
        phase: "reveal",
        revealedRating: data.actual_rating,
        lastGuessCorrect: error < 0.5,
        cumulativeError: data.score,
      }));

      // Wait for reveal animation
      await new Promise(r => setTimeout(r, 2000));

      if (data.game_over) {
        setState(s => ({
          ...s,
          phase: "gameover",
          currentRound: data.rounds_played,
        }));
      } else {
        setState(s => ({
          ...s,
          phase: "playing",
          currentRound: data.rounds_played + 1,
          currentEpisode: s.nextEpisode ? { ...s.nextEpisode, rating: data.actual_rating } : s.nextEpisode,
          nextEpisode: data.next_episode ? mapEpisode(data.next_episode) : null,
          lastGuessCorrect: null,
          revealedRating: null,
        }));
      }
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message }));
    }
  }, [state.gameId, state.phase]);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <GameContext.Provider value={{
      state, setShow, setMode, setPoolType, setSeason, setCluesEnabled,
      startGame, guessBinary, guessPrecision, resetGame, clearError,
    }}>
      {children}
    </GameContext.Provider>
  );
};
