/**
 * Tests for getLeaderboard callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockCollectionGet } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockCollectionGet = vi.fn();
  return { MockHttpsError, mockCollectionGet };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: mockCollectionGet,
          })),
        })),
      })),
    })),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  requireChildOwnership: vi.fn().mockResolvedValue(undefined),
}));

import { getLeaderboard } from '../callables/getLeaderboard';

const handler = getLeaderboard as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(data: Record<string, unknown>) {
  return { auth: { uid: 'parent-1' }, data };
}

describe('getLeaderboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns leaderboard entries with ranks', async () => {
    mockCollectionGet.mockResolvedValue({
      docs: [
        { id: 'c2', data: () => ({ name: 'Ali', avatarId: 'fox', level: 5, weeklyXP: 500 }) },
        { id: 'c1', data: () => ({ name: 'Ela', avatarId: 'cat', level: 3, weeklyXP: 300 }) },
      ],
    });

    const result = await handler(makeReq({ childId: 'c1' }));

    const entries = result.entries as Array<Record<string, unknown>>;
    expect(entries).toHaveLength(2);
    expect(entries[0].rank).toBe(1);
    expect(entries[0].name).toBe('Ali');
    expect(entries[1].rank).toBe(2);
    expect(entries[1].isCurrentUser).toBe(true);
    expect(result.currentUserRank).toBe(2);
  });

  it('returns null rank when user not in results', async () => {
    mockCollectionGet.mockResolvedValue({
      docs: [{ id: 'c99', data: () => ({ name: 'X', avatarId: 'a', level: 1, weeklyXP: 100 }) }],
    });

    const result = await handler(makeReq({ childId: 'c1' }));
    expect(result.currentUserRank).toBeNull();
  });

  it('returns empty entries for no data', async () => {
    mockCollectionGet.mockResolvedValue({ docs: [] });

    const result = await handler(makeReq({ childId: 'c1' }));
    expect((result.entries as unknown[]).length).toBe(0);
  });

  it('includes weekId in response', async () => {
    mockCollectionGet.mockResolvedValue({ docs: [] });

    const result = await handler(makeReq({ childId: 'c1' }));
    expect(typeof result.weekId).toBe('string');
    expect(result.weekId as string).toMatch(/^\d{4}-W\d{2}$/);
  });
});
