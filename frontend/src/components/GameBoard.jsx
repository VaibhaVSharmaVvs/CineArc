import EpisodeCard from './EpisodeCard';
import ScoreDisplay from './ScoreDisplay';
import BinaryControls from './BinaryControls';
import PrecisionControls from './PrecisionControls';

export default function GameBoard({ state, onGuess, onBack }) {
  const { mode, show, poolType, season, currentEpisode, nextEpisode, score, roundsPlayed, totalEpisodes, cluesEnabled, revealState } = state;
  const isRevealing = !!revealState;

  return (
    <div className="flex flex-col items-center relative z-10 w-full min-h-screen fade-in">
      {/* Top Bar */}
      <nav className="w-full bg-bg/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/40">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <button
            onClick={onBack}
            className="text-2xl font-bold tracking-tighter text-primary uppercase font-[var(--font-headline)] hover:opacity-80 transition-opacity cursor-pointer"
          >
            CineArc
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-[var(--font-label)] uppercase tracking-widest text-outline hidden md:block">
              {show}{poolType === 'season' ? ` S${season}` : ''}
            </span>
            <button
              onClick={onBack}
              className="text-outline hover:text-on-surface transition-colors cursor-pointer"
              title="New Game"
            >
              <span className="material-symbols-outlined">replay</span>
            </button>
          </div>
        </div>
      </nav>

      <main
        className="relative pt-8 pb-32 px-4 md:px-12 max-w-screen-2xl mx-auto w-full"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(77,142,255,0.06) 0%, transparent 70%)' }}
      >
        <ScoreDisplay
          mode={mode}
          score={score}
          roundsPlayed={roundsPlayed}
          totalEpisodes={totalEpisodes}
        />

        {/* VS Cards */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-1">
          {currentEpisode && (
            <EpisodeCard
              episode={currentEpisode}
              side="left"
              revealed={true}
              revealState={null}
              cluesEnabled={cluesEnabled}
            />
          )}

          {/* VS Badge */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 bg-surface-highest rounded-full items-center justify-center border-4 border-bg shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <span className="text-2xl font-black italic tracking-tighter text-on-surface">VS</span>
          </div>

          {nextEpisode && (
            <EpisodeCard
              episode={nextEpisode}
              side="right"
              revealed={false}
              revealState={revealState}
              cluesEnabled={cluesEnabled}
            />
          )}
        </div>

        {/* Controls */}
        {mode === 'binary' && (
          <BinaryControls onGuess={onGuess} disabled={isRevealing} />
        )}
        {mode === 'precision' && nextEpisode && (
          <PrecisionControls
            targetName={nextEpisode.title}
            onGuess={onGuess}
            disabled={isRevealing}
          />
        )}
      </main>
    </div>
  );
}
