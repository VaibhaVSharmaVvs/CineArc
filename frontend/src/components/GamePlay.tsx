import React, { useState } from "react";
import { useGame, Episode } from "@/context/GameContext";
import { Star, Clock, ChevronUp, ChevronDown, Minus, Plus, Send, Flame } from "lucide-react";

/* ─── Episode Card ─── */
const EpisodeCard: React.FC<{
  episode: Episode;
  revealed: boolean;
  showClues: boolean;
  label: string;
  revealedRating?: number | null;
  correct?: boolean | null;
}> = ({ episode, revealed, showClues, label, revealedRating, correct }) => {
  const isHidden = !revealed && label === "Next";
  const rating = revealedRating ?? episode.rating;

  return (
    <div className="game-card flex flex-col gap-4 scale-in">
      {/* Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
        <span className="game-badge text-[10px]">S{episode.season} E{episode.episode}</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold tracking-tight leading-tight">{episode.title}</h3>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <Star
          className={`w-5 h-5 ${isHidden ? "text-muted-foreground" : "text-primary"}`}
          fill={isHidden ? "none" : "currentColor"}
        />
        {isHidden ? (
          <span className="score-display text-3xl font-bold text-muted-foreground">?. ?</span>
        ) : (
          <span className={`score-display text-3xl font-bold transition-all duration-300 ${
            correct === true ? "text-[hsl(var(--game-success))]" :
            correct === false ? "text-destructive" :
            "text-primary glow-text"
          }`}>
            {rating}
          </span>
        )}
      </div>

      {/* Clues */}
      {showClues && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
          {episode.runtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{episode.runtime}</span>
            </div>
          )}
          {episode.description && (
            <span className="truncate italic">{episode.description}</span>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Binary Mode ─── */
const BinaryGame: React.FC = () => {
  const { state, guessBinary } = useGame();
  const { currentEpisode, nextEpisode, currentRound, totalRounds, streak, cluesEnabled, revealedRating, lastGuessCorrect } = state;
  if (!currentEpisode || !nextEpisode) return null;

  const progress = (currentRound / totalRounds) * 100;
  const isRevealing = state.phase === "reveal";

  const showLabel = state.poolType === "series"
    ? state.show
    : `${state.show} · Season ${state.season}`;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Higher or Lower</h1>
            <span className="text-muted-foreground text-sm">{showLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {streak >= 2 && (
              <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-[hsl(38_92%_50%/0.12)] text-[hsl(38,92%,50%)] border border-[hsl(38_92%_50%/0.2)]">
                <Flame className="w-3.5 h-3.5" />
                <span className="score-display">{streak}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="game-card scale-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Round</p>
              <p className="score-display text-2xl font-bold">
                {currentRound}<span className="text-muted-foreground text-lg">/{totalRounds}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Streak</p>
              <p className="score-display text-2xl font-bold text-primary">{streak}</p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cards */}
        <EpisodeCard
          episode={currentEpisode}
          revealed={true}
          showClues={cluesEnabled}
          label="Current"
        />

        {/* VS */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">VS</span>
          </div>
        </div>

        <EpisodeCard
          episode={nextEpisode}
          revealed={isRevealing}
          showClues={cluesEnabled}
          label="Next"
          revealedRating={revealedRating}
          correct={lastGuessCorrect}
        />

        {/* Result flash */}
        {isRevealing && lastGuessCorrect !== null && (
          <div className={`text-center py-3 rounded-xl text-sm font-bold fade-in ${
            lastGuessCorrect
              ? "bg-[hsl(var(--game-success))]/10 text-[hsl(var(--game-success))]"
              : "bg-destructive/10 text-destructive"
          }`}>
            {lastGuessCorrect ? "✓ Correct!" : "✗ Wrong — Game Over"}
          </div>
        )}

        {/* Action buttons */}
        {!isRevealing && (
          <div className="grid grid-cols-2 gap-3 slide-up">
            <button
              onClick={() => guessBinary(true)}
              className="game-card-hover flex items-center justify-center gap-2 py-4 cursor-pointer"
            >
              <ChevronUp className="w-5 h-5 text-[hsl(var(--game-success))]" />
              <span className="font-bold text-sm">Higher</span>
            </button>
            <button
              onClick={() => guessBinary(false)}
              className="game-card-hover flex items-center justify-center gap-2 py-4 cursor-pointer"
            >
              <ChevronDown className="w-5 h-5 text-destructive" />
              <span className="font-bold text-sm">Lower</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Precision Mode ─── */
const PrecisionGame: React.FC = () => {
  const { state, guessPrecision } = useGame();
  const [guessValue, setGuessValue] = useState(7.0);
  const { currentEpisode, nextEpisode, currentRound, totalRounds, cumulativeError, cluesEnabled, revealedRating, lastGuessCorrect } = state;
  if (!currentEpisode || !nextEpisode) return null;

  const isRevealing = state.phase === "reveal";

  const showLabel = state.poolType === "series"
    ? state.show
    : `${state.show} · Season ${state.season}`;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Precision Mode</h1>
            <span className="text-muted-foreground text-sm">{showLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="game-card scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Round</p>
              <p className="score-display text-2xl font-bold">
                {currentRound}<span className="text-muted-foreground text-lg">/{totalRounds}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Error</p>
              <p className="score-display text-2xl font-bold text-primary">{cumulativeError.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <EpisodeCard episode={currentEpisode} revealed={true} showClues={cluesEnabled} label="Reference" />

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">VS</span>
          </div>
        </div>

        <EpisodeCard
          episode={nextEpisode}
          revealed={isRevealing}
          showClues={cluesEnabled}
          label="Target"
          revealedRating={revealedRating}
          correct={lastGuessCorrect}
        />

        {/* Reveal result */}
        {isRevealing && revealedRating !== null && (
          <div className="text-center py-3 rounded-xl text-sm font-bold fade-in bg-card border border-border/50">
            Error: <span className="score-display text-primary">{Math.abs(guessValue - revealedRating).toFixed(1)}</span>
          </div>
        )}

        {/* Input */}
        {!isRevealing && (
          <div className="space-y-4 slide-up">
            <p className="text-center text-sm text-muted-foreground">
              Predict the rating for <span className="text-foreground font-semibold">{nextEpisode.title}</span>
            </p>

            <div className="game-card flex items-center gap-2">
              <button
                onClick={() => setGuessValue(v => Math.max(0, +(v - 0.1).toFixed(1)))}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={0} max={10} step={0.1}
                value={guessValue}
                onChange={(e) => setGuessValue(+e.target.value)}
                className="flex-1 bg-transparent border-none text-center focus:ring-0 score-display text-4xl font-bold p-0"
              />
              <button
                onClick={() => setGuessValue(v => Math.min(10, +(v + 0.1).toFixed(1)))}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => guessPrecision(guessValue)}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              Submit Guess
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const GamePlay: React.FC = () => {
  const { state } = useGame();
  return state.mode === "binary" ? <BinaryGame /> : <PrecisionGame />;
};

export default GamePlay;
