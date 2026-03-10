"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for purchaseShopItem callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockItemGet, mockChildGet } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockItemGet = vitest_1.vi.fn();
    const mockChildGet = vitest_1.vi.fn();
    return { MockHttpsError, mockItemGet, mockChildGet };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn((path) => {
            if (path.startsWith('shopItems/'))
                return { get: mockItemGet };
            return { id: 'child-ref' }; // childRef
        }),
        runTransaction: vitest_1.vi.fn(async (fn) => fn({
            get: vitest_1.vi.fn(async () => {
                const val = await mockChildGet();
                return { exists: true, ...val };
            }),
            update: vitest_1.vi.fn(),
        })),
    },
    REGION: 'europe-west1',
    callableOpts: { region: 'europe-west1', enforceAppCheck: false },
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Auth required');
        return req.auth.uid;
    }),
    requireChildOwnership: vitest_1.vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TS'),
    increment: vitest_1.vi.fn((val) => `increment(${val})`),
    arrayUnion: vitest_1.vi.fn((val) => `arrayUnion(${val})`),
}));
const purchaseShopItem_1 = require("../callables/purchaseShopItem");
const handler = purchaseShopItem_1.purchaseShopItem;
function makeReq(childId, itemId) {
    return { auth: { uid: 'parent-1' }, data: { childId, itemId } };
}
(0, vitest_1.describe)('purchaseShopItem', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('purchases item with stars successfully', async () => {
        mockItemGet.mockResolvedValue({
            exists: true,
            data: () => ({ name: 'Fox Hat', price: 100, currencyType: 'stars' }),
        });
        mockChildGet.mockResolvedValue({
            data: () => ({ currency: { stars: 200, gems: 0 }, ownedItems: [] }),
        });
        const result = await handler(makeReq('c1', 'item1'));
        (0, vitest_1.expect)(result.itemId).toBe('item1');
        (0, vitest_1.expect)(result.itemName).toBe('Fox Hat');
        (0, vitest_1.expect)(result.spent).toBe(100);
        (0, vitest_1.expect)(result.currencyType).toBe('stars');
    });
    (0, vitest_1.it)('purchases item with gems successfully', async () => {
        mockItemGet.mockResolvedValue({
            exists: true,
            data: () => ({ name: 'Dragon', price: 50, currencyType: 'gems' }),
        });
        mockChildGet.mockResolvedValue({
            data: () => ({ currency: { stars: 0, gems: 100 }, ownedItems: [] }),
        });
        const result = await handler(makeReq('c1', 'item1'));
        (0, vitest_1.expect)(result.currencyType).toBe('gems');
    });
    (0, vitest_1.it)('rejects non-existent item', async () => {
        mockItemGet.mockResolvedValue({ exists: false });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'item1'))).rejects.toThrow('Item not found');
    });
    (0, vitest_1.it)('rejects already owned item', async () => {
        mockItemGet.mockResolvedValue({
            exists: true,
            data: () => ({ name: 'Hat', price: 10, currencyType: 'stars' }),
        });
        mockChildGet.mockResolvedValue({
            data: () => ({ currency: { stars: 100, gems: 0 }, ownedItems: ['item1'] }),
        });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'item1'))).rejects.toThrow('Item already owned');
    });
    (0, vitest_1.it)('rejects insufficient balance', async () => {
        mockItemGet.mockResolvedValue({
            exists: true,
            data: () => ({ name: 'Hat', price: 500, currencyType: 'stars' }),
        });
        mockChildGet.mockResolvedValue({
            data: () => ({ currency: { stars: 100, gems: 0 }, ownedItems: [] }),
        });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'item1'))).rejects.toThrow('Insufficient balance');
    });
});
//# sourceMappingURL=purchaseShopItem.test.js.map