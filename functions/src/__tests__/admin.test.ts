/**
 * Tests for admin utility functions.
 */
import { describe, expect, it } from 'vitest';
import { getTodayTR, requireAuth, xpForLevel } from '../utils/admin';

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('returns 100 for level 2', () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it('returns 175 for level 3', () => {
    expect(xpForLevel(3)).toBe(175);
  });

  it('increases monotonically', () => {
    let prev = 0;
    for (let level = 2; level <= 20; level++) {
      const xp = xpForLevel(level);
      expect(xp).toBeGreaterThan(prev);
      prev = xp;
    }
  });

  it('returns 0 for level 0', () => {
    expect(xpForLevel(0)).toBe(0);
  });
});

describe('getTodayTR', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getTodayTR();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid date', () => {
    const result = getTodayTR();
    const date = new Date(result);
    expect(date.getTime()).not.toBeNaN();
  });
});

describe('requireAuth', () => {
  it('returns uid when authenticated', () => {
    const uid = requireAuth({ auth: { uid: 'user123' } });
    expect(uid).toBe('user123');
  });

  it('throws on missing auth', () => {
    expect(() => requireAuth({})).toThrow('Authentication required');
  });

  it('throws on null auth', () => {
    expect(() => requireAuth({ auth: undefined })).toThrow('Authentication required');
  });

  it('throws on missing uid', () => {
    expect(() => requireAuth({ auth: { uid: '' } })).toThrow('Authentication required');
  });
});
