/**
 * resetDailyQuests
 *
 * Scheduled: runs daily at 05:00 UTC+3 (02:00 UTC).
 * Generates 4 new daily quests for each active child.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, REGION, serverTimestamp } from '../utils/admin';

const QUEST_TEMPLATES = [
  {
    type: 'lesson',
    title: 'Ders Kahramanı',
    description: '{{target}} ders tamamla',
    targets: [1, 2, 3],
    rewards: [
      { type: 'stars', amount: 10 },
      { type: 'stars', amount: 20 },
      { type: 'stars', amount: 30 },
    ],
  },
  {
    type: 'xp',
    title: 'XP Avcısı',
    description: '{{target}} XP kazan',
    targets: [50, 100, 200],
    rewards: [
      { type: 'gems', amount: 3 },
      { type: 'gems', amount: 5 },
      { type: 'gems', amount: 10 },
    ],
  },
  {
    type: 'perfect',
    title: 'Mükemmeliyetçi',
    description: '{{target}} mükemmel ders tamamla',
    targets: [1, 2],
    rewards: [
      { type: 'gems', amount: 5 },
      { type: 'gems', amount: 10 },
    ],
  },
  {
    type: 'word',
    title: 'Kelime Ustası',
    description: '{{target}} yeni kelime öğren',
    targets: [5, 10, 20],
    rewards: [
      { type: 'stars', amount: 15 },
      { type: 'stars', amount: 25 },
      { type: 'stars', amount: 40 },
    ],
  },
  {
    type: 'streak',
    title: 'Seri Koruyucu',
    description: 'Bugün en az 1 ders yap',
    targets: [1],
    rewards: [{ type: 'stars', amount: 10 }],
  },
];

export const resetDailyQuests = onSchedule(
  {
    schedule: '0 2 * * *', // 02:00 UTC = 05:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: REGION,
  },
  async () => {
    const today = new Date().toISOString().split('T')[0];

    // Get all active children (activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const childrenSnap = await db
      .collection('children')
      .where('updatedAt', '>=', sevenDaysAgo)
      .get();

    console.log(`Generating quests for ${childrenSnap.size} active children`);

    const BATCH_LIMIT = 500;
    let batch = db.batch();
    let opCount = 0;

    for (const childDoc of childrenSnap.docs) {
      const childId = childDoc.id;

      // Pick 4 unique quest types
      const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 4);

      for (let i = 0; i < selected.length; i++) {
        const template = selected[i];
        const difficultyIndex = Math.floor(Math.random() * template.targets.length);
        const target = template.targets[difficultyIndex];
        const reward = template.rewards[difficultyIndex];

        const questRef = db.doc(`children/${childId}/quests/${today}_${i}`);
        batch.set(questRef, {
          type: template.type,
          title: template.title,
          description: template.description.replace('{{target}}', String(target)),
          targetProgress: target,
          currentProgress: 0,
          reward,
          claimed: false,
          createdAt: serverTimestamp(),
          expiresAt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
        });

        opCount++;
        if (opCount >= BATCH_LIMIT) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }
      }
    }

    if (opCount > 0) {
      await batch.commit();
    }

    console.log(`Daily quests generated for ${childrenSnap.size} children`);
  },
);
