/**
 * Sayı Formatlama Yardımcıları
 */

/**
 * Büyük sayıları kısalt: 1000 → 1K, 1500000 → 1.5M
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Yüzdelik formatlama
 */
export function formatPercent(value: number, decimals = 0): string {
  return `%${(value * 100).toFixed(decimals)}`;
}

/**
 * Para formatı (TL)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Rastgele sayı (min-max dahil)
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Değeri min-max aralığına sıkıştır
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
