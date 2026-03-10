"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for syncOfflineProgress callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockSet, mockUpdate } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockSet = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    return { MockHttpsError, mockSet, mockUpdate };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({ set: mockSet, update: mockUpdate })),
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
}));
const syncOfflineProgress_1 = require("../callables/syncOfflineProgress");
const handler = syncOfflineProgress_1.syncOfflineProgress;
function makeReq(data) {
    return { auth: { uid: 'parent-1' }, data };
}
(0, vitest_1.describe)('syncOfflineProgress', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('returns 0 for empty actions', async () => {
        const result = await handler(makeReq({ childId: 'c1', actions: [] }));
        (0, vitest_1.expect)(result.synced).toBe(0);
    });
    (0, vitest_1.it)('syncs lessonComplete actions', async () => {
        const actions = [
            { type: 'lessonComplete', payload: { lessonId: 'l1', score: 80 }, timestamp: 1000 },
            { type: 'lessonComplete', payload: { lessonId: 'l2', score: 90 }, timestamp: 2000 },
        ];
        const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
        (0, vitest_1.expect)(result.synced).toBe(2);
        (0, vitest_1.expect)(result.errors).toBe(0);
        (0, vitest_1.expect)(mockSet).toHaveBeenCalledTimes(2);
    });
    (0, vitest_1.it)('syncs vocabularyReview actions', async () => {
        const actions = [
            { type: 'vocabularyReview', payload: { wordId: 'w1', rating: 4 }, timestamp: 1000 },
        ];
        const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
        (0, vitest_1.expect)(result.synced).toBe(1);
    });
    (0, vitest_1.it)('syncs questProgress actions', async () => {
        const actions = [
            { type: 'questProgress', payload: { questId: 'q1', progress: 5 }, timestamp: 1000 },
        ];
        const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
        (0, vitest_1.expect)(result.synced).toBe(1);
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('counts unknown action types as errors', async () => {
        const actions = [{ type: 'unknownType', payload: {}, timestamp: 1000 }];
        const result = await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
        (0, vitest_1.expect)(result.synced).toBe(0);
        (0, vitest_1.expect)(result.errors).toBe(1);
    });
    (0, vitest_1.it)('rejects when too many actions', async () => {
        const actions = Array.from({ length: 101 }, (_, i) => ({
            type: 'lessonComplete',
            payload: { lessonId: `l${i}` },
            timestamp: i,
        }));
        await (0, vitest_1.expect)(handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }))).rejects.toThrow('Too many actions');
    });
    (0, vitest_1.it)('processes actions sorted by timestamp', async () => {
        const actions = [
            { type: 'lessonComplete', payload: { lessonId: 'l2' }, timestamp: 2000 },
            { type: 'lessonComplete', payload: { lessonId: 'l1' }, timestamp: 1000 },
        ];
        await handler(makeReq({ childId: 'c1', actions, lastSyncTimestamp: 0 }));
        // First call should be l1 (earlier timestamp)
        const firstCallPayload = mockSet.mock.calls[0][0];
        (0, vitest_1.expect)(firstCallPayload.lessonId).toBe('l1');
    });
});
//# sourceMappingURL=syncOfflineProgress.test.js.map