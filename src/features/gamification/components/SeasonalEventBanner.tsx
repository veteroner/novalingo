import {
  CalendarDotsIcon as CalendarDots,
  CaretRightIcon as CaretRight,
  GiftIcon as Gift,
  SparkleIcon as Sparkle,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { eventBackground } from '@/features/gamification/data/eventAppearance';
import { useSeasonalEvent } from '@/hooks/useSeasonalEvent';

/**
 * SeasonalEventBanner — Ana ekranda aktif/yaklaşan etkinlik gösterir.
 * Aktif event varsa: renkli gradient + progress + CTA
 * Yaklaşan event varsa: muted preview + countdown
 * Hiçbir event yoksa: render etmez
 */
export function SeasonalEventBanner() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('gamification');
  const english = i18n.language.startsWith('en');
  const { activeEvent, nextEvent, daysRemaining, lessonsCompleted, totalLessons, isEventComplete } =
    useSeasonalEvent();

  // ── Active event ────────────────────────────────────────────
  if (activeEvent) {
    const progress =
      totalLessons > 0 ? Math.min(1, Math.max(0, lessonsCompleted / totalLessons)) : 0;

    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate(`/event/${activeEvent.id}`)}
        className="relative w-full cursor-pointer overflow-hidden rounded-2xl p-4 text-left text-white shadow-lg"
        style={{
          background: eventBackground(activeEvent.colors),
        }}
      >
        {/* Sparkle decoration */}
        <div className="pointer-events-none absolute top-2 right-2 opacity-20">
          <Sparkle className="h-16 w-16 text-white" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{activeEvent.emoji}</span>
          <div className="min-w-0 flex-1">
            <span className="block text-lg font-bold">
              {english ? activeEvent.nameEn : activeEvent.name}
            </span>
            <span className="block text-sm">
              {english ? activeEvent.descriptionEn : activeEvent.description}
            </span>
          </div>
          <CaretRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>
          <span className="text-xs font-medium text-white">
            {lessonsCompleted}/{totalLessons}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-white">
            <CalendarDots className="h-3.5 w-3.5" />
            <span>{t('event.daysLeft', { count: daysRemaining })}</span>
          </div>
          {isEventComplete ? (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
              <Gift className="h-3 w-3" />
              {t('event.completed')}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-white">
              <Sparkle className="h-3.5 w-3.5" />
              {t('event.xpBonus', { multiplier: activeEvent.xpMultiplier })}
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  // ── Upcoming event preview ──────────────────────────────────
  if (nextEvent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-border bg-surface-elevated flex items-center gap-3 rounded-xl border p-3"
      >
        <span className="text-xl">{nextEvent.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-text text-sm font-medium">
            {t('event.upcoming', { name: english ? nextEvent.nameEn : nextEvent.name })}
          </p>
          <p className="text-text-secondary text-xs">
            {english ? nextEvent.descriptionEn : nextEvent.description}
          </p>
        </div>
        <CalendarDots className="text-text-secondary h-4 w-4" />
      </motion.div>
    );
  }

  return null;
}
