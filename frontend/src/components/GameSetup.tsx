import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Search, Play, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const POPULAR_SHOWS = [
  "Breaking Bad", "Game of Thrones", "Stranger Things", "The Office",
  "The Sopranos", "True Detective", "Mindhunter", "The Wire",
];

const GameSetup: React.FC = () => {
  const { state, setShow, setMode, setPoolType, setSeason, setCluesEnabled, startGame, clearError } = useGame();
  const [searchValue, setSearchValue] = useState("");

  const handleChipClick = (show: string) => {
    setShow(show);
    setSearchValue(show);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 slide-up">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <img src={logo} alt="CineArc" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight glow-text">CineArc</h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
            Test your knowledge of TV episode ratings. Higher or lower?
          </p>
        </div>

        {/* Error */}
        {state.error && (
          <div className="game-card border-destructive/50 bg-destructive/10 flex items-center justify-between gap-3 fade-in !p-4">
            <p className="text-sm text-destructive font-medium">{state.error}</p>
            <button
              onClick={clearError}
              className="text-destructive/70 hover:text-destructive text-lg leading-none font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Search */}
        <div className="game-card space-y-5" style={{ animationDelay: "0.1s" }}>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              TV Show
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); setShow(e.target.value); }}
                placeholder="Search for a TV show..."
                className="game-input pl-10"
              />
            </div>
          </div>

          {/* Chips */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Popular</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SHOWS.map((show) => (
                <button
                  key={show}
                  onClick={() => handleChipClick(show)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    state.show === show
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {show}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="game-card space-y-5 slide-up" style={{ animationDelay: "0.15s" }}>
          {/* Mode */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(["binary", "precision"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMode(mode)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    state.mode === mode
                      ? "bg-secondary text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "binary" ? "Higher / Lower" : "Precision"}
                </button>
              ))}
            </div>
          </div>

          {/* Pool */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Content</label>
            <div className="grid grid-cols-2 gap-2">
              {(["season", "series"] as const).map((pool) => (
                <button
                  key={pool}
                  onClick={() => setPoolType(pool)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    state.poolType === pool
                      ? "bg-secondary text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pool === "season" ? "Single Season" : "Full Series"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Season */}
            <div className={state.poolType === "series" ? "opacity-30 pointer-events-none" : ""}>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Season</label>
              <input
                type="number"
                min={1}
                value={state.season}
                onChange={(e) => setSeason(Number(e.target.value))}
                disabled={state.poolType === "series"}
                className="game-input"
              />
            </div>

            {/* Clues */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Clues</label>
              <button
                onClick={() => setCluesEnabled(!state.cluesEnabled)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  state.cluesEnabled
                    ? "bg-[hsl(var(--game-success))]/10 text-[hsl(var(--game-success))] border border-[hsl(var(--game-success))]/20"
                    : "bg-muted text-muted-foreground border border-border/50"
                }`}
              >
                {state.cluesEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Start */}
        <button
          onClick={startGame}
          disabled={!state.show || state.loading}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20 slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          {state.loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {state.loadingMsg || "Loading..."}
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Game
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GameSetup;
