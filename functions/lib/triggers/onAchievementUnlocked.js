"use strict";
/**
 * onAchievementUnlocked
 *
 * Firestore trigger: when a new achievement document is created.
 * Awards gems/stars reward, sends push notification if enabled.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAchievementUnlocked = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
exports.onAchievementUnlocked = (0, firestore_1.onDocumentCreated)({
    document: 'children/{childId}/achievements/{achievementId}',
    region: admin_1.REGION,
}, async (event) => {
    const childId = event.params.childId;
    const achievement = event.data?.data();
    if (!achievement)
        return;
    const batch = admin_1.db.batch();
    const childRef = admin_1.db.doc(`children/${childId}`);
    // Award achievement rewards
    if (achievement.reward) {
        const { type, amount } = achievement.reward;
        if (type === 'gems') {
            batch.update(childRef, { 'currency.gems': (0, admin_1.increment)(amount) });
        }
        else if (type === 'stars') {
            batch.update(childRef, { 'currency.stars': (0, admin_1.increment)(amount) });
        }
        else if (type === 'xp') {
            batch.update(childRef, { totalXP: (0, admin_1.increment)(amount) });
        }
    }
    // Update achievement count
    batch.update(childRef, {
        'stats.achievementsUnlocked': (0, admin_1.increment)(1),
        updatedAt: (0, admin_1.serverTimestamp)(),
    });
    await batch.commit();
    // Send push notification to parent (gated by achievementAlert preference)
    try {
        const childDoc = await childRef.get();
        const child = childDoc.data();
        if (!child?.parentUid)
            return;
        await (0, notificationService_1.sendToParent)(child.parentUid, {
            title: '🏆 Yeni Başarı!',
            body: `${child.name} yeni bir başarı kazandı: ${achievement.name}`,
            category: 'achievementAlert',
            data: {
                type: 'achievement',
                childId,
                achievementId: event.params.achievementId,
            },
        });
    }
    catch (err) {
        console.warn('Failed to send achievement notification:', err);
    }
    console.log(`Achievement unlocked: child=${childId}, achievement=${event.params.achievementId}`);
});
//# sourceMappingURL=onAchievementUnlocked.js.map