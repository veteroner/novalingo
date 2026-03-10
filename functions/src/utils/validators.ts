/**
 * Input validation helpers for Cloud Functions.
 * Throws HttpsError on invalid input.
 */

import { HttpsError } from 'firebase-functions/v2/https';

const AGE_GROUPS = ['cubs', 'stars', 'legends'] as const;
const LEAGUE_TIERS = ['bronze', 'silver', 'gold', 'diamond', 'master'] as const;

/** Validate a trimmed string within length bounds */
export function validateString(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpsError('invalid-argument', `${field} must be ${min}-${max} characters`);
  }
  return trimmed;
}

/** Validate ageGroup enum */
export function validateAgeGroup(value: unknown): 'cubs' | 'stars' | 'legends' {
  if (!AGE_GROUPS.includes(value as (typeof AGE_GROUPS)[number])) {
    throw new HttpsError('invalid-argument', 'Invalid age group');
  }
  return value as 'cubs' | 'stars' | 'legends';
}

/** Validate league tier enum */
export function validateTier(value: unknown): (typeof LEAGUE_TIERS)[number] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!LEAGUE_TIERS.includes(value as (typeof LEAGUE_TIERS)[number])) {
    throw new HttpsError('invalid-argument', 'Invalid league tier');
  }
  return value as (typeof LEAGUE_TIERS)[number];
}

/** Validate a required non-empty string ID */
export function validateId(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpsError('invalid-argument', `${field} is required`);
  }
  return value.trim();
}

/** Validate a positive integer within bounds */
export function validatePositiveInt(value: unknown, field: string, max: number): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) {
    throw new HttpsError('invalid-argument', `${field} must be 1-${max}`);
  }
  return n;
}

/** Validate activities array from lesson submission */
export function validateActivities(
  activities: unknown,
): {
  activityId: string;
  correct: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attempts: number;
}[] {
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new HttpsError('invalid-argument', 'activities must be a non-empty array');
  }
  if (activities.length > 50) {
    throw new HttpsError('invalid-argument', 'Too many activities (max 50)');
  }
  return activities.map((a: Record<string, unknown>, i: number) => {
    if (typeof a.activityId !== 'string') {
      throw new HttpsError('invalid-argument', `activities[${i}].activityId is required`);
    }
    return {
      activityId: a.activityId as string,
      correct: Boolean(a.correct),
      timeSpentMs: Math.max(0, Number(a.timeSpentMs) || 0),
      hintsUsed: Math.max(0, Math.floor(Number(a.hintsUsed) || 0)),
      attempts: Math.max(1, Math.floor(Number(a.attempts) || 1)),
    };
  });
}

/** Validate vocab review array */
export function validateVocabReviews(
  reviews: unknown,
): { wordId: string; rating: 1 | 2 | 3 | 4 | 5; responseTimeMs: number }[] {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    throw new HttpsError('invalid-argument', 'reviews must be a non-empty array');
  }
  if (reviews.length > 100) {
    throw new HttpsError('invalid-argument', 'Too many reviews (max 100)');
  }
  return reviews.map((r: Record<string, unknown>, i: number) => {
    const wordId = validateId(r.wordId, `reviews[${i}].wordId`);
    const rating = Number(r.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new HttpsError('invalid-argument', `reviews[${i}].rating must be 1-5`);
    }
    return {
      wordId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      responseTimeMs: Math.max(0, Number(r.responseTimeMs) || 0),
    };
  });
}
