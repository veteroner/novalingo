import { FREE_TIER } from '@/config/constants';
import type { World } from '@/types/content';
import type { LessonProgress } from '@/types/progress';
import type { User } from '@/types/user';

function toMillis(value: LessonProgress['completedAt']): number {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  return Date.now();
}

function getTodayStartMs(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function isPremiumUser(user: User | null | undefined): boolean {
  return Boolean(user?.isPremium);
}

export function isWorldPremiumLocked(
  user: User | null | undefined,
  world: Pick<World, 'isPremium'>,
): boolean {
  return Boolean(world.isPremium) && !isPremiumUser(user);
}

export function getLessonsCompletedToday(progress: LessonProgress[] | undefined): number {
  if (!progress || progress.length === 0) return 0;
  const todayStartMs = getTodayStartMs();
  return progress.filter((record) => toMillis(record.completedAt) >= todayStartMs).length;
}

export function hasReachedFreeLessonLimit(
  user: User | null | undefined,
  progress: LessonProgress[] | undefined,
): boolean {
  if (isPremiumUser(user)) return false;
  return getLessonsCompletedToday(progress) >= FREE_TIER.DAILY_LESSONS;
}
