import { POPULAR_SHOWS } from '../utils/constants';

export default function SetupForm({ config, setConfig, onStart }) {
  const { mode, poolType, show, season, cluesEnabled } = config;

  const toggleBtn = (active) =>
    active
      ? 'flex-1 py-3 text-xs font-bold rounded-lg bg-surface-high text-on-surface shadow-sm transition-all cursor-pointer'
      : 'flex-1 py-3 text-xs font-bold rounded-lg text-outline hover:text-on-surface transition-all cursor-pointer';

  return (
    <div className="flex flex-col items-center relative z-10 w-full min-h-screen fade-in">
      <main className="w-full max-w-4xl px-6 py-12 md:py-20 flex flex-col items-center mx-auto">
        {/* Title */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-[var(--font-headline)] font-extrabold tracking-tighter uppercase bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent drop-shadow-2xl">
            CineArc
          </h1>
          <p className="text-sm font-[var(--font-label)] uppercase tracking-[0.3em] text-outline mt-2">
            The Digital Auteur
          </p>
        </header>

        {/* Config Card */}
        <div className="w-full glass-card border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/60">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            {/* Show Input */}
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-primary mb-3">
                  Target Production
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    search
                  </span>
                  <input
                    className="w-full h-16 pl-14 pr-6 bg-surface-low border-0 rounded-2xl focus:ring-2 focus:ring-primary/30 text-lg font-[var(--font-headline)] transition-all placeholder:text-outline/50"
                    placeholder="Search for a TV Show..."
                    type="text"
                    value={show}
                    onChange={(e) => setConfig('show', e.target.value)}
                  />
                </div>
              </div>

              {/* Chips */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-[var(--font-label)] uppercase tracking-[0.2em] text-outline/80 px-1">
                  Popular Shows
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SHOWS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setConfig('show', name)}
                      className={
                        name === show
                          ? 'px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold transition-all shadow-lg shadow-secondary/10 cursor-pointer'
                          : 'px-4 py-2 rounded-full bg-surface-highest text-on-surface-variant text-xs font-medium hover:bg-surface-bright hover:text-on-surface transition-all cursor-pointer'
                      }
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
              {/* Mode */}
              <div className="space-y-4">
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-primary">
                  Gameplay Mode
                </label>
                <div className="flex p-1 bg-bg rounded-xl">
                  <button type="button" onClick={() => setConfig('mode', 'binary')} className={toggleBtn(mode === 'binary')}>
                    Binary
                  </button>
                  <button type="button" onClick={() => setConfig('mode', 'precision')} className={toggleBtn(mode === 'precision')}>
                    Precision
                  </button>
                </div>
              </div>

              {/* Pool */}
              <div className="space-y-4">
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-primary">
                  Content Pool
                </label>
                <div className="flex p-1 bg-bg rounded-xl">
                  <button type="button" onClick={() => setConfig('poolType', 'season')} className={toggleBtn(poolType === 'season')}>
                    Single Season
                  </button>
                  <button type="button" onClick={() => setConfig('poolType', 'series')} className={toggleBtn(poolType === 'series')}>
                    Full Series
                  </button>
                </div>
              </div>

              {/* Season */}
              <div className={`space-y-4 transition-opacity ${poolType === 'series' ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-primary">
                  Target Season
                </label>
                <input
                  className="w-full h-12 bg-bg border-0 rounded-xl px-4 text-on-surface font-[var(--font-headline)]"
                  type="number"
                  min="1"
                  value={season}
                  disabled={poolType === 'series'}
                  onChange={(e) => setConfig('season', parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Clues */}
              <div className="space-y-4">
                <label className="block text-xs font-[var(--font-label)] uppercase tracking-widest text-primary">
                  Clue Assistance
                </label>
                <div
                  className="flex items-center justify-between h-12 px-4 bg-bg rounded-xl cursor-pointer"
                  onClick={() => setConfig('cluesEnabled', !cluesEnabled)}
                >
                  <span className="text-xs text-outline">Runtime &amp; Description</span>
                  <div className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${cluesEnabled ? 'bg-tertiary/20' : 'bg-surface-variant'}`}>
                    <div className={`w-4 h-4 rounded-full transition-transform ${cluesEnabled ? 'bg-tertiary translate-x-6' : 'bg-outline translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Start */}
            <div className="pt-6">
              <button
                type="button"
                onClick={onStart}
                className="w-full h-16 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-[var(--font-headline)] font-extrabold text-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                Start Game
                <span className="material-symbols-outlined">play_arrow</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-12 opacity-30 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-on-surface" />
          <span className="material-symbols-outlined text-lg">movie</span>
          <div className="h-[1px] w-12 bg-on-surface" />
        </footer>
      </main>
    </div>
  );
}
