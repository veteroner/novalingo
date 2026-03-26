/**
 * StoryTimeActivity
 *
 * İnteraktif hikaye — sayfa sayfa ilerleme, vurgulu kelimeler (tap-word),
 * TTS ile dinleme, sayfa geçiş animasyonları.
 */

import { STORY_TTS_FALLBACK_MARKER } from '@/features/learning/data/storyBank';
import type { StoryTimeData } from '@/types/content';
import { generateStoryPlaceholderImage } from '@/utils/mediaFallback';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface StoryTimeActivityProps extends ActivityCallbacks {
  data: StoryTimeData;
}

/** TTS ile metni seslendir — prefer audioUrl when available */
function speak(text: string, audioUrl?: string, lang = 'en-US') {
  const resolvedAudioUrl =
    audioUrl && audioUrl !== STORY_TTS_FALLBACK_MARKER ? audioUrl : undefined;
  void ttsSpeak(text, { lang, audioUrl: resolvedAudioUrl });
}

/** Emoji haritası — basit tema ipuçları */
const STORY_EMOJIS: Record<string, string> = {
  forest: '🌲',
  sea: '🌊',
  city: '🏙️',
  farm: '🐄',
  space: '🚀',
  castle: '🏰',
  garden: '🌻',
};

export default function StoryTimeActivity({ data, onComplete }: StoryTimeActivityProps) {
  const startTime = useRef(Date.now());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [tappedWords, setTappedWords] = useState<Set<string>>(new Set());
  const [totalTapped, setTotalTapped] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const pages = data.pages;
  const page = pages[currentPage];
  const totalPages = pages.length;

  // Sayfa metnini kelime dizisine ayır
  const pageWords = page?.text.split(/\s+/) ?? [];

  // Tüm sayfaların toplam vurgulu kelime sayısı
  const totalHighlights = pages.reduce((sum, p) => sum + p.highlightWords.length, 0);

  // Kelimeye tıklama
  const handleWordTap = useCallback(
    (word: string) => {
      if (!page) return;
      // Sadece harf/rakam bırak — noktalama kaldır
      const clean = word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/g, '').toLowerCase();

      const isHighlight = page.highlightWords.some((hw) => hw.toLowerCase() === clean);

      if (isHighlight && !tappedWords.has(clean)) {
        setTappedWords((prev) => new Set([...prev, clean]));
        setTotalTapped((prev) => prev + 1);
      }

      // Kelimeyi seslendir
      speak(clean);
    },
    [page, tappedWords],
  );

  // Sayfa ileri
  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      setTappedWords(new Set());
    } else {
      // Hikaye bitti
      setIsFinishing(true);
      const accuracy = totalHighlights > 0 ? totalTapped / totalHighlights : 1;
      const finalScore = Math.max(60, Math.round(accuracy * 100));

      completionTimerRef.current = setTimeout(() => {
        onComplete({
          isCorrect: true, // hikayeler her zaman "doğru"
          score: finalScore,
          timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
          attempts: 1,
          hintsUsed: 0,
        });
      }, 1500);
    }
  }, [currentPage, totalPages, totalHighlights, totalTapped, onComplete]);

  // Sayfa geri
  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setTappedWords(new Set());
    }
  }, [currentPage]);

  // Sayfayı dinle — prefer page audioUrl
  const handleListenPage = useCallback(() => {
    if (page) {
      speak(page.text, page.audioUrl);
    }
  }, [page]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  if (!page) return null;

  const progressPercent = ((currentPage + 1) / totalPages) * 100;
  const storyEmoji =
    Object.entries(STORY_EMOJIS).find(([key]) => data.title.toLowerCase().includes(key))?.[1] ??
    '📖';

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {/* Title */}
      <div className="text-center">
        <Text variant="overline" className="text-purple-500">
          {storyEmoji} HİKAYE ZAMANI
        </Text>
        <Text variant="h3" className="mt-1 text-gray-800">
          {data.title}
        </Text>
      </div>

      {/* Progress */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-purple-400 to-pink-400"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Page Counter + Listen */}
      <div className="flex items-center justify-between">
        <Text variant="caption" className="text-gray-400">
          Sayfa {currentPage + 1} / {totalPages}
        </Text>
        <motion.button
          className="flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-bold text-purple-600"
          whileTap={{ scale: 0.95 }}
          onClick={handleListenPage}
        >
          🔊 Dinle
        </motion.button>
      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="min-h-55 space-y-4 rounded-3xl bg-white p-6 shadow-lg"
        >
          {/* Story illustration */}
          <div className="h-32 w-full overflow-hidden rounded-2xl">
            <img
              src={page.imageUrl || generateStoryPlaceholderImage(data.title, currentPage)}
              alt="Story illustration"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = generateStoryPlaceholderImage(
                  data.title,
                  currentPage,
                );
              }}
            />
          </div>

          {/* Metin — vurgulu kelimeler tıklanabilir */}
          <div className="flex flex-wrap gap-1 leading-relaxed">
            {pageWords.map((word, idx) => {
              const clean = word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/g, '').toLowerCase();
              const isHighlight = page.highlightWords.some((hw) => hw.toLowerCase() === clean);
              const isTapped = tappedWords.has(clean);

              return (
                <motion.span
                  key={`${currentPage}-${idx}`}
                  className={`inline-block cursor-pointer rounded-md px-1 py-0.5 text-lg transition-colors select-none ${
                    isHighlight && isTapped
                      ? 'bg-green-100 font-bold text-green-700'
                      : isHighlight
                        ? 'bg-yellow-100 font-bold text-yellow-700 underline decoration-dotted'
                        : 'text-gray-700'
                  }`}
                  whileTap={{ scale: 1.15 }}
                  onClick={() => {
                    handleWordTap(word);
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </div>

          {/* Çeviri — küçük metin */}
          <Text variant="caption" className="text-gray-400 italic">
            {page.translation}
          </Text>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {!isFinishing && (
        <div className="flex gap-3">
          {currentPage > 0 && (
            <motion.button
              className="flex-1 rounded-2xl bg-gray-100 py-3 font-bold text-gray-600"
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
            >
              ← Geri
            </motion.button>
          )}
          <motion.button
            className={`flex-1 rounded-2xl py-3 font-bold shadow-md ${
              currentPage === totalPages - 1
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-purple-500 text-white'
            }`}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
          >
            {currentPage === totalPages - 1 ? '✨ Bitir' : 'İleri →'}
          </motion.button>
        </div>
      )}

      {/* Finish animation */}
      <AnimatePresence>
        {isFinishing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-2 py-4 text-center"
          >
            <div className="text-5xl">📖✨</div>
            <Text variant="h3" className="text-purple-600">
              Hikaye Tamamlandı!
            </Text>
            <Text variant="body" className="text-gray-500">
              {totalTapped} / {totalHighlights} kelime keşfettin
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
