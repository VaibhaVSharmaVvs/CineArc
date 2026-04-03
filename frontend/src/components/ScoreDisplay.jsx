export default function ScoreDisplay({ mode, score, roundsPlayed, totalEpisodes }) {
  const maxRounds = totalEpisodes - 1;
  const pct = maxRounds > 0 ? Math.round((roundsPlayed / maxRounds) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
      {/* Score Badge */}
      <div className="flex items-center space-x-3 bg-surface-high px-6 py-3 rounded-full shadow-lg">
        <span
          className="material-symbols-outlined text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {mode === 'binary' ? 'local_fire_department' : 'analytics'}
        </span>
        <span className="font-[var(--font-headline)] font-extrabold text-xl tracking-tight text-on-surface">
          {mode === 'binary' ? `🔥 Streak: ${score}` : `📊 Error: ${score.toFixed(1)}`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-2 px-1">
          <span className="text-xs font-[var(--font-label)] uppercase tracking-widest text-secondary">
            Round {roundsPlayed} of {maxRounds}
          </span>
          <span className="text-xs font-[var(--font-label)] text-outline">
            {pct}% Complete
          </span>
        </div>
        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
