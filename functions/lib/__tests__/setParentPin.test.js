"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for setParentPin callable.
 */
const crypto_1 = require("crypto");
const vitest_1 = require("vitest");
// Hoisted so vi.mock factories can reference them
const { MockHttpsError, mockGet, mockUpdate, mockDocRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockGet = vitest_1.vi.fn();
    const mockUpdate = vitest_1.vi.fn();
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
            throw new MockHttpsError('unauthenticated', 'Authentication required');
        return req.auth.uid;
    }),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TIMESTAMP'),
}));
// Import after mocks
const setParentPin_1 = require("../callables/setParentPin");
// The handler (onCall is mocked to pass through)
const handler = setParentPin_1.setParentPin;
(0, vitest_1.describe)('setParentPin', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('sets PIN for user without existing PIN', async () => {
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({ settings: {} }),
        });
        mockUpdate.mockResolvedValue(undefined);
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234' },
        });
        (0, vitest_1.expect)(result.success).toBe(true);
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledOnce();
        // Verify hash and salt are stored
        const updateArg = mockUpdate.mock.calls[0][0];
        (0, vitest_1.expect)(updateArg['settings.parentPinHash']).toBeDefined();
        (0, vitest_1.expect)(updateArg['settings.parentPinSalt']).toBeDefined();
        (0, vitest_1.expect)(updateArg['settings.parentPin']).toBe('****');
    });
    (0, vitest_1.it)('rejects non-4-digit PIN', async () => {
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '123' } })).rejects.toThrow('PIN must be exactly 4 digits');
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: 'abcd' } })).rejects.toThrow('PIN must be exactly 4 digits');
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '12345' } })).rejects.toThrow('PIN must be exactly 4 digits');
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({ data: { pin: '1234' } })).rejects.toThrow('Authentication required');
    });
    (0, vitest_1.it)('requires current PIN when PIN already set', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const existingHash = (0, crypto_1.createHash)('sha256')
            .update(salt + '9999')
            .digest('hex');
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: existingHash, parentPinSalt: salt },
            }),
        });
        // No currentPin provided
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow('Current PIN required');
    });
    (0, vitest_1.it)('rejects wrong current PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const existingHash = (0, crypto_1.createHash)('sha256')
            .update(salt + '9999')
            .digest('hex');
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: existingHash, parentPinSalt: salt },
            }),
        });
        await (0, vitest_1.expect)(handler({
            auth: { uid: 'user1' },
            data: { pin: '1234', currentPin: '0000' },
        })).rejects.toThrow('Current PIN is incorrect');
    });
    (0, vitest_1.it)('accepts correct current PIN and changes PIN', async () => {
        const salt = (0, crypto_1.randomBytes)(16).toString('hex');
        const existingHash = (0, crypto_1.createHash)('sha256')
            .update(salt + '9999')
            .digest('hex');
        mockGet.mockResolvedValue({
            exists: true,
            data: () => ({
                settings: { parentPinHash: existingHash, parentPinSalt: salt },
            }),
        });
        mockUpdate.mockResolvedValue(undefined);
        const result = await handler({
            auth: { uid: 'user1' },
            data: { pin: '1234', currentPin: '9999' },
        });
        (0, vitest_1.expect)(result.success).toBe(true);
        (0, vitest_1.expect)(mockUpdate).toHaveBeenCalledOnce();
    });
    (0, vitest_1.it)('throws not-found when user does not exist', async () => {
        mockGet.mockResolvedValue({ exists: false, data: () => null });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { pin: '1234' } })).rejects.toThrow('User not found');
    });
});
//# sourceMappingURL=setParentPin.test.js.map