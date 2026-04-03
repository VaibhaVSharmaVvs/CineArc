# IMDb Higher or Lower — Game API

A **FastAPI** backend for a "Higher or Lower" style game using real IMDb episode ratings from the OMDb API.

## Features

- **Binary Mode** — Guess whether the next episode's rating is higher or lower. Streak-based scoring; one wrong guess ends the game.
- **Precision Mode** — Predict the exact rating. Scored by cumulative absolute error.
- **Intelligent Caching** — In-memory cache with 24-hour TTL and stale-while-revalidate background refresh.
- **Async-First** — All OMDb fetches use `httpx.AsyncClient` with concurrent requests via `asyncio.gather`.
- **Full Validation** — Pydantic v2 request/response models with proper HTTP error codes.

---

## Quick Start

### 1. Prerequisites

- Python 3.11+
- An OMDb API key (free tier: [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx))

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and set your OMDB_API_KEY
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

The server starts at **http://localhost:8000**.  
Interactive API docs at **http://localhost:8000/docs**.

---

## API Endpoints

### `POST /game/start`

Start a new game session.

**Request Body:**

```json
{
  "mode": "binary",
  "pool_type": "season",
  "show": "Breaking Bad",
  "season": 3,
  "clues_enabled": true
}
```

**Response (201):**

```json
{
  "game_id": "uuid-string",
  "mode": "binary",
  "current_episode": {
    "title": "No Más",
    "season": 3,
    "episode": 1,
    "runtime": 47,
    "description": "...",
    "rating": 8.4
  },
  "next_episode": {
    "title": "Caballo sin Nombre",
    "season": 3,
    "episode": 2,
    "runtime": 47,
    "description": "...",
    "rating": null
  },
  "total_episodes": 13,
  "clues_enabled": true
}
```

---

### `POST /game/guess`

Submit a guess.

**Request Body:**

```json
{
  "game_id": "uuid-string",
  "guess": "higher"
}
```

*Or for precision mode:*

```json
{
  "game_id": "uuid-string",
  "guess": 8.7
}
```

**Response (200):**

```json
{
  "correct": true,
  "actual_rating": 8.6,
  "score": 1,
  "next_episode": { "..." },
  "game_over": false,
  "rounds_played": 1
}
```

---

### `GET /game/{game_id}`

Retrieve the current state of a game.

---

## Project Structure

```
app/
├── main.py                    # FastAPI app entry point
├── api/
│   └── routes/
│       └── game_routes.py     # /game/* endpoints
├── services/
│   ├── game_service.py        # Game engine & session management
│   ├── omdb_service.py        # OMDb API integration
│   └── cache_service.py       # In-memory cache with TTL
├── models/
│   └── schemas.py             # Pydantic v2 request/response models
└── core/
    ├── config.py              # Settings from environment
    └── logging.py             # Structured logging setup
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `OMDB_API_KEY` | *(required)* | Your OMDb API key |
| `CACHE_TTL_SECONDS` | `86400` | Cache time-to-live (24h) |
| `REQUEST_TIMEOUT_SECONDS` | `10.0` | HTTP request timeout |
| `MAX_RETRIES` | `3` | Retry attempts per OMDb call |
| `PRECISION_MAX_ROUNDS` | `10` | Max rounds in precision mode |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
