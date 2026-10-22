import { describe, expect, it } from 'vitest';
import type { LessonProgress } from '@/types/progress';
import { curriculum } from '@features/learning/data/curriculum';
import { buildLearningPath } from './learningPath';

const world = curriculum[0]!;
const base = buildLearningPath(world, undefined, []);
const lessons = base.flatMap((unit) => unit.lessons);
const result = (index: number, starsEarned: number) =>
  ({ lessonId: lessons[index]!.id, starsEarned }) as LessonProgress;

describe('learning path progression', () => {
  it('has exactly one next lesson in a new world', () => {
    expect(lessons.filter((lesson) => lesson.status === 'active')).toHaveLength(1);
    expect(lessons[0]!.status).toBe('active');
    expect(lessons.slice(1).every((lesson) => lesson.status === 'locked')).toBe(true);
  });
  it('does not unlock the next stop after a zero-star attempt', () => {
    const actual = buildLearningPath(world, undefined, [result(0, 0)]).flatMap(
      (unit) => unit.lessons,
    );
    expect(actual[0]!.status).toBe('active');
    expect(actual[1]!.status).toBe('locked');
  });
  it('uses saved stars to distinguish perfect, completed, and next lessons', () => {
    const actual = buildLearningPath(world, undefined, [result(0, 3), result(1, 1)]).flatMap(
      (unit) => unit.lessons,
    );
    expect(actual.slice(0, 4).map((lesson) => lesson.status)).toEqual([
      'perfect',
      'completed',
      'active',
      'locked',
    ]);
  });
  it('preserves curriculum unit order when remote lessons arrive shuffled', () => {
    const remote = lessons.slice().reverse();
    const actual = buildLearningPath(world, remote, []).flatMap((unit) => unit.lessons);
    expect(actual.map((lesson) => lesson.id)).toEqual(lessons.map((lesson) => lesson.id));
    expect(remote[0]!.id).toBe(lessons.at(-1)!.id);
  });
  it('only opens speaking stops when every preceding lesson has been completed', () => {
    const locked = buildLearningPath(world, undefined, [result(0, 3), result(2, 2)])
      .flatMap((unit) => unit.stops)
      .filter((stop) => stop.kind === 'conversation');
    expect(locked[0]).toMatchObject({ unlocked: false });
    const unlocked = buildLearningPath(world, undefined, [result(0, 3), result(1, 2), result(2, 1)])
      .flatMap((unit) => unit.stops)
      .filter((stop) => stop.kind === 'conversation');
    expect(unlocked[0]).toMatchObject({ unlocked: true });
    expect(unlocked[1]).toMatchObject({ unlocked: false });
  });
  it('keeps remote-only units visible', () => {
    const remote = [...lessons, { ...lessons[0]!, id: 'new-remote-lesson', unitId: 'new-unit' }];
    const actual = buildLearningPath(world, remote, []);
    expect(actual.at(-1)!.lessons[0]!.id).toBe('new-remote-lesson');
  });
  it('has no active stop when a world is complete', () => {
    const actual = buildLearningPath(
      world,
      undefined,
      lessons.map((_, index) => result(index, 3)),
    );
    expect(
      actual.flatMap((unit) => unit.lessons).some((lesson) => lesson.status === 'active'),
    ).toBe(false);
    expect(actual.every((unit) => unit.completed === unit.lessons.length)).toBe(true);
  });
  it.each(curriculum.map((entry) => [entry.id, entry] as const))(
    'covers every lesson in %s without changing content',
    (_, entry) => {
      const actual = buildLearningPath(entry, undefined, []);
      expect(actual.flatMap((unit) => unit.lessons).map((lesson) => lesson.id)).toEqual(
        entry.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
      );
      expect(
        actual.flatMap((unit) => unit.stops).filter((stop) => stop.kind === 'conversation'),
      ).toHaveLength(Math.floor(actual.flatMap((unit) => unit.lessons).length / 3));
    },
  );
});
