p; /* eslint-disable */
/**
 * Firestore Seed Script — Curriculum Data
 *
 * Kullanım: npx ts-node --esm scripts/seedCurriculum.ts
 *
 * Curriculum verilerini Firestore'a yazar:
 *   - worlds collection
 *   - worlds/{worldId}/units collection
 *   - worlds/{worldId}/units/{unitId}/lessons collection
 */

import * as admin from 'firebase-admin';
import { generateActivities } from '../src/features/learning/data/activityGenerator';
import { curriculum } from '../src/features/learning/data/curriculum';

// Initialize admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'novalingo-app',
  });
}
const db = admin.firestore();

async function seedCurriculum() {
  console.log('🌱 Seeding curriculum data...\n');

  // Use emulator if FIRESTORE_EMULATOR_HOST is set
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`📡 Using emulator: ${process.env.FIRESTORE_EMULATOR_HOST}\n`);
  }

  const MAX_BATCH = 490; // Firestore limit is 500
  let ops: { ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }[] = [];
  let worldCount = 0;
  let unitCount = 0;
  let lessonCount = 0;

  for (const world of curriculum) {
    const worldRef = db.collection('worlds').doc(world.id);
    ops.push({
      ref: worldRef,
      data: {
        name: world.name,
        nameEn: world.nameEn,
        description: world.description,
        order: world.order,
        themeColor: world.themeColor,
        iconUrl: '',
        backgroundUrl: '',
        requiredLevel: world.requiredLevel,
        isPremium: world.isPremium,
        units: world.units.map((u) => u.id),
      },
    });
    worldCount++;

    for (const unit of world.units) {
      const unitRef = worldRef.collection('units').doc(unit.id);
      const bossLesson = unit.lessons.find((l) => l.type === 'boss');
      ops.push({
        ref: unitRef,
        data: {
          worldId: world.id,
          name: unit.name,
          nameEn: unit.nameEn,
          description: unit.description,
          order: unit.order,
          iconUrl: '',
          lessons: unit.lessons.map((l) => l.id),
          bossLessonId: bossLesson?.id ?? null,
        },
      });
      unitCount++;

      for (const lesson of unit.lessons) {
        const activities = generateActivities(lesson);
        const lessonRef = unitRef.collection('lessons').doc(lesson.id);
        ops.push({
          ref: lessonRef,
          data: {
            unitId: unit.id,
            worldId: world.id,
            name: lesson.name,
            nameEn: lesson.nameEn,
            type: lesson.type,
            difficulty: lesson.difficulty,
            order: lesson.order,
            requiredStars: 0,
            estimatedMinutes: lesson.estimatedMinutes,
            xpReward: lesson.xpReward,
            starReward: lesson.starReward,
            activities,
            vocabulary: lesson.vocabulary,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        });
        lessonCount++;
      }
    }
  }

  // Commit in batches respecting the 500-write limit
  const totalOps = ops.length;
  const batchCount = Math.ceil(totalOps / MAX_BATCH);
  console.log(`📊 ${totalOps} writes in ${batchCount} batch(es)\n`);

  for (let i = 0; i < totalOps; i += MAX_BATCH) {
    const slice = ops.slice(i, i + MAX_BATCH);
    const batch = db.batch();
    for (const op of slice) {
      batch.set(op.ref, op.data);
    }
    await batch.commit();
    console.log(
      `   ✓ Batch ${Math.floor(i / MAX_BATCH) + 1}/${batchCount} committed (${slice.length} writes)`,
    );
  }

  console.log(`\n✅ Seeded successfully!`);
  console.log(`   🌍 ${worldCount} worlds`);
  console.log(`   📦 ${unitCount} units`);
  console.log(`   📝 ${lessonCount} lessons`);
}

