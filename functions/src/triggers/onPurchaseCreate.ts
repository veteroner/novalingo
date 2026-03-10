/**
 * onPurchaseCreate
 *
 * Firestore trigger: when a purchase record is created under users/{uid}/purchases.
 * Handles post-purchase side effects:
 *   - Sends push notification to parent confirming purchase
 *   - Logs analytics event
 *   - Updates premium status on all child profiles (for subscription purchases)
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db, REGION, serverTimestamp } from '../utils/admin';

export const onPurchaseCreate = onDocumentCreated(
  {
    document: 'users/{uid}/purchases/{purchaseId}',
    region: REGION,
  },
  async (event) => {
    const uid = event.params.uid;
    const purchase = event.data?.data();

    if (!purchase) return;

    const purchaseType = purchase.type as string;
    const productId = purchase.productId as string | undefined;

    console.log(`New purchase for ${uid}: ${purchaseType} — ${productId}`);

    // ── For subscription purchases, propagate premium flag to children ──
    if (['initial', 'subscription', 'renewal'].includes(purchaseType)) {
      const childrenSnap = await db.collection('children').where('parentUid', '==', uid).get();

      const batch = db.batch();
      for (const childDoc of childrenSnap.docs) {
        batch.update(childDoc.ref, {
          isPremium: true,
          premiumUpdatedAt: serverTimestamp(),
        });
      }

      if (!childrenSnap.empty) {
        await batch.commit();
      }
    }

    // ── Record purchase analytics ──
    try {
      await db.collection('analytics').add({
        event: 'purchase',
        uid,
        type: purchaseType,
        productId: productId ?? null,
        gemsGranted: purchase.gemsGranted ?? null,
        expiresAt: purchase.expiresAt ?? null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // Analytics failure should not block purchase flow
      console.error('Failed to log purchase analytics:', err);
    }
  },
);
