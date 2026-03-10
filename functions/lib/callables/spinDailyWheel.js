"use strict";
/**
 * spinDailyWheel
 *
 * Validates daily spin eligibility, calculates weighted random reward,
 * awards the prize, marks spin as used for today.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinDailyWheel = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const WHEEL_SEGMENTS = [
    { id: 'stars_10', type: 'stars', amount: 10, weight: 25 },
    { id: 'stars_25', type: 'stars', amount: 25, weight: 15 },
    { id: 'stars_50', type: 'stars', amount: 50, weight: 8 },
    { id: 'xp_20', type: 'xp', amount: 20, weight: 20 },
    { id: 'xp_50', type: 'xp', amount: 50, weight: 10 },
    { id: 'gems_5', type: 'gems', amount: 5, weight: 12 },
    { id: 'gems_10', type: 'gems', amount: 10, weight: 5 },
    { id: 'freeze', type: 'streak_freeze', amount: 1, weight: 5 },
];
function weightedRandom() {
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const segment of WHEEL_SEGMENTS) {
        random -= segment.weight;
        if (random <= 0)
            return segment;
    }
    return WHEEL_SEGMENTS[0];
}
exports.spinDailyWheel = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const today = (0, admin_1.getTodayTR)();
    const spinRef = admin_1.db.doc(`children/${childId}/dailySpins/${today}`);
    const spinDoc = await spinRef.get();
    if (spinDoc.exists) {
        throw new https_1.HttpsError('already-exists', 'Already spun today');
    }
    // Pick reward
    const reward = weightedRandom();
    // Award and record
    const batch = admin_1.db.batch();
    const childRef = admin_1.db.doc(`children/${childId}`);
    switch (reward.type) {
        case 'stars':
            batch.update(childRef, { 'currency.stars': (0, admin_1.increment)(reward.amount) });
            break;
        case 'gems':
            batch.update(childRef, { 'currency.gems': (0, admin_1.increment)(reward.amount) });
            break;
        case 'xp':
            batch.update(childRef, { totalXP: (0, admin_1.increment)(reward.amount) });
            break;
        case 'streak_freeze':
            batch.update(childRef, {
                'streak.freezesAvailable': (0, admin_1.increment)(reward.amount),
            });
            break;
    }
    batch.set(spinRef, {
        reward,
        spunAt: (0, admin_1.serverTimestamp)(),
    });
    await batch.commit();
    return {
        segmentId: reward.id,
        reward: { type: reward.type, amount: reward.amount },
    };
});
//# sourceMappingURL=spinDailyWheel.js.map