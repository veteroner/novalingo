/**
 * StoryTimeActivity
 *
 * İnteraktif hikaye — sayfa sayfa ilerleme, vurgulu kelimeler (tap-word),
 * TTS ile dinleme, parallax geçiş animasyonları.
 *
 * Etkileşim tipleri:
 *  - tap-word:   Vurgulu kelimelere tıklayarak keşfet
 *  - tap-reveal: Gizli kelimeler (___) → tıklayınca açılır
 *  - drag-word:  Kelimeyi doğru boşluğa sürükle
 *  - choice:     Hikaye dallanması — çocuk seçer, hikaye o yöne gider
 *  - none:       Etkileşimsiz sayfa
 *
 * Özel özellikler:
 *  - Parallax: Arka plan görseli sayfa geçişlerinde yavaş kayar
 *  - Rhyme:    variant='rhyme' ile kafiyeli kelimeler farklı renkte
 *  - Ambient:  Sayfa bazlı ortam sesi (ambientSound URL)
 */

import { STORY_TTS_FALLBACK_MARKER } from '@/features/learning/data/storyBank';
import type { StoryTimeData } from '@/types/content';
import { generateStoryPlaceholderImage } from '@/utils/mediaFallback';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** Kelimeden noktalamayı temizle */
function cleanWord(word: string): string {
  return word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9]/g, '').toLowerCase();
}

