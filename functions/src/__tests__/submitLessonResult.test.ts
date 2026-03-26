/**
 * Tests for submitLessonResult callable.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { MockHttpsError, mockChildGet, mockBatchUpdate, mockBatchSet, mockChildRef } = vi.hoisted(
  () => {
    class MockHttpsError extends Error {
      code: string;
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
    }
    const mockChildGet = vi.fn();
    const mockBatchUpdate = vi.fn();
    const mockBatchSet = vi.fn();
    const mockChildRef = { get: mockChildGet, update: vi.fn() };
    return {
      MockHttpsError,
      mockChildGet,
      mockBatchUpdate,
      mockBatchSet,
      mockChildRef,
    };
  },
);

vi.mock('firebase-functions/v2/https', () => ({
  HttpsError: MockHttpsError,
  onCall: (_opts: unknown, handler: Function) => handler,
}));

vi.mock('../utils/admin', () => ({
  db: {
    doc: vi.fn((path: string) => {
      if (path.includes('lessonProgress')) return { id: 'progress-ref', set: mockBatchSet };
      return mockChildRef;
    }),
    runTransaction: vi.fn(async (fn: Function) =>
      fn({
        get: vi.fn(async () => mockChildGet()),
        update: mockBatchUpdate,
        set: mockBatchSet,
      }),
    ),
  },
  REGION: 'europe-west1',
  callableOpts: { region: 'europe-west1', enforceAppCheck: false },
  requireAuth: vi.fn((req: { auth?: { uid: string } }) => {
    if (!req.auth?.uid) throw new MockHttpsError('unauthenticated', 'Auth required');
    return req.auth.uid;
  }),
  requireChildOwnership: vi.fn().mockResolvedValue(undefined),
  getTodayTR: vi.fn(() => '2026-03-07'),
  xpForLevel: vi.fn((level: number) => (level - 1) * 100),
  increment: vi.fn((val: number) => `increment(${val})`),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}));

import { submitLessonResult } from '../callables/submitLessonResult';

const handler = submitLessonResult as unknown as (
  req: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

// ─── Helpers ──────────────────────────────────────────
function makeChild(overrides: Record<string, unknown> = {}) {
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

function makeActivities(count: number, allCorrect = true) {
  return Array.from({ length: count }, (_, i) => ({
    activityId: `act-${i}`,
    activityType: i === 0 ? 'conversation' : 'flash-card',
    correct: allCorrect,
    timeSpentMs: 5000,
    hintsUsed: 0,
    attempts: 1,
    conversationEvidence:
      i === 0
        ? {
            scenarioId: 'greeting-1',
            scenarioTheme: 'greetings',
            acceptedTurns: 2,
            hintedTurns: 0,
            targetWordsHit: ['hello'],
            patternsHit: ['greeting'],
            passed: true,
            score: 95,
          }
        : undefined,
  }));
}

function makeReq(data: Record<string, unknown>) {
  return { auth: { uid: 'parent-1' }, data };
}

describe('submitLessonResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates XP correctly for a perfect lesson', async () => {
    const activities = makeActivities(4, true); // 4 correct
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    expect(result.accuracy).toBe(1.0);
    expect(result.isPerfect).toBe(true);
    expect(result.starRating).toBe(3);
    // baseXP = 4 * 10 = 40
    // perfect bonus = floor(40 * 0.5) = 20
    // speed bonus: 60000 < 120000*0.7=84000 → floor(40*0.2) = 7
    // streak bonus: current=0, so 0
    // first try: all attempts ≤ 1 → +5
    // no hints: all 0 → +3
    expect(result.baseXP).toBe(40);
    expect(result.bonusXP).toBe(20 + 7 + 5 + 3);
    expect(result.xpEarned).toBe(40 + 35);
    expect(result.starsEarned).toBe(15); // 5 base + 10 perfect
  });

  it('calculates 0 stars for low accuracy', async () => {
    // 1 correct, 3 wrong → 25% accuracy
    const activities = [...makeActivities(1, true), ...makeActivities(3, false)];
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 120000 }),
    );

    expect(result.accuracy).toBe(0.25);
    expect(result.starRating).toBe(0);
    expect(result.isPerfect).toBe(false);
    expect(result.starsEarned).toBe(5); // No perfect bonus
  });

  it('calculates 2 stars for 80% accuracy', async () => {
    // 4 correct, 1 wrong → 80%
    const activities = [...makeActivities(4, true), ...makeActivities(1, false)];
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 200000 }),
    );

    expect(result.accuracy).toBe(0.8);
    expect(result.starRating).toBe(2);
    expect(result.isPerfect).toBe(false);
  });

  it('applies streak bonus correctly', async () => {
    const activities = makeActivities(4, true);
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () =>
        makeChild({
          streak: { current: 10, longest: 10, lastActivityDate: '2026-03-06', freezesAvailable: 3 },
        }),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    // streak bonus: min(10 * 0.05, 0.5) = 0.5 → floor(40 * 0.5) = 20
    // perfect + speed + streak + firstTry + noHints = 20 + 7 + 20 + 5 + 3 = 55
    expect(result.bonusXP).toBe(55);
    // Streak should increment (lastDate = yesterday, today = 2026-03-07)
    expect(result.streak).toBe(11);
  });

  it('caps streak bonus at 50%', async () => {
    const activities = makeActivities(4, true);
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () =>
        makeChild({
          streak: { current: 20, longest: 20, lastActivityDate: '2026-03-06', freezesAvailable: 0 },
        }),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    // streak bonus: min(20 * 0.05, 0.5) = 0.5 → capped → floor(40 * 0.5) = 20
    // same as 10-day streak — capped at 50%
    expect(result.bonusXP).toBe(55); // 20+7+20+5+3
  });

  it('does not give speed bonus when slow', async () => {
    const activities = makeActivities(4, true);
    // expected time = 4 * 30000 = 120000, threshold = 84000
    // 100000 > 84000 → no speed bonus
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 100000 }),
    );

    // perfect + no speed + no streak + firstTry + noHints = 20 + 0 + 0 + 5 + 3 = 28
    expect(result.bonusXP).toBe(28);
  });

  it('does not give first-try bonus when retries', async () => {
    const activities = makeActivities(4, true).map((a, i) => (i === 0 ? { ...a, attempts: 3 } : a));
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    // perfect + speed + no firstTry + noHints = 20 + 7 + 0 + 3 = 30
    expect(result.bonusXP).toBe(30);
  });

  it('does not give no-hint bonus when hints used', async () => {
    const activities = makeActivities(4, true).map((a, i) =>
      i === 0 ? { ...a, hintsUsed: 2 } : a,
    );
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    // perfect + speed + firstTry + no noHints = 20 + 7 + 5 + 0 = 32
    expect(result.bonusXP).toBe(32);
  });

  it('resets streak when there is a gap', async () => {
    const activities = makeActivities(2, true);
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () =>
        makeChild({
          streak: { current: 5, longest: 10, lastActivityDate: '2026-03-01', freezesAvailable: 1 },
        }),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }),
    );

    // Gap between 2026-03-01 and 2026-03-07 → streak resets to 1
    expect(result.streak).toBe(1);
  });

  it('keeps streak same if already played today', async () => {
    const activities = makeActivities(2, true);
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () =>
        makeChild({
          streak: { current: 5, longest: 5, lastActivityDate: '2026-03-07', freezesAvailable: 0 },
        }),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }),
    );

    // Already played today → streak stays at 5
    expect(result.streak).toBe(5);
  });

  it('triggers level up when XP exceeds threshold', async () => {
    const activities = makeActivities(4, true);
    // xpForLevel mock: (level-1)*100, so level 2 requires 100 XP
    // child has 70 XP, earning 76 → total 146 → level 2 (needs 100)
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild({ totalXP: 70, level: 1 }),
    });

    const result = await handler(
      makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 60000 }),
    );

    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('writes batch with correct data', async () => {
    const activities = makeActivities(2, true);
    mockChildGet.mockResolvedValue({
      exists: true,
      data: () => makeChild(),
    });

    await handler(makeReq({ childId: 'c1', lessonId: 'l1', activities, totalTimeMs: 30000 }));

    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockBatchSet).toHaveBeenCalledTimes(1);

    // Check progressRef.set was called with lesson progress data
    const setArgs = mockBatchSet.mock.calls[0];
    expect(setArgs[0]).toEqual(
      expect.objectContaining({
        lessonId: 'l1',
        score: 100,
        stars: 3,
        starsEarned: 3,
        accuracy: 1.0,
        durationSeconds: 30,
        activitiesCompleted: 2,
        activitiesTotal: 2,
        correctAnswers: 2,
        wrongAnswers: 0,
        hintsUsed: 0,
        isPerfect: true,
        deviceType: 'web',
        conversationEvidence: [
          expect.objectContaining({
            scenarioId: 'greeting-1',
            targetWordsHit: ['hello'],
            patternsHit: ['greeting'],
          }),
        ],
        attempts: [
          expect.objectContaining({
            activityId: 'act-0',
            activityType: 'conversation',
            correct: true,
            timeSpentMs: 5000,
            conversationEvidence: expect.objectContaining({ scenarioId: 'greeting-1' }),
          }),
          expect.objectContaining({
            activityId: 'act-1',
            activityType: 'flash-card',
            correct: true,
            timeSpentMs: 5000,
          }),
        ],
      }),
    );
  });

  it('rejects unauthenticated request', async () => {
    await expect(
      handler({
        auth: null,
        data: { childId: 'c1', lessonId: 'l1', activities: [], totalTimeMs: 0 },
      }),
    ).rejects.toThrow();
  });
});
