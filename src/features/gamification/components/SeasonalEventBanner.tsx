import { CalendarDots, CaretRight, Gift, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useSeasonalEvent } from '@/hooks/useSeasonalEvent';

/**
 * SeasonalEventBanner — Ana ekranda aktif/yaklaşan etkinlik gösterir.
 * Aktif event varsa: renkli gradient + progress + CTA
 * Yaklaşan event varsa: muted preview + countdown
 * Hiçbir event yoksa: render etmez
 */
export function SeasonalEventBanner() {
  const navigate = useNavigate();
  const { activeEvent, nextEvent, daysRemaining, lessonsCompleted, totalLessons, isEventComplete } =
    useSeasonalEvent();

  // ── Active event ────────────────────────────────────────────
  if (activeEvent) {
    const progress = totalLessons > 0 ? lessonsCompleted / totalLessons : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate(`/event/${activeEvent.id}`)}
        className="relative cursor-pointer overflow-hidden rounded-2xl p-4 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${activeEvent.colors[0]}, ${activeEvent.colors[1]})`,
        }}
      >
        {/* Sparkle decoration */}
        <div className="pointer-events-none absolute top-2 right-2 opacity-20">
          <Sparkle className="h-16 w-16 text-white" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{activeEvent.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{activeEvent.name}</h3>
            <p className="text-sm text-white/80">{activeEvent.description}</p>
          </div>
          <CaretRight className="h-5 w-5 text-white/60" />
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
          <span className="text-xs font-medium text-white/90">
            {lessonsCompleted}/{totalLessons}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-white/70">
            <CalendarDots className="h-3.5 w-3.5" />
            <span>{daysRemaining} gün kaldı</span>
          </div>
          {isEventComplete ? (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
              <Gift className="h-3 w-3" />
              Tamamlandı!
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-white/70">
              <Sparkle className="h-3.5 w-3.5" />
              {activeEvent.xpMultiplier}x XP
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Upcoming event preview ──────────────────────────────────
  if (nextEvent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <span className="text-xl">{nextEvent.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Yakında: {nextEvent.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{nextEvent.descriptionEn}</p>
        </div>
        <CalendarDots className="h-4 w-4 text-gray-400" />
      </motion.div>
    );
  }

  return null;
}
