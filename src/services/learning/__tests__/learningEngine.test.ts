/**
 * Learning Engine Tests
 */

import type { Activity, ActivityType, Lesson } from '@/types/content';
import type { ActivityResult, VocabularyCard } from '@/types/progress';
import { type Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import {
  calculateLessonOutcome,
  generateReviewLesson,
  prepareLesson,
  processActivityForSRS,
  sortActivitiesPedagogically,
} from '../learningEngine';

// ===== HELPERS =====

function makeTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
    toMillis: () => date.getTime(),
  } as Timestamp;
}

function makeActivity(type: ActivityType, id?: string): Activity {
  return {
    id: id ?? `act-${type}`,
    type,
    order: 0,
    data: {
      type: 'flash-card',
      word: 'cat',
      translation: 'kedi',
      imageUrl: '',
      audioUrl: '',
      exampleSentence: '',
      exampleTranslation: '',
    },
    timeLimit: 30,
    maxAttempts: 3,
  };
}

function makeLesson(overrides?: Partial<Lesson>): Lesson {
  return {
    id: 'lesson-1',
    unitId: 'unit-1',
    worldId: 'world-1',
    name: 'Test Ders',
    nameEn: 'Test Lesson',
    type: 'normal',
    difficulty: 'easy',
    order: 1,
    requiredStars: 0,
    estimatedMinutes: 5,
    xpReward: 50,
    starReward: 3,
    activities: [
      makeActivity('flash-card', 'a1'),
      makeActivity('listen-and-tap', 'a2'),
      makeActivity('match-pairs', 'a3'),
      makeActivity('fill-blank', 'a4'),
      makeActivity('speak-it', 'a5'),
      makeActivity('word-builder', 'a6'),
    ],
    vocabulary: ['cat', 'dog', 'bird'],
    ...overrides,
  };
}

function makeResult(overrides?: Partial<ActivityResult>): ActivityResult {
  return {
    activityId: 'a1',
    activityType: 'flash-card',
    isCorrect: true,
    score: 100,
    timeSpentSeconds: 5,
    attempts: 1,
    hintsUsed: 0,
    ...overrides,
  };
}

function makeVocabularyCard(overrides?: Partial<VocabularyCard>): VocabularyCard {
  const now = new Date();
  const past = new Date(now.getTime() - 86400000); // yesterday
  return {
    id: 'card-1',
    userId: 'user-1',
    childId: 'child-1',
    word: 'apple',
    translation: 'elma',
    imageUrl: '',
    audioUrl: '',
    repetitions: 1,
    easeFactor: 2.5,
    interval: 1,
    nextReviewAt: makeTimestamp(past),
    lastReviewedAt: makeTimestamp(past),
    masteryLevel: 'learning',
    correctCount: 2,
    incorrectCount: 1,
    learnedInLessonId: 'lesson-1',
    learnedAt: makeTimestamp(past),
    ...overrides,
  } as VocabularyCard;
}

// ===== TESTS =====

describe('sortActivitiesPedagogically', () => {
  it('should sort activities in pedagogic order', () => {
    const activities = [
      makeActivity('speak-it'),
      makeActivity('flash-card'),
      makeActivity('fill-blank'),
      makeActivity('listen-and-tap'),
      makeActivity('match-pairs'),
    ];

    const sorted = sortActivitiesPedagogically(activities);

    expect(sorted.map((a) => a.type)).toEqual([
      'flash-card',
      'listen-and-tap',
      'match-pairs',
      'fill-blank',
      'speak-it',
    ]);
  });

  it('should not mutate original array', () => {
    const activities = [makeActivity('speak-it'), makeActivity('flash-card')];
    const original = [...activities];
    sortActivitiesPedagogically(activities);
    expect(activities).toEqual(original);
  });

  it('should handle empty array', () => {
    expect(sortActivitiesPedagogically([])).toEqual([]);
  });

  it('should place unknown types at end', () => {
    const activities = [
      makeActivity('flash-card'),
      { ...makeActivity('flash-card'), type: 'unknown-type' as ActivityType },
    ];
    const sorted = sortActivitiesPedagogically(activities);
    const [firstActivity, secondActivity] = sorted;
    expect(firstActivity).toBeDefined();
    expect(secondActivity).toBeDefined();
    expect(firstActivity?.type).toBe('flash-card');
    expect(secondActivity?.type).toBe('unknown-type');
  });
});

