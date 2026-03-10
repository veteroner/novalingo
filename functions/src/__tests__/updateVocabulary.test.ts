/**
 * Tests for updateVocabulary callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockVocabGet, mockBatchSet, mockBatchUpdate, mockBatchCommit } = vi.hoisted(
  () => {
    class MockHttpsError extends Error {
      code: string;
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
    }
    const mockVocabGet = vi.fn();
    const mockBatchSet = vi.fn();
    const mockBatchUpdate = vi.fn();
    const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
    return { MockHttpsError, mockVocabGet, mockBatchSet, mockBatchUpdate, mockBatchCommit };
  },
);

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({ get: mockVocabGet, id: 'ref' })),
    batch: vi.fn(() => ({
      set: mockBatchSet,
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    })),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  requireChildOwnership: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
  increment: vi.fn((val: number) => `increment(${val})`),
  getTodayTR: vi.fn(() => '2026-03-07'),
}));

vi.mock('../utils/validators', () => ({
  validateId: vi.fn((v: string) => v),
  validateVocabReviews: vi.fn((v: unknown) => v),
}));

vi.mock('../services/srsEngine', () => ({
  createCard: vi.fn((wordId: string, date: string) => ({
    wordId,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: date,
    status: 'learning',
  })),
  reviewCard: vi.fn((card: Record<string, unknown>, rating: number) => ({
    ...card,
    interval: rating >= 4 ? 10 : 1,
    status: rating >= 4 ? 'mastered' : 'learning',
  })),
}));

import { updateVocabulary } from '../callables/updateVocabulary';

const handler = updateVocabulary as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string, reviews: Array<Record<string, unknown>>) {
  return { auth: { uid: 'parent-1' }, data: { childId, reviews } };
}

describe('updateVocabulary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates new card for unknown word', async () => {
    mockVocabGet.mockResolvedValue({ exists: false });

    const result = await handler(
      makeReq('c1', [{ wordId: 'w1', rating: 3, responseTimeMs: 2000 }]),
    );

    expect(result.updated).toBe(1);
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it('updates existing card', async () => {
    mockVocabGet.mockResolvedValue({
      exists: true,
      data: () => ({ wordId: 'w1', interval: 3, easeFactor: 2.5, status: 'learning' }),
    });

    const result = await handler(
      makeReq('c1', [{ wordId: 'w1', rating: 4, responseTimeMs: 1500 }]),
    );

    expect(result.updated).toBe(1);
  });

  it('detects newly mastered words', async () => {
    // Existing card is "learning", review rating 4 → mastered
    mockVocabGet.mockResolvedValue({
      exists: true,
      data: () => ({ wordId: 'w1', interval: 3, easeFactor: 2.5, status: 'learning' }),
    });

    const result = await handler(
      makeReq('c1', [{ wordId: 'w1', rating: 4, responseTimeMs: 1000 }]),
    );

    expect((result.mastered as string[]).length).toBe(1);
    // Should update child's stats.wordsLearned
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
  });

  it('handles multiple reviews', async () => {
    mockVocabGet.mockResolvedValue({ exists: false });

    const result = await handler(
      makeReq('c1', [
        { wordId: 'w1', rating: 2, responseTimeMs: 3000 },
        { wordId: 'w2', rating: 4, responseTimeMs: 1000 },
        { wordId: 'w3', rating: 3, responseTimeMs: 2000 },
      ]),
    );

    expect(result.updated).toBe(3);
    expect(mockBatchSet).toHaveBeenCalledTimes(3);
  });
});
