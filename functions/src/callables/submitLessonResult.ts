/**
 * submitLessonResult
 *
 * Processes lesson completion: XP calculation (6 bonuses), currency awards,
 * streak update, SRS vocabulary scheduling, progress persistence.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { CURRENCY, LESSON, XP } from '../config/constants';
import {
  callableOpts,
  db,
  getTodayTR,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
  xpForLevel,
} from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

interface LessonResultRequest {
  childId: string;
  lessonId: string;
  activities: {
    activityId: string;
    correct: boolean;
    timeSpentMs: number;
    hintsUsed: number;
    attempts: number;
  }[];
  totalTimeMs: number;
}

export const submitLessonResult = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'submitLessonResult', RATE_LIMITS.write);
  const { childId, lessonId, activities, totalTimeMs } = request.data as LessonResultRequest;

  await requireChildOwnership(uid, childId);

  const childRef = db.doc(`children/${childId}`);

  // ── Calculate Accuracy ────────────────────────────────
  const correctCount = activities.filter((a) => a.correct).length;
  const accuracy = correctCount / activities.length;

  // ── Calculate Stars ───────────────────────────────────
  const [t1, t2, t3] = LESSON.STAR_THRESHOLDS;
  let stars = 0;
  if (accuracy >= t3) stars = 3;
  else if (accuracy >= t2) stars = 2;
  else if (accuracy >= t1) stars = 1;

  // ── Calculate XP (6 bonus types) ──────────────────────
  const baseXP = correctCount * XP.BASE_PER_ACTIVITY;
  const isPerfect = accuracy === LESSON.PERFECT_ACCURACY;
  const allFirstTry = activities.every((a) => a.attempts <= 1);
  const noHints = activities.every((a) => a.hintsUsed === 0);
  const expectedTimeMs = activities.length * LESSON.TIME_PER_ACTIVITY_SEC * 1000;

  // ── Run inside transaction to avoid stale reads ───────
  const result = await db.runTransaction(async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists) {
      throw new HttpsError('not-found', 'Child profile not found');
    }
    const child = childSnap.data()!;

    let bonusXP = 0;

    // 1. Perfect bonus (1.5x)
    if (isPerfect) bonusXP += Math.floor(baseXP * (XP.PERFECT_MULTIPLIER - 1));

    // 2. Speed bonus: completed in <70% of expected time
    if (totalTimeMs < expectedTimeMs * XP.SPEED_BONUS_THRESHOLD) {
      bonusXP += Math.floor(baseXP * (XP.SPEED_MULTIPLIER - 1));
    }

    // 3. Streak bonus: +5% per day, max 50%
    const streakBonus = Math.min(
      (child.streak?.current ?? 0) * XP.STREAK_BONUS_PER_DAY,
      XP.STREAK_BONUS_MAX,
    );
    bonusXP += Math.floor(baseXP * streakBonus);

    // 4. First try bonus (no retry attempts)
    if (allFirstTry) bonusXP += XP.FIRST_TRY_BONUS;

    // 5. No hint bonus
    if (noHints) bonusXP += XP.NO_HINT_BONUS;

    const totalXP = baseXP + bonusXP;

    // ── Currency ──────────────────────────────────────────
    let starsEarned = CURRENCY.STARS_PER_LESSON;
    if (isPerfect) starsEarned += CURRENCY.STARS_PERFECT_BONUS;

    // ── Streak Update ─────────────────────────────────────
    const today = getTodayTR();
    const lastDate = child.streak?.lastActivityDate;
    let newStreak = child.streak?.current ?? 0;

    if (lastDate !== today) {
      const yesterday = new Date(new Date(today).getTime() - 86_400_000)
        .toISOString()
        .split('T')[0];

      if (lastDate === yesterday || !lastDate) {
        newStreak += 1;
      } else {
        newStreak = 1; // streak reset
      }
    }

    const longestStreak = Math.max(child.streak?.longest ?? 0, newStreak);

    // ── Level Up Check ────────────────────────────────────
    const newTotalXP = (child.totalXP ?? 0) + totalXP;
    let newLevel = child.level ?? 1;
    while (newLevel < 100 && newTotalXP >= xpForLevel(newLevel + 1)) {
      newLevel++;
    }
    const leveledUp = newLevel > (child.level ?? 1);

    // ── Write Results (inside transaction) ────────────────
    tx.update(childRef, {
      totalXP: newTotalXP,
      currentXP: newTotalXP - xpForLevel(newLevel),
      level: newLevel,
      'currency.stars': (child.currency?.stars ?? 0) + starsEarned,
      'streak.current': newStreak,
      'streak.longest': longestStreak,
      'streak.lastActivityDate': today,
      'stats.lessonsCompleted': (child.stats?.lessonsCompleted ?? 0) + 1,
      'stats.perfectLessons': (child.stats?.perfectLessons ?? 0) + (isPerfect ? 1 : 0),
      'stats.totalTimeSeconds':
        (child.stats?.totalTimeSeconds ?? 0) + Math.floor(totalTimeMs / 1000),
      updatedAt: serverTimestamp(),
    });

    return {
      totalXP,
      bonusXP,
      starsEarned,
      newStreak,
      leveledUp,
      newLevel,
    };
  });

  // Save lesson progress outside transaction (idempotent set-merge)
  const progressRef = db.doc(`children/${childId}/lessonProgress/${lessonId}`);
  await progressRef.set(
    {
      lessonId,
      stars,
      accuracy,
      xpEarned: result.totalXP,
      timeSpentMs: totalTimeMs,
      completedAt: serverTimestamp(),
      attempts: activities.map((a) => ({
        activityId: a.activityId,
        correct: a.correct,
        timeSpentMs: a.timeSpentMs,
      })),
    },
    { merge: true },
  );

  return {
    xpEarned: result.totalXP,
    baseXP,
    bonusXP: result.bonusXP,
    starsEarned: result.starsEarned,
    starRating: stars,
    accuracy,
    streak: result.newStreak,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    isPerfect,
  };
});
