/**
 * Content Service Tests
 *
 * Tests for pure functions: isLessonUnlocked.
 * Async functions (getWorlds, getLessons) require Firebase/Dexie mocks and are tested separately.
 */

import type { Lesson } from '@/types/content';
import { describe, expect, it } from 'vitest';
import { isLessonUnlocked } from '../contentService';

// ===== HELPERS =====

function makeLesson(order: number, id?: string): Lesson {
  return {
    id: id ?? `lesson-${order}`,
    unitId: 'unit-1',
    worldId: 'world-1',
    name: `Ders ${order}`,
    nameEn: `Lesson ${order}`,
    type: 'normal',
    difficulty: 'easy',
    order,
    requiredStars: 0,
    estimatedMinutes: 5,
    xpReward: 50,
    starReward: 3,
    activities: [],
    vocabulary: [],
  };
}

// ===== TESTS =====

describe('isLessonUnlocked', () => {
  const lesson1 = makeLesson(1, 'L1');
  const lesson2 = makeLesson(2, 'L2');
  const lesson3 = makeLesson(3, 'L3');
  const lesson4 = makeLesson(4, 'L4');
  const lessons = [lesson1, lesson2, lesson3, lesson4];

  it('should always unlock first lesson (order 1)', () => {
    const result = isLessonUnlocked(lesson1, lessons, new Set());
    expect(result).toBe(true);
  });

  it('should always unlock lesson with order 0', () => {
    const zeroLesson = makeLesson(0, 'L0');
    const result = isLessonUnlocked(zeroLesson, [zeroLesson, ...lessons], new Set());
    expect(result).toBe(true);
  });

  it('should unlock second lesson when first is completed', () => {
    const completed = new Set(['L1']);
    const result = isLessonUnlocked(lesson2, lessons, completed);
    expect(result).toBe(true);
  });

  it('should NOT unlock second lesson when first is NOT completed', () => {
    const result = isLessonUnlocked(lesson2, lessons, new Set());
    expect(result).toBe(false);
  });

  it('should unlock third lesson when second is completed', () => {
    const completed = new Set(['L1', 'L2']);
    const result = isLessonUnlocked(lesson3, lessons, completed);
    expect(result).toBe(true);
  });

  it('should NOT unlock third lesson when only first is completed', () => {
    const completed = new Set(['L1']);
    const result = isLessonUnlocked(lesson3, lessons, completed);
    expect(result).toBe(false);
  });

  it('should NOT unlock when previous lesson exists but is not completed', () => {
    // Lesson with order 5; lessons array has order 4 which is not completed
    const orphanLesson = makeLesson(5, 'L5');
    const result = isLessonUnlocked(orphanLesson, lessons, new Set());
    expect(result).toBe(false);
  });

  it('should unlock when previous lesson order is missing from list', () => {
    // Lesson with order 10 — no lesson with order 9 in the list → unlocked
    const gapLesson = makeLesson(10, 'L10');
    const result = isLessonUnlocked(gapLesson, lessons, new Set());
    expect(result).toBe(true);
  });

  it('should handle sequential unlock chain', () => {
    // Complete L1 → L2 unlocked
    expect(isLessonUnlocked(lesson2, lessons, new Set(['L1']))).toBe(true);
    // Complete L1+L2 → L3 unlocked
    expect(isLessonUnlocked(lesson3, lessons, new Set(['L1', 'L2']))).toBe(true);
    // Complete L1+L2+L3 → L4 unlocked
    expect(isLessonUnlocked(lesson4, lessons, new Set(['L1', 'L2', 'L3']))).toBe(true);
  });

  it('should handle empty lesson list', () => {
    const lesson = makeLesson(2);
    // No previous lesson found → unlocked
    const result = isLessonUnlocked(lesson, [], new Set());
    expect(result).toBe(true);
  });

  it('should handle single lesson', () => {
    const single = makeLesson(1);
    expect(isLessonUnlocked(single, [single], new Set())).toBe(true);
  });
});
