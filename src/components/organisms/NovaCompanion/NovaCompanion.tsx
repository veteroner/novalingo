/**
 * NovaCompanion Organism
 *
 * Nova maskotu — ekranın köşesinde yaşar.
 * Mood sistemli: happy, excited, thinking, sleeping, encouraging.
 * Konuşma balonu ile bağlamsal ipuçları verir.
 * Paylaşılan NovaCharacter görsellerini kullanır.
 */

import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { NovaCharacter } from '@components/molecules/NovaCharacter';

type NovaMood = 'happy' | 'excited' | 'thinking' | 'sleeping' | 'encouraging' | 'celebrating';

interface NovaCompanionProps {
  mood?: NovaMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  onTap?: () => void;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'h-14 w-14',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
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
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 5000);
      return () => {
        clearTimeout(timer);
      };
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
              'absolute right-0 bottom-full mb-2 max-w-50 min-w-30',
              'border-border bg-surface rounded-2xl rounded-br-sm border px-3 py-2 shadow-lg',
            )}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Text variant="caption" weight="semibold" className="text-text">
              {message}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Nova pose */}
      <motion.button
        className={clsx(
          'rounded-2xl',
          'flex items-center justify-center shadow-lg',
          'cursor-pointer touch-manipulation select-none',
          sizeStyles[size],
        )}
        whileTap={{ scale: 0.9 }}
        onClick={onTap}
        aria-label="Nova"
      >
        <NovaCharacter mood={mood} size={size} className="h-full w-full" decorative />
      </motion.button>
    </div>
  );
}
