/**
 * SpeakItActivity
 *
 * Konuşma becerisi — kelimeyi doğru telaffuz et.
 * Web Speech API (SpeechRecognition) kullanır.
 * Fallback: tarayıcı desteklemiyorsa "Manuel Onayla" butonu gösterilir.
 */

import { getWordEmoji } from '@/features/learning/data/wordEmojiMap';
import type { SpeakItData } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import {
  isPronunciationAcceptable,
  stopSpeaking,
  speak as ttsSpeak,
} from '@services/speech/speechService';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityCallbacks, FeedbackState } from './types';

interface SpeakItActivityProps extends ActivityCallbacks {
  data: SpeakItData;
}

// Feature detection for SpeechRecognition
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as
        | (new () => SpeechRecognition)
        | undefined)
    : undefined;

export default function SpeakItActivity({ data, onComplete }: SpeakItActivityProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showManual, setShowManual] = useState(!SpeechRecognitionAPI);
  const startTime = useRef(Date.now());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const targetWord = data.word.toLowerCase().trim();
  const acceptable = useMemo(
    () => [targetWord, ...data.acceptableVariations.map((v) => v.toLowerCase().trim())],
    [targetWord, data.acceptableVariations],
  );

  // TTS via centralized speechService
  const speak = useCallback((text: string) => {
    void ttsSpeak(text, { rate: 0.8 });
  }, []);

  // Otomatik olarak kelimeyi bir kez söyle
  useEffect(() => {
    const t = setTimeout(() => {
      speak(data.word);
    }, 500);
    return () => {
      clearTimeout(t);
    };
  }, [data.word, speak]);

  // Konuşma sonucunu değerlendir
  const evaluateResult = useCallback(
    (spoken: string) => {
      const isCorrect = isPronunciationAcceptable(spoken, targetWord, data.acceptableVariations);

      setAttempts((prev) => prev + 1);

      if (isCorrect) {
        setFeedback('correct');
        completionTimerRef.current = setTimeout(() => {
          onComplete({
            isCorrect: true,
            score: Math.max(50, 100 - attempts * 15),
            timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
            attempts: attempts + 1,
            hintsUsed: 0,
          });
        }, 1200);
      } else {
        setFeedback('wrong');
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback('idle');
        }, 1500);
      }
    },
    [data.acceptableVariations, targetWord, attempts, onComplete],
  );

  // Mikrofon ile dinlemeye başla
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setShowManual(true);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setShowManual(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results[0];
        if (!results) return;
        // Check all alternatives
        let bestMatch = '';
        for (let i = 0; i < results.length; i++) {
          const alt = results[i];
          if (alt) {
            bestMatch = alt.transcript;
            const norm = bestMatch.toLowerCase().trim();
            if (acceptable.some((a) => norm.includes(a) || a.includes(norm))) {
              break;
            }
          }
        }
        setSpokenText(bestMatch);
        evaluateResult(bestMatch);
      };

      recognition.start();
    } catch {
      setShowManual(true);
    }
  }, [acceptable, evaluateResult]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
      stopSpeaking();
    };
  }, []);

  const emoji = getWordEmoji(data.word);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <Text variant="overline" className="mb-1 text-purple-500">
          🎤 SÖYLE
        </Text>
        <Text variant="body" className="text-text-secondary">
          Bu kelimeyi söyle:
        </Text>
      </div>

      {/* Word Card */}
      <motion.div
        className="rounded-3xl bg-white p-8 text-center shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="mb-4 text-7xl">{emoji}</div>
        <Text variant="h2" className="mb-2 text-gray-900">
          {data.word}
        </Text>
        <Text variant="body" className="text-gray-400">
          {data.translation}
        </Text>

        {/* Sesli örnek butonu */}
        <button
          className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-50 p-3 transition-transform active:scale-95"
          onClick={() => {
            speak(data.word);
          }}
        >
          <span className="text-2xl">🔊</span>
          <span className="ml-2 text-sm font-medium text-blue-600">Dinle</span>
        </button>
      </motion.div>

      {/* Microphone / Recording Area */}
      <div className="space-y-4 text-center">
        <AnimatePresence mode="wait">
          {feedback === 'idle' && (
            <motion.div
              key="mic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.button
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-linear-to-br from-purple-500 to-pink-500 text-white'
                }`}
                onClick={startListening}
                whileTap={{ scale: 0.9 }}
                animate={
                  isListening
                    ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.8 } }
                    : {}
                }
                disabled={isListening}
              >
                {isListening ? '⏺' : '🎤'}
              </motion.button>
              <Text variant="bodySmall" className="mt-2 text-gray-400">
                {isListening ? 'Dinleniyor...' : 'Mikrofona dokun ve söyle'}
              </Text>
            </motion.div>
          )}

          {feedback === 'correct' && (
            <motion.div
              key="correct"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-6xl">🎉</div>
              <Text variant="h3" className="text-green-600">
                Harika!
              </Text>
              {spokenText && (
                <Text variant="bodySmall" className="text-gray-400">
                  &quot;{spokenText}&quot;
                </Text>
              )}
            </motion.div>
          )}

          {feedback === 'wrong' && (
            <motion.div
              key="wrong"
              initial={{ x: -10 }}
              animate={{ x: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <div className="text-5xl">🤔</div>
              <Text variant="body" className="text-orange-600">
                Tekrar dene!
              </Text>
              {spokenText && (
                <Text variant="bodySmall" className="text-gray-400">
                  Sen: &quot;{spokenText}&quot;
                </Text>
              )}
              {/* Show phoneme hint after first failed attempt */}
              {data.phonemeHint && attempts >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 rounded-xl bg-blue-50 px-4 py-2"
                >
                  <Text variant="bodySmall" className="text-blue-600">
                    💡 Okunuşu: <span className="font-bold">{data.phonemeHint}</span>
                  </Text>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manuel onay (fallback — SpeechRecognition yoksa) */}
        {showManual && feedback === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            <Text variant="bodySmall" className="text-gray-400">
              Mikrofon kullanılamıyor — kendini değerlendir:
            </Text>
            <div className="flex justify-center gap-3">
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  evaluateResult('__wrong__');
                }}
              >
                Söyleyemedim 😕
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={() => {
                  evaluateResult(data.word);
                }}
              >
                Söyledim! ✓
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Attempts indicator */}
      {attempts > 0 && feedback === 'idle' && (
        <div className="text-center">
          <Text variant="caption" className="text-gray-300">
            Deneme: {attempts}
          </Text>
        </div>
      )}
    </div>
  );
}
