"use strict";
/**
 * Trigger: when a child's streak field changes.
 * Awards milestone rewards and sends notifications to parent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onStreakUpdate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
const STREAK_MILESTONES = {
    3: { stars: 30, gems: 0, label: '3 gün üst üste!' },
    7: { stars: 100, gems: 10, label: 'Bir hafta!' },
    14: { stars: 200, gems: 20, label: '2 hafta!' },
    30: { stars: 500, gems: 50, label: 'Bir ay!' },
    50: { stars: 1000, gems: 100, label: '50 gün!' },
    100: { stars: 2000, gems: 200, label: '100 gün!' },
    365: { stars: 5000, gems: 500, label: '1 yıl!' },
};
exports.onStreakUpdate = (0, firestore_1.onDocumentUpdated)({ document: 'children/{childId}', region: admin_1.REGION }, async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after)
        return;
    const oldStreak = before.streak?.current ?? 0;
    const newStreak = after.streak?.current ?? 0;
    // Only fire on streak increase
    if (newStreak <= oldStreak)
        return;
    const childId = event.params.childId;
    // Check milestones
    for (const [milestoneStr, reward] of Object.entries(STREAK_MILESTONES)) {
        const milestone = Number(milestoneStr);
        if (oldStreak < milestone && newStreak >= milestone) {
            const batch = admin_1.db.batch();
            const childRef = admin_1.db.doc(`children/${childId}`);
            if (reward.stars > 0) {
                batch.update(childRef, { 'currency.stars': (0, admin_1.increment)(reward.stars) });
            }
            if (reward.gems > 0) {
                batch.update(childRef, { 'currency.gems': (0, admin_1.increment)(reward.gems) });
            }
            // Record milestone achievement
            const achRef = admin_1.db.doc(`children/${childId}/achievements/streak_${milestone}`);
            batch.set(achRef, {
                type: 'streak_milestone',
                name: `${reward.label} Muhteşem!`,
                milestone,
                reward: { stars: reward.stars, gems: reward.gems },
                unlockedAt: (0, admin_1.serverTimestamp)(),
            });
            await batch.commit();
            // Notify parent
            await (0, notificationService_1.notifyParentAboutChild)(childId, {
                title: `🔥 ${reward.label}`,
                body: `${after.name} tam ${milestone} günlük seri yaptı!`,
                data: { type: 'streak_milestone', childId, milestone: String(milestone) },
            });
            console.log(`Streak milestone ${milestone} for child=${childId}`);
        }
    }
});
//# sourceMappingURL=onStreakUpdate.js.map