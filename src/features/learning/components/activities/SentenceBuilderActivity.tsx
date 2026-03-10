/**
 * SentenceBuilderActivity
 *
 * Cümle oluşturma — kelime dizme becerisi.
 * Karışık kelimeler gösterilir, doğru sırayla tıklayarak cümle kurulur.
 * Türkçe çeviri ipucu olarak gösterilir.
 */

import type { SentenceBuilderData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface SentenceBuilderActivityProps extends ActivityCallbacks {
  data: SentenceBuilderData;
}

export default function SentenceBuilderActivity({
  data,
  onComplete,
}: SentenceBuilderActivityProps) {
  const startTime = useRef(Date.now());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const speak = useCallback((text: string) => {
    void ttsSpeak(text, { rate: 0.8 });
  }, []);

  // Speak the sentence slowly on mount
  useEffect(() => {
    const t = setTimeout(() => {
      speak(data.sentence);
    }, 400);
    return () => {
      clearTimeout(t);
    };
  }, [data.sentence, speak]);

  const builtWords = placedIndices.map((i) => data.words[i] ?? '');

  const handleWordTap = useCallback(
    (wordIndex: number) => {
      if (isComplete) return;
      if (placedIndices.includes(wordIndex)) return;

      const nextPos = placedIndices.length;
      const expected = data.correctOrder[nextPos];
      const tapped = data.words[wordIndex];

      if (tapped?.toLowerCase() === expected?.toLowerCase()) {
        const newPlaced = [...placedIndices, wordIndex];
        setPlacedIndices(newPlaced);

        if (newPlaced.length === data.correctOrder.length) {
          setIsComplete(true);
          speak(data.sentence);
          completionTimerRef.current = setTimeout(() => {
            const elapsed = Math.round((Date.now() - startTime.current) / 1000);
            onComplete({
              isCorrect: true,
              score: Math.max(50, 100 - attempts * 10 - hintsUsed * 15),
              timeSpentSeconds: elapsed,
              attempts: attempts + 1,
              hintsUsed,
            });
          }, 1500);
        }
      } else {
        setAttempts((a) => a + 1);
        setWrongShake(true);
        shakeTimerRef.current = setTimeout(() => {
          setWrongShake(false);
        }, 500);
      }
    },
    [isComplete, placedIndices, data, speak, onComplete, attempts, hintsUsed],
  );

  const handleUndo = useCallback(() => {
    if (placedIndices.length === 0 || isComplete) return;
    setPlacedIndices((prev) => prev.slice(0, -1));
  }, [placedIndices, isComplete]);

  const handleHint = useCallback(() => {
    if (isComplete) return;
    const nextPos = placedIndices.length;
    const expected = data.correctOrder[nextPos];
    const matchIndex = data.words.findIndex(
      (w, i) => w.toLowerCase() === expected?.toLowerCase() && !placedIndices.includes(i),
    );
    if (matchIndex >= 0) {
      setHintsUsed((h) => h + 1);
      handleWordTap(matchIndex);
    }
  }, [isComplete, placedIndices, data, handleWordTap]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
      {/* Title */}
      <Text variant="h3" align="center">
        📝 Cümleyi Oluştur
      </Text>

      {/* Translation hint */}
      <div className="rounded-xl bg-blue-50 px-4 py-2 text-center">
        <Text variant="bodySmall" className="text-text-secondary">
          Türkçesi:
        </Text>
        <Text variant="body" className="font-semibold text-blue-700">
          {data.translation}
        </Text>
      </div>

      {/* Audio button */}
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg text-white shadow active:scale-95"
        onClick={() => {
          speak(data.sentence);
        }}
      >
        🔊
      </button>

      {/* Built sentence area */}
      <motion.div
        className="flex min-h-12 flex-wrap justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3"
        animate={wrongShake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {builtWords.length === 0 ? (
          <Text variant="bodySmall" className="text-text-secondary italic">
            Kelimelere tıklayarak cümle kur...
          </Text>
        ) : (
          builtWords.map((word, idx) => (
            <motion.span
              key={idx}
              className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {word}
            </motion.span>
          ))
        )}
      </motion.div>

      {/* Scrambled word tiles */}
      <div className="flex max-w-sm flex-wrap justify-center gap-2">
        {data.words.map((word, idx) => {
          const isPlaced = placedIndices.includes(idx);

          return (
            <motion.button
              key={idx}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                isPlaced
                  ? 'border-2 border-gray-200 bg-gray-100 text-transparent'
                  : 'border-2 border-gray-300 bg-white text-gray-800 shadow-md hover:border-blue-400 hover:shadow-lg active:scale-90'
              }`}
              onClick={() => {
                handleWordTap(idx);
              }}
              disabled={isPlaced || isComplete}
              whileTap={{ scale: 0.9 }}
              layout
            >
              {isPlaced ? '·' : word}
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={placedIndices.length === 0 || isComplete}
        >
          ↩ Geri Al
        </Button>
        <Button variant="secondary" size="sm" onClick={handleHint} disabled={isComplete}>
          💡 İpucu
        </Button>
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-green-100 px-6 py-3 text-center"
          >
            <Text variant="h3" className="text-green-700">
              ✨ Harika!
            </Text>
            <Text variant="body" className="text-green-600">
              {data.sentence}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
