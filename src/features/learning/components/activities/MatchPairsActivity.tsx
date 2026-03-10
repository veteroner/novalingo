/**
 * MatchPairsActivity
 *
 * Kelime-çeviri eşleştirme — tap-tap mekanik.
 * Sol sütun: İngilizce kelimeler
 * Sağ sütun: Türkçe karşılıklar (karışık sıra)
 * Eşleşen çiftler animasyonla kaybolur.
 */

import type { MatchPairsData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface MatchPairsActivityProps extends ActivityCallbacks {
  data: MatchPairsData;
}

interface PairState {
  id: string;
  left: string;
  right: string;
  matched: boolean;
}

export default function MatchPairsActivity({ data, onComplete }: MatchPairsActivityProps) {
  const startTime = useRef(Date.now());
  const wrongAttempts = useRef(0);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  // Shuffle right side on mount
  const pairs = useMemo<PairState[]>(
    () => data.pairs.map((p) => ({ id: p.id, left: p.left, right: p.right, matched: false })),
    [data.pairs],
  );

  const shuffledRight = useMemo(() => {
    const items = data.pairs.map((p) => ({ id: p.id, text: p.right }));
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = items[i] as (typeof items)[number];
      items[i] = items[j] as (typeof items)[number];
      items[j] = tmp;
    }
    return items;
  }, [data.pairs]);

  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [shakeId, setShakeId] = useState<string | null>(null);

  // TTS via centralized speechService
  const speak = useCallback((text: string) => {
    void ttsSpeak(text);
  }, []);

  const checkMatch = useCallback(
    (leftId: string, rightId: string) => {
      if (leftId === rightId) {
        // Match!
        setFeedback('correct');

        // Say the English word when matched
        const matched = pairs.find((p) => p.id === leftId);
        if (matched) speak(matched.left);

        matchTimerRef.current = setTimeout(() => {
          setMatchedIds((prev) => {
            const newMatched = new Set(prev);
            newMatched.add(leftId);

            // All matched?
            if (newMatched.size === pairs.length) {
              const elapsed = Math.round((Date.now() - startTime.current) / 1000);
              const accuracy = pairs.length / (pairs.length + wrongAttempts.current);
              onComplete({
                isCorrect: true,
                score: Math.round(accuracy * 100),
                timeSpentSeconds: elapsed,
                attempts: pairs.length + wrongAttempts.current,
                hintsUsed: 0,
              });
            }

            return newMatched;
          });
          setSelectedLeft(null);
          setSelectedRight(null);
          setFeedback('idle');
        }, 600);
      } else {
        // Wrong
        setFeedback('wrong');
        wrongAttempts.current += 1;
        setShakeId(rightId);

        shakeTimerRef.current = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setFeedback('idle');
          setShakeId(null);
        }, 800);
      }
    },
    [pairs, onComplete, speak],
  );

  const handleLeftTap = useCallback(
    (pairId: string) => {
      if (matchedIds.has(pairId) || feedback !== 'idle') return;
      setSelectedLeft(pairId);

      // If right is already selected, check match
      if (selectedRight !== null) {
        checkMatch(pairId, selectedRight);
      }
    },
    [matchedIds, feedback, selectedRight, checkMatch],
  );

  const handleRightTap = useCallback(
    (pairId: string) => {
      if (matchedIds.has(pairId) || feedback !== 'idle') return;
      setSelectedRight(pairId);

      // If left is already selected, check match
      if (selectedLeft !== null) {
        checkMatch(selectedLeft, pairId);
      }
    },
    [matchedIds, feedback, selectedLeft, checkMatch],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
      {/* Title */}
      <div className="text-center">
        <Text variant="h3">🔗 Eşleştir</Text>
        <Text variant="bodySmall" className="text-text-secondary">
          İngilizce kelimeyi Türkçe karşılığıyla eşleştir
        </Text>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {pairs.map((p) => (
          <motion.div
            key={p.id}
            className={`h-3 w-3 rounded-full transition-colors ${
              matchedIds.has(p.id) ? 'bg-green-400' : 'bg-gray-200'
            }`}
            animate={matchedIds.has(p.id) ? { scale: [1, 1.5, 1] } : {}}
          />
        ))}
      </div>

      {/* Pairs grid */}
      <div className="flex w-full gap-4">
        {/* Left column — English */}
        <div className="flex flex-1 flex-col gap-3">
          <Text variant="caption" weight="bold" className="text-center text-blue-500">
            English 🇬🇧
          </Text>
          <AnimatePresence>
            {pairs.map((pair) => (
              <motion.button
                key={pair.id}
                layout
                className={`relative w-full rounded-2xl px-3 py-4 text-center text-base font-bold transition-all ${
                  matchedIds.has(pair.id)
                    ? 'border-2 border-green-300 bg-green-100 text-green-600 opacity-50'
                    : selectedLeft === pair.id
                      ? feedback === 'correct'
                        ? 'border-2 border-green-400 bg-green-100 text-green-700 shadow-lg'
                        : feedback === 'wrong'
                          ? 'border-2 border-red-400 bg-red-100 text-red-700'
                          : 'border-2 border-blue-400 bg-blue-100 text-blue-700 shadow-lg'
                      : 'border-2 border-gray-200 bg-white text-gray-800 hover:border-blue-300 active:scale-95'
                }`}
                onClick={() => {
                  handleLeftTap(pair.id);
                  speak(pair.left);
                }}
                disabled={matchedIds.has(pair.id)}
                whileTap={{ scale: 0.95 }}
              >
                {pair.left}
                {matchedIds.has(pair.id) && (
                  <span className="absolute top-1 right-2 text-green-500">✓</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Right column — Turkish */}
        <div className="flex flex-1 flex-col gap-3">
          <Text variant="caption" weight="bold" className="text-center text-orange-500">
            Türkçe 🇹🇷
          </Text>
          <AnimatePresence>
            {shuffledRight.map((item) => (
              <motion.button
                key={item.id}
                layout
                className={`relative w-full rounded-2xl px-3 py-4 text-center text-base font-bold transition-all ${
                  matchedIds.has(item.id)
                    ? 'border-2 border-green-300 bg-green-100 text-green-600 opacity-50'
                    : selectedRight === item.id
                      ? feedback === 'correct'
                        ? 'border-2 border-green-400 bg-green-100 text-green-700 shadow-lg'
                        : feedback === 'wrong'
                          ? 'border-2 border-red-400 bg-red-100 text-red-700'
                          : 'border-2 border-orange-400 bg-orange-100 text-orange-700 shadow-lg'
                      : 'border-2 border-gray-200 bg-white text-gray-800 hover:border-orange-300 active:scale-95'
                }`}
                onClick={() => {
                  handleRightTap(item.id);
                }}
                disabled={matchedIds.has(item.id)}
                animate={shakeId === item.id ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={shakeId === item.id ? { duration: 0.4 } : {}}
                whileTap={{ scale: 0.95 }}
              >
                {item.text}
                {matchedIds.has(item.id) && (
                  <span className="absolute top-1 right-2 text-green-500">✓</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* All matched celebration */}
      <AnimatePresence>
        {matchedIds.size === pairs.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Text variant="h3" className="text-green-600">
              🎉 Harika!
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
