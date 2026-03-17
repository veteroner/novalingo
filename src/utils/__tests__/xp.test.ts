// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { calculateLevel, calculateStars, calculateXP, xpRequiredForLevel } from '../xp';

// ===== calculateXP =====
describe('calculateXP', () => {
  const baseParams = {
    baseXP: 100,
    accuracy: 1.0,
    durationSeconds: 60,
    estimatedSeconds: 60,
    streak: 0,
    isFirstAttempt: false,
    isPerfect: false,
  };

  it('returns baseXP when no bonuses apply', () => {
    const result = calculateXP({ ...baseParams, accuracy: 0.7 });
    expect(result.base).toBe(100);
    expect(result.accuracyBonus).toBe(0);
    expect(result.speedBonus).toBe(0);
    expect(result.firstTryBonus).toBe(0);
    expect(result.perfectBonus).toBe(0);
    // All users get premium bonus in paid app
    expect(result.premiumBonus).toBe(50);
    expect(result.total).toBe(150);
  });

  it('accuracy bonus applies at 80%+', () => {
    const r1 = calculateXP({ ...baseParams, accuracy: 0.79 });
    expect(r1.accuracyBonus).toBe(0);

    const r2 = calculateXP({ ...baseParams, accuracy: 0.9 });
    // (0.9 - 0.8) * 2.5 * 100 = 25
    expect(r2.accuracyBonus).toBe(25);

    const r3 = calculateXP({ ...baseParams, accuracy: 1.0 });
    // (1.0 - 0.8) * 2.5 * 100 = 50
    expect(r3.accuracyBonus).toBe(50);
  });

  it('speed bonus applies when fast (<=75% of estimated time)', () => {
    // At exactly 75% ratio → bonus = baseXP * 0.25 * (1 - 0.75) = 100 * 0.25 * 0.25 = 6
    const r1 = calculateXP({
      ...baseParams,
      accuracy: 0.7,
      durationSeconds: 45,
      estimatedSeconds: 60,
    });
    expect(r1.speedBonus).toBe(6);

    // Faster → 30s / 60s = 0.5 ratio → 100 * 0.25 * 0.5 = 13
    const r2 = calculateXP({
      ...baseParams,
      accuracy: 0.7,
      durationSeconds: 30,
      estimatedSeconds: 60,
    });
    expect(r2.speedBonus).toBe(13);

    // Slow → no bonus
    const r3 = calculateXP({
      ...baseParams,
      accuracy: 0.7,
      durationSeconds: 50,
      estimatedSeconds: 60,
    });
    expect(r3.speedBonus).toBe(0);
  });

  it('streak multiplier increases with streak (max 2x)', () => {
    const r1 = calculateXP({ ...baseParams, accuracy: 0.7, streak: 10 });
    expect(r1.streakMultiplier).toBe(1.2);

    // 50 streak → 1 + 50*0.02 = 2.0 (max)
    const r2 = calculateXP({ ...baseParams, accuracy: 0.7, streak: 50 });
    expect(r2.streakMultiplier).toBe(2);

    // 60 streak → capped at 2
    const r3 = calculateXP({ ...baseParams, accuracy: 0.7, streak: 60 });
    expect(r3.streakMultiplier).toBe(2);
  });

  it('firstTryBonus = 15% of base', () => {
    const r = calculateXP({ ...baseParams, accuracy: 0.7, isFirstAttempt: true });
    expect(r.firstTryBonus).toBe(15);
  });

  it('perfectBonus = 30% of base', () => {
    const r = calculateXP({ ...baseParams, isPerfect: true });
    expect(r.perfectBonus).toBe(30);
  });

  it('premium bonus always applies (paid app)', () => {
    const r = calculateXP({ ...baseParams, accuracy: 0.7 });
    // base=100, no other bonus, streak=1, withStreak=100, premium=50
    expect(r.premiumBonus).toBe(50);
    expect(r.total).toBe(150);
  });

  it('all bonuses stack correctly', () => {
    const r = calculateXP({
      baseXP: 100,
      accuracy: 1.0,
      durationSeconds: 30,
      estimatedSeconds: 60,
      streak: 10,
      isFirstAttempt: true,
      isPerfect: true,
    });
    // accuracyBonus: round(100 * 0.2 * 2.5) = 50
    expect(r.accuracyBonus).toBe(50);
    // speedBonus: ratio=0.5, round(100 * 0.25 * 0.5) = 13
    expect(r.speedBonus).toBe(13);
    // firstTryBonus: 15
    expect(r.firstTryBonus).toBe(15);
    // perfectBonus: 30
    expect(r.perfectBonus).toBe(30);
    // streakMultiplier: 1 + 10*0.02 = 1.2
    expect(r.streakMultiplier).toBe(1.2);
    // subtotal: 100+50+13+15+30 = 208
    // withStreak: round(208 * 1.2) = 250
    // premiumBonus: round(250 * 0.5) = 125
    // total: 250 + 125 = 375
    expect(r.premiumBonus).toBe(125);
    expect(r.total).toBe(375);
  });
});

// ===== xpRequiredForLevel =====
describe('xpRequiredForLevel', () => {
  it('level 1 requires 0 xp', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it('level 0 or negative returns 0', () => {
    expect(xpRequiredForLevel(0)).toBe(0);
    expect(xpRequiredForLevel(-5)).toBe(0);
  });

  it('level 2 equals base xp (100)', () => {
    // floor(100 * 1.12^1) = floor(112) = 112
    expect(xpRequiredForLevel(2)).toBe(112);
  });

  it('increases with each level', () => {
    const l3 = xpRequiredForLevel(3);
    const l4 = xpRequiredForLevel(4);
    const l5 = xpRequiredForLevel(5);
    expect(l3).toBeGreaterThan(xpRequiredForLevel(2));
    expect(l4).toBeGreaterThan(l3);
    expect(l5).toBeGreaterThan(l4);
  });
});

// ===== calculateLevel =====
describe('calculateLevel', () => {
  it('0 XP → level 1', () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.currentLevelXP).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('exactly enough XP for first levelup → level 2', () => {
    const xpForLvl2 = xpRequiredForLevel(2);
    const result = calculateLevel(xpForLvl2);
    expect(result.level).toBe(2);
    expect(result.currentLevelXP).toBe(0);
  });

  it('mid-level progress is between 0 and 1', () => {
    const xpForLvl2 = xpRequiredForLevel(2);
    const result = calculateLevel(xpForLvl2 + 10);
    expect(result.level).toBe(2);
    expect(result.currentLevelXP).toBe(10);
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
  });

  it('large XP produces high level', () => {
    const result = calculateLevel(100_000);
    expect(result.level).toBeGreaterThan(10);
  });

  it('level never exceeds 100', () => {
    const result = calculateLevel(Number.MAX_SAFE_INTEGER);
    expect(result.level).toBeLessThanOrEqual(100);
  });
});

// ===== calculateStars =====
describe('calculateStars', () => {
  it('score >=95 → 3 stars', () => {
    expect(calculateStars(95)).toBe(3);
    expect(calculateStars(100)).toBe(3);
  });

  it('score >=75 → 2 stars', () => {
    expect(calculateStars(75)).toBe(2);
    expect(calculateStars(94)).toBe(2);
  });

  it('score >=50 → 1 star', () => {
    expect(calculateStars(50)).toBe(1);
    expect(calculateStars(74)).toBe(1);
  });

  it('score <50 → 0 stars', () => {
    expect(calculateStars(49)).toBe(0);
    expect(calculateStars(0)).toBe(0);
  });
});
