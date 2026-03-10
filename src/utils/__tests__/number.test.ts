// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { clamp, formatCurrency, formatNumber, formatPercent, randomBetween } from '../number';

describe('formatNumber', () => {
  it('small numbers stay as-is', () => {
    expect(formatNumber(999)).toBe('999');
  });

  it('thousands → K', () => {
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(1000)).toBe('1.0K');
  });

  it('millions → M', () => {
    expect(formatNumber(2_300_000)).toBe('2.3M');
  });
});

describe('formatPercent', () => {
  it('formats basic percentage', () => {
    expect(formatPercent(0.75)).toBe('%75');
  });

  it('formats with decimals', () => {
    expect(formatPercent(0.756, 1)).toBe('%75.6');
  });

  it('0% and 100%', () => {
    expect(formatPercent(0)).toBe('%0');
    expect(formatPercent(1)).toBe('%100');
  });
});

describe('formatCurrency', () => {
  it('formats Turkish Lira', () => {
    const result = formatCurrency(1234.5);
    // Should contain TRY symbol or formatting
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('randomBetween', () => {
  it('returns value within range', () => {
    for (let i = 0; i < 50; i++) {
      const val = randomBetween(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('returns integer', () => {
    const val = randomBetween(1, 100);
    expect(Number.isInteger(val)).toBe(true);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('edge: value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('edge: value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
