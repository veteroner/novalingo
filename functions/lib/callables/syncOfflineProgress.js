"use strict";
/**
 * syncOfflineProgress
 *
 * Receives batched offline actions and replays them server-side
 * in chronological order. Handles conflicts via last-write-wins.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOfflineProgress = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
exports.syncOfflineProgress = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId, actions } = request.data;
    if (!actions || actions.length === 0) {
        return { synced: 0 };
    }
    if (actions.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'Too many actions (max 100)');
    }
    await (0, admin_1.requireChildOwnership)(uid, childId);
    // Sort by timestamp (oldest first)
    const sorted = [...actions].sort((a, b) => a.timestamp - b.timestamp);
    let synced = 0;
    let errors = 0;
    for (const action of sorted) {
        try {
            switch (action.type) {
                case 'lessonComplete': {
                    const p = action.payload;
                    const lessonId = typeof p.lessonId === 'string' ? p.lessonId : null;
                    const activities = Array.isArray(p.activities)
                        ? p.activities.filter((activity) => typeof activity === 'object' && activity !== null && 'activityId' in activity)
                        : [];
                    const conversationEvidence = activities
                        .map((activity) => activity.conversationEvidence)
                        .filter((evidence) => Boolean(evidence));
                    if (!lessonId) {
                        errors++;
                        break;
                    }
                    await admin_1.db.doc(`children/${childId}/lessonProgress/${lessonId}`).set({
                        lessonId,
                        stars: Math.min(Math.max(Number(p.stars) || 0, 0), 3),
                        accuracy: Math.min(Math.max(Number(p.accuracy) || 0, 0), 1),
                        xpEarned: Math.min(Math.max(Number(p.xpEarned) || 0, 0), 500),
                        timeSpentMs: Math.min(Math.max(Number(p.timeSpentMs) || 0, 0), 600_000),
                        durationSeconds: Math.round(Math.min(Math.max(Number(p.timeSpentMs) || 0, 0), 600_000) / 1000),
                        attempts: activities.map((activity) => ({
                            activityId: activity.activityId,
                            activityType: activity.activityType,
                            correct: activity.correct,
                            timeSpentMs: activity.timeSpentMs,
                            hintsUsed: activity.hintsUsed,
                            attempts: activity.attempts,
                            conversationEvidence: activity.conversationEvidence ?? null,
                        })),
                        conversationEvidence,
                        syncedAt: (0, admin_1.serverTimestamp)(),
                        offlineSync: true,
                    }, { merge: true });
                    synced++;
                    break;
                }
                case 'vocabularyReview': {
                    const p = action.payload;
                    const wordId = typeof p.wordId === 'string' ? p.wordId : null;
                    if (!wordId) {
                        errors++;
                        break;
                    }
                    await admin_1.db.doc(`children/${childId}/vocabulary/${wordId}`).set({
                        wordId,
                        interval: Math.min(Math.max(Number(p.interval) || 1, 1), 365),
                        easeFactor: Math.min(Math.max(Number(p.easeFactor) || 2.5, 1.3), 5),
                        repetitions: Math.min(Math.max(Number(p.repetitions) || 0, 0), 100),
                        nextReviewDate: typeof p.nextReviewDate === 'string' ? p.nextReviewDate : null,
                        syncedAt: (0, admin_1.serverTimestamp)(),
                    }, { merge: true });
                    synced++;
                    break;
                }
                case 'questProgress': {
                    const p = action.payload;
                    const questId = typeof p.questId === 'string' ? p.questId : null;
                    const progress = Math.min(Math.max(Number(p.progress) || 0, 0), 1000);
                    if (!questId) {
                        errors++;
                        break;
                    }
                    await admin_1.db.doc(`children/${childId}/quests/${questId}`).update({
                        currentProgress: progress,
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    });
                    synced++;
                    break;
                }
                default:
                    errors++;
            }
        }
        catch {
            errors++;
        }
    }
    return { synced, errors, total: actions.length };
});
//# sourceMappingURL=syncOfflineProgress.js.map