/**
 * Streak Manager Service
 *
 * Handles daily streak logic:
 * - Increment / reset based on last activity date
 * - Freeze consumption
 * - Longest streak tracking
 */

import { getTodayTR } from '../utils/admin';

export interface StreakState {
  current: number;
  longest: number;
  lastActivityDate: string | null;
  freezesAvailable: number;
  frozenToday?: boolean;
}

export interface StreakUpdate {
  newStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

/**
 * Calculate the new streak after a lesson completion.
 * Called from submitLessonResult.
 */
export function updateStreakAfterLesson(streak: StreakState): StreakUpdate {
  const today = getTodayTR();
  const lastDate = streak.lastActivityDate;
  let newStreak = streak.current;

  if (lastDate !== today) {
    const yesterday = new Date(new Date(today).getTime() - 86_400_000).toISOString().split('T')[0];

    if (lastDate === yesterday || !lastDate) {
      newStreak += 1;
    } else {
      newStreak = 1; // gap > 1 day → reset
    }
  }

  return {
    newStreak,
    longestStreak: Math.max(streak.longest, newStreak),
    lastActivityDate: today,
  };
}

/**
 * Determine whether a child's streak should be reset during the nightly check.
 * Returns 'keep' | 'frozen' | 'reset'.
 */
export function evaluateStreakAtMidnight(
  streak: StreakState,
  yesterdayStr: string,
  todayStr: string,
): 'keep' | 'frozen' | 'reset' {
  const last = streak.lastActivityDate;

  // Played yesterday or today → keep
  if (last === yesterdayStr || last === todayStr) return 'keep';

  // Freeze was auto-applied already
  if (streak.frozenToday) return 'frozen';

  return 'reset';
}
