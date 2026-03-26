/**
 * LessonSlideActivity
 *
 * Full-screen motivational slide rendered at lesson start (lesson-intro)
 * and lesson end (lesson-outro). Shows Nova's line with a tap-to-continue button.
 * No scoring — auto-completes with isCorrect: true, score: 100.
 */

import type { LessonIntroData, LessonOutroData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { ActivityCallbacks } from './types';

interface LessonSlideActivityProps extends ActivityCallbacks {
  data: LessonIntroData | LessonOutroData;
}

export default function LessonSlideActivity({ data, onComplete }: LessonSlideActivityProps) {
  const startTime = useRef(Date.now());

  function handleContinue() {
    onComplete({
      isCorrect: true,
      score: 100,
      timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
      attempts: 1,
      hintsUsed: 0,
    });
  }

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-8 py-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Text variant="h2" className="text-surface-900 dark:text-surface-100 mb-10 leading-snug">
        {data.text}
      </Text>
      <Button variant="primary" size="lg" onClick={handleContinue} className="w-full max-w-xs">
        {data.type === 'lesson-intro' ? "Let's go! 🚀" : 'Continue 🌟'}
      </Button>
    </motion.div>
  );
}
