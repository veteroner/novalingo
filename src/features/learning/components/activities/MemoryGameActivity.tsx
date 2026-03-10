/**
 * MemoryGameActivity
 *
 * Hafıza kartı oyunu — 2'şer kart çevirerek eşleştir.
 * İngilizce kelimeleri Türkçe çevirileriyle eşleştir.
 * Grid boyutu: data.gridSize (rows × cols)
 */

import { getWordEmoji } from '@/features/learning/data/wordEmojiMap';
import type { MemoryGameData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface MemoryGameActivityProps extends ActivityCallbacks {
  data: MemoryGameData;
}

interface CardState {
  id: string;
  matchId: string;
  content: string;
  contentType: 'text' | 'image' | 'audio';
  isFlipped: boolean;
  isMatched: boolean;
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export default function MemoryGameActivity({ data, onComplete }: MemoryGameActivityProps) {
  const startTime = useRef(Date.now());
  const wrongAttempts = useRef(0);
  const [cards, setCards] = useState<CardState[]>(() =>
    shuffle(
      data.cards.map((c) => ({
        ...c,
        isFlipped: false,
        isMatched: false,
      })),
    ),
  );
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { rows, cols } = data.gridSize;

  // Kart tıklama
  const handleCardTap = useCallback(
    (cardId: string) => {
      if (isChecking || isComplete) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      // Flip card
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));

      const newFlipped = [...flippedIds, cardId];
      setFlippedIds(newFlipped);

      // 2 kart çevrildi → eşleştirme kontrolü
      if (newFlipped.length === 2) {
        setIsChecking(true);
        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId);
        const second = cards.find((c) => c.id === secondId);

        if (first && second && first.matchId === second.matchId) {
          // Match! ✅
          flipTimerRef.current = setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 600);
        } else {
          // No match ❌
          wrongAttempts.current += 1;
          flipTimerRef.current = setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, isComplete],
  );

  // Tamamlanma kontrolü
  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every((c) => c.isMatched);
    if (allMatched && !isComplete) {
      setIsComplete(true);
      const totalPairs = cards.length / 2;
      const accuracy = totalPairs / (totalPairs + wrongAttempts.current);
      const score = Math.max(50, Math.round(accuracy * 100));

      completionTimerRef.current = setTimeout(() => {
        onComplete({
          isCorrect: true,
          score,
          timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
          attempts: wrongAttempts.current + totalPairs,
          hintsUsed: 0,
        });
      }, 1000);
    }
  }, [cards, isComplete, onComplete]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  const matchedCount = cards.filter((c) => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center">
        <Text variant="overline" className="mb-1 text-purple-500">
          🧩 HAFIZA OYUNU
        </Text>
        <Text variant="body" className="text-text-secondary">
          Eşleşen kartları bul!
        </Text>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: totalPairs }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-3 w-3 rounded-full ${i < matchedCount ? 'bg-green-400' : 'bg-gray-200'}`}
            animate={i < matchedCount ? { scale: [1, 1.3, 1] } : {}}
          />
        ))}
      </div>

      {/* Card Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.button
              key={card.id}
              className={`flex aspect-square items-center justify-center rounded-2xl p-2 text-center transition-all duration-300 ${
                card.isMatched
                  ? 'border-2 border-green-300 bg-green-100 opacity-60'
                  : card.isFlipped
                    ? 'border-2 border-blue-400 bg-white shadow-md'
                    : 'bg-linear-to-br from-blue-400 to-purple-500 shadow-md'
              }`}
              onClick={() => {
                handleCardTap(card.id);
              }}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
              layout
            >
              {card.isFlipped || card.isMatched ? (
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">{getWordEmoji(card.content)}</span>
                  <span
                    className={`text-xs leading-tight font-bold ${
                      card.isMatched ? 'text-green-600' : 'text-gray-800'
                    }`}
                  >
                    {card.content}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  className="text-3xl text-white"
                >
                  ❓
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Complete animation */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4 text-center"
        >
          <div className="mb-2 text-5xl">🎉</div>
          <Text variant="h3" className="text-green-600">
            Harika!
          </Text>
          <Text variant="bodySmall" className="text-gray-400">
            Tüm kartları eşleştirdin!
          </Text>
        </motion.div>
      )}
    </div>
  );
}
