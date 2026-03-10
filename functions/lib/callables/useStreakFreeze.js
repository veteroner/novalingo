"use strict";
/**
 * useStreakFreeze
 *
 * Consumes a streak freeze to prevent streak reset.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStreakFreeze = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
exports.useStreakFreeze = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const childRef = admin_1.db.doc(`children/${childId}`);
    const childDoc = await childRef.get();
    const child = childDoc.data();
    if (child.streak.freezesAvailable <= 0) {
        throw new https_1.HttpsError('failed-precondition', 'No streak freezes available');
    }
    await childRef.update({
        'streak.freezesAvailable': (0, admin_1.increment)(-1),
        'streak.frozenToday': true,
        updatedAt: (0, admin_1.serverTimestamp)(),
    });
    return {
        freezesRemaining: child.streak.freezesAvailable - 1,
    };
});
//# sourceMappingURL=useStreakFreeze.js.map