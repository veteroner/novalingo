/**
 * NovaCompanion Organism
 *
 * Nova maskotu — ekranın köşesinde yaşar.
 * Mood sistemli: happy, excited, thinking, sleeping, encouraging.
 * Konuşma balonu ile bağlamsal ipuçları verir.
 */

import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { useEffect, useState } from 'react';

type NovaMood = 'happy' | 'excited' | 'thinking' | 'sleeping' | 'encouraging' | 'celebrating';

interface NovaCompanionProps {
  mood?: NovaMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  onTap?: () => void;
  className?: string;
}

const moodEmojis: Record<NovaMood, string> = {
  happy: '🦉',
  excited: '🦉',
  thinking: '🦉',
  sleeping: '😴',
  encouraging: '🦉',
  celebrating: '🥳',
};

const moodAnimations: Record<NovaMood, TargetAndTransition> = {
  happy: { y: [0, -5, 0], rotate: [0, 3, -3, 0] },
  excited: { y: [0, -10, 0], scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
  thinking: { rotate: [0, 10, 0] },
  sleeping: { y: [0, 2, 0] },
  encouraging: { y: [0, -8, 0], rotate: [0, -5, 5, 0] },
  celebrating: { y: [0, -15, 0], scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] },
};

const sizeStyles: Record<string, string> = {
  sm: 'h-14 w-14 text-2xl',
  md: 'h-20 w-20 text-4xl',
  lg: 'h-28 w-28 text-5xl',
};

const positionStyles: Record<string, string> = {
  'bottom-right': 'fixed bottom-24 right-4 z-30',
  'bottom-left': 'fixed bottom-24 left-4 z-30',
  center: 'relative',
};

export function NovaCompanion({
  mood = 'happy',
  message,
  size = 'md',
  position = 'bottom-right',
  onTap,
  className,
}: NovaCompanionProps) {
  const [showBubble, setShowBubble] = useState(!!message);

  useEffect(() => {
    if (message) {
      setShowBubble(true);
      const timer = setTimeout(() => { setShowBubble(false); }, 5000);
      return () => { clearTimeout(timer); };
    }
    setShowBubble(false);
  }, [message]);

  return (
    <div className={clsx(positionStyles[position], className)}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            className={clsx(
              'absolute bottom-full mb-2 right-0 min-w-30 max-w-50',
              'bg-white rounded-2xl rounded-br-sm px-3 py-2 shadow-lg border border-gray-100',
            )}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Text variant="caption" weight="semibold" className="text-text-primary">
              {message}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nova character */}
      <motion.button
        className={clsx(
          'rounded-full bg-nova-blue/10 border-3 border-nova-blue/30',
          'flex items-center justify-center shadow-lg',
          'touch-manipulation select-none cursor-pointer',
          sizeStyles[size],
        )}
        animate={moodAnimations[mood]}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.9 }}
        onClick={onTap}
      >
        {moodEmojis[mood]}
      </motion.button>
    </div>
  );
}
