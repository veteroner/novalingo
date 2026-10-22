/**
 * FillBlankActivity
 *
 * Cümlede boşluk doldurma — kelime kullanımını bağlam içinde pekiştirme.
 * Cümle gösterilir, boşluk yerine seçeneklerden biri seçilir.
 * Seçim sonrası kelime boşluğa animate olur.
 */

import type { FillBlankData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActivityCallbacks } from './types';

interface FillBlankActivityProps extends ActivityCallbacks {
  data: FillBlankData;
}

export default function FillBlankActivity({ data, onComplete }: FillBlankActivityProps) {
  const { t } = useTranslation('lesson');
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const startTime = useRef(Date.now());
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Split sentence around blank
  const parts = data.sentence.split('___');
  const beforeBlank = parts[0] ?? '';
  const afterBlank = parts[1] ?? '';

  // TTS via centralized speechService — prefer audioUrl when available
  const speak = useCallback(
    (text: string) => {
      void ttsSpeak(text, { rate: 0.8, pitch: 1.05, audioUrl: data.audioUrl || undefined });
    },
    [data.audioUrl],
  );

  const handleSelect = useCallback(
    (option: string) => {
      if (isCorrect === true) return;

      setSelected(option);
      setAttempts((a) => a + 1);

      const correct = option === data.correctAnswer;

      if (correct) {
        setIsCorrect(true);
        // Speak the complete sentence
        const fullSentence = data.sentence.replace('___', option);
        speakTimerRef.current = setTimeout(() => {
          speak(fullSentence);
        }, 400);

        completionTimerRef.current = setTimeout(() => {
          const elapsed = Math.round((Date.now() - startTime.current) / 1000);
          onComplete({
            isCorrect: true,
            score: attempts === 0 ? 100 : 70,
            timeSpentSeconds: elapsed,
            attempts: attempts + 1,
            hintsUsed: 0,
          });
        }, 2500);
      } else {
        // Wrong — shake briefly, then allow retry (up to 2 wrong attempts)
        setIsCorrect(false);
        retryTimerRef.current = setTimeout(() => {
          if (attempts + 1 >= 2) {
            // Max retries reached — show correct & advance
            const elapsed = Math.round((Date.now() - startTime.current) / 1000);
            onComplete({
              isCorrect: false,
              score: 0,
              timeSpentSeconds: elapsed,
              attempts: attempts + 1,
              hintsUsed: 0,
            });
          } else {
            // Reset for another try
            setSelected(null);
            setIsCorrect(null);
          }
        }, 1000);
      }
    },
    [isCorrect, data.correctAnswer, data.sentence, speak, onComplete, attempts],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      {/* Title */}
      <Text variant="h3" align="center">
        {t('activityUI.fillBlank.title')}
      </Text>

      {/* Translation hint */}
      <div className="bg-primary-soft rounded-xl px-4 py-2">
        <Text variant="bodySmall" className="text-primary text-center italic">
          💡 {data.translation}
        </Text>
      </div>

      {/* Sentence card */}
      <motion.div className="bg-surface w-full rounded-3xl p-6 shadow-lg" layout>
        <div className="text-center text-xl leading-relaxed">
          <span className="text-text font-medium">{beforeBlank}</span>

          {/* The blank / filled word */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.span
                key="filled"
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`mx-1 inline-block rounded-lg px-3 py-1 font-black ${
                  isCorrect === true
                    ? 'bg-success-soft text-success-ink'
                    : isCorrect === false
                      ? 'bg-error-soft text-error-ink line-through'
                      : 'bg-primary-soft text-primary'
                }`}
              >
                {selected}
              </motion.span>
            ) : (
              <motion.span
                key="blank"
                className="border-primary/30 mx-1 inline-block border-b-4 border-dashed px-6 py-1"
              >
                {'   '}
              </motion.span>
            )}
          </AnimatePresence>

          <span className="text-text font-medium">{afterBlank}</span>
        </div>

        {/* Show correct answer if wrong */}
        <AnimatePresence>
          {isCorrect === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-border mt-4 border-t pt-3 text-center"
            >
              <Text variant="bodySmall" className="text-text-secondary">
                {t('activityUI.fillBlank.correctAnswer')}
              </Text>
              <Text variant="body" weight="bold" className="text-success-ink">
                {beforeBlank}
                <span className="bg-success-soft mx-1 rounded px-2 py-0.5">
                  {data.correctAnswer}
                </span>
                {afterBlank}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Audio button */}
      <button
        className="bg-primary-dark flex h-12 w-12 items-center justify-center rounded-full text-xl text-white shadow-md transition-transform active:scale-95"
        onClick={() => {
          const full = data.sentence.replace('___', data.correctAnswer);
          speak(full);
        }}
        aria-label={t('activityUI.fillBlank.listenAria')}
      >
        🔊
      </button>

      {/* Options */}
      <div className="grid w-full grid-cols-2 gap-3">
        {data.options.map((option) => {
          const isThis = selected === option;
          const isAnswer = option === data.correctAnswer;
          let style = 'bg-surface border-2 border-border text-text hover:border-primary/30';

          if (isCorrect !== null) {
            if (isAnswer) {
              style = 'bg-success-soft border-2 border-success/50 text-success-ink font-black';
            } else if (isThis) {
              style = 'bg-error-soft border-2 border-error/30 text-error-ink line-through';
            } else {
              style = 'bg-surface-elevated border-2 border-border text-text-secondary';
            }
          }

          return (
            <motion.button
              key={option}
              className={`${style} rounded-2xl px-3 py-4 text-center text-base font-bold transition-all`}
              onClick={() => {
                handleSelect(option);
              }}
              disabled={isCorrect !== null}
              whileTap={{ scale: 0.95 }}
              animate={
                isThis && isCorrect === false
                  ? { x: [0, -6, 6, -6, 0] }
                  : isThis && isCorrect === true
                    ? { scale: [1, 1.08, 1] }
                    : {}
              }
              transition={{ duration: 0.3 }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-4 py-2 text-center ${
              isCorrect ? 'bg-success-soft text-success-ink' : 'bg-error-soft text-error-ink'
            }`}
          >
            <Text variant="body" weight="bold">
              {isCorrect ? t('activityUI.fillBlank.correct') : t('activityUI.fillBlank.wrong')}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
