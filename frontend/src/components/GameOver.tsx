import React from "react";
import { useGame } from "@/context/GameContext";
import { RotateCcw, Share2, Flame } from "lucide-react";
import logo from "@/assets/logo.png";

const GameOver: React.FC = () => {
  const { state, resetGame } = useGame();
  const isBinary = state.mode === "binary";

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-sm w-full space-y-8 text-center">
        {/* Trophy */}
        <div className="fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <img src={logo} alt="CineArc" className="w-16 h-16" />
          </div>
        </div>

        {/* Title */}
        <div className="scale-in space-y-2" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-3xl font-bold">Game Over</h2>
          <p className="text-muted-foreground">Here's how you did</p>
        </div>

        {/* Score */}
        <div className="game-card slide-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {isBinary ? "Final Streak" : "Total Error"}
          </p>
          <p className="score-display text-5xl font-bold text-primary glow-text">
            {isBinary ? state.streak : state.cumulativeError.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {isBinary ? "consecutive correct" : "cumulative deviation"}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="score-display text-lg font-bold text-foreground">
                {state.currentRound}
              </p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </div>
            <div className="text-center">
              <p className="score-display text-lg font-bold text-foreground capitalize">
                {state.mode}
              </p>
              <p className="text-xs text-muted-foreground">Mode</p>
            </div>
          </div>
        </div>

        {/* Show info */}
        <div className="slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Show</p>
          <p className="font-semibold">{state.show}</p>
          <p className="text-sm text-muted-foreground">
            {state.poolType === "series" ? "Full Series" : `Season ${state.season}`}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 slide-up" style={{ animationDelay: "0.25s" }}>
          <button
            onClick={resetGame}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button className="w-full h-12 rounded-xl bg-card border border-border/50 text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-secondary active:scale-[0.98]">
            <Share2 className="w-4 h-4" />
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
