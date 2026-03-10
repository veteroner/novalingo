"use strict";
/**
 * streakCheckMidnight
 *
 * Scheduled: runs daily at 06:00 UTC+3 (03:00 UTC).
 * Checks all active children — resets streaks for those who didn't play
 * and didn't use a streak freeze.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.streakCheckMidnight = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin_1 = require("../utils/admin");
exports.streakCheckMidnight = (0, scheduler_1.onSchedule)({
    schedule: '0 3 * * *', // 03:00 UTC = 06:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: admin_1.REGION,
}, async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    // Get children with active streaks
    const childrenSnap = await admin_1.db
        .collection('children')
        .where('streak.current', '>', 0)
        .get();
    console.log(`Checking streaks for ${childrenSnap.size} children`);
    const BATCH_LIMIT = 500;
    let batch = admin_1.db.batch();
    let opCount = 0;
    let resetCount = 0;
    let frozenCount = 0;
    for (const childDoc of childrenSnap.docs) {
        const child = childDoc.data();
        const lastActivityDate = child.streak.lastActivityDate;
        // If they played yesterday or today, streak is safe
        if (lastActivityDate === yesterdayStr || lastActivityDate === new Date().toISOString().split('T')[0]) {
            continue;
        }
        // Check if freeze was used
        if (child.streak.frozenToday) {
            // Clear the frozen flag for next day
            batch.update(childDoc.ref, {
                'streak.frozenToday': false,
                updatedAt: (0, admin_1.serverTimestamp)(),
            });
            frozenCount++;
        }
        else {
            // Reset streak
            batch.update(childDoc.ref, {
                'streak.current': 0,
                'streak.frozenToday': false,
                updatedAt: (0, admin_1.serverTimestamp)(),
            });
            resetCount++;
        }
        opCount++;
        if (opCount >= BATCH_LIMIT) {
            await batch.commit();
            batch = admin_1.db.batch();
            opCount = 0;
        }
    }
    if (opCount > 0) {
        await batch.commit();
    }
    console.log(`Streak check: ${resetCount} reset, ${frozenCount} frozen`);
});
//# sourceMappingURL=streakCheck.js.map