/**
 * XPDisplay Molecule
 *
 * XP kazanımını animasyonlu gösterir.
 * Seviye ilerleme çubuğu ile birlikte.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Badge } from '@components/atoms/Badge';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { xpRequiredForLevel } from '@utils/xp';

interface XPDisplayProps {
  currentXP: number;
  level: number;
  xpGain?: number;
  compact?: boolean;
  className?: string;
}

export function XPDisplay({
  currentXP,
  level,
  xpGain,
  compact = false,
  className,
}: XPDisplayProps) {
  const xpForCurrentLevel = xpRequiredForLevel(level);
  const xpForNextLevel = xpRequiredForLevel(level + 1);
  const xpInLevel = currentXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? xpInLevel / xpNeeded : 1;

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <Badge variant="level" size="sm">
          Lv.{level}
        </Badge>
        <Badge variant="xp" size="sm">
          {currentXP} XP
        </Badge>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="level">Lv.{level}</Badge>
          <Text variant="bodySmall" weight="bold">
            {xpInLevel} / {xpNeeded} XP
          </Text>
        </div>

        <AnimatePresence>
          {xpGain != null && xpGain > 0 && (
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-nova-blue text-sm font-extrabold"
            >
              +{xpGain} XP
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ProgressBar value={progress} variant="xp" size="sm" />
    </div>
  );
}
