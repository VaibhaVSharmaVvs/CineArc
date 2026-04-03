export default function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg)]/90 backdrop-blur-md">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary rounded-full spinner" />
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-[var(--font-headline)] font-bold text-on-surface">
          Curating Scenes
        </h2>
        <p className="text-outline text-sm mt-2">{message || 'Fetching episode data...'}</p>
      </div>
      <div className="mt-12 w-64 h-1 bg-surface-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-tertiary w-1/3"
          style={{ animation: 'pulse 2s infinite' }}
        />
      </div>
    </div>
  );
}
