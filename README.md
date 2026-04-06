# 🎬 CineArc — Higher or Lower TV Ratings Game

A web-based game where you guess whether the next TV episode's IMDb rating is higher or lower. Powered by real OMDb data, built with **FastAPI** + **React** + **TypeScript** + **shadcn/ui**.

![Dark Theme](https://img.shields.io/badge/theme-dark_gold-121212?style=flat-square&labelColor=121212&color=D4A017)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/lang-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/css-Tailwind_v3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)

---

## ✨ Features

### Game Modes
- **Binary Mode** — Guess higher or lower. Streak-based scoring; one wrong guess ends the game.
- **Precision Mode** — Predict the exact rating. Scored by cumulative absolute error (lower = better).

### Game Options
- **Single Season** or **Full Series** episode pools
- **Clues toggle** — Show/hide runtime and plot description as hints
- **Popular show presets** — Quick-pick from Breaking Bad, Game of Thrones, Stranger Things, and more

### Frontend
- **Elegant dark theme** — Gold-on-black with glassmorphism cards and smooth animations
- **Live search autocomplete** — Search OMDb as you type with poster thumbnails and year
- **Responsive design** — Plus Jakarta Sans + JetBrains Mono typography
- **React 18 + TypeScript** with shadcn/ui component library

### Backend
- **Async-first** — All OMDb fetches use `httpx.AsyncClient` with concurrent requests via `asyncio.gather`
- **Intelligent caching** — In-memory cache with 24h TTL and stale-while-revalidate background refresh
- **Full validation** — Pydantic v2 request/response models with proper HTTP error codes

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- An OMDb API key (free tier: [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx))

### 1. Clone & Configure

```bash
git clone https://github.com/VaibhaVSharmaVvs/CineArc.git
cd CineArc
cp .env.example .env
# Edit .env → set OMDB_API_KEY
```

### 2. Start Backend

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# API at http://localhost:8000 | Docs at http://localhost:8000/docs
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🏗️ Project Structure

```
CineArc/
├── app/                                # FastAPI Backend
│   ├── main.py                         # App entry point, CORS, routers
│   ├── api/routes/
│   │   ├── game_routes.py              # POST /game/start, POST /game/guess, GET /game/{id}
│   │   └── search_routes.py            # GET /search?q=... (OMDb series search)
│   ├── services/
│   │   ├── game_service.py             # Game engine & session store
│   │   ├── omdb_service.py             # Async OMDb fetcher with retry
│   │   └── cache_service.py            # In-memory cache with TTL
│   ├── models/
│   │   └── schemas.py                  # Pydantic v2 models
│   └── core/
│       ├── config.py                   # Settings from .env
│       └── logging.py                  # Structured logging
│
├── frontend/                           # React + TypeScript Frontend
│   ├── src/
│   │   ├── api/gameApi.ts              # API service (start, guess, search)
│   │   ├── context/GameContext.tsx      # Game state provider
│   │   ├── components/
│   │   │   ├── GameSetup.tsx           # Setup form + search autocomplete
│   │   │   ├── GamePlay.tsx            # Binary & precision game boards
│   │   │   ├── GameOver.tsx            # Score & replay screen
│   │   │   └── ui/                     # 49 shadcn/ui primitives
│   │   ├── pages/
│   │   │   ├── Index.tsx               # Main page
│   │   │   └── NotFound.tsx            # 404
│   │   └── hooks/, lib/, assets/
│   ├── vite.config.ts                  # Vite + SWC + /api proxy
│   ├── tailwind.config.ts              # Tailwind v3 + shadcn theme
│   └── package.json
│
├── requirements.txt                    # Python dependencies
├── HISTORY.md                          # Full development history
└── README.md                           # This file
```

---

## 📡 API Endpoints

### `POST /game/start`

Start a new game session.

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

### `POST /game/guess`

Submit a guess.

```json
// Binary mode
{ "game_id": "uuid-string", "guess": "higher" }

// Precision mode
{ "game_id": "uuid-string", "guess": 8.7 }
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

### `GET /game/{game_id}`

Retrieve the current state of a game.

### `GET /search?q=...`

Search for TV series on OMDb. Returns top 5 deduplicated results.

```json
{
  "results": [
    {
      "title": "Breaking Bad",
      "year": "2008–2013",
      "poster": "https://...",
      "imdb_id": "tt0903747"
    }
  ]
}
```

---

## ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `OMDB_API_KEY` | *(required)* | Your OMDb API key |
| `CACHE_TTL_SECONDS` | `86400` | Cache time-to-live (24h) |
| `REQUEST_TIMEOUT_SECONDS` | `10.0` | HTTP request timeout |
| `MAX_RETRIES` | `3` | Retry attempts per OMDb call |
| `PRECISION_MAX_ROUNDS` | `10` | Max rounds in precision mode |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+ / FastAPI / httpx / Pydantic v2 |
| Frontend | React 18 / TypeScript / Vite 5 |
| Styling | Tailwind CSS v3 / shadcn/ui / Radix Primitives |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans / JetBrains Mono |
| Data | OMDb API (real IMDb ratings) |

---

## 📝 Development History

See [HISTORY.md](HISTORY.md) for the full development log covering:

- **Session 1** — Backend build (FastAPI, game engine, OMDb integration, caching)
- **Session 2** — Original frontend (React + Tailwind v4)
- **Session 3** — Frontend redesign (TypeScript + shadcn/ui elegant theme + backend wiring)
- **Session 4** — Live search autocomplete + logo fixes
