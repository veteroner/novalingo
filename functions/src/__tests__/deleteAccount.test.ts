/**
 * Tests for deleteAccount callable (COPPA compliance).
 */
import { createHash, randomBytes } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  MockHttpsError,
  mockDocGet,
  mockDocDelete,
  mockDocUpdate,
  mockDeleteUser,
  mockBatchDelete,
  mockBatchCommit,
} = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  return {
    MockHttpsError,
    mockDocGet: vi.fn(),
    mockDocDelete: vi.fn().mockResolvedValue(undefined),
    mockDocUpdate: vi.fn().mockResolvedValue(undefined),
    mockDeleteUser: vi.fn().mockResolvedValue(undefined),
    mockBatchDelete: vi.fn(),
    mockBatchCommit: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

function createEmptyCollectionSnapshot() {
  return { empty: true, docs: [], size: 0 };
}

function makeCollectionRef() {
  return {
    limit: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
    }),
    get: vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
    where: vi.fn().mockReturnThis(),
  };
}

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({
      get: mockDocGet,
      delete: mockDocDelete,
      update: mockDocUpdate,
      collection: vi.fn(() => makeCollectionRef()),
    })),
    collection: vi.fn((path: string) => {
      if (path === 'analytics') {
        return {
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
            }),
          }),
        };
      }
      // children or purchases collection — needs limit() for deleteCollection
      return {
        ...makeCollectionRef(),
        where: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ docs: [] }),
        }),
      };
    }),
    batch: vi.fn(() => ({
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    })),
  },
  auth: { deleteUser: mockDeleteUser },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Authentication required');
    return req.auth.uid;
  }),
}));

import { deleteAccount } from '../callables/deleteAccount';

const handler = deleteAccount as unknown as (
  request: Record<string, unknown>,
) => Promise<{ deleted: boolean }>;

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes account with correct PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + '1234')
      .digest('hex');

    // User doc with PIN set
    mockDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          settings: { parentPinHash: hash, parentPinSalt: salt },
        }),
      })
      // Subsequent doc gets for progress/gamification docs
      .mockResolvedValue({ exists: false, data: () => null });

    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234' },
    });

    expect(result.deleted).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith('user1');
  });

  it('rejects incorrect PIN', async () => {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + '1234')
      .digest('hex');

    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({
        settings: { parentPinHash: hash, parentPinSalt: salt },
      }),
    });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '0000' } })).rejects.toThrow(
      'Incorrect PIN',
    );
  });

  it('rejects non-4-digit PIN', async () => {
    await expect(handler({ auth: { uid: 'user1' }, data: { pin: 'ab' } })).rejects.toThrow(
      'PIN is required to delete account',
    );
  });

  it('throws not-found for missing user', async () => {
    mockDocGet.mockResolvedValue({ exists: false, data: () => null });

    await expect(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow(
      'User not found',
    );
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
  });

  it('handles auth.deleteUser failure gracefully', async () => {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(salt + '1234')
      .digest('hex');

    mockDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({
          settings: { parentPinHash: hash, parentPinSalt: salt },
        }),
      })
      .mockResolvedValue({ exists: false, data: () => null });

    // Simulate auth deletion failure
    mockDeleteUser.mockRejectedValueOnce(new Error('User already deleted'));

    // Should still succeed (deleteUser failure is non-fatal)
    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234' },
    });

    expect(result.deleted).toBe(true);
  });

  it('proceeds with deletion when no PIN is set on account', async () => {
    mockDocGet
      .mockResolvedValueOnce({
        exists: true,
        data: () => ({ settings: {} }),
      })
      .mockResolvedValue({ exists: false, data: () => null });

    const result = await handler({
      auth: { uid: 'user1' },
      data: { pin: '1234' },
    });

    expect(result.deleted).toBe(true);
  });
});
