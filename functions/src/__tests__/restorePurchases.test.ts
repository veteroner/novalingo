/**
 * Tests for restorePurchases callable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockFetch, mockUserDocUpdate } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockFetch = vi.fn();
  const mockUserDocUpdate = vi.fn().mockResolvedValue(undefined);
  return { MockHttpsError, mockFetch, mockUserDocUpdate };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({ update: mockUserDocUpdate, set: mockUserDocUpdate })),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}));

vi.stubGlobal('fetch', mockFetch);

import { restorePurchases } from '../callables/restorePurchases';

const handler = restorePurchases as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(platform: string) {
  return { auth: { uid: 'user-1' }, data: { platform } };
}

describe('restorePurchases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, REVENUECAT_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('restores active premium subscription', async () => {
    const futureDate = new Date(Date.now() + 86_400_000 * 30).toISOString();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        subscriber: {
          entitlements: { premium: { expires_date: futureDate } },
        },
      }),
    });

    const result = await handler(makeReq('ios'));

    expect(result.isPremium).toBe(true);
    expect(result.entitlements as string[]).toContain('premium');
    expect(mockUserDocUpdate).toHaveBeenCalled();
  });

  it('returns no premium for expired subscription', async () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        subscriber: {
          entitlements: { premium: { expires_date: pastDate } },
        },
      }),
    });

    const result = await handler(makeReq('ios'));
    expect(result.isPremium).toBe(false);
  });

  it('returns empty for 404 (no subscriber)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const result = await handler(makeReq('android'));

    expect(result.isPremium).toBe(false);
    expect(result.entitlements).toEqual([]);
  });

  it('rejects invalid platform', async () => {
    await expect(handler(makeReq('web'))).rejects.toThrow('Invalid platform');
  });

  it('throws when API key not configured', async () => {
    delete process.env.REVENUECAT_API_KEY;

    await expect(handler(makeReq('ios'))).rejects.toThrow('Payment service not configured');
  });

  it('throws when RevenueCat API fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(handler(makeReq('ios'))).rejects.toThrow('Restore failed');
  });
});
