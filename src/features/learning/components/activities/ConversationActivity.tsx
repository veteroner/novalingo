/**
 * ConversationActivity — Nova ile Konuş
 *
 * Nova (maskot) ile çocuk arasında serbest karşılıklı konuşma.
 * Çocuk mikrofona konuşur veya metin kutusu ile yazar — seçenek butonu yok.
 * Web Speech API STT + TTS kullanır; metinle de tam çalışır.
 */

import { useMotionPolicy } from '@hooks/useMotionPolicy';
import {
  matchConversationResponseRule,
  openEndedConversationService,
  scoreConversation,
  type ConversationTurnResult,
} from '@/features/learning/data/conversations';
import type { ConversationScenario } from '@/features/learning/data/conversations/types/conversationScenario';
import type { ConversationSuccessCriteriaData } from '@/types/content';
import { createLogger } from '@/utils/logger';
import { Avatar } from '@components/atoms/Avatar';
import { Text } from '@components/atoms/Text';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { useHaptic } from '@hooks/useHaptic';
import {
  trackConversationCompleted,
  trackConversationHintShown,
  trackConversationStarted,
  trackConversationTurnCompleted,
} from '@services/analytics/analyticsService';
import { SpeechRecognitionAPI } from '@services/speech/speechRecognitionApi';
import {
  comparePronunciation,
  isSpeakingNow,
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

/** Mikrofon/tanıma akışı — "bir duyuyor bir duymuyor" şikâyetini teşhis etmek için. */
const sttLog = createLogger('stt');

/**
 * Nova'nın konuşması bittikten sonra mikrofonun açılması için beklenen süre.
 * iOS'ta AVAudioSession'ın playback'ten kayda geçmesi ölçülebilir zaman alıyor;
 * çok kısa tutulursa tanıma oturumu açılır ama hiç ses yakalamaz.
 */
const MIC_START_DELAY_MS = 700;

/**
 * Bir tanıma oturumunun sonuç vermeden sürebileceği azami süre.
 * iOS'ta ses oturumu bozulduğunda mikrofon `audio-capture` hatasını ~40 sn sonra
 * veriyor ve o süre boyunca çocuk ekranda kilitli kalıyor.
 */
const MIC_SESSION_TIMEOUT_MS = 12_000;

/**
 * TTS bitiş geri çağrısı hiç gelmezse akışın kilitlenmemesi için güvenlik süresi.
 * Süre dolduğunda Nova hâlâ konuşuyorsa replik kesilmez — `AFTER_SPEECH_RECHECK_MS`
 * aralığıyla yeniden bakılır (uzun kapanış replikleri 8 sn'yi aşabiliyor).
 */
const AFTER_SPEECH_FALLBACK_MS = 8000;
const AFTER_SPEECH_RECHECK_MS = 1000;
/** Konuşma durumu takılı kalırsa sonsuz beklememek için mutlak üst sınır. */
const AFTER_SPEECH_MAX_WAIT_MS = 30_000;

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

// SpeechRecognition — platforma göre native plugin ya da web API'sine çözülür.
// (iOS/Android WebView'de webkitSpeechRecognition çalışmaz; bkz. speechRecognitionApi.)

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

/* ─── Nova Header Avatar — kompakt (64px) mood animasyonlu avatar (chat-first redesign) ─── */

function NovaHeaderAvatar({ mood }: { mood: NovaMood }) {
  return <NovaCharacter mood={mood} size="sm" />;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  const { canAnimate } = useMotionPolicy();
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
                ? 'bg-primary-dark w-4'
                : 'w-1.5 bg-gray-300'
          }`}
          animate={{ scale: canAnimate && i === current ? [1, 1.15, 1] : 1 }}
          transition={
            canAnimate && i === current ? { duration: 1.5, repeat: Infinity } : { duration: 0 }
          }
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
  const { canAnimate } = useMotionPolicy();
  const activeChild = useChildStore((s) => s.activeChild);
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
  /** Bu tanıma oturumunda hiç sonuç geldi mi — sessiz biten oturumları ayırt etmek için */
  const gotResultRef = useRef(false);
  /** Ölü mikrofon oturumunu kapatan zamanlayıcı */
  const micWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Nova'nın konuşmasının bittiği an — mikrofonun ne kadar sonra açıldığını ölçmek için */
  const lastSpeechEndAtRef = useRef<number | null>(null);

  // Ref for auto-advance callback when child doesn't respond
  const autoAdvanceRef = useRef<() => void>(() => {});

  // Refs for advanceToNode/finishConversation — kept current so data useEffect always calls
  // the latest version without needing those callbacks in its own dep array (BUG-13).
  const advanceToNodeRef = useRef<(node: ConversationActivityNode) => void>(() => {});
  const finishConversationRef = useRef<() => void>(() => {});

  // Pending action to execute after TTS finishes (for intermediate/terminal nodes)
  const pendingAfterSpeechRef = useRef<(() => void) | null>(null);
  /**
   * Bekleyen "konuşma bitince" eylemi, repliğin seslendirmesi *başladıktan* sonra
   * tetiklenmeli. `advanceToNode` eylemi hemen kaydeder ama TTS 500 ms sonra başlar;
   * bu aradaki bir `isSpeaking=false` olayı (önceki repliğin bitişi veya stopSpeaking)
   * eylemi erken çalıştırıp repliği tamamen atlatıyordu — diyalogların sonunun
   * yarıda kalmasının sebeplerinden biri buydu.
   */
  const pendingSpeechStartedRef = useRef(false);

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
        lastSpeechEndAtRef.current = Date.now();

        // If there's a pending post-TTS action (intermediate/terminal node), execute it
        const pendingAction = pendingAfterSpeechRef.current;
        if (pendingAction) {
          // Seslendirme henüz başlamadıysa bu olay önceki repliğe ait — yoksay,
          // aksi hâlde bu düğümün repliği hiç duyulmadan ilerlenir.
          if (!pendingSpeechStartedRef.current) return;

          pendingAfterSpeechRef.current = null;
          pendingSpeechStartedRef.current = false;
          pushTimer(pendingAction, 600);
          setNovaMood('idle');
          return;
        }

        setNovaMood((prev) => {
          if (prev === 'speaking') {
            // Only start listening if there are still options for the child to respond to
            if (SpeechRecognitionAPI && optionsRef.current.length > 0) {
              // Mikrofonun TTS'in kuyruğunu kapmaması *ve* iOS'ta ses oturumunun
              // playback'ten kayda geçebilmesi için bekleme. 400 ms, kayıt çalındıktan
              // hemen sonra mikrofonun boş dönmesine yol açıyordu.
              pushTimer(() => {
                startListeningRef.current();
              }, MIC_START_DELAY_MS);
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

  /**
   * TTS bitiş geri çağrısı gelmezse bekleyen eylemi yine de yürütecek güvenlik
   * zamanlayıcısını kurar.
   *
   * Süre dolduğunda Nova hâlâ konuşuyorsa eylem **ertelenir** — aksi hâlde 8 sn'yi
   * aşan kapanış replikleri yarıda kesilip sonuç ekranı erken açılıyordu.
   * `AFTER_SPEECH_MAX_WAIT_MS`, konuşma durumu takılırsa sonsuz beklemeyi önler.
   */
  const armAfterSpeechFallback = useCallback(() => {
    const deadline = Date.now() + AFTER_SPEECH_MAX_WAIT_MS;
    const fire = () => {
      const action = pendingAfterSpeechRef.current;
      if (!action) return;
      if (isSpeakingNow() && Date.now() < deadline) {
        pushTimer(fire, AFTER_SPEECH_RECHECK_MS);
        return;
      }
      pendingAfterSpeechRef.current = null;
      pendingSpeechStartedRef.current = false;
      action();
    };
    pushTimer(fire, AFTER_SPEECH_FALLBACK_MS);
  }, [pushTimer]);

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
        pendingSpeechStartedRef.current = false;
        pushTimer(() => {
          setNovaMood('speaking');
          pendingSpeechStartedRef.current = true;
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
          armAfterSpeechFallback();
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
          armAfterSpeechFallback();
        } else {
          pushTimer(() => {
            finishConversation();
          }, 1500);
        }
      }
    },
    [armAfterSpeechFallback, finishConversation, pushTimer, data.scenarioId, resolveNodeContent],
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
          // Kaydı olan metin yalnızca seçeneğin kendisi; "Let's say: " öneki kayıtlı değil
          // ve seslendirilirse cihaz sesine düşer (bkz. speechService native kuralı).
          const helpSpeechText = fallback.text;
          setBubbles((prev) => [
            ...prev,
            { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
          ]);
          setNovaMood('speaking');
          void ttsSpeak(helpSpeechText, { rate: SPEECH_RATES[speechRateRef.current] });
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
            // Kaydı olan metin yalnızca seçeneğin kendisi; "Let's say: " öneki kayıtlı değil
            // ve seslendirilirse cihaz sesine düşer (bkz. speechService native kuralı).
            const helpSpeechText = fallback.text;
            setBubbles((prev) => [
              ...prev,
              { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
            ]);
            setNovaMood('speaking');
            void ttsSpeak(helpSpeechText, { rate: SPEECH_RATES[speechRateRef.current] });
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
        // Kaydı olan metin yalnızca seçeneğin kendisi; "Let's say: " öneki kayıtlı değil
        // ve seslendirilirse cihaz sesine düşer (bkz. speechService native kuralı).
        const helpSpeechText = fallback.text;
        setBubbles((prev) => [
          ...prev,
          { id: `nova-help-${Date.now()}`, speaker: 'nova', text: helpText, textTr: '' },
        ]);
        setNovaMood('speaking');
        void ttsSpeak(helpSpeechText, { rate: SPEECH_RATES[speechRateRef.current] });
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
    if (micWatchdogRef.current) {
      clearTimeout(micWatchdogRef.current);
      micWatchdogRef.current = null;
    }
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
    if (!SpeechRecognitionAPI) {
      sttLog.error('konuşma tanıma bu platformda yok — mikrofon hiç açılmayacak');
      return;
    }
    if (options.length === 0) {
      sttLog.debug('dinleme atlandı — bu düğümde seçenek yok');
      return;
    }

    // Abort any previous recognition session to prevent conflicts
    const hadPreviousSession = recognitionRef.current !== null;
    abortRecognition();

    const attemptStartedAt = Date.now();
    sttLog.step('dinleme başlatılıyor', {
      hadPreviousSession,
      msSinceSpeechEnd: lastSpeechEndAtRef.current
        ? attemptStartedAt - lastSpeechEndAtRef.current
        : null,
      optionCount: options.length,
    });

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        sttLog.step('mikrofon açıldı', { msToStart: Date.now() - attemptStartedAt });
        gotResultRef.current = false;
        setIsListening(true);
        setMicError(null);
        // Ölü oturum bekçisi: cihazda mikrofonun `audio-capture` ile 40 sn asılı
        // kaldığı ölçüldü. Süre dolarsa oturumu biz kapatırız; onerror/onend
        // normal akışı (uyarı + yeniden dinleme) zaten yürütüyor.
        if (micWatchdogRef.current) clearTimeout(micWatchdogRef.current);
        micWatchdogRef.current = setTimeout(() => {
          if (!gotResultRef.current) {
            sttLog.warn('mikrofon zaman aşımı — oturum kapatılıyor', {
              durationMs: Date.now() - attemptStartedAt,
            });
            abortRecognition();
          }
        }, MIC_SESSION_TIMEOUT_MS);
      };
      recognition.onend = () => {
        if (micWatchdogRef.current) clearTimeout(micWatchdogRef.current);
        // Sonuçsuz ve hatasız biten oturum = "bir duyuyor bir duymuyor" tablosu
        sttLog.step('mikrofon kapandı', {
          gotResult: gotResultRef.current,
          durationMs: Date.now() - attemptStartedAt,
        });
        setIsListening(false);
      };
      recognition.onerror = (event: Event & { error?: string }) => {
        setIsListening(false);
        const errorType = event.error;
        sttLog.warn('tanıma hatası', {
          errorType: errorType ?? 'unknown',
          gotResult: gotResultRef.current,
          durationMs: Date.now() - attemptStartedAt,
        });
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
        gotResultRef.current = true;
        setMicError(null);
        const results = event.results[0];
        if (!results) {
          sttLog.warn('sonuç olayı boş geldi');
          return;
        }

        // Collect all transcripts from alternatives
        const transcripts: string[] = [];
        for (let i = 0; i < results.length; i++) {
          const alt = results[i];
          if (alt) transcripts.push(alt.transcript.toLowerCase().trim());
        }

        // Pass all alternatives so handleFreeInput can try each before giving up
        const [best, ...rest] = transcripts;
        sttLog.step('duyuldu', {
          best,
          alternatives: rest.length,
          msToResult: Date.now() - attemptStartedAt,
        });
        if (best) void handleFreeInputRef.current(best, rest);
      };

      recognition.start();
    } catch (error) {
      // En sık sebep: önceki oturum tam kapanmadan yeni start() — WebKit InvalidStateError
      sttLog.error('recognition.start() fırlattı', { error });
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
    <div className="bg-background relative flex h-full flex-col overflow-hidden">
      {/* ═══ Scenario Intro Card ═══ */}
      <AnimatePresence>
        {showIntro && data.scenarioSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-surface/70 absolute inset-0 z-20 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <div className="bg-surface w-full max-w-xs rounded-3xl p-6 text-center shadow-xl">
              <span className="text-4xl">{data.sceneEmoji}</span>
              <h2 className="text-text mt-3 text-lg font-bold">{data.title}</h2>
              <p className="text-text-secondary mt-1 text-sm">{data.scenarioSummaryTr}</p>
              {data.targetPatterns && data.targetPatterns.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {data.targetPatterns.map((p) => (
                    <span
                      key={p}
                      className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              {data.scenarioMode === 'guided' && (
                <p className="text-primary mt-2 text-xs">{t('activities.conversationGuided')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Zone A — Kompakt Başlık (≤88px, sabit) ═══ */}
      <div className="shrink-0 px-3 pt-2">
        <div className="bg-surface/90 flex items-center gap-2 rounded-3xl py-1 pr-2 pl-1 shadow-md backdrop-blur">
          <NovaHeaderAvatar mood={novaMood} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-tight">
              <span aria-hidden="true" className="text-sm">
                {data.sceneEmoji}
              </span>
              <Text variant="overline" className="text-primary text-[10px]">
                {t('activities.conversationHeader')}
              </Text>
            </div>
            <Text variant="caption" className="text-text block truncate text-xs font-semibold">
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
            className="bg-primary/10 active:bg-primary/10 text-primary flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs font-bold"
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
              showTranslation ? 'bg-success-soft' : 'bg-surface-elevated opacity-60'
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
                  ? 'border border-amber-200 bg-reward-soft'
                  : bubble.tone === 'info'
                    ? 'border border-sky-200 bg-sky-50'
                    : 'bg-surface';
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
                  <NovaCharacter mood="thinking" size="sm" className="h-8 w-8" decorative />
                ) : (
                  <Avatar
                    avatarId={activeChild?.avatarId ?? 'owl'}
                    name={activeChild?.name}
                    size="xs"
                  />
                )}

                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-2.5 shadow-md ${
                    bubble.speaker === 'nova'
                      ? `rounded-tl-md ${novaBubbleClass}`
                      : 'bg-primary-dark rounded-tr-md text-white'
                  }`}
                >
                  <p
                    className={`text-base font-semibold ${
                      bubble.speaker === 'nova'
                        ? bubble.tone === 'error'
                          ? 'text-rose-700'
                          : bubble.tone === 'warning'
                            ? 'text-amber-700'
                            : 'text-text'
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
                            className="bg-primary-dark w-1 rounded-full"
                            animate={{ height: canAnimate ? [4, 10, 4] : 4 + i * 3 }}
                            transition={
                              canAnimate
                                ? { duration: 0.5, delay: i * 0.15, repeat: Infinity }
                                : { duration: 0 }
                            }
                          />
                        ))}
                      </span>
                    )}
                  </p>
                  {showTranslation && bubble.textTr.trim().length > 0 && (
                    <p
                      className={`mt-0.5 text-xs ${
                        bubble.speaker === 'nova' ? 'text-text-secondary' : 'text-indigo-200'
                      }`}
                    >
                      {bubble.textTr}
                    </p>
                  )}
                  {bubble.example && (
                    <span className="bg-surface text-text mt-1.5 inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                      {bubble.example}
                    </span>
                  )}
                  {bubble.speaker === 'nova' && (
                    <button
                      onClick={() => {
                        replaySpeech(bubble.text, bubble.audioUrl);
                      }}
                      className="text-primary -mb-1.5 -ml-1.5 flex min-h-11 min-w-11 items-center justify-center rounded-full text-base opacity-70 transition-opacity active:opacity-100"
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
              <div className="bg-reward-soft max-w-[80%] rounded-3xl rounded-tl-md border border-amber-200 px-4 py-2.5 shadow-md">
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
              <NovaCharacter mood="thinking" size="sm" className="h-8 w-8" decorative />
              <div
                role="status"
                aria-label={t('activities.conversationTypingIndicator')}
                className="bg-surface flex items-center gap-1 rounded-3xl rounded-tl-md px-4 py-3.5 shadow-md"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-300"
                    animate={
                      canAnimate ? { y: [0, -5, 0], opacity: [0.4, 1, 0.4] } : { y: 0, opacity: 1 }
                    }
                    transition={
                      canAnimate
                        ? { duration: 0.6, delay: i * 0.15, repeat: Infinity }
                        : { duration: 0 }
                    }
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
            <Text variant="caption" className="text-primary font-semibold">
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
            <Text variant="caption" className="text-text-secondary">
              {t('activities.conversationModeHint')}
            </Text>
          ) : null}
        </div>

        <div className="bg-surface/95 flex items-center gap-2 rounded-3xl p-2 shadow-lg backdrop-blur">
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
            className="bg-primary/10 text-text placeholder:text-text-secondary h-11 min-w-0 flex-1 rounded-full border border-indigo-100 px-4 text-base focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-40"
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
                className="bg-primary-dark flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md"
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
                  ? 'bg-error animate-pulse'
                  : feedback === 'wrong'
                    ? 'bg-error-soft'
                    : 'bg-primary-dark active:scale-95'
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
              hintVisible ? 'bg-amber-200' : 'bg-reward-soft'
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
