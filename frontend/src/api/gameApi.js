const BASE_URL = '/api';

export async function startGame({ mode, poolType, show, season, cluesEnabled }) {
  const body = {
    mode,
    pool_type: poolType,
    show,
    clues_enabled: cluesEnabled,
  };
  if (poolType === 'season') body.season = season;

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

export async function makeGuess(gameId, guess) {
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

export async function getGameState(gameId) {
  const res = await fetch(`${BASE_URL}/game/${gameId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to get game state');
  return data;
}
