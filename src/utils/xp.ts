/**
 * XP Hesaplama Yardımcıları
 *
 * Ders tamamlama, streak bonusu ve level sistemi.
 */

// ===== XP CALCULATION =====
interface XPCalculationParams {
  baseXP: number;
  accuracy: number; // 0-1
  durationSeconds: number;
  estimatedSeconds: number;
  streak: number;
  isPremium: boolean;
  isFirstAttempt: boolean;
  isPerfect: boolean;
}

export interface XPBreakdown {
  base: number;
  accuracyBonus: number;
  speedBonus: number;
  streakMultiplier: number;
  firstTryBonus: number;
  perfectBonus: number;
  premiumBonus: number;
  total: number;
}

export function calculateXP(params: XPCalculationParams): XPBreakdown {
  const {
    baseXP,
    accuracy,
    durationSeconds,
    estimatedSeconds,
    streak,
    isPremium,
    isFirstAttempt,
    isPerfect,
  } = params;

  // 1. Doğruluk bonusu (%80+ doğruluk = bonus)
  const accuracyBonus = accuracy >= 0.8 ? Math.round(baseXP * (accuracy - 0.8) * 2.5) : 0;

  // 2. Hız bonusu (tahmini sürenin %75'inden kısa = bonus)
  const speedRatio = durationSeconds / estimatedSeconds;
  const speedBonus = speedRatio <= 0.75 ? Math.round(baseXP * 0.25 * (1 - speedRatio)) : 0;

  // 3. Streak çarpanı (max 2x)
  const streakMultiplier = Math.min(1 + streak * 0.02, 2);

  // 4. İlk deneme bonusu
  const firstTryBonus = isFirstAttempt ? Math.round(baseXP * 0.15) : 0;

  // 5. Mükemmel ders bonusu (%100 doğruluk)
  const perfectBonus = isPerfect ? Math.round(baseXP * 0.3) : 0;

  // 6. Premium bonus (%50)
  const subtotal = baseXP + accuracyBonus + speedBonus + firstTryBonus + perfectBonus;
  const withStreak = Math.round(subtotal * streakMultiplier);
  const premiumBonus = isPremium ? Math.round(withStreak * 0.5) : 0;

  const total = withStreak + premiumBonus;

  return {
    base: baseXP,
    accuracyBonus,
    speedBonus,
    streakMultiplier,
    firstTryBonus,
    perfectBonus,
    premiumBonus,
    total,
  };
}

// ===== LEVEL SYSTEM =====
// Fibonacci-benzeri ilerleme: Her seviye daha fazla XP gerektirir
const BASE_XP_PER_LEVEL = 100;
const GROWTH_FACTOR = 1.12;

/**
 * Belirli bir seviyeye ulaşmak için gereken XP
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(GROWTH_FACTOR, level - 1));
}

/**
 * Toplam XP'den level hesapla
 */
export function calculateLevel(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  let xpUsed = 0;

  while (level < 100) {
    const required = xpRequiredForLevel(level + 1);
    if (xpUsed + required > totalXP) {
      break;
    }
    xpUsed += required;
    level++;
  }

  const currentLevelXP = totalXP - xpUsed;
  const nextLevelXP = xpRequiredForLevel(level + 1);
  const progress = nextLevelXP > 0 ? currentLevelXP / nextLevelXP : 1;

  return { level, currentLevelXP, nextLevelXP, progress };
}

// ===== STAR RATING =====
/**
 * Skor'dan yıldız hesapla (0-3)
 */
export function calculateStars(score: number): number {
  if (score >= 95) return 3;
  if (score >= 75) return 2;
  if (score >= 50) return 1;
  return 0;
}
