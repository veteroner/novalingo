"use strict";
/**
 * purchaseShopItem
 *
 * Validates currency balance, deducts cost, grants item ownership.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseShopItem = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
const rateLimit_1 = require("../utils/rateLimit");
exports.purchaseShopItem = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    await (0, rateLimit_1.checkRateLimit)(uid, 'purchaseShopItem', rateLimit_1.RATE_LIMITS.write);
    const { childId, itemId } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    // Get item from catalog
    const itemDoc = await admin_1.db.doc(`shopItems/${itemId}`).get();
    if (!itemDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Item not found');
    }
    const item = itemDoc.data();
    // Check already owned
    const childDoc = await admin_1.db.doc(`children/${childId}`).get();
    const child = childDoc.data();
    const ownedItems = child.ownedItems ?? [];
    if (ownedItems.includes(itemId)) {
        throw new https_1.HttpsError('already-exists', 'Item already owned');
    }
    // Check balance
    const currencyField = item.currencyType === 'gems' ? 'currency.gems' : 'currency.stars';
    const balance = item.currencyType === 'gems' ? child.currency.gems : child.currency.stars;
    if (balance < item.price) {
        throw new https_1.HttpsError('failed-precondition', 'Insufficient balance');
    }
    // Transaction: deduct and grant
    const childRef = admin_1.db.doc(`children/${childId}`);
    await admin_1.db.runTransaction(async (tx) => {
        tx.update(childRef, {
            [currencyField]: (0, admin_1.increment)(-item.price),
            ownedItems: (0, admin_1.arrayUnion)(itemId),
            updatedAt: (0, admin_1.serverTimestamp)(),
        });
    });
    return {
        itemId,
        itemName: item.name,
        spent: item.price,
        currencyType: item.currencyType,
    };
});
//# sourceMappingURL=purchaseShopItem.js.map