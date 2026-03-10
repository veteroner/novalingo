"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for claimQuestReward callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockQuestGet, mockBatchUpdate, mockBatchCommit, mockQuestRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockQuestGet = vitest_1.vi.fn();
    const mockBatchUpdate = vitest_1.vi.fn();
    const mockBatchCommit = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockQuestRef = { get: mockQuestGet, id: 'q1' };
    return { MockHttpsError, mockQuestGet, mockBatchUpdate, mockBatchCommit, mockQuestRef };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn((path) => {
            if (path.includes('/quests/'))
                return mockQuestRef;
            return { id: 'child-ref' }; // childRef
        }),
        batch: vitest_1.vi.fn(() => ({
            update: mockBatchUpdate,
            commit: mockBatchCommit,
        })),
    },
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
const claimQuestReward_1 = require("../callables/claimQuestReward");
const handler = claimQuestReward_1.claimQuestReward;
function makeReq(childId, questId) {
    return { auth: { uid: 'parent-1' }, data: { childId, questId } };
}
(0, vitest_1.describe)('claimQuestReward', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('claims stars reward successfully', async () => {
        mockQuestGet.mockResolvedValue({
            exists: true,
            data: () => ({
                claimed: false,
                currentProgress: 5,
                targetProgress: 5,
                reward: { type: 'stars', amount: 50 },
            }),
        });
        const result = await handler(makeReq('c1', 'q1'));
        (0, vitest_1.expect)(result.reward).toEqual({ type: 'stars', amount: 50 });
        (0, vitest_1.expect)(result.questId).toBe('q1');
        (0, vitest_1.expect)(mockBatchUpdate).toHaveBeenCalledTimes(2); // child + quest
        (0, vitest_1.expect)(mockBatchCommit).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('claims gems reward successfully', async () => {
        mockQuestGet.mockResolvedValue({
            exists: true,
            data: () => ({
                claimed: false,
                currentProgress: 3,
                targetProgress: 3,
                reward: { type: 'gems', amount: 10 },
            }),
        });
        const result = await handler(makeReq('c1', 'q1'));
        (0, vitest_1.expect)(result.reward).toEqual({ type: 'gems', amount: 10 });
    });
    (0, vitest_1.it)('claims XP reward successfully', async () => {
        mockQuestGet.mockResolvedValue({
            exists: true,
            data: () => ({
                claimed: false,
                currentProgress: 10,
                targetProgress: 10,
                reward: { type: 'xp', amount: 100 },
            }),
        });
        const result = await handler(makeReq('c1', 'q1'));
        (0, vitest_1.expect)(result.reward).toEqual({ type: 'xp', amount: 100 });
    });
    (0, vitest_1.it)('rejects non-existent quest', async () => {
        mockQuestGet.mockResolvedValue({ exists: false });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest not found');
    });
    (0, vitest_1.it)('rejects already claimed quest', async () => {
        mockQuestGet.mockResolvedValue({
            exists: true,
            data: () => ({
                claimed: true,
                currentProgress: 5,
                targetProgress: 5,
                reward: { type: 'stars', amount: 50 },
            }),
        });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest already claimed');
    });
    (0, vitest_1.it)('rejects incomplete quest', async () => {
        mockQuestGet.mockResolvedValue({
            exists: true,
            data: () => ({
                claimed: false,
                currentProgress: 2,
                targetProgress: 5,
                reward: { type: 'stars', amount: 50 },
            }),
        });
        await (0, vitest_1.expect)(handler(makeReq('c1', 'q1'))).rejects.toThrow('Quest not yet completed');
    });
});
//# sourceMappingURL=claimQuestReward.test.js.map