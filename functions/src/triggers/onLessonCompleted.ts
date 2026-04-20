/**
 * onLessonCompleted
 *
 * Firestore trigger: when a lesson progress document is created/updated.
 * Updates quest progress, checks achievement conditions, updates leaderboard.
 */

import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { db, increment, REGION, serverTimestamp } from '../utils/admin';

export const onLessonCompleted = onDocumentWritten(
  {
    document: 'children/{childId}/lessonProgress/{lessonId}',
    region: REGION,
  },
  async (event) => {
    const childId = event.params.childId;
    const after = event.data?.after?.data();

    if (!after) return; // Deletion, skip

    const isNew = !event.data?.before?.exists;
    if (!isNew) return; // Only process new completions

    // ── Update daily quest progress ────────────────────────
    const questsSnap = await db
      .collection(`children/${childId}/quests`)
      .where('expiresAt', '>=', new Date())
      .get();

    const batch = db.batch();

    for (const questDoc of questsSnap.docs) {
      const quest = questDoc.data();
      if (quest.claimed) continue;

      if (quest.type === 'lesson' && quest.currentProgress < quest.targetProgress) {
        batch.update(questDoc.ref, {
          currentProgress: increment(1),
          updatedAt: serverTimestamp(),
        });
      }

      if (quest.type === 'perfect' && after.accuracy === 1.0) {
        batch.update(questDoc.ref, {
          currentProgress: increment(1),
          updatedAt: serverTimestamp(),
        });
      }

      if (quest.type === 'xp') {
        batch.update(questDoc.ref, {
          currentProgress: increment(after.xpEarned ?? 0),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // ── Update weekly leaderboard ──────────────────────────
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7,
    );
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    const childDoc = await db.doc(`children/${childId}`).get();
    const child = childDoc.data();

    if (child) {
      const lbRef = db.doc(`leaderboards/${weekId}/entries/${childId}`);
      batch.set(
        lbRef,
        {
          name: child.name,
          avatarId: child.avatarId,
          level: child.level,
          tier: child.leagueTier ?? 'bronze',
          weeklyXP: increment(after.xpEarned ?? 0),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }

    await batch.commit();

    // NOTE: Collectible grants are handled client-side in submitLessonResult
    // for immediate UI feedback. Do NOT grant here to avoid double-granting.

    console.log(`Lesson completed: child=${childId}, lesson=${event.params.lessonId}`);
  },
);
