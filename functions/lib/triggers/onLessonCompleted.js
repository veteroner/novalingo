"use strict";
/**
 * onLessonCompleted
 *
 * Firestore trigger: when a lesson progress document is created/updated.
 * Updates quest progress, checks achievement conditions, updates leaderboard.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLessonCompleted = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("../utils/admin");
exports.onLessonCompleted = (0, firestore_1.onDocumentWritten)({
    document: 'children/{childId}/lessonProgress/{lessonId}',
    region: admin_1.REGION,
}, async (event) => {
    const childId = event.params.childId;
    const after = event.data?.after?.data();
    if (!after)
        return; // Deletion, skip
    const isNew = !event.data?.before?.exists;
    if (!isNew)
        return; // Only process new completions
    // ── Update daily quest progress ────────────────────────
    const questsSnap = await admin_1.db
        .collection(`children/${childId}/quests`)
        .where('expiresAt', '>=', new Date())
        .get();
    const batch = admin_1.db.batch();
    for (const questDoc of questsSnap.docs) {
        const quest = questDoc.data();
        if (quest.claimed)
            continue;
        if (quest.type === 'lesson' && quest.currentProgress < quest.targetProgress) {
            batch.update(questDoc.ref, {
                currentProgress: (0, admin_1.increment)(1),
                updatedAt: (0, admin_1.serverTimestamp)(),
            });
        }
        if (quest.type === 'perfect' && after.accuracy === 1.0) {
            batch.update(questDoc.ref, {
                currentProgress: (0, admin_1.increment)(1),
                updatedAt: (0, admin_1.serverTimestamp)(),
            });
        }
        if (quest.type === 'xp') {
            batch.update(questDoc.ref, {
                currentProgress: (0, admin_1.increment)(after.xpEarned ?? 0),
                updatedAt: (0, admin_1.serverTimestamp)(),
            });
        }
    }
    // ── Update weekly leaderboard ──────────────────────────
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    const childDoc = await admin_1.db.doc(`children/${childId}`).get();
    const child = childDoc.data();
    if (child) {
        const lbRef = admin_1.db.doc(`leaderboards/${weekId}/entries/${childId}`);
        batch.set(lbRef, {
            name: child.name,
            avatarId: child.avatarId,
            level: child.level,
            tier: child.leagueTier ?? 'bronze',
            weeklyXP: (0, admin_1.increment)(after.xpEarned ?? 0),
            updatedAt: (0, admin_1.serverTimestamp)(),
        }, { merge: true });
    }
    await batch.commit();
    console.log(`Lesson completed: child=${childId}, lesson=${event.params.lessonId}`);
});
//# sourceMappingURL=onLessonCompleted.js.map