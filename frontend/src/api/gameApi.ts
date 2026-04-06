const BASE_URL = '/api';

export interface StartGameConfig {
  mode: 'binary' | 'precision';
  poolType: 'season' | 'series';
  show: string;
  season?: number;
  cluesEnabled: boolean;
}

export interface EpisodeData {
  title: string;
  season: number;
  episode: number;
  rating: number;
  runtime?: string;
  description?: string;
}

export interface StartGameResponse {
  game_id: string;
  current_episode: EpisodeData;
  next_episode: EpisodeData;
  total_episodes: number;
  mode: string;
}

export interface GuessResponse {
  correct: boolean;
  actual_rating: number;
  score: number;
  rounds_played: number;
  game_over: boolean;
  next_episode?: EpisodeData;
}

export async function startGame(config: StartGameConfig): Promise<StartGameResponse> {
  const body: Record<string, unknown> = {
    mode: config.mode,
    pool_type: config.poolType,
    show: config.show,
    clues_enabled: config.cluesEnabled,
  };
  if (config.poolType === 'season') body.season = config.season;

  const res = await fetch(`${BASE_URL}/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.[0]?.msg || 'Failed to start game';
    throw new Error(detail);
  }
  return data;
}

export async function makeGuess(gameId: string, guess: string | number): Promise<GuessResponse> {
  const res = await fetch(`${BASE_URL}/game/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, guess }),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.[0]?.msg || 'Failed to submit guess';
    throw new Error(detail);
  }
  return data;
}

export async function getGameState(gameId: string) {
  const res = await fetch(`${BASE_URL}/game/${gameId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get game state');
  return data;
}
