/**
 * NovaEvolutionModal Organism
 *
 * Nova evrimleştiğinde gösterilen tam ekran kutlama modalı.
 * Eski aşama → animasyonlu dönüşüm → yeni aşama.
 * Parıltı, parçacık efektleri ve aşama açıklaması.
 */

import type { NovaStage } from '@/types/user';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { NovaStageAvatar, STAGE_CONFIG } from '@components/molecules/NovaStageAvatar';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';

interface NovaEvolutionModalProps {
  isOpen: boolean;
  oldStage: NovaStage;
  newStage: NovaStage;
  onClose: () => void;
}

const STAGE_LABELS_TR: Record<NovaStage, string> = {
  egg: 'Yumurta',
  baby: 'Bebek Nova',
  child: 'Çocuk Nova',
  teen: 'Genç Nova',
  adult: 'Yetişkin Nova',
  legendary: 'Efsanevi Nova',
};

const STAGE_DESCRIPTIONS_TR: Record<NovaStage, string> = {
  egg: 'Nova henüz yumurtadan çıkmadı!',
  baby: 'Nova yumurtadan çıktı! İlk adımlarını atıyor. 🐣',
  child: 'Nova büyüyor! Artık kendi başına keşfedebilir. 🌟',
  teen: 'Nova güçleniyor! Müzik ve stil sahibi oldu. 🎧',
  adult: 'Nova artık bir bilge! Mezuniyet şapkasını taktı. 🎓',
  legendary: 'Nova efsanevi güce ulaştı! Taç sahibi! 👑',
};

/** Floating particle spawned during the transformation */
function Particle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute text-lg"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
        y: [0, -40],
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    >
      ✦
    </motion.div>
  );
}

export function NovaEvolutionModal({
  isOpen,
  oldStage,
  newStage,
  onClose,
}: NovaEvolutionModalProps) {
  const [phase, setPhase] = useState<'old' | 'transform' | 'new'>('old');

  const newConfig = STAGE_CONFIG[newStage];

  const handleStart = useCallback(() => {
    setPhase('transform');
    setTimeout(() => {
      setPhase('new');
    }, 1200);
  }, []);

  const handleClose = useCallback(() => {
    setPhase('old');
    onClose();
  }, [onClose]);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: 0.1 * i,
    x: 20 + Math.sin(i * 1.2) * 30,
    y: 25 + Math.cos(i * 0.9) * 25,
  }));

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
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at center, ${newConfig.glowColor}, transparent 70%)`,
              }}
            />

            {/* Header */}
            <motion.div
              className="relative mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text variant="overline" className="text-nova-purple">
                🌟 Nova Evrimleşiyor!
              </Text>
            </motion.div>

            {/* Stage display area */}
            <div className="relative mx-auto mb-4 flex h-52 items-center justify-center">
              {/* Particles during transform */}
              {phase === 'transform' && particles.map((p) => (
                <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
              ))}

              {/* Old stage (visible in 'old' phase) */}
              <AnimatePresence mode="wait">
                {phase === 'old' && (
                  <motion.div
                    key="old"
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="absolute"
                  >
                    <NovaStageAvatar stage={oldStage} size="xl" animate={false} />
                    <Text variant="caption" className="text-text-secondary mt-2">
                      {STAGE_LABELS_TR[oldStage]}
                    </Text>
                  </motion.div>
                )}

                {/* Transform flash */}
                {phase === 'transform' && (
                  <motion.div
                    key="flash"
                    className="absolute flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 2, 2.5, 3] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                  >
                    <div
                      className="h-40 w-40 rounded-full blur-xl"
                      style={{ backgroundColor: newConfig.glowColor }}
                    />
                  </motion.div>
                )}

                {/* New stage reveal */}
                {phase === 'new' && (
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute"
                  >
                    <NovaStageAvatar stage={newStage} size="xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stage info */}
            <motion.div
              className="relative mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'new' ? 1 : 0 }}
              transition={{ delay: 0.3 }}
            >
              <Text variant="h3" style={{ color: newConfig.bodyColor }}>
                {STAGE_LABELS_TR[newStage]}
              </Text>
              <Text variant="bodySmall" className="text-text-secondary mt-1">
                {STAGE_DESCRIPTIONS_TR[newStage]}
              </Text>
            </motion.div>

            {/* Action buttons */}
            <div className="relative mt-4">
              {phase === 'old' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
                    Evrimleştir! ✨
                  </Button>
                </motion.div>
              )}

              {phase === 'new' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Button variant="primary" size="lg" fullWidth onClick={handleClose}>
                    Harika! 🎉
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
