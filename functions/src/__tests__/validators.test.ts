/**
 * Tests for input validation helpers.
 */
import { describe, expect, it } from 'vitest';
import {
  validateActivities,
  validateAgeGroup,
  validateId,
  validatePositiveInt,
  validateString,
  validateTier,
  validateVocabReviews,
} from '../utils/validators';

describe('validateString', () => {
  it('trims and returns valid string', () => {
    expect(validateString('  hello  ', 'name', 2, 20)).toBe('hello');
  });

  it('throws on non-string', () => {
    expect(() => validateString(123, 'name', 2, 20)).toThrow('name must be a string');
  });

  it('throws on too short', () => {
    expect(() => validateString('a', 'name', 2, 20)).toThrow('name must be 2-20 characters');
  });

  it('throws on too long', () => {
    expect(() => validateString('a'.repeat(21), 'name', 2, 20)).toThrow(
      'name must be 2-20 characters',
    );
  });

  it('accepts exact min length', () => {
    expect(validateString('ab', 'name', 2, 20)).toBe('ab');
  });

  it('accepts exact max length', () => {
    const s = 'a'.repeat(20);
    expect(validateString(s, 'name', 2, 20)).toBe(s);
  });
});

describe('validateAgeGroup', () => {
  it.each(['cubs', 'stars', 'legends'])('accepts "%s"', (group) => {
    expect(validateAgeGroup(group)).toBe(group);
  });

  it('throws on invalid value', () => {
    expect(() => validateAgeGroup('toddler')).toThrow('Invalid age group');
  });

  it('throws on number', () => {
    expect(() => validateAgeGroup(5)).toThrow('Invalid age group');
  });
});

describe('validateTier', () => {
  it.each(['bronze', 'silver', 'gold', 'diamond', 'master'])('accepts "%s"', (tier) => {
    expect(validateTier(tier)).toBe(tier);
  });

  it('returns undefined for null/undefined', () => {
    expect(validateTier(undefined)).toBeUndefined();
    expect(validateTier(null)).toBeUndefined();
  });

  it('throws on invalid tier', () => {
    expect(() => validateTier('platinum')).toThrow('Invalid league tier');
  });
});

describe('validateId', () => {
  it('trims and returns valid id', () => {
    expect(validateId('  abc123  ', 'childId')).toBe('abc123');
  });

  it('throws on empty string', () => {
    expect(() => validateId('', 'childId')).toThrow('childId is required');
  });

  it('throws on non-string', () => {
    expect(() => validateId(42, 'childId')).toThrow('childId is required');
  });
});

describe('validatePositiveInt', () => {
  it('accepts valid integer', () => {
    expect(validatePositiveInt(5, 'count', 100)).toBe(5);
  });

  it('throws on 0', () => {
    expect(() => validatePositiveInt(0, 'count', 100)).toThrow('count must be 1-100');
  });

  it('throws on negative', () => {
    expect(() => validatePositiveInt(-1, 'count', 100)).toThrow('count must be 1-100');
  });

  it('throws on exceeding max', () => {
    expect(() => validatePositiveInt(101, 'count', 100)).toThrow('count must be 1-100');
  });

  it('throws on float', () => {
    expect(() => validatePositiveInt(3.5, 'count', 100)).toThrow('count must be 1-100');
  });

  it('accepts exact max', () => {
    expect(validatePositiveInt(100, 'count', 100)).toBe(100);
  });
});

describe('validateActivities', () => {
  const validActivity = {
    activityId: 'act1',
    correct: true,
    timeSpentMs: 5000,
    hintsUsed: 0,
    attempts: 1,
  };

  it('validates a valid activities array', () => {
    const result = validateActivities([validActivity]);
    expect(result).toHaveLength(1);
    expect(result[0].activityId).toBe('act1');
    expect(result[0].correct).toBe(true);
  });

  it('throws on empty array', () => {
    expect(() => validateActivities([])).toThrow('non-empty array');
  });

  it('throws on non-array', () => {
    expect(() => validateActivities('not-array')).toThrow('non-empty array');
  });

  it('throws on too many activities', () => {
    const acts = Array.from({ length: 51 }, (_, i) => ({ ...validActivity, activityId: `a${i}` }));
    expect(() => validateActivities(acts)).toThrow('Too many activities');
  });

  it('throws on missing activityId', () => {
    expect(() => validateActivities([{ correct: true }])).toThrow('activityId is required');
  });

  it('coerces numeric values safely', () => {
    const result = validateActivities([
      {
        activityId: 'act1',
        correct: 1, // truthy → true
        timeSpentMs: undefined, // → 0
        hintsUsed: -5, // → 0 (clamped)
        attempts: 0, // → 1 (clamped)
      },
    ]);
    expect(result[0].correct).toBe(true);
    expect(result[0].timeSpentMs).toBe(0);
    expect(result[0].hintsUsed).toBe(0);
    expect(result[0].attempts).toBe(1);
  });
});

describe('validateVocabReviews', () => {
  const validReview = { wordId: 'word1', rating: 3, responseTimeMs: 2000 };

  it('validates valid reviews', () => {
    const result = validateVocabReviews([validReview]);
    expect(result).toHaveLength(1);
    expect(result[0].wordId).toBe('word1');
    expect(result[0].rating).toBe(3);
  });

  it('throws on empty array', () => {
    expect(() => validateVocabReviews([])).toThrow('non-empty array');
  });

  it('throws on too many reviews', () => {
    const reviews = Array.from({ length: 101 }, (_, i) => ({ ...validReview, wordId: `w${i}` }));
    expect(() => validateVocabReviews(reviews)).toThrow('Too many reviews');
  });

  it('throws on invalid rating (0)', () => {
    expect(() => validateVocabReviews([{ wordId: 'w1', rating: 0, responseTimeMs: 100 }])).toThrow(
      'rating must be 1-5',
    );
  });

  it('throws on invalid rating (6)', () => {
    expect(() => validateVocabReviews([{ wordId: 'w1', rating: 6, responseTimeMs: 100 }])).toThrow(
      'rating must be 1-5',
    );
  });
});
