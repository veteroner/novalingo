/**
 * CurrencyDisplay Molecule
 *
 * Yıldız ve gem bakiyesini gösterir.
 * Animasyonlu artış/azalış.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { formatNumber } from '@utils/number';

interface CurrencyDisplayProps {
  stars: number;
  gems: number;
  starDelta?: number;
  gemDelta?: number;
  compact?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  stars,
  gems,
  starDelta,
  gemDelta,
  compact = false,
  className,
}: CurrencyDisplayProps) {
  return (
    <div className={clsx('flex items-center', compact ? 'gap-3' : 'gap-4', className)}>
      {/* Stars */}
      <div className="relative flex items-center gap-1">
        <span className={compact ? 'text-base' : 'text-xl'}>⭐</span>
        <span className={clsx('text-nova-yellow-dark font-bold', compact ? 'text-xs' : 'text-sm')}>
          {formatNumber(stars)}
        </span>
        <AnimatePresence>
          {starDelta != null && starDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                'absolute -top-2 -right-4 text-[0.625rem] font-extrabold',
                starDelta > 0 ? 'text-success' : 'text-error',
              )}
            >
              {starDelta > 0 ? '+' : ''}
              {starDelta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Gems */}
      <div className="relative flex items-center gap-1">
        <span className={compact ? 'text-base' : 'text-xl'}>💎</span>
        <span className={clsx('text-nova-purple font-bold', compact ? 'text-xs' : 'text-sm')}>
          {formatNumber(gems)}
        </span>
        <AnimatePresence>
          {gemDelta != null && gemDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                'absolute -top-2 -right-4 text-[0.625rem] font-extrabold',
                gemDelta > 0 ? 'text-success' : 'text-error',
              )}
            >
              {gemDelta > 0 ? '+' : ''}
              {gemDelta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
