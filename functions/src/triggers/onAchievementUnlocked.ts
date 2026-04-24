/**
 * onAchievementUnlocked
 *
 * Firestore trigger: when a new achievement document is created.
 * Awards gems/stars reward, sends push notification if enabled.
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { sendToParent } from '../services/notificationService';
import { db, increment, REGION, serverTimestamp } from '../utils/admin';

export const onAchievementUnlocked = onDocumentCreated(
  {
    document: 'children/{childId}/achievements/{achievementId}',
    region: REGION,
  },
  async (event) => {
    const childId = event.params.childId;
    const achievement = event.data?.data();

    if (!achievement) return;

    const batch = db.batch();
    const childRef = db.doc(`children/${childId}`);

    // Award achievement rewards
    if (achievement.reward) {
      const { type, amount } = achievement.reward;
      if (type === 'gems') {
        batch.update(childRef, { 'currency.gems': increment(amount) });
      } else if (type === 'stars') {
        batch.update(childRef, { 'currency.stars': increment(amount) });
      } else if (type === 'xp') {
        batch.update(childRef, { totalXP: increment(amount) });
      }
    }

    // Update achievement count
    batch.update(childRef, {
      'stats.achievementsUnlocked': increment(1),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    // Send push notification to parent (gated by achievementAlert preference)
    try {
      const childDoc = await childRef.get();
      const child = childDoc.data();
      if (!child?.parentUid) return;

      await sendToParent(child.parentUid, {
        title: '🏆 Yeni Başarı!',
        body: `${child.name} yeni bir başarı kazandı: ${achievement.name}`,
        category: 'achievementAlert',
        data: {
          type: 'achievement',
          childId,
          achievementId: event.params.achievementId,
        },
      });
    } catch (err) {
      console.warn('Failed to send achievement notification:', err);
    }

    console.log(
      `Achievement unlocked: child=${childId}, achievement=${event.params.achievementId}`,
    );
  },
);
