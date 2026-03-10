/**
 * LessonScreen
 *
 * Ders oynama ekranı — aktiviteler sırayla gösterilir.
 * FlashCard, MatchPairs, ListenAndTap, WordBuilder, FillBlank vb.
 * Her aktivite kendi interaktif bileşeniyle render edilir.
 */

import type { ActivityOutcome } from '@/features/learning/components/activities';
import { ActivityRenderer } from '@/features/learning/components/activities';
import { generateActivities } from '@/features/learning/data/activityGenerator';
import { getLesson as getCurriculumLesson } from '@/features/learning/data/curriculum';
import { getMockActivities } from '@/features/learning/data/mockLessons';
import type { Lesson } from '@/types/content';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { LessonLayout } from '@components/templates/LessonLayout';
import { useLessonProgress, useSubmitLesson, useVocabularyCards } from '@hooks/queries';
import { sfxCorrect, sfxIncorrect, sfxLessonComplete } from '@services/audio/synthSfx';
import {
  checkNovaEvolution,
  processLessonResult,
} from '@services/gamification/gamificationService';
import {
  prepareLesson,
  processActivityForSRS,
  type LessonSession,
} from '@services/learning/learningEngine';
import { enqueueAction } from '@services/offline/offlineDB';
import { useChildStore } from '@stores/childStore';
import { useLessonStore } from '@stores/lessonStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LessonScreen() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const {
    currentActivityIndex,
    activities,
    isPaused,
    startedAt,
    startLesson,
    submitResult,
    nextActivity,
    pauseLesson,
    resumeLesson,
    endLesson,
  } = useLessonStore();

  const child = useChildStore((s) => s.activeChild);
  const addXP = useChildStore((s) => s.addXP);
  const updateStreak = useChildStore((s) => s.updateStreak);
  const updateCurrency = useChildStore((s) => s.updateCurrency);
  const submitLessonMutation = useSubmitLesson();
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef<LessonSession | null>(null);
  const lessonTypeRef = useRef<'normal' | 'boss' | 'review' | 'bonus'>('normal');

  // Boss lesson state — 3 lives, wrong answer = lose a life
  const [bossLives, setBossLives] = useState(3);
  const [bossTimerActive, setBossTimerActive] = useState(false);
  const [bossTimeLeft, setBossTimeLeft] = useState(0);
  const bossTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isBoss = lessonTypeRef.current === 'boss';

  // Fetch child's vocabulary cards & lesson progress for SRS + adaptive difficulty
  const { data: vocabularyCards } = useVocabularyCards(child?.id);
  const { data: lessonProgressData } = useLessonProgress(child?.id);

  // Compute lesson session ONCE per mount — never recompute mid-lesson
  if (!sessionRef.current && lessonId) {
    const curLesson = getCurriculumLesson(lessonId);
    if (!curLesson) {
      // Fall back to handcrafted mock lessons
      lessonTypeRef.current = 'normal';
      sessionRef.current = {
        lessonId,
        activities: getMockActivities(lessonId),
        difficulty: {
          level: 'easy',
          distractorCount: 2,
          timeMultiplier: 1.5,
          autoHints: true,
          maxHints: 3,
          activitiesPerLesson: 6,
          newWordRatio: 0.8,
          xpMultiplier: 1,
        },
        startedAt: Date.now(),
        vocabulary: [],
      };
    } else {
      lessonTypeRef.current = curLesson.type;
      // Generate raw activities from curriculum
      const rawActivities = generateActivities(curLesson);

      // Bridge CurriculumLesson → Lesson for prepareLesson
      const lesson: Lesson = {
        id: curLesson.id,
        unitId: '',
        worldId: '',
        name: curLesson.name,
        nameEn: curLesson.nameEn,
        type: curLesson.type,
        difficulty: curLesson.difficulty,
        order: curLesson.order,
        requiredStars: 0,
        estimatedMinutes: curLesson.estimatedMinutes,
        xpReward: curLesson.xpReward,
        starReward: curLesson.starReward,
        activities: rawActivities,
        vocabulary: curLesson.vocabulary,
      };

      // Build recent performance from last 5 lesson results
      const recentPerformance = (lessonProgressData ?? []).slice(0, 5).map((lp) => ({
        accuracy: lp.accuracy,
        score: lp.score,
        hintsUsed: lp.hintsUsed,
        durationSeconds: lp.durationSeconds,
        isPerfect: lp.isPerfect,
      }));

      sessionRef.current = prepareLesson({
        lesson,
        recentPerformance,
        childLevel: child?.level ?? 1,
        vocabularyCards: vocabularyCards ?? [],
      });
    }
  }
  const lessonSession = sessionRef.current;

  useEffect(() => {
    if (lessonId && lessonSession && !useLessonStore.getState().isActive) {
      startLesson(lessonId, lessonSession.activities);
      // Boss lesson: start a global per-activity countdown (30s per activity)
      if (lessonTypeRef.current === 'boss') {
        setBossTimeLeft(30);
        setBossTimerActive(true);
      }
    }
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      if (bossTimerRef.current) {
        clearInterval(bossTimerRef.current);
        bossTimerRef.current = null;
      }
      useLessonStore.getState().reset();
      sessionRef.current = null;
    };
  }, [lessonId, startLesson, lessonSession]);

  // Boss timer countdown
  useEffect(() => {
    if (!bossTimerActive) return;
    bossTimerRef.current = setInterval(() => {
      setBossTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — treat as wrong answer, lose a life
          setBossLives((l) => l - 1);
          return 30; // reset for next activity
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (bossTimerRef.current) clearInterval(bossTimerRef.current);
    };
  }, [bossTimerActive]);

  // Boss: game over when lives hit 0
  useEffect(() => {
    if (!isBoss || bossLives > 0) return;
    setBossTimerActive(false);
    const summary = endLesson();
    sfxIncorrect();
    void navigate(`/lesson/${lessonId}/result`, {
      state: { summary, bossGameOver: true, vocabulary: sessionRef.current?.vocabulary ?? [] },
    });
  }, [bossLives, isBoss, endLesson, navigate, lessonId]);

  const totalActivities = activities.length;
  const progress = totalActivities > 0 ? (currentActivityIndex + 1) / totalActivities : 0;
  const currentActivity = activities[currentActivityIndex];

  const timeElapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;

  const handleClose = useCallback(() => {
    pauseLesson();
    void navigate('/home');
  }, [navigate, pauseLesson]);

  /** Called by each ActivityRenderer when the child completes the activity */
  const handleActivityComplete = useCallback(
    (outcome: ActivityOutcome) => {
      if (!currentActivity) return;

      submitResult({
        activityId: currentActivity.id,
        activityType: currentActivity.type,
        isCorrect: outcome.isCorrect,
        score: outcome.score,
        timeSpentSeconds: outcome.timeSpentSeconds,
        attempts: outcome.attempts,
        hintsUsed: outcome.hintsUsed,
      });

      // Play SFX feedback
      if (outcome.isCorrect) {
        sfxCorrect();
      } else {
        sfxIncorrect();
        // Boss lesson: lose a life on wrong answer
        if (isBoss) {
          setBossLives((prev) => prev - 1);
        }
      }

      // Reset boss timer for next activity
      if (isBoss) {
        setBossTimeLeft(30);
      }

      // Auto-advance after a short delay for feedback
      feedbackTimerRef.current = setTimeout(() => {
        if (currentActivityIndex < totalActivities - 1) {
          nextActivity();
        } else {
          const summary = endLesson();
          const storeState = useLessonStore.getState();

          // Play lesson complete SFX
          sfxLessonComplete();

          // Process SRS updates for vocabulary cards involved in this lesson
          const session = sessionRef.current;
          const cards = vocabularyCards ?? [];
          if (session && cards.length > 0) {
            for (const result of storeState.results) {
              const card = cards.find((c) => session.vocabulary.includes(c.word));
              if (card) {
                // Compute locally (for immediate feedback); backend will also process
                processActivityForSRS(result, card);
              }
            }
          }

          // Submit to backend via mutation (guard against double-submit)
          if (child && !submitLessonMutation.isPending) {
            const activitiesPayload = storeState.results.map((r) => ({
              activityId: r.activityId,
              correct: r.isCorrect,
              timeSpentMs: r.timeSpentSeconds * 1000,
              hintsUsed: r.hintsUsed,
              attempts: r.attempts,
            }));

            submitLessonMutation.mutate(
              {
                childId: child.id,
                lessonId: summary.lessonId,
                activities: activitiesPayload,
                totalTimeMs: summary.durationSeconds * 1000,
              },
              {
                onSuccess: (backendResult) => {
                  // Process gamification UI events (level-up, streak, Nova evolution)
                  const prevLevel = child.level;
                  const prevXP = child.totalXP;
                  processLessonResult(backendResult, prevLevel, prevXP);
                  checkNovaEvolution(prevXP, prevXP + backendResult.xpEarned);

                  // Update streak & stars in local store
                  updateStreak(backendResult.streak);
                  updateCurrency(backendResult.starsEarned, 0);

                  void navigate(`/lesson/${lessonId}/result`, {
                    state: {
                      summary,
                      backendResult,
                      vocabulary: session?.vocabulary ?? [],
                    },
                  });
                },
                onError: () => {
                  // Offline — enqueue for background sync + give local XP estimate
                  addXP(summary.score);
                  void enqueueAction('lessonComplete', {
                    childId: child.id,
                    lessonId: summary.lessonId,
                    activities: activitiesPayload,
                    totalTimeMs: summary.durationSeconds * 1000,
                  });
                  void navigate(`/lesson/${lessonId}/result`, {
                    state: {
                      summary,
                      vocabulary: session?.vocabulary ?? [],
                    },
                  });
                },
              },
            );
          } else {
            void navigate(`/lesson/${lessonId}/result`, {
              state: {
                summary,
                vocabulary: session?.vocabulary ?? [],
              },
            });
          }
        }
      }, 800);
    },
    [
      currentActivity,
      currentActivityIndex,
      totalActivities,
      submitResult,
      nextActivity,
      endLesson,
      navigate,
      lessonId,
      addXP,
      child,
      submitLessonMutation,
      vocabularyCards,
      isBoss,
      updateCurrency,
      updateStreak,
    ],
  );

  if (!currentActivity) {
    return (
      <LessonLayout
        progress={0}
        currentQuestion={0}
        totalQuestions={0}
        onClose={() => navigate('/home')}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mb-4 text-6xl"
          >
            📚
          </motion.div>
          <Text variant="h3" align="center">
            Ders yükleniyor...
          </Text>
        </div>
      </LessonLayout>
    );
  }

  return (
    <LessonLayout
      progress={progress}
      timeElapsed={timeElapsed}
      currentQuestion={currentActivityIndex + 1}
      totalQuestions={totalActivities}
      onClose={handleClose}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentActivity.id}-${currentActivityIndex}`}
          className="flex flex-1 flex-col items-center justify-center px-4 py-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Boss HUD — lives + timer */}
          {isBoss && (
            <div className="mb-4 flex w-full max-w-md items-center justify-between">
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    animate={i < bossLives ? { scale: [1, 1.15, 1] } : { opacity: 0.2 }}
                    transition={{
                      duration: 0.6,
                      repeat: i < bossLives ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  >
                    {i < bossLives ? '❤️' : '🖤'}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  bossTimeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}
                animate={bossTimeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⏱ {bossTimeLeft}s
              </motion.div>
            </div>
          )}

          {/* Activity content — rendered by specialized component */}
          <ActivityRenderer activity={currentActivity} onComplete={handleActivityComplete} />
        </motion.div>
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="space-y-4 rounded-3xl bg-white p-8 text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <Text variant="h3">⏸️ Duraklat</Text>
              <Button variant="primary" size="lg" fullWidth onClick={resumeLesson}>
                Devam Et
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/home')}>
                Dersi Bırak
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LessonLayout>
  );
}
