/**
 * Adaptive Difficulty Engine
 *
 * Adjusts lesson difficulty based on child performance history.
 * Uses a sliding window of recent lesson results to determine:
 *  - Activity complexity (how many distractors, hints, time limits)
 *  - Content selection (which words to practice)
 *  - Pacing (more or fewer activities per lesson)
 */

import { LESSON, XP } from '@/config/constants';

// ===== DIFFICULTY LEVELS =====

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'challenge';

export interface DifficultyProfile {
  level: DifficultyLevel;
  /** Number of distractor options in MCQ (2-6) */
  distractorCount: number;
  /** Time multiplier (1.5 = 50% more time, 0.7 = 30% less time) */
  timeMultiplier: number;
  /** Whether to auto-play audio hints */
  autoHints: boolean;
  /** Max hints allowed per activity */
  maxHints: number;
  /** Activities per lesson (can be shorter for struggling learners) */
  activitiesPerLesson: number;
  /** Ratio of new words vs review words (0-1, 0 = all review) */
  newWordRatio: number;
  /** XP multiplier for harder difficulties */
  xpMultiplier: number;
}

// ===== DIFFICULTY PROFILES =====

const PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  easy: {
    level: 'easy',
    distractorCount: 2,
    timeMultiplier: 1.5,
    autoHints: true,
    maxHints: LESSON.MAX_HINTS,
    activitiesPerLesson: 6,
    newWordRatio: 0.3,
    xpMultiplier: 0.8,
  },
  medium: {
    level: 'medium',
    distractorCount: 3,
    timeMultiplier: 1.0,
    autoHints: false,
    maxHints: 2,
    activitiesPerLesson: LESSON.ACTIVITIES_PER_LESSON,
    newWordRatio: 0.5,
    xpMultiplier: 1.0,
  },
  hard: {
    level: 'hard',
    distractorCount: 4,
    timeMultiplier: 0.8,
    autoHints: false,
    maxHints: 1,
    activitiesPerLesson: 10,
    newWordRatio: 0.6,
    xpMultiplier: 1.2,
  },
  challenge: {
    level: 'challenge',
    distractorCount: 6,
    timeMultiplier: 0.6,
    autoHints: false,
    maxHints: 0,
    activitiesPerLesson: 12,
    newWordRatio: 0.7,
    xpMultiplier: XP.PERFECT_MULTIPLIER,
  },
};

// ===== PERFORMANCE WINDOW =====

interface LessonPerformance {
  accuracy: number; // 0-1
  score: number; // 0-100
  hintsUsed: number;
  durationSeconds: number;
  isPerfect: boolean;
}

/**
 * Determine appropriate difficulty based on recent performance.
 *
 * Algorithm:
 *  - Calculates weighted average accuracy (recent lessons count more)
 *  - Checks for streaks of perfect/poor performance
 *  - Returns a DifficultyProfile with tuned parameters
 *
 * @param recentLessons - Last N lesson results (most recent first)
 * @param childLevel - Current child level (affects baseline)
 */
export function getAdaptiveDifficulty(
  recentLessons: LessonPerformance[],
  childLevel: number = 1,
): DifficultyProfile {
  if (recentLessons.length === 0) {
    // Brand new user — start easy for younger, medium for older
    return childLevel <= 3 ? { ...PROFILES.easy } : { ...PROFILES.medium };
  }

  // Weighted average accuracy (exponential decay: most recent = highest weight)
  const DECAY = 0.7;
  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < recentLessons.length; i++) {
    const weight = Math.pow(DECAY, i);
    const lesson = recentLessons[i];
    if (lesson) {
      weightedSum += lesson.accuracy * weight;
      weightSum += weight;
    }
  }
  const avgAccuracy = weightedSum / weightSum;

  // Check for streaks
  const last3 = recentLessons.slice(0, 3);
  const perfectStreak = last3.length >= 3 && last3.every((l) => l.isPerfect);
  const lowStreak = last3.length >= 3 && last3.every((l) => l.accuracy < 0.5);

  // Determine base level
  let level: DifficultyLevel;
  if (lowStreak || avgAccuracy < 0.45) {
    level = 'easy';
  } else if (avgAccuracy < 0.65) {
    level = 'medium';
  } else if (avgAccuracy < 0.85 || !perfectStreak) {
    level = 'hard';
  } else {
    level = 'challenge';
  }

  // Copy profile and apply fine-tuning
  const profile = { ...PROFILES[level] };

  // Micro-adjustments based on exact accuracy
  if (avgAccuracy >= 0.7 && avgAccuracy < 0.8) {
    // In the "sweet spot" — slightly increase new word ratio
    profile.newWordRatio = Math.min(profile.newWordRatio + 0.1, 0.8);
  }

  // If hint-heavy, reduce hints to encourage independence
  const avgHints = recentLessons.reduce((sum, l) => sum + l.hintsUsed, 0) / recentLessons.length;
  if (avgHints > 2 && profile.maxHints > 1) {
    profile.maxHints = Math.max(1, profile.maxHints - 1);
  }

  return profile;
}

/**
 * Get recommended activity count for a lesson based on performance.
 * Shorter lessons for struggling learners to avoid fatigue.
 */
export function getAdaptiveActivityCount(
  accuracy: number,
  ageGroup: 'cubs' | 'stars' | 'legends' = 'stars',
): number {
  const baseByAge = {
    cubs: 6, // 4-6 year olds: shorter attention
    stars: 8, // 7-9 year olds: standard
    legends: 10, // 10-12 year olds: can handle more
  };

  const base = baseByAge[ageGroup];

  if (accuracy < 0.4) return Math.max(4, base - 2); // struggling: shorter
  if (accuracy > 0.9) return base + 2; // excelling: challenge more
  return base;
}
