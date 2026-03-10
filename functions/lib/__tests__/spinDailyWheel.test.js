"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for spinDailyWheel callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockSpinGet, mockBatchUpdate, mockBatchSet } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockSpinGet = vitest_1.vi.fn();
    const mockBatchUpdate = vitest_1.vi.fn();
    const mockBatchSet = vitest_1.vi.fn();
    return { MockHttpsError, mockSpinGet, mockBatchUpdate, mockBatchSet };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn((path) => {
            if (path.includes('/dailySpins/'))
                return { id: 'spin-ref' };
            return { id: 'child-ref' }; // childRef
        }),
        runTransaction: vitest_1.vi.fn(async (fn) => fn({
            get: vitest_1.vi.fn(async (ref) => {
                if (ref.id === 'spin-ref')
                    return mockSpinGet();
                return { exists: true, data: () => ({}) };
            }),
            update: mockBatchUpdate,
            set: mockBatchSet,
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
    getTodayTR: vitest_1.vi.fn(() => '2026-03-07'),
}));
const spinDailyWheel_1 = require("../callables/spinDailyWheel");
const handler = spinDailyWheel_1.spinDailyWheel;
function makeReq(childId) {
    return { auth: { uid: 'parent-1' }, data: { childId } };
}
(0, vitest_1.describe)('spinDailyWheel', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('spins wheel and awards reward', async () => {
        mockSpinGet.mockResolvedValue({ exists: false });
        // Mock Math.random to return a deterministic value
        // First segment stars_10 has weight 25, total ~100 — random 0 picks it
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0);
        const result = await handler(makeReq('c1'));
        (0, vitest_1.expect)(result.segmentId).toBe('stars_10');
        (0, vitest_1.expect)(result.reward).toEqual({ type: 'stars', amount: 10 });
        (0, vitest_1.expect)(mockBatchUpdate).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockBatchSet).toHaveBeenCalledTimes(1);
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('rejects when already spun today', async () => {
        mockSpinGet.mockResolvedValue({ exists: true });
        await (0, vitest_1.expect)(handler(makeReq('c1'))).rejects.toThrow('Already spun today');
    });
    (0, vitest_1.it)('can award streak freeze', async () => {
        mockSpinGet.mockResolvedValue({ exists: false });
        // streak_freeze segment is last, weight 5, total weight = 100
        // Need random ~0.95+ to pick it
        vitest_1.vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const result = await handler(makeReq('c1'));
        const reward = result.reward;
        (0, vitest_1.expect)(reward.type).toBe('streak_freeze');
        (0, vitest_1.expect)(reward.amount).toBe(1);
        vitest_1.vi.restoreAllMocks();
    });
});
//# sourceMappingURL=spinDailyWheel.test.js.map