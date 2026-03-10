"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for restorePurchases callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockFetch, mockUserDocUpdate } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockFetch = vitest_1.vi.fn();
    const mockUserDocUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    return { MockHttpsError, mockFetch, mockUserDocUpdate };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({ update: mockUserDocUpdate, set: mockUserDocUpdate })),
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
vitest_1.vi.stubGlobal('fetch', mockFetch);
const restorePurchases_1 = require("../callables/restorePurchases");
const handler = restorePurchases_1.restorePurchases;
function makeReq(platform) {
    return { auth: { uid: 'user-1' }, data: { platform } };
}
(0, vitest_1.describe)('restorePurchases', () => {
    const originalEnv = process.env;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env = { ...originalEnv, REVENUECAT_API_KEY: 'test-key' };
    });
    (0, vitest_1.afterEach)(() => {
        process.env = originalEnv;
    });
    (0, vitest_1.it)('restores active premium subscription', async () => {
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
        (0, vitest_1.expect)(result.isPremium).toBe(true);
        (0, vitest_1.expect)(result.entitlements).toContain('premium');
        (0, vitest_1.expect)(mockUserDocUpdate).toHaveBeenCalled();
    });
    (0, vitest_1.it)('returns no premium for expired subscription', async () => {
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
        (0, vitest_1.expect)(result.isPremium).toBe(false);
    });
    (0, vitest_1.it)('returns empty for 404 (no subscriber)', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 404 });
        const result = await handler(makeReq('android'));
        (0, vitest_1.expect)(result.isPremium).toBe(false);
        (0, vitest_1.expect)(result.entitlements).toEqual([]);
    });
    (0, vitest_1.it)('rejects invalid platform', async () => {
        await (0, vitest_1.expect)(handler(makeReq('web'))).rejects.toThrow('Invalid platform');
    });
    (0, vitest_1.it)('throws when API key not configured', async () => {
        delete process.env.REVENUECAT_API_KEY;
        await (0, vitest_1.expect)(handler(makeReq('ios'))).rejects.toThrow('Payment service not configured');
    });
    (0, vitest_1.it)('throws when RevenueCat API fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 500 });
        await (0, vitest_1.expect)(handler(makeReq('ios'))).rejects.toThrow('Restore failed');
    });
});
//# sourceMappingURL=restorePurchases.test.js.map