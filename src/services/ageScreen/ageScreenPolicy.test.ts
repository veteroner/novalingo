import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AGE_SCREEN_STORAGE_KEY, classifyBirthDate, assessBirthDate } from './ageScreenPolicy';

describe('doğum tarihi doğrulaması', () => {
  const today = new Date(2026, 9, 11, 12);
  it.each([
    ['11', '10', '2008', 'adult'],
    ['12', '10', '2008', 'minor'],
    ['10', '10', '2008', 'adult'],
    ['11', '10', '2013', 'minor'],
    ['11', '10', '2018', 'minor'],
    ['29', '2', '2024', 'minor'],
    ['11', '10', '2026', 'minor'],
    ['31', '4', '2018', null],
    ['29', '2', '2025', null],
    ['12', '10', '2026', null],
    ['1', '13', '2018', null],
    ['0', '10', '2018', null],
    ['', '', '', null],
    ['1e', '10', '2018', null],
    ['11', '10', '9999', null],
  ])('%s/%s/%s => %s', (day, month, year, expected) => {
    expect(classifyBirthDate(day, month, year, today)).toBe(expected);
  });
});

describe('yaş sınıfı saklama', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', window.localStorage);
    localStorage.clear();
    vi.resetModules();
  });
  it('bilinmeyen yaşta yetişkin servisleri kapalıdır', async () => {
    const policy = await import('./ageScreenPolicy');
    expect(policy.getAgeBand()).toBeNull();
    expect(policy.isAdultSession()).toBe(false);
  });
  it('yalnızca sınıfı saklar; doğum tarihi içermez', async () => {
    const policy = await import('./ageScreenPolicy');
    policy.rememberAgeBand('minor');
    expect(JSON.parse(localStorage.getItem(AGE_SCREEN_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      band: 'minor',
    });
    expect(policy.isAdultSession()).toBe(false);
  });
  it.each(['invalid-json', '{"version":0,"band":"adult"}', '{"version":1,"band":"unknown"}'])(
    'bozuk kayıt güvenli kalır: %s',
    async (stored) => {
      const policy = await import('./ageScreenPolicy');
      localStorage.setItem(AGE_SCREEN_STORAGE_KEY, stored);
      expect(policy.isAdultSession()).toBe(false);
    },
  );
});

describe('ilk profil ders grubunu tekrar sormama', () => {
  const today = new Date(2026, 9, 22, 12);
  it.each([
    ['22', '10', '2020', 'cubs'],
    ['23', '10', '2019', 'cubs'],
    ['22', '10', '2019', 'stars'],
    ['23', '10', '2016', 'stars'],
    ['22', '10', '2016', 'legends'],
    ['22', '10', '2009', 'legends'],
  ])('%s/%s/%s için yalnızca kaba ders grubu türetilir', (d, m, y, group) => {
    expect(assessBirthDate(d, m, y, today)).toEqual({ band: 'minor', learnerAgeGroup: group });
  });
  it('yetişkinin tarihinden çocuğun ders grubunu tahmin etmez', () => {
    expect(assessBirthDate('22', '10', '2008', today)).toEqual({ band: 'adult' });
  });
  it('grubu yeniden yüklemede korur, ilk profil tamamlanınca tüketir; erişim sınıfı değişmez', async () => {
    const policy = await import('./ageScreenPolicy');
    policy.rememberAgeBand('minor', 'stars');
    vi.resetModules();
    const reloaded = await import('./ageScreenPolicy');
    expect(reloaded.getLearnerAgeGroup()).toBe('stars');
    expect(JSON.parse(localStorage.getItem(AGE_SCREEN_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      band: 'minor',
      learnerAgeGroup: 'stars',
    });
    reloaded.clearLearnerAgeGroup();
    expect(reloaded.getLearnerAgeGroup()).toBeNull();
    expect(reloaded.isAdultSession()).toBe(false);
  });
  it('eski sürüm kaydı çalışır ama yanlış grup uydurmaz', async () => {
    const policy = await import('./ageScreenPolicy');
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":1,"band":"minor"}');
    expect(policy.getLearnerAgeGroup()).toBeNull();
    expect(policy.getAgeBand()).toBe('minor');
  });
  it('bozuk veya yetişkin kaydından çocuk grubu çıkarmaz', async () => {
    const policy = await import('./ageScreenPolicy');
    for (const record of [
      { version: 1, band: 'adult', learnerAgeGroup: 'stars' },
      { version: 1, band: 'minor', learnerAgeGroup: 'unknown' },
      { version: 0, band: 'minor', learnerAgeGroup: 'stars' },
    ]) {
      localStorage.setItem(AGE_SCREEN_STORAGE_KEY, JSON.stringify(record));
      expect(policy.getLearnerAgeGroup()).toBeNull();
    }
  });
});
