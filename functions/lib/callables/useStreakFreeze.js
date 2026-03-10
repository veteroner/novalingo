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
    const result = await admin_1.db.runTransaction(async (tx) => {
        const childSnap = await tx.get(childRef);
        if (!childSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Child profile not found');
        }
        const child = childSnap.data();
        const available = child.streak?.freezesAvailable ?? 0;
        if (available <= 0) {
            throw new https_1.HttpsError('failed-precondition', 'No streak freezes available');
        }
        tx.update(childRef, {
            'streak.freezesAvailable': available - 1,
            'streak.frozenToday': true,
            updatedAt: (0, admin_1.serverTimestamp)(),
        });
        return { freezesRemaining: available - 1 };
    });
    return result;
});
//# sourceMappingURL=useStreakFreeze.js.map