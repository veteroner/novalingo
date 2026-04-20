import { useMemo } from 'react';

import {
  getActiveEvent,
  getEventDaysRemaining,
  getNextEvent,
} from '@/features/gamification/data/seasonalEvents';
import type { SeasonalEvent, UserEventProgress } from '@/types/gamification';
import { collections, queryCollection, where } from '@services/firebase/firestore';
import { useChildStore } from '@stores/childStore';
import { useQuery } from '@tanstack/react-query';

export const seasonalEventKeys = {
  progress: (childId: string, eventId: string) => ['eventProgress', childId, eventId] as const,
};

export interface SeasonalEventState {
  /** Currently active event (based on date) */
  activeEvent: SeasonalEvent | undefined;
  /** Next upcoming event */
  nextEvent: SeasonalEvent | undefined;
  /** Days remaining for active event */
  daysRemaining: number;
  /** User progress for the active event */
  progress: UserEventProgress | undefined;
  /** Lessons completed count */
  lessonsCompleted: number;
  /** Total lessons in event */
  totalLessons: number;
  /** Whether the event is fully completed */
  isEventComplete: boolean;
  isLoading: boolean;
}

export function useSeasonalEvent(): SeasonalEventState {
  const childId = useChildStore((s) => s.activeChild?.id);

  const activeEvent = useMemo(() => getActiveEvent(), []);
  const nextEvent = useMemo(() => getNextEvent(), []);
  const daysRemaining = useMemo(
    () => (activeEvent ? getEventDaysRemaining(activeEvent) : 0),
    [activeEvent],
  );

  const { data: progressData, isLoading } = useQuery({
    queryKey: seasonalEventKeys.progress(childId ?? '', activeEvent?.id ?? ''),
    queryFn: async () => {
      if (!childId || !activeEvent) return null;
      const results = await queryCollection<UserEventProgress>(
        collections.childEventProgress(childId),
        where('eventId', '==', activeEvent.id),
      );
      return results[0] ?? null;
    },
    enabled: !!childId && !!activeEvent,
    staleTime: 2 * 60 * 1000,
  });

  const lessonsCompleted = progressData?.lessonsCompleted?.length ?? 0;
  const totalLessons = activeEvent?.lessons?.length ?? 0;
  const isEventComplete = totalLessons > 0 && lessonsCompleted >= totalLessons;

  return {
    activeEvent,
    nextEvent,
    daysRemaining,
    progress: progressData ?? undefined,
    lessonsCompleted,
    totalLessons,
    isEventComplete,
    isLoading,
  };
}
