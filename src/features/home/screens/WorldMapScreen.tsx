/**
 * WorldMapScreen
 *
 * Dünya içi ünite ve ders haritası — Duolingo-vari path layout.
 * Ders node'ları zigzag pattern ile dizilir.
 */

import type { Lesson } from '@/types';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { LessonCard } from '@components/organisms/LessonCard';
import { MainLayout } from '@components/templates/MainLayout';
import { getWorld } from '@features/learning/data/curriculum';
import { useLessonProgress, useLessons } from '@hooks/queries';
import { unlockAudioPlayback } from '@services/speech/speechService';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Lesson with local status overlay
interface LessonWithStatus extends Lesson {
  status: 'locked' | 'active' | 'completed' | 'perfect';
  stars: number;
}

// Build fallback lessons from curriculum data
function buildCurriculumLessons(worldId: string): LessonWithStatus[] {
  const world = getWorld(worldId);
  if (!world) return [];
  return world.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      unitId: unit.id,
      worldId: world.id,
      name: lesson.name,
      nameEn: lesson.nameEn,
      type: lesson.type,
      difficulty: lesson.difficulty,
      order: lesson.order,
      requiredStars: 0,
      estimatedMinutes: lesson.estimatedMinutes,
      xpReward: lesson.xpReward,
      starReward: lesson.starReward,
      activities: [],
      vocabulary: lesson.vocabulary,
      status: 'locked' as const,
      stars: 0,
    })),
  );
}

export default function WorldMapScreen() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);

  const curWorld = useMemo(() => getWorld(worldId ?? 'w1'), [worldId]);
  const fallback = useMemo(() => buildCurriculumLessons(worldId ?? 'w1'), [worldId]);

  // Fetch all units' lessons for this world (not just 'u1')
  const firstUnitId = curWorld?.units[0]?.id ?? 'u1';
  const { data: firestoreLessons } = useLessons(worldId ?? 'w1', firstUnitId);

  // Fetch per-lesson progress to determine completion per lesson (not global counter)
  const { data: lessonProgress } = useLessonProgress(child?.id);
  const completedLessonIds = useMemo(() => {
    if (!lessonProgress) return new Set<string>();
    return new Set(lessonProgress.map((lp) => lp.lessonId));
  }, [lessonProgress]);

  const emoji = curWorld?.emoji ?? '🌍';
  const worldName = curWorld?.name ?? 'Dünya';

  // Apply status based on per-lesson completion data
  const applyStatus = (list: LessonWithStatus[]): LessonWithStatus[] => {
    let foundFirstIncomplete = false;
    return list.map((lesson) => {
      const isCompleted = completedLessonIds.has(lesson.id);
      const isActive = !isCompleted && !foundFirstIncomplete;
      if (isActive) foundFirstIncomplete = true;
      return {
        ...lesson,
        status: isCompleted
          ? 'completed'
          : isActive
            ? 'active'
            : !foundFirstIncomplete
              ? 'active'
              : 'locked',
        stars: isCompleted ? 2 : 0,
      } as LessonWithStatus;
    });
  };

  const lessons = useMemo(() => {
    if (firestoreLessons && firestoreLessons.length > 0) {
      const withStatus: LessonWithStatus[] = firestoreLessons.map((l) => ({
        ...l,
        status: 'locked' as const,
        stars: 0,
      }));
      return applyStatus(withStatus);
    }
    return applyStatus(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreLessons, fallback, child]);

  const completedCount = lessons.filter(
    (l) => l.status === 'completed' || l.status === 'perfect',
  ).length;
  const progress = lessons.length > 0 ? completedCount / lessons.length : 0;

  return (
    <MainLayout headerOffset>
      {/* World Header */}
      <motion.div
        className="from-nova-blue to-nova-blue/80 rounded-b-3xl bg-linear-to-b px-4 py-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/home')}
          className="mb-2 text-sm font-semibold text-white/80"
        >
          ← Dünyalar
        </button>
        <Text variant="h3" className="text-white">
          {emoji} {worldName}
        </Text>
        <Text variant="bodySmall" className="mb-3 text-white/80">
          {curWorld?.units.map((u) => u.name).join(' · ') ?? 'Üniteler'}
        </Text>
        <ProgressBar value={progress} size="sm" variant="lesson" showLabel={false} />
        <Text variant="caption" className="mt-1 text-white/60">
          {completedCount}/{lessons.length} ders tamamlandı
        </Text>
      </motion.div>

      {/* Lesson Path */}
      <div className="flex flex-col items-center gap-6 py-8">
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            status={lesson.status}
            stars={lesson.stars}
            index={index}
            onClick={() => {
              if (lesson.status === 'locked') return;
              void unlockAudioPlayback().finally(() => {
                void navigate(`/lesson/${lesson.id}`);
              });
            }}
          />
        ))}
      </div>
    </MainLayout>
  );
}
