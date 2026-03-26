/**
 * Curriculum Validation — ensures every lesson has required enrichment fields.
 */
import { describe, expect, it } from 'vitest';
import { curriculum } from '../curriculum';

const allLessons = curriculum.flatMap((w) =>
  w.units.flatMap((u) => u.lessons.map((l) => ({ worldId: w.id, unitId: u.id, lesson: l }))),
);

describe('Curriculum enrichment completeness', () => {
  it('should have at least 200 lessons', () => {
    expect(allLessons.length).toBeGreaterThanOrEqual(200);
  });

  for (const { worldId, unitId, lesson } of allLessons) {
    const label = `${worldId}/${unitId}/${lesson.id}`;

    it(`${label} has objective`, () => {
      expect(lesson.objective).toBeTruthy();
      expect(typeof lesson.objective).toBe('string');
      expect(lesson.objective!.length).toBeGreaterThan(10);
    });

    it(`${label} has canDo`, () => {
      expect(lesson.canDo).toBeTruthy();
      expect(typeof lesson.canDo).toBe('string');
      expect(lesson.canDo!.length).toBeGreaterThan(5);
    });

    it(`${label} has chunks`, () => {
      expect(lesson.chunks).toBeTruthy();
      expect(Array.isArray(lesson.chunks)).toBe(true);
      expect(lesson.chunks!.length).toBeGreaterThan(0);
    });

    it(`${label} has introLine`, () => {
      expect(lesson.introLine).toBeTruthy();
      expect(typeof lesson.introLine).toBe('string');
    });

    it(`${label} has outroLine`, () => {
      expect(lesson.outroLine).toBeTruthy();
      expect(typeof lesson.outroLine).toBe('string');
    });

    it(`${label} has outcomeTag`, () => {
      expect(lesson.outcomeTag).toBeTruthy();
      expect(typeof lesson.outcomeTag).toBe('string');
    });

    it(`${label} has vocabulary`, () => {
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
    });

    it(`${label} has activityTypes`, () => {
      expect(lesson.activityTypes.length).toBeGreaterThan(0);
    });
  }
});
