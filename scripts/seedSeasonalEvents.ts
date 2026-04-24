/* eslint-disable */
/**
 * Firestore Seed Script — Seasonal Events
 *
 * Kullanım: npx ts-node --esm scripts/seedSeasonalEvents.ts
 *
 * Seasonal event verilerini Firestore'a yazar:
 *   - seasonalEvents/{eventId}           → event metadata
 *   - seasonalEvents/{eventId}/lessons/* → event lessons
 *
 * Varsayılan: projectId 'novalingo-app' (production)
 * Emulator için: FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node --esm scripts/seedSeasonalEvents.ts
 */

import admin from 'firebase-admin';

// Initialize admin SDK
if (!admin.apps?.length) {
  admin.initializeApp({
    projectId: 'novalingo-app',
  });
}
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ─────────────────────────────────────────────────────────────
// SEASONAL EVENTS DATA (inline — ts-node may not resolve aliases)
// ─────────────────────────────────────────────────────────────

const SEASONAL_EVENTS = [
  // ═══════════════════════════════════════════════════════════
  // 🎃 HALLOWEEN — Ekim
  // ═══════════════════════════════════════════════════════════
  {
    id: 'halloween',
    name: 'Cadılar Bayramı',
    nameEn: 'Spooky English',
    description: 'Korkunç kelimeler öğren, şeker topla!',
    descriptionEn: 'Learn spooky words and collect candy!',
    emoji: '🎃',
    theme: 'halloween',
    colors: ['#f97316', '#7c2d12'],
    startMonth: 10,
    startDay: 25,
    endMonth: 10,
    endDay: 31,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'halloween-1',
        title: 'Korkunç Kelimeler',
        titleEn: 'Spooky Words',
        description: 'ghost, witch, pumpkin, bat, spider',
        order: 1,
        xpReward: 30,
        vocabulary: ['ghost', 'witch', 'pumpkin', 'bat', 'spider'],
      },
      {
        id: 'halloween-2',
        title: 'Trick or Treat',
        titleEn: 'Trick or Treat',
        description: 'candy, costume, mask, skeleton, scary',
        order: 2,
        xpReward: 30,
        vocabulary: ['candy', 'costume', 'mask', 'skeleton', 'scary'],
      },
      {
        id: 'halloween-3',
        title: 'Haunted House',
        titleEn: 'Haunted House',
        description: 'dark, monster, scream, door, stairs',
        order: 3,
        xpReward: 35,
        vocabulary: ['dark', 'monster', 'scream', 'door', 'stairs'],
      },
    ],
    collectibles: [
      {
        id: 'halloween-pumpkin',
        name: 'Balkabağı',
        nameEn: 'Jack-o-lantern',
        emoji: '🎃',
        rarity: 'common',
        description: 'Cadılar Bayramı balyabağı',
        obtainMethod: 'lesson-complete',
        lessonId: 'halloween-1',
      },
      {
        id: 'halloween-ghost',
        name: 'Hayalet',
        nameEn: 'Ghost',
        emoji: '👻',
        rarity: 'rare',
        description: 'Ürkütücü bir hayalet',
        obtainMethod: 'lesson-complete',
        lessonId: 'halloween-2',
      },
      {
        id: 'halloween-witch',
        name: 'Cadı Şapkası',
        nameEn: 'Witch Hat',
        emoji: '🧙',
        rarity: 'epic',
        description: 'Tüm dersleri tamamlayan kazanır!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ⛄ KIŞ FESTİVALİ — Aralık-Ocak
  // ═══════════════════════════════════════════════════════════
  {
    id: 'winter-festival',
    name: 'Kış Festivali',
    nameEn: 'Winter Wonderland',
    description: 'Kar, hediyeler ve kış kelimeleri!',
    descriptionEn: 'Snow, gifts and winter words!',
    emoji: '⛄',
    theme: 'winter',
    colors: ['#3b82f6', '#1e3a8a'],
    startMonth: 12,
    startDay: 20,
    endMonth: 1,
    endDay: 2,
    durationDays: 14,
    xpMultiplier: 2.0,
    lessons: [
      {
        id: 'winter-1',
        title: 'Kış Kelimeleri',
        titleEn: 'Winter Words',
        description: 'snow, ice, cold, warm, coat',
        order: 1,
        xpReward: 30,
        vocabulary: ['snow', 'ice', 'cold', 'warm', 'coat'],
      },
      {
        id: 'winter-2',
        title: 'Yılbaşı',
        titleEn: 'New Year',
        description: 'present, tree, star, bell, family',
        order: 2,
        xpReward: 35,
        vocabulary: ['present', 'tree', 'star', 'bell', 'family'],
      },
      {
        id: 'winter-3',
        title: 'Kardan Adam',
        titleEn: 'Snowman',
        description: 'hat, scarf, carrot, button, mittens',
        order: 3,
        xpReward: 35,
        vocabulary: ['hat', 'scarf', 'carrot', 'button', 'mittens'],
      },
      {
        id: 'winter-4',
        title: 'Kış Aktiviteleri',
        titleEn: 'Winter Activities',
        description: 'sledding, skating, skiing, hot chocolate, cozy',
        order: 4,
        xpReward: 40,
        vocabulary: ['sledding', 'skating', 'skiing', 'chocolate', 'cozy'],
      },
    ],
    collectibles: [
      {
        id: 'winter-snowflake',
        name: 'Kar Tanesi',
        nameEn: 'Snowflake',
        emoji: '❄️',
        rarity: 'common',
        description: 'Buz gibi bir kar tanesi',
        obtainMethod: 'lesson-complete',
        lessonId: 'winter-1',
      },
      {
        id: 'winter-snowman',
        name: 'Kardan Adam',
        nameEn: 'Snowman',
        emoji: '⛄',
        rarity: 'rare',
        description: 'Sevimli kardan adam',
        obtainMethod: 'lesson-complete',
        lessonId: 'winter-3',
      },
      {
        id: 'winter-star',
        name: 'Altın Yıldız',
        nameEn: 'Golden Star',
        emoji: '⭐',
        rarity: 'legendary',
        description: 'Kış Festivali şampiyonu',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 💝 SEVGİLİLER GÜNÜ — Şubat
  // ═══════════════════════════════════════════════════════════
  {
    id: 'valentine',
    name: 'Sevgililer Günü',
    nameEn: 'Love & Friendship',
    description: 'Duygular ve arkadaşlık kelimeleri!',
    descriptionEn: 'Learn words about feelings and friendship!',
    emoji: '💝',
    theme: 'valentine',
    colors: ['#ec4899', '#9d174d'],
    startMonth: 2,
    startDay: 10,
    endMonth: 2,
    endDay: 16,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'valentine-1',
        title: 'Duygular',
        titleEn: 'Feelings',
        description: 'happy, love, kind, friend, hug',
        order: 1,
        xpReward: 30,
        vocabulary: ['happy', 'love', 'kind', 'friend', 'hug'],
      },
      {
        id: 'valentine-2',
        title: 'Renkler & Kalpler',
        titleEn: 'Colors & Hearts',
        description: 'red, pink, heart, flower, gift',
        order: 2,
        xpReward: 30,
        vocabulary: ['red', 'pink', 'heart', 'flower', 'gift'],
      },
      {
        id: 'valentine-3',
        title: 'Arkadaşlık',
        titleEn: 'Friendship',
        description: 'share, care, together, play, smile',
        order: 3,
        xpReward: 35,
        vocabulary: ['share', 'care', 'together', 'play', 'smile'],
      },
    ],
    collectibles: [
      {
        id: 'valentine-heart',
        name: 'Kalp',
        nameEn: 'Heart',
        emoji: '❤️',
        rarity: 'common',
        description: 'Sevgiyle dolu bir kalp',
        obtainMethod: 'lesson-complete',
        lessonId: 'valentine-2',
      },
      {
        id: 'valentine-rose',
        name: 'Gül',
        nameEn: 'Rose',
        emoji: '🌹',
        rarity: 'rare',
        description: 'Kırmızı bir gül',
        obtainMethod: 'lesson-complete',
        lessonId: 'valentine-1',
      },
      {
        id: 'valentine-nova-bow',
        name: 'Nova Fiyonklu',
        nameEn: 'Nova with Bow',
        emoji: '🐾',
        rarity: 'epic',
        description: 'Fiyonklu özel Nova',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🌸 İLKBAHAR — Mart-Nisan
  // ═══════════════════════════════════════════════════════════
  {
    id: 'spring',
    name: 'Bahar Festivali',
    nameEn: 'Spring Bloom',
    description: 'Çiçekler, hayvanlar ve renkler!',
    descriptionEn: 'Flowers, animals and colors of spring!',
    emoji: '🌸',
    theme: 'spring',
    colors: ['#22c55e', '#15803d'],
    startMonth: 3,
    startDay: 20,
    endMonth: 3,
    endDay: 26,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'spring-1',
        title: 'Çiçekler',
        titleEn: 'Flowers',
        description: 'flower, bloom, garden, tulip, butterfly',
        order: 1,
        xpReward: 30,
        vocabulary: ['flower', 'bloom', 'garden', 'tulip', 'butterfly'],
      },
      {
        id: 'spring-2',
        title: 'Bahar Hayvanları',
        titleEn: 'Spring Animals',
        description: 'bird, nest, egg, ladybug, frog',
        order: 2,
        xpReward: 30,
        vocabulary: ['bird', 'nest', 'egg', 'ladybug', 'frog'],
      },
      {
        id: 'spring-3',
        title: 'Hava Durumu',
        titleEn: 'Spring Weather',
        description: 'rain, sun, rainbow, wind, cloud',
        order: 3,
        xpReward: 35,
        vocabulary: ['rain', 'sun', 'rainbow', 'wind', 'cloud'],
      },
    ],
    collectibles: [
      {
        id: 'spring-butterfly',
        name: 'Kelebek',
        nameEn: 'Butterfly',
        emoji: '🦋',
        rarity: 'common',
        description: 'Renkli bir kelebek',
        obtainMethod: 'lesson-complete',
        lessonId: 'spring-1',
      },
      {
        id: 'spring-rainbow',
        name: 'Gökkuşağı',
        nameEn: 'Rainbow',
        emoji: '🌈',
        rarity: 'rare',
        description: 'Yedi renkli gökkuşağı',
        obtainMethod: 'lesson-complete',
        lessonId: 'spring-3',
      },
      {
        id: 'spring-nova-flower',
        name: 'Çiçekli Nova',
        nameEn: 'Nova in Bloom',
        emoji: '🌺',
        rarity: 'epic',
        description: 'Bahar Nova koleksiyonu',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ☀️ YAZ — Temmuz
  // ═══════════════════════════════════════════════════════════
  {
    id: 'summer',
    name: 'Yaz Macerası',
    nameEn: 'Summer Adventure',
    description: 'Deniz, kum ve yaz eğlencesi!',
    descriptionEn: 'Sea, sand and summer fun!',
    emoji: '☀️',
    theme: 'summer',
    colors: ['#f59e0b', '#b45309'],
    startMonth: 7,
    startDay: 1,
    endMonth: 7,
    endDay: 7,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'summer-1',
        title: 'Plaj Kelimeleri',
        titleEn: 'Beach Words',
        description: 'beach, sand, wave, shell, crab',
        order: 1,
        xpReward: 30,
        vocabulary: ['beach', 'sand', 'wave', 'shell', 'crab'],
      },
      {
        id: 'summer-2',
        title: 'Yaz Aktiviteleri',
        titleEn: 'Summer Fun',
        description: 'swim, dive, run, jump, play',
        order: 2,
        xpReward: 30,
        vocabulary: ['swim', 'dive', 'run', 'jump', 'play'],
      },
      {
        id: 'summer-3',
        title: 'Dondurma & Meyveler',
        titleEn: 'Ice Cream & Fruits',
        description: 'ice cream, watermelon, lemon, strawberry, mango',
        order: 3,
        xpReward: 35,
        vocabulary: ['ice cream', 'watermelon', 'lemon', 'strawberry', 'mango'],
      },
    ],
    collectibles: [
      {
        id: 'summer-sun',
        name: 'Güneş',
        nameEn: 'Sun',
        emoji: '☀️',
        rarity: 'common',
        description: 'Sıcak yaz güneşi',
        obtainMethod: 'lesson-complete',
        lessonId: 'summer-1',
      },
      {
        id: 'summer-crab',
        name: 'Yengeç',
        nameEn: 'Crab',
        emoji: '🦀',
        rarity: 'rare',
        description: 'Kumda koşan yengeç',
        obtainMethod: 'lesson-complete',
        lessonId: 'summer-2',
      },
      {
        id: 'summer-nova-sunglasses',
        name: 'Güneş Gözlüklü Nova',
        nameEn: 'Nova with Sunglasses',
        emoji: '😎',
        rarity: 'epic',
        description: 'Yaz Nova koleksiyonu',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🎒 OKULA DÖNÜŞ — Eylül
  // ═══════════════════════════════════════════════════════════
  {
    id: 'back-to-school',
    name: 'Okula Dönüş',
    nameEn: 'Back to School',
    description: 'Okul kelimeleriyle yeni döneme hazırlan!',
    descriptionEn: 'Get ready for the new school year!',
    emoji: '🎒',
    theme: 'school',
    colors: ['#8b5cf6', '#4c1d95'],
    startMonth: 9,
    startDay: 1,
    endMonth: 9,
    endDay: 7,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'school-1',
        title: 'Okul Malzemeleri',
        titleEn: 'School Supplies',
        description: 'pencil, ruler, book, eraser, backpack',
        order: 1,
        xpReward: 30,
        vocabulary: ['pencil', 'ruler', 'book', 'eraser', 'backpack'],
      },
      {
        id: 'school-2',
        title: 'Sınıfta',
        titleEn: 'In the Classroom',
        description: 'teacher, desk, chair, board, clock',
        order: 2,
        xpReward: 30,
        vocabulary: ['teacher', 'desk', 'chair', 'board', 'clock'],
      },
      {
        id: 'school-3',
        title: 'Okul Dersleri',
        titleEn: 'School Subjects',
        description: 'math, art, music, science, English',
        order: 3,
        xpReward: 35,
        vocabulary: ['math', 'art', 'music', 'science', 'English'],
      },
    ],
    collectibles: [
      {
        id: 'school-pencil',
        name: 'Kurşun Kalem',
        nameEn: 'Pencil',
        emoji: '✏️',
        rarity: 'common',
        description: 'Okul kalemim',
        obtainMethod: 'lesson-complete',
        lessonId: 'school-1',
      },
      {
        id: 'school-book',
        name: 'Kitap',
        nameEn: 'Book',
        emoji: '📚',
        rarity: 'rare',
        description: 'Bilgi dolu bir kitap',
        obtainMethod: 'lesson-complete',
        lessonId: 'school-2',
      },
      {
        id: 'school-nova-graduate',
        name: 'Mezun Nova',
        nameEn: 'Graduate Nova',
        emoji: '🎓',
        rarity: 'legendary',
        description: 'Tüm okul derslerini tamamlayan efsanevi ödül!',
        obtainMethod: 'event-complete',
      },
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function seedSeasonalEvents() {
  console.log('🌟 Seasonal Events seed başlıyor...\n');

  let eventCount = 0;
  let lessonCount = 0;
  let collectibleCount = 0;

  for (const event of SEASONAL_EVENTS) {
    const { lessons, collectibles, ...eventMeta } = event;

    // Top-level event document
    await db
      .collection('seasonalEvents')
      .doc(event.id)
      .set({
        ...eventMeta,
        lessonCount: lessons.length,
        collectibleCount: collectibles.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    eventCount++;
    console.log(`  ✅ Event: ${event.id} (${event.name})`);

    // Lessons subcollection
    for (const lesson of lessons) {
      await db
        .collection('seasonalEvents')
        .doc(event.id)
        .collection('lessons')
        .doc(lesson.id)
        .set({
          ...lesson,
          eventId: event.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      lessonCount++;
    }
    console.log(`     └─ ${lessons.length} ders yazıldı`);

    // Collectibles subcollection
    for (const collectible of collectibles) {
      await db
        .collection('seasonalEvents')
        .doc(event.id)
        .collection('collectibles')
        .doc(collectible.id)
        .set({
          ...collectible,
          eventId: event.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      collectibleCount++;
    }
    console.log(`     └─ ${collectibles.length} koleksiyon öğesi yazıldı\n`);
  }

  console.log('─────────────────────────────────────');
  console.log(`✅ Tamamlandı!`);
  console.log(`   ${eventCount} event`);
  console.log(`   ${lessonCount} ders`);
  console.log(`   ${collectibleCount} koleksiyon öğesi`);
  console.log('─────────────────────────────────────');
}

seedSeasonalEvents()
  .then(() => {
    console.log('\n🎉 Seed başarıyla tamamlandı.');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('❌ Seed hatası:', err);
    process.exit(1);
  });
