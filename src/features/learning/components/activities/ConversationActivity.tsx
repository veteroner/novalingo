/**
 * ConversationActivity — Nova ile Konuş
 *
 * Nova (maskot) ile çocuk arasında serbest karşılıklı konuşma.
 * Çocuk mikrofona konuşur veya metin kutusu ile yazar — seçenek butonu yok.
 * Web Speech API STT + TTS kullanır; metinle de tam çalışır.
 */

import novaMascot from '@assets/images/nova-mascot.svg';
import { Text } from '@components/atoms/Text';
import { useHaptic } from '@hooks/useHaptic';
import {
    comparePronunciation,
    onSpeakingStateChange,
    stopSpeaking,
    speak as ttsSpeak,
} from '@services/speech/speechService';
import { useChildStore } from '@stores/childStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActivityCallbacks, FeedbackState } from './types';

interface ConversationActivityProps extends ActivityCallbacks {
  data: ConversationActivityData;
}

interface ConversationActivityOption {
  text: string;
  textTr: string;
  acceptableVariations?: string[];
  nextNodeId: string;
  emoji?: string;
}

interface ConversationActivityNode {
  id: string;
  speaker: 'nova' | 'child';
  text: string;
  textTr: string;
  audioUrl?: string;
  emoji?: string;
  options?: ConversationActivityOption[];
  next?: string;
}

interface ConversationActivityData {
  title: string;
  titleTr: string;
  sceneEmoji: string;
  nodes: ConversationActivityNode[];
  startNodeId: string;
  targetWords: string[];
}

// Feature detection for SpeechRecognition
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as
        | (new () => SpeechRecognition)
        | undefined)
    : undefined;

interface ChatBubble {
  id: string;
  speaker: 'nova' | 'child';
  text: string;
  textTr: string;
  emoji?: string;
}

const CHILD_ACCEPT_THRESHOLD = 0.65;
const SPEECH_RATES = [0.6, 0.8, 1.0] as const;
const HINT_DELAY_MS = 8000;        // Show hint after 8 s of no response
const AUTO_ADVANCE_MS = 20000;     // Auto-advance after 20 s if child is stuck
type NovaMood = 'idle' | 'speaking' | 'listening' | 'celebrating' | 'sad' | 'thinking';

const AVATAR_EMOJIS: Record<string, string> = {
  fox: '🦊', panda: '🐼', unicorn: '🦄', lion: '🦁', owl: '🦉', rabbit: '🐰',
  cat: '🐱', dog: '🐶', dragon: '🐉', astronaut: '🧑‍🚀', robot: '🤖', star: '🌟',
};

/* ─── Nova Speaking Avatar — Hero character with mood animations ─── */

