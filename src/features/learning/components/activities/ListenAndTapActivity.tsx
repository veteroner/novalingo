/**
 * ListenAndTapActivity
 *
 * Dinleme becerisi — ses çalınır, 4 seçenekten doğru olanı seç.
 * Büyük seçenek kartları, emoji destekli, max 3 kez tekrar dinleme.
 */

import { getWordEmoji } from '@/features/learning/data/wordEmojiMap';
import type { ListenAndTapData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface ListenAndTapActivityProps extends ActivityCallbacks {
  data: ListenAndTapData;
}

export default function ListenAndTapActivity({ data, onComplete }: ListenAndTapActivityProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [listenCount, setListenCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const startTime = useRef(Date.now());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (showAnswerTimerRef.current) clearTimeout(showAnswerTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  // TTS via centralized speechService
  const speak = useCallback((text: string) => {
    void ttsSpeak(text, { rate: 0.8 });
  }, []);

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(data.correctAnswer);
      setListenCount(1);
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [data.correctAnswer, speak]);

  const handleListen = useCallback(() => {
    if (listenCount >= 3) return;
    speak(data.correctAnswer);
    setListenCount((c) => c + 1);
  }, [data.correctAnswer, listenCount, speak]);

  const handleSelect = useCallback(
    (option: string) => {
      if (isCorrect !== null) return; // already answered

      setSelected(option);
      setAttempts((a) => a + 1);

      const correct = option === data.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        // Success — speak in context
        speak(data.correctAnswer);
        completionTimerRef.current = setTimeout(() => {
          const elapsed = Math.round((Date.now() - startTime.current) / 1000);
          onComplete({
            isCorrect: true,
            score: attempts === 0 ? 100 : Math.max(50, 100 - attempts * 25),
            timeSpentSeconds: elapsed,
            attempts: attempts + 1,
            hintsUsed: 0,
          });
        }, 1200);
      } else {
        // Wrong — shake and show correct after brief delay
        showAnswerTimerRef.current = setTimeout(() => {
          setShowAnswer(true);
        }, 600);
        wrongTimerRef.current = setTimeout(() => {
          const elapsed = Math.round((Date.now() - startTime.current) / 1000);
          onComplete({
            isCorrect: false,
            score: 0,
            timeSpentSeconds: elapsed,
            attempts: attempts + 1,
            hintsUsed: 0,
          });
        }, 2500);
      }
    },
    [isCorrect, data.correctAnswer, speak, onComplete, attempts],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      {/* Title */}
      <Text variant="h3" align="center">
        👂 Dinle ve Seç
      </Text>

      {/* Audio control */}
      <motion.button
        className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl shadow-xl transition-colors ${
          listenCount >= 3
            ? 'bg-gray-200 text-gray-400'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleListen}
        disabled={listenCount >= 3}
      >
        🔊
      </motion.button>

      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 w-2 rounded-full transition-colors ${
              n <= listenCount ? 'bg-blue-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <Text variant="caption" className="text-text-secondary -mt-3">
        {listenCount >= 3 ? 'Dinleme hakkın bitti' : `${3 - listenCount} kez daha dinleyebilirsin`}
      </Text>

      {/* Options grid 2x2 */}
      <div className="grid w-full grid-cols-2 gap-3">
        {data.options.map((option) => {
          const isThis = selected === option;
          const isAnswer = option === data.correctAnswer;
          let bg = 'bg-white border-2 border-gray-200 hover:border-blue-300';
          let textColor = 'text-gray-800';

          if (isCorrect !== null) {
            if (isAnswer && (isThis || showAnswer)) {
              bg = 'bg-green-100 border-2 border-green-400';
              textColor = 'text-green-700';
            } else if (isThis && !isAnswer) {
              bg = 'bg-red-100 border-2 border-red-400';
              textColor = 'text-red-600';
            } else {
              bg = 'bg-gray-50 border-2 border-gray-100';
              textColor = 'text-gray-400';
            }
          }

          return (
            <motion.button
              key={option}
              className={`${bg} ${textColor} flex flex-col items-center gap-2 rounded-2xl p-4 transition-all`}
              onClick={() => {
                handleSelect(option);
              }}
              disabled={isCorrect !== null}
              whileTap={{ scale: 0.95 }}
              animate={
                isThis && isCorrect === false
                  ? { x: [0, -6, 6, -6, 6, 0] }
                  : isThis && isCorrect === true
                    ? { scale: [1, 1.08, 1] }
                    : {}
              }
              transition={{ duration: 0.4 }}
            >
              <span className="text-4xl">{getWordEmoji(option)}</span>
              <span className="text-sm font-bold">{option}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-4 py-2 text-center ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            <Text variant="body" weight="bold">
              {isCorrect ? '🎉 Doğru! Harika!' : `❌ Doğru cevap: ${data.correctAnswer}`}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