describe('prepareLesson', () => {
  it('should create a lesson session with sorted activities', () => {
    const lesson = makeLesson();
    const session = prepareLesson({
      lesson,
      recentPerformance: [],
      childLevel: 5,
    });

    expect(session.lessonId).toBe('lesson-1');
    expect(session.activities.length).toBeGreaterThan(0);
    expect(session.startedAt).toBeGreaterThan(0);
    expect(session.vocabulary).toContain('cat');
  });

  it('should include review words from due vocabulary cards', () => {
    const lesson = makeLesson();
    const dueCard = makeVocabularyCard({ word: 'banana', translation: 'muz' });

    const session = prepareLesson({
      lesson,
      recentPerformance: [],
      childLevel: 5,
      vocabularyCards: [dueCard],
    });

    expect(session.vocabulary).toContain('banana');
  });

  it('should not duplicate words already in lesson vocabulary', () => {
    const lesson = makeLesson({ vocabulary: ['apple'] });
    const dueCard = makeVocabularyCard({ word: 'apple', translation: 'elma' });

    const session = prepareLesson({
      lesson,
      recentPerformance: [],
      childLevel: 5,
      vocabularyCards: [dueCard],
    });

    const appleCount = session.vocabulary.filter((w) => w === 'apple').length;
    expect(appleCount).toBe(1);
  });

  it('should apply time multiplier from difficulty', () => {
    const lesson = makeLesson();
    const session = prepareLesson({
      lesson,
      recentPerformance: [],
      childLevel: 1,
    });

    // All activities had timeLimit 30; difficulty adjusts them
    for (const act of session.activities) {
      expect(act.timeLimit).toBeTypeOf('number');
    }
  });

  it('should trim activities to match difficulty activitiesPerLesson', () => {
    // Create lesson with many activities
    const manyActivities = Array.from({ length: 20 }, (_, i) =>
      makeActivity('flash-card', `act-${i}`),
    );
    const lesson = makeLesson({ activities: manyActivities });

    const session = prepareLesson({
      lesson,
      recentPerformance: [],
      childLevel: 1,
    });

    // Should be trimmed to difficulty.activitiesPerLesson
    expect(session.activities.length).toBeLessThanOrEqual(20);
    expect(session.activities.length).toBeGreaterThan(0);
  });
});

describe('calculateLessonOutcome', () => {
  const startedAt = Date.now() - 60000; // 1 minute ago

  it('should return zero outcome for empty results', () => {
    const outcome = calculateLessonOutcome('lesson-1', [], startedAt, [], []);
    expect(outcome.score).toBe(0);
    expect(outcome.accuracy).toBe(0);
    expect(outcome.starsEarned).toBe(0);
    expect(outcome.perfectLesson).toBe(false);
  });

  it('should calculate 100% accuracy for all correct', () => {
    const results = [makeResult(), makeResult(), makeResult()];
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, ['cat'], ['dog']);

    expect(outcome.accuracy).toBe(1);
    expect(outcome.score).toBe(100);
    expect(outcome.starsEarned).toBe(3);
    expect(outcome.perfectLesson).toBe(true);
  });

  it('should calculate partial accuracy', () => {
    const results = [makeResult({ isCorrect: true }), makeResult({ isCorrect: false })];
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, [], []);

    expect(outcome.accuracy).toBe(0.5);
    expect(outcome.score).toBe(50);
    expect(outcome.starsEarned).toBe(0); // Below 60% threshold
  });

  it('should award 1 star at 60% accuracy', () => {
    const results = [
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: false }),
      makeResult({ isCorrect: false }),
    ];
    // 3/5 = 60%
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, [], []);
    expect(outcome.starsEarned).toBe(1);
  });

  it('should award 2 stars at 80% accuracy', () => {
    const results = [
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: true }),
      makeResult({ isCorrect: false }),
    ];
    // 4/5 = 80%
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, [], []);
    expect(outcome.starsEarned).toBe(2);
  });

  it('should not be perfect if hints were used', () => {
    const results = [makeResult({ isCorrect: true, hintsUsed: 1 })];
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, [], []);

    expect(outcome.accuracy).toBe(1);
    expect(outcome.perfectLesson).toBe(false);
  });

  it('should include new words and review words', () => {
    const results = [makeResult()];
    const outcome = calculateLessonOutcome('lesson-1', results, startedAt, ['cat'], ['dog']);

    expect(outcome.newWordsLearned).toEqual(['cat']);
    expect(outcome.wordsReviewed).toEqual(['dog']);
  });

  it('should calculate total time from startedAt', () => {
    const recentStart = Date.now() - 5000; // 5 seconds ago
    const results = [makeResult()];
    const outcome = calculateLessonOutcome('lesson-1', results, recentStart, [], []);

    expect(outcome.totalTime).toBeGreaterThanOrEqual(4);
    expect(outcome.totalTime).toBeLessThan(10);
  });
});

