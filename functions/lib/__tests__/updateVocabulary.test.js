"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for updateVocabulary callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockVocabGet, mockBatchSet, mockBatchUpdate, mockBatchCommit } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockVocabGet = vitest_1.vi.fn();
    const mockBatchSet = vitest_1.vi.fn();
    const mockBatchUpdate = vitest_1.vi.fn();
    const mockBatchCommit = vitest_1.vi.fn().mockResolvedValue(undefined);
    return { MockHttpsError, mockVocabGet, mockBatchSet, mockBatchUpdate, mockBatchCommit };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({ get: mockVocabGet, id: 'ref' })),
        batch: vitest_1.vi.fn(() => ({
            set: mockBatchSet,
            update: mockBatchUpdate,
            commit: mockBatchCommit,
        })),
    },
    REGION: 'europe-west1',
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Auth required');
        return req.auth.uid;
    }),
    requireChildOwnership: vitest_1.vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TS'),
    increment: vitest_1.vi.fn((val) => `increment(${val})`),
    getTodayTR: vitest_1.vi.fn(() => '2026-03-07'),
}));
vitest_1.vi.mock('../utils/validators', () => ({
    validateId: vitest_1.vi.fn((v) => v),
    validateVocabReviews: vitest_1.vi.fn((v) => v),
}));
vitest_1.vi.mock('../services/srsEngine', () => ({
    createCard: vitest_1.vi.fn((wordId, date) => ({
        wordId,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: date,
        status: 'learning',
    })),
    reviewCard: vitest_1.vi.fn((card, rating) => ({
        ...card,
        interval: rating >= 4 ? 10 : 1,
        status: rating >= 4 ? 'mastered' : 'learning',
    })),
}));
const updateVocabulary_1 = require("../callables/updateVocabulary");
const handler = updateVocabulary_1.updateVocabulary;
function makeReq(childId, reviews) {
    return { auth: { uid: 'parent-1' }, data: { childId, reviews } };
}
(0, vitest_1.describe)('updateVocabulary', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('creates new card for unknown word', async () => {
        mockVocabGet.mockResolvedValue({ exists: false });
        const result = await handler(makeReq('c1', [{ wordId: 'w1', rating: 3, responseTimeMs: 2000 }]));
        (0, vitest_1.expect)(result.updated).toBe(1);
        (0, vitest_1.expect)(mockBatchSet).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockBatchCommit).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('updates existing card', async () => {
        mockVocabGet.mockResolvedValue({
            exists: true,
            data: () => ({ wordId: 'w1', interval: 3, easeFactor: 2.5, status: 'learning' }),
        });
        const result = await handler(makeReq('c1', [{ wordId: 'w1', rating: 4, responseTimeMs: 1500 }]));
        (0, vitest_1.expect)(result.updated).toBe(1);
    });
    (0, vitest_1.it)('detects newly mastered words', async () => {
        // Existing card is "learning", review rating 4 → mastered
        mockVocabGet.mockResolvedValue({
            exists: true,
            data: () => ({ wordId: 'w1', interval: 3, easeFactor: 2.5, status: 'learning' }),
        });
        const result = await handler(makeReq('c1', [{ wordId: 'w1', rating: 4, responseTimeMs: 1000 }]));
        (0, vitest_1.expect)(result.mastered.length).toBe(1);
        // Should update child's stats.wordsLearned
        (0, vitest_1.expect)(mockBatchUpdate).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('handles multiple reviews', async () => {
        mockVocabGet.mockResolvedValue({ exists: false });
        const result = await handler(makeReq('c1', [
            { wordId: 'w1', rating: 2, responseTimeMs: 3000 },
            { wordId: 'w2', rating: 4, responseTimeMs: 1000 },
            { wordId: 'w3', rating: 3, responseTimeMs: 2000 },
        ]));
        (0, vitest_1.expect)(result.updated).toBe(3);
        (0, vitest_1.expect)(mockBatchSet).toHaveBeenCalledTimes(3);
    });
});
//# sourceMappingURL=updateVocabulary.test.js.map