"use strict";
/**
 * srsReviewReminder
 *
 * Scheduled: runs daily at 09:00 Turkey time (06:00 UTC).
 * Finds children who have SRS vocabulary cards due for review today
 * and sends a "Nova seni bekliyor" push notification to their parent.
 *
 * COPPA uyumlu — bildirim çocuğa değil, ebeveyne gönderilir.
 * Ebeveyn günde en fazla 1 bildirim alır (dedup).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.srsReviewReminder = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
/** ISO date string for today: "YYYY-MM-DD" */
function todayISO() {
    return new Date().toISOString().split('T')[0];
}
exports.srsReviewReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 6 * * *', // 06:00 UTC = 09:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: admin_1.REGION,
}, async () => {
    const today = todayISO();
    console.log(`[srsReviewReminder] Running for date: ${today}`);
    // Find all vocabulary cards whose nextReviewAt is <= today
    // Collection: children/{childId}/vocabulary/{wordId}
    // We query with a collectionGroup query.
    const dueCardsSnap = await admin_1.db
        .collectionGroup('vocabulary')
        .where('nextReviewAt', '<=', today)
        .where('repetitions', '>', 0) // At least seen once
        .get();
    if (dueCardsSnap.empty) {
        console.log('[srsReviewReminder] No due cards found — skipping.');
        return;
    }
    // Group due card counts by childId
    const dueCounts = new Map();
    for (const doc of dueCardsSnap.docs) {
        // Path: children/{childId}/vocabulary/{wordId}
        const pathParts = doc.ref.path.split('/');
        const childId = pathParts[1];
        if (childId) {
            dueCounts.set(childId, (dueCounts.get(childId) ?? 0) + 1);
        }
    }
    console.log(`[srsReviewReminder] Found ${dueCounts.size} children with due reviews`);
    // Dedup key stored on child doc to prevent multiple notifications per day
    const dedupField = 'srsReminderSentAt';
    let sentCount = 0;
    let skippedCount = 0;
    for (const [childId, dueCount] of dueCounts) {
        try {
            const childRef = admin_1.db.doc(`children/${childId}`);
            const childSnap = await childRef.get();
            if (!childSnap.exists)
                continue;
            const childData = childSnap.data();
            // Skip if already notified today
            const lastSentAt = childData[dedupField];
            if (lastSentAt === today) {
                skippedCount++;
                continue;
            }
            const childName = childData.name ?? 'çocuğunuz';
            const wordCount = Math.min(dueCount, 20); // Cap display number
            const notified = await (0, notificationService_1.notifyParentAboutChild)(childId, {
                title: '🐾 Nova seni bekliyor!',
                body: `${childName} için ${wordCount} kelime tekrar zamanı. Birlikte öğrenelim!`,
                category: 'dailyReminder',
                data: {
                    type: 'srs_review',
                    childId,
                    dueCount: String(dueCount),
                    date: today,
                },
            });
            if (notified) {
                // Mark as sent so we don't repeat today
                await childRef.update({ [dedupField]: today });
                sentCount++;
            }
        }
        catch (err) {
            console.warn(`[srsReviewReminder] Failed for child ${childId}:`, err);
        }
    }
    console.log(`[srsReviewReminder] Done — sent: ${sentCount}, skipped (already notified): ${skippedCount}`);
});
//# sourceMappingURL=srsReviewReminder.js.map