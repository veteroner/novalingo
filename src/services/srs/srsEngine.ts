/**
 * SRS (Spaced Repetition System) Engine
 *
 * SM-2 algorithm variant optimized for children's language learning.
 * Calculates next review interval and ease factor based on quality of recall.
 */

import { SRS } from '@/config/constants';
import type { MasteryLevel, VocabularyCard } from '@/types/progress';

// ===== SM‑2 CORE =====

interface ReviewInput {
  /** 0 = complete blackout, 5 = perfect recall (SM-2 scale) */
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  /** Current repetition count */
  repetitions: number;
  /** Current ease factor */
  easeFactor: number;
  /** Current interval in days */
  interval: number;
}

interface ReviewOutput {
  repetitions: number;
  easeFactor: number;
  interval: number;
  masteryLevel: MasteryLevel;
}

/**
 * Calculate next review parameters using SM-2 algorithm.
 *
 * Quality scale (adapted for children):
 *   0 — Did not know at all ("Hiç bilmiyorum")
 *   1 — Barely recalled after hint
 *   2 — Recalled with difficulty
 *   3 — Recalled with some effort
 *   4 — Recalled easily
 *   5 — Perfect instant recall
 */
export function calculateNextReview(input: ReviewInput): ReviewOutput {
  const { quality } = input;
  let { repetitions, easeFactor, interval } = input;

  // SM-2 ease factor update
  const newEase =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Clamp ease factor
  easeFactor = Math.max(SRS.MIN_FACTOR, Math.min(SRS.MAX_FACTOR, newEase));

  if (quality < 3) {
    // Failed — restart learning
    repetitions = 0;
    interval = SRS.INITIAL_INTERVAL;
  } else {
    // Passed
    repetitions += 1;
    if (repetitions === 1) {
      interval = SRS.INITIAL_INTERVAL;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Determine mastery level
  const masteryLevel = getMasteryLevel(repetitions, easeFactor);

  return { repetitions, easeFactor, interval, masteryLevel };
}

// ===== MASTERY CLASSIFICATION =====

function getMasteryLevel(repetitions: number, easeFactor: number): MasteryLevel {
  if (repetitions === 0) return 'new';
  if (repetitions <= 2) return 'learning';
  if (easeFactor >= 2.0 && repetitions >= 5) return 'mastered';
  return 'reviewing';
}

// ===== QUALITY INFERENCE (for children) =====

/**
 * Infer SM-2 quality from activity results.
 * Simplifies the 0-5 scale for kids who don't self-assess.
 */
export function inferQuality(params: {
  isCorrect: boolean;
  attempts: number;
  hintsUsed: number;
  responseTimeMs: number;
  /** Expected average time in ms */
  expectedTimeMs?: number;
}): 0 | 1 | 2 | 3 | 4 | 5 {
  const { isCorrect, attempts, hintsUsed, responseTimeMs, expectedTimeMs = 5000 } = params;

  if (!isCorrect) {
    return hintsUsed > 0 ? 0 : 1;
  }

  // Correct answer
  if (hintsUsed > 1) return 2;
  if (hintsUsed === 1 || attempts > 1) return 3;

  // No hints, first try — check speed
  const speedRatio = responseTimeMs / expectedTimeMs;
  if (speedRatio < 0.5) return 5; // instant recall
  if (speedRatio < 1.0) return 4; // good speed
  return 3; // slow but correct
}

// ===== REVIEW QUEUE =====

/**
 * Get cards due for review, sorted by urgency.
 * - Overdue cards first (most overdue = highest priority)
 * - Then by lowest ease factor (hardest cards)
 */
export function getReviewQueue(
  cards: VocabularyCard[],
  now: Date = new Date(),
  limit = SRS.DAILY_REVIEW_LIMIT,
): VocabularyCard[] {
  const nowMs = now.getTime();

  const due = cards.filter((card) => {
    const nextReview = card.nextReviewAt.toMillis();
    return nextReview <= nowMs;
  });

  // Sort: most overdue first, then hardest (lowest ease)
  due.sort((a, b) => {
    const aOverdue = nowMs - a.nextReviewAt.toMillis();
    const bOverdue = nowMs - b.nextReviewAt.toMillis();
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    return a.easeFactor - b.easeFactor;
  });

  return due.slice(0, limit);
}

// ===== STATISTICS =====

export interface SRSStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewingCards: number;
  masteredCards: number;
  dueToday: number;
  averageEase: number;
}

export function calculateSRSStats(
  cards: VocabularyCard[],
  now: Date = new Date(),
): SRSStats {
  const nowMs = now.getTime();
  const stats: SRSStats = {
    totalCards: cards.length,
    newCards: 0,
    learningCards: 0,
    reviewingCards: 0,
    masteredCards: 0,
    dueToday: 0,
    averageEase: 0,
  };

  let easeSum = 0;
  for (const card of cards) {
    switch (card.masteryLevel) {
      case 'new': stats.newCards++; break;
      case 'learning': stats.learningCards++; break;
      case 'reviewing': stats.reviewingCards++; break;
      case 'mastered': stats.masteredCards++; break;
    }
    const nextReview = card.nextReviewAt.toMillis();
    if (nextReview <= nowMs) stats.dueToday++;
    easeSum += card.easeFactor;
  }

  stats.averageEase = cards.length > 0 ? easeSum / cards.length : SRS.EASY_FACTOR;
  return stats;
}
