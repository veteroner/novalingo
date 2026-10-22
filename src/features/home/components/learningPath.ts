import type { Lesson } from '@/types/content';
import type { LessonProgress } from '@/types/progress';
import type { CurriculumUnit, CurriculumWorld } from '@features/learning/data/curriculum';

export type LessonStatus = 'locked' | 'active' | 'completed' | 'perfect';
export interface PathLesson extends Lesson {
  status: LessonStatus;
  stars: number;
}
export type PathStop =
  | { kind: 'lesson'; id: string; lesson: PathLesson }
  | { kind: 'conversation'; id: string; unlocked: boolean };
export interface PathUnit {
  unit: CurriculumUnit;
  lessons: PathLesson[];
  stops: PathStop[];
  completed: number;
}

/** Use curriculum order (lesson order restarts in each unit), then overlay saved results.
 * A failed attempt is not a completion; world advancement also requires at least one star.
 */
export function buildLearningPath(
  world: CurriculumWorld,
  remote: Lesson[] | undefined,
  progress: LessonProgress[] | undefined,
): PathUnit[] {
  const fallback: Lesson[] = world.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      ...lesson,
      unitId: unit.id,
      worldId: world.id,
      requiredStars: 0,
      activities: [],
    })),
  );
  const unitOrder = new Map(world.units.map((unit, index) => [unit.id, index]));
  const curriculumOrder = new Map(fallback.map((lesson, index) => [lesson.id, index]));
  const source = (remote?.length ? [...remote] : fallback).sort(
    (a, b) =>
      (unitOrder.get(a.unitId) ?? world.units.length) -
        (unitOrder.get(b.unitId) ?? world.units.length) ||
      (curriculumOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (curriculumOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER) ||
      a.order - b.order,
  );
  const results = new Map(progress?.map((result) => [result.lessonId, result]));
  let hasActive = false;
  const lessons: PathLesson[] = source.map((lesson) => {
    const stars = results.get(lesson.id)?.starsEarned ?? 0;
    const status: LessonStatus =
      stars >= 3 ? 'perfect' : stars >= 1 ? 'completed' : hasActive ? 'locked' : 'active';
    if (status === 'active') hasActive = true;
    return { ...lesson, stars, status };
  });
  // Preserve remote-only units too, rather than silently dropping content from the path.
  const units = [...world.units];
  for (const lesson of lessons) {
    if (!units.some((unit) => unit.id === lesson.unitId)) {
      units.push({
        id: lesson.unitId,
        name: lesson.name,
        nameEn: lesson.nameEn,
        description: '',
        order: units.length + 1,
        lessons: [],
      });
    }
  }
  let count = 0;
  let precedingDone = true;
  return units
    .map((unit) => {
      const unitLessons = lessons.filter((lesson) => lesson.unitId === unit.id);
      const stops: PathStop[] = [];
      for (const lesson of unitLessons) {
        stops.push({ kind: 'lesson', id: lesson.id, lesson });
        count++;
        precedingDone &&= lesson.status === 'completed' || lesson.status === 'perfect';
        if (count % 3 === 0)
          stops.push({
            kind: 'conversation',
            id: `conversation-${count / 3}`,
            unlocked: precedingDone,
          });
      }
      return {
        unit,
        lessons: unitLessons,
        stops,
        completed: unitLessons.filter((lesson) => lesson.stars >= 1).length,
      };
    })
    .filter((entry) => entry.lessons.length > 0);
}

// A smooth, bounded curve rather than a left/right zigzag. Offsets stay safe at 320px.
export const PATH_OFFSETS = [0, -48, -64, -32, 32, 64, 48, 0];
export const PATH_ROW_HEIGHT = 152;
export const pathOffset = (index: number) => PATH_OFFSETS[index % PATH_OFFSETS.length] ?? 0;
