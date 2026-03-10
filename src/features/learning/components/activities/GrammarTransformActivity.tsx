/**
 * GrammarTransformActivity
 *
 * Gramer dönüşüm becerisi — kaynak cümle gösterilir,
 * yönergeye göre (olumsuz yap, soru yap, çoğul yap vb.)
 * doğru dönüştürülmüş cümleyi seç.
 */

import type { GrammarTransformData } from '@/types/content';
import { Text } from '@components/atoms/Text';
import { speak as ttsSpeak } from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import type { ActivityCallbacks } from './types';

interface GrammarTransformActivityProps extends ActivityCallbacks {
  data: GrammarTransformData;
}

export default function GrammarTransformActivity({
  data,
  onComplete,
}: GrammarTransformActivityProps) {
  const startTime = useRef(Date.now());
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const correctIndex: number = data.options.indexOf(data.correctAnswer);

  const handleListen = useCallback(() => {
    void ttsSpeak(data.sourceSentence);
  }, [data.sourceSentence]);

  const handleHint = useCallback(() => {
    setShowHint(true);
    setHintsUsed(1);
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback !== 'idle') return;

      setSelected(idx);
      setAttempts((p) => p + 1);

      if (idx === correctIndex) {
        setFeedback('correct');
        void ttsSpeak(data.correctAnswer);
        setTimeout(() => {
          onComplete({
            isCorrect: true,
            score: attempts === 0 ? 100 : 70,
            timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
            attempts: attempts + 1,
            hintsUsed,
          });
        }, 1500);
      } else {
        setFeedback('wrong');
        setTimeout(() => {
          setSelected(null);
          setFeedback('idle');
        }, 1000);
      }
    },
    [feedback, correctIndex, data.correctAnswer, onComplete, attempts, hintsUsed],
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Header */}
      <div className="text-center">
        <Text variant="overline" className="text-orange-500">
          🔄 GRAMER DÖNÜŞÜMü
        </Text>
      </div>

      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-orange-50 p-4 text-center"
      >
        <Text variant="h4" className="text-orange-700">
          {data.instruction}
        </Text>
        <Text variant="caption" className="mt-1 text-orange-400">
          {data.instructionTr}
        </Text>
      </motion.div>

      {/* Source sentence */}
      <div className="rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <Text variant="body" className="text-lg font-medium text-gray-800">
            {data.sourceSentence}
          </Text>
          <motion.button
            className="shrink-0 rounded-full border border-orange-200 bg-orange-50 p-2 text-sm"
            whileTap={{ scale: 0.9 }}
            onClick={handleListen}
          >
            🔊
          </motion.button>
        </div>
      </div>

      {/* Hint */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl bg-yellow-50 p-3 text-center"
        >
          <Text variant="caption" className="text-yellow-700">
            💡 Doğru cevap "{data.correctAnswer.split(' ').slice(0, 3).join(' ')}..." ile başlıyor
          </Text>
        </motion.div>
      )}

      {/* Options */}
      <AnimatePresence>
        <div className="space-y-2">
          {data.options.map((opt, idx) => {
            let bg = 'bg-white hover:bg-gray-50';
            let border = 'border-gray-200';
            let textColor = 'text-gray-700';

            if (selected === idx) {
              if (feedback === 'correct') {
                bg = 'bg-green-100';
                border = 'border-green-400';
                textColor = 'text-green-800';
              } else if (feedback === 'wrong') {
                bg = 'bg-red-100';
                border = 'border-red-400';
                textColor = 'text-red-800';
              }
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-full rounded-xl border-2 ${border} ${bg} px-4 py-3 text-left text-base font-medium ${textColor} transition-colors`}
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
      </AnimatePresence>

      {/* Hint button */}
      {!showHint && attempts >= 1 && feedback === 'idle' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto block rounded-full border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700"
          whileTap={{ scale: 0.95 }}
          onClick={handleHint}
        >
          💡 İpucu göster
        </motion.button>
      )}

      {/* Feedback */}
      {feedback === 'correct' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-2xl"
        >
          ✅ Harika!
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
