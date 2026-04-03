import { useEffect } from 'react';

export default function ErrorToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-error/30 rounded-2xl px-6 py-4 max-w-lg shadow-2xl slide-in">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-error">error</span>
        <p className="text-sm text-on-surface flex-1">{message}</p>
        <button onClick={onClose} className="text-outline hover:text-on-surface ml-2">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
