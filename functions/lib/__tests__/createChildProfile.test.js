"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for createChildProfile callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockUserDocGet, mockUserDocUpdate, mockChildDocSet, mockCountGet, mockChildDocId, } = vitest_1.vi.hoisted(() => ({
    MockHttpsError: (() => {
        class E extends Error {
            code;
            constructor(c, m) {
                super(m);
                this.code = c;
            }
        }
        return E;
    })(),
    mockUserDocGet: vitest_1.vi.fn(),
    mockUserDocUpdate: vitest_1.vi.fn().mockResolvedValue(undefined),
    mockChildDocSet: vitest_1.vi.fn().mockResolvedValue(undefined),
    mockCountGet: vitest_1.vi.fn(),
    mockChildDocId: 'child-abc-123',
}));
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn(() => ({
            get: mockUserDocGet,
            update: mockUserDocUpdate,
            set: mockUserDocUpdate,
        })),
        collection: vitest_1.vi.fn(() => ({
            where: vitest_1.vi.fn().mockReturnValue({
                count: vitest_1.vi.fn().mockReturnValue({
                    get: mockCountGet,
                }),
            }),
            doc: vitest_1.vi.fn(() => ({
                id: mockChildDocId,
                set: mockChildDocSet,
            })),
        })),
    },
    REGION: 'europe-west1',
    callableOpts: { region: 'europe-west1', enforceAppCheck: false },
    requireAuth: vitest_1.vi.fn((req) => {
        if (!req.auth?.uid)
            throw new MockHttpsError('unauthenticated', 'Authentication required');
        return req.auth.uid;
    }),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TIMESTAMP'),
}));
const createChildProfile_1 = require("../callables/createChildProfile");
const handler = createChildProfile_1.createChildProfile;
(0, vitest_1.describe)('createChildProfile', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        // Default: 0 existing children, free tier
        mockCountGet.mockResolvedValue({ data: () => ({ count: 0 }) });
        mockUserDocGet.mockResolvedValue({
            exists: true,
            data: () => ({ isPremium: false }),
        });
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('creates first child profile successfully', async () => {
        const result = await handler({
            auth: { uid: 'user1' },
            data: { name: 'Ali', ageGroup: 'cubs' },
        });
        (0, vitest_1.expect)(result.childId).toBe(mockChildDocId);
        (0, vitest_1.expect)(result.name).toBe('Ali');
        (0, vitest_1.expect)(result.ageGroup).toBe('cubs');
        (0, vitest_1.expect)(result.level).toBe(1);
        (0, vitest_1.expect)(result.totalXP).toBe(0);
        (0, vitest_1.expect)(mockChildDocSet).toHaveBeenCalledOnce();
        // First child → sets activeChildId
        (0, vitest_1.expect)(mockUserDocUpdate).toHaveBeenCalledOnce();
    });
    (0, vitest_1.it)('uses default avatar when none specified', async () => {
        const result = await handler({
            auth: { uid: 'user1' },
            data: { name: 'Ali', ageGroup: 'cubs' },
        });
        (0, vitest_1.expect)(result.avatarId).toBe('nova_default');
    });
    (0, vitest_1.it)('accepts custom avatarId', async () => {
        const result = await handler({
            auth: { uid: 'user1' },
            data: { name: 'Ali', ageGroup: 'cubs', avatarId: 'fox_blue' },
        });
        (0, vitest_1.expect)(result.avatarId).toBe('fox_blue');
    });
    (0, vitest_1.it)('rejects too-short name', async () => {
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { name: 'A', ageGroup: 'cubs' } })).rejects.toThrow('Name must be 2-20 characters');
    });
    (0, vitest_1.it)('rejects too-long name', async () => {
        await (0, vitest_1.expect)(handler({
            auth: { uid: 'user1' },
            data: { name: 'A'.repeat(21), ageGroup: 'cubs' },
        })).rejects.toThrow('Name must be 2-20 characters');
    });
    (0, vitest_1.it)('rejects invalid ageGroup', async () => {
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'toddler' } })).rejects.toThrow('Invalid age group');
    });
    (0, vitest_1.it)('enforces free tier limit (max 1 child)', async () => {
        mockCountGet.mockResolvedValue({ data: () => ({ count: 1 }) });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'cubs' } })).rejects.toThrow('Upgrade to Premium');
    });
    (0, vitest_1.it)('allows premium users up to 5 children', async () => {
        mockCountGet.mockResolvedValue({ data: () => ({ count: 4 }) });
        mockUserDocGet.mockResolvedValue({
            exists: true,
            data: () => ({ isPremium: true }),
        });
        const result = await handler({
            auth: { uid: 'user1' },
            data: { name: 'Ali', ageGroup: 'stars' },
        });
        (0, vitest_1.expect)(result.childId).toBe(mockChildDocId);
    });
    (0, vitest_1.it)('rejects premium users at 5 children', async () => {
        mockCountGet.mockResolvedValue({ data: () => ({ count: 5 }) });
        mockUserDocGet.mockResolvedValue({
            exists: true,
            data: () => ({ isPremium: true }),
        });
        await (0, vitest_1.expect)(handler({ auth: { uid: 'user1' }, data: { name: 'Ali', ageGroup: 'cubs' } })).rejects.toThrow('Maximum 5 child profiles');
    });
    (0, vitest_1.it)('trims name whitespace', async () => {
        const result = await handler({
            auth: { uid: 'user1' },
            data: { name: '  Ali  ', ageGroup: 'cubs' },
        });
        (0, vitest_1.expect)(result.name).toBe('Ali');
    });
    (0, vitest_1.it)('does not set activeChildId for second child', async () => {
        mockCountGet.mockResolvedValue({ data: () => ({ count: 1 }) });
        mockUserDocGet.mockResolvedValue({
            exists: true,
            data: () => ({ isPremium: true }),
        });
        await handler({
            auth: { uid: 'user1' },
            data: { name: 'Veli', ageGroup: 'legends' },
        });
        // activeChildId should NOT be updated for non-first child
        (0, vitest_1.expect)(mockUserDocUpdate).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=createChildProfile.test.js.map