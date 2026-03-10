"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Test setup for Firebase Cloud Functions.
 * Mocks firebase-admin to prevent actual initialization.
 */
const vitest_1 = require("vitest");
// Mock firebase-admin globally so any module importing it won't try to initialize.
// `import * as admin from 'firebase-admin'` expects named exports.
vitest_1.vi.mock('firebase-admin', () => {
    const firestoreMock = {};
    const firestoreFn = Object.assign(() => firestoreMock, {
        FieldValue: {
            serverTimestamp: () => 'SERVER_TIMESTAMP',
            increment: (n) => n,
            arrayUnion: (...args) => args,
            arrayRemove: (...args) => args,
        },
    });
    const mod = {
        apps: [{ name: 'mock' }],
        initializeApp: vitest_1.vi.fn(),
        firestore: firestoreFn,
        auth: () => ({ deleteUser: vitest_1.vi.fn() }),
        storage: () => ({}),
        messaging: () => ({}),
    };
    return { ...mod, default: mod };
});
// Mock rate limiter globally — no-op in tests
vitest_1.vi.mock('../utils/rateLimit', () => ({
    checkRateLimit: vitest_1.vi.fn().mockResolvedValue(undefined),
    RATE_LIMITS: {
        sensitive: { maxCalls: 5, windowSeconds: 300 },
        write: { maxCalls: 20, windowSeconds: 60 },
        read: { maxCalls: 60, windowSeconds: 60 },
        monetary: { maxCalls: 10, windowSeconds: 300 },
    },
}));
//# sourceMappingURL=setup.js.map