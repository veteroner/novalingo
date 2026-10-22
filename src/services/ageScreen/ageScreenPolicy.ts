/**
 * Yaş doğrulaması: doğum tarihi yalnızca cihazda değerlendirilir.
 * Tarih/tam yaş tutulmaz; erişim sınıfı ve ilk profil için kaba ders grubu tutulur.
 * Bilinmeyen yaş, çocuk oturumu gibi ele alınır.
 */
import type { AgeGroup } from '@/types/user';

export type AgeBand = 'minor' | 'adult';
export const AGE_SCREEN_STORAGE_KEY = 'novalingo:age-screen:v1';
interface AgeScreenResult {
  band: AgeBand;
  learnerAgeGroup?: AgeGroup;
}
let memoryResult: AgeScreenResult | null = null;

function isAgeGroup(value: unknown): value is AgeGroup {
  return value === 'cubs' || value === 'stars' || value === 'legends';
}

function getAgeScreenResult(): AgeScreenResult | null {
  let stored: string | null;
  try {
    stored = localStorage.getItem(AGE_SCREEN_STORAGE_KEY);
  } catch {
    return memoryResult;
  }
  if (stored === null) return memoryResult;
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
      return {
        band: value.band,
        ...(value.band === 'minor' &&
        'learnerAgeGroup' in value &&
        isAgeGroup(value.learnerAgeGroup)
          ? { learnerAgeGroup: value.learnerAgeGroup }
          : {}),
      };
  } catch {
    // Bozuk veri yetişkin erişimi açamaz.
  }
  return null;
}

export function getAgeBand(): AgeBand | null {
  return getAgeScreenResult()?.band ?? null;
}

/** Adult DOB belongs to the account holder, never automatically to their child. */
export function getLearnerAgeGroup(): AgeGroup | null {
  return getAgeScreenResult()?.learnerAgeGroup ?? null;
}

export function rememberAgeBand(band: AgeBand, learnerAgeGroup?: AgeGroup): void {
  memoryResult = { band, ...(band === 'minor' && learnerAgeGroup ? { learnerAgeGroup } : {}) };
  try {
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, JSON.stringify({ version: 1, ...memoryResult }));
  } catch {
    // Depolama engelliyse yalnızca bu açılışta geçerlidir.
  }
}

/** Consume the suggestion after the first profile; additional children choose their own group. */
export function clearLearnerAgeGroup(): void {
  const band = getAgeBand();
  if (band) rememberAgeBand(band);
}

export function isAdultSession(): boolean {
  return getAgeBand() === 'adult';
}

/** Geçersiz/gelecekteki tarihler kabul edilmez; eşik tamamlanmış 18 yaştır. */
export function assessBirthDate(
  day: string,
  month: string,
  year: string,
  today: Date = new Date(),
): AgeScreenResult | null {
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
  if (age >= 18) return { band: 'adult' };
  const learnerAgeGroup = age <= 6 ? 'cubs' : age <= 9 ? 'stars' : 'legends';
  return { band: 'minor', learnerAgeGroup };
}

export function classifyBirthDate(
  day: string,
  month: string,
  year: string,
  today: Date = new Date(),
): AgeBand | null {
  return assessBirthDate(day, month, year, today)?.band ?? null;
}
