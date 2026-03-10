/**
 * Deletes a child profile and all its subcollections.
 * Only the owning parent can delete.
 */

import { onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';
import { validateId } from '../utils/validators';

const SUBCOLLECTIONS = [
  'lessonProgress',
  'vocabulary',
  'quests',
  'achievements',
  'inventory',
  'dailySpins',
];

export const deleteChildProfile = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const childId = validateId((request.data as { childId: string }).childId, 'childId');

  await requireChildOwnership(uid, childId);

  const childRef = db.doc(`children/${childId}`);

  // Delete all subcollections first (loop until fully drained)
  for (const sub of SUBCOLLECTIONS) {
    let snap;
    do {
      snap = await childRef.collection(sub).limit(500).get();
      if (!snap.empty) {
        const batch = db.batch();
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
  const userRef = db.doc(`users/${uid}`);
  const userDoc = await userRef.get();
  if (userDoc.data()?.activeChildId === childId) {
    // Try to find another child to set as active
    const remaining = await db.collection('children').where('parentUid', '==', uid).limit(1).get();

    await userRef.update({
      activeChildId: remaining.empty ? null : remaining.docs[0].id,
      updatedAt: serverTimestamp(),
    });
  }

  return { childId, deleted: true as const };
});
