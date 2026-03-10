/**
 * Tests for deleteChildProfile callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  MockHttpsError,
  mockDelete,
  mockBatchDelete,
  mockBatchCommit,
  mockChildCollection,
  mockUserGet,
  mockUserUpdate,
  mockRemainingGet,
} = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockBatchDelete = vi.fn();
  const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
  const mockChildCollection = vi.fn();
  const mockUserGet = vi.fn();
  const mockUserUpdate = vi.fn().mockResolvedValue(undefined);
  const mockRemainingGet = vi.fn();
  return {
    MockHttpsError,
    mockDelete,
    mockBatchDelete,
    mockBatchCommit,
    mockChildCollection,
    mockUserGet,
    mockUserUpdate,
    mockRemainingGet,
  };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn((path: string) => {
      if (path.startsWith('users/')) {
        return { get: mockUserGet, update: mockUserUpdate };
      }
      // children/{id}
      return {
        delete: mockDelete,
        collection: mockChildCollection,
      };
    }),
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => ({ get: mockRemainingGet })),
      })),
    })),
    batch: vi.fn(() => ({
      delete: mockBatchDelete,
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
}));

vi.mock('../utils/validators', () => ({
  validateId: vi.fn((v: string) => v),
}));

import { deleteChildProfile } from '../callables/deleteChildProfile';

const handler = deleteChildProfile as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string) {
  return { auth: { uid: 'parent-1' }, data: { childId } };
}

describe('deleteChildProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: subcollections are empty
    mockChildCollection.mockReturnValue({
      limit: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
      })),
    });
  });

  it('deletes child and subcollections successfully', async () => {
    const mockSubDoc = { ref: { path: 'children/c1/vocabulary/w1' } };
    // Each subcollection returns one batch of docs, then empty on next call
    let subCallCount = 0;
    mockChildCollection.mockReturnValue({
      limit: vi.fn(() => ({
        get: vi.fn(() => {
          subCallCount++;
          if (subCallCount <= 6) {
            return Promise.resolve({ empty: false, docs: [mockSubDoc] });
          }
          return Promise.resolve({ empty: true, docs: [] });
        }),
      })),
    });

    // User had this child as active, no remaining children
    mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'c1' }) });
    mockRemainingGet.mockResolvedValue({ empty: true, docs: [] });

    const result = await handler(makeReq('c1'));

    expect(result).toEqual({ childId: 'c1', deleted: true });
    expect(mockDelete).toHaveBeenCalledTimes(1);
    // 6 subcollections, each with 1 doc → 6 batch commits
    expect(mockBatchCommit).toHaveBeenCalledTimes(6);
    // Active child cleared to null
    expect(mockUserUpdate).toHaveBeenCalledWith(expect.objectContaining({ activeChildId: null }));
  });

  it('sets remaining child as active after deletion', async () => {
    mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'c1' }) });
    mockRemainingGet.mockResolvedValue({
      empty: false,
      docs: [{ id: 'c2' }],
    });

    await handler(makeReq('c1'));

    expect(mockUserUpdate).toHaveBeenCalledWith(expect.objectContaining({ activeChildId: 'c2' }));
  });

  it('skips user update when deleted child was not active', async () => {
    mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'other' }) });

    await handler(makeReq('c1'));

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ auth: null, data: { childId: 'c1' } })).rejects.toThrow();
  });
});
