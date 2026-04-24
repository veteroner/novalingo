/**
 * streakDangerReminder
 *
 * Scheduled: runs daily at 19:00 Turkey time (16:00 UTC).
 * Finds children who:
 *   - have an active streak (streak.current >= 1)
 *   - did NOT play today
 *   - are not already frozen for today
 * and sends a "streak tehlikede" push notification to their parent.
 *
 * COPPA uyumlu — bildirim çocuğa değil, ebeveyne gönderilir.
 * Gönderim `inactivityAlert` tercihine bağlıdır.
 * Ebeveyn günde en fazla 1 "streak danger" bildirimi alır (dedup).
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { notifyParentAboutChild } from '../services/notificationService';
import { db, REGION } from '../utils/admin';

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export const streakDangerReminder = onSchedule(
  {
    schedule: '0 16 * * *', // 16:00 UTC = 19:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: REGION,
  },
  async () => {
    const today = todayISO();
    console.log(`[streakDangerReminder] Running for date: ${today}`);

    const childrenSnap = await db.collection('children').where('streak.current', '>=', 1).get();

    if (childrenSnap.empty) {
      console.log('[streakDangerReminder] No active streaks — skipping.');
      return;
    }

    const dedupField = 'streakDangerSentAt';
    let sentCount = 0;
    let skippedAlreadyPlayed = 0;
    let skippedFrozen = 0;
    let skippedAlreadyNotified = 0;

    for (const childDoc of childrenSnap.docs) {
      const data = childDoc.data();
      const lastActivityDate: string | undefined = data.streak?.lastActivityDate;

      // Played today — streak is safe, no reminder needed.
      if (lastActivityDate === today) {
        skippedAlreadyPlayed++;
        continue;
      }

      // Freeze already applied for today — streak is safe.
      if (data.streak?.frozenToday === true) {
        skippedFrozen++;
        continue;
      }

      // Dedup — one reminder per day per child.
      if (data[dedupField] === today) {
        skippedAlreadyNotified++;
        continue;
      }

      const childName: string = data.name ?? 'çocuğunuz';
      const streakDays: number = data.streak?.current ?? 0;

      const notified = await notifyParentAboutChild(childDoc.id, {
        title: '🔥 Seri tehlikede!',
        body: `${childName} bugün henüz oynamadı. ${streakDays} günlük seriyi birlikte koruyalım!`,
        category: 'inactivityAlert',
        data: {
          type: 'streak_danger',
          childId: childDoc.id,
          streak: String(streakDays),
          date: today,
        },
      });

      if (notified) {
        await childDoc.ref.update({ [dedupField]: today });
        sentCount++;
      }
    }

    console.log(
      `[streakDangerReminder] Done — sent: ${sentCount}, played: ${skippedAlreadyPlayed}, frozen: ${skippedFrozen}, already-notified: ${skippedAlreadyNotified}`,
    );
  },
);
