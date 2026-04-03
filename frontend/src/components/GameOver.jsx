export default function GameOver({ state, onPlayAgain }) {
  const { mode, show, poolType, season, score, roundsPlayed, totalEpisodes, guessHistory } = state;
  const maxRounds = totalEpisodes - 1;
  const showInfo = poolType === 'season' ? `${show} (Season ${season})` : `${show} (Full Series)`;

  // Share text
  const emojis = guessHistory
    .map((h) => (h === 'correct' || h === 'close' ? '🟦' : h === 'near' ? '🟧' : '🟥'))
    .join('');

  const shareText =
    mode === 'binary'
      ? `CineArc: ${emojis} ${score} Streak!`
      : `CineArc: ${emojis} Error: ${score.toFixed(1)}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative z-10 w-full min-h-screen fade-in">
      <main className="flex-grow flex items-center justify-center p-6 relative">
        <div className="relative z-10 glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-outline-variant/15 flex flex-col items-center text-center p-12 slide-in">
          {/* Hero */}
          <div className="mb-2">
            <span className="font-[var(--font-label)] uppercase tracking-[0.3em] text-secondary text-sm font-bold">
              Curtain Call
            </span>
          </div>
          <h2 className="font-[var(--font-headline)] text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-8 cinematic-glow">
            Game Over!
          </h2>

          {/* Score Card */}
          {mode === 'binary' ? (
            <div className="w-full max-w-sm mb-10 bg-surface-high rounded-2xl p-8 flex flex-col items-center justify-center border-b-4 border-secondary-container">
              <span className="font-[var(--font-label)] uppercase text-[10px] tracking-widest text-on-surface-variant mb-2">
                Final Streak
              </span>
              <p className="font-[var(--font-headline)] text-5xl font-black text-secondary gold-glow">{score}</p>
              <p className="text-xs text-outline mt-2">
                {roundsPlayed} rounds played out of {maxRounds}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm mb-10 bg-surface-high rounded-2xl p-8 flex flex-col items-center justify-center border-b-4 border-tertiary">
              <span className="font-[var(--font-label)] uppercase text-[10px] tracking-widest text-on-surface-variant mb-2">
                Total Error
              </span>
              <p className="font-[var(--font-headline)] text-5xl font-black text-tertiary">
                {score.toFixed(1)}
              </p>
              <p className="text-xs text-outline mt-2">
                Avg error: {roundsPlayed > 0 ? (score / roundsPlayed).toFixed(2) : '0.00'} per round · {roundsPlayed} rounds
              </p>
            </div>
          )}

          {/* Context */}
          <div className="flex items-center gap-4 bg-surface-low px-6 py-3 rounded-full mb-10 border border-outline-variant/10">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              movie
            </span>
            <div className="text-left">
              <p className="font-[var(--font-label)] text-xs uppercase tracking-wider text-outline">Completed</p>
              <p className="font-bold text-on-surface">{showInfo}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={onPlayAgain}
              className="flex-1 h-14 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-[var(--font-headline)] font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(77,142,255,0.3)] hover:shadow-[0_0_25px_rgba(77,142,255,0.5)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
                replay
              </span>
              Play Again
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-14 bg-transparent border border-outline-variant hover:bg-surface-bright text-on-surface font-[var(--font-headline)] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">share</span>
              Share Results
            </button>
          </div>

          {/* Share Preview */}
          <div className="mt-8 p-4 bg-black/30 rounded-lg w-full max-w-xs text-xs font-mono text-outline leading-relaxed border border-white/5">
            {shareText}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-outline text-[10px] uppercase tracking-[0.2em] relative z-10 opacity-50">
        © CineArc Studios • The Digital Auteur Experience
      </footer>
    </div>
  );
}
