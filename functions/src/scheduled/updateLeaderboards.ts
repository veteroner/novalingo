/**
 * updateLeaderboards
 *
 * Scheduled: runs every Monday at 03:00 UTC.
 * Processes previous week's leaderboard: promotions, relegations, rewards.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, REGION, increment, serverTimestamp } from '../utils/admin';

const TIERS = ['bronze', 'silver', 'gold', 'diamond', 'master'] as const;
const PROMOTION_SLOTS = 3;
const RELEGATION_SLOTS = 3;

export const updateLeaderboards = onSchedule(
  {
    schedule: '0 3 * * 1', // Monday 03:00 UTC
    timeZone: 'UTC',
    region: REGION,
  },
  async () => {
    // Calculate previous week's ID
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 86_400_000);
    const startOfYear = new Date(lastWeek.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((lastWeek.getTime() - startOfYear.getTime()) / 86_400_000 +
        startOfYear.getDay() +
        1) /
        7
    );
    const weekId = `${lastWeek.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    console.log(`Processing leaderboard for week: ${weekId}`);

    for (const tier of TIERS) {
      const entriesSnap = await db
        .collection(`leaderboards/${weekId}/entries`)
        .where('tier', '==', tier)
        .orderBy('weeklyXP', 'desc')
        .get();

      if (entriesSnap.empty) continue;

      const entries = entriesSnap.docs;
      const total = entries.length;

      const batch = db.batch();

      for (let i = 0; i < total; i++) {
        const entry = entries[i];
        const childId = entry.id;
        const childRef = db.doc(`children/${childId}`);

        const tierIndex = TIERS.indexOf(tier);

        // Promotion: top 3 move up (if not already master)
        if (i < PROMOTION_SLOTS && tierIndex < TIERS.length - 1) {
          const newTier = TIERS[tierIndex + 1];
          batch.update(childRef, {
            leagueTier: newTier,
            'currency.gems': increment(15), // Promotion reward
            updatedAt: serverTimestamp(),
          });
        }
        // Relegation: bottom 3 move down (if not already bronze)
        else if (i >= total - RELEGATION_SLOTS && tierIndex > 0) {
          const newTier = TIERS[tierIndex - 1];
          batch.update(childRef, {
            leagueTier: newTier,
            updatedAt: serverTimestamp(),
          });
        }
      }

      await batch.commit();
      console.log(`Tier ${tier}: processed ${total} entries`);
    }

    console.log('Leaderboard processing complete');
  }
);
