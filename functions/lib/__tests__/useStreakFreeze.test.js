"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for useStreakFreeze callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockGet, mockUpdate, mockDocRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockGet = vitest_1.vi.fn();
    const mockUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockDocRef = { get: mockGet, update: mockUpdate };
    return { MockHttpsError, mockGet, mockUpdate, mockDocRef };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: { doc: vitest_1.vi.fn(() => mockDocRef) },
    REGION: 'europe-west1',
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Auth required');
        return req.auth.uid;
    }),
    requireChildOwnership: vitest_1.vi.fn().mockResolvedValue(undefined),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TS'),
    increment: vitest_1.vi.fn((val) => `increment(${val})`),
}));
const useStreakFreeze_1 = require("../callables/useStreakFreeze");
const handler = useStreakFreeze_1.useStreakFreeze;
function makeReq(childId) {
    return { auth: { uid: 'parent-1' }, data: { childId } };
}
(0, vitest_1.describe)('useStreakFreeze', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('consumes a freeze successfully', async () => {
        mockGet.mockResolvedValue({
            data: () => ({ streak: { freezesAvailable: 3, current: 5, longest: 5, frozenToday: false } }),
        });
        const result = await handler(makeReq('c1'));
        (0, vitest_1.expect)(result.freezesRemaining).toBe(2);
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            'streak.freezesAvailable': 'increment(-1)',
            'streak.frozenToday': true,
            updatedAt: 'SERVER_TS',
        }));
    });
    (0, vitest_1.it)('works with exactly 1 freeze remaining', async () => {
        mockGet.mockResolvedValue({
            data: () => ({
                streak: { freezesAvailable: 1, current: 7, longest: 12, frozenToday: false },
            }),
        });
        const result = await handler(makeReq('c1'));
        (0, vitest_1.expect)(result.freezesRemaining).toBe(0);
    });
    (0, vitest_1.it)('rejects when no freezes available', async () => {
        mockGet.mockResolvedValue({
            data: () => ({ streak: { freezesAvailable: 0, current: 3, longest: 3, frozenToday: false } }),
        });
        await (0, vitest_1.expect)(handler(makeReq('c1'))).rejects.toThrow('No streak freezes available');
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ auth: null, data: { childId: 'c1' } })).rejects.toThrow();
    });
});
//# sourceMappingURL=useStreakFreeze.test.js.map