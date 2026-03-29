/**
 * ConversationActivity — Nova ile Konuş
 *
 * Nova (maskot) ile çocuk arasında serbest karşılıklı konuşma.
 * Çocuk mikrofona konuşur veya metin kutusu ile yazar — seçenek butonu yok.
 * Web Speech API STT + TTS kullanır; metinle de tam çalışır.
 */

import {
  matchConversationResponseRule,
  scoreConversation,
  type ConversationTurnResult,
} from '@/features/learning/data/conversations';
import type { ConversationScenario } from '@/features/learning/data/conversations/types/conversationScenario';
import type { ConversationSuccessCriteriaData } from '@/types/content';
import novaMascot from '@assets/images/nova-mascot.svg';
import { Text } from '@components/atoms/Text';
import { useHaptic } from '@hooks/useHaptic';
import {
  trackConversationCompleted,
  trackConversationHintShown,
  trackConversationStarted,
  trackConversationTurnCompleted,
} from '@services/analytics/analyticsService';
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
import {
  matchConversationResponse as rawMatchConversationResponse,
  type MatchConversationResponseResult,
} from './conversationRuntime.ts';
import type { ActivityCallbacks, FeedbackState } from './types';

interface ConversationActivityProps extends ActivityCallbacks {
  data: ConversationActivityData;
  /** WorldId for analytics — passed from ConversationScreen when launched via world map */
  worldId?: string | null;
}

interface ConversationActivityOption {
  text: string;
  textTr: string;
  acceptableVariations?: string[];
  acceptedWords?: string[];
  minimumConfidence?: number;
  nextNodeId: string;
  emoji?: string;
  responseId?: string;
  marksTargetWords?: string[];
  marksPatterns?: string[];
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
  scenarioId?: string;
  scenarioTheme?: string;
  scenarioSummary?: string;
  scenarioSummaryTr?: string;
  scenarioMode?: string;
  targetPatterns?: string[];
  rewardType?: string;
  rewardId?: string;
  successCriteria?: ConversationSuccessCriteriaData;
  estimatedDurationSec?: number;
}

interface ComputedConversationOutcome {
  durationSeconds: number;
  score: number;
  passed: boolean;
  acceptedTurns: number;
  hintedTurns: number;
  targetWordsHit: string[];
  patternsHit: string[];
}

interface CompletedConversationEvidence {
  scenarioId?: string;
  scenarioTheme?: string;
  acceptedTurns: number;
  hintedTurns: number;
  targetWordsHit: string[];
  patternsHit: string[];
  passed: boolean;
  score: number;
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
  audioUrl?: string;
}

const CHILD_ACCEPT_THRESHOLD = 0.65;
const SPEECH_RATES = [0.6, 0.8, 1.0] as const;
const HINT_DELAY_MS = 8000; // Show hint after 8 s of no response
const AUTO_ADVANCE_MS = 20000; // Auto-advance after 20 s if child is stuck
type NovaMood = 'idle' | 'speaking' | 'listening' | 'celebrating' | 'sad' | 'thinking';

