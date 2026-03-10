/**
 * Rate Limiter — Firestore-backed per-user rate limiting.
 *
 * Tracks call counts per user per function within a sliding window.
 * Uses a dedicated `rateLimits` collection to avoid polluting business data.
 */

import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './admin';

interface RateLimitConfig {
  /** Maximum calls allowed within the window */
  maxCalls: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/** Default rate limit presets */
export const RATE_LIMITS = {
  /** Sensitive operations: PIN, delete, auth — 5 calls / 5 min */
  sensitive: { maxCalls: 5, windowSeconds: 300 },
  /** Write operations: lesson submit, purchase — 20 calls / min */
  write: { maxCalls: 20, windowSeconds: 60 },
  /** Read operations: leaderboard, profile — 60 calls / min */
  read: { maxCalls: 60, windowSeconds: 60 },
  /** Monetary operations: receipt, restore — 10 calls / 5 min */
  monetary: { maxCalls: 10, windowSeconds: 300 },
} as const;

/**
 * Check and increment rate limit for a user + function combo.
 * Throws RESOURCE_EXHAUSTED if limit is exceeded.
 */
export async function checkRateLimit(
  uid: string,
  functionName: string,
  config: RateLimitConfig,
): Promise<void> {
  const docId = `${uid}_${functionName}`;
  const ref = db.collection('rateLimits').doc(docId);
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() as { calls: number[] } | undefined;

    // Filter to only calls within the window
    const recentCalls = (data?.calls ?? []).filter((t: number) => t > windowStart);

    if (recentCalls.length >= config.maxCalls) {
      throw new HttpsError('resource-exhausted', `Rate limit exceeded. Try again later.`);
    }

    // Add current call timestamp, keep only recent ones
    recentCalls.push(now);
    tx.set(ref, { calls: recentCalls, updatedAt: now }, { merge: true });
  });
}
