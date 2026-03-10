/**
 * StoryComprehensionActivity
 *
 * Okuma anlama becerisi — kısa bir paragraf gösterilir,
 * ardından çoktan seçmeli sorular sorulur.
 */

import type { StoryComprehensionData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface StoryComprehensionActivityProps extends ActivityCallbacks {
  data: StoryComprehensionData;
}

export default function StoryComprehensionActivity({
  data,
  onComplete,
}: StoryComprehensionActivityProps) {
  const startTime = useRef(Date.now());
  const [phase, setPhase] = useState<'reading' | 'questions'>('reading');
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showTranslation, setShowTranslation] = useState(false);

  const question = data.questions[currentQ];

  const handleListen = useCallback(() => {
    void ttsSpeak(data.passage);
  }, [data.passage]);

  const handleStartQuestions = useCallback(() => {
    setPhase('questions');
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback !== 'idle' || !question) return;

      setSelected(idx);
      setAttempts((p) => p + 1);

      if (idx === question.correctIndex) {
        setFeedback('correct');
        setCorrectCount((p) => p + 1);
        setTimeout(() => {
          if (currentQ < data.questions.length - 1) {
            setCurrentQ((p) => p + 1);
            setSelected(null);
            setFeedback('idle');
          } else {
            // All questions answered
            const total = data.questions.length;
            const score = Math.round(((correctCount + 1) / total) * 100);
            onComplete({
              isCorrect: correctCount + 1 >= Math.ceil(total / 2),
              score,
              timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
              attempts,
              hintsUsed: showTranslation ? 1 : 0,
            });
          }
        }, 1200);
      } else {
        setFeedback('wrong');
        setTimeout(() => {
          setSelected(null);
          setFeedback('idle');
        }, 1000);
      }
    },
    [
      feedback,
      question,
      currentQ,
      data.questions.length,
      correctCount,
      onComplete,
      attempts,
      showTranslation,
    ],
  );

  if (phase === 'reading') {
    return (
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="text-center">
          <Text variant="overline" className="text-blue-500">
            📖 OKU VE ANLA
          </Text>
        </div>

        <div className="space-y-3 rounded-3xl bg-white p-5 shadow-lg">
          <p className="text-lg leading-relaxed text-gray-800">{data.passage}</p>

          {showTranslation && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm leading-relaxed text-gray-400 italic"
            >
              {data.passageTranslation}
            </motion.p>
          )}

          <div className="flex items-center justify-between pt-2">
            <motion.button
              className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600"
              whileTap={{ scale: 0.95 }}
              onClick={handleListen}
            >
              🔊 Dinle
            </motion.button>
            <motion.button
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowTranslation((p) => !p);
              }}
            >
              {showTranslation ? '🙈 Çeviriyi gizle' : '👁️ Çeviriyi göster'}
            </motion.button>
          </div>
        </div>

        <Button variant="primary" className="w-full" onClick={handleStartQuestions}>
          Soruları Cevapla →
        </Button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="text-center">
        <Text variant="overline" className="text-blue-500">
          ❓ SORU {currentQ + 1} / {data.questions.length}
        </Text>
      </div>

      {/* Progress */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-blue-400 to-indigo-400"
          animate={{ width: `${((currentQ + 1) / data.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-3"
        >
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <Text variant="h4" className="text-gray-800">
              {question.question}
            </Text>
          </div>

          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              let bg = 'bg-white hover:bg-gray-50';
              let border = 'border-gray-200';
              if (selected === idx) {
                if (feedback === 'correct') {
                  bg = 'bg-green-100';
                  border = 'border-green-400';
                } else if (feedback === 'wrong') {
                  bg = 'bg-red-100';
                  border = 'border-red-400';
                } else {
                  bg = 'bg-blue-50';
                  border = 'border-blue-300';
                }
              }

              return (
                <motion.button
                  key={idx}
                  className={`w-full rounded-xl border-2 ${border} ${bg} px-4 py-3 text-left text-base font-medium text-gray-700 transition-colors`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleSelect(idx);
                  }}
                  disabled={feedback !== 'idle'}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {feedback === 'correct' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-2xl"
        >
          ✅ Doğru!
        </motion.div>
      )}

      {feedback === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-2xl"
        >
          ❌ Tekrar dene!
        </motion.div>
      )}
    </div>
  );
}
