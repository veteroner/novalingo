"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for deleteAccount callable (COPPA compliance).
 */
const crypto_1 = require("crypto");
const vitest_1 = require("vitest");
const { MockHttpsError, mockDocGet, mockDocDelete, mockDocUpdate, mockDeleteUser, mockBatchDelete, mockBatchCommit, } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    return {
        MockHttpsError,
        mockDocGet: vitest_1.vi.fn(),
        mockDocDelete: vitest_1.vi.fn().mockResolvedValue(undefined),
        mockDocUpdate: vitest_1.vi.fn().mockResolvedValue(undefined),
        mockDeleteUser: vitest_1.vi.fn().mockResolvedValue(undefined),
        mockBatchDelete: vitest_1.vi.fn(),
        mockBatchCommit: vitest_1.vi.fn().mockResolvedValue(undefined),
    };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
function createEmptyCollectionSnapshot() {
    return { empty: true, docs: [], size: 0 };
}
function makeCollectionRef() {
    return {
        limit: vitest_1.vi.fn().mockReturnValue({
            get: vitest_1.vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
        }),
        get: vitest_1.vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
        where: vitest_1.vi.fn().mockReturnThis(),
    };
}
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({
            get: mockDocGet,
            delete: mockDocDelete,
            update: mockDocUpdate,
            collection: vitest_1.vi.fn(() => makeCollectionRef()),
        })),
        collection: vitest_1.vi.fn((path) => {
            if (path === 'analytics') {
                return {
                    where: vitest_1.vi.fn().mockReturnValue({
                        limit: vitest_1.vi.fn().mockReturnValue({
                            get: vitest_1.vi.fn().mockResolvedValue(createEmptyCollectionSnapshot()),
                        }),
                    }),
                };
            }
            // children or purchases collection — needs limit() for deleteCollection
            return {
                ...makeCollectionRef(),
                where: vitest_1.vi.fn().mockReturnValue({
                    get: vitest_1.vi.fn().mockResolvedValue({ docs: [] }),
                }),
            };
        }),
        batch: vitest_1.vi.fn(() => ({
            delete: mockBatchDelete,
            commit: mockBatchCommit,
        })),
    },
    auth: { deleteUser: mockDeleteUser },
    REGION: 'europe-west1',
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Authentication required');
        return req.auth.uid;
    }),
}));
const deleteAccount_1 = require("../callables/deleteAccount");
const handler = deleteAccount_1.deleteAccount;
(0, vitest_1.describe)('deleteAccount', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('deletes account with correct PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.createHash)('sha256')
            .update(salt + '1234')
            .digest('hex');
        // User doc with PIN set
        mockDocGet
            .mockResolvedValueOnce({
            exists: true,
            data: () => ({
                settings: { parentPinHash: hash, parentPinSalt: salt },
            }),
        })
            // Subsequent doc gets for progress/gamification docs
            .mockResolvedValue({ exists: false, data: () => null });
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234' },
        });
        (0, vitest_1.expect)(result.deleted).toBe(true);
        (0, vitest_1.expect)(mockDeleteUser).toHaveBeenCalledWith('user1');
    });
    (0, vitest_1.it)('rejects incorrect PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.createHash)('sha256')
            .update(salt + '1234')
            .digest('hex');
        mockDocGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: hash, parentPinSalt: salt },
            }),
        });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '0000' } })).rejects.toThrow('Incorrect PIN');
    });
    (0, vitest_1.it)('rejects non-4-digit PIN', async () => {
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: 'ab' } })).rejects.toThrow('PIN is required to delete account');
    });
    (0, vitest_1.it)('throws not-found for missing user', async () => {
        mockDocGet.mockResolvedValue({ exists: false, data: () => null });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow('User not found');
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
    });
    (0, vitest_1.it)('handles auth.deleteUser failure gracefully', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.createHash)('sha256')
            .update(salt + '1234')
            .digest('hex');
        mockDocGet
            .mockResolvedValueOnce({
            exists: true,
            data: () => ({
                settings: { parentPinHash: hash, parentPinSalt: salt },
            }),
        })
            .mockResolvedValue({ exists: false, data: () => null });
        // Simulate auth deletion failure
        mockDeleteUser.mockRejectedValueOnce(new Error('User already deleted'));
        // Should still succeed (deleteUser failure is non-fatal)
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234' },
        });
        (0, vitest_1.expect)(result.deleted).toBe(true);
    });
    (0, vitest_1.it)('proceeds with deletion when no PIN is set on account', async () => {
        mockDocGet
            .mockResolvedValueOnce({
            exists: true,
            data: () => ({ settings: {} }),
        })
            .mockResolvedValue({ exists: false, data: () => null });
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234' },
        });
        (0, vitest_1.expect)(result.deleted).toBe(true);
    });
});
//# sourceMappingURL=deleteAccount.test.js.map