const AVATAR_EMOJIS: Record<string, string> = {
  fox: '🦊',
  panda: '🐼',
  unicorn: '🦄',
  lion: '🦁',
  owl: '🦉',
  rabbit: '🐰',
  cat: '🐱',
  dog: '🐶',
  dragon: '🐉',
  astronaut: '🧑‍🚀',
  robot: '🤖',
  star: '🌟',
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
            <motion.g
              style={{ transformOrigin: '15px 8px' }}
              animate={
                isSpeaking
                  ? {
                      scaleY: [0.35, 1.6, 0.6, 1.35, 0.35, 1.8, 0.75, 0.35],
                      y: [0, -1, 0, -1, 0, -1, 0, 0],
                    }
                  : isCelebrating
                    ? { scaleY: 0.9, y: -0.5 }
                    : isSad
                      ? { scaleY: 0.45, y: 2 }
                      : isThinking
                        ? { scaleY: [0.3, 0.45, 0.3] }
                        : { scaleY: 0.3, y: 0 }
              }
              transition={
                isSpeaking ? { duration: 0.4, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }
              }
            >
              <ellipse cx="15" cy="8" rx="6" ry="4.5" fill={isSad ? '#EF4444' : '#D84315'} />
            </motion.g>
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
  worldId,
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
  const [micError, setMicError] = useState<string | null>(null);

  // ── Premium UX state ──
  const [novaMood, setNovaMood] = useState<NovaMood>('idle');
  const [currentSpeech, setCurrentSpeech] = useState<{ text: string; textTr: string } | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [speechRateIndex, setSpeechRateIndex] = useState(1); // default 0.8x
  const [currentRound, setCurrentRound] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const startTime = useRef(Date.now());
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Self-pruning timer: automatically removes its ID from the tracking array after firing,
  // preventing the array from growing unboundedly across a long session (BUG-11).
  const pushTimer = useCallback((fn: () => void, ms: number): ReturnType<typeof setTimeout> => {
    const tid: ReturnType<typeof setTimeout> = setTimeout(() => {
      fn();
      autoAdvanceTimers.current = autoAdvanceTimers.current.filter((id) => id !== tid);
    }, ms);
    autoAdvanceTimers.current.push(tid);
    return tid;
  }, []);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesMap = useRef<Map<string, ConversationActivityNode>>(new Map());
  const currentPromptNodeIdRef = useRef<string | null>(null);
  const turnResultsRef = useRef<ConversationTurnResult[]>([]);
  const hintedTurnsRef = useRef(0);
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

  // Refs for advanceToNode/finishConversation — kept current so data useEffect always calls
  // the latest version without needing those callbacks in its own dep array (BUG-13).
  const advanceToNodeRef = useRef<(node: ConversationActivityNode) => void>(() => {});
  const finishConversationRef = useRef<() => void>(() => {});

  // Pending action to execute after TTS finishes (for intermediate/terminal nodes)
  const pendingAfterSpeechRef = useRef<(() => void) | null>(null);

  // Scenario intro card (dismissed once dialogue begins)
  const [showIntro, setShowIntro] = useState(!!data.scenarioSummary);

  // Total interaction rounds for progress indicator
  const totalRounds = useMemo(
    () =>
      data.nodes.filter((n) => n.speaker === 'nova' && n.options && n.options.length > 0).length,
    [data.nodes],
  );

  // Subscribe to TTS speaking-state changes → auto-listen when Nova finishes
  useEffect(() => {
    return onSpeakingStateChange((speaking) => {
      if (!speaking) {
        // If there's a pending post-TTS action (intermediate/terminal node), execute it
        const pendingAction = pendingAfterSpeechRef.current;
        if (pendingAction) {
          pendingAfterSpeechRef.current = null;
          pushTimer(pendingAction, 600);
          setNovaMood('idle');
          return;
        }

        setNovaMood((prev) => {
          if (prev === 'speaking') {
            // Only start listening if there are still options for the child to respond to
            if (SpeechRecognitionAPI && optionsRef.current.length > 0) {
              // Small delay so the mic doesn't pick up the tail of TTS
              pushTimer(() => startListeningRef.current(), 400);
            }
            return optionsRef.current.length > 0 ? 'listening' : 'idle';
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
    currentPromptNodeIdRef.current = null;
    turnResultsRef.current = [];
    hintedTurnsRef.current = 0;

    // Start the dialogue
    const startNode = map.get(data.startNodeId);
    if (startNode) {
      if (data.scenarioId) {
        trackConversationStarted({
          scenarioId: data.scenarioId,
          theme: data.scenarioTheme ?? 'unknown',
          worldId,
        });
      }
      // Dismiss intro card after a brief delay before starting
      if (data.scenarioSummary) {
        const tid = setTimeout(() => {
          setShowIntro(false);
          advanceToNodeRef.current(startNode);
        }, 2500);
        autoAdvanceTimers.current.push(tid);
      } else {
        advanceToNodeRef.current(startNode);
      }
    } else {
      // No valid start node — finish immediately to avoid blank screen
      finishConversationRef.current();
    }
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

  // Proactively request mic permission on desktop so the permission dialog
  // appears immediately rather than being silently skipped later.
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    void navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
      // User denied or unavailable — text input fallback still works
    });
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles]);

  const getLegacyMarkedWords = useCallback(
    (option: ConversationActivityOption): string[] => {
      const explicitMarks = option.marksTargetWords?.filter(Boolean) ?? [];
      if (explicitMarks.length > 0) return explicitMarks;

      const normalizedWords = option.text
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      return normalizedWords.filter((word) =>
        data.targetWords.some((targetWord) => targetWord.toLowerCase() === word),
      );
    },
    [data.targetWords],
  );

  const getConversationOutcome = useCallback((): ComputedConversationOutcome => {
    const durationSeconds = Math.round((Date.now() - startTime.current) / 1000);

    if (data.successCriteria) {
      const scoringScenario = {
        successCriteria: data.successCriteria as unknown as ConversationScenario['successCriteria'],
        estimatedDurationSec: data.estimatedDurationSec ?? 90,
      } as unknown as ConversationScenario;

      const scored = scoreConversation({
        scenario: scoringScenario,
        turns: turnResultsRef.current,
        totalTimeSeconds: durationSeconds,
      });

      return {
        durationSeconds,
        score: scored.score,
        passed: scored.passed,
        acceptedTurns: scored.acceptedTurns,
        hintedTurns: scored.hintedTurns,
        targetWordsHit: scored.targetWordsHit,
        patternsHit: scored.patternsHit,
      };
    }

    const wordsHit = completedWordsRef.current.size;
    const totalWords = data.targetWords.length;
    const accuracy = totalWords > 0 ? wordsHit / totalWords : 1;

    return {
      durationSeconds,
      score: Math.round(accuracy * 100),
      passed: accuracy >= 0.5,
      acceptedTurns: attemptsRef.current,
      hintedTurns: hintedTurnsRef.current,
      targetWordsHit: [...completedWordsRef.current],
      patternsHit: [...new Set(turnResultsRef.current.flatMap((turn) => turn.markedPatterns))],
    };
  }, [data.estimatedDurationSec, data.successCriteria, data.targetWords]);

  const finishConversation = useCallback(() => {
    setNovaMood('celebrating');
    const outcome = getConversationOutcome();
    const conversationEvidence: CompletedConversationEvidence = {
      scenarioId: data.scenarioId,
      scenarioTheme: data.scenarioTheme,
      acceptedTurns: outcome.acceptedTurns,
      hintedTurns: outcome.hintedTurns,
      targetWordsHit: outcome.targetWordsHit,
      patternsHit: outcome.patternsHit,
      passed: outcome.passed,
      score: outcome.score,
    };

    if (data.scenarioId) {
      trackConversationCompleted({
        scenarioId: data.scenarioId,
        theme: data.scenarioTheme ?? 'unknown',
        score: outcome.score,
        passed: outcome.passed,
        durationSeconds: outcome.durationSeconds,
        acceptedTurns: outcome.acceptedTurns,
        hintedTurns: outcome.hintedTurns,
      });
    }

    onComplete({
      isCorrect: outcome.passed,
      score: outcome.score,
      timeSpentSeconds: outcome.durationSeconds,
      attempts: attemptsRef.current,
      hintsUsed: outcome.hintedTurns,
      conversationEvidence,
    });
  }, [data.scenarioId, data.scenarioTheme, getConversationOutcome, onComplete]);

  const advanceToNode = useCallback(
    (node: ConversationActivityNode) => {
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
          audioUrl: node.audioUrl,
        },
      ]);

      // Nova speaks — TTS with current rate
      if (node.speaker === 'nova') {
        setCurrentSpeech({ text: node.text, textTr: node.textTr });
        setCurrentAudioUrl(node.audioUrl ?? null);
        // Brief thinking state before speaking starts
        setNovaMood('thinking');
        pushTimer(() => {
          setNovaMood('speaking');
          void ttsSpeak(node.text, {
            rate: SPEECH_RATES[speechRateRef.current],
            audioUrl: node.audioUrl,
          });
        }, 500);
      }

      // DEV: warn if a node has both options and next — next is always ignored (BUG-14)
      if (
        import.meta.env.DEV &&
        node.speaker === 'nova' &&
        node.options &&
        node.options.length > 0 &&
        node.next
      ) {
        console.warn(
          `[ConversationActivity] Node "${node.id}" has both options and a "next" field. ` +
            `"next" is ignored; each response navigates via its own nextNodeId.`,
        );
      }

      // If nova with options → free-form input active + start hint + auto-advance timers
      if (node.speaker === 'nova' && node.options && node.options.length > 0) {
        currentPromptNodeIdRef.current = node.id;
        setOptions(node.options);
        // Hint timer — subtly suggest the first option after HINT_DELAY_MS
        hintTimerRef.current = setTimeout(() => {
          setHintVisible(true);
          setShowTranslation(true);
          if (data.scenarioId) {
            trackConversationHintShown({
              scenarioId: data.scenarioId,
              nodeId: node.id,
            });
          }
        }, HINT_DELAY_MS);
        // Auto-advance if child doesn't respond within AUTO_ADVANCE_MS
        if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);
        noResponseTimerRef.current = setTimeout(() => {
          autoAdvanceRef.current();
        }, AUTO_ADVANCE_MS);
      } else if (node.next) {
        currentPromptNodeIdRef.current = null;
        const nextNodeId = node.next;

        if (node.speaker === 'nova') {
          // Wait for TTS to finish before advancing to the next node
          pendingAfterSpeechRef.current = () => {
            const nextNode = nodesMap.current.get(nextNodeId);
            if (nextNode) advanceToNode(nextNode);
          };
          // Safety fallback in case TTS callback doesn't fire
          pushTimer(() => {
            if (pendingAfterSpeechRef.current) {
              const action = pendingAfterSpeechRef.current;
              pendingAfterSpeechRef.current = null;
              action();
            }
          }, 8000);
        } else {
          // Child bubble — advance after short delay (no TTS involved)
          pushTimer(() => {
            const nextNode = nodesMap.current.get(nextNodeId);
            if (nextNode) advanceToNode(nextNode);
          }, 1200);
        }
      } else {
        currentPromptNodeIdRef.current = null;
        // End of conversation — no next, no options → complete
        if (node.speaker === 'nova') {
          // Wait for TTS to finish before ending
          pendingAfterSpeechRef.current = () => {
            finishConversation();
          };
          // Safety fallback
          pushTimer(() => {
            if (pendingAfterSpeechRef.current) {
              pendingAfterSpeechRef.current = null;
              finishConversation();
            }
          }, 8000);
        } else {
          pushTimer(() => {
            finishConversation();
          }, 1500);
        }
      }
    },
    [finishConversation, pushTimer, data.scenarioId],
  );

  const handleOptionSelect = useCallback(
    (option: ConversationActivityOption) => {
      const hintUsed = hintVisible;
      const promptNodeId = currentPromptNodeIdRef.current ?? option.nextNodeId;
      const markedTargetWords = getLegacyMarkedWords(option);
      const markedPatterns = option.marksPatterns ?? [];

      setAttempts((a) => a + 1);
      setOptions([]);
      setCurrentRound((r) => r + 1);
      setHintVisible(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);

      if (hintUsed) {
        hintedTurnsRef.current += 1;
      }

      turnResultsRef.current.push({
        nodeId: promptNodeId,
        matched: true,
        hintUsed,
        markedTargetWords,
        markedPatterns,
      });

      if (data.scenarioId) {
        trackConversationTurnCompleted({
          scenarioId: data.scenarioId,
          nodeId: promptNodeId,
          matched: true,
          hintUsed,
        });
      }

      setCompletedWords((prev) => {
        const next = new Set(prev);
        for (const word of markedTargetWords) {
          next.add(word);
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
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
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
    [advanceToNode, finishConversation, getLegacyMarkedWords, haptic, data.scenarioId, hintVisible],
  );

  // ── Replay helper ──
  const replaySpeech = useCallback(
    (text?: string, audioUrl?: string) => {
      const target = text ?? currentSpeech?.text;
      const url = audioUrl ?? currentAudioUrl ?? undefined;
      if (target) {
        setNovaMood('speaking');
        void ttsSpeak(target, { rate: SPEECH_RATES[speechRateRef.current], audioUrl: url });
      }
    },
    [currentSpeech, currentAudioUrl],
  );

  // ── Free-form input handler (STT transcript or typed text) ──
  // alternatives: additional STT candidates to try if rawText doesn't match
  const handleFreeInput = useCallback(
    (rawText: string, alternatives: string[] = []) => {
      if (!rawText.trim() || options.length === 0) return;
      abortRecognition();

      const responseRules = options.map((option) => ({
        id: option.responseId ?? option.nextNodeId,
        expectedText: option.text,
        expectedTextTr: option.textTr,
        acceptedVariants: option.acceptableVariations,
        acceptedWords: option.acceptedWords,
        minimumConfidence: option.minimumConfidence,
        nextNodeId: option.nextNodeId,
        emoji: option.emoji,
        marksTargetWord: option.marksTargetWords,
        marksPattern: option.marksPatterns,
      }));

      const useResponseRuleMatcher = responseRules.some(
        (rule) =>
          (rule.acceptedWords && rule.acceptedWords.length > 0) ||
          rule.minimumConfidence != null ||
          (rule.marksTargetWord && rule.marksTargetWord.length > 0) ||
          (rule.marksPattern && rule.marksPattern.length > 0),
      );

      // Try primary text first, then each STT alternative — take first match
      const textsToTry = [rawText, ...alternatives.filter((a) => a !== rawText)];
      for (const text of textsToTry) {
        if (useResponseRuleMatcher) {
          const ruleMatch = matchConversationResponseRule({
            rawText: text,
            responses: responseRules,
            defaultThreshold: CHILD_ACCEPT_THRESHOLD,
            pronunciationScorer: comparePronunciation,
          });

          if (ruleMatch.matched) {
            const matchedOption = options.find(
              (option) => (option.responseId ?? option.nextNodeId) === ruleMatch.matched?.id,
            );
            if (matchedOption) {
              handleOptionSelect(matchedOption);
              return;
            }
          }
          continue;
        }

        const legacyMatch: MatchConversationResponseResult = rawMatchConversationResponse({
          rawText: text,
          options,
          targetWords: data.targetWords,
          acceptThreshold: CHILD_ACCEPT_THRESHOLD,
          pronunciationScorer: comparePronunciation,
        });
        if (legacyMatch.matchedOption) {
          handleOptionSelect(legacyMatch.matchedOption);
          return;
        }
      }

      // No match in any alternative — give feedback but keep child in the same round
      setFeedback('wrong');
      setNovaMood('sad');
      void haptic.error();
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
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

    // Abort any previous recognition session to prevent conflicts
    abortRecognition();

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = (event: Event & { error?: string }) => {
        setIsListening(false);
        const errorType = event.error;
        if (errorType === 'not-allowed') {
          setMicError(t('activities.conversationMicNotAllowed'));
        } else if (errorType === 'no-speech') {
          setMicError(t('activities.conversationMicNoSpeech'));
        } else if (errorType !== 'aborted') {
          setMicError(t('activities.conversationMicError'));
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        setMicError(null);
        const results = event.results[0];
        if (!results) return;

        // Collect all transcripts from alternatives
        const transcripts: string[] = [];
        for (let i = 0; i < results.length; i++) {
          const alt = results[i];
          if (alt) transcripts.push(alt.transcript.toLowerCase().trim());
        }

        // Pass all alternatives so handleFreeInput can try each before giving up
        const [best, ...rest] = transcripts;
        if (best) handleFreeInputRef.current(best, rest);
      };

      recognition.start();
    } catch {
      setMicError(t('activities.conversationMicError'));
    }
  }, [options, t]);

  // Keep startListeningRef in sync for auto-listen
  startListeningRef.current = startListening;

  // Keep handleFreeInputRef in sync so STT onresult always calls the latest version
  // (avoids stale closure when hintVisible changes mid-recognition session)
  const handleFreeInputRef = useRef<(rawText: string, alternatives?: string[]) => void>(() => {});
  handleFreeInputRef.current = handleFreeInput;

  // Keep advanceToNode/finishConversation refs current so the data useEffect can call the
  // latest versions without those callbacks appearing in the effect's dep array (BUG-13).
  advanceToNodeRef.current = advanceToNode;
  finishConversationRef.current = finishConversation;

  // Keep autoAdvanceRef in sync — called when child doesn't respond in time.
  // Reveal the hint visually for 2.5 s so the child sees what to say, then
  // advance using the option whose text the hint was showing (curr[0]).
  autoAdvanceRef.current = () => {
    const curr = optionsRef.current;
    if (curr.length === 0) return;
    // Make the hint & translation visible so the child can read the answer
    setHintVisible(true);
    setShowTranslation(true);
    // After a short pause advance using the first (= hinted) option
    setTimeout(() => {
      const latest = optionsRef.current;
      if (latest.length > 0 && latest[0]) {
        handleOptionSelect(latest[0]);
      }
    }, 2500);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-linear-to-b from-indigo-50 via-white to-slate-50">
      {/* ═══ Scenario Intro Card ═══ */}
      <AnimatePresence>
        {showIntro && data.scenarioSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-indigo-50/90 p-6"
          >
            <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-xl">
              <span className="text-4xl">{data.sceneEmoji}</span>
              <h2 className="mt-3 text-lg font-bold text-gray-800">{data.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{data.scenarioSummaryTr}</p>
              {data.targetPatterns && data.targetPatterns.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {data.targetPatterns.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              {data.scenarioMode === 'guided' && (
                <p className="mt-2 text-xs text-indigo-400">{t('activities.conversationGuided')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onClick={() => {
            setSpeechRateIndex((i) => (i + 1) % SPEECH_RATES.length);
          }}
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
                onClick={() => {
                  replaySpeech();
                }}
                className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-500 active:bg-indigo-100"
              >
                🔊 {t('activities.conversationReplay')}
              </button>
              <button
                onClick={() => {
                  setShowTranslation((v) => !v);
                }}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  showTranslation ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
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
                    onClick={() => {
                      replaySpeech(bubble.text, bubble.audioUrl);
                    }}
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
          className="shrink-0 border-t border-indigo-100/50 bg-white px-4 pt-3 pb-4"
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
                {showTranslation && <p className="text-xs text-amber-400">{options[0].textTr}</p>}
                {/* Pattern reveal badges */}
                {data.targetPatterns && data.targetPatterns.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                    {data.targetPatterns.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Free-form text input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={freeInputText}
              onChange={(e) => {
                setFreeInputText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && freeInputText.trim()) {
                  const val = freeInputText.trim();
                  setFreeInputText('');
                  handleFreeInput(val);
                }
              }}
              placeholder={t('activities.conversationTypeHere')}
              className="flex-1 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
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
                aria-label={
                  isListening
                    ? t('activities.conversationListening')
                    : t('activities.conversationKeyboard')
                }
              >
                <span className="text-3xl">{isListening ? '🔴' : '🎤'}</span>
              </motion.button>
            )}

            <button
              onClick={() => {
                setShowTranslation(true);
                setHintVisible(true);
              }}
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
          {micError && !isListening && feedback !== 'wrong' && (
            <Text variant="caption" className="mt-2 text-center text-amber-500">
              {micError}
            </Text>
          )}
          {/* Subtle mode-switch hint when idle */}
          {!isListening && feedback === 'idle' && !micError && SpeechRecognitionAPI && (
            <Text variant="caption" className="mt-1.5 text-center text-gray-300">
              {t('activities.conversationModeHint')}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
