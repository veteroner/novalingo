/**
 * ConversationResultScreen — Konuşma Sonuç Ekranı
 *
 * Standalone "Nova ile Konuş" oturumu sonrasında gösterilen sonuç ekranı.
 * LessonResultScreen'den bağımsız — kendi sonuç/ödül semantiğini kullanır.
 */

import type { ConversationResult } from '@/features/conversation/types/conversationSession';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { NovaCompanion } from '@components/organisms/NovaCompanion';
import {
  getConversationScenarioById,
  getNextConversationScenarioId,
} from '@features/learning/data/conversations';
import { getWordEmoji } from '@features/learning/data/wordEmojiMap';
import { recordSessionAndMaybePromptRating } from '@services/ratingService';
import { useConversationStore } from '@stores/conversationStore';
import { formatTime } from '@utils/time';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

interface ScenarioSummary {
  id: string;
  title: string;
  titleTr: string;
  sceneEmoji: string;
  targetWords: string[];
  rewardType?: string;
  rewardId?: string;
  series?: {
    seriesId: string;
    seriesTitleTr: string;
    episodeNumber: number;
    totalEpisodes: number;
  };
}

export default function ConversationResultScreen() {
  const { t } = useTranslation('lesson');
  const location = useLocation();
  const navigate = useNavigate();
  const xpResult = useConversationStore((s) => s.xpResult);
  const isSaving = useConversationStore((s) => s.isSaving);
  const saveError = useConversationStore((s) => s.saveError);

  const state = location.state as {
    result?: ConversationResult;
    scenario?: ScenarioSummary;
  } | null;

  const result = state?.result;
  const scenario = state?.scenario;

  // Animate XP counter once xpResult arrives
  const [displayedXP, setDisplayedXP] = useState(0);
  useEffect(() => {
    if (!xpResult) return;
    let start = 0;
    const end = xpResult.xpEarned;
    if (end === 0) return;
    const step = Math.ceil(end / 20);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplayedXP(start);
      if (start >= end) clearInterval(timer);
    }, 40);
    return () => {
      clearInterval(timer);
    };
  }, [xpResult]);

  // Rating prompt — after a good conversation result
  useEffect(() => {
    if (result && result.accuracy >= 0.8) {
      void recordSessionAndMaybePromptRating();
    }
  }, [result]);

  // ── Next scenario chaining ──
  // Compute the id of the next scenario to play (next story episode or next in registry).
  const nextScenarioId = useMemo(
    () => (scenario?.id ? getNextConversationScenarioId(scenario.id) : undefined),
    [scenario?.id],
  );
  const nextScenario = useMemo(
    () => (nextScenarioId ? getConversationScenarioById(nextScenarioId) : undefined),
    [nextScenarioId],
  );
  const isNextSameSeries = !!(
    nextScenario?.series &&
    scenario?.series &&
    nextScenario.series.seriesId === scenario.series.seriesId
  );

  // Auto-advance countdown: after a successful run (accuracy >= 0.6), give the child
  // a few seconds to celebrate before jumping to the next scenario. Cancellable.
  const AUTO_NEXT_SECONDS = 8;
  const shouldAutoAdvance = !!(result && nextScenarioId && result.accuracy >= 0.6);
  const [autoNextCancelled, setAutoNextCancelled] = useState(false);
  const [autoNextRemaining, setAutoNextRemaining] = useState<number>(AUTO_NEXT_SECONDS);

  const goToNextScenario = () => {
    if (!nextScenarioId) return;
    void navigate(`/conversation?scenarioId=${encodeURIComponent(nextScenarioId)}`, {
      replace: true,
    });
  };

  useEffect(() => {
    if (!shouldAutoAdvance || autoNextCancelled) return;
    if (autoNextRemaining <= 0) {
      goToNextScenario();
      return;
    }
    const tid = setTimeout(() => setAutoNextRemaining((s) => s - 1), 1000);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoAdvance, autoNextCancelled, autoNextRemaining]);

  if (!result || !scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button variant="primary" onClick={() => navigate('/home')}>
          {t('conversationResult.home')}
        </Button>
      </div>
    );
  }

  const getMoodMessage = () => {
    if (result.accuracy >= 0.8)
      return { mood: 'celebrating' as const, msg: t('conversationResult.moodGreat') };
    if (result.accuracy >= 0.5)
      return { mood: 'happy' as const, msg: t('conversationResult.moodGood') };
    return { mood: 'encouraging' as const, msg: t('conversationResult.moodEncouraging') };
  };

  const getRewardCard = () => {
    const type = scenario.rewardType;
    const id = scenario.rewardId ?? '';

    const COLLECTIBLE_EMOJIS: Record<string, string> = {
      'seasons-expert': '🍂',
      'picnic-basket': '🧺',
      'restaurant-star': '⭐',
      'family-photo': '📷',
      'morning-sun': '🌅',
      'school-bag': '🎒',
      'rainbow-star': '🌈',
      'paint-brush': '🎨',
      'shape-box': '📦',
      'toy-star': '⭐',
      'play-team': '🏅',
      'toy-fixer': '🔧',
      'friend-badge': '🤝',
      'fruit-basket': '🍓',
      'compare-master': '⚖️',
      'grammar-star': '📚',
      'action-star': '💥',
      'fashion-badge': '👗',
      'letter-writer': '✉️',
      'library-card': '📖',
      'letter-stamp': '📮',
      'cafe-cup': '☕',
      'party-planner': '🎉',
      'doctor-kit': '🩺',
      'fire-helmet': '🪖',
      'lunchbox-friend': '🥡',
      stopwatch: '⏱️',
      'calendar-star': '📅',
      'lab-badge': '🧪',
      'team-jersey': '👕',
    };

    if (type === 'collectible') {
      const emoji = COLLECTIBLE_EMOJIS[id] ?? '🎁';
      return {
        gradient: 'from-amber-400 to-orange-500',
        icon: emoji,
        label: t('conversationResult.rewardCollectibleLabel'),
        sublabel: id ? id.replace(/-/g, ' ') : 'Yeni öğe',
      };
    }
    if (type === 'badge_progress') {
      return {
        gradient: 'from-violet-500 to-purple-600',
        icon: '🏅',
        label: t('conversationResult.rewardBadgeLabel'),
        sublabel: id ? id.replace(/-/g, ' ') : 'Harika ilerleme',
      };
    }
    if (type === 'sticker') {
      return {
        gradient: 'from-pink-400 to-rose-500',
        icon: '✨',
        label: t('conversationResult.rewardStickerLabel'),
        sublabel: id ? id.replace(/-/g, ' ') : 'Koleksiyonuna eklendi',
      };
    }
    return null;
  };

  const rewardCard = getRewardCard();

  const { mood, msg } = getMoodMessage();

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-linear-to-b to-white px-6">
      {/* Scene Emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="mb-2 text-6xl"
      >
        {scenario.sceneEmoji}
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Text variant="h2" align="center">
          {scenario.rewardType === 'collectible'
            ? t('conversationResult.titleCollectible')
            : scenario.rewardType === 'badge_progress'
              ? t('conversationResult.titleBadge')
              : scenario.rewardType === 'sticker'
                ? t('conversationResult.titleSticker')
                : t('conversationResult.titleDefault')}
        </Text>
        {scenario.series && (
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
              📖 {scenario.series.seriesTitleTr} ·{' '}
              {t('conversationResult.episodeBadge', {
                episode: scenario.series.episodeNumber,
                total: scenario.series.totalEpisodes,
              })}
            </span>
          </div>
        )}
        <Text variant="bodySmall" className="text-text-secondary mt-1">
          {scenario.titleTr}
        </Text>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-success">
            {t('conversationResult.accuracyPercent', {
              percent: Math.round(result.accuracy * 100),
            })}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {t('conversationResult.statAccuracy')}
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-blue">
            {result.targetWordsHit}/{result.targetWordsTotal}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {t('conversationResult.statWords')}
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-orange">
            {formatTime(result.durationSeconds)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {t('conversationResult.statTime')}
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-purple">
            {result.score}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {t('conversationResult.statScore')}
          </Text>
        </div>
      </motion.div>

      {/* XP Reward */}
      <motion.div
        className="mt-4 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {isSaving && !xpResult ? (
          <div className="rounded-2xl bg-yellow-50 p-4 text-center">
            <Text variant="bodySmall" className="text-text-secondary animate-pulse">
              {t('conversationResult.xpLoading')}
            </Text>
          </div>
        ) : saveError ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center">
            <Text variant="bodySmall" className="font-semibold text-orange-600">
              {saveError === 'offline' ? '⚡️ İnternet bağlantısı kesildi' : '⚠️ Kaydedilemedi'}
            </Text>
            <Text variant="caption" className="mt-0.5 block text-orange-400">
              {saveError === 'offline'
                ? 'XP bağlantı geri geldiğinde otomatik kaydedilecek.'
                : 'Bir sorun oluştu. Sonucun yerel olarak saklandı.'}
            </Text>
          </div>
        ) : xpResult ? (
          <div className="rounded-2xl bg-linear-to-r from-yellow-300 to-orange-400 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h3" className="font-bold text-white">
                  +{displayedXP} XP ⭐
                </Text>
                <Text variant="caption" className="text-white/80">
                  {xpResult.streak > 1
                    ? t('conversationResult.xpStreak', { count: xpResult.streak })
                    : t('conversationResult.xpFirst')}
                </Text>
              </div>
              <div className="text-right">
                {xpResult.leveledUp && (
                  <div className="mb-1 rounded-full bg-white/20 px-2 py-0.5">
                    <Text variant="caption" className="font-bold text-white">
                      {t('conversationResult.levelUp', { level: xpResult.newLevel })}
                    </Text>
                  </div>
                )}
                {xpResult.isNewBest && (
                  <div className="rounded-full bg-white/20 px-2 py-0.5">
                    <Text variant="caption" className="font-bold text-white">
                      {t('conversationResult.newRecord')}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Reward Card — varies by rewardType */}
      {rewardCard && (
        <motion.div
          className="mt-4 w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.95, type: 'spring', stiffness: 220 }}
        >
          <div
            className={`flex items-center gap-4 rounded-2xl bg-linear-to-r ${rewardCard.gradient} p-4 shadow-md`}
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {rewardCard.icon}
            </motion.span>
            <div>
              <Text variant="bodySmall" className="font-bold text-white capitalize">
                {rewardCard.label}
              </Text>
              <Text variant="caption" className="text-white/80 capitalize">
                {rewardCard.sublabel}
              </Text>
            </div>
          </div>
        </motion.div>
      )}

      {/* Story series — next episode teaser */}
      {scenario.series && scenario.series.episodeNumber < scenario.series.totalEpisodes && (
        <motion.div
          className="mt-3 w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-purple-50 px-4 py-3">
            <span className="text-2xl">▶️</span>
            <div>
              <Text variant="caption" className="font-semibold text-purple-700">
                {t('conversationResult.nextEpisodeTitle')}
              </Text>
              <Text variant="caption" className="text-purple-500">
                {t('conversationResult.nextEpisodeDesc', {
                  episode: scenario.series.episodeNumber + 1,
                  total: scenario.series.totalEpisodes,
                  seriesTitle: scenario.series.seriesTitleTr,
                })}
              </Text>
            </div>
          </div>
        </motion.div>
      )}

      {/* Target Words Recap */}
      {scenario.targetWords.length > 0 && (
        <motion.div
          className="mt-6 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Text variant="h4" align="center" className="mb-3">
            {t('conversationResult.wordsTitle')}
          </Text>
          <div className="flex flex-wrap justify-center gap-2">
            {scenario.targetWords.map((word) => {
              const emoji = getWordEmoji(word);
              return (
                <div
                  key={word}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-lg">{emoji}</span>
                  <Text variant="bodySmall" className="font-semibold capitalize">
                    {word}
                  </Text>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {result.rawChildResponses && result.rawChildResponses.length > 0 && (
        <motion.div
          className="mt-6 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Text variant="h4" align="center" className="mb-3">
            {t('conversationResult.rawAnswersTitle')}
          </Text>
          <div className="space-y-2">
            {result.rawChildResponses.slice(0, 5).map((answer, index) => (
              <div key={`${answer}-${index}`} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <Text variant="caption" className="text-text-secondary">
                  #{index + 1}
                </Text>
                <Text variant="bodySmall" className="mt-1 font-semibold text-gray-700">
                  {answer}
                </Text>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="mt-8 w-full max-w-sm space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        {nextScenarioId ? (
          <>
            <Button variant="primary" size="xl" fullWidth onClick={goToNextScenario}>
              {isNextSameSeries
                ? t('conversationResult.nextEpisodeButton')
                : t('conversationResult.nextScenario')}
            </Button>
            {shouldAutoAdvance && !autoNextCancelled && (
              <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                <span>
                  {t('conversationResult.autoNextHint', {
                    seconds: Math.max(0, autoNextRemaining),
                  })}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 active:bg-gray-200"
                  onClick={() => setAutoNextCancelled(true)}
                >
                  {t('conversationResult.autoNextCancel')}
                </button>
              </div>
            )}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/conversation', { replace: true })}
            >
              {t('conversationResult.newSession')}
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/home')}>
              {t('conversationResult.home')}
            </Button>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 p-4 text-center shadow-sm">
              <Text variant="bodySmall" className="font-bold text-white">
                {t('conversationResult.allScenariosComplete')}
              </Text>
            </div>
            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => navigate('/conversation', { replace: true })}
            >
              {t('conversationResult.newSession')}
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/home')}>
              {t('conversationResult.home')}
            </Button>
          </>
        )}
      </motion.div>

      {/* Nova */}
      <NovaCompanion mood={mood} message={msg} position="center" size="lg" className="mt-6" />
    </div>
  );
}
