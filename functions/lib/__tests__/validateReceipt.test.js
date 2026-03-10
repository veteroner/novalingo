"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for validateReceipt callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockFetch, mockUserDocUpdate, mockPurchaseAdd, mockChildrenGet, mockChildUpdate, } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockFetch = vitest_1.vi.fn();
    const mockUserDocUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockPurchaseAdd = vitest_1.vi.fn().mockResolvedValue({ id: 'p1' });
    const mockChildrenGet = vitest_1.vi.fn();
    const mockChildUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    return {
        MockHttpsError,
        mockFetch,
        mockUserDocUpdate,
        mockPurchaseAdd,
        mockChildrenGet,
        mockChildUpdate,
    };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({ update: mockUserDocUpdate, set: mockUserDocUpdate })),
        collection: vitest_1.vi.fn((path) => {
            if (path.includes('/purchases'))
                return { add: mockPurchaseAdd };
            // children collection
            return {
                where: vitest_1.vi.fn(() => ({
                    limit: vitest_1.vi.fn(() => ({
                        get: mockChildrenGet,
                    })),
                })),
            };
        }),
    },
    REGION: 'europe-west1',
    callableOpts: { region: 'europe-west1', enforceAppCheck: false },
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Auth required');
        return req.auth.uid;
    }),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TS'),
}));
// Mock global fetch
vitest_1.vi.stubGlobal('fetch', mockFetch);
const validateReceipt_1 = require("../callables/validateReceipt");
const handler = validateReceipt_1.validateReceipt;
function makeReq(data) {
    return { auth: { uid: 'user-1' }, data };
}
(0, vitest_1.describe)('validateReceipt', () => {
    const originalEnv = process.env;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env = { ...originalEnv, REVENUECAT_API_KEY: 'test-key' };
    });
    (0, vitest_1.afterEach)(() => {
        process.env = originalEnv;
    });
    (0, vitest_1.it)('validates subscription receipt successfully', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                subscriber: {
                    entitlements: { premium: { expires_date: '2027-01-01T00:00:00Z' } },
                },
            }),
        });
        const result = await handler(makeReq({ platform: 'ios', receipt: 'rc-token', productId: 'novalingo_premium_monthly' }));
        (0, vitest_1.expect)(result.valid).toBe(true);
        (0, vitest_1.expect)(result.entitlements).toContain('premium');
        (0, vitest_1.expect)(result.productId).toBe('novalingo_premium_monthly');
        (0, vitest_1.expect)(mockUserDocUpdate).toHaveBeenCalled();
        (0, vitest_1.expect)(mockPurchaseAdd).toHaveBeenCalled();
    });
    (0, vitest_1.it)('validates gem purchase and grants gems', async () => {
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
        const result = await handler(makeReq({ platform: 'android', receipt: 'token', productId: 'novalingo_gems_100' }));
        (0, vitest_1.expect)(result.productId).toBe('novalingo_gems_100');
        (0, vitest_1.expect)(mockChildUpdate).toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects invalid platform', async () => {
        await (0, vitest_1.expect)(handler(makeReq({ platform: 'web', receipt: 'token', productId: 'prod' }))).rejects.toThrow('Invalid platform');
    });
    (0, vitest_1.it)('rejects missing receipt', async () => {
        await (0, vitest_1.expect)(handler(makeReq({ platform: 'ios', receipt: '', productId: 'prod' }))).rejects.toThrow('Receipt is required');
    });
    (0, vitest_1.it)('throws when API key not configured', async () => {
        delete process.env.REVENUECAT_API_KEY;
        await (0, vitest_1.expect)(handler(makeReq({ platform: 'ios', receipt: 'token', productId: 'prod' }))).rejects.toThrow('Payment service not configured');
    });
    (0, vitest_1.it)('throws when RevenueCat validation fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 400 });
        await (0, vitest_1.expect)(handler(makeReq({ platform: 'ios', receipt: 'token', productId: 'novalingo_premium_monthly' }))).rejects.toThrow('Receipt validation failed');
    });
});
//# sourceMappingURL=validateReceipt.test.js.map