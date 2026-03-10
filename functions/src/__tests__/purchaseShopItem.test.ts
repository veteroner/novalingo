/**
 * Tests for purchaseShopItem callable.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockItemGet, mockChildGet } = vi.hoisted(() => {
  class MockHttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  const mockItemGet = vi.fn();
  const mockChildGet = vi.fn();
  return { MockHttpsError, mockItemGet, mockChildGet };
});

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn((path: string) => {
      if (path.startsWith('shopItems/')) return { get: mockItemGet };
      return { id: 'child-ref' }; // childRef
    }),
    runTransaction: vi.fn(async (fn: Function) =>
      fn({
        get: vi.fn(async () => {
          const val = await mockChildGet();
          return { exists: true, ...val };
        }),
        update: vi.fn(),
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
  arrayUnion: vi.fn((val: string) => `arrayUnion(${val})`),
}));

import { purchaseShopItem } from '../callables/purchaseShopItem';

const handler = purchaseShopItem as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function makeReq(childId: string, itemId: string) {
  return { auth: { uid: 'parent-1' }, data: { childId, itemId } };
}

describe('purchaseShopItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('purchases item with stars successfully', async () => {
    mockItemGet.mockResolvedValue({
      exists: true,
      data: () => ({ name: 'Fox Hat', price: 100, currencyType: 'stars' }),
    });
    mockChildGet.mockResolvedValue({
      data: () => ({ currency: { stars: 200, gems: 0 }, ownedItems: [] }),
    });

    const result = await handler(makeReq('c1', 'item1'));

    expect(result.itemId).toBe('item1');
    expect(result.itemName).toBe('Fox Hat');
    expect(result.spent).toBe(100);
    expect(result.currencyType).toBe('stars');
  });

  it('purchases item with gems successfully', async () => {
    mockItemGet.mockResolvedValue({
      exists: true,
      data: () => ({ name: 'Dragon', price: 50, currencyType: 'gems' }),
    });
    mockChildGet.mockResolvedValue({
      data: () => ({ currency: { stars: 0, gems: 100 }, ownedItems: [] }),
    });

    const result = await handler(makeReq('c1', 'item1'));
    expect(result.currencyType).toBe('gems');
  });

  it('rejects non-existent item', async () => {
    mockItemGet.mockResolvedValue({ exists: false });

    await expect(handler(makeReq('c1', 'item1'))).rejects.toThrow('Item not found');
  });

  it('rejects already owned item', async () => {
    mockItemGet.mockResolvedValue({
      exists: true,
      data: () => ({ name: 'Hat', price: 10, currencyType: 'stars' }),
    });
    mockChildGet.mockResolvedValue({
      data: () => ({ currency: { stars: 100, gems: 0 }, ownedItems: ['item1'] }),
    });

    await expect(handler(makeReq('c1', 'item1'))).rejects.toThrow('Item already owned');
  });

  it('rejects insufficient balance', async () => {
    mockItemGet.mockResolvedValue({
      exists: true,
      data: () => ({ name: 'Hat', price: 500, currencyType: 'stars' }),
    });
    mockChildGet.mockResolvedValue({
      data: () => ({ currency: { stars: 100, gems: 0 }, ownedItems: [] }),
    });

    await expect(handler(makeReq('c1', 'item1'))).rejects.toThrow('Insufficient balance');
  });
});
