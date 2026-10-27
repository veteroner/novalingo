import { DiamondIcon, LightningIcon, StarIcon, TrophyIcon } from '@phosphor-icons/react';
import { clsx } from 'clsx';

const icons = { stars: StarIcon, gems: DiamondIcon, xp: LightningIcon, trophy: TrophyIcon };
const colors = {
  stars: 'text-reward-ink',
  gems: 'text-primary',
  xp: 'text-primary',
  trophy: 'text-reward-ink',
};

/** Decorative reward symbols; the amount's surrounding text supplies its unit. */
export function RewardIcon({
  kind,
  size = 20,
  className,
}: {
  kind: keyof typeof icons;
  size?: number;
  className?: string;
}) {
  const Icon = icons[kind];
  return (
    <Icon
      size={size}
      weight="duotone"
      aria-hidden="true"
      className={clsx('shrink-0', colors[kind], className)}
    />
  );
}
