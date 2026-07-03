/**
 * ConversationActivity — Nova ile Konuş
 *
 * Nova (maskot) ile çocuk arasında serbest karşılıklı konuşma.
 * Çocuk mikrofona konuşur veya metin kutusu ile yazar — seçenek butonu yok.
 * Web Speech API STT + TTS kullanır; metinle de tam çalışır.
 */

import {
  matchConversationResponseRule,
  openEndedConversationService,
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
  openEnded?: ConversationActivityOpenEnded;
  next?: string;
}

interface ConversationActivityOpenEnded {
  enabled: boolean;
  strategy: 'favorite_thing' | 'choose_thing' | 'because_reason' | 'free_text';
  domain: 'animal' | 'descriptor' | 'free_text' | 'color' | 'food';
  slotKey: string;
  nextNodeId: string;
  capturePrefixes?: string[];
  marksPattern?: string[];
  countCapturedValueAsTargetWord?: boolean;
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
  rawChildResponses?: string[];
  passed: boolean;
  score: number;
}

interface AcceptedConversationResponse {
  nextNodeId: string;
  childText: string;
  childTextTr: string;
  emoji?: string;
  markedTargetWords: string[];
  markedPatterns: string[];
  matchSource: 'rule' | 'open_ended_local' | 'open_ended_llm';
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
  /** İpucu/destek balonları için ton — amber uyarı, rose hata, sky bilgi */
  tone?: 'warning' | 'error' | 'info';
  /** Destek balonunda gösterilecek örnek cümle çipi */
  example?: string;
}

const CHILD_ACCEPT_THRESHOLD = 0.65;
const SPEECH_RATES = [0.6, 0.8, 1.0] as const;
const HINT_DELAY_MS = 8000; // Show hint after 8 s of no response
const AUTO_ADVANCE_MS = 20000; // Auto-advance after 20 s if child is stuck
const MAX_NODE_REJECTIONS = 3; // Auto-accept first option after this many wrong attempts
type NovaMood = 'idle' | 'speaking' | 'listening' | 'celebrating' | 'sad' | 'thinking';

