"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for getLeaderboard callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockCollectionGet } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockCollectionGet = vitest_1.vi.fn();
    return { MockHttpsError, mockCollectionGet };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        collection: vitest_1.vi.fn(() => ({
            where: vitest_1.vi.fn(() => ({
                orderBy: vitest_1.vi.fn(() => ({
                    limit: vitest_1.vi.fn(() => ({
                        get: mockCollectionGet,
                    })),
                })),
            })),
        })),
    },
    REGION: 'europe-west1',
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Auth required');
        return req.auth.uid;
    }),
    requireChildOwnership: vitest_1.vi.fn().mockResolvedValue(undefined),
}));
const getLeaderboard_1 = require("../callables/getLeaderboard");
const handler = getLeaderboard_1.getLeaderboard;
function makeReq(data) {
    return { auth: { uid: 'parent-1' }, data };
}
(0, vitest_1.describe)('getLeaderboard', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('returns leaderboard entries with ranks', async () => {
        mockCollectionGet.mockResolvedValue({
            docs: [
                { id: 'c2', data: () => ({ name: 'Ali', avatarId: 'fox', level: 5, weeklyXP: 500 }) },
                { id: 'c1', data: () => ({ name: 'Ela', avatarId: 'cat', level: 3, weeklyXP: 300 }) },
            ],
        });
        const result = await handler(makeReq({ childId: 'c1' }));
        const entries = result.entries;
        (0, vitest_1.expect)(entries).toHaveLength(2);
        (0, vitest_1.expect)(entries[0].rank).toBe(1);
        (0, vitest_1.expect)(entries[0].name).toBe('Ali');
        (0, vitest_1.expect)(entries[1].rank).toBe(2);
        (0, vitest_1.expect)(entries[1].isCurrentUser).toBe(true);
        (0, vitest_1.expect)(result.currentUserRank).toBe(2);
    });
    (0, vitest_1.it)('returns null rank when user not in results', async () => {
        mockCollectionGet.mockResolvedValue({
            docs: [{ id: 'c99', data: () => ({ name: 'X', avatarId: 'a', level: 1, weeklyXP: 100 }) }],
        });
        const result = await handler(makeReq({ childId: 'c1' }));
        (0, vitest_1.expect)(result.currentUserRank).toBeNull();
    });
    (0, vitest_1.it)('returns empty entries for no data', async () => {
        mockCollectionGet.mockResolvedValue({ docs: [] });
        const result = await handler(makeReq({ childId: 'c1' }));
        (0, vitest_1.expect)(result.entries.length).toBe(0);
    });
    (0, vitest_1.it)('includes weekId in response', async () => {
        mockCollectionGet.mockResolvedValue({ docs: [] });
        const result = await handler(makeReq({ childId: 'c1' }));
        (0, vitest_1.expect)(typeof result.weekId).toBe('string');
        (0, vitest_1.expect)(result.weekId).toMatch(/^\d{4}-W\d{2}$/);
    });
});
//# sourceMappingURL=getLeaderboard.test.js.map