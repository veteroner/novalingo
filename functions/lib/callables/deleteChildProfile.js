"use strict";
/**
 * Deletes a child profile and all its subcollections.
 * Only the owning parent can delete.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChildProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const validators_1 = require("../utils/validators");
const SUBCOLLECTIONS = [
    'lessonProgress',
    'vocabulary',
    'quests',
    'achievements',
    'inventory',
    'dailySpins',
];
exports.deleteChildProfile = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const childId = (0, validators_1.validateId)(request.data.childId, 'childId');
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const childRef = admin_1.db.doc(`children/${childId}`);
    // Delete all subcollections first (loop until fully drained)
    for (const sub of SUBCOLLECTIONS) {
        let snap;
        do {
            snap = await childRef.collection(sub).limit(500).get();
            if (!snap.empty) {
                const batch = admin_1.db.batch();
                for (const doc of snap.docs) {
                    batch.delete(doc.ref);
                }
                await batch.commit();
            }
        } while (!snap.empty);
    }
    // Delete the child document
    await childRef.delete();
    // If this was the active child, clear the reference
    const userRef = admin_1.db.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    if (userDoc.data()?.activeChildId === childId) {
        // Try to find another child to set as active
        const remaining = await admin_1.db.collection('children').where('parentUid', '==', uid).limit(1).get();
        await userRef.update({
            activeChildId: remaining.empty ? null : remaining.docs[0].id,
            updatedAt: (0, admin_1.serverTimestamp)(),
        });
    }
    return { childId, deleted: true };
});
//# sourceMappingURL=deleteChildProfile.js.map