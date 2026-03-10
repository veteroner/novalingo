/**
 * Zaman Formatlama Yardımcıları
 */

/**
 * Saniyeyi "M:SS" formatına çevir
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Saniyeyi "Xdk Ysn" formatına çevir
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) return `${secs}sn`;
  if (secs === 0) return `${minutes}dk`;
  return `${minutes}dk ${secs}sn`;
}

/**
 * Bugünün tarihini YYYY-MM-DD olarak al
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

/**
 * İki tarih arasındaki gün farkı
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Göreceli zaman — "2 saat önce", "3 gün önce"
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'az önce';
  if (diffMin < 60) return `${diffMin} dakika önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay < 7) return `${diffDay} gün önce`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} hafta önce`;
  return `${Math.floor(diffDay / 30)} ay önce`;
}
