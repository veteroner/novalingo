/**
 * Deletes the user's account and ALL associated data.
 * COPPA compliance: parents must be able to delete their child's data.
 *
 * Deletes: user doc, all children + subcollections, progress, gamification,
 * purchases, analytics, and Firebase Auth account.
 */

import { createHash } from 'crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { auth, callableOpts, db, requireAuth } from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

const CHILD_SUBCOLLECTIONS = [
  'lessonProgress',
  'vocabulary',
  'quests',
  'achievements',
  'inventory',
  'dailySpins',
  'stats',
];

async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference) {
  const batchSize = 500;
  let deleted = 0;
  let snapshot = await collectionRef.limit(batchSize).get();

  while (!snapshot.empty) {
    const batch = db.batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += snapshot.size;

    if (snapshot.size < batchSize) break;
    snapshot = await collectionRef.limit(batchSize).get();
  }

  return deleted;
}

export const deleteAccount = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  await checkRateLimit(uid, 'deleteAccount', RATE_LIMITS.sensitive);
  const { pin } = request.data as { pin: string };

  // Require PIN verification for account deletion (COPPA safeguard)
  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    throw new HttpsError('invalid-argument', 'PIN is required to delete account');
  }

  const userDoc = await db.doc(`users/${uid}`).get();
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }

  const settings = userDoc.data()?.settings;
  const storedHash = settings?.parentPinHash as string | undefined;
  const storedSalt = settings?.parentPinSalt as string | undefined;

  // If PIN is set, verify it
  if (storedHash && storedSalt) {
    const inputHash = createHash('sha256')
      .update(storedSalt + pin)
      .digest('hex');
    if (inputHash !== storedHash) {
      throw new HttpsError('permission-denied', 'Incorrect PIN');
    }
  }

  // 1. Find and delete all children belonging to this user
  const childrenSnap = await db.collection('children').where('parentUid', '==', uid).get();

  for (const childDoc of childrenSnap.docs) {
    const childId = childDoc.id;

    // Delete child subcollections
    for (const sub of CHILD_SUBCOLLECTIONS) {
      await deleteCollection(childDoc.ref.collection(sub));
    }

    // Delete progress subcollections
    const progressRef = db.doc(`progress/${childId}`);
    for (const sub of ['lessons', 'vocabulary', 'stats']) {
      await deleteCollection(progressRef.collection(sub));
    }
    const progressDoc = await progressRef.get();
    if (progressDoc.exists) await progressRef.delete();

    // Delete gamification subcollections
    const gamRef = db.doc(`gamification/${childId}`);
    for (const sub of ['achievements', 'quests', 'inventory']) {
      await deleteCollection(gamRef.collection(sub));
    }
    const gamDoc = await gamRef.get();
    if (gamDoc.exists) await gamRef.delete();

    // Delete child doc
    await childDoc.ref.delete();
  }

  // 2. Delete user purchases subcollection
  await deleteCollection(db.collection(`users/${uid}/purchases`));

  // 3. Delete user document
  await db.doc(`users/${uid}`).delete();

  // 4. Delete analytics documents for this user
  const analyticsSnap = await db
    .collection('analytics')
    .where('userId', '==', uid)
    .limit(500)
    .get();

  if (!analyticsSnap.empty) {
    const batch = db.batch();
    for (const doc of analyticsSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }

  // 5. Delete Firebase Auth user (last step — point of no return)
  try {
    await auth.deleteUser(uid);
  } catch (error: unknown) {
    // User may already be deleted from Auth — log but don't fail
    console.warn(`Failed to delete auth user ${uid}:`, error);
  }

  return { deleted: true };
});
