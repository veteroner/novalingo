"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for updateChildProfile callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockUpdate, mockDocRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockUpdate = vitest_1.vi.fn().mockResolvedValue(undefined);
    const mockDocRef = { update: mockUpdate };
    return { MockHttpsError, mockUpdate, mockDocRef };
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
}));
vitest_1.vi.mock('../utils/validators', () => ({
    validateId: vitest_1.vi.fn((v) => {
        if (!v || typeof v !== 'string')
            throw new MockHttpsError('invalid-argument', 'Invalid id');
        return v;
    }),
    validateString: vitest_1.vi.fn((v, _field, min, max) => {
        if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
            throw new MockHttpsError('invalid-argument', 'Invalid string');
        }
        return v.trim();
    }),
}));
const updateChildProfile_1 = require("../callables/updateChildProfile");
const handler = updateChildProfile_1.updateChildProfile;
function makeReq(data) {
    return { auth: { uid: 'parent-1' }, data };
}
(0, vitest_1.describe)('updateChildProfile', () => {
    (0, vitest_1.beforeEach)(() => vitest_1.vi.clearAllMocks());
    (0, vitest_1.it)('updates name only', async () => {
        const result = await handler(makeReq({ childId: 'c1', name: 'Yeni İsim' }));
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ name: 'Yeni İsim', updatedAt: 'SERVER_TS' }));
        (0, vitest_1.expect)(result).toEqual(vitest_1.expect.objectContaining({ childId: 'c1' }));
    });
    (0, vitest_1.it)('updates avatarId only', async () => {
        const result = await handler(makeReq({ childId: 'c1', avatarId: 'fox' }));
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ avatarId: 'fox', updatedAt: 'SERVER_TS' }));
        (0, vitest_1.expect)(result.childId).toBe('c1');
    });
    (0, vitest_1.it)('updates both name and avatarId', async () => {
        await handler(makeReq({ childId: 'c1', name: 'Ali', avatarId: 'cat' }));
        const arg = mockUpdate.mock.calls[0][0];
        (0, vitest_1.expect)(arg.name).toBe('Ali');
        (0, vitest_1.expect)(arg.avatarId).toBe('cat');
    });
    (0, vitest_1.it)('rejects empty avatarId', async () => {
        await (0, vitest_1.expect)(handler(makeReq({ childId: 'c1', avatarId: '  ' }))).rejects.toThrow('avatarId must be a non-empty string');
    });
    (0, vitest_1.it)('rejects when no fields provided', async () => {
        await (0, vitest_1.expect)(handler(makeReq({ childId: 'c1' }))).rejects.toThrow('No fields to update');
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ auth: null, data: { childId: 'c1', name: 'X' } })).rejects.toThrow();
    });
});
//# sourceMappingURL=updateChildProfile.test.js.map