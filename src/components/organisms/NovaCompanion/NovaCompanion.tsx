/**
 * NovaCompanion Organism
 *
 * Nova maskotu — ekranın köşesinde yaşar.
 * Mood sistemli: happy, excited, thinking, sleeping, encouraging.
 * Konuşma balonu ile bağlamsal ipuçları verir.
 * Lottie animasyonları ile canlandırılır.
 */

import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import novaCelebrating from '@/assets/lottie/nova-celebrating.json';
import novaHappy from '@/assets/lottie/nova-happy.json';
import novaThinking from '@/assets/lottie/nova-thinking.json';

type NovaMood = 'happy' | 'excited' | 'thinking' | 'sleeping' | 'encouraging' | 'celebrating';

interface NovaCompanionProps {
  mood?: NovaMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  onTap?: () => void;
  className?: string;
}

const moodToAnimation: Record<NovaMood, unknown> = {
  happy: novaHappy,
  excited: novaCelebrating,
  thinking: novaThinking,
  sleeping: novaHappy, // reuse happy with slower speed
  encouraging: novaHappy,
  celebrating: novaCelebrating,
};

const moodSpeed: Record<NovaMood, number> = {
  happy: 1,
  excited: 1.4,
  thinking: 0.8,
  sleeping: 0.3,
  encouraging: 1.2,
  celebrating: 1,
};

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

  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const animationData = useMemo(() => moodToAnimation[mood], [mood]);

  useEffect(() => {
    lottieRef.current?.setSpeed(moodSpeed[mood]);
  }, [mood]);

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
              'rounded-2xl rounded-br-sm border border-gray-100 bg-white px-3 py-2 shadow-lg',
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

      {/* Nova character — Lottie animation */}
      <motion.button
        className={clsx(
          'bg-nova-blue/10 border-nova-blue/30 overflow-hidden rounded-full border-3',
          'flex items-center justify-center shadow-lg',
          'cursor-pointer touch-manipulation select-none',
          sizeStyles[size],
        )}
        whileTap={{ scale: 0.9 }}
        onClick={onTap}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop
          autoplay
          className="h-full w-full"
        />
      </motion.button>
    </div>
  );
}
