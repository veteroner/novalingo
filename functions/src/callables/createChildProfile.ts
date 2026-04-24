/**
 * createChildProfile
 *
 * Creates a new child profile under the authenticated parent.
 * Validates free tier limits, initializes gamification defaults.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth, serverTimestamp } from '../utils/admin';

interface CreateChildRequest {
  name: string;
  ageGroup: 'cubs' | 'stars' | 'legends';
  avatarId?: string;
}

export const createChildProfile = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { name, ageGroup, avatarId } = request.data as CreateChildRequest;

  // Validate input
  if (!name || name.trim().length < 2 || name.trim().length > 20) {
    throw new HttpsError('invalid-argument', 'Name must be 2-20 characters');
  }
  if (!['cubs', 'stars', 'legends'].includes(ageGroup)) {
    throw new HttpsError('invalid-argument', 'Invalid age group');
  }

  // Check child count limit
  const existingChildren = await db
    .collection('children')
    .where('parentUid', '==', uid)
    .count()
    .get();

  const userSnap = await db.doc(`users/${uid}`).get();
  const isPremium = Boolean(userSnap.data()?.isPremium);
  const maxChildren = isPremium ? 5 : 1;

  if (existingChildren.data().count >= maxChildren) {
    throw new HttpsError(
      'resource-exhausted',
      isPremium ? 'Maximum 5 child profiles' : 'Upgrade to Premium for more profiles',
    );
  }

  // Create child document
  const childRef = db.collection('children').doc();
  const childData = {
    parentUid: uid,
    name: name.trim(),
    ageGroup,
    avatarId: avatarId ?? 'nova_default',
    level: 1,
    totalXP: 0,
    currentXP: 0,
    currency: { stars: 0, gems: 0 },
    streak: {
      current: 0,
      longest: 0,
      lastActivityDate: null,
      freezesAvailable: 1,
    },
    stats: {
      lessonsCompleted: 0,
      perfectLessons: 0,
      wordsLearned: 0,
      totalTimeSeconds: 0,
    },
    novaStage: 'egg',
    onboardingCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await childRef.set(childData);

  // Set as active child if first child
  if (existingChildren.data().count === 0) {
    await db.doc(`users/${uid}`).set(
      {
        activeChildId: childRef.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return {
    childId: childRef.id,
    parentUid: uid,
    name: childData.name,
    ageGroup: childData.ageGroup,
    avatarId: childData.avatarId,
    level: childData.level,
    totalXP: childData.totalXP,
    currentXP: childData.currentXP,
    currency: childData.currency,
    streak: childData.streak,
    stats: childData.stats,
    novaStage: childData.novaStage,
    onboardingCompleted: childData.onboardingCompleted,
  };
});
