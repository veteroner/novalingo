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
                case 'lessonComplete':
                    // Save lesson progress directly (XP calc already done client-side)
                    await admin_1.db.doc(`children/${childId}/lessonProgress/${action.payload.lessonId}`).set({
                        ...action.payload,
                        syncedAt: (0, admin_1.serverTimestamp)(),
                        offlineSync: true,
                    }, { merge: true });
                    synced++;
                    break;
                case 'vocabularyReview':
                    await admin_1.db.doc(`children/${childId}/vocabulary/${action.payload.wordId}`).set({
                        ...action.payload,
                        syncedAt: (0, admin_1.serverTimestamp)(),
                    }, { merge: true });
                    synced++;
                    break;
                case 'questProgress':
                    await admin_1.db.doc(`children/${childId}/quests/${action.payload.questId}`).update({
                        currentProgress: action.payload.progress,
                        updatedAt: (0, admin_1.serverTimestamp)(),
                    });
                    synced++;
                    break;
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