/**
 * Speech Service
 *
 * TTS (Kokoro-82M neural + Web Speech API fallback) ve STT.
 * Tüm ses verileri cihazda işlenir — COPPA uyumlu.
 */

import { generateSpeech } from './kokoroService';

// ===== FEATURE DETECTION =====

const SpeechRecognitionCtor: (new () => SpeechRecognition) | undefined =
  typeof window !== 'undefined'
    ? (((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as
        | (new () => SpeechRecognition)
        | undefined)
    : undefined;

const synthAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognitionCtor;
}

export function isSpeechSynthesisSupported(): boolean {
  return synthAvailable;
}

// ===== TEXT-TO-SPEECH (TTS) =====

interface SpeakOptions {
  /** BCP-47 language code (default: 'en-US') */
  lang?: string;
  /** Speech rate 0.1–10 (default: 0.85 for children) */
  rate?: number;
  /** Pitch 0–2 (default: 1.1 — slightly higher for friendliness) */
  pitch?: number;
  /** Volume 0–1 (default: 1) */
  volume?: number;
  /** Pre-recorded audio URL — if provided, plays this instead of TTS */
  audioUrl?: string;
}

// ===== AUDIO PLAYBACK =====

/** Currently playing audio element — tracked for stop/cancel */
let currentAudio: HTMLAudioElement | null = null;

function isPlaybackBlockedError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError';
}

export async function unlockAudioPlayback(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio(SILENT_WAV_DATA_URI);
    audio.muted = true;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
  } catch {
    // Best-effort warmup only.
  }
}

function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/** Play audio from URL with tracking for stop/cancel */
function playAudio(src: string): Promise<void> {
  return new Promise((resolve) => {
    stopCurrentAudio();
    if (synthAvailable) window.speechSynthesis.cancel();
    const audio = new Audio(src);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    audio.play().catch((error: unknown) => {
      if (isPlaybackBlockedError(error)) {
        console.warn('[Speech] Audio playback is waiting for user interaction.');
      }
      currentAudio = null;
      resolve();
    });
  });
}

/** Play audio from Blob with tracking for stop/cancel */
function playBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    stopCurrentAudio();
    if (synthAvailable) window.speechSynthesis.cancel();
    const audio = new Audio(url);
    currentAudio = audio;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      resolve();
    };
    audio.play().catch((error: unknown) => {
      if (isPlaybackBlockedError(error)) {
        console.warn('[Speech] Audio playback is waiting for user interaction.');
      }
      cleanup();
      resolve();
    });
  });
}

// ===== WEB SPEECH API FALLBACK =====

// Cached English voice — resolved once, reused across calls
let cachedEnglishVoice: SpeechSynthesisVoice | null = null;
let voiceResolved = false;

/**
 * Find the best English voice available on this device.
 * Prefers: Google/Samantha/Daniel high-quality voices > any en-US > any en-*
 */
function findBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (enVoices.length === 0) return null;

  // Prefer high-quality voices (Google, Apple Samantha/Daniel, Microsoft)
  const preferredNames = ['google', 'samantha', 'daniel', 'karen', 'moira', 'enhanced'];
  const preferred = enVoices.find((v) =>
    preferredNames.some((name) => v.name.toLowerCase().includes(name)),
  );
  if (preferred) return preferred;

  // Prefer en-US
  const enUS = enVoices.find((v) => v.lang === 'en-US');
  if (enUS) return enUS;

  // Any English voice
  return enVoices[0] ?? null;
}

function resolveEnglishVoice(): SpeechSynthesisVoice | null {
  if (voiceResolved) return cachedEnglishVoice;
  cachedEnglishVoice = findBestEnglishVoice();
  if (cachedEnglishVoice) voiceResolved = true;
  return cachedEnglishVoice;
}

// Voices load asynchronously on some browsers — pre-resolve when ready
if (synthAvailable) {
  window.speechSynthesis.onvoiceschanged = () => {
    voiceResolved = false;
    resolveEnglishVoice();
  };
  // Eager attempt (voices may already be loaded)
  resolveEnglishVoice();
}

/**
 * Web Speech API fallback — used only when cloud TTS is unavailable.
 * Explicitly selects an English voice to avoid Turkish pronunciation.
 */
