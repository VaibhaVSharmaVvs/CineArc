export default function BinaryControls({ onGuess, disabled }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 flex justify-center items-end pointer-events-none z-30">
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl pointer-events-auto">
        <button
          onClick={() => onGuess('higher')}
          disabled={disabled}
          className="flex-1 glass-panel py-5 md:py-6 px-8 rounded-2xl flex items-center justify-center space-x-4 border border-white/5 hover:bg-tertiary-container/20 hover:border-tertiary/40 transition-all duration-300 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-tertiary text-3xl group-hover:scale-125 transition-transform">
            arrow_upward
          </span>
          <span className="text-xl md:text-2xl font-black font-[var(--font-headline)] tracking-widest uppercase">
            HIGHER
          </span>
        </button>
        <button
          onClick={() => onGuess('lower')}
          disabled={disabled}
          className="flex-1 glass-panel py-5 md:py-6 px-8 rounded-2xl flex items-center justify-center space-x-4 border border-white/5 hover:bg-error-container/20 hover:border-error/40 transition-all duration-300 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-error text-3xl group-hover:scale-125 transition-transform">
            arrow_downward
          </span>
          <span className="text-xl md:text-2xl font-black font-[var(--font-headline)] tracking-widest uppercase">
            LOWER
          </span>
        </button>
      </div>
    </div>
  );
}
