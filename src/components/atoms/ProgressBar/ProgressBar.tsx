/**
 * ProgressBar Atom
 *
 * Animasyonlu ilerleme çubuğu.
 * Ders içi, XP, streak ve genel kullanım.
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type ProgressBarVariant = 'default' | 'xp' | 'lesson' | 'health';
type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  /** 0 to 1 */
  value: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const variantStyles: Record<ProgressBarVariant, { track: string; fill: string }> = {
  default: {
    track: 'bg-gray-200',
    fill: 'bg-nova-blue',
  },
  xp: {
    track: 'bg-nova-purple/20',
    fill: 'bg-linear-to-r from-nova-purple to-nova-pink',
  },
  lesson: {
    track: 'bg-white/30',
    fill: 'bg-success',
  },
  health: {
    track: 'bg-error/20',
    fill: 'bg-error',
  },
};

const sizeStyles: Record<ProgressBarSize, string> = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  animate = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(1, Math.max(0, value));
  const percentage = Math.round(clampedValue * 100);
  const styles = variantStyles[variant];

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-text-secondary">İlerleme</span>
          <span className="text-text-primary">{percentage}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full overflow-hidden',
          styles.track,
          sizeStyles[size],
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={clsx('h-full rounded-full', styles.fill)}
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