function NovaSpeakingAvatar({ mood }: { mood: NovaMood }) {
  const isSpeaking = mood === 'speaking';
  const isCelebrating = mood === 'celebrating';
  const isListening = mood === 'listening';
  const isSad = mood === 'sad';
  const isThinking = mood === 'thinking';

  return (
    <div className="relative flex items-center justify-center" style={{ height: 172 }}>
      {/* Glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 152, height: 152 }}
        animate={
          isSpeaking
            ? {
                boxShadow: [
                  '0 0 20px 8px rgba(99,102,241,0.2)',
                  '0 0 44px 16px rgba(99,102,241,0.45)',
                  '0 0 20px 8px rgba(99,102,241,0.2)',
                ],
              }
            : isCelebrating
              ? { boxShadow: '0 0 30px 12px rgba(52,211,153,0.35)' }
              : isListening
                ? {
                    boxShadow: [
                      '0 0 16px 6px rgba(251,191,36,0.15)',
                      '0 0 28px 10px rgba(251,191,36,0.3)',
                      '0 0 16px 6px rgba(251,191,36,0.15)',
                    ],
                  }
                : isSad
                  ? { boxShadow: '0 0 24px 10px rgba(239,68,68,0.25)' }
                  : isThinking
                    ? {
                        boxShadow: [
                          '0 0 12px 4px rgba(168,85,247,0.1)',
                          '0 0 20px 8px rgba(168,85,247,0.25)',
                          '0 0 12px 4px rgba(168,85,247,0.1)',
                        ],
                      }
                    : { boxShadow: '0 0 10px 4px rgba(99,102,241,0.06)' }
        }
        transition={
          isSpeaking || isListening || isThinking
            ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.5 }
        }
      />

      {/* Character body with mood-driven animation */}
      <motion.div
        className="relative"
        animate={
          isSpeaking
            ? { y: [0, -3, 0], rotate: [0, 0.8, -0.8, 0] }
            : isCelebrating
              ? { y: [0, -18, 0], scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }
              : isListening
                ? { y: [0, -1, 0], scale: [1, 1.015, 1] }
                : isSad
                  ? { rotate: [0, -6, 6, -6, 0], y: [0, 2, 0] }
                  : isThinking
                    ? { rotate: [0, 4, -4, 0], y: [0, -2, 0] }
                    : { y: [0, -2, 0] }
        }
        transition={
          isSpeaking
            ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
            : isCelebrating
              ? { duration: 0.65, repeat: 3, ease: 'easeOut' }
              : isSad
                ? { duration: 0.4, repeat: 2, ease: 'easeInOut' }
                : isThinking
                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <img src={novaMascot} alt="Nova" className="h-36 w-36 drop-shadow-2xl" />

        {/* Animated mouth overlay — positioned over the beak */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ bottom: '55%' }}
        >
          <svg viewBox="0 0 30 16" className="h-2.5 w-5">
            <motion.ellipse
              cx="15"
              cy="8"
              rx="6"
              fill={isSad ? '#EF4444' : '#D84315'}
              animate={
                isSpeaking
                  ? { ry: [1.5, 7, 2.5, 6, 1.5, 8, 3, 1.5] }
                  : isCelebrating
                    ? { ry: 3.5 }
                    : isSad
                      ? { ry: 2, cy: 10 }
                      : isThinking
                        ? { ry: [1, 1.5, 1] }
                        : { ry: 0.8 }
              }
              transition={
                isSpeaking
                  ? { duration: 0.4, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.3 }
              }
            />
          </svg>
        </div>
      </motion.div>

      {/* Sound wave indicators */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="absolute flex flex-col items-start gap-1"
            style={{ right: 2, top: '40%' }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-0.5 rounded-full bg-indigo-400"
                animate={{ width: [3, 14, 3], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute -bottom-1 flex items-center gap-0.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-amber-400"
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration particles */}
      <AnimatePresence>
        {isCelebrating && (
          <>
            {['⭐', '🎉', '✨', '💫', '🌟'].map((emoji, i) => (
              <motion.span
                key={emoji}
                className="pointer-events-none absolute text-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: Math.cos((i * 2 * Math.PI) / 5) * 65,
                  y: Math.sin((i * 2 * Math.PI) / 5) * 45 - 25,
                }}
                transition={{ duration: 1.1, delay: i * 0.08 }}
              >
                {emoji}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Sad reaction */}
      <AnimatePresence>
        {isSad && (
          <motion.span
            className="pointer-events-none absolute -top-1 text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            😿
          </motion.span>
        )}
      </AnimatePresence>

      {/* Thinking dots */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute -bottom-2 flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-400"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Progress Dots ─── */

function ProgressDots({ current, total }: { current: number; total: number }) {
  if (total <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? 'w-4 bg-emerald-400'
              : i === current
                ? 'w-4 bg-indigo-400'
                : 'w-1.5 bg-gray-300'
          }`}
          animate={i === current ? { scale: [1, 1.15, 1] } : {}}
          transition={i === current ? { duration: 1.5, repeat: Infinity } : {}}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function ConversationActivity({
  data,
  onComplete,
}: ConversationActivityProps) {
  const { t } = useTranslation('lesson');
  const activeChild = useChildStore((s) => s.activeChild);
  const childAvatarEmoji = AVATAR_EMOJIS[activeChild?.avatarId ?? ''] ?? '🧒';
  const haptic = useHaptic();

  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [options, setOptions] = useState<ConversationActivityOption[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [freeInputText, setFreeInputText] = useState('');

  // ── Premium UX state ──
  const [novaMood, setNovaMood] = useState<NovaMood>('idle');
  const [currentSpeech, setCurrentSpeech] = useState<{ text: string; textTr: string } | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [speechRateIndex, setSpeechRateIndex] = useState(1); // default 0.8x
  const [currentRound, setCurrentRound] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const startTime = useRef(Date.now());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesMap = useRef<Map<string, ConversationActivityNode>>(new Map());
  const completedWordsRef = useRef(completedWords);
  const attemptsRef = useRef(attempts);
  completedWordsRef.current = completedWords;
  attemptsRef.current = attempts;

  const speechRateRef = useRef(speechRateIndex);
  speechRateRef.current = speechRateIndex;

  // Keep a live ref to current options so timer callbacks can read them without stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Ref for auto-listen callback (avoids stale closure in the speaking-state effect)
  const startListeningRef = useRef<() => void>(() => {});

  // Ref for auto-advance callback when child doesn't respond
  const autoAdvanceRef = useRef<() => void>(() => {});

  // Total interaction rounds for progress indicator
  const totalRounds = useMemo(
    () => data.nodes.filter((n) => n.speaker === 'nova' && n.options && n.options.length > 0).length,
    [data.nodes],
  );

  // Subscribe to TTS speaking-state changes → auto-listen when Nova finishes
  useEffect(() => {
    return onSpeakingStateChange((speaking) => {
      if (!speaking) {
        setNovaMood((prev) => {
          if (prev === 'speaking') {
            // Auto-start listening if STT is available and child has options to respond to
            if (SpeechRecognitionAPI) {
              // Small delay so the mic doesn't pick up the tail of TTS
              const tid = setTimeout(() => { startListeningRef.current(); }, 400);
              autoAdvanceTimers.current.push(tid);
            }
            return 'listening';
          }
          return prev;
        });
      }
    });
  }, []);

  // Build nodes map once
  useEffect(() => {
    const map = new Map<string, ConversationActivityNode>();
    for (const node of data.nodes) {
      map.set(node.id, node);
    }
    nodesMap.current = map;

    // Start the dialogue
    const startNode = map.get(data.startNodeId);
    if (startNode) {
      advanceToNode(startNode);
    } else {
      // No valid start node — finish immediately to avoid blank screen
      finishConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);
      for (const tid of autoAdvanceTimers.current) clearTimeout(tid);
      autoAdvanceTimers.current = [];
      abortRecognition();
      stopSpeaking();
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles]);

  const finishConversation = useCallback(() => {
    setNovaMood('celebrating');
    const wordsHit = completedWordsRef.current.size;
    const totalWords = data.targetWords.length;
    const accuracy = totalWords > 0 ? wordsHit / totalWords : 1;
    const score = Math.round(accuracy * 100);

    onComplete({
      isCorrect: accuracy >= 0.5,
      score,
      timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
      attempts: attemptsRef.current,
      hintsUsed: 0,
    });
  }, [data.targetWords, onComplete]);

  const advanceToNode = useCallback((node: ConversationActivityNode) => {
    setFeedback('idle');
    setHintVisible(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);

    // Add bubble
    setBubbles((prev) => [
      ...prev,
      {
        id: node.id,
        speaker: node.speaker,
        text: node.text,
        textTr: node.textTr,
        emoji: node.emoji,
      },
    ]);

    // Nova speaks — TTS with current rate
    if (node.speaker === 'nova') {
      setCurrentSpeech({ text: node.text, textTr: node.textTr });
      // Brief thinking state before speaking starts
      setNovaMood('thinking');
      const speakTid = setTimeout(() => {
        setNovaMood('speaking');
        void ttsSpeak(node.text, { rate: SPEECH_RATES[speechRateRef.current], audioUrl: node.audioUrl });
      }, 500);
      autoAdvanceTimers.current.push(speakTid);
    }

    // If nova with options → free-form input active + start hint + auto-advance timers
    if (node.speaker === 'nova' && node.options && node.options.length > 0) {
      setOptions(node.options);
      // Hint timer — subtly suggest the first option after HINT_DELAY_MS
      hintTimerRef.current = setTimeout(() => {
        setHintVisible(true);
        setShowTranslation(true);
      }, HINT_DELAY_MS);
      // Auto-advance if child doesn't respond within AUTO_ADVANCE_MS
      if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);
      noResponseTimerRef.current = setTimeout(() => {
        autoAdvanceRef.current();
      }, AUTO_ADVANCE_MS);
    } else if (node.next) {
      const nextNodeId = node.next;

      // Auto-advance after a short delay (e.g. child bubble → next nova line)
      const tid1 = setTimeout(() => {
        const nextNode = nodesMap.current.get(nextNodeId);
        if (nextNode) {
          advanceToNode(nextNode);
        }
      }, 1200);
      autoAdvanceTimers.current.push(tid1);
    } else {
      // End of conversation — no next, no options → complete
      const tid2 = setTimeout(() => {
        finishConversation();
      }, 1500);
      autoAdvanceTimers.current.push(tid2);
    }
  }, [finishConversation]);

  const handleOptionSelect = useCallback(
    (option: ConversationActivityOption) => {
      setAttempts((a) => a + 1);
      setOptions([]);
      setCurrentRound((r) => r + 1);
      setHintVisible(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);

      // Track vocabulary — strip punctuation before matching
      const words = option.text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      setCompletedWords((prev) => {
        const next = new Set(prev);
        for (const w of words) {
          if (data.targetWords.some((tw) => tw.toLowerCase() === w)) {
            next.add(w);
          }
        }
        return next;
      });

      // Add child's bubble
      const childBubble: ChatBubble = {
        id: `child-${Date.now()}`,
        speaker: 'child',
        text: option.text,
        textTr: option.textTr,
        emoji: option.emoji,
      };
      setBubbles((prev) => [...prev, childBubble]);

      setNovaMood('celebrating');
      setFeedback('correct');
      void haptic.success();
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('idle');
        setNovaMood('idle');
        // Skip child echo node (templates have explicit child nodes that
        // mirror the option text — we already added the child bubble above)
        const echoNode = nodesMap.current.get(option.nextNodeId);
        const targetNodeId = echoNode?.speaker === 'child' ? echoNode.next : option.nextNodeId;
        const nextNode = targetNodeId ? nodesMap.current.get(targetNodeId) : undefined;
        if (nextNode) {
          advanceToNode(nextNode);
        } else {
          finishConversation();
        }
      }, 800);
    },
    [data.targetWords, advanceToNode, finishConversation, haptic],
  );

  // ── Replay helper ──
  const replaySpeech = useCallback(
    (text?: string) => {
      const target = text ?? currentSpeech?.text;
      if (target) {
        setNovaMood('speaking');
        void ttsSpeak(target, { rate: SPEECH_RATES[speechRateRef.current] });
      }
    },
    [currentSpeech],
  );

  // ── Free-form input handler (STT transcript or typed text) ──
  const handleFreeInput = useCallback(
    (rawText: string) => {
      if (!rawText.trim() || options.length === 0) return;
      abortRecognition();

      const text = rawText.toLowerCase().trim();

      // 1. Try comparePronunciation against every option
      let bestOption: ConversationActivityOption | null = null;
      let bestScore = 0;
      for (const opt of options) {
        const score = comparePronunciation(text, opt.text, opt.acceptableVariations);
        if (score > bestScore) {
          bestScore = score;
          bestOption = opt;
        }
      }
      if (bestOption && bestScore >= CHILD_ACCEPT_THRESHOLD) {
        handleOptionSelect(bestOption);
        return;
      }

      // 2. Substring match: acceptable variations
      for (const opt of options) {
        const variations = [opt.text.toLowerCase(), ...(opt.acceptableVariations ?? [])];
        if (variations.some((v) => text.includes(v.toLowerCase()))) {
          handleOptionSelect(opt);
          return;
        }
      }

      // 3. Target word detected in free speech
      const foundTarget = data.targetWords.find((tw) => text.includes(tw.toLowerCase()));
      if (foundTarget) {
        const matchingOpt =
          options.find((o) => o.text.toLowerCase().includes(foundTarget.toLowerCase())) ??
          options[0];
        if (matchingOpt) {
          handleOptionSelect(matchingOpt);
          return;
        }
      }

      // 4. Any key word from any option appears in speech
      for (const opt of options) {
        const optWords = opt.text
          .toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 2);
        if (optWords.some((w) => text.includes(w))) {
          handleOptionSelect(opt);
          return;
        }
      }

      // 5. No match — give feedback but keep child in the same round
      setFeedback('wrong');
      setNovaMood('sad');
      void haptic.error();
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('idle');
        setNovaMood('listening');
      }, 1200);
    },
    [options, data.targetWords, handleOptionSelect, haptic],
  );

  // ===== STT =====
  const abortRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || options.length === 0) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognitionRef.current = recognition;

      recognition.onstart = () => { setIsListening(true); };
      recognition.onend = () => { setIsListening(false); };
      recognition.onerror = () => { setIsListening(false); };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results[0];
        if (!results) return;

        // Collect all transcripts from alternatives
        const transcripts: string[] = [];
        for (let i = 0; i < results.length; i++) {
          const alt = results[i];
          if (alt) transcripts.push(alt.transcript.toLowerCase().trim());
        }

        // Pass the top transcript to the free-form handler
        const best = transcripts[0];
        if (best) handleFreeInput(best);
      };

      recognition.start();
    } catch {
      /* STT not available — text input is still usable */
    }
  }, [options.length, handleFreeInput]);

  // Keep startListeningRef in sync for auto-listen
  startListeningRef.current = startListening;

  // Keep autoAdvanceRef in sync — called when child doesn't respond in time
  autoAdvanceRef.current = () => {
    const curr = optionsRef.current;
    if (curr.length > 0 && curr[0]) {
      handleOptionSelect(curr[0]);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-linear-to-b from-indigo-50 via-white to-slate-50">
      {/* ═══ Top Bar ═══ */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{data.sceneEmoji}</span>
          <div className="flex flex-col leading-tight">
            <Text variant="overline" className="text-[10px] text-indigo-400">
              {t('activities.conversationHeader')}
            </Text>
            <Text variant="caption" className="text-xs font-medium text-gray-600">
              {data.titleTr}
            </Text>
          </div>
        </div>
        <ProgressDots current={currentRound} total={totalRounds} />
        <button
          onClick={() => { setSpeechRateIndex((i) => (i + 1) % SPEECH_RATES.length); }}
          className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-indigo-500 shadow-sm active:bg-indigo-50"
        >
          {SPEECH_RATES[speechRateIndex]}x
        </button>
      </div>

      {/* ═══ Nova Hero Area ═══ */}
      <div className="flex shrink-0 flex-col items-center px-4">
        <NovaSpeakingAvatar mood={novaMood} />

        {/* Current speech subtitle card */}
        {currentSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-1 w-full max-w-sm rounded-2xl bg-white px-5 py-3 shadow-md"
          >
            <p className="text-center text-base font-semibold text-gray-800">
              {currentSpeech.text}
            </p>
            <AnimatePresence>
              {showTranslation && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-0.5 overflow-hidden text-center text-sm text-gray-400"
                >
                  {currentSpeech.textTr}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="mt-2 flex justify-center gap-3">
              <button
                onClick={() => { replaySpeech(); }}
                className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-500 active:bg-indigo-100"
              >
                🔊 {t('activities.conversationReplay')}
              </button>
              <button
                onClick={() => { setShowTranslation((v) => !v); }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  showTranslation
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                🇹🇷 {t('activities.conversationTranslate')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══ Compact Chat History ═══ */}
      <div
        ref={scrollRef}
        className="mx-4 mt-2 flex-1 space-y-1.5 overflow-y-auto rounded-xl bg-white/50 p-3"
        style={{ minHeight: 48 }}
      >
        <AnimatePresence initial={false}>
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`group flex items-start gap-1.5 ${
                bubble.speaker === 'child' ? 'flex-row-reverse' : ''
              }`}
            >
              {bubble.speaker === 'nova' ? (
                <img
                  src={novaMascot}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full bg-indigo-50 p-0.5"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs">
                  {childAvatarEmoji}
                </span>
              )}

              <div
                className={`max-w-[78%] rounded-2xl px-3 py-1.5 ${
                  bubble.speaker === 'nova'
                    ? 'rounded-tl-sm bg-white shadow-sm'
                    : 'rounded-tr-sm bg-indigo-500 text-white'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    bubble.speaker === 'nova' ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {bubble.text}
                </p>
                {showTranslation && (
                  <p
                    className={`text-xs ${
                      bubble.speaker === 'nova' ? 'text-gray-400' : 'text-indigo-200'
                    }`}
                  >
                    {bubble.textTr}
                  </p>
                )}
                {bubble.speaker === 'nova' && (
                  <button
                    onClick={() => { replaySpeech(bubble.text); }}
                    className="mt-0.5 text-xs text-indigo-300 opacity-60 transition-opacity active:opacity-100"
                    aria-label={t('activities.conversationReplay')}
                  >
                    🔊
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══ Response Area — free-form dialogue ═══ */}
      {options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 border-t border-indigo-100/50 bg-white px-4 pb-4 pt-3"
        >
          {/* Hint: gently suggest the first option after HINT_DELAY_MS */}
          <AnimatePresence>
            {hintVisible && options[0] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden rounded-xl bg-amber-50 px-4 py-2 text-center"
              >
                <p className="text-xs text-amber-500">{t('activities.conversationTryThis')}</p>
                <p className="text-sm font-semibold text-amber-700">{options[0].text}</p>
                {showTranslation && (
                  <p className="text-xs text-amber-400">{options[0].textTr}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Free-form text input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={freeInputText}
              onChange={(e) => { setFreeInputText(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && freeInputText.trim()) {
                  const val = freeInputText.trim();
                  setFreeInputText('');
                  handleFreeInput(val);
                }
              }}
              placeholder={t('activities.conversationTypeHere')}
              className="flex-1 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <AnimatePresence>
              {freeInputText.trim() && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const val = freeInputText.trim();
                    setFreeInputText('');
                    handleFreeInput(val);
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md"
                >
                  <span className="text-lg">➤</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Mic button + hint toggle */}
          <div className="mt-3 flex items-center justify-center gap-4">
            {SpeechRecognitionAPI && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={isListening ? abortRecognition : startListening}
                className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
                  isListening
                    ? 'animate-pulse bg-red-500'
                    : feedback === 'wrong'
                      ? 'bg-red-100 text-red-500'
                      : 'bg-indigo-500 active:scale-95'
                } text-white`}
                aria-label={isListening ? t('activities.conversationListening') : t('activities.conversationKeyboard')}
              >
                <span className="text-3xl">{isListening ? '🔴' : '🎤'}</span>
              </motion.button>
            )}

            <button
              onClick={() => { setShowTranslation(true); setHintVisible(true); }}
              className={`flex h-10 w-10 items-center justify-center rounded-full active:bg-amber-100 ${
                hintVisible ? 'bg-amber-200 text-amber-600' : 'bg-amber-50 text-amber-500'
              }`}
              aria-label="Hint"
            >
              💡
            </button>
          </div>

          {/* Status text */}
          {isListening && (
            <Text variant="caption" className="mt-2 text-center text-indigo-400">
              {t('activities.conversationListening')}
            </Text>
          )}
          {feedback === 'wrong' && !isListening && (
            <Text variant="caption" className="mt-2 text-center text-red-400">
              {t('activities.conversationTryAgain')}
            </Text>
          )}
        </motion.div>
      )}

      {/* ═══ Correct Feedback ═══ */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="text-5xl drop-shadow-lg">✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Wrong Feedback ═══ */}
      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.span
              className="text-4xl drop-shadow-lg"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              🔄
            </motion.span>
            <Text variant="caption" className="absolute bottom-1/3 text-red-400 font-semibold">
              {t('activities.conversationTryAgain')}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
