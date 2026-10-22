/**
 * QuizBattleActivity
 *
 * Çoktan seçmeli quiz — sıralı sorular, zamanlı, puan toplama.
 * Renk kodlu seçenekler (Duolingo tarzı), doğru/yanlış feedback.
 */

import type { QuizBattleData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActivityCallbacks } from './types';

interface QuizBattleActivityProps extends ActivityCallbacks {
  data: QuizBattleData;
}

const OPTION_COLORS = [
  { bg: 'bg-error-soft border-error/30 hover:bg-error-soft', text: 'text-error-ink', icon: '🔴' },
  {
    bg: 'bg-primary-soft border-primary/30 hover:bg-primary-soft',
    text: 'text-primary',
    icon: '🔵',
  },
  {
    bg: 'bg-success-soft border-success/30 hover:bg-success-soft',
    text: 'text-success-ink',
    icon: '🟢',
  },
  {
    bg: 'bg-reward-soft border-yellow-200 hover:bg-yellow-100',
    text: 'text-yellow-700',
    icon: '🟡',
  },
];

export default function QuizBattleActivity({ data, onComplete }: QuizBattleActivityProps) {
  const { t } = useTranslation('lesson');
  const startTime = useRef(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = data.questions;
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  // Timer — her soru için
  useEffect(() => {
    if (!currentQ || isAnswered || isComplete) return;

    setTimeLeft(currentQ.timeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Zaman doldu — yanlış say
          setIsAnswered(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentQ, isAnswered, isComplete]);

  // Cevap seçme
  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (isAnswered || !currentQ || isComplete) return;

      setSelectedOption(optionIndex);
      setIsAnswered(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const correct = optionIndex === currentQ.correctIndex;
      if (correct) {
        setCorrectCount((prev) => prev + 1);
        correctCountRef.current += 1;
        // Zaman bonusu: kalan zaman oranı × puan
        const timeBonus = Math.round((timeLeft / currentQ.timeLimit) * currentQ.points * 0.3);
        setTotalScore((prev) => prev + currentQ.points + timeBonus);
      }
    },
    [isAnswered, currentQ, isComplete, timeLeft],
  );

  // Sonraki soruya geç — otomatik
  useEffect(() => {
    if (!isAnswered) return;

    const delay = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        // Quiz bitti
        setIsComplete(true);
        const accuracy = correctCountRef.current / totalQuestions;
        const finalScore = Math.max(50, Math.round(accuracy * 100));

        completionTimerRef.current = setTimeout(() => {
          onComplete({
            isCorrect: accuracy >= 0.5,
            score: finalScore,
            timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
            attempts: totalQuestions,
            hintsUsed: 0,
          });
        }, 1500);
      }
    }, 1200);

    return () => {
      clearTimeout(delay);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
    // correctCount intentionally excluded to avoid re-triggering
  }, [isAnswered, currentIndex, totalQuestions, onComplete]);

  if (!currentQ) return null;

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const timePercent = currentQ.timeLimit > 0 ? (timeLeft / currentQ.timeLimit) * 100 : 100;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center">
        <Text variant="overline" className="mb-1 text-orange-500">
          ⚡ QUIZ
        </Text>
      </div>

      {/* Progress bar */}
      <div className="bg-surface-elevated h-2 w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-primary-dark h-full rounded-full"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Score + Question Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-lg">⭐</span>
          <Text variant="label" className="text-orange-500">
            {totalScore}
          </Text>
        </div>
        <Text variant="caption" className="text-text-secondary">
          {currentIndex + 1} / {totalQuestions}
        </Text>
      </div>

      {/* Timer bar */}
      <div className="bg-surface-elevated h-1.5 w-full overflow-hidden rounded-full">
        <motion.div
          className={`h-full rounded-full ${
            timePercent > 50 ? 'bg-green-400' : timePercent > 25 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="space-y-4"
        >
          {/* Question text */}
          <motion.div className="bg-surface rounded-2xl p-6 text-center shadow-lg">
            <Text variant="h3" className="text-text">
              {currentQ.question}
            </Text>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const defaultColor = {
                bg: 'bg-surface-elevated border-border',
                text: 'text-text',
                icon: '⚪',
              };
              const color = OPTION_COLORS[idx % OPTION_COLORS.length] ?? defaultColor;
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let style = `${color.bg} border-2`;
              if (isAnswered) {
                if (isCorrect) {
                  style = 'bg-success-soft border-2 border-success/50';
                } else if (isSelected) {
                  style = 'bg-error-soft border-2 border-error/50';
                } else {
                  style = 'bg-surface-elevated border-2 border-border opacity-50';
                }
              }

              return (
                <motion.button
                  key={`${currentQ.id}-opt-${idx}`}
                  className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all ${style}`}
                  onClick={() => {
                    handleSelect(idx);
                  }}
                  whileTap={!isAnswered ? { scale: 0.97 } : {}}
                  animate={
                    isAnswered && isSelected && !isCorrect
                      ? { x: [0, -4, 4, -2, 0] }
                      : isAnswered && isCorrect
                        ? { scale: [1, 1.02, 1] }
                        : {}
                  }
                  disabled={isAnswered}
                >
                  <span className="text-lg">{color.icon}</span>
                  <Text
                    variant="body"
                    className={`font-bold ${
                      isAnswered && isCorrect
                        ? 'text-success-ink'
                        : isAnswered && isSelected
                          ? 'text-error-ink'
                          : color.text
                    }`}
                  >
                    {option}
                  </Text>
                  {isAnswered && isCorrect && <span className="ml-auto text-xl">✓</span>}
                  {isAnswered && isSelected && !isCorrect && (
                    <span className="ml-auto text-xl">✗</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Completion */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 py-4 text-center"
          >
            <div className="text-5xl">
              {correctCount === totalQuestions
                ? '🏆'
                : correctCount >= totalQuestions / 2
                  ? '⭐'
                  : '💪'}
            </div>
            <Text variant="h3" className="text-text">
              {t('activityUI.quizBattle.score', { correct: correctCount, total: totalQuestions })}
            </Text>
            <Text variant="body" className="font-bold text-orange-500">
              {totalScore} puan!
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
