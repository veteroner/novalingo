"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for submitLessonResult callable.
 */
const vitest_1 = require("vitest");
const { MockHttpsError, mockChildGet, mockBatchUpdate, mockBatchSet, mockChildRef } = vitest_1.vi.hoisted(() => {
    class MockHttpsError extends Error {
        code;
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    }
    const mockChildGet = vitest_1.vi.fn();
    const mockBatchUpdate = vitest_1.vi.fn();
    const mockBatchSet = vitest_1.vi.fn();
    const mockChildRef = { get: mockChildGet, update: vitest_1.vi.fn() };
    return {
        MockHttpsError,
        mockChildGet,
        mockBatchUpdate,
        mockBatchSet,
        mockChildRef,
    };
});
vitest_1.vi.mock('firebase-functions/v2/https', () => ({
    HttpsError: MockHttpsError,
    onCall: (_opts, handler) => handler,
}));
vitest_1.vi.mock('../utils/admin', () => ({
    db: {
        doc: vitest_1.vi.fn((path) => {
            if (path.includes('lessonProgress'))
                return { id: 'progress-ref', set: mockBatchSet };
            return mockChildRef;
        }),
        runTransaction: vitest_1.vi.fn(async (fn) => fn({
            get: vitest_1.vi.fn(async () => mockChildGet()),
            update: mockBatchUpdate,
            set: mockBatchSet,
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
    getTodayTR: vitest_1.vi.fn(() => '2026-03-07'),
    xpForLevel: vitest_1.vi.fn((level) => (level - 1) * 100),
    increment: vitest_1.vi.fn((val) => `increment(${val})`),
    serverTimestamp: vitest_1.vi.fn(() => 'SERVER_TS'),
}));
const submitLessonResult_1 = require("../callables/submitLessonResult");
const handler = submitLessonResult_1.submitLessonResult;
// ─── Helpers ──────────────────────────────────────────
function makeChild(overrides = {}) {
    return {
        totalXP: 0,
        currentXP: 0,
        level: 1,
        currency: { stars: 0, gems: 0 },
        streak: { current: 0, longest: 0, lastActivityDate: null, freezesAvailable: 3 },
        stats: { lessonsCompleted: 0, perfectLessons: 0, wordsLearned: 0, totalTimeSeconds: 0 },
        ...overrides,
    };
}
function makeActivities(count, allCorrect = true) {
    return Array.from({ length: count }, (_, i) => ({
        activityId: `act-${i}`,
        correct: allCorrect,
        timeSpentMs: 5000,
        hintsUsed: 0,
        attempts: 1,
    }));
}
function makeReq(data) {
    return { auth: { uid: 'parent-1' }, data };
}
(0, vitest_1.describe)('submitLessonResult', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('calculates XP correctly for a perfect lesson', async () => {
        const activities = makeActivities(4, true); // 4 correct
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        (0, vitest_1.expect)(result.accuracy).toBe(1.0);
        (0, vitest_1.expect)(result.isPerfect).toBe(true);
        (0, vitest_1.expect)(result.starRating).toBe(3);
        // baseXP = 4 * 10 = 40
        // perfect bonus = floor(40 * 0.5) = 20
        // speed bonus: 60000 < 120000*0.7=84000 → floor(40*0.2) = 8
        // streak bonus: current=0, so 0
        // first try: all attempts ≤ 1 → +5
        // no hints: all 0 → +3
        (0, vitest_1.expect)(result.baseXP).toBe(40);
        (0, vitest_1.expect)(result.bonusXP).toBe(20 + 8 + 5 + 3);
        (0, vitest_1.expect)(result.xpEarned).toBe(40 + 36);
        (0, vitest_1.expect)(result.starsEarned).toBe(15); // 5 base + 10 perfect
    });
    (0, vitest_1.it)('calculates 0 stars for low accuracy', async () => {
        // 1 correct, 3 wrong → 25% accuracy
        const activities = [...makeActivities(1, true), ...makeActivities(3, false)];
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 120000 }));
        (0, vitest_1.expect)(result.accuracy).toBe(0.25);
        (0, vitest_1.expect)(result.starRating).toBe(0);
        (0, vitest_1.expect)(result.isPerfect).toBe(false);
        (0, vitest_1.expect)(result.starsEarned).toBe(5); // No perfect bonus
    });
    (0, vitest_1.it)('calculates 2 stars for 80% accuracy', async () => {
        // 4 correct, 1 wrong → 80%
        const activities = [...makeActivities(4, true), ...makeActivities(1, false)];
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 200000 }));
        (0, vitest_1.expect)(result.accuracy).toBe(0.8);
        (0, vitest_1.expect)(result.starRating).toBe(2);
        (0, vitest_1.expect)(result.isPerfect).toBe(false);
    });
    (0, vitest_1.it)('applies streak bonus correctly', async () => {
        const activities = makeActivities(4, true);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild({
                streak: { current: 10, longest: 10, lastActivityDate: '2026-03-06', freezesAvailable: 3 },
            }),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        // streak bonus: min(10 * 0.05, 0.5) = 0.5 → floor(40 * 0.5) = 20
        // perfect + speed + streak + firstTry + noHints = 20 + 8 + 20 + 5 + 3 = 56
        (0, vitest_1.expect)(result.bonusXP).toBe(56);
        // Streak should increment (lastDate = yesterday, today = 2026-03-07)
        (0, vitest_1.expect)(result.streak).toBe(11);
    });
    (0, vitest_1.it)('caps streak bonus at 50%', async () => {
        const activities = makeActivities(4, true);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild({
                streak: { current: 20, longest: 20, lastActivityDate: '2026-03-06', freezesAvailable: 0 },
            }),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        // streak bonus: min(20 * 0.05, 0.5) = 0.5 → capped → floor(40 * 0.5) = 20
        // same as 10-day streak — capped at 50%
        (0, vitest_1.expect)(result.bonusXP).toBe(56); // 20+8+20+5+3
    });
    (0, vitest_1.it)('does not give speed bonus when slow', async () => {
        const activities = makeActivities(4, true);
        // expected time = 4 * 30000 = 120000, threshold = 84000
        // 100000 > 84000 → no speed bonus
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 100000 }));
        // perfect + no speed + no streak + firstTry + noHints = 20 + 0 + 0 + 5 + 3 = 28
        (0, vitest_1.expect)(result.bonusXP).toBe(28);
    });
    (0, vitest_1.it)('does not give first-try bonus when retries', async () => {
        const activities = makeActivities(4, true).map((a, i) => (i === 0 ? { ...a, attempts: 3 } : a));
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        // perfect + speed + no firstTry + noHints = 20 + 8 + 0 + 3 = 31
        (0, vitest_1.expect)(result.bonusXP).toBe(31);
    });
    (0, vitest_1.it)('does not give no-hint bonus when hints used', async () => {
        const activities = makeActivities(4, true).map((a, i) => i === 0 ? { ...a, hintsUsed: 2 } : a);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        // perfect + speed + firstTry + no noHints = 20 + 8 + 5 + 0 = 33
        (0, vitest_1.expect)(result.bonusXP).toBe(33);
    });
    (0, vitest_1.it)('resets streak when there is a gap', async () => {
        const activities = makeActivities(2, true);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild({
                streak: { current: 5, longest: 10, lastActivityDate: '2026-03-01', freezesAvailable: 1 },
            }),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }));
        // Gap between 2026-03-01 and 2026-03-07 → streak resets to 1
        (0, vitest_1.expect)(result.streak).toBe(1);
    });
    (0, vitest_1.it)('keeps streak same if already played today', async () => {
        const activities = makeActivities(2, true);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild({
                streak: { current: 5, longest: 5, lastActivityDate: '2026-03-07', freezesAvailable: 0 },
            }),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }));
        // Already played today → streak stays at 5
        (0, vitest_1.expect)(result.streak).toBe(5);
    });
    (0, vitest_1.it)('triggers level up when XP exceeds threshold', async () => {
        const activities = makeActivities(4, true);
        // xpForLevel mock: (level-1)*100, so level 2 requires 100 XP
        // child has 70 XP, earning 76 → total 146 → level 2 (needs 100)
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild({ totalXP: 70, level: 1 }),
        });
        const result = await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }));
        (0, vitest_1.expect)(result.leveledUp).toBe(true);
        (0, vitest_1.expect)(result.newLevel).toBe(2);
    });
    (0, vitest_1.it)('writes batch with correct data', async () => {
        const activities = makeActivities(2, true);
        mockChildGet.mockResolvedValue({
            exists: true,
            data: () => makeChild(),
        });
        await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }));
        (0, vitest_1.expect)(mockBatchUpdate).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(mockBatchSet).toHaveBeenCalledTimes(1);
        // Check progressRef.set was called with lesson progress data
        const setArgs = mockBatchSet.mock.calls[0];
        (0, vitest_1.expect)(setArgs[0]).toEqual(vitest_1.expect.objectContaining({
            lessonId: 'l1',
            stars: 3,
            accuracy: 1.0,
        }));
    });
    (0, vitest_1.it)('rejects unauthenticated request', async () => {
        await (0, vitest_1.expect)(handler({
            auth: null,
            data: { childId: 'c1', lessonId: 'l1', activities: [], totalTimeMs: 0 },
        })).rejects.toThrow();
    });
});
//# sourceMappingURL=submitLessonResult.test.js.map