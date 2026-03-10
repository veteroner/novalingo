/**
 * Tests for syncOfflineProgress callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockSet, mockUpdate } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockSet = vi.fn().mockResolvedValue(undefined);
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  return { MockHttpsError, mockSet, mockUpdate };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({ set: mockSet, update: mockUpdate })),
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

import { syncOfflineProgress } from '../callables/syncOfflineProgress';

const handler = syncOfflineProgress as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(data: Record<string, unknown>) {
  return { auth: { uid: 'parent-1' }, data };
}

describe('syncOfflineProgress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 0 for empty actions', async () => {
    const result = await handler(makeReq({ childId: 'c1', actions: [] }));
    expect(result.synced).toBe(0);
  });

  it('syncs lessonComplete actions', async () => {
    const actions = [
      { type: 'lessonComplete', payload: { lessonId: 'l1', score: 80 }, timestamp: 1000 },
      { type: 'lessonComplete', payload: { lessonId: 'l2', score: 90 }, timestamp: 2000 },
    ];

    const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));

    expect(result.synced).toBe(2);
    expect(result.errors).toBe(0);
    expect(mockSet).toHaveBeenCalledTimes(2);
  });

  it('syncs vocabularyReview actions', async () => {
    const actions = [
      { type: 'vocabularyReview', payload: { wordId: 'w1', rating: 4 }, timestamp: 1000 },
    ];

    const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
    expect(result.synced).toBe(1);
  });

  it('syncs questProgress actions', async () => {
    const actions = [
      { type: 'questProgress', payload: { questId: 'q1', progress: 5 }, timestamp: 1000 },
    ];

    const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
    expect(result.synced).toBe(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it('counts unknown action types as errors', async () => {
    const actions = [{ type: 'unknownType', payload: {}, timestamp: 1000 }];

    const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
    expect(result.synced).toBe(0);
    expect(result.errors).toBe(1);
  });

  it('rejects when too many actions', async () => {
    const actions = Array.from({ length: 101 }, (_, i) => ({
      type: 'lessonComplete',
      payload: { lessonId: `l${i}` },
      timestamp: i,
    }));

    await expect(
      handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 })),
    ).rejects.toThrow('Too many actions');
  });

  it('processes actions sorted by timestamp', async () => {
    const actions = [
      { type: 'lessonComplete', payload: { lessonId: 'l2' }, timestamp: 2000 },
      { type: 'lessonComplete', payload: { lessonId: 'l1' }, timestamp: 1000 },
    ];

    await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));

    // First call should be l1 (earlier timestamp)
    const firstCallPayload = mockSet.mock.calls[0][0];
    expect(firstCallPayload.lessonId).toBe('l1');
  });
});
