/* eslint-disable */
/**
 * Firestore Seed Script — Collectible Catalog
 *
 * Kullanım: npx ts-node --esm scripts/seedCollectibles.ts
 *
 * Collectible katalog verilerini `collectibles` koleksiyonuna yazar.
 * Emulator veya production Firestore'a yazabilir.
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

// Import catalog inline (ts-node may not resolve path aliases)
const COLLECTIBLE_CATALOG = [
  // ANIMALS (8)
  {
    id: 'animal-puppy',
    name: 'Minik Köpek',
    nameEn: 'Puppy',
    emoji: '🐶',
    category: 'animals',
    rarity: 'common',
    description: 'Sevimli bir yavru köpek!',
    englishFact: 'Dogs can understand about 250 words and gestures.',
  },
  {
    id: 'animal-kitten',
    name: 'Yavru Kedi',
    nameEn: 'Kitten',
    emoji: '🐱',
    category: 'animals',
    rarity: 'common',
    description: 'Tatlı bir yavru kedi!',
    englishFact: 'Cats sleep for about 70% of their lives.',
  },
  {
    id: 'animal-bunny',
    name: 'Tavşan',
    nameEn: 'Bunny',
    emoji: '🐰',
    category: 'animals',
    rarity: 'common',
    description: 'Yumuşak bir tavşan!',
    englishFact: 'Rabbits can turn their ears 180 degrees.',
  },
  {
    id: 'animal-panda',
    name: 'Panda',
    nameEn: 'Panda',
    emoji: '🐼',
    category: 'animals',
    rarity: 'uncommon',
    description: 'Şirin bir panda!',
    englishFact: 'Pandas eat bamboo for up to 14 hours a day.',
  },
  {
    id: 'animal-dolphin',
    name: 'Yunus',
    nameEn: 'Dolphin',
    emoji: '🐬',
    category: 'animals',
    rarity: 'uncommon',
    description: 'Akıllı bir yunus!',
    englishFact: 'Dolphins sleep with one eye open.',
  },
  {
    id: 'animal-owl',
    name: 'Baykuş',
    nameEn: 'Owl',
    emoji: '🦉',
    category: 'animals',
    rarity: 'rare',
    description: 'Bilge bir baykuş!',
    englishFact: 'Owls can rotate their heads 270 degrees.',
  },
  {
    id: 'animal-unicorn',
    name: 'Unicorn',
    nameEn: 'Unicorn',
    emoji: '🦄',
    category: 'animals',
    rarity: 'epic',
    description: 'Efsanevi bir unicorn!',
    englishFact: 'Unicorns are the national animal of Scotland!',
  },
  {
    id: 'animal-dragon',
    name: 'Ejderha',
    nameEn: 'Dragon',
    emoji: '🐉',
    category: 'animals',
    rarity: 'legendary',
    description: 'Güçlü bir ejderha!',
    englishFact: 'In English, we say "Here be dragons" for unknown places on old maps.',
  },
  // FLAGS (7)
  {
    id: 'flag-uk',
    name: 'Birleşik Krallık',
    nameEn: 'United Kingdom',
    emoji: '🇬🇧',
    category: 'flags',
    rarity: 'common',
    description: "İngilizce'nin doğduğu yer!",
    englishFact: 'The UK flag is called the "Union Jack".',
  },
  {
    id: 'flag-usa',
    name: 'Amerika',
    nameEn: 'United States',
    emoji: '🇺🇸',
    category: 'flags',
    rarity: 'common',
    description: '50 yıldızlı bayrak!',
    englishFact: 'The USA flag has 50 stars for 50 states.',
  },
  {
    id: 'flag-canada',
    name: 'Kanada',
    nameEn: 'Canada',
    emoji: '🇨🇦',
    category: 'flags',
    rarity: 'common',
    description: 'Akçaağaç yapraklı bayrak!',
    englishFact: 'Canada has two official languages: English and French.',
  },
  {
    id: 'flag-australia',
    name: 'Avustralya',
    nameEn: 'Australia',
    emoji: '🇦🇺',
    category: 'flags',
    rarity: 'uncommon',
    description: 'Güney yıldızlı bayrak!',
    englishFact: 'Australia is both a country and a continent.',
  },
  {
    id: 'flag-ireland',
    name: 'İrlanda',
    nameEn: 'Ireland',
    emoji: '🇮🇪',
    category: 'flags',
    rarity: 'uncommon',
    description: 'Yeşil adanın bayrağı!',
    englishFact: 'Ireland is called "The Emerald Isle" because of its green fields.',
  },
  {
    id: 'flag-newzealand',
    name: 'Yeni Zelanda',
    nameEn: 'New Zealand',
    emoji: '🇳🇿',
    category: 'flags',
    rarity: 'rare',
    description: 'Kiwilerin ülkesi!',
    englishFact: 'New Zealand was the first country to give women the right to vote.',
  },
  {
    id: 'flag-southafrica',
    name: 'Güney Afrika',
    nameEn: 'South Africa',
    emoji: '🇿🇦',
    category: 'flags',
    rarity: 'rare',
    description: '11 resmi dilli ülke!',
    englishFact: 'South Africa has 11 official languages, including English.',
  },
  // STICKERS (7)
  {
    id: 'sticker-star',
    name: 'Altın Yıldız',
    nameEn: 'Gold Star',
    emoji: '⭐',
    category: 'stickers',
    rarity: 'common',
    description: 'Parlayan bir yıldız!',
    englishFact: '"You\'re a star!" means you did an amazing job.',
  },
  {
    id: 'sticker-rainbow',
    name: 'Gökkuşağı',
    nameEn: 'Rainbow',
    emoji: '🌈',
    category: 'stickers',
    rarity: 'common',
    description: 'Renkli bir gökkuşağı!',
    englishFact: 'Rainbows always have 7 colors: red, orange, yellow, green, blue, indigo, violet.',
  },
  {
    id: 'sticker-heart',
    name: 'Kalp',
    nameEn: 'Heart',
    emoji: '❤️',
    category: 'stickers',
    rarity: 'common',
    description: 'Kocaman bir kalp!',
    englishFact: '"Heart" can also mean courage: "Have a heart!"',
  },
  {
    id: 'sticker-sparkles',
    name: 'Işıltılar',
    nameEn: 'Sparkles',
    emoji: '✨',
    category: 'stickers',
    rarity: 'common',
    description: 'Parıl parıl ışıltılar!',
    englishFact: '"Sparkle" means to shine with bright flashes of light.',
  },
  {
    id: 'sticker-fire',
    name: 'Ateş',
    nameEn: 'Fire',
    emoji: '🔥',
    category: 'stickers',
    rarity: 'uncommon',
    description: 'Alev alev!',
    englishFact: '"You\'re on fire!" means you\'re doing really well.',
  },
  {
    id: 'sticker-trophy',
    name: 'Kupa',
    nameEn: 'Trophy',
    emoji: '🏆',
    category: 'stickers',
    rarity: 'rare',
    description: 'Şampiyonluk kupası!',
    englishFact: 'The word "trophy" comes from Greek "tropaion" meaning a sign of victory.',
  },
  {
    id: 'sticker-crown',
    name: 'Taç',
    nameEn: 'Crown',
    emoji: '👑',
    category: 'stickers',
    rarity: 'epic',
    description: 'Kralların tacı!',
    englishFact: '"Crown jewels" refers to the most valuable possessions.',
  },
  // CHARACTERS (7)
  {
    id: 'char-wizard',
    name: 'Büyücü',
    nameEn: 'Wizard',
    emoji: '🧙',
    category: 'characters',
    rarity: 'common',
    description: 'Sihirli bir büyücü!',
    englishFact: '"Wizard" originally meant "a wise person" in old English.',
  },
  {
    id: 'char-fairy',
    name: 'Peri',
    nameEn: 'Fairy',
    emoji: '🧚',
    category: 'characters',
    rarity: 'common',
    description: 'Tatlı bir peri!',
    englishFact: 'Fairies in English stories often grant wishes.',
  },
  {
    id: 'char-robot',
    name: 'Robot',
    nameEn: 'Robot',
    emoji: '🤖',
    category: 'characters',
    rarity: 'common',
    description: 'Akıllı bir robot!',
    englishFact: 'The word "robot" comes from Czech "robota" meaning forced labor.',
  },
  {
    id: 'char-astronaut',
    name: 'Astronot',
    nameEn: 'Astronaut',
    emoji: '🧑‍🚀',
    category: 'characters',
    rarity: 'uncommon',
    description: 'Uzay kaşifi!',
    englishFact: '"Astronaut" means "star sailor" in Greek.',
  },
  {
    id: 'char-ninja',
    name: 'Ninja',
    nameEn: 'Ninja',
    emoji: '🥷',
    category: 'characters',
    rarity: 'uncommon',
    description: 'Gizli bir ninja!',
    englishFact: 'Ninjas were also called "shinobi" which means "to steal away".',
  },
  {
    id: 'char-superhero',
    name: 'Süper Kahraman',
    nameEn: 'Superhero',
    emoji: '🦸',
    category: 'characters',
    rarity: 'rare',
    description: 'Güçlü bir süper kahraman!',
    englishFact: '"Superhero" combines "super" (above) and "hero" (brave person).',
  },
  {
    id: 'char-mermaid',
    name: 'Deniz Kızı',
    nameEn: 'Mermaid',
    emoji: '🧜‍♀️',
    category: 'characters',
    rarity: 'epic',
    description: 'Gizemli bir deniz kızı!',
    englishFact: '"Mermaid" comes from "mere" (sea) + "maid" (girl).',
  },
  // LANDMARKS (7)
  {
    id: 'land-bigben',
    name: 'Big Ben',
    nameEn: 'Big Ben',
    emoji: '🏛️',
    category: 'landmarks',
    rarity: 'common',
    description: "Londra'nın ünlü saat kulesi!",
    englishFact: 'Big Ben is actually the name of the bell, not the tower!',
  },
  {
    id: 'land-statue',
    name: 'Özgürlük Heykeli',
    nameEn: 'Statue of Liberty',
    emoji: '🗽',
    category: 'landmarks',
    rarity: 'common',
    description: "New York'un simgesi!",
    englishFact: 'The Statue of Liberty was a gift from France to the United States.',
  },
  {
    id: 'land-bridge',
    name: 'Londra Köprüsü',
    nameEn: 'London Bridge',
    emoji: '🌉',
    category: 'landmarks',
    rarity: 'common',
    description: 'Ünlü Londra Köprüsü!',
    englishFact:
      '"London Bridge is falling down" is one of the most famous English nursery rhymes.',
  },
  {
    id: 'land-castle',
    name: 'Kale',
    nameEn: 'Castle',
    emoji: '🏰',
    category: 'landmarks',
    rarity: 'uncommon',
    description: 'Masalsı bir kale!',
    englishFact: 'England has over 1,500 castle sites!',
  },
  {
    id: 'land-ferriswheel',
    name: 'London Eye',
    nameEn: 'London Eye',
    emoji: '🎡',
    category: 'landmarks',
    rarity: 'uncommon',
    description: "Londra'nın dönme dolabı!",
    englishFact: 'The London Eye is 135 meters tall and takes 30 minutes to go around.',
  },
  {
    id: 'land-pyramid',
    name: 'Piramit',
    nameEn: 'Pyramid',
    emoji: '🏗️',
    category: 'landmarks',
    rarity: 'rare',
    description: 'Antik bir piramit!',
    englishFact: '"Pyramid" comes from the Greek word "pyramis" meaning wheat cake.',
  },
  {
    id: 'land-globe',
    name: 'Dünya',
    nameEn: 'Globe',
    emoji: '🌍',
    category: 'landmarks',
    rarity: 'legendary',
    description: 'Tüm dünyayı kucaklıyorsun!',
    englishFact: 'English is spoken as a first or second language in over 60 countries.',
  },
  // FOODS (7)
  {
    id: 'food-pizza',
    name: 'Pizza',
    nameEn: 'Pizza',
    emoji: '🍕',
    category: 'foods',
    rarity: 'common',
    description: 'Lezzetli bir pizza dilimi!',
    englishFact: 'Americans eat about 100 acres of pizza every day!',
  },
  {
    id: 'food-icecream',
    name: 'Dondurma',
    nameEn: 'Ice Cream',
    emoji: '🍦',
    category: 'foods',
    rarity: 'common',
    description: 'Soğuk ve tatlı!',
    englishFact: 'The most popular ice cream flavor in the world is vanilla.',
  },
  {
    id: 'food-cookie',
    name: 'Kurabiye',
    nameEn: 'Cookie',
    emoji: '🍪',
    category: 'foods',
    rarity: 'common',
    description: 'Çıtır çıtır bir kurabiye!',
    englishFact: '"Cookie" comes from the Dutch word "koekje" meaning little cake.',
  },
  {
    id: 'food-cupcake',
    name: 'Cupcake',
    nameEn: 'Cupcake',
    emoji: '🧁',
    category: 'foods',
    rarity: 'uncommon',
    description: 'Minik bir pasta!',
    englishFact: 'Cupcakes were first called "number cakes" because of their simple recipe.',
  },
  {
    id: 'food-donut',
    name: 'Donut',
    nameEn: 'Donut',
    emoji: '🍩',
    category: 'foods',
    rarity: 'uncommon',
    description: 'Tatlı bir donut!',
    englishFact: '"Donut" can also be spelled "doughnut" — both are correct!',
  },
  {
    id: 'food-cake',
    name: 'Pasta',
    nameEn: 'Cake',
    emoji: '🎂',
    category: 'foods',
    rarity: 'rare',
    description: 'Kutlama pastası!',
    englishFact: '"A piece of cake" means something very easy to do.',
  },
  {
    id: 'food-candy',
    name: 'Şeker',
    nameEn: 'Candy',
    emoji: '🍬',
    category: 'foods',
    rarity: 'rare',
    description: 'Renkli şekerlemeler!',
    englishFact: 'In British English, candy is usually called "sweets".',
  },
  // VEHICLES (7)
  {
    id: 'vehicle-car',
    name: 'Araba',
    nameEn: 'Car',
    emoji: '🚗',
    category: 'vehicles',
    rarity: 'common',
    description: 'Kırmızı bir araba!',
    englishFact: '"Car" comes from the Latin word "carrus" meaning wheeled vehicle.',
  },
  {
    id: 'vehicle-bus',
    name: 'Otobüs',
    nameEn: 'Bus',
    emoji: '🚌',
    category: 'vehicles',
    rarity: 'common',
    description: 'Sarı bir okul otobüsü!',
    englishFact: "London's famous red double-decker buses have been running since 1829!",
  },
  {
    id: 'vehicle-train',
    name: 'Tren',
    nameEn: 'Train',
    emoji: '🚂',
    category: 'vehicles',
    rarity: 'common',
    description: 'Düt düüt! Tren geliyor!',
    englishFact: 'The first passenger train ran in England in 1825.',
  },
  {
    id: 'vehicle-airplane',
    name: 'Uçak',
    nameEn: 'Airplane',
    emoji: '✈️',
    category: 'vehicles',
    rarity: 'uncommon',
    description: 'Göklerde bir uçak!',
    englishFact: 'The Wright brothers made the first powered flight in 1903.',
  },
  {
    id: 'vehicle-ship',
    name: 'Gemi',
    nameEn: 'Ship',
    emoji: '🚢',
    category: 'vehicles',
    rarity: 'uncommon',
    description: 'Büyük bir gemi!',
    englishFact: '"Ship" and "boat" are different — ships are bigger and go on oceans.',
  },
  {
    id: 'vehicle-helicopter',
    name: 'Helikopter',
    nameEn: 'Helicopter',
    emoji: '🚁',
    category: 'vehicles',
    rarity: 'rare',
    description: 'Pervane döndü, hazır!',
    englishFact: '"Helicopter" comes from Greek: "heliko" (spiral) + "pteron" (wing).',
  },
  {
    id: 'vehicle-rocket',
    name: 'Roket',
    nameEn: 'Rocket',
    emoji: '🚀',
    category: 'vehicles',
    rarity: 'epic',
    description: 'Uzaya fırla!',
    englishFact: '"It\'s not rocket science" means something is not difficult.',
  },
];

async function seedCollectibles() {
  console.log('🎁 Seeding collectible catalog...\n');

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`📡 Using emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }

  const batch = db.batch();
  let count = 0;

  for (const item of COLLECTIBLE_CATALOG) {
    const ref = db.collection('collectibles').doc(item.id);
    batch.set(ref, {
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ Seeded ${count} collectibles across 7 categories`);

  // Print summary
  const categories = [
    'animals',
    'flags',
    'stickers',
    'characters',
    'landmarks',
    'foods',
    'vehicles',
  ];
  for (const cat of categories) {
    const items = COLLECTIBLE_CATALOG.filter((c) => c.category === cat);
    console.log(`  ${cat}: ${items.length} items`);
  }

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  console.log('\nRarity distribution:');
  for (const r of rarities) {
    const items = COLLECTIBLE_CATALOG.filter((c) => c.rarity === r);
    console.log(`  ${r}: ${items.length}`);
  }
}

seedCollectibles()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
