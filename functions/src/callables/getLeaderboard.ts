/**
 * getLeaderboard
 *
 * Returns weekly leaderboard for a specific league tier.
 * Paginated, with current user's rank highlighted.
 */

import { onCall } from 'firebase-functions/v2/https';
import { callableOpts, db, requireAuth, requireChildOwnership } from '../utils/admin';

interface LeaderboardRequest {
  childId: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  limit?: number;
}

export const getLeaderboard = onCall(callableOpts, async (request) => {
  const uid = requireAuth(request);
  const { childId, tier = 'bronze', limit = 20 } = request.data as LeaderboardRequest;

  await requireChildOwnership(uid, childId);

  // Get current week identifier
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7,
  );
  const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

  // Query leaderboard
  const leaderboardRef = db
    .collection(`leaderboards/${weekId}/entries`)
    .where('tier', '==', tier)
    .orderBy('weeklyXP', 'desc')
    .limit(Math.min(limit, 50));

  const snapshot = await leaderboardRef.get();

  const entries = snapshot.docs.map((doc, index) => ({
    childId: doc.id,
    name: doc.data().name,
    avatarId: doc.data().avatarId,
    level: doc.data().level,
    weeklyXP: doc.data().weeklyXP,
    rank: index + 1,
    isCurrentUser: doc.id === childId,
  }));

  // Find current user's rank if not in top results
  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  return {
    weekId,
    tier,
    entries,
    currentUserRank: currentUserEntry?.rank ?? null,
    promotionSlots: 3,
    relegationSlots: 3,
  };
});
