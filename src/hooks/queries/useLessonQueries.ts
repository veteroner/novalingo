/**
 * Lesson TanStack Query Hooks
 *
 * Ders verisi fetch, progress kayıt, sonuç gönderimi.
 */

import type { Lesson, World } from '@/types/content';
import type { LessonProgress, VocabularyCard } from '@/types/progress';
import { curriculum, getWorld, getWorldLessons } from '@features/learning/data/curriculum';
import {
  collections,
  docs,
  getDocument,
  orderBy,
  queryCollection,
} from '@services/firebase/firestore';
import {
  advanceToNextWorld,
  submitLessonResult,
  type SubmitLessonResultReq,
} from '@services/firebase/functions';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { childKeys } from './useChildQueries';

// ===== QUERY KEYS =====
export const lessonKeys = {
  worlds: ['worlds'] as const,
  units: (worldId: string) => ['units', worldId] as const,
  lessons: (worldId: string, unitId: string) => ['lessons', worldId, unitId] as const,
  lesson: (lessonId: string) => ['lesson', lessonId] as const,
  progress: (childId: string) => ['lessonProgress', childId] as const,
  progressDetail: (childId: string, lessonId: string) =>
    ['lessonProgress', childId, lessonId] as const,
  vocabulary: (childId: string) => ['vocabulary', childId] as const,
};

// ===== FETCH WORLDS =====
export function useWorlds() {
  return useQuery({
    queryKey: lessonKeys.worlds,
    queryFn: () => queryCollection<World>(collections.worlds(), orderBy('order')),
    staleTime: 24 * 60 * 60 * 1000, // 24h — content rarely changes
  });
}

// ===== FETCH LESSONS FOR UNIT =====
export function useLessons(worldId: string, unitId: string) {
  return useQuery({
    queryKey: lessonKeys.lessons(worldId, unitId),
    queryFn: () => queryCollection<Lesson>(collections.lessons(worldId, unitId), orderBy('order')),
    enabled: !!worldId && !!unitId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// ===== FETCH ALL LESSONS FOR A WORLD (all units in parallel) =====
export function useWorldLessons(worldId: string) {
  const world = useMemo(() => getWorld(worldId), [worldId]);
  const unitIds = useMemo(() => world?.units.map((u) => u.id) ?? ['u1'], [world]);

  const results = useQueries({
    queries: unitIds.map((unitId) => ({
      queryKey: lessonKeys.lessons(worldId, unitId),
      queryFn: () =>
        queryCollection<Lesson>(collections.lessons(worldId, unitId), orderBy('order')),
      enabled: !!worldId,
      staleTime: 24 * 60 * 60 * 1000,
    })),
  });

  const data = useMemo(() => {
    const all = results.flatMap((r) => r.data ?? []);
    return all.length > 0 ? all : undefined;
  }, [results]);

  const isLoading = results.some((r) => r.isLoading);

  return { data, isLoading };
}

// ===== FETCH CHILD LESSON PROGRESS =====
export function useLessonProgress(childId: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.progress(childId ?? ''),
    queryFn: () => {
      if (!childId) return [];
      return queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
        orderBy('completedAt', 'desc'),
      );
    },
    enabled: !!childId,
    staleTime: 2 * 60 * 1000,
  });
}

// ===== FETCH SINGLE LESSON PROGRESS =====
export function useLessonProgressDetail(childId: string | undefined, lessonId: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.progressDetail(childId ?? '', lessonId ?? ''),
    queryFn: () => {
      if (!childId || !lessonId) return null;
      return getDocument<LessonProgress>(docs.childLessonProgress(childId, lessonId));
    },
    enabled: !!childId && !!lessonId,
  });
}

// ===== FETCH CHILD VOCABULARY CARDS =====
export function useVocabularyCards(childId: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.vocabulary(childId ?? ''),
    queryFn: () => {
      if (!childId) return [];
      return queryCollection<VocabularyCard>(collections.childVocabulary(childId));
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

// ===== SUBMIT LESSON RESULT =====
export function useSubmitLesson() {
  const queryClient = useQueryClient();
  const addXP = useChildStore((s) => s.addXP);
  const updateActiveChild = useChildStore((s) => s.updateActiveChild);
  const child = useChildStore((s) => s.activeChild);
  const uid = useAuthStore((s) => s.firebaseUser?.uid);

  return useMutation({
    mutationFn: (data: SubmitLessonResultReq) => submitLessonResult(data),
    onSuccess: async (result) => {
      addXP(result.xpEarned);
      if (child) {
        updateActiveChild({
          completedLessons: child.completedLessons + 1,
          level: result.newLevel,
        });
      }
      // Invalidate progress & child
      if (child?.id) {
        void queryClient.invalidateQueries({ queryKey: lessonKeys.progress(child.id) });
      }
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: childKeys.list(uid) });
      }
      // Check if current world is fully completed → advance to next world
      if (child?.id && child?.currentWorldId) {
        const childId = child.id;
        const currentWorldId = child.currentWorldId;
        try {
          const worldLessons = getWorldLessons(currentWorldId);
          if (worldLessons.length > 0) {
            const freshProgress = await queryClient.fetchQuery({
              queryKey: lessonKeys.progress(childId),
              queryFn: () =>
                queryCollection<LessonProgress>(
                  collections.childLessonProgress(childId),
                  orderBy('completedAt', 'desc'),
                ),
            });
            const completedWithStars = new Set(
              freshProgress.filter((p) => (p.starsEarned ?? 0) >= 1).map((p) => p.lessonId),
            );
            const allComplete = worldLessons.every((l) => completedWithStars.has(l.id));
            if (allComplete) {
              const worldIds = curriculum.map((w) => w.id);
              const currentIdx = worldIds.indexOf(currentWorldId);
              if (currentIdx >= 0 && currentIdx < worldIds.length - 1) {
                const nextWorldId = worldIds[currentIdx + 1]!;
                await advanceToNextWorld({ childId, nextWorldId });
                updateActiveChild({ currentWorldId: nextWorldId });
                if (uid) {
                  void queryClient.invalidateQueries({ queryKey: childKeys.list(uid) });
                }
              }
            }
          }
        } catch (err) {
          console.warn('[useSubmitLesson] World advancement check failed:', err);
        }
      }
    },
  });
}
