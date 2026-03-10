"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for deleteChildProfile callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockDelete, mockBatchDelete, mockBatchCommit, mockChildCollection, mockUserGet, mockUserUpdate, mockRemainingGet, } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockDelete = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockBatchDelete = vitest_1.vi.fn();
    const mockBatchCommit = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockChildCollection = vitest_1.vi.fn();
    const mockUserGet = vitest_1.vi.fn();
    const mockUserUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockRemainingGet = vitest_1.vi.fn();
    return {
        MockHttpsError,
        mockDelete,
        mockBatchDelete,
        mockBatchCommit,
        mockChildCollection,
        mockUserGet,
        mockUserUpdate,
        mockRemainingGet,
    };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn((path) => {
            if (path.startsWith('users/')) {
                return { get: mockUserGet, update: mockUserUpdate };
            }
            // children/{id}
            return {
                delete: mockDelete,
                collection: mockChildCollection,
            };
        }),
        collection: vitest_1.vi.fn(() => ({
            where: vitest_1.vi.fn(() => ({
                limit: vitest_1.vi.fn(() => ({ get: mockRemainingGet })),
            })),
        })),
        batch: vitest_1.vi.fn(() => ({
            delete: mockBatchDelete,
            commit: mockBatchCommit,
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
}));
vitest_1.vi.mock('../utils/validators', () => ({
    validateId: vitest_1.vi.fn((v) => v),
}));
const deleteChildProfile_1 = require("../callables/deleteChildProfile");
const handler = deleteChildProfile_1.deleteChildProfile;
function makeReq(childId) {
    return { auth: { uid: 'parent-1' }, data: { childId } };
}
(0, vitest_1.describe)('deleteChildProfile', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        // Default: subcollections are empty
        mockChildCollection.mockReturnValue({
            limit: vitest_1.vi.fn(() => ({
                get: vitest_1.vi.fn().mockResolvedValue({ empty: true, docs: [] }),
            })),
        });
    });
    (0, vitest_1.it)('deletes child and subcollections successfully', async () => {
        const mockSubDoc = { ref: { path: 'children/c1/vocabulary/w1' } };
        // Each subcollection returns one batch of docs, then empty on next call
        let subCallCount = 0;
        mockChildCollection.mockReturnValue({
            limit: vitest_1.vi.fn(() => ({
                get: vitest_1.vi.fn(() => {
                    subCallCount++;
                    if (subCallCount <= 6) {
                        return Promise.resolve({ empty: false, docs: [mockSubDoc] });
                    }
                    return Promise.resolve({ empty: true, docs: [] });
                }),
            })),
        });
        // User had this child as active, no remaining children
        mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'c1' }) });
        mockRemainingGet.mockResolvedValue({ empty: true, docs: [] });
        const result = await handler(makeReq('c1'));
        (0, vitest_1.expect)(result).toEqual({ childId: 'c1', deleted: true });
        (0, vitest_1.expect)(mockDelete).toHaveBeenCalledTimes(1);
        // 6 subcollections, each with 1 doc → 6 batch commits
        (0, vitest_1.expect)(mockBatchCommit).toHaveBeenCalledTimes(6);
        // Active child cleared to null
        (0, vitest_1.expect)(mockUserUpdate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ activeChildId: null }));
    });
    (0, vitest_1.it)('sets remaining child as active after deletion', async () => {
        mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'c1' }) });
        mockRemainingGet.mockResolvedValue({
            empty: false,
            docs: [{ id: 'c2' }],
        });
        await handler(makeReq('c1'));
        (0, vitest_1.expect)(mockUserUpdate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ activeChildId: 'c2' }));
    });
    (0, vitest_1.it)('skips user update when deleted child was not active', async () => {
        mockUserGet.mockResolvedValue({ data: () => ({ activeChildId: 'other' }) });
        await handler(makeReq('c1'));
        (0, vitest_1.expect)(mockDelete).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockUserUpdate).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ auth: null, data: { childId: 'c1' } })).rejects.toThrow();
    });
});
//# sourceMappingURL=deleteChildProfile.test.js.map