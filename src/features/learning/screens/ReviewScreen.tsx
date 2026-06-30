/**
 * ReviewScreen
 *
 * SRS tekrar ekranı — vadesi gelen kelimeleri çeşitli aktivitelerle tekrar et.
 * getReviewQueue() ile sırası gelen kartları çeker,
 * generateReviewLesson() ile tekrar dersi oluşturur.
 */

import type { ActivityOutcome } from '@/features/learning/components/activities';
import { ActivityRenderer } from '@/features/learning/components/activities';
import type { LessonSession } from '@/services/learning/learningEngine';
import { generateReviewLesson } from '@/services/learning/learningEngine';
import { calculateSRSStats, type SRSStats } from '@/services/srs/srsEngine';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { useVocabularyCards } from '@hooks/queries';
import { useChildStore } from '@stores/childStore';
import { useLessonStore } from '@stores/lessonStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('lesson');
  const child = useChildStore((s) => s.activeChild);
  const { data: vocabularyCards } = useVocabularyCards(child?.id);

  const { currentActivityIndex, activities, startLesson, submitResult, nextActivity, endLesson } =
    useLessonStore();

  const sessionRef = useRef<LessonSession | null>(null);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      useLessonStore.getState().reset();
      sessionRef.current = null;
    };
  }, []);

  const stats: SRSStats | null = useMemo(() => {
    if (!vocabularyCards || vocabularyCards.length === 0) return null;
    return calculateSRSStats(vocabularyCards);
  }, [vocabularyCards]);

  const handleStart = useCallback(() => {
    if (!vocabularyCards || vocabularyCards.length === 0) return;

    const session = generateReviewLesson(vocabularyCards, child?.level ?? 1);
    if (!session) return;

    sessionRef.current = session;
    startLesson('review', session.activities);
    setStarted(true);
  }, [vocabularyCards, child, startLesson]);

  const handleActivityComplete = useCallback(
    (outcome: ActivityOutcome) => {
      const activity = activities[currentActivityIndex];
      if (!activity) return;

      if (outcome.isCorrect) setCorrectCount((c) => c + 1);
      submitResult({
        activityId: activity.id,
        activityType: activity.type,
        isCorrect: outcome.isCorrect,
        score: outcome.score,
        timeSpentSeconds: outcome.timeSpentSeconds,
        attempts: outcome.attempts,
        hintsUsed: outcome.hintsUsed,
        conversationEvidence: outcome.conversationEvidence,
      });

      feedbackTimerRef.current = setTimeout(() => {
        if (currentActivityIndex < activities.length - 1) {
          nextActivity();
        } else {
          setCompleted(true);
          endLesson();
        }
      }, 800);
    },
    [activities, currentActivityIndex, submitResult, nextActivity, endLesson],
  );

  const currentActivity = activities[currentActivityIndex];

  // ===== NO CARDS STATE =====
  if (!stats || stats.totalCards === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Text variant="h2" align="center">
          {t('review.title')}
        </Text>
        <Text variant="body" align="center" className="text-text-secondary">
          {t('review.emptyMessage')}
        </Text>
        <Button onClick={() => navigate('/home')}>{t('review.backHome')}</Button>
      </div>
    );
  }

  // ===== STATS SCREEN (before start) =====
  if (!started) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Text variant="h2" align="center">
          {t('review.title')}
        </Text>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t('review.statDueToday')} value={stats.dueToday} emoji="🔔" highlight />
          <StatCard label={t('review.statTotal')} value={stats.totalCards} emoji="📖" />
          <StatCard label={t('review.statLearning')} value={stats.learningCards} emoji="📝" />
          <StatCard label={t('review.statMastered')} value={stats.masteredCards} emoji="⭐" />
        </div>

        {stats.dueToday > 0 ? (
          <Button onClick={handleStart} size="lg">
            {t('review.start', { count: stats.dueToday })}
          </Button>
        ) : (
          <div className="text-center">
            <Text variant="body" className="text-green-600">
              {t('review.doneToday')}
            </Text>
            <Button variant="secondary" onClick={() => navigate('/home')} className="mt-4">
              {t('review.backHome')}
            </Button>
          </div>
        )}

        <Button variant="ghost" onClick={() => navigate('/home')}>
          {t('review.back')}
        </Button>
      </div>
    );
  }

  // ===== COMPLETED STATE =====
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-screen flex-col items-center justify-center gap-6 p-6"
      >
        <Text variant="h1" align="center">
          🎉
        </Text>
        <Text variant="h2" align="center">
          {t('review.completedTitle')}
        </Text>
        <Text variant="body" align="center" className="text-text-secondary">
          {t('review.score', { correct: correctCount, total: activities.length })}
        </Text>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/home')}>{t('review.backHome')}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setStarted(false);
              setCompleted(false);
              setCorrectCount(0);
              sessionRef.current = null;
            }}
          >
            {t('review.retry')}
          </Button>
        </div>
      </motion.div>
    );
  }

  // ===== ACTIVITY STATE =====
  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar */}
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
          ✕
        </Button>
        <div className="h-2 flex-1 rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{
              width: `${activities.length > 0 ? ((currentActivityIndex + 1) / activities.length) * 100 : 0}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <Text variant="bodySmall" className="text-text-secondary">
          {currentActivityIndex + 1}/{activities.length}
        </Text>
      </div>

      {/* Activity */}
      <div className="flex flex-1 items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {currentActivity && (
            <motion.div
              key={currentActivity.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="w-full max-w-md"
            >
              <ActivityRenderer activity={currentActivity} onComplete={handleActivityComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== Helper Components =====

function StatCard({
  label,
  value,
  emoji,
  highlight = false,
}: {
  label: string;
  value: number;
  emoji: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 text-center ${
        highlight ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <Text variant="h3" className={highlight ? 'text-blue-700' : ''}>
        {value}
      </Text>
      <Text variant="bodySmall" className="text-text-secondary">
        {label}
      </Text>
    </div>
  );
}
