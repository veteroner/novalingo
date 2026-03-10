/**
 * claimQuestReward
 *
 * Validates quest completion, awards currency, marks quest as claimed.
 */

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  callableOpts,
  db,
  increment,
  requireAuth,
  requireChildOwnership,
  serverTimestamp,
} from '../utils/admin';

interface ClaimQuestRequest {
  childId: string;
  questId: string;
}

export const claimQuestReward = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId, questId } = request.data as ClaimQuestRequest;

  await requireChildOwnership(uid, childId);

  const questRef = db.doc(`children/${childId}/quests/${questId}`);
  const childRef = db.doc(`children/${childId}`);

  // Transaction: read + validate + write atomically to prevent double-claim
  const reward = await db.runTransaction(async (tx) => {
    const questDoc = await tx.get(questRef);

    if (!questDoc.exists) {
      throw new HttpsError('not-found', 'Quest not found');
    }

    const quest = questDoc.data()!;

    if (quest.claimed) {
      throw new HttpsError('already-exists', 'Quest already claimed');
    }

    if (quest.currentProgress < quest.targetProgress) {
      throw new HttpsError('failed-precondition', 'Quest not yet completed');
    }

    // Award currency/xp
    if (quest.reward.type === 'stars') {
      tx.update(childRef, {
        'currency.stars': increment(quest.reward.amount),
      });
    } else if (quest.reward.type === 'gems') {
      tx.update(childRef, {
        'currency.gems': increment(quest.reward.amount),
      });
    } else if (quest.reward.type === 'xp') {
      tx.update(childRef, {
        totalXP: increment(quest.reward.amount),
      });
    }

    tx.update(questRef, {
      claimed: true,
      claimedAt: serverTimestamp(),
    });

    return quest.reward;
  });

  return {
    reward,
    questId,
  };
});
