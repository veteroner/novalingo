import type { SeasonalEvent } from '@/types/gamification';

/**
 * 6 Seasonal Events — yılda 6 kez, her biri 7 gün
 * Her event: 5-7 özel ders, 3 collectible, bonus XP
 */
export const SEASONAL_EVENTS: SeasonalEvent[] = [
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
      {
        id: 'halloween-4',
        title: 'Jack-o-Lantern',
        titleEn: 'Jack-o-Lantern',
        description: 'carve, candle, face, orange, light',
        order: 4,
        xpReward: 35,
        vocabulary: ['carve', 'candle', 'face', 'orange', 'light'],
      },
      {
        id: 'halloween-5',
        title: 'Halloween Party',
        titleEn: 'Halloween Party',
        description: 'dance, music, friends, potion, cauldron',
        order: 5,
        xpReward: 40,
        vocabulary: ['dance', 'music', 'friends', 'potion', 'cauldron'],
      },
    ],
    collectibles: [
      {
        id: 'halloween-ghost',
        name: 'Hayalet Arkadaş',
        nameEn: 'Ghost Friend',
        emoji: '👻',
        rarity: 'uncommon',
        description: 'Sevimli bir hayalet! Boo!',
        obtainMethod: 'lesson-complete',
        lessonId: 'halloween-2',
      },
      {
        id: 'halloween-pumpkin',
        name: 'Altın Balkabağı',
        nameEn: 'Golden Pumpkin',
        emoji: '🎃',
        rarity: 'rare',
        description: 'Parlayan bir balkabağı feneri!',
        obtainMethod: 'lesson-complete',
        lessonId: 'halloween-4',
      },
      {
        id: 'halloween-trophy',
        name: 'Cadılar Kupası',
        nameEn: 'Spooky Trophy',
        emoji: '🏆',
        rarity: 'epic',
        description: 'Tüm Halloween derslerini bitirdin!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ❄️ WINTER FESTIVAL — Aralık
  // ═══════════════════════════════════════════════════════════
  {
    id: 'winter-festival',
    name: 'Kış Festivali',
    nameEn: 'Holiday Words',
    description: 'Kış ve tatil kelimelerini öğren!',
    descriptionEn: 'Learn winter and holiday words!',
    emoji: '❄️',
    theme: 'winter',
    colors: ['#3b82f6', '#1e3a5f'],
    startMonth: 12,
    startDay: 20,
    endMonth: 12,
    endDay: 26,
    durationDays: 7,
    xpMultiplier: 1.5,
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
        title: 'Holiday Time',
        titleEn: 'Holiday Time',
        description: 'gift, tree, star, bell, candle',
        order: 2,
        xpReward: 30,
        vocabulary: ['gift', 'tree', 'star', 'bell', 'candle'],
      },
      {
        id: 'winter-3',
        title: 'Snowman',
        titleEn: 'Build a Snowman',
        description: 'snowman, hat, scarf, carrot, button',
        order: 3,
        xpReward: 35,
        vocabulary: ['snowman', 'hat', 'scarf', 'carrot', 'button'],
      },
      {
        id: 'winter-4',
        title: 'Yılbaşı Yemeği',
        titleEn: 'Holiday Feast',
        description: 'turkey, pie, cookies, hot chocolate, family',
        order: 4,
        xpReward: 35,
        vocabulary: ['turkey', 'pie', 'cookies', 'chocolate', 'family'],
      },
      {
        id: 'winter-5',
        title: 'Kış Sporları',
        titleEn: 'Winter Sports',
        description: 'ski, skate, sled, snowboard, mountain',
        order: 5,
        xpReward: 35,
        vocabulary: ['ski', 'skate', 'sled', 'snowboard', 'mountain'],
      },
      {
        id: 'winter-6',
        title: 'New Year',
        titleEn: 'Happy New Year',
        description: 'countdown, fireworks, party, wish, midnight',
        order: 6,
        xpReward: 40,
        vocabulary: ['countdown', 'fireworks', 'party', 'wish', 'midnight'],
      },
    ],
    collectibles: [
      {
        id: 'winter-snowflake',
        name: 'Kristal Kar Tanesi',
        nameEn: 'Crystal Snowflake',
        emoji: '❄️',
        rarity: 'uncommon',
        description: 'Eşsiz bir kar tanesi!',
        obtainMethod: 'lesson-complete',
        lessonId: 'winter-3',
      },
      {
        id: 'winter-gift',
        name: 'Sihirli Hediye',
        nameEn: 'Magic Gift',
        emoji: '🎁',
        rarity: 'rare',
        description: 'İçinde sürpriz var!',
        obtainMethod: 'daily-login',
      },
      {
        id: 'winter-trophy',
        name: 'Kış Şampiyonu',
        nameEn: 'Winter Champion',
        emoji: '⛄',
        rarity: 'epic',
        description: 'Tüm kış derslerini tamamladın!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 💝 VALENTINE — Şubat
  // ═══════════════════════════════════════════════════════════
  {
    id: 'valentine',
    name: 'Arkadaşlık Haftası',
    nameEn: 'Friendship Words',
    description: 'Arkadaşlık ve sevgi kelimelerini öğren!',
    descriptionEn: 'Learn words about friendship and kindness!',
    emoji: '💝',
    theme: 'friendship',
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
        title: 'Arkadaşlık',
        titleEn: 'Friendship',
        description: 'friend, kind, share, help, together',
        order: 1,
        xpReward: 30,
        vocabulary: ['friend', 'kind', 'share', 'help', 'together'],
      },
      {
        id: 'valentine-2',
        title: 'Duygular',
        titleEn: 'Feelings',
        description: 'happy, love, hug, smile, care',
        order: 2,
        xpReward: 30,
        vocabulary: ['happy', 'love', 'hug', 'smile', 'care'],
      },
      {
        id: 'valentine-3',
        title: 'Güzel Sözler',
        titleEn: 'Kind Words',
        description: 'please, thank you, sorry, welcome, great',
        order: 3,
        xpReward: 35,
        vocabulary: ['please', 'thank', 'sorry', 'welcome', 'great'],
      },
      {
        id: 'valentine-4',
        title: 'Hediye Verme',
        titleEn: 'Giving Gifts',
        description: 'give, receive, surprise, card, flower',
        order: 4,
        xpReward: 35,
        vocabulary: ['give', 'receive', 'surprise', 'card', 'flower'],
      },
      {
        id: 'valentine-5',
        title: 'En İyi Arkadaş',
        titleEn: 'Best Friends',
        description: 'best, always, play, laugh, trust',
        order: 5,
        xpReward: 40,
        vocabulary: ['best', 'always', 'play', 'laugh', 'trust'],
      },
    ],
    collectibles: [
      {
        id: 'valentine-heart',
        name: 'Parlayan Kalp',
        nameEn: 'Shining Heart',
        emoji: '💖',
        rarity: 'uncommon',
        description: 'Arkadaşlığın simgesi!',
        obtainMethod: 'lesson-complete',
        lessonId: 'valentine-2',
      },
      {
        id: 'valentine-letter',
        name: 'Dostluk Mektubu',
        nameEn: 'Friendship Letter',
        emoji: '💌',
        rarity: 'rare',
        description: 'En güzel kelimelerle yazılmış!',
        obtainMethod: 'daily-login',
      },
      {
        id: 'valentine-trophy',
        name: 'Sevgi Kahramanı',
        nameEn: 'Kindness Hero',
        emoji: '🦸',
        rarity: 'epic',
        description: 'Tüm arkadaşlık derslerini bitirdin!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🌸 SPRING — Nisan
  // ═══════════════════════════════════════════════════════════
  {
    id: 'spring',
    name: 'Bahar Şenliği',
    nameEn: 'Nature English',
    description: 'Doğa ve bahar kelimelerini öğren!',
    descriptionEn: 'Learn words about nature and spring!',
    emoji: '🌸',
    theme: 'nature',
    colors: ['#10b981', '#064e3b'],
    startMonth: 4,
    startDay: 15,
    endMonth: 4,
    endDay: 21,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'spring-1',
        title: 'Bahçe',
        titleEn: 'Garden',
        description: 'flower, tree, grass, seed, grow',
        order: 1,
        xpReward: 30,
        vocabulary: ['flower', 'tree', 'grass', 'seed', 'grow'],
      },
      {
        id: 'spring-2',
        title: 'Böcekler',
        titleEn: 'Insects',
        description: 'butterfly, bee, ladybug, ant, worm',
        order: 2,
        xpReward: 30,
        vocabulary: ['butterfly', 'bee', 'ladybug', 'ant', 'worm'],
      },
      {
        id: 'spring-3',
        title: 'Hava Durumu',
        titleEn: 'Weather',
        description: 'rain, sun, rainbow, cloud, wind',
        order: 3,
        xpReward: 35,
        vocabulary: ['rain', 'sun', 'rainbow', 'cloud', 'wind'],
      },
      {
        id: 'spring-4',
        title: 'Kuşlar',
        titleEn: 'Birds',
        description: 'bird, nest, egg, sing, fly',
        order: 4,
        xpReward: 35,
        vocabulary: ['bird', 'nest', 'egg', 'sing', 'fly'],
      },
      {
        id: 'spring-5',
        title: 'Piknik',
        titleEn: 'Picnic',
        description: 'basket, blanket, sandwich, juice, park',
        order: 5,
        xpReward: 35,
        vocabulary: ['basket', 'blanket', 'sandwich', 'juice', 'park'],
      },
      {
        id: 'spring-6',
        title: 'Doğa Yürüyüşü',
        titleEn: 'Nature Walk',
        description: 'walk, river, bridge, stone, leaf',
        order: 6,
        xpReward: 40,
        vocabulary: ['walk', 'river', 'bridge', 'stone', 'leaf'],
      },
    ],
    collectibles: [
      {
        id: 'spring-butterfly',
        name: 'Gökkuşağı Kelebek',
        nameEn: 'Rainbow Butterfly',
        emoji: '🦋',
        rarity: 'uncommon',
        description: 'Rengarenk kanatları var!',
        obtainMethod: 'lesson-complete',
        lessonId: 'spring-2',
      },
      {
        id: 'spring-flower',
        name: 'Sihirli Çiçek',
        nameEn: 'Magic Flower',
        emoji: '🌺',
        rarity: 'rare',
        description: 'Her gün farklı renk açıyor!',
        obtainMethod: 'daily-login',
      },
      {
        id: 'spring-trophy',
        name: 'Doğa Kaşifi',
        nameEn: 'Nature Explorer',
        emoji: '🌿',
        rarity: 'epic',
        description: 'Tüm bahar derslerini tamamladın!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ☀️ SUMMER — Haziran
  // ═══════════════════════════════════════════════════════════
  {
    id: 'summer',
    name: 'Yaz Macerası',
    nameEn: 'Beach & Travel',
    description: 'Yaz, plaj ve seyahat kelimelerini öğren!',
    descriptionEn: 'Learn words about summer, beach and travel!',
    emoji: '☀️',
    theme: 'summer',
    colors: ['#f59e0b', '#92400e'],
    startMonth: 6,
    startDay: 15,
    endMonth: 6,
    endDay: 21,
    durationDays: 7,
    xpMultiplier: 1.5,
    lessons: [
      {
        id: 'summer-1',
        title: 'Plaj',
        titleEn: 'Beach',
        description: 'beach, sand, wave, shell, sunscreen',
        order: 1,
        xpReward: 30,
        vocabulary: ['beach', 'sand', 'wave', 'shell', 'sunscreen'],
      },
      {
        id: 'summer-2',
        title: 'Yüzme',
        titleEn: 'Swimming',
        description: 'swim, pool, dive, float, splash',
        order: 2,
        xpReward: 30,
        vocabulary: ['swim', 'pool', 'dive', 'float', 'splash'],
      },
      {
        id: 'summer-3',
        title: 'Dondurma',
        titleEn: 'Ice Cream',
        description: 'ice cream, cone, flavor, chocolate, vanilla',
        order: 3,
        xpReward: 35,
        vocabulary: ['ice cream', 'cone', 'flavor', 'chocolate', 'vanilla'],
      },
      {
        id: 'summer-4',
        title: 'Seyahat',
        titleEn: 'Travel',
        description: 'airplane, suitcase, passport, map, ticket',
        order: 4,
        xpReward: 35,
        vocabulary: ['airplane', 'suitcase', 'passport', 'map', 'ticket'],
      },
      {
        id: 'summer-5',
        title: 'Kamp',
        titleEn: 'Camping',
        description: 'tent, campfire, marshmallow, stars, sleeping bag',
        order: 5,
        xpReward: 35,
        vocabulary: ['tent', 'campfire', 'marshmallow', 'stars', 'sleeping bag'],
      },
      {
        id: 'summer-6',
        title: 'Yaz Partisi',
        titleEn: 'Summer Party',
        description: 'barbecue, watermelon, lemonade, music, dance',
        order: 6,
        xpReward: 40,
        vocabulary: ['barbecue', 'watermelon', 'lemonade', 'music', 'dance'],
      },
    ],
    collectibles: [
      {
        id: 'summer-surfboard',
        name: 'Altın Sörf Tahtası',
        nameEn: 'Golden Surfboard',
        emoji: '🏄',
        rarity: 'uncommon',
        description: 'Dalgalara hazır!',
        obtainMethod: 'lesson-complete',
        lessonId: 'summer-2',
      },
      {
        id: 'summer-sunglasses',
        name: 'Gökkuşağı Gözlük',
        nameEn: 'Rainbow Sunglasses',
        emoji: '🕶️',
        rarity: 'rare',
        description: 'Tüm renklerle dünyayı gör!',
        obtainMethod: 'daily-login',
      },
      {
        id: 'summer-trophy',
        name: 'Yaz Kahramanı',
        nameEn: 'Summer Champion',
        emoji: '🏖️',
        rarity: 'epic',
        description: 'Tüm yaz derslerini bitirdin!',
        obtainMethod: 'event-complete',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 📚 BACK TO SCHOOL — Eylül
  // ═══════════════════════════════════════════════════════════
  {
    id: 'back-to-school',
    name: 'Okula Dönüş',
    nameEn: 'Classroom English',
    description: 'Okul ve sınıf kelimelerini öğren!',
    descriptionEn: 'Learn words about school and classroom!',
    emoji: '📚',
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
        title: 'Okul Eşyaları',
        titleEn: 'School Supplies',
        description: 'pencil, notebook, eraser, ruler, backpack',
        order: 1,
        xpReward: 30,
        vocabulary: ['pencil', 'notebook', 'eraser', 'ruler', 'backpack'],
      },
      {
        id: 'school-2',
        title: 'Sınıf',
        titleEn: 'Classroom',
        description: 'desk, chair, board, teacher, student',
        order: 2,
        xpReward: 30,
        vocabulary: ['desk', 'chair', 'board', 'teacher', 'student'],
      },
      {
        id: 'school-3',
        title: 'Dersler',
        titleEn: 'Subjects',
        description: 'math, science, art, music, reading',
        order: 3,
        xpReward: 35,
        vocabulary: ['math', 'science', 'art', 'music', 'reading'],
      },
      {
        id: 'school-4',
        title: 'Teneffüs',
        titleEn: 'Recess',
        description: 'playground, swing, slide, ball, jump',
        order: 4,
        xpReward: 35,
        vocabulary: ['playground', 'swing', 'slide', 'ball', 'jump'],
      },
      {
        id: 'school-5',
        title: 'Kütüphane',
        titleEn: 'Library',
        description: 'library, book, read, quiet, story',
        order: 5,
        xpReward: 40,
        vocabulary: ['library', 'book', 'read', 'quiet', 'story'],
      },
    ],
    collectibles: [
      {
        id: 'school-pencil',
        name: 'Sihirli Kalem',
        nameEn: 'Magic Pencil',
        emoji: '✏️',
        rarity: 'uncommon',
        description: 'Bu kalem kendi başına yazıyor!',
        obtainMethod: 'lesson-complete',
        lessonId: 'school-1',
      },
      {
        id: 'school-star',
        name: 'Öğretmen Yıldızı',
        nameEn: 'Teacher Star',
        emoji: '⭐',
        rarity: 'rare',
        description: 'Öğretmenden mükemmel notu aldın!',
        obtainMethod: 'daily-login',
      },
      {
        id: 'school-trophy',
        name: 'Bilgi Şampiyonu',
        nameEn: 'Knowledge Champion',
        emoji: '🎓',
        rarity: 'epic',
        description: 'Tüm okul derslerini tamamladın!',
        obtainMethod: 'event-complete',
      },
    ],
  },
];

/**
 * Get the currently active event based on today's date.
 * Returns undefined if no event is active.
 */
export function getActiveEvent(now = new Date()): SeasonalEvent | undefined {
  const month = now.getMonth() + 1; // 1-indexed
  const day = now.getDate();

  return SEASONAL_EVENTS.find((event) => {
    if (event.startMonth === event.endMonth) {
      return month === event.startMonth && day >= event.startDay && day <= event.endDay;
    }
    // Cross-month events (shouldn't happen with current data, but handles edge case)
    if (month === event.startMonth && day >= event.startDay) return true;
    if (month === event.endMonth && day <= event.endDay) return true;
    return false;
  });
}

/**
 * Get the next upcoming event from today's date.
 */
export function getNextEvent(now = new Date()): SeasonalEvent | undefined {
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Sort events by how far in the future they are
  const sorted = [...SEASONAL_EVENTS].sort((a, b) => {
    const distA = getEventDistance(month, day, a.startMonth, a.startDay);
    const distB = getEventDistance(month, day, b.startMonth, b.startDay);
    return distA - distB;
  });

  // Return the closest future event (skip if it's already active)
  return sorted.find((event) => {
    const dist = getEventDistance(month, day, event.startMonth, event.startDay);
    return dist > 0;
  });
}

function getEventDistance(
  fromMonth: number,
  fromDay: number,
  toMonth: number,
  toDay: number,
): number {
  const fromDays = fromMonth * 31 + fromDay;
  const toDays = toMonth * 31 + toDay;
  const diff = toDays - fromDays;
  return diff > 0 ? diff : diff + 372; // wrap around year
}

/**
 * Get days remaining for an active event.
 */
export function getEventDaysRemaining(event: SeasonalEvent, now = new Date()): number {
  const day = now.getDate();
  return Math.max(0, event.endDay - day + (event.endMonth > now.getMonth() + 1 ? 30 : 0));
}
