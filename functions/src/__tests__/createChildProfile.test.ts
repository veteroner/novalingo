/**
 * Tests for createChildProfile callable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  MockHttpsError,
  mockUserDocGet,
  mockUserDocUpdate,
  mockChildDocSet,
  mockCountGet,
  mockChildDocId,
} = vi.hoisted(() => ({
  MockHttpsError: (() => {
    class E extends Error {
      code: string;
      constructor(c: string, m: string) {
        super(m);
        this.code = c;
      }
    }
    return E;
  })(),
  mockUserDocGet: vi.fn(),
  mockUserDocUpdate: vi.fn().mockResolvedValue(undefined),
  mockChildDocSet: vi.fn().mockResolvedValue(undefined),
  mockCountGet: vi.fn(),
  mockChildDocId: 'child-abc-123',
}));

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({
      get: mockUserDocGet,
      update: mockUserDocUpdate,
      set: mockUserDocUpdate,
    })),
    collection: vi.fn(() => ({
      where: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue({
          get: mockCountGet,
        }),
      }),
      doc: vi.fn(() => ({
        id: mockChildDocId,
        set: mockChildDocSet,
      })),
    })),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Authentication required');
    return req.auth.uid;
  }),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

import { createChildProfile } from '../callables/createChildProfile';

const handler = createChildProfile as unknown as (
  request: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

describe('createChildProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: 0 existing children, free tier
    mockCountGet.mockResolvedValue({ data: () => ({ count: 0 }) });
    mockUserDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ isPremium: false }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates first child profile successfully', async () => {
    const result = await handler({
      auth: { uid: 'user1' },
      data: { name: 'Ali', ageGroup: 'cubs' },
    });

    expect(result.childId).toBe(mockChildDocId);
    expect(result.name).toBe('Ali');
    expect(result.ageGroup).toBe('cubs');
    expect(result.level).toBe(1);
    expect(result.totalXP).toBe(0);
    expect(mockChildDocSet).toHaveBeenCalledOnce();
    // First child → sets activeChildId
    expect(mockUserDocUpdate).toHaveBeenCalledOnce();
  });

  it('uses default avatar when none specified', async () => {
    const result = await handler({
      auth: { uid: 'user1' },
      data: { name: 'Ali', ageGroup: 'cubs' },
    });

    expect(result.avatarId).toBe('nova_default');
  });

  it('accepts custom avatarId', async () => {
    const result = await handler({
      auth: { uid: 'user1' },
      data: { name: 'Ali', ageGroup: 'cubs', avatarId: 'fox_blue' },
    });

    expect(result.avatarId).toBe('fox_blue');
  });

  it('rejects too-short name', async () => {
    await expect(
      handler({ auth: { uid: 'user1' }, data: { name: 'A', ageGroup: 'cubs' } }),
    ).rejects.toThrow('Name must be 2-20 characters');
  });

  it('rejects too-long name', async () => {
    await expect(
      handler({
        auth: { uid: 'user1' },
        data: { name: 'A'.repeat(21), ageGroup: 'cubs' },
      }),
    ).rejects.toThrow('Name must be 2-20 characters');
  });

  it('rejects invalid ageGroup', async () => {
    await expect(
      handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'toddler' } }),
    ).rejects.toThrow('Invalid age group');
  });

  it('enforces free tier limit (max 1 child)', async () => {
    mockCountGet.mockResolvedValue({ data: () => ({ count: 1 }) });

    await expect(
      handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'cubs' } }),
    ).rejects.toThrow('Upgrade to Premium');
  });

  it('allows premium users up to 5 children', async () => {
    mockCountGet.mockResolvedValue({ data: () => ({ count: 4 }) });
    mockUserDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ isPremium: true }),
    });

    const result = await handler({
      auth: { uid: 'user1' },
      data: { name: 'Ali', ageGroup: 'stars' },
    });

    expect(result.childId).toBe(mockChildDocId);
  });

  it('rejects premium users at 5 children', async () => {
    mockCountGet.mockResolvedValue({ data: () => ({ count: 5 }) });
    mockUserDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ isPremium: true }),
    });

    await expect(
      handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'cubs' } }),
    ).rejects.toThrow('Maximum 5 child profiles');
  });

  it('trims name whitespace', async () => {
    const result = await handler({
      auth: { uid: 'user1' },
      data: { name: '  Ali  ', ageGroup: 'cubs' },
    });

    expect(result.name).toBe('Ali');
  });

  it('does not set activeChildId for second child', async () => {
    mockCountGet.mockResolvedValue({ data: () => ({ count: 1 }) });
    mockUserDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ isPremium: true }),
    });

    await handler({
      auth: { uid: 'user1' },
      data: { name: 'Veli', ageGroup: 'legends' },
    });

    // activeChildId should NOT be updated for non-first child
    expect(mockUserDocUpdate).not.toHaveBeenCalled();
  });
});
