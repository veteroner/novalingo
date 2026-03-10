/**
 * AchievementPopup Organism
 *
 * Başarım açıldığında gösterilen tam ekran kutlama popup'ı.
 * Konfeti, parıltı, Nova maskotu ve ses efekti.
 */

import type { AchievementDefinition } from '@/types';
import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

interface AchievementPopupProps {
  achievement: AchievementDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: 'text-gray-500',
  rare: 'text-nova-blue',
  epic: 'text-nova-purple',
  legendary: 'text-nova-orange',
};

const rarityLabels: Record<string, string> = {
  common: 'Yaygın',
  rare: 'Nadir',
  epic: 'Epik',
  legendary: 'Efsanevi',
};

export function AchievementPopup({ achievement, isOpen, onClose }: AchievementPopupProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className={clsx(
              'relative w-full max-w-sm rounded-3xl bg-white p-8',
              'overflow-hidden text-center shadow-2xl',
            )}
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Glow background */}
            <div className="from-nova-yellow/20 absolute inset-0 bg-linear-to-b to-transparent" />

            {/* Trophy emoji - bouncing */}
            <motion.div
              className="relative mb-4 text-6xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
            >
              {achievement.iconUrl || '🏆'}
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text variant="overline" className="text-nova-orange mb-1">
                🎉 Başarım Açıldı!
              </Text>
              <Text variant="h3" className="mb-2">
                {achievement.name}
              </Text>
              <Text variant="bodySmall" className="text-text-secondary mb-3">
                {achievement.description}
              </Text>
            </motion.div>

            {/* Rarity */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span
                className={clsx(
                  'text-xs font-extrabold tracking-widest uppercase',
                  rarityColors[achievement.rarity],
                )}
              >
                ✦ {rarityLabels[achievement.rarity]} ✦
              </span>
            </motion.div>

            {/* Reward */}
            <motion.div
              className="mb-6 flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {achievement.reward.xp > 0 && (
                <Badge variant="xp" size="lg">
                  +{achievement.reward.xp} XP
                </Badge>
              )}
              {achievement.reward.stars > 0 && (
                <Badge variant="xp" size="lg">
                  +{achievement.reward.stars} ⭐
                </Badge>
              )}
              {achievement.reward.gems > 0 && (
                <Badge variant="xp" size="lg">
                  +{achievement.reward.gems} 💎
                </Badge>
              )}
            </motion.div>

            {/* Button */}
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              Harika! 🎊
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
