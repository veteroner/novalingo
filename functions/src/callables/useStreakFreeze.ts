/**
 * useStreakFreeze
 *
 * Consumes a streak freeze to prevent streak reset.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';

interface StreakFreezeRequest {
  childId: string;
}

export const useStreakFreeze = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId } = request.data as StreakFreezeRequest;

  await requireChildOwnership(uid, childId);

  const childRef = db.doc(`children/${childId}`);

  const result = await db.runTransaction(async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists) {
      throw new HttpsError('not-found', 'Child profile not found');
    }
    const child = childSnap.data()!;
    const available = child.streak?.freezesAvailable ?? 0;

    if (available <= 0) {
      throw new HttpsError('failed-precondition', 'No streak freezes available');
    }

    tx.update(childRef, {
      'streak.freezesAvailable': available - 1,
      'streak.frozenToday': true,
      updatedAt: serverTimestamp(),
    });

    return { freezesRemaining: available - 1 };
  });

  return result;
});
