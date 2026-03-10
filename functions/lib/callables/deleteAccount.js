"use strict";
/**
 * Deletes the user's account and ALL associated data.
 * COPPA compliance: parents must be able to delete their child's data.
 *
 * Deletes: user doc, all children + subcollections, progress, gamification,
 * purchases, analytics, and Firebase Auth account.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = void 0;
const crypto_1 = require("crypto");
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
const CHILD_SUBCOLLECTIONS = [
    'lessonProgress',
    'vocabulary',
    'quests',
    'achievements',
    'inventory',
    'dailySpins',
    'stats',
];
async function deleteCollection(collectionRef) {
    const batchSize = 500;
    let deleted = 0;
    let snapshot = await collectionRef.limit(batchSize).get();
    while (!snapshot.empty) {
        const batch = admin_1.db.batch();
        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        deleted += snapshot.size;
        if (snapshot.size < batchSize)
            break;
        snapshot = await collectionRef.limit(batchSize).get();
    }
    return deleted;
}
exports.deleteAccount = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'deleteAccount', rateLimit_1.RATE_LIMITS.sensitive);
    const { pin } = request.data;
    // Require PIN verification for account deletion (COPPA safeguard)
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        throw new https_1.HttpsError('invalid-argument', 'PIN is required to delete account');
    }
    const userDoc = await admin_1.db.doc(`users/${uid}`).get();
    if (!userDoc.exists) {
        throw new https_1.HttpsError('not-found', 'User not found');
    }
    const settings = userDoc.data()?.settings;
    const storedHash = settings?.parentPinHash;
    const storedSalt = settings?.parentPinSalt;
    // If PIN is set, verify it
    if (storedHash && storedSalt) {
        const inputHash = (0, crypto_1.createHash)('sha256')
            .update(storedSalt + pin)
            .digest('hex');
        if (inputHash !== storedHash) {
            throw new https_1.HttpsError('permission-denied', 'Incorrect PIN');
        }
    }
    // 1. Find and delete all children belonging to this user
    const childrenSnap = await admin_1.db.collection('children').where('parentUid', '==', uid).get();
    for (const childDoc of childrenSnap.docs) {
        const childId = childDoc.id;
        // Delete child subcollections
        for (const sub of CHILD_SUBCOLLECTIONS) {
            await deleteCollection(childDoc.ref.collection(sub));
        }
        // Delete progress subcollections
        const progressRef = admin_1.db.doc(`progress/${childId}`);
        for (const sub of ['lessons', 'vocabulary', 'stats']) {
            await deleteCollection(progressRef.collection(sub));
        }
        const progressDoc = await progressRef.get();
        if (progressDoc.exists)
            await progressRef.delete();
        // Delete gamification subcollections
        const gamRef = admin_1.db.doc(`gamification/${childId}`);
        for (const sub of ['achievements', 'quests', 'inventory']) {
            await deleteCollection(gamRef.collection(sub));
        }
        const gamDoc = await gamRef.get();
        if (gamDoc.exists)
            await gamRef.delete();
        // Delete child doc
        await childDoc.ref.delete();
    }
    // 2. Delete user purchases subcollection
    await deleteCollection(admin_1.db.collection(`users/${uid}/purchases`));
    // 3. Delete user document
    await admin_1.db.doc(`users/${uid}`).delete();
    // 4. Delete analytics documents for this user
    const analyticsSnap = await admin_1.db
        .collection('analytics')
        .where('userId', '==', uid)
        .limit(500)
        .get();
    if (!analyticsSnap.empty) {
        const batch = admin_1.db.batch();
        for (const doc of analyticsSnap.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
    }
    // 5. Delete Firebase Auth user (last step — point of no return)
    try {
        await admin_1.auth.deleteUser(uid);
    }
    catch (error) {
        // User may already be deleted from Auth — log but don't fail
        console.warn(`Failed to delete auth user ${uid}:`, error);
    }
    return { deleted: true };
});
//# sourceMappingURL=deleteAccount.js.map