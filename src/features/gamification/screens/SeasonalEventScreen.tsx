import {
  ArrowLeftIcon as ArrowLeft,
  BookOpenIcon,
  QuestionIcon,
  TrophyIcon,
  TranslateIcon,
  CalendarDotsIcon as CalendarDots,
  CheckCircleIcon as CheckCircle,
  GiftIcon as Gift,
  LockIcon as Lock,
  SparkleIcon as Sparkle,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { eventBackground } from '@/features/gamification/data/eventAppearance';
import { SEASONAL_EVENTS } from '@/features/gamification/data/seasonalEvents';
import { useSeasonalEvent } from '@/hooks/useSeasonalEvent';
import type { SeasonalCollectible, SeasonalLesson } from '@/types/gamification';

export default function SeasonalEventScreen() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('gamification');
  const english = i18n.language.startsWith('en');
  const { activeEvent, daysRemaining, progress, lessonsCompleted, totalLessons, isEventComplete } =
    useSeasonalEvent();

  const event = SEASONAL_EVENTS.find((e) => e.id === eventId);
  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">{t('event.notFound')}</p>
      </div>
    );
  }

  const isActive = activeEvent?.id === eventId;
  const completedLessons = new Set(isActive ? (progress?.lessonsCompleted ?? []) : []);
  const earnedCollectibles = new Set(isActive ? (progress?.collectiblesEarned ?? []) : []);

  return (
    <div className="bg-surface-elevated min-h-screen">
      {/* Header */}
      <div
        className="relative px-4 pb-6"
        style={{
          paddingTop: 'calc(var(--spacing-safe-top) + 1.5rem)',
          background: eventBackground(event.colors),
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-white hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">{t('event.back')}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl">{event.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{english ? event.nameEn : event.name}</h1>
            <p className="text-sm text-white">
              {english ? event.descriptionEn : event.description}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <CalendarDots className="h-4 w-4" />
            {isActive ? t('event.daysLeft', { count: daysRemaining }) : t('event.soon')}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <Sparkle className="h-4 w-4" />
            {t('event.xpBonus', { multiplier: event.xpMultiplier })}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <Gift className="h-4 w-4" />
            {t('event.rewardCount', { count: event.collectibles.length })}
          </div>
        </div>

        {/* Progress */}
        {isActive && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-white">
              <span>{t('event.progress')}</span>
              <span>
                {lessonsCompleted}/{totalLessons}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="bg-surface h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0}%`,
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Lessons */}
        <h2 className="text-text mb-3 flex items-center gap-2 text-lg font-bold">
          <BookOpenIcon size={24} weight="duotone" aria-hidden="true" />
          {t('event.lessons', { count: event.lessons.length })}
        </h2>
        <div className="space-y-2">
          {event.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              isCompleted={completedLessons.has(lesson.id)}
              isLocked={!isActive}
            />
          ))}
        </div>

        {/* Collectibles */}
        <h2 className="text-text mt-8 mb-3 flex items-center gap-2 text-lg font-bold">
          <Gift size={24} weight="duotone" aria-hidden="true" />
          {t('event.limitedRewards')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.collectibles.map((item) => (
            <CollectibleCard key={item.id} item={item} isEarned={earnedCollectibles.has(item.id)} />
          ))}
        </div>

        {/* Vocabulary preview */}
        <h2 className="text-text mt-8 mb-3 flex items-center gap-2 text-lg font-bold">
          <TranslateIcon size={24} weight="duotone" aria-hidden="true" />
          {t('event.wordsToLearn')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {event.lessons
            .flatMap((l) => l.vocabulary)
            .map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="bg-surface text-text rounded-full px-3 py-1 text-sm shadow-sm"
              >
                {word}
              </span>
            ))}
        </div>

        {/* Complete state */}
        {isActive && isEventComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-success/30 bg-success-soft mt-8 rounded-2xl border-2 p-6 text-center dark:border-green-800 dark:bg-green-900/20"
          >
            <TrophyIcon size={48} weight="duotone" className="mx-auto" aria-hidden="true" />
            <h3 className="text-success-ink dark:text-success-ink mt-2 text-lg font-bold">
              {t('event.congrats')}
            </h3>
            <p className="text-success-ink dark:text-success-ink text-sm">
              {t('event.allComplete')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Lesson Card ──────────────────────────────────────────────
function LessonCard({
  lesson,
  index,
  isCompleted,
  isLocked,
}: {
  lesson: SeasonalLesson;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
}) {
  const { i18n } = useTranslation('gamification');
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isCompleted
          ? 'border-success/30 bg-success-soft dark:border-green-800 dark:bg-green-900/20'
          : isLocked
            ? 'border-border bg-surface-elevated'
            : 'border-border bg-surface'
      }`}
    >
      {/* Number badge */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isCompleted ? 'bg-success text-white' : 'bg-border text-text-secondary dark:bg-gray-600'
        }`}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-text text-sm font-semibold">
          {i18n.language.startsWith('en') ? lesson.titleEn : lesson.title}
        </h4>
        <p className="text-text-secondary text-xs">{lesson.description}</p>
      </div>

      {/* XP badge */}
      <div className="text-reward-ink shrink-0 text-xs font-bold">+{lesson.xpReward} XP</div>

      {isLocked && <Lock className="text-text-secondary h-4 w-4" />}
    </motion.div>
  );
}

// ── Collectible Card ─────────────────────────────────────────
function CollectibleCard({ item, isEarned }: { item: SeasonalCollectible; isEarned: boolean }) {
  const { t, i18n } = useTranslation('gamification');
  const rarityColors: Record<string, string> = {
    common: 'border-border',
    uncommon: 'border-success/50',
    rare: 'border-primary/30',
    epic: 'border-purple-400',
    legendary: 'border-amber-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center rounded-xl border-2 p-3 text-center ${
        rarityColors[item.rarity] ?? 'border-border'
      } ${isEarned ? 'bg-surface' : 'bg-surface-elevated'}`}
    >
      <span className="text-3xl">
        {isEarned ? item.emoji : <QuestionIcon size={32} weight="duotone" aria-hidden="true" />}
      </span>
      <p className="text-text mt-1 text-xs font-medium">
        {isEarned
          ? i18n.language.startsWith('en')
            ? item.nameEn
            : item.name
          : t('event.lockedReward')}
      </p>
      <p className="text-text-secondary text-xs leading-normal">
        {t(`rarity.${item.rarity}`, { defaultValue: item.rarity })}
      </p>
    </motion.div>
  );
}
