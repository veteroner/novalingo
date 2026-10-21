import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AGE_SCREEN_STORAGE_KEY, classifyBirthDate } from './ageScreenPolicy';

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
