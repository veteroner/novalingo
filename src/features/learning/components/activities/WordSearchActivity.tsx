/**
 * WordSearchActivity
 *
 * Kelime bulmaca — grid içinde gizli kelimeleri bul.
 * Harflere tıklayarak/sürükleyerek kelime seç.
 * Bulunan kelimeler vurgulanır.
 */

import type { WordSearchData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface WordSearchActivityProps extends ActivityCallbacks {
  data: WordSearchData;
}

interface FoundWord {
  word: string;
  cells: string[]; // "row-col" keys
}

export default function WordSearchActivity({ data, onComplete }: WordSearchActivityProps) {
  const startTime = useRef(Date.now());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const wrongAttempts = useRef(0);
  const wrongFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { grid, words, gridSize } = data;
  const totalWords = words.length;

  // Hangi hücreler bulunan kelimelere ait?
  const foundCellSet = new Set(foundWords.flatMap((fw) => fw.cells));

  // Kelime hücrelerini hesapla
  const getWordCells = useCallback((w: (typeof words)[number]): string[] => {
    const cells: string[] = [];
    const dirMap: Record<string, [number, number]> = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
    };
    const [dr, dc] = dirMap[w.direction] ?? [0, 1];
    for (let i = 0; i < w.word.length; i++) {
      cells.push(`${w.startRow + dr * i}-${w.startCol + dc * i}`);
    }
    return cells;
  }, []);

  // Hücre tıklama — seçim başlat/devam
  const handleCellTap = useCallback(
    (row: number, col: number) => {
      if (isComplete) return;
      const key = `${row}-${col}`;

      if (!isSelecting) {
        setIsSelecting(true);
        setSelectedCells([key]);
      } else {
        // Zaten seçili mi?
        if (selectedCells.includes(key)) {
          // Kaldır (son hücre ise)
          if (selectedCells[selectedCells.length - 1] === key) {
            setSelectedCells((prev) => prev.slice(0, -1));
            if (selectedCells.length === 1) {
              setIsSelecting(false);
            }
          }
          return;
        }

        // Doğrusal mı kontrol et (yatay, dikey, çapraz)
        const firstCell = selectedCells[0];
        if (firstCell) {
          const [sr, sc] = firstCell.split('-').map(Number);
          const dr = row - (sr ?? 0);
          const dc = col - (sc ?? 0);
          const len = selectedCells.length;

          // Bir yönde devam etmeli
          const expectedR = (sr ?? 0) + Math.sign(dr) * len;
          const expectedC = (sc ?? 0) + Math.sign(dc) * len;

          if (row === expectedR && col === expectedC) {
            setSelectedCells((prev) => [...prev, key]);
          }
        }
      }
    },
    [isSelecting, selectedCells, isComplete],
  );

  // Seçimi onayla
  const confirmSelection = useCallback(() => {
    if (selectedCells.length < 2) {
      setSelectedCells([]);
      setIsSelecting(false);
      return;
    }

    // Seçilen harflerden kelime oluştur
    const selectedWord = selectedCells
      .map((key) => {
        const [r, c] = key.split('-').map(Number);
        return grid[r ?? 0]?.[c ?? 0] ?? '';
      })
      .join('');

    // Eşleşen kelime var mı?
    const matchedWord = words.find((w) => {
      const wordCells = getWordCells(w);
      if (wordCells.length !== selectedCells.length) return false;
      return wordCells.every((c, i) => c === selectedCells[i]);
    });

    if (matchedWord && !foundWords.some((fw) => fw.word === matchedWord.word)) {
      setFoundWords((prev) => [...prev, { word: matchedWord.word, cells: selectedCells }]);
    } else {
      wrongAttempts.current += 1;
      setWrongFlash(true);
      wrongFlashTimerRef.current = setTimeout(() => {
        setWrongFlash(false);
      }, 400);
    }

    // Reset seçim — suppress lint: selectedWord kullanılıyor log'da
    void selectedWord;
    setSelectedCells([]);
    setIsSelecting(false);
  }, [selectedCells, grid, words, getWordCells, foundWords]);

  // Tamamlanma kontrolü
  useEffect(() => {
    if (foundWords.length === totalWords && totalWords > 0 && !isComplete) {
      setIsComplete(true);
      const accuracy = totalWords / (totalWords + wrongAttempts.current);
      const score = Math.max(50, Math.round(accuracy * 100));

      completionTimerRef.current = setTimeout(() => {
        onComplete({
          isCorrect: true,
          score,
          timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
          attempts: wrongAttempts.current + totalWords,
          hintsUsed: 0,
        });
      }, 1200);
    }
  }, [foundWords, totalWords, isComplete, onComplete]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (wrongFlashTimerRef.current) clearTimeout(wrongFlashTimerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center">
        <Text variant="overline" className="mb-1 text-emerald-600">
          🔍 KELİME BULMACA
        </Text>
        <Text variant="bodySmall" className="text-text-secondary">
          Gizli kelimeleri bul! Harfleri sırayla tıkla.
        </Text>
      </div>

      {/* Word list — bulunan / bulunacak */}
      <div className="flex flex-wrap justify-center gap-2">
        {words.map((w) => {
          const isFound = foundWords.some((fw) => fw.word === w.word);
          return (
            <motion.div
              key={w.word}
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                isFound ? 'bg-green-100 text-green-600 line-through' : 'bg-gray-100 text-gray-700'
              }`}
              animate={isFound ? { scale: [1, 1.2, 1] } : {}}
            >
              {w.word}
              <span className="ml-1 text-xs text-gray-400">({w.translation})</span>
            </motion.div>
          );
        })}
      </div>

      {/* Grid */}
      <motion.div
        className={`rounded-2xl bg-white p-3 shadow-lg ${wrongFlash ? 'ring-2 ring-red-400' : ''}`}
        animate={wrongFlash ? { x: [0, -4, 4, -2, 2, 0] } : {}}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.map((row, ri) =>
            row.map((letter, ci) => {
              const key = `${ri}-${ci}`;
              const isSelected = selectedCells.includes(key);
              const isFound = foundCellSet.has(key);

              return (
                <motion.button
                  key={key}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-black transition-colors ${
                    isFound
                      ? 'bg-green-200 text-green-700'
                      : isSelected
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    handleCellTap(ri, ci);
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {letter}
                </motion.button>
              );
            }),
          )}
        </div>
      </motion.div>

      {/* Confirm / Cancel buttons */}
      {isSelecting && selectedCells.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-3"
        >
          <button
            className="rounded-full bg-gray-200 px-6 py-2 font-bold text-gray-600 transition-transform active:scale-95"
            onClick={() => {
              setSelectedCells([]);
              setIsSelecting(false);
            }}
          >
            İptal
          </button>
          <button
            className="rounded-full bg-blue-500 px-6 py-2 font-bold text-white transition-transform active:scale-95"
            onClick={confirmSelection}
          >
            Onayla ✓
          </button>
        </motion.div>
      )}

      {/* Completion */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-2 text-center"
          >
            <div className="text-5xl">🎉</div>
            <Text variant="h3" className="text-green-600">
              Tüm kelimeleri buldun!
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
