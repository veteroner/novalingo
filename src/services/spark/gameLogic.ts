/**
 * Client-Side Game Logic — Spark Plan Compatible
 *
 * Cloud Functions'daki iş mantığını tarayıcıda çalıştırır.
 * Blaze planı olmadan tüm öğrenme döngüsünü çalışır hale getirir.
 */

// ===== DATE HELPERS =====

export function getTodayTR(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}

function getYesterdayTR(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}

export function getWeekId(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ===== LEVEL SYSTEM =====

const levelXPCache: number[] = [0, 0, 100];

function getRequiredArrayItem<T>(items: readonly T[], index: number, label: string): T {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`[GameLogic] Missing ${label} at index ${index}`);
  }
  return item;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  while (levelXPCache.length <= level) {
    const n = levelXPCache.length;
    const previousLevelXP = levelXPCache[n - 2] ?? 0;
    const currentLevelXP = levelXPCache[n - 1] ?? 0;
    levelXPCache.push(Math.floor(previousLevelXP + currentLevelXP * 0.5));
  }
  return levelXPCache[level] ?? 0;
}

// ===== XP CALCULATOR =====

const BASE_XP_PER_CORRECT = 10;

export interface ActivityResult {
  activityId: string;
  correct: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attempts: number;
}

export interface XPBreakdown {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  starsEarned: number;
  starRating: number;
  accuracy: number;
  isPerfect: boolean;
}

export function calculateLessonXP(
  activities: ActivityResult[],
  totalTimeMs: number,
  currentStreak: number,
): XPBreakdown {
  const total = activities.length;
  if (total === 0)
    return {
      baseXP: 0,
      bonusXP: 0,
      totalXP: 0,
      starsEarned: 0,
      starRating: 0,
      accuracy: 0,
      isPerfect: false,
    };

  const correctCount = activities.filter((a) => a.correct).length;
  const accuracy = correctCount / total;
  const isPerfect = accuracy === 1;
  const baseXP = correctCount * BASE_XP_PER_CORRECT;

  let bonusXP = 0;
  if (isPerfect) bonusXP += Math.floor(baseXP * 0.5);
  if (totalTimeMs < total * 30_000 * 0.7) bonusXP += Math.floor(baseXP * 0.2);
  bonusXP += Math.floor(baseXP * Math.min(currentStreak * 0.05, 0.5));
  if (activities.every((a) => a.attempts <= 1)) bonusXP += 5;
  if (activities.every((a) => a.hintsUsed === 0)) bonusXP += 3;

  const starRating = accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0;
  const starsEarned = isPerfect ? 15 : 5;

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    starsEarned,
    starRating,
    accuracy,
    isPerfect,
  };
}

// ===== SRS ENGINE (SM-2) =====

export interface SRSCard {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  status: 'learning' | 'reviewing' | 'mastered';
}

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MASTERED_REPS = 6;
const MASTERED_INTERVAL = 30;

export function createSRSCard(wordId: string, today: string): SRSCard {
  return {
    wordId,
    easeFactor: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    nextReviewDate: today,
    status: 'learning',
  };
}

export function reviewSRSCard(card: SRSCard, rating: number, today: string): SRSCard {
  let { easeFactor, interval, repetitions } = card;

  if (rating < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else if (repetitions === 3) interval = 7;
    else interval = Math.round(interval * easeFactor);
    easeFactor = Math.max(
      MIN_EASE,
      easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)),
    );
  }

  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + interval);
  const [nextReviewDate = today] = nextDate.toISOString().split('T');

  const status: SRSCard['status'] =
    repetitions >= MASTERED_REPS && interval > MASTERED_INTERVAL
      ? 'mastered'
      : repetitions > 0
        ? 'reviewing'
        : 'learning';

  return { ...card, easeFactor, interval, repetitions, nextReviewDate, status };
}

// ===== STREAK MANAGER =====

