"use strict";
/**
 * submitLessonResult
 *
 * Processes lesson completion: XP calculation (6 bonuses), currency awards,
 * streak update, SRS vocabulary scheduling, progress persistence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitLessonResult = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
exports.submitLessonResult = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'submitLessonResult', rateLimit_1.RATE_LIMITS.write);
    const { childId, lessonId, activities, totalTimeMs } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const childRef = admin_1.db.doc(`children/${childId}`);
    // ── Calculate Accuracy ────────────────────────────────
    const correctCount = activities.filter((a) => a.correct).length;
    const accuracy = correctCount / activities.length;
    // ── Calculate Stars ───────────────────────────────────
    let stars = 0;
    if (accuracy >= 1.0)
        stars = 3;
    else if (accuracy >= 0.8)
        stars = 2;
    else if (accuracy >= 0.6)
        stars = 1;
    // ── Calculate XP (6 bonus types) ──────────────────────
    const baseXP = correctCount * 10;
    const isPerfect = accuracy === 1.0;
    const allFirstTry = activities.every((a) => a.attempts <= 1);
    const noHints = activities.every((a) => a.hintsUsed === 0);
    const expectedTimeMs = activities.length * 30_000;
    // ── Run inside transaction to avoid stale reads ───────
    const result = await admin_1.db.runTransaction(async (tx) => {
        const childSnap = await tx.get(childRef);
        if (!childSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Child profile not found');
        }
        const child = childSnap.data();
        let bonusXP = 0;
        // 1. Perfect bonus (1.5x)
        if (isPerfect)
            bonusXP += Math.floor(baseXP * 0.5);
        // 2. Speed bonus: completed in <70% of expected time
        if (totalTimeMs < expectedTimeMs * 0.7) {
            bonusXP += Math.floor(baseXP * 0.2);
        }
        // 3. Streak bonus: +5% per day, max 50%
        const streakBonus = Math.min((child.streak?.current ?? 0) * 0.05, 0.5);
        bonusXP += Math.floor(baseXP * streakBonus);
        // 4. First try bonus (no retry attempts)
        if (allFirstTry)
            bonusXP += 5;
        // 5. No hint bonus
        if (noHints)
            bonusXP += 3;
        const totalXP = baseXP + bonusXP;
        // ── Currency ──────────────────────────────────────────
        let starsEarned = 5;
        if (isPerfect)
            starsEarned += 10;
        // ── Streak Update ─────────────────────────────────────
        const today = (0, admin_1.getTodayTR)();
        const lastDate = child.streak?.lastActivityDate;
        let newStreak = child.streak?.current ?? 0;
        if (lastDate !== today) {
            const yesterday = new Date(new Date(today).getTime() - 86_400_000)
                .toISOString()
                .split('T')[0];
            if (lastDate === yesterday || !lastDate) {
                newStreak += 1;
            }
            else {
                newStreak = 1; // streak reset
            }
        }
        const longestStreak = Math.max(child.streak?.longest ?? 0, newStreak);
        // ── Level Up Check ────────────────────────────────────
        const newTotalXP = (child.totalXP ?? 0) + totalXP;
        let newLevel = child.level ?? 1;
        while (newLevel < 100 && newTotalXP >= (0, admin_1.xpForLevel)(newLevel + 1)) {
            newLevel++;
        }
        const leveledUp = newLevel > (child.level ?? 1);
        // ── Write Results (inside transaction) ────────────────
        tx.update(childRef, {
            totalXP: newTotalXP,
            currentXP: newTotalXP - (0, admin_1.xpForLevel)(newLevel),
            level: newLevel,
            'currency.stars': (child.currency?.stars ?? 0) + starsEarned,
            'streak.current': newStreak,
            'streak.longest': longestStreak,
            'streak.lastActivityDate': today,
            'stats.lessonsCompleted': (child.stats?.lessonsCompleted ?? 0) + 1,
            'stats.perfectLessons': (child.stats?.perfectLessons ?? 0) + (isPerfect ? 1 : 0),
            'stats.totalTimeSeconds': (child.stats?.totalTimeSeconds ?? 0) + Math.floor(totalTimeMs / 1000),
            updatedAt: (0, admin_1.serverTimestamp)(),
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
    const progressRef = admin_1.db.doc(`children/${childId}/lessonProgress/${lessonId}`);
    await progressRef.set({
        lessonId,
        stars,
        accuracy,
        xpEarned: result.totalXP,
        timeSpentMs: totalTimeMs,
        completedAt: (0, admin_1.serverTimestamp)(),
        attempts: activities.map((a) => ({
            activityId: a.activityId,
            correct: a.correct,
            timeSpentMs: a.timeSpentMs,
        })),
    }, { merge: true });
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
//# sourceMappingURL=submitLessonResult.js.map