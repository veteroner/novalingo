/**
 * purchaseShopItem
 *
 * Validates currency balance, deducts cost, grants item ownership.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  arrayUnion,
  callableOpts,
  db,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

interface PurchaseRequest {
  childId: string;
  itemId: string;
}

export const purchaseShopItem = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'purchaseShopItem', RATE_LIMITS.write);
  const { childId, itemId } = request.data as PurchaseRequest;

  await requireChildOwnership(uid, childId);

  // Get item from catalog
  const itemDoc = await db.doc(`shopItems/${itemId}`).get();
  if (!itemDoc.exists) {
    throw new HttpsError('not-found', 'Item not found');
  }

  const item = itemDoc.data()!;
  const childRef = db.doc(`children/${childId}`);

  // Transaction: validate balance + deduct + grant (atomic)
  const result = await db.runTransaction(async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists) {
      throw new HttpsError('not-found', 'Child not found');
    }

    const child = childSnap.data()!;
    const ownedItems: string[] = child.ownedItems ?? [];

    if (ownedItems.includes(itemId)) {
      throw new HttpsError('already-exists', 'Item already owned');
    }

    const currencyField = item.currencyType === 'gems' ? 'currency.gems' : 'currency.stars';
    const balance =
      item.currencyType === 'gems' ? (child.currency?.gems ?? 0) : (child.currency?.stars ?? 0);

    if (balance < item.price) {
      throw new HttpsError('failed-precondition', 'Insufficient balance');
    }

    const newBalance = balance - item.price;

    tx.update(childRef, {
      [currencyField]: newBalance,
      ownedItems: arrayUnion(itemId),
      updatedAt: serverTimestamp(),
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
