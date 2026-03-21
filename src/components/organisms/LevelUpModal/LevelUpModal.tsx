/**
 * LevelUpModal Organism
 *
 * Seviye atlandığında gösterilen tam ekran kutlama modalı.
 * Büyük seviye numarası, ödüller ve animasyonlu giriş.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  rewards: { stars: number; gems: number };
  onClose: () => void;
}

export function LevelUpModal({ isOpen, level, rewards, onClose }: LevelUpModalProps) {
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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Glow background */}
            <div className="from-nova-blue/20 absolute inset-0 bg-linear-to-b to-transparent" />

            {/* Confetti burst emoji */}
            <motion.div
              className="relative mb-2 text-5xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -15, 15, 0],
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              🎉
            </motion.div>

            {/* Title */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text variant="overline" className="text-nova-blue mb-1">
                Seviye Atladın!
              </Text>
            </motion.div>

            {/* Big level number */}
            <motion.div
              className="relative my-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
            >
              <div className="from-nova-blue to-nova-purple inline-flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br shadow-lg">
                <Text variant="h1" className="text-white" style={{ fontSize: '2.5rem' }}>
                  {level}
                </Text>
              </div>
            </motion.div>

            {/* Rewards */}
            <motion.div
              className="relative mb-6 flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {rewards.stars > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2">
                  <span className="text-xl">⭐</span>
                  <Text variant="body" weight="bold" className="text-amber-600">
                    +{rewards.stars}
                  </Text>
                </div>
              )}
              {rewards.gems > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-4 py-2">
                  <span className="text-xl">💎</span>
                  <Text variant="body" weight="bold" className="text-purple-600">
                    +{rewards.gems}
                  </Text>
                </div>
              )}
              {rewards.stars === 0 && rewards.gems === 0 && (
                <Text variant="bodySmall" className="text-text-secondary">
                  Harika ilerliyorsun! 🌟
                </Text>
              )}
            </motion.div>

            {/* Button */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button variant="primary" size="lg" fullWidth onClick={onClose}>
                Devam Et! 🚀
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
