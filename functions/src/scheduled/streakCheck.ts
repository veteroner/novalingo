/**
 * streakCheckMidnight
 *
 * Scheduled: runs daily at 06:00 UTC+3 (03:00 UTC).
 * Checks all active children — resets streaks for those who didn't play
 * and didn't use a streak freeze.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, REGION, serverTimestamp } from '../utils/admin';

export const streakCheckMidnight = onSchedule(
  {
    schedule: '0 3 * * *', // 03:00 UTC = 06:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: REGION,
  },
  async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get children with active streaks
    const childrenSnap = await db
      .collection('children')
      .where('streak.current', '>', 0)
      .get();

    console.log(`Checking streaks for ${childrenSnap.size} children`);

    const BATCH_LIMIT = 500;
    let batch = db.batch();
    let opCount = 0;
    let resetCount = 0;
    let frozenCount = 0;

    for (const childDoc of childrenSnap.docs) {
      const child = childDoc.data();
      const lastActivityDate = child.streak.lastActivityDate;

      // If they played yesterday or today, streak is safe
      if (lastActivityDate === yesterdayStr || lastActivityDate === new Date().toISOString().split('T')[0]) {
        continue;
      }

      // Check if freeze was used
      if (child.streak.frozenToday) {
        // Clear the frozen flag for next day
        batch.update(childDoc.ref, {
          'streak.frozenToday': false,
          updatedAt: serverTimestamp(),
        });
        frozenCount++;
      } else {
        // Reset streak
        batch.update(childDoc.ref, {
          'streak.current': 0,
          'streak.frozenToday': false,
          updatedAt: serverTimestamp(),
        });
        resetCount++;
      }

      opCount++;
      if (opCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    console.log(`Streak check: ${resetCount} reset, ${frozenCount} frozen`);
  }
);
