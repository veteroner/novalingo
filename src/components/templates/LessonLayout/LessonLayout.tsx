/**
 * LessonLayout Template
 *
 * Ders içi layout — üst ilerleme çubuğu, çıkış butonu, timer, tam ekran.
 * Navigasyon barı yok, immersive.
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { formatTime } from '@utils/time';

interface LessonLayoutProps {
  children: ReactNode;
  /** 0 to 1 */
  progress: number;
  /** seconds */
  timeElapsed?: number;
  currentQuestion: number;
  totalQuestions: number;
  onClose: () => void;
  className?: string;
}

export function LessonLayout({
  children,
  progress,
  timeElapsed,
  currentQuestion,
  totalQuestions,
  onClose,
  className,
}: LessonLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background-primary safe-area-top safe-area-bottom">
      {/* Header bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3">
        {/* Close button */}
        <motion.button
          className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
          whileTap={{ scale: 0.85 }}
          onClick={onClose}
        >
          ✕
        </motion.button>

        {/* Progress bar */}
        <div className="flex-1">
          <ProgressBar value={progress} variant="lesson" size="sm" />
        </div>

        {/* Counter / Timer */}
        <div className="shrink-0 flex items-center gap-2">
          <Text variant="caption" weight="bold" className="text-text-secondary">
            {currentQuestion}/{totalQuestions}
          </Text>
          {timeElapsed != null && (
            <Text variant="caption" weight="bold" className="text-text-secondary">
              {formatTime(timeElapsed)}
            </Text>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={clsx('flex-1 overflow-y-auto px-4 pb-8', className)}>
        {children}
      </div>
    </div>
  );
}
