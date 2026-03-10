/**
 * spinDailyWheel
 *
 * Validates daily spin eligibility, calculates weighted random reward,
 * awards the prize, marks spin as used for today.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  getTodayTR,
  increment,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';

interface SpinWheelRequest {
  childId: string;
}

const WHEEL_SEGMENTS = [
  { id: 'stars_10', type: 'stars' as const, amount: 10, weight: 25 },
  { id: 'stars_25', type: 'stars' as const, amount: 25, weight: 15 },
  { id: 'stars_50', type: 'stars' as const, amount: 50, weight: 8 },
  { id: 'xp_20', type: 'xp' as const, amount: 20, weight: 20 },
  { id: 'xp_50', type: 'xp' as const, amount: 50, weight: 10 },
  { id: 'gems_5', type: 'gems' as const, amount: 5, weight: 12 },
  { id: 'gems_10', type: 'gems' as const, amount: 10, weight: 5 },
  { id: 'freeze', type: 'streak_freeze' as const, amount: 1, weight: 5 },
];

function weightedRandom() {
  const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const segment of WHEEL_SEGMENTS) {
    random -= segment.weight;
    if (random <= 0) return segment;
  }
  return WHEEL_SEGMENTS[0];
}

export const spinDailyWheel = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId } = request.data as SpinWheelRequest;

  await requireChildOwnership(uid, childId);

  const today = getTodayTR();
  const spinRef = db.doc(`children/${childId}/dailySpins/${today}`);
  const childRef = db.doc(`children/${childId}`);

  // Pick reward before transaction (no Firestore dependency)
  const reward = weightedRandom();

  // Transaction: check-and-write atomically to prevent double-spin
  await db.runTransaction(async (tx) => {
    const spinDoc = await tx.get(spinRef);
    if (spinDoc.exists) {
      throw new HttpsError('already-exists', 'Already spun today');
    }

    switch (reward.type) {
      case 'stars':
        tx.update(childRef, { 'currency.stars': increment(reward.amount) });
        break;
      case 'gems':
        tx.update(childRef, { 'currency.gems': increment(reward.amount) });
        break;
      case 'xp':
        tx.update(childRef, { totalXP: increment(reward.amount) });
        break;
      case 'streak_freeze':
        tx.update(childRef, {
          'streak.freezesAvailable': increment(reward.amount),
        });
        break;
    }

    tx.set(spinRef, {
      reward,
      spunAt: serverTimestamp(),
    });
  });

  return {
    segmentId: reward.id,
    reward: { type: reward.type, amount: reward.amount },
  };
});
