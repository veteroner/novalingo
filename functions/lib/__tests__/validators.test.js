"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for input validation helpers.
 */
const vitest_1 = require("vitest");
const validators_1 = require("../utils/validators");
(0, vitest_1.describe)('validateString', () => {
    (0, vitest_1.it)('trims and returns valid string', () => {
        (0, vitest_1.expect)((0, validators_1.validateString)('  hello  ', 'name', 2, 20)).toBe('hello');
    });
    (0, vitest_1.it)('throws on non-string', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateString)(123, 'name', 2, 20)).toThrow('name must be a string');
    });
    (0, vitest_1.it)('throws on too short', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateString)('a', 'name', 2, 20)).toThrow('name must be 2-20 characters');
    });
    (0, vitest_1.it)('throws on too long', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateString)('a'.repeat(21), 'name', 2, 20)).toThrow('name must be 2-20 characters');
    });
    (0, vitest_1.it)('accepts exact min length', () => {
        (0, vitest_1.expect)((0, validators_1.validateString)('ab', 'name', 2, 20)).toBe('ab');
    });
    (0, vitest_1.it)('accepts exact max length', () => {
        const s = 'a'.repeat(20);
        (0, vitest_1.expect)((0, validators_1.validateString)(s, 'name', 2, 20)).toBe(s);
    });
});
(0, vitest_1.describe)('validateAgeGroup', () => {
    vitest_1.it.each(['cubs', 'stars', 'legends'])('accepts "%s"', (group) => {
        (0, vitest_1.expect)((0, validators_1.validateAgeGroup)(group)).toBe(group);
    });
    (0, vitest_1.it)('throws on invalid value', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateAgeGroup)('toddler')).toThrow('Invalid age group');
    });
    (0, vitest_1.it)('throws on number', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateAgeGroup)(5)).toThrow('Invalid age group');
    });
});
(0, vitest_1.describe)('validateTier', () => {
    vitest_1.it.each(['bronze', 'silver', 'gold', 'diamond', 'master'])('accepts "%s"', (tier) => {
        (0, vitest_1.expect)((0, validators_1.validateTier)(tier)).toBe(tier);
    });
    (0, vitest_1.it)('returns undefined for null/undefined', () => {
        (0, vitest_1.expect)((0, validators_1.validateTier)(undefined)).toBeUndefined();
        (0, vitest_1.expect)((0, validators_1.validateTier)(null)).toBeUndefined();
    });
    (0, vitest_1.it)('throws on invalid tier', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateTier)('platinum')).toThrow('Invalid league tier');
    });
});
(0, vitest_1.describe)('validateId', () => {
    (0, vitest_1.it)('trims and returns valid id', () => {
        (0, vitest_1.expect)((0, validators_1.validateId)('  abc123  ', 'childId')).toBe('abc123');
    });
    (0, vitest_1.it)('throws on empty string', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateId)('', 'childId')).toThrow('childId is required');
    });
    (0, vitest_1.it)('throws on non-string', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateId)(42, 'childId')).toThrow('childId is required');
    });
});
(0, vitest_1.describe)('validatePositiveInt', () => {
    (0, vitest_1.it)('accepts valid integer', () => {
        (0, vitest_1.expect)((0, validators_1.validatePositiveInt)(5, 'count', 100)).toBe(5);
    });
    (0, vitest_1.it)('throws on 0', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validatePositiveInt)(0, 'count', 100)).toThrow('count must be 1-100');
    });
    (0, vitest_1.it)('throws on negative', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validatePositiveInt)(-1, 'count', 100)).toThrow('count must be 1-100');
    });
    (0, vitest_1.it)('throws on exceeding max', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validatePositiveInt)(101, 'count', 100)).toThrow('count must be 1-100');
    });
    (0, vitest_1.it)('throws on float', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validatePositiveInt)(3.5, 'count', 100)).toThrow('count must be 1-100');
    });
    (0, vitest_1.it)('accepts exact max', () => {
        (0, vitest_1.expect)((0, validators_1.validatePositiveInt)(100, 'count', 100)).toBe(100);
    });
});
(0, vitest_1.describe)('validateActivities', () => {
    const validActivity = {
        activityId: 'act1',
        correct: true,
        timeSpentMs: 5000,
        hintsUsed: 0,
        attempts: 1,
    };
    (0, vitest_1.it)('validates a valid activities array', () => {
        const result = (0, validators_1.validateActivities)([validActivity]);
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)(result[0].activityId).toBe('act1');
        (0, vitest_1.expect)(result[0].correct).toBe(true);
    });
    (0, vitest_1.it)('throws on empty array', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateActivities)([])).toThrow('non-empty array');
    });
    (0, vitest_1.it)('throws on non-array', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateActivities)('not-array')).toThrow('non-empty array');
    });
    (0, vitest_1.it)('throws on too many activities', () => {
        const acts = Array.from({ length: 51 }, (_, i) => ({ ...validActivity, activityId: `a${i}` }));
        (0, vitest_1.expect)(() => (0, validators_1.validateActivities)(acts)).toThrow('Too many activities');
    });
    (0, vitest_1.it)('throws on missing activityId', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateActivities)([{ correct: true }])).toThrow('activityId is required');
    });
    (0, vitest_1.it)('coerces numeric values safely', () => {
        const result = (0, validators_1.validateActivities)([
            {
                activityId: 'act1',
                correct: 1, // truthy → true
                timeSpentMs: undefined, // → 0
                hintsUsed: -5, // → 0 (clamped)
                attempts: 0, // → 1 (clamped)
            },
        ]);
        (0, vitest_1.expect)(result[0].correct).toBe(true);
        (0, vitest_1.expect)(result[0].timeSpentMs).toBe(0);
        (0, vitest_1.expect)(result[0].hintsUsed).toBe(0);
        (0, vitest_1.expect)(result[0].attempts).toBe(1);
    });
});
(0, vitest_1.describe)('validateVocabReviews', () => {
    const validReview = { wordId: 'word1', rating: 3, responseTimeMs: 2000 };
    (0, vitest_1.it)('validates valid reviews', () => {
        const result = (0, validators_1.validateVocabReviews)([validReview]);
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)(result[0].wordId).toBe('word1');
        (0, vitest_1.expect)(result[0].rating).toBe(3);
    });
    (0, vitest_1.it)('throws on empty array', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateVocabReviews)([])).toThrow('non-empty array');
    });
    (0, vitest_1.it)('throws on too many reviews', () => {
        const reviews = Array.from({ length: 101 }, (_, i) => ({ ...validReview, wordId: `w${i}` }));
        (0, vitest_1.expect)(() => (0, validators_1.validateVocabReviews)(reviews)).toThrow('Too many reviews');
    });
    (0, vitest_1.it)('throws on invalid rating (0)', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateVocabReviews)([{ wordId: 'w1', rating: 0, responseTimeMs: 100 }])).toThrow('rating must be 1-5');
    });
    (0, vitest_1.it)('throws on invalid rating (6)', () => {
        (0, vitest_1.expect)(() => (0, validators_1.validateVocabReviews)([{ wordId: 'w1', rating: 6, responseTimeMs: 100 }])).toThrow('rating must be 1-5');
    });
});
//# sourceMappingURL=validators.test.js.map