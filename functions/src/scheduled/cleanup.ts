/**
 * cleanupExpiredCache
 *
 * Scheduled: runs weekly on Sundays at 04:00 UTC.
 * Cleans up expired daily spins, old quest records, stale leaderboard weeks.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, REGION } from '../utils/admin';

export const cleanupExpiredCache = onSchedule(
  {
    schedule: '0 4 * * 0', // Sunday 04:00 UTC
    timeZone: 'UTC',
    region: REGION,
  },
  async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalDeleted = 0;

    // Clean old leaderboard weeks (keep last 4 weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 86_400_000);
    const startOfYear = new Date(fourWeeksAgo.getFullYear(), 0, 1);
    const oldWeekNumber = Math.ceil(
      ((fourWeeksAgo.getTime() - startOfYear.getTime()) / 86_400_000 +
        startOfYear.getDay() +
        1) /
        7
    );

    // Log for tracking
    console.log(`Cleanup started. Threshold: ${thirtyDaysAgo.toISOString()}`);
    console.log(`Keeping leaderboards from week ${oldWeekNumber} onwards`);

    // Delete expired quest documents across all children
    const childrenSnap = await db.collection('children').select().get();

    for (const childDoc of childrenSnap.docs) {
      const expiredQuests = await db
        .collection(`children/${childDoc.id}/quests`)
        .where('expiresAt', '<', thirtyDaysAgo)
        .limit(100)
        .get();

      if (!expiredQuests.empty) {
        const batch = db.batch();
        for (const questDoc of expiredQuests.docs) {
          batch.delete(questDoc.ref);
          totalDeleted++;
        }
        await batch.commit();
      }

      // Delete old daily spin records
      const oldSpins = await db
        .collection(`children/${childDoc.id}/dailySpins`)
        .where('spunAt', '<', thirtyDaysAgo)
        .limit(100)
        .get();

      if (!oldSpins.empty) {
        const batch = db.batch();
        for (const spinDoc of oldSpins.docs) {
          batch.delete(spinDoc.ref);
          totalDeleted++;
        }
        await batch.commit();
      }
    }

    console.log(`Cleanup complete: ${totalDeleted} documents deleted`);
  }
);
