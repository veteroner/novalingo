/**
 * CurrencyDisplay Molecule
 *
 * Yıldız ve gem bakiyesini gösterir.
 * Animasyonlu artış/azalış.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { formatNumber } from '@utils/number';
import { RewardIcon } from '@components/atoms/RewardIcon/RewardIcon';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');
  return (
    <div className={clsx('flex items-center', compact ? 'gap-3' : 'gap-4', className)}>
      {/* Stars */}
      <div
        role="group"
        aria-label={t('currency.stars')}
        className="relative flex items-center gap-1"
      >
        <RewardIcon kind="stars" size={compact ? 20 : 24} />
        <span className={clsx('text-reward-ink font-bold', compact ? 'text-xs' : 'text-sm')}>
          {formatNumber(stars)}
        </span>
        <AnimatePresence>
          {starDelta != null && starDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                'absolute -top-2 -right-4 text-xs font-extrabold',
                starDelta > 0 ? 'text-success-ink' : 'text-error-ink',
              )}
            >
              {starDelta > 0 ? '+' : ''}
              {starDelta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Gems */}
      <div
        role="group"
        aria-label={t('currency.gems')}
        className="relative flex items-center gap-1"
      >
        <RewardIcon kind="gems" size={compact ? 20 : 24} />
        <span className={clsx('text-primary font-bold', compact ? 'text-xs' : 'text-sm')}>
          {formatNumber(gems)}
        </span>
        <AnimatePresence>
          {gemDelta != null && gemDelta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                'absolute -top-2 -right-4 text-xs font-extrabold',
                gemDelta > 0 ? 'text-success-ink' : 'text-error-ink',
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
