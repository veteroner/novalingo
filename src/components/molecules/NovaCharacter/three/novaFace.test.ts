import { describe, expect, it } from 'vitest';
import { lidWeights, novaBlinkAt } from './novaFace';
describe('natural eyelid controls', () => {
  it('has a fast full closure, a softer reopening, and long open intervals', () => {
    expect(novaBlinkAt(1)).toBe(0);
    expect(novaBlinkAt(2.8)).toBe(0);
    expect(novaBlinkAt(2.875)).toBe(1);
    expect(novaBlinkAt(2.92)).toBeGreaterThan(0.9);
    expect(novaBlinkAt(3.05)).toBeCloseTo(0);
    expect(novaBlinkAt(6.48)).toBe(1);
    expect(novaBlinkAt(6.8)).toBe(1);
    expect(novaBlinkAt(15.1 + 2.875)).toBe(1);
  });
  it('interpolates only adjacent conformed shells with bounded total weight', () => {
    expect(lidWeights(0)).toEqual([0, 0, 0, 0]);
    expect(lidWeights(0.5)).toEqual([0, 1, 0, 0]);
    expect(lidWeights(0.875)).toEqual([0, 0, 0.5, 0.5]);
    expect(lidWeights(1)).toEqual([0, 0, 0, 1]);
    for (let i = 0; i <= 100; i++) {
      const w = lidWeights(i / 100);
      expect(w.every((n) => n >= 0 && n <= 1)).toBe(true);
      expect(w.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1.0000001);
    }
  });
});
