/**
 * Speech Service Tests
 *
 * Tests for pure functions: comparePronunciation, feature detection helpers.
 * Browser APIs (SpeechRecognition, speechSynthesis) are not available in node test env.
 */

import { describe, expect, it } from 'vitest';
import { comparePronunciation } from '../speechService';

describe('comparePronunciation', () => {
  it('should return 1.0 for exact match', () => {
    expect(comparePronunciation('cat', 'cat')).toBe(1.0);
  });

  it('should be case insensitive', () => {
    expect(comparePronunciation('CAT', 'cat')).toBe(1.0);
    expect(comparePronunciation('Cat', 'CAT')).toBe(1.0);
  });

  it('should trim whitespace', () => {
    expect(comparePronunciation('  cat  ', 'cat')).toBe(1.0);
  });

  it('should return 1.0 for acceptable variation match', () => {
    expect(comparePronunciation('colour', 'color', ['colour'])).toBe(1.0);
  });

  it('should return 0.8 for substring match (spoken includes target)', () => {
    expect(comparePronunciation('the cat is here', 'cat')).toBe(0.8);
  });

  it('should return 0.8 for substring match (target includes spoken)', () => {
    expect(comparePronunciation('cat', 'the cat')).toBe(0.8);
  });

  it('should return high similarity for close spelling', () => {
    const score = comparePronunciation('caat', 'cat');
    // With phonetic-aware scoring, close misspellings score high
    expect(score).toBeGreaterThanOrEqual(0.7);
    expect(score).toBeLessThanOrEqual(1.0);
  });

  it('should return low similarity for very different words', () => {
    const score = comparePronunciation('xyz', 'cat');
    expect(score).toBeLessThan(0.5);
  });

  it('should handle empty spoken string gracefully', () => {
    const score = comparePronunciation('', 'cat');
    // Empty is contained in 'cat' → 0.8
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should handle both empty strings', () => {
    // Both empty → includes match → 0.8 (both contain each other)
    expect(comparePronunciation('', '')).toBeGreaterThanOrEqual(0.8);
  });

  it('should return 1.0 when spoken matches any acceptable variation', () => {
    const score = comparePronunciation('grey', 'gray', ['grey', 'grae']);
    expect(score).toBe(1.0);
  });

  it('should use levenshtein for single-char difference', () => {
    // 'dog' vs 'dot' — distance 1, maxLen 3 → 1 - 1/3 ≈ 0.667
    const score = comparePronunciation('dot', 'dog');
    expect(score).toBeCloseTo(0.667, 1);
  });

  it('should give higher score for closer matches', () => {
    const closeScore = comparePronunciation('catt', 'cat');
    const farScore = comparePronunciation('abcdef', 'cat');
    expect(closeScore).toBeGreaterThan(farScore);
  });
});
