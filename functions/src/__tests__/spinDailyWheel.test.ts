/**
 * Tests for spinDailyWheel callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockSpinGet, mockBatchUpdate, mockBatchSet } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockSpinGet = vi.fn();
  const mockBatchUpdate = vi.fn();
  const mockBatchSet = vi.fn();
  return { MockHttpsError, mockSpinGet, mockBatchUpdate, mockBatchSet };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn((path: string) => {
      if (path.includes('/dailySpins/')) return { id: 'spin-ref' };
      return { id: 'child-ref' }; // childRef
    }),
    runTransaction: vi.fn(async (fn: Function) =>
      fn({
        get: vi.fn(async (ref: { id: string }) => {
          if (ref.id === 'spin-ref') return mockSpinGet();
          return { exists: true, data: () => ({}) };
        }),
        update: mockBatchUpdate,
        set: mockBatchSet,
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
  getTodayTR: vi.fn(() => '2026-03-07'),
}));

import { spinDailyWheel } from '../callables/spinDailyWheel';

const handler = spinDailyWheel as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string) {
  return { auth: { uid: 'parent-1' }, data: { childId } };
}

describe('spinDailyWheel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('spins wheel and awards reward', async () => {
    mockSpinGet.mockResolvedValue({ exists: false });

    // Mock Math.random to return a deterministic value
    // First segment stars_10 has weight 25, total ~100 — random 0 picks it
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = await handler(makeReq('c1'));

    expect(result.segmentId).toBe('stars_10');
    expect(result.reward).toEqual({ type: 'stars', amount: 10 });
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockBatchSet).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('rejects when already spun today', async () => {
    mockSpinGet.mockResolvedValue({ exists: true });

    await expect(handler(makeReq('c1'))).rejects.toThrow('Already spun today');
  });

  it('can award streak freeze', async () => {
    mockSpinGet.mockResolvedValue({ exists: false });
    // streak_freeze segment is last, weight 5, total weight = 100
    // Need random ~0.95+ to pick it
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = await handler(makeReq('c1'));

    const reward = result.reward as { type: string; amount: number };
    expect(reward.type).toBe('streak_freeze');
    expect(reward.amount).toBe(1);

    vi.restoreAllMocks();
  });
});
