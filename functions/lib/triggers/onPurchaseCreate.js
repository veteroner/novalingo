"use strict";
/**
 * onPurchaseCreate
 *
 * Firestore trigger: when a purchase record is created under users/{uid}/purchases.
 * Handles post-purchase side effects:
 *   - Sends push notification to parent confirming purchase
 *   - Logs analytics event
 *   - Updates premium status on all child profiles (for subscription purchases)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPurchaseCreate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("../utils/admin");
exports.onPurchaseCreate = (0, firestore_1.onDocumentCreated)({
    document: 'users/{uid}/purchases/{purchaseId}',
    region: admin_1.REGION,
}, async (event) => {
    const uid = event.params.uid;
    const purchase = event.data?.data();
    if (!purchase)
        return;
    const purchaseType = purchase.type;
    const productId = purchase.productId;
    console.log(`New purchase for ${uid}: ${purchaseType} — ${productId}`);
    // ── For subscription purchases, propagate premium flag to children ──
    if (['initial', 'subscription', 'renewal'].includes(purchaseType)) {
        const childrenSnap = await admin_1.db.collection('children').where('parentUid', '==', uid).get();
        const batch = admin_1.db.batch();
        for (const childDoc of childrenSnap.docs) {
            batch.update(childDoc.ref, {
                isPremium: true,
                premiumUpdatedAt: (0, admin_1.serverTimestamp)(),
            });
        }
        if (!childrenSnap.empty) {
            await batch.commit();
        }
    }
    // ── Record purchase analytics ──
    try {
        await admin_1.db.collection('analytics').add({
            event: 'purchase',
            uid,
            type: purchaseType,
            productId: productId ?? null,
            gemsGranted: purchase.gemsGranted ?? null,
            expiresAt: purchase.expiresAt ?? null,
            createdAt: (0, admin_1.serverTimestamp)(),
        });
    }
    catch (err) {
        // Analytics failure should not block purchase flow
        console.error('Failed to log purchase analytics:', err);
    }
});
//# sourceMappingURL=onPurchaseCreate.js.map