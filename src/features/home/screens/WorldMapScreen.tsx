/**
 * WorldMapScreen
 *
 * Dünya içi ünite ve ders haritası — Duolingo-vari path layout.
 * Ders node'ları zigzag pattern ile dizilir.
 * Her 3 dersten sonra bir konuşma pratiği node'u eklenir.
 */

import type { Lesson } from '@/types';
import type { LessonProgress } from '@/types/progress';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { LessonCard } from '@components/organisms/LessonCard';
import { MainLayout } from '@components/templates/MainLayout';
import { getWorld } from '@features/learning/data/curriculum';
import { useLessonProgress, useWorldLessons } from '@hooks/queries';
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

// Interleave conversation nodes every N lessons
const CONVERSATION_INTERVAL = 3;

// Node type for mixed lesson/conversation path
interface PathNode {
  type: 'lesson' | 'conversation';
  lesson?: LessonWithStatus;
  conversationIndex?: number;
  worldId?: string;
}

export default function WorldMapScreen() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);

  const curWorld = useMemo(() => getWorld(worldId ?? 'w1'), [worldId]);
  const fallback = useMemo(() => buildCurriculumLessons(worldId ?? 'w1'), [worldId]);

  // Fetch all units' lessons for this world in parallel
  const { data: firestoreLessons } = useWorldLessons(worldId ?? 'w1');

  // Fetch per-lesson progress to determine completion and star rating per lesson
  const { data: lessonProgress } = useLessonProgress(child?.id);
  const lessonProgressMap = useMemo(() => {
    if (!lessonProgress) return new Map<string, LessonProgress>();
    return new Map(lessonProgress.map((lp) => [lp.lessonId, lp]));
  }, [lessonProgress]);

  const emoji = curWorld?.emoji ?? '🌍';
  const worldName = curWorld?.name ?? 'Dünya';

  // Apply status based on per-lesson completion data
  const applyStatus = (list: LessonWithStatus[]): LessonWithStatus[] => {
    let foundFirstIncomplete = false;
    return list.map((lesson) => {
      const lp = lessonProgressMap.get(lesson.id);
      const starsEarned = lp?.starsEarned ?? 0;
      const isCompleted = lessonProgressMap.has(lesson.id);
      const isActive = !isCompleted && !foundFirstIncomplete;
      if (isActive) foundFirstIncomplete = true;
      let status: LessonWithStatus['status'];
      if (isCompleted) {
        status = starsEarned === 3 ? 'perfect' : 'completed';
      } else if (isActive) {
        status = 'active';
      } else if (!foundFirstIncomplete) {
        status = 'active';
      } else {
        status = 'locked';
      }
      return { ...lesson, status, stars: starsEarned } as LessonWithStatus;
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
  }, [firestoreLessons, fallback, lessonProgressMap]);

  const completedCount = lessons.filter(
    (l) => l.status === 'completed' || l.status === 'perfect',
  ).length;
  const progress = lessons.length > 0 ? completedCount / lessons.length : 0;

  // Build interleaved path: lessons + conversation practice nodes
  const pathNodes: PathNode[] = useMemo(() => {
    const nodes: PathNode[] = [];
    let lessonCounter = 0;
    for (const lesson of lessons) {
      nodes.push({ type: 'lesson', lesson });
      lessonCounter++;
      if (lessonCounter % CONVERSATION_INTERVAL === 0) {
        nodes.push({
          type: 'conversation',
          conversationIndex: Math.floor(lessonCounter / CONVERSATION_INTERVAL),
          worldId: worldId ?? 'w1',
        });
      }
    }
    return nodes;
  }, [lessons, worldId]);

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

      {/* Lesson + Conversation Path */}
      <div className="flex flex-col items-center gap-6 py-8">
        {pathNodes.map((node, index) => {
          if (node.type === 'conversation') {
            // Check if preceding lessons are completed
            const precedingLessons = lessons.slice(
              0,
              (node.conversationIndex ?? 1) * CONVERSATION_INTERVAL,
            );
            const allPrecedingDone = precedingLessons.every(
              (l) => l.status === 'completed' || l.status === 'perfect',
            );
            const isConvLocked = !allPrecedingDone;

            return (
              <motion.button
                key={`conv-${node.conversationIndex}`}
                className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 shadow-md transition-all ${
                  isConvLocked
                    ? 'border-gray-200 bg-gray-50 opacity-50'
                    : 'border-nova-blue/30 bg-nova-blue/5 hover:bg-nova-blue/10'
                }`}
                whileTap={isConvLocked ? {} : { scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (isConvLocked) return;
                  void unlockAudioPlayback();
                  navigate(`/conversation?worldId=${node.worldId ?? 'w1'}`);
                }}
                disabled={isConvLocked}
              >
                <span className="text-2xl">{isConvLocked ? '🔒' : '🎭'}</span>
                <div className="text-left">
                  <Text
                    variant="bodySmall"
                    weight="bold"
                    className={isConvLocked ? 'text-gray-400' : 'text-nova-blue'}
                  >
                    Nova ile Konuş
                  </Text>
                  <Text variant="caption" className="text-text-secondary">
                    Öğrendiklerini pratik yap!
                  </Text>
                </div>
                {!isConvLocked && <span className="ml-2 text-lg">→</span>}
              </motion.button>
            );
          }

          const lesson = node.lesson!;
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              status={lesson.status}
              stars={lesson.stars}
              index={index}
              onClick={() => {
                if (lesson.status === 'locked') return;
                void unlockAudioPlayback();
                void navigate(`/lesson/${lesson.id}`);
              }}
            />
          );
        })}
      </div>
    </MainLayout>
  );
}
