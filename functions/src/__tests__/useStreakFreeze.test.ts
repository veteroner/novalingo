/**
 * Tests for useStreakFreeze callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockGet, mockUpdate, mockDocRef } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockGet = vi.fn();
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDocRef = { get: mockGet, update: mockUpdate };
  return { MockHttpsError, mockGet, mockUpdate, mockDocRef };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => mockDocRef),
    runTransaction: vi.fn(async (fn: Function) =>
      fn({
        get: vi.fn(async () => {
          const val = await mockGet();
          return { exists: true, ...val };
        }),
        update: mockUpdate,
      }),
    ),
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
}));

import { useStreakFreeze } from '../callables/useStreakFreeze';

const handler = useStreakFreeze as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string) {
  return { auth: { uid: 'parent-1' }, data: { childId } };
}

describe('useStreakFreeze', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consumes a freeze successfully', async () => {
    mockGet.mockResolvedValue({
      data: () => ({ streak: { freezesAvailable: 3, current: 5, longest: 5, frozenToday: false } }),
    });

    const result = await handler(makeReq('c1'));

    expect(result.freezesRemaining).toBe(2);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('works with exactly 1 freeze remaining', async () => {
    mockGet.mockResolvedValue({
      data: () => ({
        streak: { freezesAvailable: 1, current: 7, longest: 12, frozenToday: false },
      }),
    });

    const result = await handler(makeReq('c1'));
    expect(result.freezesRemaining).toBe(0);
  });

  it('rejects when no freezes available', async () => {
    mockGet.mockResolvedValue({
      data: () => ({ streak: { freezesAvailable: 0, current: 3, longest: 3, frozenToday: false } }),
    });

    await expect(handler(makeReq('c1'))).rejects.toThrow('No streak freezes available');
  });

  it('rejects unauthenticated request', async () => {
    await expect(handler({ auth: null, data: { childId: 'c1' } })).rejects.toThrow();
  });
});
