"use strict";
/**
 * Scheduled: runs every Sunday at 10:00 Turkey time (07:00 UTC).
 * Generates a weekly progress summary for each parent
 * and sends a push notification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyReport = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
exports.weeklyReport = (0, scheduler_1.onSchedule)({
    schedule: '0 7 * * 0', // Sunday 07:00 UTC = 10:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: admin_1.REGION,
}, async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Get all active children (updated in last 7 days)
    const childrenSnap = await admin_1.db
        .collection('children')
        .where('updatedAt', '>=', sevenDaysAgo)
        .get();
    console.log(`Generating weekly reports for ${childrenSnap.size} children`);
    // Group children by parent
    const parentChildren = new Map();
    for (const doc of childrenSnap.docs) {
        const data = doc.data();
        const parentUid = data.parentUid;
        if (!parentUid)
            continue;
        const list = parentChildren.get(parentUid) ?? [];
        list.push({ name: data.name, childId: doc.id });
        parentChildren.set(parentUid, list);
    }
    let sentCount = 0;
    for (const [parentUid, children] of parentChildren) {
        const summaries = [];
        for (const child of children) {
            // Count lessons completed this week
            const lessonsSnap = await admin_1.db
                .collection(`children/${child.childId}/lessonProgress`)
                .where('completedAt', '>=', sevenDaysAgo)
                .count()
                .get();
            const lessonsCount = lessonsSnap.data().count;
            // Get child stats
            const childDoc = await admin_1.db.doc(`children/${child.childId}`).get();
            const childData = childDoc.data();
            const streak = childData?.streak?.current ?? 0;
            const level = childData?.level ?? 1;
            summaries.push(`${child.name}: ${lessonsCount} ders, ${streak} günlük seri, seviye ${level}`);
        }
        if (summaries.length > 0) {
            const body = summaries.join('\n');
            const sent = await (0, notificationService_1.sendToParent)(parentUid, {
                title: '📊 Haftalık Rapor',
                body,
                data: { type: 'weekly_report' },
            });
            if (sent)
                sentCount++;
        }
    }
    console.log(`Weekly reports sent: ${sentCount}`);
});
//# sourceMappingURL=weeklyReport.js.map