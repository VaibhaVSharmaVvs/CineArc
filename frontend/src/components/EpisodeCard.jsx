export default function EpisodeCard({ episode, side, revealed, revealState, cluesEnabled }) {
  const isLeft = side === 'left';
  const isRevealing = revealState && !isLeft;

  const gradientClass = isLeft
    ? 'bg-gradient-to-br from-primary/10 via-surface-high to-surface-high'
    : 'bg-gradient-to-bl from-secondary/5 via-surface-high to-surface-high';

  const badgeClass = isLeft
    ? 'bg-primary/20 backdrop-blur-md text-primary border-primary/20'
    : 'bg-secondary/20 backdrop-blur-md text-secondary border-secondary/20';

  // Rating display logic
  let ratingText = '?';
  let ratingColor = 'text-on-surface-variant';
  let starIcon = 'star_half';
  let starStyle = {};
  let starColor = 'text-outline';
  let animClass = '';

  if (revealed || isLeft) {
    ratingText = episode.rating?.toFixed(1) ?? '?';
    starIcon = 'star';
    starStyle = { fontVariationSettings: "'FILL' 1" };
    starColor = 'text-secondary';
    ratingColor = 'text-secondary';
  }

  if (isRevealing) {
    ratingText = revealState.rating.toFixed(1);
    starIcon = 'star';
    starStyle = { fontVariationSettings: "'FILL' 1" };
    animClass = 'rating-reveal';

    if (revealState.correct === true) {
      ratingColor = 'text-tertiary';
      starColor = 'text-tertiary';
    } else if (revealState.correct === false) {
      ratingColor = 'text-error';
      starColor = 'text-error';
    } else {
      // Precision mode — color by distance
      ratingColor = 'text-secondary';
      starColor = 'text-secondary';
    }
  }

  const cardAnimClass = isRevealing ? (revealState.animClass || '') : '';

  return (
    <div className={`relative group ${cardAnimClass}`}>
      <div className={`aspect-[16/10] md:aspect-[16/9] rounded-2xl ${isLeft ? 'lg:rounded-r-none' : 'lg:rounded-l-none'} overflow-hidden bg-surface-high shadow-2xl relative`}>
        <div className={`absolute inset-0 ${gradientClass}`} />

        {/* Badge + Title */}
        <div className={`absolute top-6 ${isLeft ? 'left-6' : 'left-6 lg:left-12'} flex flex-col gap-2`}>
          <span className={`${badgeClass} px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase border`}>
            S{episode.season} E{episode.episode}
          </span>
          <h2 className="text-3xl md:text-4xl font-[var(--font-headline)] font-black text-on-surface tracking-tighter drop-shadow-2xl uppercase leading-tight">
            {episode.title}
          </h2>
        </div>

        {/* Rating + Clues */}
        <div className={`absolute bottom-6 ${isLeft ? 'left-6' : 'left-6 lg:left-12'} right-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <span className={`material-symbols-outlined ${starColor} text-3xl`} style={starStyle}>
              {starIcon}
            </span>
            <span className={`text-4xl font-[var(--font-headline)] font-extrabold ${ratingColor} transition-all duration-500 ${animClass}`}>
              {ratingText}
            </span>
          </div>

          {cluesEnabled && episode.runtime ? (
            <div className="flex items-center space-x-4 text-outline text-sm border-t border-outline-variant/10 pt-4">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">schedule</span>
                {episode.runtime}m
              </div>
              <p className="line-clamp-2 italic text-on-surface-variant">
                {episode.description || ''}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
