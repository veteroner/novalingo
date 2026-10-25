/**
 * AchievementPopup Organism
 *
 * Başarım açıldığında gösterilen tam ekran kutlama popup'ı.
 * Konfeti, parıltı, Nova maskotu ve ses efekti.
 */

import { TrophyIcon } from '@phosphor-icons/react';
import { RewardIcon } from '@components/atoms/RewardIcon/RewardIcon';
import { CatalogArtwork } from '@components/molecules/CatalogArtwork/CatalogArtwork';
import type { AchievementDefinition } from '@/types';
import { Badge } from '@components/atoms/Badge';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface AchievementPopupProps {
  achievement: AchievementDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: 'text-text-secondary',
  rare: 'text-nova-blue',
  epic: 'text-primary',
  legendary: 'text-reward-ink',
};

export function AchievementPopup({ achievement, isOpen, onClose }: AchievementPopupProps) {
  const { t, i18n } = useTranslation('common');
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
              'bg-surface relative w-full max-w-sm rounded-3xl p-8',
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
              className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center text-6xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
            >
              <CatalogArtwork
                source={achievement.iconUrl}
                fallback={
                  <TrophyIcon
                    size={64}
                    weight="duotone"
                    className="text-reward-ink"
                    aria-hidden="true"
                  />
                }
              />
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text variant="overline" className="text-reward-ink mb-1">
                {t('achievement.title')}
              </Text>
              <Text variant="h3" className="mb-2">
                {i18n.language.startsWith('en')
                  ? achievement.nameEn || achievement.name
                  : achievement.name}
              </Text>
              <Text variant="bodySmall" className="text-text-secondary mb-3">
                {i18n.language.startsWith('en')
                  ? achievement.descriptionEn || achievement.description
                  : achievement.description}
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
                ✦ {t(`achievement.rarity.${achievement.rarity}`)} ✦
              </span>
            </motion.div>

            {/* Reward */}
            <motion.div
              className="mb-6 flex flex-wrap items-center justify-center gap-3"
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
                <Badge variant="star" size="lg" icon={<RewardIcon kind="stars" />}>
                  +{achievement.reward.stars}
                  <span className="sr-only"> {t('currency.stars')}</span>
                </Badge>
              )}
              {achievement.reward.gems > 0 && (
                <Badge variant="gem" size="lg" icon={<RewardIcon kind="gems" />}>
                  +{achievement.reward.gems}
                  <span className="sr-only"> {t('currency.gems')}</span>
                </Badge>
              )}
            </motion.div>

            {/* Button */}
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              {t('achievement.dismiss')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