export default function StoryTimeActivity({ data, onComplete }: StoryTimeActivityProps) {
  const startTime = useRef(Date.now());
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [tappedWords, setTappedWords] = useState<Set<string>>(new Set());
  const [totalTapped, setTotalTapped] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // ── Tap-reveal state ──
  const [revealedBlanks, setRevealedBlanks] = useState<Set<number>>(new Set());

  // ── Drag-word state ──
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [filledBlanks, setFilledBlanks] = useState<Map<number, string>>(new Map());
  const [dragFeedback, setDragFeedback] = useState<'correct' | 'wrong' | null>(null);

  // ── Choice branch state ──
  const [choiceMade, setChoiceMade] = useState<string | null>(null);

  const pages = data.pages;
  const page = pages[currentPage];
  const totalPages = pages.length;
  const isRhyme = data.variant === 'rhyme';

  // Sayfa metnini kelime dizisine ayır
  const pageWords = useMemo(() => page?.text.split(/\s+/) ?? [], [page?.text]);

  // Tüm sayfaların toplam vurgulu kelime sayısı
  const totalHighlights = pages.reduce((sum, p) => sum + p.highlightWords.length, 0);

  // ── Parse drag-word data from interactionData ──
  const dragWordData = useMemo(() => {
    if (page?.interactionType !== 'drag-word' || !page.interactionData) return null;
    const blanks = (page.interactionData.blanks ?? []) as Array<{
      index: number;
      answer: string;
    }>;
    const options = (page.interactionData.options ?? []) as string[];
    return { blanks, options };
  }, [page]);

  // ── Parse choice data from interactionData ──
  const choiceData = useMemo(() => {
    if (page?.interactionType !== 'choice' || !page.interactionData) return null;
    return {
      question: (page.interactionData.question as string) ?? '',
      options: (page.interactionData.options ?? []) as Array<{
        label: string;
        emoji?: string;
        nextText?: string;
      }>,
    };
  }, [page]);

  // ── Check if current page interaction is satisfied (for Next button gating) ──
  const isInteractionComplete = useMemo(() => {
    if (!page) return true;
    switch (page.interactionType) {
      case 'tap-reveal': {
        // All blanks revealed?
        const blankCount = pageWords.filter((w) => w === '___' || w.startsWith('___')).length;
        return revealedBlanks.size >= blankCount;
      }
      case 'drag-word':
        return dragWordData ? filledBlanks.size >= dragWordData.blanks.length : true;
      case 'choice':
        return choiceMade !== null;
      default:
        return true;
    }
  }, [page, pageWords, revealedBlanks, dragWordData, filledBlanks, choiceMade]);

  // ── Ambient sound ──
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current = null;
    }
    if (page?.ambientSound) {
      const audio = new Audio(page.ambientSound);
      audio.volume = 0.3;
      audio.loop = true;
      audio.play().catch(() => {});
      ambientRef.current = audio;
    }
    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current = null;
      }
    };
  }, [page?.ambientSound, currentPage]);

  // Kelimeye tıklama (tap-word mode)
  const handleWordTap = useCallback(
    (word: string) => {
      if (!page) return;
      const clean = cleanWord(word);
      const isHighlight = page.highlightWords.some((hw) => hw.toLowerCase() === clean);

      if (isHighlight && !tappedWords.has(clean)) {
        setTappedWords((prev) => new Set([...prev, clean]));
        setTotalTapped((prev) => prev + 1);
      }
      speak(clean);
    },
    [page, tappedWords],
  );

  // Tap-reveal: boşluğa tıkla → kelime açılır
  const handleTapReveal = useCallback(
    (blankIndex: number) => {
      if (revealedBlanks.has(blankIndex)) return;
      setRevealedBlanks((prev) => new Set([...prev, blankIndex]));
      setTotalTapped((prev) => prev + 1);
      // Speak the revealed word
      if (page) {
        const highlightWord = page.highlightWords[blankIndex];
        if (highlightWord) speak(highlightWord);
      }
    },
    [page, revealedBlanks],
  );

  // Drag-word: kelime seçilip boşluğa bırakıldığında
  const handleDropOnBlank = useCallback(
    (blankIndex: number, expectedAnswer: string) => {
      if (!draggedWord) return;
      if (cleanWord(draggedWord) === cleanWord(expectedAnswer)) {
        setFilledBlanks((prev) => new Map([...prev, [blankIndex, draggedWord]]));
        setTotalTapped((prev) => prev + 1);
        setDragFeedback('correct');
        speak(draggedWord);
      } else {
        setDragFeedback('wrong');
      }
      setDraggedWord(null);
      setTimeout(() => setDragFeedback(null), 600);
    },
    [draggedWord],
  );

  // Choice: çocuk bir seçenek seçti
  const handleChoice = useCallback((label: string) => {
    setChoiceMade(label);
  }, []);

  // Sayfa ileri
  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      setTappedWords(new Set());
      setRevealedBlanks(new Set());
      setFilledBlanks(new Map());
      setDraggedWord(null);
      setChoiceMade(null);
    } else {
      setIsFinishing(true);
      const accuracy = totalHighlights > 0 ? totalTapped / totalHighlights : 1;
      const finalScore = Math.max(60, Math.round(accuracy * 100));

      completionTimerRef.current = setTimeout(() => {
        onComplete({
          isCorrect: true,
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
      setRevealedBlanks(new Set());
      setFilledBlanks(new Map());
      setDraggedWord(null);
      setChoiceMade(null);
    }
  }, [currentPage]);

  // Sayfayı dinle
  const handleListenPage = useCallback(() => {
    if (page) speak(page.text, page.audioUrl);
  }, [page]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (ambientRef.current) ambientRef.current.pause();
    };
  }, []);

  if (!page) return null;

  const progressPercent = ((currentPage + 1) / totalPages) * 100;
  const storyEmoji =
    Object.entries(STORY_EMOJIS).find(([key]) => data.title.toLowerCase().includes(key))?.[1] ??
    (isRhyme ? '🎶' : '📖');

  // ── Blank counter for tap-reveal ──
  let blankIdx = -1;

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {/* Title */}
      <div className="text-center">
        <Text variant="overline" className="text-purple-500">
          {storyEmoji} {isRhyme ? 'KAFİYE HİKAYESİ' : 'HİKAYE ZAMANI'}
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

      {/* Page Content with Parallax */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="min-h-55 space-y-4 overflow-hidden rounded-3xl bg-white shadow-lg"
        >
          {/* Parallax story illustration */}
          <div className="relative h-36 w-full overflow-hidden">
            <motion.img
              src={page.imageUrl || generateStoryPlaceholderImage(data.title, currentPage)}
              alt="Story illustration"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ scale: 1.15, x: 30 }}
              animate={{ scale: 1.05, x: 0 }}
              exit={{ scale: 1.15, x: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = generateStoryPlaceholderImage(
                  data.title,
                  currentPage,
                );
              }}
            />
          </div>

          <div className="space-y-4 px-6 pb-6">
            {/* ── TEXT RENDERING by interactionType ── */}

            {/* === TAP-WORD (default) === */}
            {(page.interactionType === 'tap-word' || page.interactionType === 'none') && (
              <div className="flex flex-wrap gap-1 leading-relaxed">
                {pageWords.map((word, idx) => {
                  const clean = cleanWord(word);
                  const isHighlight = page.highlightWords.some((hw) => hw.toLowerCase() === clean);
                  const isTapped = tappedWords.has(clean);
                  const isRhymeWord =
                    isRhyme && page.rhymeWords?.some((rw) => rw.toLowerCase() === clean);

                  return (
                    <motion.span
                      key={`${currentPage}-${idx}`}
                      className={`inline-block cursor-pointer rounded-md px-1 py-0.5 text-lg transition-colors select-none ${
                        isRhymeWord
                          ? 'bg-pink-100 font-bold text-pink-600 underline decoration-wavy'
                          : isHighlight && isTapped
                            ? 'bg-green-100 font-bold text-green-700'
                            : isHighlight
                              ? 'bg-yellow-100 font-bold text-yellow-700 underline decoration-dotted'
                              : 'text-gray-700'
                      }`}
                      whileTap={{ scale: 1.15 }}
                      onClick={() => handleWordTap(word)}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>
            )}

            {/* === TAP-REVEAL: hidden blanks revealed on tap === */}
            {page.interactionType === 'tap-reveal' && (
              <div className="flex flex-wrap gap-1 leading-relaxed">
                {pageWords.map((word, idx) => {
                  const isBlank = word === '___' || word.startsWith('___');
                  if (isBlank) blankIdx++;
                  const currentBlankIdx = blankIdx;
                  const revealed = revealedBlanks.has(currentBlankIdx);
                  const revealWord = page.highlightWords[currentBlankIdx] ?? '???';

                  if (isBlank) {
                    return (
                      <motion.span
                        key={`${currentPage}-${idx}`}
                        className={`inline-block cursor-pointer rounded-lg px-2 py-1 text-lg font-bold select-none ${
                          revealed
                            ? 'bg-green-100 text-green-700'
                            : 'border-2 border-dashed border-purple-300 bg-purple-50 text-purple-400'
                        }`}
                        whileTap={{ scale: 1.1 }}
                        onClick={() => handleTapReveal(currentBlankIdx)}
                        animate={revealed ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {revealed ? revealWord : '???'}
                      </motion.span>
                    );
                  }

                  return (
                    <span key={`${currentPage}-${idx}`} className="px-0.5 text-lg text-gray-700">
                      {word}
                    </span>
                  );
                })}
              </div>
            )}

            {/* === DRAG-WORD: drag options to blanks === */}
            {page.interactionType === 'drag-word' && dragWordData && (
              <div className="space-y-4">
                {/* Text with blanks */}
                <div className="flex flex-wrap items-center gap-1 leading-relaxed">
                  {pageWords.map((word, idx) => {
                    const isBlank = word === '___' || word.startsWith('___');
                    if (isBlank) blankIdx++;
                    const currentBlankIdx = blankIdx;
                    const blankDef = dragWordData.blanks.find((b) => b.index === currentBlankIdx);
                    const filled = filledBlanks.get(currentBlankIdx);

                    if (isBlank && blankDef) {
                      return (
                        <motion.span
                          key={`${currentPage}-${idx}`}
                          className={`inline-block min-w-16 rounded-lg border-2 px-3 py-1 text-center text-lg font-bold ${
                            filled
                              ? 'border-green-400 bg-green-100 text-green-700'
                              : 'border-dashed border-orange-300 bg-orange-50 text-orange-400'
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropOnBlank(currentBlankIdx, blankDef.answer)}
                          animate={
                            dragFeedback === 'wrong' && !filled ? { x: [-4, 4, -4, 4, 0] } : {}
                          }
                          transition={{ duration: 0.3 }}
                        >
                          {filled ?? '___'}
                        </motion.span>
                      );
                    }

                    return (
                      <span key={`${currentPage}-${idx}`} className="px-0.5 text-lg text-gray-700">
                        {word}
                      </span>
                    );
                  })}
                </div>

                {/* Draggable word options */}
                <div className="flex flex-wrap justify-center gap-2">
                  {dragWordData.options
                    .filter((opt) => !Array.from(filledBlanks.values()).includes(opt))
                    .map((opt) => (
                      <motion.span
                        key={opt}
                        draggable
                        onDragStart={() => setDraggedWord(opt)}
                        onTouchStart={() => setDraggedWord(opt)}
                        className="cursor-grab rounded-xl bg-purple-100 px-4 py-2 text-base font-bold text-purple-700 shadow-sm active:cursor-grabbing"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {opt}
                      </motion.span>
                    ))}
                </div>
              </div>
            )}

            {/* === CHOICE: story branching === */}
            {page.interactionType === 'choice' && choiceData && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1 leading-relaxed">
                  {pageWords.map((word, idx) => (
                    <span key={`${currentPage}-${idx}`} className="px-0.5 text-lg text-gray-700">
                      {word}
                    </span>
                  ))}
                </div>

                <div className="rounded-2xl bg-purple-50 p-4">
                  <Text
                    variant="bodySmall"
                    weight="bold"
                    className="mb-3 text-center text-purple-700"
                  >
                    {choiceData.question}
                  </Text>
                  <div className="flex flex-col gap-2">
                    {choiceData.options.map((opt) => {
                      const isSelected = choiceMade === opt.label;
                      return (
                        <motion.button
                          key={opt.label}
                          className={`rounded-2xl px-4 py-3 text-left font-bold transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white shadow-md'
                              : choiceMade
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-white text-gray-700 shadow-sm'
                          }`}
                          whileTap={!choiceMade ? { scale: 0.97 } : {}}
                          onClick={() => !choiceMade && handleChoice(opt.label)}
                          disabled={!!choiceMade}
                        >
                          {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  {/* Show outcome text after choosing */}
                  {choiceMade && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <Text variant="body" className="text-purple-800">
                        {choiceData.options.find((o) => o.label === choiceMade)?.nextText ?? ''}
                      </Text>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Çeviri */}
            <Text variant="caption" className="text-gray-400 italic">
              {page.translation}
            </Text>
          </div>
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
            className={`flex-1 rounded-2xl py-3 font-bold shadow-md transition-opacity ${
              currentPage === totalPages - 1
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-purple-500 text-white'
            } ${!isInteractionComplete ? 'opacity-50' : ''}`}
            whileTap={isInteractionComplete ? { scale: 0.95 } : {}}
            onClick={() => isInteractionComplete && handleNext()}
            disabled={!isInteractionComplete}
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
            <div className="text-5xl">{isRhyme ? '🎶✨' : '📖✨'}</div>
            <Text variant="h3" className="text-purple-600">
              {isRhyme ? 'Kafiye Bitti!' : 'Hikaye Tamamlandı!'}
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
