/**
 * Tests for claimQuestReward callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockQuestGet, mockTxUpdate, mockQuestRef, mockChildRef } = vi.hoisted(
  () => {
    class MockHttpsError extends Error {
      code: string;
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
    }
    const mockQuestGet = vi.fn();
    const mockTxUpdate = vi.fn();
    const mockQuestRef = { id: 'q1' };
    const mockChildRef = { id: 'child-ref' };
    return { MockHttpsError, mockQuestGet, mockTxUpdate, mockQuestRef, mockChildRef };
  },
);

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn((path: string) => {
      if (path.includes('/quests/')) return mockQuestRef;
      return mockChildRef;
    }),
    runTransaction: vi.fn(async (fn: Function) => {
      const tx = {
        get: mockQuestGet,
        update: mockTxUpdate,
      };
      return fn(tx);
    }),
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

import { claimQuestReward } from '../callables/claimQuestReward';

const handler = claimQuestReward as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string, questId: string) {
  return { auth: { uid: 'parent-1' }, data: { childId, questId } };
}

describe('claimQuestReward', () => {
  beforeEach(() => vi.clearAllMocks());

  it('claims stars reward successfully', async () => {
    mockQuestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        claimed: false,
        currentProgress: 5,
        targetProgress: 5,
        reward: { type: 'stars', amount: 50 },
      }),
    });

    const result = await handler(makeReq('c1', 'q1'));

    expect(result.reward).toEqual({ type: 'stars', amount: 50 });
    expect(result.questId).toBe('q1');
    expect(mockTxUpdate).toHaveBeenCalledTimes(2); // child + quest
  });

  it('claims gems reward successfully', async () => {
    mockQuestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        claimed: false,
        currentProgress: 3,
        targetProgress: 3,
        reward: { type: 'gems', amount: 10 },
      }),
    });

    const result = await handler(makeReq('c1', 'q1'));
    expect(result.reward).toEqual({ type: 'gems', amount: 10 });
  });

  it('claims XP reward successfully', async () => {
    mockQuestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        claimed: false,
        currentProgress: 10,
        targetProgress: 10,
        reward: { type: 'xp', amount: 100 },
      }),
    });

    const result = await handler(makeReq('c1', 'q1'));
    expect(result.reward).toEqual({ type: 'xp', amount: 100 });
  });

  it('rejects non-existent quest', async () => {
    mockQuestGet.mockResolvedValue({ exists: false });

    await expect(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest not found');
  });

  it('rejects already claimed quest', async () => {
    mockQuestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        claimed: true,
        currentProgress: 5,
        targetProgress: 5,
        reward: { type: 'stars', amount: 50 },
      }),
    });

    await expect(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest already claimed');
  });

  it('rejects incomplete quest', async () => {
    mockQuestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        claimed: false,
        currentProgress: 2,
        targetProgress: 5,
        reward: { type: 'stars', amount: 50 },
      }),
    });

    await expect(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest not yet completed');
  });
});