// ===== SHOP ITEMS SEED =====
async function seedShopItems() {
  console.log('\n🛒 Seeding shop items...');
  const batch = db.batch();
  const items = [
    {
      id: 'streak_freeze',
      name: 'Streak Kalkanı',
      nameEn: 'Streak Freeze',
      category: 'powerup',
      price: { currency: 'gems', amount: 50 },
      description: 'Bir gün kaçırsan streak korunur',
      icon: '🛡️',
      maxOwned: 3,
    },
    {
      id: 'xp_boost_2x',
      name: '2x XP Güçlendirici',
      nameEn: '2x XP Boost',
      category: 'powerup',
      price: { currency: 'gems', amount: 100 },
      description: '30 dakika 2x XP kazan',
      icon: '⚡',
      maxOwned: 5,
    },
    {
      id: 'nova_hat_wizard',
      name: 'Büyücü Şapkası',
      nameEn: 'Wizard Hat',
      category: 'cosmetic',
      price: { currency: 'stars', amount: 500 },
      description: 'Nova için sihirli şapka',
      icon: '🧙',
      maxOwned: 1,
    },
    {
      id: 'nova_hat_crown',
      name: 'Altın Taç',
      nameEn: 'Golden Crown',
      category: 'cosmetic',
      price: { currency: 'stars', amount: 1000 },
      description: 'Nova için altın taç',
      icon: '👑',
      maxOwned: 1,
    },
    {
      id: 'nova_hat_pirate',
      name: 'Korsan Şapkası',
      nameEn: 'Pirate Hat',
      category: 'cosmetic',
      price: { currency: 'stars', amount: 300 },
      description: 'Nova için korsan şapkası',
      icon: '🏴‍☠️',
      maxOwned: 1,
    },
    {
      id: 'hint_pack_5',
      name: '5 İpucu Paketi',
      nameEn: '5 Hint Pack',
      category: 'powerup',
      price: { currency: 'gems', amount: 30 },
      description: 'Zor sorularda ipucu kullan',
      icon: '💡',
      maxOwned: 10,
    },
    {
      id: 'theme_ocean',
      name: 'Okyanus Teması',
      nameEn: 'Ocean Theme',
      category: 'theme',
      price: { currency: 'stars', amount: 800 },
      description: 'Mavi okyanus arka planı',
      icon: '🌊',
      maxOwned: 1,
    },
    {
      id: 'theme_space',
      name: 'Uzay Teması',
      nameEn: 'Space Theme',
      category: 'theme',
      price: { currency: 'stars', amount: 800 },
      description: 'Galaktik uzay arka planı',
      icon: '🚀',
      maxOwned: 1,
    },
  ];

  for (const item of items) {
    batch.set(db.collection('shopItems').doc(item.id), {
      ...item,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`   🛒 ${items.length} shop items seeded`);
}

// ===== ACHIEVEMENT CATALOG SEED =====
async function seedAchievements() {
  console.log('\n🏆 Seeding achievement catalog...');
  const batch = db.batch();
  const achievements = [
    {
      id: 'first_lesson',
      name: 'İlk Adım',
      nameEn: 'First Step',
      description: 'İlk dersini tamamla',
      icon: '🎯',
      category: 'lesson',
      requirement: { type: 'lessons_completed', count: 1 },
      reward: { stars: 20, xp: 50 },
    },
    {
      id: 'lessons_10',
      name: 'Çalışkan Öğrenci',
      nameEn: 'Diligent Student',
      description: '10 ders tamamla',
      icon: '📚',
      category: 'lesson',
      requirement: { type: 'lessons_completed', count: 10 },
      reward: { stars: 100, xp: 200 },
    },
    {
      id: 'lessons_50',
      name: 'Bilgi Avcısı',
      nameEn: 'Knowledge Hunter',
      description: '50 ders tamamla',
      icon: '🎓',
      category: 'lesson',
      requirement: { type: 'lessons_completed', count: 50 },
      reward: { stars: 500, xp: 1000 },
    },
    {
      id: 'perfect_5',
      name: 'Mükemmeliyetçi',
      nameEn: 'Perfectionist',
      description: '5 derste 3 yıldız al',
      icon: '⭐',
      category: 'lesson',
      requirement: { type: 'perfect_lessons', count: 5 },
      reward: { stars: 150, xp: 300 },
    },
    {
      id: 'streak_7',
      name: 'Bir Haftalık',
      nameEn: 'Week Warrior',
      description: '7 gün streak yap',
      icon: '🔥',
      category: 'streak',
      requirement: { type: 'streak_days', count: 7 },
      reward: { stars: 100, xp: 200 },
    },
    {
      id: 'streak_30',
      name: 'Ay Savaşçısı',
      nameEn: 'Month Champion',
      description: '30 gün streak yap',
      icon: '🏆',
      category: 'streak',
      requirement: { type: 'streak_days', count: 30 },
      reward: { stars: 500, xp: 1000, gems: 50 },
    },
    {
      id: 'words_50',
      name: 'Kelime Koleksiyoncusu',
      nameEn: 'Word Collector',
      description: '50 kelime öğren',
      icon: '📖',
      category: 'vocabulary',
      requirement: { type: 'words_learned', count: 50 },
      reward: { stars: 200, xp: 400 },
    },
    {
      id: 'words_200',
      name: 'Sözlük Ustası',
      nameEn: 'Dictionary Master',
      description: '200 kelime öğren',
      icon: '🧠',
      category: 'vocabulary',
      requirement: { type: 'words_learned', count: 200 },
      reward: { stars: 1000, xp: 2000, gems: 100 },
    },
    {
      id: 'world_1_complete',
      name: 'Bahçe Fatihi',
      nameEn: 'Garden Conqueror',
      description: "Dünya 1'i bitir",
      icon: '🌻',
      category: 'world',
      requirement: { type: 'world_completed', worldId: 'w1' },
      reward: { stars: 300, xp: 600 },
    },
    {
      id: 'nova_teen',
      name: 'Nova Büyüyor',
      nameEn: 'Nova Growing Up',
      description: "Nova'yı teen aşamasına ulaştır",
      icon: '🐣',
      category: 'nova',
      requirement: { type: 'nova_stage', stage: 'teen' },
      reward: { stars: 500, xp: 1000 },
    },
  ];

  for (const ach of achievements) {
    batch.set(db.collection('achievementsCatalog').doc(ach.id), {
      ...ach,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`   🏆 ${achievements.length} achievements seeded`);
}

async function seedAll() {
  await seedCurriculum();
  await seedShopItems();
  await seedAchievements();
  console.log('\n🎉 All seed data loaded!\n');
}

seedAll()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