export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null,
): { newStreak: number; newLongest: number } {
  const today = getTodayTR();
  if (lastActivityDate === today) {
    return { newStreak: currentStreak, newLongest: longestStreak };
  }
  const newStreak =
    lastActivityDate === getYesterdayTR() || !lastActivityDate ? currentStreak + 1 : 1;
  return { newStreak, newLongest: Math.max(longestStreak, newStreak) };
}

// ===== NOVA EVOLUTION =====

const NOVA_STAGES: [string, number][] = [
  ['legendary', 20_000],
  ['adult', 8_000],
  ['teen', 3_000],
  ['child', 1_000],
  ['baby', 200],
  ['egg', 0],
];

export function getNovaStage(totalXP: number): string {
  for (const [stage, threshold] of NOVA_STAGES) {
    if (totalXP >= threshold) return stage;
  }
  return 'egg';
}

export function getNovaMood(lessonsToday: number, streak: number): number {
  if (lessonsToday >= 3 || streak >= 7) return 100;
  if (lessonsToday >= 1) return 80;
  if (streak > 0) return 60;
  return 40;
}

// ===== DAILY WHEEL =====

const WHEEL_SEGMENTS = [
  { id: 'stars_10', type: 'stars' as const, amount: 10, weight: 25 },
  { id: 'stars_25', type: 'stars' as const, amount: 25, weight: 15 },
  { id: 'stars_50', type: 'stars' as const, amount: 50, weight: 8 },
  { id: 'xp_20', type: 'xp' as const, amount: 20, weight: 20 },
  { id: 'xp_50', type: 'xp' as const, amount: 50, weight: 10 },
  { id: 'gems_5', type: 'gems' as const, amount: 5, weight: 12 },
  { id: 'gems_10', type: 'gems' as const, amount: 10, weight: 5 },
  { id: 'freeze', type: 'streak_freeze' as const, amount: 1, weight: 5 },
];

export type WheelSegment = (typeof WHEEL_SEGMENTS)[number];

export function pickWheelSegment(): WheelSegment {
  const totalWeight = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let random = Math.random() * totalWeight;
  for (const seg of WHEEL_SEGMENTS) {
    random -= seg.weight;
    if (random <= 0) return seg;
  }
  return getRequiredArrayItem(WHEEL_SEGMENTS, 0, 'wheel segment');
}

export function getWheelSegments() {
  return WHEEL_SEGMENTS;
}

// ===== QUEST TEMPLATES =====

const QUEST_TEMPLATES = [
  {
    type: 'lesson',
    title: 'Ders Kahramanı',
    targets: [1, 2, 3],
    rewards: [10, 20, 30],
    rewardType: 'stars' as const,
  },
  {
    type: 'xp',
    title: 'XP Avcısı',
    targets: [50, 100, 200],
    rewards: [3, 5, 10],
    rewardType: 'gems' as const,
  },
  {
    type: 'perfect',
    title: 'Mükemmeliyetçi',
    targets: [1, 2],
    rewards: [5, 10],
    rewardType: 'gems' as const,
  },
  {
    type: 'word',
    title: 'Kelime Ustası',
    targets: [5, 10, 20],
    rewards: [15, 25, 40],
    rewardType: 'stars' as const,
  },
  {
    type: 'streak',
    title: 'Seri Koruyucu',
    targets: [1],
    rewards: [10],
    rewardType: 'stars' as const,
  },
];

export function generateDailyQuests(today: string) {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4).map((t, i) => {
    const di = Math.floor(Math.random() * t.targets.length);
    const targetProgress = getRequiredArrayItem(t.targets, di, 'quest target');
    const rewardAmount = getRequiredArrayItem(t.rewards, di, 'quest reward');

    return {
      id: `${today}_${i}`,
      type: t.type,
      title: t.title,
      targetProgress,
      currentProgress: 0,
      reward: { type: t.rewardType, amount: rewardAmount },
      claimed: false,
      expiresAt: new Date(today + 'T23:59:59+03:00').toISOString(),
      createdAt: new Date().toISOString(),
    };
  });
}

// ===== PIN HASHING (Web Crypto API) =====

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPinHash(
  pin: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  const computed = await hashPin(pin, salt);
  // Constant-time comparison to prevent timing attacks
  if (computed.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}
