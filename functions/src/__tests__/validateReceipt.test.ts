/**
 * Tests for validateReceipt callable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  MockHttpsError,
  mockFetch,
  mockUserDocUpdate,
  mockPurchaseAdd,
  mockChildrenGet,
  mockChildUpdate,
} = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockFetch = vi.fn();
  const mockUserDocUpdate = vi.fn().mockResolvedValue(undefined);
  const mockPurchaseAdd = vi.fn().mockResolvedValue({ id: 'p1' });
  const mockChildrenGet = vi.fn();
  const mockChildUpdate = vi.fn().mockResolvedValue(undefined);
  return {
    MockHttpsError,
    mockFetch,
    mockUserDocUpdate,
    mockPurchaseAdd,
    mockChildrenGet,
    mockChildUpdate,
  };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn(() => ({ update: mockUserDocUpdate, set: mockUserDocUpdate })),
    collection: vi.fn((path: string) => {
      if (path.includes('/purchases')) return { add: mockPurchaseAdd };
      // children collection
      return {
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: mockChildrenGet,
          })),
        })),
      };
    }),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}));

// Mock global fetch
vi.stubGlobal('fetch', mockFetch);

import { validateReceipt } from '../callables/validateReceipt';

const handler = validateReceipt as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(data: Record<string, unknown>) {
  return { auth: { uid: 'user-1' }, data };
}

describe('validateReceipt', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, REVENUECAT_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('validates subscription receipt successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        subscriber: {
          entitlements: { premium: { expires_date: '2027-01-01T00:00:00Z' } },
        },
      }),
    });

    const result = await handler(
      makeReq({ platform: 'ios', receipt: 'rc-token', productId: 'novalingo_premium_monthly' }),
    );

    expect(result.valid).toBe(true);
    expect(result.entitlements as string[]).toContain('premium');
    expect(result.productId).toBe('novalingo_premium_monthly');
    expect(mockUserDocUpdate).toHaveBeenCalled();
    expect(mockPurchaseAdd).toHaveBeenCalled();
  });

  it('validates gem purchase and grants gems', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        subscriber: { entitlements: {} },
      }),
    });
    mockChildrenGet.mockResolvedValue({
      empty: false,
      docs: [{ ref: { update: mockChildUpdate }, data: () => ({ currency: { gems: 10 } }) }],
    });

    const result = await handler(
      makeReq({ platform: 'android', receipt: 'token', productId: 'novalingo_gems_100' }),
    );

    expect(result.productId).toBe('novalingo_gems_100');
    expect(mockChildUpdate).toHaveBeenCalled();
  });

  it('rejects invalid platform', async () => {
    await expect(
      handler(makeReq({ platform: 'web', receipt: 'token', productId: 'prod' })),
    ).rejects.toThrow('Invalid platform');
  });

  it('rejects missing receipt', async () => {
    await expect(
      handler(makeReq({ platform: 'ios', receipt: '', productId: 'prod' })),
    ).rejects.toThrow('Receipt is required');
  });

  it('throws when API key not configured', async () => {
    delete process.env.REVENUECAT_API_KEY;

    await expect(
      handler(makeReq({ platform: 'ios', receipt: 'token', productId: 'prod' })),
    ).rejects.toThrow('Payment service not configured');
  });

  it('throws when RevenueCat validation fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });

    await expect(
      handler(
        makeReq({ platform: 'ios', receipt: 'token', productId: 'novalingo_premium_monthly' }),
      ),
    ).rejects.toThrow('Receipt validation failed');
  });
});
