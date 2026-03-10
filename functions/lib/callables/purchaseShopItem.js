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
    const childRef = admin_1.db.doc(`children/${childId}`);
    // Transaction: validate balance + deduct + grant (atomic)
    const result = await admin_1.db.runTransaction(async (tx) => {
        const childSnap = await tx.get(childRef);
        if (!childSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Child not found');
        }
        const child = childSnap.data();
        const ownedItems = child.ownedItems ?? [];
        if (ownedItems.includes(itemId)) {
            throw new https_1.HttpsError('already-exists', 'Item already owned');
        }
        const currencyField = item.currencyType === 'gems' ? 'currency.gems' : 'currency.stars';
        const balance = item.currencyType === 'gems' ? (child.currency?.gems ?? 0) : (child.currency?.stars ?? 0);
        if (balance < item.price) {
            throw new https_1.HttpsError('failed-precondition', 'Insufficient balance');
        }
        const newBalance = balance - item.price;
        tx.update(childRef, {
            [currencyField]: newBalance,
            ownedItems: (0, admin_1.arrayUnion)(itemId),
            updatedAt: (0, admin_1.serverTimestamp)(),
        });
        return { newBalance };
    });
    return {
        itemId,
        itemName: item.name,
        spent: item.price,
        currencyType: item.currencyType,
        newBalance: result.newBalance,
    };
});
//# sourceMappingURL=purchaseShopItem.js.map