/**
 * FlashCardActivity
 *
 * Yeni kelimeleri tanıtma — 3D flip kart animasyonu.
 * Ön yüz: Emoji/Resim + İngilizce kelime + Ses butonu
 * Arka yüz: Türkçe çeviri + Örnek cümle
 * Tüm kartlar görüldükten sonra tamamlanır.
 */

import { getWordEmoji } from '@/features/learning/data/wordEmojiMap';
import type { FlashCardData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface FlashCardActivityProps extends ActivityCallbacks {
  data: FlashCardData;
}

export default function FlashCardActivity({ data, onComplete }: FlashCardActivityProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasSeenBack, setHasSeenBack] = useState(false);
  const startTime = useRef(Date.now());

  // TTS via centralized speechService — prefer audioUrl when available
  const speak = useCallback(
    (text: string, slow = false) => {
      void ttsSpeak(text, { rate: slow ? 0.6 : 0.85, audioUrl: data.audioUrl || undefined });
    },
    [data.audioUrl],
  );

  // Auto-play pronunciation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(data.word);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [data.word, speak]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      if (!prev) setHasSeenBack(true);
      return !prev;
    });
  }, []);

  const handleComplete = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    onComplete({
      isCorrect: true,
      score: 100,
      timeSpentSeconds: elapsed,
      attempts: 1,
      hintsUsed: 0,
    });
  }, [onComplete]);

  const emoji = getWordEmoji(data.word);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
      {/* Instruction */}
      <Text variant="bodySmall" className="text-text-secondary">
        Kartı çevirmek için dokun 👆
      </Text>

      {/* 3D Flip Card */}
      <div
        className="relative h-96 w-72 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* FRONT — English word + emoji */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-blue-200 bg-linear-to-br from-blue-50 to-blue-100 p-6 shadow-xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <motion.div
              className="text-8xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {emoji}
            </motion.div>

            <Text variant="h2" align="center" className="text-blue-700">
              {data.word}
            </Text>

            {/* Audio buttons */}
            <div className="mt-2 flex gap-3">
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl text-white shadow-md transition-transform active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(data.word);
                }}
                aria-label="Dinle"
              >
                🔊
              </button>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-300 text-xl text-white shadow-md transition-transform active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(data.word, true);
                }}
                aria-label="Yavaş dinle"
              >
                🐢
              </button>
            </div>

            <Text variant="caption" className="mt-1 text-blue-400">
              Çevirmek için dokun
            </Text>
          </div>

          {/* BACK — Turkish translation + example sentence */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border-4 border-green-200 bg-linear-to-br from-green-50 to-green-100 p-6 shadow-xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="mb-2 text-5xl">{emoji}</div>

            <Text variant="h3" align="center" className="text-green-700">
              {data.translation}
            </Text>

            <div className="mt-1 w-full border-t border-green-200 pt-3">
              <Text variant="caption" className="block text-center text-green-500">
                Örnek Cümle:
              </Text>
              <Text variant="body" align="center" className="mt-1 font-medium text-green-800">
                "{data.exampleSentence}"
              </Text>
              <Text variant="bodySmall" align="center" className="mt-1 text-green-500 italic">
                {data.exampleTranslation}
              </Text>
            </div>

            <button
              className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-lg text-white shadow-md transition-transform active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                speak(data.exampleSentence);
              }}
              aria-label="Cümleyi dinle"
            >
              🔊
            </button>
          </div>
        </motion.div>
      </div>

      {/* Continue button — only after seeing back */}
      <AnimatePresence>
        {hasSeenBack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-xs"
          >
            <Button variant="success" size="lg" fullWidth onClick={handleComplete}>
              Öğrendim! Devam Et ✨
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
