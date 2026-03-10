/**
 * WordBuilderActivity
 *
 * Harf karolarıyla kelime oluşturma — spelling/yazım becerisi.
 * Karışık harfler + distractor harfler gösterilir.
 * Sürükle veya tıkla ile kelimeyi oluştur.
 */

import { getWordEmoji } from '@/features/learning/data/wordEmojiMap';
import type { WordBuilderData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface WordBuilderActivityProps extends ActivityCallbacks {
  data: WordBuilderData;
}

interface LetterTile {
  id: string;
  letter: string;
  isDistractor: boolean;
}

export default function WordBuilderActivity({ data, onComplete }: WordBuilderActivityProps) {
  const startTime = useRef(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const targetWord = data.word.toUpperCase();
  const targetLetters = targetWord.split('');

  // Build tiles: real letters + 2 distractors
  const tiles = useMemo<LetterTile[]>(() => {
    const real = data.scrambledLetters.map((l, i) => ({
      id: `r${i}`,
      letter: l.toUpperCase(),
      isDistractor: false,
    }));

    // Add 2 distractor letters
    const distractors = 'XZQWJK'
      .split('')
      .filter((c) => !targetWord.includes(c))
      .slice(0, 2)
      .map((l, i) => ({
        id: `d${i}`,
        letter: l,
        isDistractor: true,
      }));

    const all = [...real, ...distractors];
    // Shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = all[i] as (typeof all)[number];
      all[i] = all[j] as (typeof all)[number];
      all[j] = tmp;
    }
    return all;
  }, [data.scrambledLetters, targetWord]);

  // State: which tiles were placed, in order
  const [placedTileIds, setPlacedTileIds] = useState<string[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // The current built letters
  const builtLetters = placedTileIds.map((id) => tiles.find((t) => t.id === id)?.letter ?? '');

  // Check letter-by-letter correctness
  const letterStates = builtLetters.map((letter, index) => {
    const expected = targetLetters[index];
    return letter === expected ? 'correct' : 'wrong';
  });

  // TTS via centralized speechService
  const speak = useCallback((text: string) => {
    void ttsSpeak(text, { rate: 0.8 });
  }, []);

  // Speak word on mount
  useEffect(() => {
    const t = setTimeout(() => {
      speak(data.word);
    }, 400);
    return () => {
      clearTimeout(t);
    };
  }, [data.word, speak]);

  const handleTileTap = useCallback(
    (tileId: string) => {
      if (isComplete) return;
      if (placedTileIds.includes(tileId)) return;

      const tile = tiles.find((t) => t.id === tileId);
      if (!tile) return;

      const nextIndex = placedTileIds.length;
      const expected = targetLetters[nextIndex];

      if (tile.letter === expected) {
        // Correct letter!
        const newPlaced = [...placedTileIds, tileId];
        setPlacedTileIds(newPlaced);

        // Check if word is complete
        if (newPlaced.length === targetLetters.length) {
          setIsComplete(true);
          speak(data.word);
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
        // Wrong letter — shake
        setAttempts((a) => a + 1);
        setWrongShake(true);
        shakeTimerRef.current = setTimeout(() => {
          setWrongShake(false);
        }, 500);
      }
    },
    [
      isComplete,
      placedTileIds,
      tiles,
      targetLetters,
      speak,
      data.word,
      onComplete,
      attempts,
      hintsUsed,
    ],
  );

  // Remove last placed tile
  const handleUndo = useCallback(() => {
    if (placedTileIds.length === 0 || isComplete) return;
    setPlacedTileIds((prev) => prev.slice(0, -1));
  }, [placedTileIds, isComplete]);

  // Hint: reveal next letter
  const handleHint = useCallback(() => {
    if (isComplete) return;
    const nextIndex = placedTileIds.length;
    const expected = targetLetters[nextIndex];
    const matchingTile = tiles.find((t) => t.letter === expected && !placedTileIds.includes(t.id));
    if (matchingTile) {
      setHintsUsed((h) => h + 1);
      handleTileTap(matchingTile.id);
    }
  }, [isComplete, placedTileIds, targetLetters, tiles, handleTileTap]);

  const emoji = getWordEmoji(data.word);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
      {/* Title */}
      <Text variant="h3" align="center">
        🔤 Kelimeyi Oluştur
      </Text>

      {/* Word display: emoji + audio */}
      <div className="flex items-center gap-4">
        <span className="text-6xl">{emoji}</span>
        <div className="text-center">
          <Text variant="bodySmall" className="text-text-secondary">
            {data.translation}
          </Text>
          <button
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-lg text-white shadow active:scale-95"
            onClick={() => {
              speak(data.word);
            }}
          >
            🔊
          </button>
        </div>
      </div>

      {/* Answer slots */}
      <motion.div
        className="flex justify-center gap-2"
        animate={wrongShake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {targetLetters.map((_, index) => {
          const placed = builtLetters[index];
          const state = letterStates[index];

          return (
            <motion.div
              key={index}
              className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-xl font-black transition-colors ${
                placed
                  ? state === 'correct'
                    ? 'border-green-400 bg-green-100 text-green-700'
                    : 'border-red-400 bg-red-100 text-red-700'
                  : index === placedTileIds.length
                    ? 'border-dashed border-blue-300 bg-blue-50'
                    : 'border-dashed border-gray-200 bg-gray-50'
              }`}
              animate={placed && state === 'correct' ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {placed ?? ''}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Letter tiles */}
      <div className="flex max-w-xs flex-wrap justify-center gap-2">
        {tiles.map((tile) => {
          const isPlaced = placedTileIds.includes(tile.id);

          return (
            <motion.button
              key={tile.id}
              className={`h-12 w-12 rounded-xl text-lg font-black transition-all ${
                isPlaced
                  ? 'border-2 border-gray-200 bg-gray-100 text-transparent'
                  : 'border-2 border-gray-300 bg-white text-gray-800 shadow-md hover:border-blue-400 hover:shadow-lg active:scale-90'
              }`}
              onClick={() => {
                handleTileTap(tile.id);
              }}
              disabled={isPlaced || isComplete}
              whileTap={{ scale: 0.85 }}
              layout
            >
              {isPlaced ? '·' : tile.letter}
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
          disabled={placedTileIds.length === 0 || isComplete}
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
              ✨ Mükemmel!
            </Text>
            <Text variant="body" className="text-green-600">
              {data.word} = {data.translation}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
