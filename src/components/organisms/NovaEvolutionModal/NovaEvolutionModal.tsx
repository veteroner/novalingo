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
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NovaEvolutionModalProps {
  isOpen: boolean;
  oldStage: NovaStage;
  newStage: NovaStage;
  onClose: () => void;
}

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
  if (!isOpen) return null;
  return (
    <EvolutionCelebration
      key={`${oldStage}-${newStage}`}
      oldStage={oldStage}
      newStage={newStage}
      onClose={onClose}
    />
  );
}

// Each opening owns its animation timer. Closing or changing stages disposes it.
function EvolutionCelebration({
  oldStage,
  newStage,
  onClose,
}: Omit<NovaEvolutionModalProps, 'isOpen'>) {
  const { t } = useTranslation('common');
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'old' | 'transform' | 'new'>('old');
  const newConfig = STAGE_CONFIG[newStage];

  useEffect(() => {
    if (phase !== 'transform') return;
    const timer = setTimeout(() => {
      setPhase('new');
    }, 1200);
    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function handleStart() {
    dialogRef.current?.focus();
    setPhase(reducedMotion ? 'new' : 'transform');
  }

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: 0.1 * i,
    x: 20 + Math.sin(i * 1.2) * 30,
    y: 25 + Math.cos(i * 0.9) * 25,
  }));

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
        if (event.key === 'Tab') {
          const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
          const first = buttons?.[0];
          const last = buttons?.[buttons.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === dialogRef.current)
          ) {
            event.preventDefault();
            last?.focus();
          } else if (
            !event.shiftKey &&
            (document.activeElement === last || document.activeElement === dialogRef.current)
          ) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
      className="fixed inset-0 z-100 flex items-center justify-center p-6 outline-none"
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
        className="bg-surface relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center shadow-2xl"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={
          reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20 }
        }
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
          transition={{ duration: reducedMotion ? 0 : undefined, delay: reducedMotion ? 0 : 0.2 }}
        >
          <Text id={titleId} variant="overline" className="text-primary">
            {t('novaEvolution.title')}
          </Text>
        </motion.div>

        {/* Stage display area */}
        <div className="relative mx-auto mb-4 flex h-52 items-center justify-center">
          {/* Particles during transform */}
          {phase === 'transform' &&
            !reducedMotion &&
            particles.map((p) => <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />)}

          {/* Old stage (visible in 'old' phase) */}
          <AnimatePresence mode="wait">
            {phase === 'old' && (
              <motion.div
                key="old"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3, rotate: 360 }}
                transition={{ duration: reducedMotion ? 0 : 0.6 }}
                className="absolute flex flex-col items-center"
              >
                <NovaStageAvatar stage={oldStage} size="xl" animate={false} />
                <Text variant="caption" className="text-text-secondary mt-2">
                  {t(`novaEvolution.stage.${oldStage}`)}
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
                transition={
                  reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 15 }
                }
                className="absolute"
              >
                <NovaStageAvatar stage={newStage} size="xl" animate={!reducedMotion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stage info */}
        <motion.div
          aria-hidden={phase !== 'new'}
          className="relative mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'new' ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : undefined, delay: reducedMotion ? 0 : 0.3 }}
        >
          <Text variant="h3" style={{ color: newConfig.bodyColor }}>
            {t(`novaEvolution.stage.${newStage}`)}
          </Text>
          <Text variant="bodySmall" className="text-text-secondary mt-1">
            {t(`novaEvolution.message.${newStage}`)}
          </Text>
        </motion.div>

        {/* Action buttons */}
        <div className="relative mt-4">
          {phase === 'old' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: reducedMotion ? 0 : undefined,
                delay: reducedMotion ? 0 : 0.5,
              }}
            >
              <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
                {t('novaEvolution.evolve')}
              </Button>
            </motion.div>
          )}

          {phase === 'new' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : undefined,
                delay: reducedMotion ? 0 : 0.5,
              }}
            >
              <Button variant="primary" size="lg" fullWidth onClick={onClose}>
                {t('novaEvolution.dismiss')}
              </Button>
            </motion.div>
          )}
          {phase !== 'new' && (
            <Button variant="ghost" size="md" fullWidth className="mt-3" onClick={onClose}>
              {t('novaEvolution.skip')}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
