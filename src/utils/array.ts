/**
 * Dizi Yardımcıları
 */

/**
 * Fisher-Yates shuffle — diziyi karıştır
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
  }
  return shuffled;
}

/**
 * Diziden rastgele N eleman seç
 */
export function pickRandom<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

/**
 * Diziyi gruplara böl
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Benzersiz elemanlar
 */
export function unique<T>(array: T[], keyFn?: (item: T) => string): T[] {
  if (!keyFn) return [...new Set(array)];
  
  const seen = new Set<string>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
