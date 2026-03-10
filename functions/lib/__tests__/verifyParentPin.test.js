"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for verifyParentPin callable.
 */
const crypto_1 = require("crypto");
const vitest_1 = require("vitest");
const { MockHttpsError, mockGet, mockDocRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockGet = vitest_1.vi.fn();
    const mockDocRef = { get: mockGet };
    return { MockHttpsError, mockGet, mockDocRef };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: { doc: vitest_1.vi.fn(() => mockDocRef) },
    REGION: 'europe-west1',
    callableOpts: { region: 'europe-west1', enforceAppCheck: false },
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Authentication required');
        return req.auth.uid;
    }),
}));
const verifyParentPin_1 = require("../callables/verifyParentPin");
const handler = verifyParentPin_1.verifyParentPin;
(0, vitest_1.describe)('verifyParentPin', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('returns valid:true for correct PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.createHash)('sha256')
            .update(salt + '1234')
            .digest('hex');
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: hash, parentPinSalt: salt },
            }),
        });
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234' },
        });
        (0, vitest_1.expect)(result.valid).toBe(true);
    });
    (0, vitest_1.it)('throws permission-denied for wrong PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, crypto_1.createHash)('sha256')
            .update(salt + '1234')
            .digest('hex');
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: hash, parentPinSalt: salt },
            }),
        });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '0000' } })).rejects.toThrow('Incorrect PIN');
    });
    (0, vitest_1.it)('throws failed-precondition when no PIN set', async () => {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({ settings: {} }),
        });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow('No PIN set');
    });
    (0, vitest_1.it)('rejects non-4-digit PIN format', async () => {
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '12' } })).rejects.toThrow('PIN must be exactly 4 digits');
    });
    (0, vitest_1.it)('throws not-found when user does not exist', async () => {
        mockGet.mockResolvedValue({ exists: false, data: () => null });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow('User not found');
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
    });
});
//# sourceMappingURL=verifyParentPin.test.js.map