import { useState } from 'react';

export default function PrecisionControls({ targetName, onGuess, disabled }) {
  const [value, setValue] = useState(7.0);

  const adjust = (delta) => {
    setValue((v) => Math.max(0, Math.min(10, +(v + delta).toFixed(1))));
  };

  const submit = () => {
    if (!disabled) onGuess(value);
  };

  return (
    <div className="w-full max-w-2xl mt-12 mx-auto flex flex-col gap-6 items-center">
      <p className="text-on-surface font-[var(--font-headline)] font-medium tracking-wide">
        Predict the IMDb rating for{' '}
        <span className="text-primary font-bold">{targetName}</span>
      </p>

      <div className="flex flex-col sm:flex-row items-stretch gap-4 p-2 bg-surface-low rounded-2xl border border-outline-variant/20 shadow-xl w-full">
        {/* Number Input */}
        <div className="flex-1 flex items-center bg-surface-highest rounded-xl p-2 focus-within:ring-2 ring-primary/50 transition-all">
          <button
            type="button"
            onClick={() => adjust(-0.1)}
            className="w-14 h-14 flex items-center justify-center text-on-surface hover:bg-surface-bright rounded-lg transition-colors active:scale-90 cursor-pointer"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <div className="flex-1 text-center">
            <input
              className="bg-transparent border-none text-center w-full focus:ring-0 text-4xl font-[var(--font-headline)] font-black tracking-tight text-on-surface p-0"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={value.toFixed(1)}
              onChange={(e) => setValue(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
            />
          </div>
          <button
            type="button"
            onClick={() => adjust(0.1)}
            className="w-14 h-14 flex items-center justify-center text-on-surface hover:bg-surface-bright rounded-lg transition-colors active:scale-90 cursor-pointer"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="px-10 py-5 bg-gradient-to-br from-primary-container to-primary text-on-primary-container font-[var(--font-headline)] font-extrabold text-lg rounded-xl shadow-[0_0_20px_rgba(77,142,255,0.3)] hover:shadow-[0_0_30px_rgba(77,142,255,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          SUBMIT
          <span className="material-symbols-outlined text-xl">send</span>
        </button>
      </div>
    </div>
  );
}
