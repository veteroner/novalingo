/**
 * LessonCard Organism
 *
 * Ünite içindeki tek ders kartı.
 * Durum: kilitli, aktif, tamamlandı, mükemmel.
 * Çocuk-dostu node-graph tarzı (Duolingo-vari yol haritası).
 */

import type { Lesson } from '@/types';
import { Text } from '@components/atoms/Text';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type LessonStatus = 'locked' | 'active' | 'completed' | 'perfect';

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  stars?: number; // 0-3
  index: number;
  onClick?: () => void;
  className?: string;
}

const statusStyles: Record<LessonStatus, { bg: string; border: string; shadow: string }> = {
  locked: {
    bg: 'bg-gray-200',
    border: 'border-gray-300',
    shadow: '',
  },
  active: {
    bg: 'bg-nova-blue',
    border: 'border-nova-blue',
    shadow: 'shadow-lg shadow-nova-blue/30',
  },
  completed: {
    bg: 'bg-success',
    border: 'border-success',
    shadow: 'shadow-md shadow-success/20',
  },
  perfect: {
    bg: 'bg-nova-yellow',
    border: 'border-nova-yellow',
    shadow: 'shadow-lg shadow-nova-yellow/30',
  },
};

const lessonTypeIcons: Record<string, string> = {
  vocabulary: '📝',
  grammar: '📐',
  listening: '👂',
  speaking: '🎤',
  reading: '📖',
  review: '🔄',
  boss: '👑',
  bonus: '🎁',
};

export function LessonCard({
  lesson,
  status,
  stars = 0,
  index,
  onClick,
  className,
}: LessonCardProps) {
  const styles = statusStyles[status];
  const isLocked = status === 'locked';

  // Zigzag offset for path-like layout
  const xOffset = index % 2 === 0 ? -30 : 30;

  return (
    <motion.div
      className={clsx('flex flex-col items-center', className)}
      style={{ transform: `translateX(${xOffset}px)` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Node */}
      <motion.button
        className={clsx(
          'relative flex h-16 w-16 items-center justify-center rounded-full border-4',
          'touch-manipulation transition-all select-none',
          styles.bg,
          styles.border,
          styles.shadow,
          isLocked && 'cursor-not-allowed opacity-60',
          !isLocked && 'cursor-pointer',
        )}
        whileTap={!isLocked ? { scale: 0.9 } : undefined}
        onClick={!isLocked ? onClick : undefined}
        disabled={isLocked}
      >
        {isLocked ? (
          <span className="text-xl opacity-40">🔒</span>
        ) : (
          <span className="text-2xl">{lessonTypeIcons[lesson.type] ?? '📚'}</span>
        )}

        {/* Active pulse ring */}
        {status === 'active' && (
          <motion.div
            className="border-nova-blue absolute inset-0 rounded-full border-4"
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Stars */}
      {(status === 'completed' || status === 'perfect') && (
        <div className="mt-1 flex gap-0.5">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={clsx('text-xs', i <= stars ? 'opacity-100' : 'opacity-20 grayscale')}
            >
              ⭐
            </span>
          ))}
        </div>
      )}

      {/* Label */}
      <Text variant="caption" weight="bold" className={clsx('mt-1', isLocked && 'opacity-40')}>
        {lesson.name}
      </Text>
    </motion.div>
  );
}
