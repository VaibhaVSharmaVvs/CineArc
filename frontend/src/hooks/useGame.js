import { useState, useCallback } from 'react';
import { startGame as apiStart, makeGuess as apiGuess } from '../api/gameApi';

const initialState = {
  // Config
  mode: 'binary',
  poolType: 'season',
  show: 'Breaking Bad',
  season: 1,
  cluesEnabled: false,
  // Session
  gameId: null,
  currentEpisode: null,
  nextEpisode: null,
  score: 0,
  roundsPlayed: 0,
  totalEpisodes: 0,
  gameOver: false,
  guessHistory: [],
  // UI state
  view: 'setup', // 'setup' | 'game' | 'gameover'
  loading: false,
  loadingMsg: '',
  error: null,
  revealState: null, // null | { rating, correct, animClass }
};

export default function useGame() {
  const [state, setState] = useState(initialState);

  const update = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setConfig = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearError = useCallback(() => update({ error: null }), [update]);

  const goToSetup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: 'setup',
      gameId: null,
      revealState: null,
      error: null,
    }));
  }, []);

  const start = useCallback(async () => {
    const { mode, poolType, show, season, cluesEnabled } = state;
    if (!show.trim()) {
      update({ error: 'Please enter a TV show name.' });
      return;
    }

    update({ loading: true, loadingMsg: `Fetching episodes for ${show}...`, error: null });
    try {
      const data = await apiStart({ mode, poolType, show: show.trim(), season, cluesEnabled });
      update({
        gameId: data.game_id,
        currentEpisode: data.current_episode,
        nextEpisode: data.next_episode,
        totalEpisodes: data.total_episodes,
        score: 0,
        roundsPlayed: 0,
        gameOver: false,
        guessHistory: [],
        view: 'game',
        loading: false,
        revealState: null,
      });
    } catch (e) {
      update({ error: e.message, loading: false });
    }
  }, [state, update]);

  const guess = useCallback(async (guessValue) => {
    if (!state.gameId || state.gameOver || state.revealState) return;

    update({ error: null });
    try {
      const data = await apiGuess(state.gameId, guessValue);

      // Determine animation class & history entry
      let animClass = '';
      let historyEntry = '';
      if (state.mode === 'binary') {
        animClass = data.correct ? 'correct-flash' : 'wrong-shake';
        historyEntry = data.correct ? 'correct' : 'wrong';
      } else {
        const err = Math.abs(data.actual_rating - parseFloat(guessValue));
        if (err <= 0.5) { animClass = 'correct-flash'; historyEntry = 'close'; }
        else if (err <= 1.5) { animClass = ''; historyEntry = 'near'; }
        else { animClass = 'wrong-shake'; historyEntry = 'far'; }
      }

      update({
        revealState: {
          rating: data.actual_rating,
          correct: data.correct,
          animClass,
        },
        score: data.score,
        roundsPlayed: data.rounds_played,
        guessHistory: [...state.guessHistory, historyEntry],
      });

      // Wait for reveal animation
      await new Promise((r) => setTimeout(r, 1800));

      if (data.game_over) {
        update({ gameOver: true, view: 'gameover', revealState: null });
      } else {
        // Advance: next → current
        update({
          currentEpisode: { ...state.nextEpisode, rating: data.actual_rating },
          nextEpisode: data.next_episode,
          revealState: null,
        });
      }
    } catch (e) {
      update({ error: e.message, revealState: null });
    }
  }, [state, update]);

  return { state, setConfig, start, guess, goToSetup, clearError };
}