function speakWithWebSpeechAPI(text: string, options: SpeakOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!synthAvailable) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? 'en-US';
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.volume = options.volume ?? 1;

    const voice = resolveEnglishVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      resolve();
    };
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        resolve();
      } else {
        reject(new Error(`Speech synthesis error: ${e.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Kelime/cümle seslendir — 3 katmanlı:
 * 1. Önceden üretilmiş audioUrl (varsa)
 * 2. Kokoro-82M neural TTS (tarayıcıda ONNX WASM)
 * 3. Web Speech API fallback (telefonun sesi — son çare)
 */
export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  // Priority 1: Pre-recorded audio
  if (options.audioUrl) {
    return playAudio(options.audioUrl);
  }

  // Priority 2: Kokoro neural TTS (browser-based)
  try {
    const blob = await generateSpeech(text, {
      speed: options.rate ?? 0.9,
    });
    if (blob) {
      await playBlob(blob);
      return;
    }
  } catch {
    // Kokoro unavailable — fall through to Web Speech API
  }

  // Priority 3: Web Speech API (explicit English voice — last resort)
  await speakWithWebSpeechAPI(text, options);
}

/**
 * Seslendirmeyi durdur.
 */
export function stopSpeaking(): void {
  stopCurrentAudio();
  if (synthAvailable) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Mevcut sesleri listele (TTS engine'deki sesler).
 * Sayfa yüklenince sesler gecikmeli gelebilir — ilk çağrıda boş dönebilir.
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!synthAvailable) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * İngilizce sesleri filtrele.
 */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getAvailableVoices().filter((v) => v.lang.startsWith('en'));
}

// ===== SPEECH-TO-TEXT (STT) =====

interface RecognitionOptions {
  /** BCP-47 language code (default: 'en-US') */
  lang?: string;
  /** Keep listening after first result (default: false) */
  continuous?: boolean;
  /** Return interim results (default: true) */
  interimResults?: boolean;
  /** Timeout in ms before auto-stop (default: 8000) */
  timeoutMs?: number;
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

type RecognitionCallback = (result: RecognitionResult) => void;

let activeRecognition: SpeechRecognition | null = null;

/**
 * Konuşma tanıma başlat.
 *
 * @returns Tanıma durdurmak için cleanup fonksiyonu
 */
export function startRecognition(
  onResult: RecognitionCallback,
  onError?: (error: string) => void,
  options: RecognitionOptions = {},
): (() => void) | null {
  if (!SpeechRecognitionCtor) {
    onError?.('Speech recognition not supported');
    return null;
  }

  // Önceki oturumu temizle
  stopRecognition();

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = options.lang ?? 'en-US';
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.maxAlternatives = 3;

  // Timeout — çocuk konuşmazsa otomatik durdur
  const timeoutMs = options.timeoutMs ?? 8000;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      recognition.stop();
    }, timeoutMs);
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results[event.results.length - 1];
    if (!last) return;

    const alt = last[0];
    if (!alt) return;

    onResult({
      transcript: alt.transcript,
      confidence: alt.confidence,
      isFinal: last.isFinal,
    });

    // Restart timeout on interim results
    if (!last.isFinal) resetTimeout();
  };

  recognition.onerror = (event) => {
    // 'no-speech' and 'aborted' are not critical errors
    const errorType = (event as { error?: string }).error ?? 'unknown';
    if (errorType !== 'no-speech' && errorType !== 'aborted') {
      onError?.(errorType);
    }
  };

  recognition.onend = () => {
    if (timeoutId) clearTimeout(timeoutId);
    activeRecognition = null;
  };

  activeRecognition = recognition;
  recognition.start();
  resetTimeout();

  return () => {
    stopRecognition();
  };
}

/**
 * Aktif konuşma tanımayı durdur.
 */
export function stopRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // Already stopped
    }
    activeRecognition = null;
  }
}

/**
 * Konuşma tanıma aktif mi?
 */
export function isRecognitionActive(): boolean {
  return activeRecognition !== null;
}

// ===== PRONUNCIATION COMPARISON =====

/**
 * Common phonetic confusions for children learning English.
 * Maps characters that children often swap when pronouncing.
 */
const PHONETIC_EQUIVALENCES: ReadonlyArray<[string, string]> = [
  ['th', 'd'], // "the" → "de"
  ['th', 't'], // "think" → "tink"
  ['w', 'v'], // Turkish speakers: "water" → "vater"
  ['v', 'w'],
  ['r', 'l'], // common child confusion
  ['sh', 's'], // "ship" → "sip"
  ['ch', 'c'], // "chip" → "cip"
  ['ng', 'n'], // "sing" → "sin"
  ['ph', 'f'], // "phone" → "fone"
  ['ck', 'k'], // spelling variation
  ['ght', 't'], // "night" → "nit"
];

/**
 * Apply phonetic normalization to a string so near-miss
 * pronunciations score closer together.
 */
function phoneticNormalize(text: string): string {
  let result = text.toLowerCase().trim();
  for (const [from, to] of PHONETIC_EQUIVALENCES) {
    result = result.replaceAll(from, to);
  }
  // Remove doubled letters (e.g. "litter" → "liter")
  result = result.replace(/(.)\1+/g, '$1');
  return result;
}

/** Minimum similarity threshold for "close enough" for children */
const CHILD_ACCEPT_THRESHOLD = 0.65;

/**
 * Gelişmiş telaffuz karşılaştırma.
 * Çocuklar için toleranslı — fonetik normalizasyon + kademeli puanlama.
 *
 * Scoring tiers:
 *  1.0  — exact match
 *  0.9  — phonetic-equivalent match
 *  0.8  — substring/contains match
 *  0.65–0.8 — Levenshtein similarity (phonetic-normalized)
 *  <0.65 — raw Levenshtein similarity (capped at threshold)
 *
 * @returns 0-1 arası benzerlik skoru
 */
export function comparePronunciation(
  spoken: string,
  target: string,
  acceptableVariations: string[] = [],
): number {
  const normalizedSpoken = spoken.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();
  const allAcceptable = [
    normalizedTarget,
    ...acceptableVariations.map((v) => v.toLowerCase().trim()),
  ];

  // Tier 1: Exact match
  for (const acceptable of allAcceptable) {
    if (normalizedSpoken === acceptable) return 1.0;
  }

  // Tier 2: Phonetic-equivalent exact match
  const phoneticSpoken = phoneticNormalize(normalizedSpoken);
  for (const acceptable of allAcceptable) {
    if (phoneticSpoken === phoneticNormalize(acceptable)) return 0.9;
  }

  // Tier 3: Contains match (spoken includes target or vice versa)
  for (const acceptable of allAcceptable) {
    if (normalizedSpoken.includes(acceptable) || acceptable.includes(normalizedSpoken)) {
      return 0.8;
    }
  }

  // Tier 4: Phonetic-normalized Levenshtein
  const phoneticTarget = phoneticNormalize(normalizedTarget);
  const phoneticDist = levenshteinDistance(phoneticSpoken, phoneticTarget);
  const phoneticMaxLen = Math.max(phoneticSpoken.length, phoneticTarget.length);
  if (phoneticMaxLen === 0) return 1.0;
  const phoneticSim = 1 - phoneticDist / phoneticMaxLen;

  // Tier 5: Raw Levenshtein (fallback)
  const rawDist = levenshteinDistance(normalizedSpoken, normalizedTarget);
  const rawMaxLen = Math.max(normalizedSpoken.length, normalizedTarget.length);
  const rawSim = rawMaxLen === 0 ? 1.0 : 1 - rawDist / rawMaxLen;

  // Take the better of phonetic vs raw (phonetic normalization helps most cases)
  const bestSim = Math.max(phoneticSim, rawSim);

  return Math.max(0, bestSim);
}

/**
 * Whether the pronunciation is "good enough" for a child learner.
 * Uses the child-friendly threshold.
 */
export function isPronunciationAcceptable(
  spoken: string,
  target: string,
  acceptableVariations: string[] = [],
): boolean {
  return comparePronunciation(spoken, target, acceptableVariations) >= CHILD_ACCEPT_THRESHOLD;
}

/**
 * Basic Levenshtein distance.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Use single-row optimization for memory efficiency
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1, // deletion
        (curr[j - 1] ?? 0) + 1, // insertion
        (prev[j - 1] ?? 0) + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n] ?? 0;
}
