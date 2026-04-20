import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDots, CheckCircle, Gift, Lock, Sparkle } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';

import { SEASONAL_EVENTS } from '@/features/gamification/data/seasonalEvents';
import { useSeasonalEvent } from '@/hooks/useSeasonalEvent';
import type { SeasonalCollectible, SeasonalLesson } from '@/types/gamification';

export default function SeasonalEventScreen() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { activeEvent, daysRemaining, progress, lessonsCompleted, totalLessons, isEventComplete } =
    useSeasonalEvent();

  const event = SEASONAL_EVENTS.find((e) => e.id === eventId);
  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Etkinlik bulunamadı</p>
      </div>
    );
  }

  const isActive = activeEvent?.id === eventId;
  const completedLessons = new Set(progress?.lessonsCompleted ?? []);
  const earnedCollectibles = new Set(progress?.collectiblesEarned ?? []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div
        className="relative px-4 pt-12 pb-6"
        style={{
          background: `linear-gradient(135deg, ${event.colors[0]}, ${event.colors[1]})`,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-white/80 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Geri</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl">{event.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            <p className="text-sm text-white/80">{event.descriptionEn}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <CalendarDots className="h-4 w-4" />
            {isActive ? `${daysRemaining} gün kaldı` : 'Yakında'}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <Sparkle className="h-4 w-4" />
            {event.xpMultiplier}x XP Bonus
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white">
            <Gift className="h-4 w-4" />
            {event.collectibles.length} Ödül
          </div>
        </div>

        {/* Progress */}
        {isActive && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-white/70">
              <span>İlerleme</span>
              <span>
                {lessonsCompleted}/{totalLessons}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-white"
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
        <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">
          📖 Dersler ({event.lessons.length})
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
        <h2 className="mt-8 mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">
          🎁 Sınırlı Süreli Ödüller
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {event.collectibles.map((item) => (
            <CollectibleCard key={item.id} item={item} isEarned={earnedCollectibles.has(item.id)} />
          ))}
        </div>

        {/* Vocabulary preview */}
        <h2 className="mt-8 mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">
          🔤 Öğrenilecek Kelimeler
        </h2>
        <div className="flex flex-wrap gap-2">
          {event.lessons
            .flatMap((l) => l.vocabulary)
            .map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300"
              >
                {word}
              </span>
            ))}
        </div>

        {/* Complete state */}
        {isEventComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20"
          >
            <span className="text-4xl">🏆</span>
            <h3 className="mt-2 text-lg font-bold text-green-700 dark:text-green-400">
              Tebrikler!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-500">
              Bu etkinliğin tüm derslerini tamamladın!
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
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        isCompleted
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : isLocked
            ? 'border-gray-200 bg-gray-100 opacity-60 dark:border-gray-700 dark:bg-gray-800'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      {/* Number badge */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
        }`}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{lesson.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.description}</p>
      </div>

      {/* XP badge */}
      <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
        +{lesson.xpReward} XP
      </div>

      {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
    </motion.div>
  );
}

// ── Collectible Card ─────────────────────────────────────────
function CollectibleCard({ item, isEarned }: { item: SeasonalCollectible; isEarned: boolean }) {
  const rarityColors: Record<string, string> = {
    common: 'border-gray-300',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-amber-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center rounded-xl border-2 p-3 text-center ${
        rarityColors[item.rarity] ?? 'border-gray-300'
      } ${isEarned ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 opacity-60 dark:bg-gray-800/50'}`}
    >
      <span className="text-3xl">{isEarned ? item.emoji : '❓'}</span>
      <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
        {isEarned ? item.name : '???'}
      </p>
      <p className="text-[10px] text-gray-400 capitalize">{item.rarity}</p>
    </motion.div>
  );
}