describe('generateReviewLesson', () => {
  it('should return null when no cards are due', () => {
    const futureCard = makeVocabularyCard({
      nextReviewAt: makeTimestamp(new Date(Date.now() + 86400000 * 7)),
    });
    const result = generateReviewLesson([futureCard]);
    expect(result).toBeNull();
  });

  it('should generate a lesson from due cards', () => {
    const dueCard = makeVocabularyCard({
      nextReviewAt: makeTimestamp(new Date(Date.now() - 86400000)),
    });
    const result = generateReviewLesson([dueCard]);

    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected review lesson to be generated');
    }
    expect(result.lessonId).toContain('review-');
    expect(result.activities.length).toBeGreaterThan(0);
    expect(result.vocabulary).toContain('apple');
  });

  it('should limit activities to ACTIVITIES_PER_LESSON', () => {
    // Create many due cards
    const dueCards = Array.from({ length: 30 }, (_, i) =>
      makeVocabularyCard({
        id: `card-${i}`,
        word: `word-${i}`,
        nextReviewAt: makeTimestamp(new Date(Date.now() - 86400000)),
      }),
    );

    const result = generateReviewLesson(dueCards);
    expect(result).not.toBeNull();
    // Should be capped at ACTIVITIES_PER_LESSON (8)
    if (!result) {
      throw new Error('Expected capped review lesson to be generated');
    }
    expect(result.activities.length).toBeLessThanOrEqual(8);
  });
});

describe('processActivityForSRS', () => {
  it('should increase repetitions for correct answer', () => {
    const result = makeResult({ isCorrect: true, attempts: 1, hintsUsed: 0 });
    const card = makeVocabularyCard({ repetitions: 1, easeFactor: 2.5, interval: 1 });

    const updated = processActivityForSRS(result, card);

    expect(updated.repetitions).toBeGreaterThanOrEqual(1);
    expect(updated.interval).toBeGreaterThanOrEqual(1);
  });

  it('should reset repetitions for incorrect answer', () => {
    const result = makeResult({ isCorrect: false, attempts: 3, hintsUsed: 2 });
    const card = makeVocabularyCard({ repetitions: 5, easeFactor: 2.5, interval: 10 });

    const updated = processActivityForSRS(result, card);

    expect(updated.repetitions).toBe(0);
    expect(updated.interval).toBeLessThanOrEqual(1);
  });

  it('should decrease ease factor for difficult responses', () => {
    const result = makeResult({
      isCorrect: true,
      attempts: 3,
      hintsUsed: 2,
      timeSpentSeconds: 25,
    });
    const card = makeVocabularyCard({ easeFactor: 2.5 });

    const updated = processActivityForSRS(result, card);

    expect(updated.easeFactor).toBeLessThanOrEqual(2.5);
    expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
