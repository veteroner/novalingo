/**
 * XP Calculator Service
 *
 * Centralises all XP calculation logic:
 * - Base XP per correct activity
 * - 5 bonus types (perfect, speed, streak, first-try, no-hints)
 * - Star currency earned
 * - Star rating (1-3)
 */

import type { ActivityResult } from '../types/request';

export interface XPBreakdown {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  accuracy: number;
  starRating: number;
  starsEarned: number;
  isPerfect: boolean;
}

const BASE_XP_PER_CORRECT = 10;

export function calculateLessonXP(
  activities: ActivityResult[],
  totalTimeMs: number,
  currentStreak: number,
): XPBreakdown {
  const correctCount = activities.filter((a) => a.correct).length;
  const accuracy = correctCount / activities.length;
  const isPerfect = accuracy === 1.0;

  // ── Base XP ───────────────────────────────────────────
  const baseXP = correctCount * BASE_XP_PER_CORRECT;

  // ── Bonus XP ──────────────────────────────────────────
  let bonusXP = 0;

  // 1. Perfect bonus (+50%)
  if (isPerfect) bonusXP += Math.floor(baseXP * 0.5);

  // 2. Speed bonus: completed in <70% of expected time (+20%)
  const expectedTimeMs = activities.length * 30_000;
  if (totalTimeMs < expectedTimeMs * 0.7) {
    bonusXP += Math.floor(baseXP * 0.2);
  }

  // 3. Streak bonus: +5% per day, max 50%
  const streakMultiplier = Math.min(currentStreak * 0.05, 0.5);
  bonusXP += Math.floor(baseXP * streakMultiplier);

  // 4. First try bonus (no retries)
  if (activities.every((a) => a.attempts <= 1)) bonusXP += 5;

  // 5. No hints bonus
  if (activities.every((a) => a.hintsUsed === 0)) bonusXP += 3;

  // ── Star rating ───────────────────────────────────────
  let starRating = 0;
  if (accuracy >= 1.0) starRating = 3;
  else if (accuracy >= 0.8) starRating = 2;
  else if (accuracy >= 0.6) starRating = 1;

  // ── Star currency ─────────────────────────────────────
  let starsEarned = 5;
  if (isPerfect) starsEarned += 10;

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    accuracy,
    starRating,
    starsEarned,
    isPerfect,
  };
}
