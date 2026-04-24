"use strict";
/**
 * streakDangerReminder
 *
 * Scheduled: runs daily at 19:00 Turkey time (16:00 UTC).
 * Finds children who:
 *   - have an active streak (streak.current >= 1)
 *   - did NOT play today
 *   - are not already frozen for today
 * and sends a "streak tehlikede" push notification to their parent.
 *
 * COPPA uyumlu — bildirim çocuğa değil, ebeveyne gönderilir.
 * Gönderim `inactivityAlert` tercihine bağlıdır.
 * Ebeveyn günde en fazla 1 "streak danger" bildirimi alır (dedup).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.streakDangerReminder = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
function todayISO() {
    return new Date().toISOString().split('T')[0];
}
exports.streakDangerReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 16 * * *', // 16:00 UTC = 19:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: admin_1.REGION,
}, async () => {
    const today = todayISO();
    console.log(`[streakDangerReminder] Running for date: ${today}`);
    const childrenSnap = await admin_1.db.collection('children').where('streak.current', '>=', 1).get();
    if (childrenSnap.empty) {
        console.log('[streakDangerReminder] No active streaks — skipping.');
        return;
    }
    const dedupField = 'streakDangerSentAt';
    let sentCount = 0;
    let skippedAlreadyPlayed = 0;
    let skippedFrozen = 0;
    let skippedAlreadyNotified = 0;
    for (const childDoc of childrenSnap.docs) {
        const data = childDoc.data();
        const lastActivityDate = data.streak?.lastActivityDate;
        // Played today — streak is safe, no reminder needed.
        if (lastActivityDate === today) {
            skippedAlreadyPlayed++;
            continue;
        }
        // Freeze already applied for today — streak is safe.
        if (data.streak?.frozenToday === true) {
            skippedFrozen++;
            continue;
        }
        // Dedup — one reminder per day per child.
        if (data[dedupField] === today) {
            skippedAlreadyNotified++;
            continue;
        }
        const childName = data.name ?? 'çocuğunuz';
        const streakDays = data.streak?.current ?? 0;
        const notified = await (0, notificationService_1.notifyParentAboutChild)(childDoc.id, {
            title: '🔥 Seri tehlikede!',
            body: `${childName} bugün henüz oynamadı. ${streakDays} günlük seriyi birlikte koruyalım!`,
            category: 'inactivityAlert',
            data: {
                type: 'streak_danger',
                childId: childDoc.id,
                streak: String(streakDays),
                date: today,
            },
        });
        if (notified) {
            await childDoc.ref.update({ [dedupField]: today });
            sentCount++;
        }
    }
    console.log(`[streakDangerReminder] Done — sent: ${sentCount}, played: ${skippedAlreadyPlayed}, frozen: ${skippedFrozen}, already-notified: ${skippedAlreadyNotified}`);
});
//# sourceMappingURL=streakDangerReminder.js.map