function withArticle(value: string): string {
  return /^[aeiou]/i.test(value) ? `an ${value}` : `a ${value}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getSingleNextNodeId(options: ConversationActivityOption[]): string | null {
  const nextNodeIds = [...new Set(options.map((option) => option.nextNodeId))];
  return nextNodeIds.length === 1 ? (nextNodeIds[0] ?? null) : null;
}

function interpolateTemplate(
  template: string,
  slots: Record<string, string>,
  fallback?: string,
): string {
  const interpolated = template.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_match, key: string) => slots[key] ?? '',
  );
  const normalized = interpolated.replace(/\s+/g, ' ').trim();
  if (normalized.length > 0) return normalized;
  return fallback ?? template;
}

/**
 * Senaryo temasına göre canlı arka plan gradyanı (UX spec: chat-first redesign).
 * Metinler her zaman beyaz/açık kartlar üzerinde durur — kontrast gradyana bağlı değildir.
 */
const THEME_GRADIENTS: Record<string, string> = {
  animals: 'from-emerald-200 via-lime-100 to-amber-100',
  nature: 'from-emerald-200 via-sky-100 to-cyan-100',
  weather: 'from-sky-200 via-cyan-100 to-blue-100',
  food: 'from-orange-200 via-amber-100 to-yellow-100',
  school: 'from-sky-200 via-indigo-100 to-violet-100',
  family: 'from-rose-200 via-pink-100 to-amber-100',
  friends: 'from-pink-200 via-rose-100 to-orange-100',
  city: 'from-slate-200 via-sky-100 to-indigo-100',
  travel: 'from-cyan-200 via-sky-100 to-emerald-100',
  transport: 'from-cyan-200 via-sky-100 to-emerald-100',
  transportation: 'from-cyan-200 via-sky-100 to-emerald-100',
  sports: 'from-lime-200 via-emerald-100 to-teal-100',
  jobs: 'from-amber-200 via-yellow-100 to-orange-100',
  helpers: 'from-blue-200 via-sky-100 to-cyan-100',
  time: 'from-violet-200 via-purple-100 to-indigo-100',
  routine: 'from-violet-200 via-purple-100 to-indigo-100',
  health: 'from-teal-200 via-emerald-100 to-green-100',
  art: 'from-fuchsia-200 via-pink-100 to-purple-100',
  colors: 'from-fuchsia-200 via-pink-100 to-purple-100',
  emotions: 'from-yellow-200 via-amber-100 to-rose-100',
  toys: 'from-pink-200 via-fuchsia-100 to-violet-100',
  home: 'from-amber-200 via-orange-100 to-rose-100',
  clothes: 'from-purple-200 via-fuchsia-100 to-pink-100',
  body: 'from-rose-200 via-orange-100 to-amber-100',
  actions: 'from-lime-200 via-green-100 to-emerald-100',
};
const DEFAULT_THEME_GRADIENT = 'from-indigo-200 via-violet-100 to-fuchsia-100';

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

/* ─── Nova Header Avatar — kompakt (64px) mood animasyonlu avatar (chat-first redesign) ─── */

function NovaHeaderAvatar({ mood }: { mood: NovaMood }) {
  const isSpeaking = mood === 'speaking';
  const isCelebrating = mood === 'celebrating';
  const isListening = mood === 'listening';
  const isSad = mood === 'sad';
  const isThinking = mood === 'thinking';

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: 64, height: 64 }}
    >
      {/* Mood glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 52, height: 52 }}
        animate={
          isSpeaking
            ? {
                boxShadow: [
                  '0 0 8px 3px rgba(99,102,241,0.25)',
                  '0 0 18px 7px rgba(99,102,241,0.5)',
                  '0 0 8px 3px rgba(99,102,241,0.25)',
                ],
              }
            : isCelebrating
              ? { boxShadow: '0 0 14px 6px rgba(52,211,153,0.45)' }
              : isListening
                ? {
                    boxShadow: [
                      '0 0 6px 2px rgba(251,191,36,0.2)',
                      '0 0 14px 5px rgba(251,191,36,0.4)',
                      '0 0 6px 2px rgba(251,191,36,0.2)',
                    ],
                  }
                : isSad
                  ? { boxShadow: '0 0 10px 4px rgba(239,68,68,0.3)' }
                  : isThinking
                    ? {
                        boxShadow: [
                          '0 0 5px 2px rgba(168,85,247,0.15)',
                          '0 0 10px 4px rgba(168,85,247,0.3)',
                          '0 0 5px 2px rgba(168,85,247,0.15)',
                        ],
                      }
                    : { boxShadow: '0 0 4px 2px rgba(99,102,241,0.1)' }
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
            ? { y: [0, -2, 0], rotate: [0, 1.5, -1.5, 0] }
            : isCelebrating
              ? { y: [0, -8, 0], scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }
              : isListening
                ? { y: [0, -1, 0], scale: [1, 1.03, 1] }
                : isSad
                  ? { rotate: [0, -6, 6, -6, 0], y: [0, 1, 0] }
                  : isThinking
                    ? { rotate: [0, 4, -4, 0], y: [0, -1, 0] }
                    : { y: [0, -1, 0] }
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
        <img src={novaMascot} alt="Nova" className="h-14 w-14 drop-shadow-lg" />
      </motion.div>

      {/* Listening bars */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute -bottom-0.5 flex items-center gap-0.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-amber-400"
                animate={{ height: [3, 9, 3] }}
                transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking dots */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute -bottom-0.5 flex items-center gap-0.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-purple-400"
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration sparkle */}
      <AnimatePresence>
        {isCelebrating && (
          <motion.span
            className="pointer-events-none absolute -top-1 -right-1 text-base"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
            transition={{ duration: 1.1, repeat: 1 }}
          >
            ✨
          </motion.span>
        )}
      </AnimatePresence>

      {/* Sad reaction */}
      <AnimatePresence>
        {isSad && (
          <motion.span
            className="pointer-events-none absolute -top-1 -right-1 text-base"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
          >
            😿
          </motion.span>
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
  const currentPromptOpenEndedRef = useRef<ConversationActivityOpenEnded | null>(null);
  const turnResultsRef = useRef<ConversationTurnResult[]>([]);
  const hintedTurnsRef = useRef(0);
  const conversationSlotsRef = useRef<Record<string, string>>({});
  const rawChildResponsesRef = useRef<string[]>([]);
  // When handleFreeInput has already pushed the raw STT transcript, the
  // subsequent acceptConversationResponse must not push the canonical option
  // text as a second entry — otherwise the result screen shows duplicates.
  const skipNextRawAnswerLogRef = useRef<boolean>(false);
  // Same idea for the on-screen chat bubble: handleFreeInput shows what the
  // speaker actually said; we then skip the canonical bubble in
  // acceptConversationResponse to avoid stacking two child bubbles per turn.
  const skipNextChildBubbleRef = useRef<boolean>(false);
  const lastHeardBubbleIdRef = useRef<string | null>(null);
  const nodeRejectionsRef = useRef(0);
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
              pushTimer(() => {
                startListeningRef.current();
              }, 400);
            }
            return optionsRef.current.length > 0 ? 'listening' : 'idle';
          }
          return prev;
        });
      }
    });
    // Mount-only TTS subscription; all live state is read through refs by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build nodes map once
  useEffect(() => {
    const map = new Map<string, ConversationActivityNode>();
    for (const node of data.nodes) {
      map.set(node.id, node);
    }
    nodesMap.current = map;
    currentPromptNodeIdRef.current = null;
    currentPromptOpenEndedRef.current = null;
    turnResultsRef.current = [];
    hintedTurnsRef.current = 0;
    conversationSlotsRef.current = {};
    rawChildResponsesRef.current = [];

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
    // Runs once per scenario (data) change; worldId is stable for a given scenario.
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

  // Proactively request mic permission on desktop so the permission dialog
  // appears immediately rather than being silently skipped later.
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    void navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
      // User denied or unavailable — text input fallback still works
    });
  }, []);

  // Auto-scroll chat to bottom — yeni balon, ipucu balonu veya typing göstergesi gelince
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, hintVisible, novaMood]);

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

  const rememberConversationSlot = useCallback((slotKey: string, slotValue: string) => {
    const trimmed = slotValue.trim().toLowerCase();
    if (!trimmed) return;
    conversationSlotsRef.current[slotKey] = trimmed;
    conversationSlotsRef.current[`${slotKey}Capitalized`] = capitalize(trimmed);
    conversationSlotsRef.current[`${slotKey}WithArticle`] = withArticle(trimmed);
    conversationSlotsRef.current[`${slotKey}WithArticleCapitalized`] = capitalize(
      withArticle(trimmed),
    );
  }, []);

  const resolveNodeContent = useCallback((node: ConversationActivityNode) => {
    const text = interpolateTemplate(node.text, conversationSlotsRef.current, node.text);
    const textTr = interpolateTemplate(node.textTr, conversationSlotsRef.current, node.textTr);
    const audioUrl = text === node.text ? node.audioUrl : undefined;
    return { text, textTr, audioUrl };
  }, []);

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
      rawChildResponses: rawChildResponsesRef.current,
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
        rawAnswerCount: rawChildResponsesRef.current.length,
        rawAnswerPreview: rawChildResponsesRef.current.slice(0, 3).join(' | '),
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
      nodeRejectionsRef.current = 0;
      setFeedback('idle');
      setHintVisible(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      const resolvedNode = resolveNodeContent(node);

      // Add bubble
      setBubbles((prev) => [
        ...prev,
        {
          id: node.id,
          speaker: node.speaker,
          text: resolvedNode.text,
          textTr: resolvedNode.textTr,
          emoji: node.emoji,
          audioUrl: resolvedNode.audioUrl,
        },
      ]);

      // Nova speaks — TTS with current rate
      if (node.speaker === 'nova') {
        setCurrentSpeech({ text: resolvedNode.text, textTr: resolvedNode.textTr });
        setCurrentAudioUrl(resolvedNode.audioUrl ?? null);
        // Brief thinking state before speaking starts
        setNovaMood('thinking');
        pushTimer(() => {
          setNovaMood('speaking');
          void ttsSpeak(resolvedNode.text, {
            rate: SPEECH_RATES[speechRateRef.current],
            audioUrl: resolvedNode.audioUrl,
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
        currentPromptOpenEndedRef.current = node.openEnded ?? null;
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
        currentPromptOpenEndedRef.current = null;
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
        currentPromptOpenEndedRef.current = null;
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
    [finishConversation, pushTimer, data.scenarioId, resolveNodeContent],
  );

  const acceptConversationResponse = useCallback(
    (response: AcceptedConversationResponse) => {
      const hintUsed = hintVisible;
      const promptNodeId = currentPromptNodeIdRef.current ?? response.nextNodeId;
      const markedTargetWords = response.markedTargetWords;
      const markedPatterns = response.markedPatterns;
      const trimmedChildText = response.childText.trim();

      setAttempts((a) => a + 1);
      setOptions([]);
      setCurrentRound((r) => r + 1);
      setHintVisible(false);
      setMicError(null);
      currentPromptOpenEndedRef.current = null;
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
          matchSource: response.matchSource,
          rawAnswer: trimmedChildText,
        });
      }

      if (trimmedChildText.length > 0) {
        if (skipNextRawAnswerLogRef.current) {
          // handleFreeInput already recorded the raw transcript — don't duplicate.
          skipNextRawAnswerLogRef.current = false;
        } else {
          rawChildResponsesRef.current.push(trimmedChildText);
        }
      }

      // Track whether handleFreeInput already rendered a child "heard" bubble
      // so we can avoid showing two stacked child bubbles on this turn.
      const skipChildBubble = skipNextChildBubbleRef.current;
      skipNextChildBubbleRef.current = false;

      setCompletedWords((prev) => {
        const next = new Set(prev);
        for (const word of markedTargetWords) {
          next.add(word);
        }
        return next;
      });

      // Add child's bubble (unless handleFreeInput already showed a "heard" bubble)
      if (!skipChildBubble) {
        const childBubble: ChatBubble = {
          id: `child-${Date.now()}`,
          speaker: 'child',
          text: response.childText,
          textTr: response.childTextTr,
          emoji: response.emoji,
        };
        setBubbles((prev) => [...prev, childBubble]);
      }

      setNovaMood('celebrating');
      setFeedback('correct');
      void haptic.success();
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('idle');
        setNovaMood('idle');
        // Skip child echo node (templates have explicit child nodes that
        // mirror the option text — we already added the child bubble above)
        const echoNode = nodesMap.current.get(response.nextNodeId);
        const targetNodeId = echoNode?.speaker === 'child' ? echoNode.next : response.nextNodeId;
        const nextNode = targetNodeId ? nodesMap.current.get(targetNodeId) : undefined;
        if (nextNode) {
          advanceToNode(nextNode);
        } else {
          finishConversation();
        }
      }, 800);
    },
    [advanceToNode, finishConversation, haptic, data.scenarioId, hintVisible],
  );

  const handleOptionSelect = useCallback(
    (option: ConversationActivityOption) => {
      acceptConversationResponse({
        nextNodeId: option.nextNodeId,
        childText: option.text,
        childTextTr: option.textTr,
        emoji: option.emoji,
        markedTargetWords: getLegacyMarkedWords(option),
        markedPatterns: option.marksPatterns ?? [],
        matchSource: 'rule',
      });
    },
    [acceptConversationResponse, getLegacyMarkedWords],
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

  const syncLastHeardBubble = useCallback((text: string) => {
    const bubbleId = lastHeardBubbleIdRef.current;
    const trimmed = text.trim();
    if (!bubbleId || trimmed.length === 0) return;
    setBubbles((prev) =>
      prev.map((bubble) => (bubble.id === bubbleId ? { ...bubble, text: trimmed } : bubble)),
    );
  }, []);

  // ── Free-form input handler (STT transcript or typed text) ──
  // alternatives: additional STT candidates to try if rawText doesn't match
  const handleFreeInput = useCallback(
    async (rawText: string, alternatives: string[] = []) => {
      if (!rawText.trim() || options.length === 0) return;
      abortRecognition();

      // ── Immediately show what was heard as a child bubble so the speaker gets
      // visible confirmation that STT worked (fixes "söylediğim hiçbirşey yazıya
      // dönüşmedi" — user couldn't tell if the mic captured anything). The raw
      // transcript is also recorded into rawChildResponsesRef here so that both
      // accepted AND rejected utterances appear on the result screen's
      // "Gerçek Cevapların" list. acceptConversationResponse intentionally skips
      // the push when invoked from this handler (see `alreadyLoggedRawAnswer`).
      const heardText = rawText.trim();
      let alreadyLoggedRawAnswer = false;
      if (heardText.length > 0) {
        const heardBubbleId = `child-heard-${Date.now()}`;
        rawChildResponsesRef.current.push(heardText);
        alreadyLoggedRawAnswer = true;
        lastHeardBubbleIdRef.current = heardBubbleId;
        setBubbles((prev) => [
          ...prev,
          {
            id: heardBubbleId,
            speaker: 'child',
            text: heardText,
            textTr: '',
          },
        ]);
      }
      skipNextRawAnswerLogRef.current = alreadyLoggedRawAnswer;
      skipNextChildBubbleRef.current = alreadyLoggedRawAnswer;
      setMicError(null);

      const openEndedConfig = currentPromptOpenEndedRef.current;
      const textsToTry = [rawText, ...alternatives.filter((a) => a !== rawText)];
      let lastOpenEndedMatch: Awaited<
        ReturnType<typeof openEndedConversationService.evaluateTurn>
      > | null = null;

      if (openEndedConfig) {
        for (const text of textsToTry) {
          const openEndedMatch = await openEndedConversationService.evaluateTurn({
            rawText: text,
            nodeId: currentPromptNodeIdRef.current ?? 'unknown',
            scenarioId: data.scenarioId,
            nodeText:
              (currentPromptNodeIdRef.current
                ? nodesMap.current.get(currentPromptNodeIdRef.current)?.text
                : undefined) ?? '',
            config: openEndedConfig,
            targetWords: data.targetWords,
            targetPatterns: data.targetPatterns,
            slots: conversationSlotsRef.current,
            responseExamples: options.map((option) => option.text),
          });
          lastOpenEndedMatch = openEndedMatch;

          if (openEndedMatch.accepted && openEndedMatch.resolution) {
            if (text.trim() !== heardText) {
              syncLastHeardBubble(text);
            }
            rememberConversationSlot(
              openEndedMatch.resolution.slotKey,
              openEndedMatch.resolution.slotValue,
            );
            acceptConversationResponse({
              nextNodeId: openEndedMatch.resolution.nextNodeId,
              childText: text.trim(),
              childTextTr: '',
              markedTargetWords: openEndedMatch.resolution.markedTargetWords,
              markedPatterns: openEndedMatch.resolution.marksPattern,
              matchSource: openEndedMatch.source === 'llm' ? 'open_ended_llm' : 'open_ended_local',
            });
            return;
          }
        }
      }

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
              if (text.trim() !== heardText) {
                syncLastHeardBubble(text);
              }
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
          if (text.trim() !== heardText) {
            syncLastHeardBubble(text);
          }
          handleOptionSelect(legacyMatch.matchedOption);
          return;
        }
      }

      if (openEndedConfig) {
        // Rejected — increment per-node rejection counter
        nodeRejectionsRef.current += 1;

        // After MAX_NODE_REJECTIONS, auto-accept first option so child isn't stuck
        const fallback = options[0];
        if (nodeRejectionsRef.current >= MAX_NODE_REJECTIONS && fallback) {
          const helpText = `Let's say: ${fallback.text}`;
          setBubbles((prev) => [
            ...prev,
            { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
          ]);
          setNovaMood('speaking');
          void ttsSpeak(helpText, { rate: SPEECH_RATES[speechRateRef.current] });
          pushTimer(() => {
            handleOptionSelect(fallback);
          }, 2500);
          return;
        }

        // If LLM provided coaching text, Nova speaks it
        if (lastOpenEndedMatch?.novaResponseText) {
          void haptic.error();
          const coachText = lastOpenEndedMatch.novaResponseText;
          setBubbles((prev) => [
            ...prev,
            { id: `nova-coach-${Date.now()}`, speaker: 'nova', text: coachText, textTr: '' },
          ]);
          setNovaMood('thinking');
          pushTimer(() => {
            setNovaMood('speaking');
            void ttsSpeak(coachText, { rate: SPEECH_RATES[speechRateRef.current] });
          }, 300);
          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => {
            setNovaMood('listening');
          }, 5000);
          return;
        }
      }

      const shouldTryAutomaticSemiOpenFallback =
        data.scenarioMode === 'semi_open' && !openEndedConfig && options.length > 0;

      if (shouldTryAutomaticSemiOpenFallback) {
        const defaultNextNodeId = getSingleNextNodeId(options);
        if (defaultNextNodeId) {
          const automaticMatch = await openEndedConversationService.evaluateTurn({
            rawText,
            scenarioId: data.scenarioId,
            nodeId: currentPromptNodeIdRef.current ?? 'unknown',
            nodeText:
              (currentPromptNodeIdRef.current
                ? nodesMap.current.get(currentPromptNodeIdRef.current)?.text
                : undefined) ?? '',
            targetWords: data.targetWords,
            targetPatterns: data.targetPatterns,
            slots: conversationSlotsRef.current,
            defaultNextNodeId,
            responseExamples: options.map((option) => option.text),
          });

          if (automaticMatch.accepted && automaticMatch.resolution) {
            if (rawText.trim() !== heardText) {
              syncLastHeardBubble(rawText);
            }
            if (automaticMatch.resolution.slotKey && automaticMatch.resolution.slotValue) {
              rememberConversationSlot(
                automaticMatch.resolution.slotKey,
                automaticMatch.resolution.slotValue,
              );
            }
            acceptConversationResponse({
              nextNodeId: automaticMatch.resolution.nextNodeId,
              childText: rawText.trim(),
              childTextTr: '',
              markedTargetWords: automaticMatch.resolution.markedTargetWords,
              markedPatterns: automaticMatch.resolution.marksPattern,
              matchSource: automaticMatch.source === 'llm' ? 'open_ended_llm' : 'open_ended_local',
            });
            return;
          }

          // Rejected — increment per-node rejection counter
          nodeRejectionsRef.current += 1;

          // After MAX_NODE_REJECTIONS, auto-accept first option so child isn't stuck
          const fallback = options[0];
          if (nodeRejectionsRef.current >= MAX_NODE_REJECTIONS && fallback) {
            const helpText = `Let's say: ${fallback.text}`;
            setBubbles((prev) => [
              ...prev,
              { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
            ]);
            setNovaMood('speaking');
            void ttsSpeak(helpText, { rate: SPEECH_RATES[speechRateRef.current] });
            pushTimer(() => {
              handleOptionSelect(fallback);
            }, 2500);
            return;
          }

          // If LLM provided coaching text, Nova speaks it
          if (automaticMatch.novaResponseText) {
            void haptic.error();
            const coachText = automaticMatch.novaResponseText;
            setBubbles((prev) => [
              ...prev,
              { id: `nova-coach-${Date.now()}`, speaker: 'nova', text: coachText, textTr: '' },
            ]);
            setNovaMood('thinking');
            pushTimer(() => {
              setNovaMood('speaking');
              void ttsSpeak(coachText, { rate: SPEECH_RATES[speechRateRef.current] });
            }, 300);
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = setTimeout(() => {
              setNovaMood('listening');
            }, 5000);
            return;
          }
        }
      }

      // No match in any alternative — increment rejection counter
      nodeRejectionsRef.current += 1;

      // After MAX_NODE_REJECTIONS, auto-accept first option so child isn't stuck
      const fallback = options[0];
      if (nodeRejectionsRef.current >= MAX_NODE_REJECTIONS && fallback) {
        const helpText = `Let's say: ${fallback.text}`;
        setBubbles((prev) => [
          ...prev,
          { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
        ]);
        setNovaMood('speaking');
        void ttsSpeak(helpText, { rate: SPEECH_RATES[speechRateRef.current] });
        pushTimer(() => {
          handleOptionSelect(fallback);
        }, 2500);
        return;
      }

      setFeedback('wrong');
      setNovaMood('sad');
      void haptic.error();
      // Sesli "Nova seni anlayamadı" kaldırıldı (yalnızca çocuk sesi çalmalı) —
      // sessiz görsel yönlendirme: ipucu balonu doğru cevabı gösterir
      setHintVisible(true);
      setShowTranslation(true);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('idle');
        setNovaMood('listening');
        // Restart recognition — no TTS was spoken on this wrong-answer path so
        // onSpeakingStateChange never fires; we must restart the mic manually.
        if (SpeechRecognitionAPI && optionsRef.current.length > 0) {
          startListeningRef.current();
        }
      }, 1200);
    },
    [
      options,
      data.targetWords,
      data.scenarioId,
      data.scenarioMode,
      data.targetPatterns,
      handleOptionSelect,
      haptic,
      rememberConversationSlot,
      acceptConversationResponse,
      pushTimer,
      syncLastHeardBubble,
    ],
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
          // Sessiz görsel bildirim — dock'taki durum satırı mesajı gösterir
          setMicError(t('activities.conversationMicNotAllowed'));
        } else if (errorType === 'no-speech') {
          setFeedback('wrong');
          setNovaMood('sad');
          void haptic.error();
          // Sesli destek yerine sessiz ipucu balonu (yalnızca çocuk sesi çalmalı)
          setHintVisible(true);
          setShowTranslation(true);
          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => {
            setFeedback('idle');
            setNovaMood('listening');
            if (optionsRef.current.length > 0) {
              startListeningRef.current();
            }
          }, 1200);
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
        if (best) void handleFreeInputRef.current(best, rest);
      };

      recognition.start();
    } catch {
      setMicError(t('activities.conversationMicError'));
    }
  }, [options, haptic, t]);

  // Keep startListeningRef in sync for auto-listen
  startListeningRef.current = startListening;

  // Keep handleFreeInputRef in sync so STT onresult always calls the latest version
  // (avoids stale closure when hintVisible changes mid-recognition session)
  const handleFreeInputRef = useRef<
    (rawText: string, alternatives?: string[]) => void | Promise<void>
  >(() => {});
  handleFreeInputRef.current = handleFreeInput;

  // Keep advanceToNode/finishConversation refs current so the data useEffect can call the
  // latest versions without those callbacks appearing in the effect's dep array (BUG-13).
  advanceToNodeRef.current = advanceToNode;
  finishConversationRef.current = finishConversation;

  // Keep autoAdvanceRef in sync — called when child doesn't respond in time.
  // Timeout should reveal support, not fabricate a child answer.
  autoAdvanceRef.current = () => {
    const curr = optionsRef.current;
    if (curr.length === 0) return;
    setHintVisible(true);
    setShowTranslation(true);
    setNovaMood('listening');
  };

  const themeGradient = THEME_GRADIENTS[data.scenarioTheme ?? ''] ?? DEFAULT_THEME_GRADIENT;
  const inputActive = options.length > 0;
  // TTS konuşurken en yeni Nova balonunda "konuşuyor" göstergesi gösterilir
  // (eski altyazı kartının yerini alır — UX spec Zone B)
  let lastNovaBubbleId: string | null = null;
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i];
    if (bubble && bubble.speaker === 'nova') {
      lastNovaBubbleId = bubble.id;
      break;
    }
  }

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden bg-linear-to-b ${themeGradient}`}
    >
      {/* ═══ Scenario Intro Card ═══ */}
      <AnimatePresence>
        {showIntro && data.scenarioSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 p-6 backdrop-blur-sm"
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

      {/* ═══ Zone A — Kompakt Başlık (≤88px, sabit) ═══ */}
      <div className="shrink-0 px-3 pt-2">
        <div className="flex items-center gap-2 rounded-3xl bg-white/90 py-1 pr-2 pl-1 shadow-md backdrop-blur">
          <NovaHeaderAvatar mood={novaMood} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-tight">
              <span aria-hidden="true" className="text-sm">
                {data.sceneEmoji}
              </span>
              <Text variant="overline" className="text-[10px] text-indigo-400">
                {t('activities.conversationHeader')}
              </Text>
            </div>
            <Text variant="caption" className="block truncate text-xs font-semibold text-gray-700">
              {data.titleTr}
            </Text>
            <div className="mt-0.5">
              <ProgressDots current={currentRound} total={totalRounds} />
            </div>
          </div>
          <button
            onClick={() => {
              setSpeechRateIndex((i) => (i + 1) % SPEECH_RATES.length);
            }}
            className="flex h-11 min-w-11 items-center justify-center rounded-full bg-indigo-50 px-2 text-xs font-bold text-indigo-500 active:bg-indigo-100"
          >
            {SPEECH_RATES[speechRateIndex]}x
          </button>
          <button
            onClick={() => {
              setShowTranslation((v) => !v);
            }}
            aria-pressed={showTranslation}
            aria-label={t('activities.conversationTranslate')}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
              showTranslation ? 'bg-emerald-100' : 'bg-gray-100 opacity-60'
            }`}
          >
            <span aria-hidden="true">🇹🇷</span>
          </button>
        </div>
      </div>

      {/* ═══ Zone B — Sohbet Dizisi (tek esnek bölge, kaydırılabilir) ═══ */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
      >
        <AnimatePresence initial={false}>
          {bubbles.map((bubble) => {
            const isSpeakingBubble =
              bubble.speaker === 'nova' &&
              bubble.id === lastNovaBubbleId &&
              novaMood === 'speaking';
            const novaBubbleClass =
              bubble.tone === 'error'
                ? 'border border-rose-200 bg-rose-50'
                : bubble.tone === 'warning'
                  ? 'border border-amber-200 bg-amber-50'
                  : bubble.tone === 'info'
                    ? 'border border-sky-200 bg-sky-50'
                    : 'bg-white';
            return (
              <motion.div
                key={bubble.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`flex items-start gap-1.5 ${
                  bubble.speaker === 'child' ? 'flex-row-reverse' : ''
                }`}
              >
                {bubble.speaker === 'nova' ? (
                  <img
                    src={novaMascot}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full bg-white/80 p-0.5 shadow-sm"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm shadow-sm"
                  >
                    {childAvatarEmoji}
                  </span>
                )}

                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-2.5 shadow-md ${
                    bubble.speaker === 'nova'
                      ? `rounded-tl-md ${novaBubbleClass}`
                      : 'rounded-tr-md bg-indigo-500 text-white'
                  }`}
                >
                  <p
                    className={`text-base font-semibold ${
                      bubble.speaker === 'nova'
                        ? bubble.tone === 'error'
                          ? 'text-rose-700'
                          : bubble.tone === 'warning'
                            ? 'text-amber-700'
                            : 'text-gray-800'
                        : 'text-white'
                    }`}
                  >
                    {bubble.text}
                    {isSpeakingBubble && (
                      <span
                        role="img"
                        aria-label={t('activities.conversationSpeaking')}
                        className="ml-1.5 inline-flex items-end gap-0.5 align-baseline"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1 rounded-full bg-indigo-400"
                            animate={{ height: [4, 10, 4] }}
                            transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                          />
                        ))}
                      </span>
                    )}
                  </p>
                  {showTranslation && bubble.textTr.trim().length > 0 && (
                    <p
                      className={`mt-0.5 text-xs ${
                        bubble.speaker === 'nova' ? 'text-gray-400' : 'text-indigo-200'
                      }`}
                    >
                      {bubble.textTr}
                    </p>
                  )}
                  {bubble.example && (
                    <span className="mt-1.5 inline-flex max-w-full rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                      {bubble.example}
                    </span>
                  )}
                  {bubble.speaker === 'nova' && (
                    <button
                      onClick={() => {
                        replaySpeech(bubble.text, bubble.audioUrl);
                      }}
                      className="-mb-1.5 -ml-1.5 flex min-h-11 min-w-11 items-center justify-center rounded-full text-base text-indigo-400 opacity-70 transition-opacity active:opacity-100"
                      aria-label={t('activities.conversationReplay')}
                    >
                      <span aria-hidden="true">🔊</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* İpucu — sabit banner yerine sohbet balonu (dock yüksekliği sabit kalır) */}
        <AnimatePresence>
          {hintVisible && options[0] && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-1.5"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm shadow-sm"
              >
                💡
              </span>
              <div className="max-w-[80%] rounded-3xl rounded-tl-md border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-md">
                <p className="text-xs text-amber-500">{t('activities.conversationTryThis')}</p>
                <p className="text-base font-semibold text-amber-700">{options[0].text}</p>
                {showTranslation && <p className="text-xs text-amber-400">{options[0].textTr}</p>}
                {data.targetPatterns && data.targetPatterns.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nova düşünüyor — typing göstergesi balonu */}
        <AnimatePresence>
          {novaMood === 'thinking' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-1.5"
            >
              <img
                src={novaMascot}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full bg-white/80 p-0.5 shadow-sm"
              />
              <div
                role="status"
                aria-label={t('activities.conversationTypingIndicator')}
                className="flex items-center gap-1 rounded-3xl rounded-tl-md bg-white px-4 py-3.5 shadow-md"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-300"
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Zone C — Sabit Alt Dock (her zaman görünür, yüksekliği durumla oynamaz) ═══ */}
      <div className="safe-area-bottom shrink-0 px-3 pt-1 pb-3">
        {/* Sabit yükseklikte durum satırı — dock zıplamaz */}
        <div className="flex h-6 items-center justify-center" aria-live="polite">
          {isListening ? (
            <Text variant="caption" className="font-semibold text-indigo-600">
              {t('activities.conversationListening')}
            </Text>
          ) : feedback === 'wrong' ? (
            <Text variant="caption" className="font-semibold text-rose-600">
              {t('activities.conversationTryAgain')}
            </Text>
          ) : micError ? (
            <Text variant="caption" className="text-amber-700">
              {micError}
            </Text>
          ) : inputActive && SpeechRecognitionAPI ? (
            <Text variant="caption" className="text-gray-600">
              {t('activities.conversationModeHint')}
            </Text>
          ) : null}
        </div>

        <div className="flex items-center gap-2 rounded-3xl bg-white/95 p-2 shadow-lg backdrop-blur">
          <input
            type="text"
            value={freeInputText}
            disabled={!inputActive}
            onChange={(e) => {
              setFreeInputText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && freeInputText.trim()) {
                const val = freeInputText.trim();
                setFreeInputText('');
                void handleFreeInput(val);
              }
            }}
            placeholder={t('activities.conversationTypeHere')}
            className="h-11 min-w-0 flex-1 rounded-full border border-indigo-100 bg-indigo-50 px-4 text-base text-gray-700 placeholder:text-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-40"
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
                  void handleFreeInput(val);
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md"
              >
                <span className="text-lg">➤</span>
              </motion.button>
            )}
          </AnimatePresence>
          {SpeechRecognitionAPI && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              disabled={!inputActive}
              onClick={isListening ? abortRecognition : startListening}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-40 ${
                isListening
                  ? 'animate-pulse bg-red-500'
                  : feedback === 'wrong'
                    ? 'bg-red-100'
                    : 'bg-indigo-500 active:scale-95'
              }`}
              aria-label={
                isListening
                  ? t('activities.conversationListening')
                  : t('activities.conversationMicStart')
              }
            >
              <span aria-hidden="true" className="text-2xl">
                {isListening ? '🔴' : '🎤'}
              </span>
            </motion.button>
          )}
          <button
            disabled={!inputActive}
            onClick={() => {
              setShowTranslation(true);
              setHintVisible(true);
            }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-amber-100 disabled:opacity-40 ${
              hintVisible ? 'bg-amber-200' : 'bg-amber-50'
            }`}
            aria-label={t('activities.conversationHintButton')}
          >
            <span aria-hidden="true">💡</span>
          </button>
        </div>
      </div>

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
