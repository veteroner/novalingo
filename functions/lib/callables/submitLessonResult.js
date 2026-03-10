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
    const childDoc = await childRef.get();
    const child = childDoc.data();
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
    let bonusXP = 0;
    // 1. Perfect bonus (1.5x)
    const isPerfect = accuracy === 1.0;
    if (isPerfect)
        bonusXP += Math.floor(baseXP * 0.5);
    // 2. Speed bonus: completed in <70% of expected time
    const expectedTimeMs = activities.length * 30_000;
    if (totalTimeMs < expectedTimeMs * 0.7) {
        bonusXP += Math.floor(baseXP * 0.2);
    }
    // 3. Streak bonus: +5% per day, max 50%
    const streakBonus = Math.min(child.streak.current * 0.05, 0.5);
    bonusXP += Math.floor(baseXP * streakBonus);
    // 4. First try bonus (no retry attempts)
    const allFirstTry = activities.every((a) => a.attempts <= 1);
    if (allFirstTry)
        bonusXP += 5;
    // 5. No hint bonus
    const noHints = activities.every((a) => a.hintsUsed === 0);
    if (noHints)
        bonusXP += 3;
    const totalXP = baseXP + bonusXP;
    // ── Currency ──────────────────────────────────────────
    let starsEarned = 5;
    if (isPerfect)
        starsEarned += 10;
    // ── Streak Update ─────────────────────────────────────
    const today = (0, admin_1.getTodayTR)();
    const lastDate = child.streak.lastActivityDate;
    let newStreak = child.streak.current;
    if (lastDate !== today) {
        // Check if yesterday (continue streak) or gap
        const yesterday = new Date(new Date(today).getTime() - 86_400_000).toISOString().split('T')[0];
        if (lastDate === yesterday || !lastDate) {
            newStreak += 1;
        }
        else {
            newStreak = 1; // streak reset
        }
    }
    const longestStreak = Math.max(child.streak.longest, newStreak);
    // ── Level Up Check ────────────────────────────────────
    const newTotalXP = child.totalXP + totalXP;
    let newLevel = child.level;
    while (newLevel < 100 && newTotalXP >= (0, admin_1.xpForLevel)(newLevel + 1)) {
        newLevel++;
    }
    const leveledUp = newLevel > child.level;
    // ── Write Results (batch) ─────────────────────────────
    const batch = admin_1.db.batch();
    // Update child profile
    batch.update(childRef, {
        totalXP: (0, admin_1.increment)(totalXP),
        currentXP: newTotalXP - (0, admin_1.xpForLevel)(newLevel),
        level: newLevel,
        'currency.stars': (0, admin_1.increment)(starsEarned),
        'streak.current': newStreak,
        'streak.longest': longestStreak,
        'streak.lastActivityDate': today,
        'stats.lessonsCompleted': (0, admin_1.increment)(1),
        'stats.perfectLessons': isPerfect ? (0, admin_1.increment)(1) : (0, admin_1.increment)(0),
        'stats.totalTimeSeconds': (0, admin_1.increment)(Math.floor(totalTimeMs / 1000)),
        updatedAt: (0, admin_1.serverTimestamp)(),
    });
    // Save lesson progress
    const progressRef = admin_1.db.doc(`children/${childId}/lessonProgress/${lessonId}`);
    batch.set(progressRef, {
        lessonId,
        stars,
        accuracy,
        xpEarned: totalXP,
        timeSpentMs: totalTimeMs,
        completedAt: (0, admin_1.serverTimestamp)(),
        attempts: activities.map((a) => ({
            activityId: a.activityId,
            correct: a.correct,
            timeSpentMs: a.timeSpentMs,
        })),
    }, { merge: true });
    await batch.commit();
    return {
        xpEarned: totalXP,
        baseXP,
        bonusXP,
        starsEarned,
        starRating: stars,
        accuracy,
        streak: newStreak,
        leveledUp,
        newLevel,
        isPerfect,
    };
});
//# sourceMappingURL=submitLessonResult.js.map