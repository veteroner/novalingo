/**
 * Collectible Grant Service
 *
 * Handles granting collectibles to children:
 * - Boss lesson → guaranteed rare+ collectible
 * - Every 10 lessons → random collectible
 * - Streak milestones → special collectible
 */

import { db, serverTimestamp } from '../utils/admin';

/** All collectible IDs grouped by rarity for weighted random selection */
const COMMON_IDS = [
  'animal-puppy',
  'animal-kitten',
  'animal-bunny',
  'flag-uk',
  'flag-usa',
  'flag-canada',
  'sticker-star',
  'sticker-rainbow',
  'sticker-heart',
  'sticker-sparkles',
  'char-wizard',
  'char-fairy',
  'char-robot',
  'land-bigben',
  'land-statue',
  'land-bridge',
  'food-pizza',
  'food-icecream',
  'food-cookie',
  'vehicle-car',
  'vehicle-bus',
  'vehicle-train',
];

const UNCOMMON_IDS = [
  'animal-panda',
  'animal-dolphin',
  'flag-australia',
  'flag-ireland',
  'sticker-fire',
  'char-astronaut',
  'char-ninja',
  'land-castle',
  'land-ferriswheel',
  'food-cupcake',
  'food-donut',
  'vehicle-airplane',
  'vehicle-ship',
];

const RARE_IDS = [
  'animal-owl',
  'flag-newzealand',
  'flag-southafrica',
  'sticker-trophy',
  'char-superhero',
  'land-pyramid',
  'food-cake',
  'food-candy',
  'vehicle-helicopter',
];

const EPIC_IDS = ['animal-unicorn', 'sticker-crown', 'char-mermaid', 'vehicle-rocket'];

const LEGENDARY_IDS = ['animal-dragon', 'land-globe'];

/** Pick a weighted random collectible (common items more likely) */
function pickRandomCollectible(ownedIds: Set<string>): string {
  const POOLS: Array<{ ids: string[]; weight: number }> = [
    { ids: COMMON_IDS, weight: 50 },
    { ids: UNCOMMON_IDS, weight: 25 },
    { ids: RARE_IDS, weight: 15 },
    { ids: EPIC_IDS, weight: 7 },
    { ids: LEGENDARY_IDS, weight: 3 },
  ];

  const totalWeight = POOLS.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const pool of POOLS) {
    roll -= pool.weight;
    if (roll <= 0) {
      const available = pool.ids.filter((id) => !ownedIds.has(id));
      if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
      }
      // All owned in this rarity, try next
    }
  }

  // Fallback: pick any not-owned item
  const allIds = [...COMMON_IDS, ...UNCOMMON_IDS, ...RARE_IDS, ...EPIC_IDS, ...LEGENDARY_IDS];
  const available = allIds.filter((id) => !ownedIds.has(id));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // All owned — give a random one (duplicate)
  return allIds[Math.floor(Math.random() * allIds.length)];
}

/** Pick a rare+ collectible (for boss lessons) */
function pickRareCollectible(ownedIds: Set<string>): string {
  const rarePool = [...RARE_IDS, ...EPIC_IDS, ...LEGENDARY_IDS];
  const available = rarePool.filter((id) => !ownedIds.has(id));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return rarePool[Math.floor(Math.random() * rarePool.length)];
}

/** Get set of already-owned collectible IDs */
async function getOwnedIds(childId: string): Promise<Set<string>> {
  const snap = await db.collection(`children/${childId}/inventory`).get();
  return new Set(snap.docs.map((d) => d.id));
}

export interface GrantResult {
  collectibleId: string;
  isNew: boolean;
}

/**
 * Grant a random collectible to a child.
 * Returns the granted collectible ID.
 */
export async function grantRandomCollectible(
  childId: string,
  source: 'lesson' | 'achievement' | 'shop' | 'wheel' | 'event',
): Promise<GrantResult> {
  const ownedIds = await getOwnedIds(childId);
  const collectibleId = pickRandomCollectible(ownedIds);
  const isNew = !ownedIds.has(collectibleId);

  await db.doc(`children/${childId}/inventory/${collectibleId}`).set({
    itemId: collectibleId,
    obtainedAt: serverTimestamp(),
    obtainedFrom: source,
  });

  console.log(`Collectible granted: child=${childId}, item=${collectibleId}, new=${isNew}`);
  return { collectibleId, isNew };
}

/**
 * Grant a rare+ collectible (for boss lessons).
 */
export async function grantRareCollectible(
  childId: string,
  source: 'lesson' | 'achievement' | 'shop' | 'wheel' | 'event',
): Promise<GrantResult> {
  const ownedIds = await getOwnedIds(childId);
  const collectibleId = pickRareCollectible(ownedIds);
  const isNew = !ownedIds.has(collectibleId);

  await db.doc(`children/${childId}/inventory/${collectibleId}`).set({
    itemId: collectibleId,
    obtainedAt: serverTimestamp(),
    obtainedFrom: source,
  });

  console.log(`Rare collectible granted: child=${childId}, item=${collectibleId}, new=${isNew}`);
  return { collectibleId, isNew };
}
