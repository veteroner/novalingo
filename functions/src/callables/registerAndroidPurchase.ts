/**
 * Register Android Purchase Token
 *
 * Called by the client immediately after a successful Google Play purchase
 * (in the store.when().finished() callback on Android).
 *
 * Writes a {purchaseToken → uid} mapping to Firestore so that the
 * googleNotification webhook can resolve which user to update when
 * Google sends subscription lifecycle events.
 *
 * The purchaseToken collection is separate from users/ so it can have
 * its own Firestore security rules (server-write only via Functions).
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth, serverTimestamp } from '../utils/admin';

export const registerAndroidPurchase = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);

  const { purchaseToken, productId } = request.data as {
    purchaseToken?: string;
    productId?: string;
  };

  if (typeof purchaseToken !== 'string' || purchaseToken.length < 10) {
    throw new HttpsError('invalid-argument', 'Invalid purchaseToken');
  }

  if (typeof productId !== 'string' || !productId.startsWith('com.novalingo.')) {
    throw new HttpsError('invalid-argument', 'Invalid productId');
  }

  // Store the mapping — googleNotification webhook reads from this collection
  await db.doc(`purchaseTokens/${purchaseToken}`).set({
    uid,
    productId,
    registeredAt: serverTimestamp(),
  });
});
