/**
 * Yaş doğrulaması: doğum tarihi yalnızca cihazda değerlendirilir.
 * Kalıcı olarak tarih/yaş değil, yalnızca güvenli erişim sınıfı tutulur.
 * Bilinmeyen yaş, çocuk oturumu gibi ele alınır.
 */
export type AgeBand = 'minor' | 'adult';
export const AGE_SCREEN_STORAGE_KEY = 'novalingo:age-screen:v1';
let memoryBand: AgeBand | null = null;

export function getAgeBand(): AgeBand | null {
  let stored: string | null;
  try {
    stored = localStorage.getItem(AGE_SCREEN_STORAGE_KEY);
  } catch {
    return memoryBand;
  }
  if (stored === null) return memoryBand;
  try {
    const value: unknown = JSON.parse(stored);
    if (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === 1 &&
      'band' in value &&
      (value.band === 'minor' || value.band === 'adult')
    )
      return value.band;
  } catch {
    // Bozuk veri yetişkin erişimi açamaz.
  }
  return null;
}

export function rememberAgeBand(band: AgeBand): void {
  memoryBand = band;
  try {
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, JSON.stringify({ version: 1, band }));
  } catch {
    // Depolama engelliyse yalnızca bu açılışta geçerlidir.
  }
}

export function isAdultSession(): boolean {
  return getAgeBand() === 'adult';
}

/** Geçersiz/gelecekteki tarihler kabul edilmez; eşik tamamlanmış 18 yaştır. */
export function classifyBirthDate(
  day: string,
  month: string,
  year: string,
  today: Date = new Date(),
): AgeBand | null {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const birth = new Date(y, m - 1, d);
  if (
    y < today.getFullYear() - 120 ||
    birth.getFullYear() !== y ||
    birth.getMonth() !== m - 1 ||
    birth.getDate() !== d ||
    birth > today
  )
    return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() < m - 1 || (today.getMonth() === m - 1 && today.getDate() < d)) age--;
  return age >= 18 ? 'adult' : 'minor';
}
