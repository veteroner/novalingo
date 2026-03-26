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
import { getWordEmoji } from '@features/learning/data/wordEmojiMap';
import { useConversationStore } from '@stores/conversationStore';
import { formatTime } from '@utils/time';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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
  const location = useLocation();
  const navigate = useNavigate();
  const xpResult = useConversationStore((s) => s.xpResult);
  const isSaving = useConversationStore((s) => s.isSaving);

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

  if (!result || !scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button variant="primary" onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    );
  }

  const getMoodMessage = () => {
    if (result.accuracy >= 0.8)
      return { mood: 'celebrating' as const, msg: 'Harika konuşma! Nova çok mutlu! 🌟' };
    if (result.accuracy >= 0.5)
      return { mood: 'happy' as const, msg: 'Güzel pratik oldu! Devam et! 💪' };
    return { mood: 'encouraging' as const, msg: 'Her konuşma seni daha iyi yapar! 🎯' };
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
        label: 'Koleksiyona Eklendi!',
        sublabel: id ? id.replace(/-/g, ' ') : 'Yeni öğe',
      };
    }
    if (type === 'badge_progress') {
      return {
        gradient: 'from-violet-500 to-purple-600',
        icon: '🏅',
        label: 'Rozet Puanın Arttı!',
        sublabel: id ? id.replace(/-/g, ' ') : 'Harika ilerleme',
      };
    }
    if (type === 'sticker') {
      return {
        gradient: 'from-pink-400 to-rose-500',
        icon: '✨',
        label: 'Yeni Çıkartma Kazandın!',
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
            ? 'Harika! Koleksiyon Kazandın! 🎁'
            : scenario.rewardType === 'badge_progress'
              ? 'Rozetini İlerletttin! 🏅'
              : scenario.rewardType === 'sticker'
                ? 'Yeni Çıkartma Kazandın! ✨'
                : 'Konuşma Tamamlandı! 🎉'}
        </Text>
        {scenario.series && (
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
              📖 {scenario.series.seriesTitleTr} · {scenario.series.episodeNumber}/
              {scenario.series.totalEpisodes}. Bölüm
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
            %{Math.round(result.accuracy * 100)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Kelime Başarısı
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-blue">
            {result.targetWordsHit}/{result.targetWordsTotal}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Hedef Kelime
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-orange">
            {formatTime(result.durationSeconds)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Süre
          </Text>
        </div>

        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <Text variant="h3" className="text-nova-purple">
            {result.score}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            Puan
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
              XP hesaplanıyor...
            </Text>
          </div>
        ) : xpResult ? (
          <div className="rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-400 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h3" className="font-bold text-white">
                  +{displayedXP} XP ⭐
                </Text>
                <Text variant="caption" className="text-white/80">
                  {xpResult.streak > 1
                    ? `${xpResult.streak} günlük seri 🔥`
                    : 'Bugünkü ilk konuşma!'}
                </Text>
              </div>
              <div className="text-right">
                {xpResult.leveledUp && (
                  <div className="mb-1 rounded-full bg-white/20 px-2 py-0.5">
                    <Text variant="caption" className="font-bold text-white">
                      Seviye {xpResult.newLevel}! 🎊
                    </Text>
                  </div>
                )}
                {xpResult.isNewBest && (
                  <div className="rounded-full bg-white/20 px-2 py-0.5">
                    <Text variant="caption" className="font-bold text-white">
                      Yeni Rekor! 🏆
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
            className={`flex items-center gap-4 rounded-2xl bg-gradient-to-r ${rewardCard.gradient} p-4 shadow-md`}
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
                Sıradaki bölüm hazır!
              </Text>
              <Text variant="caption" className="text-purple-500">
                {scenario.series.episodeNumber + 1}/{scenario.series.totalEpisodes}. Bölüm ·{' '}
                {scenario.series.seriesTitleTr}
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
            🎯 Pratik Edilen Kelimeler
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

      {/* Actions */}
      <motion.div
        className="mt-8 w-full max-w-sm space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => navigate('/conversation', { replace: true })}
        >
          Yeni Konuşma Başlat 🎭
        </Button>

        <Button variant="ghost" size="lg" fullWidth onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </motion.div>

      {/* Nova */}
      <NovaCompanion mood={mood} message={msg} position="center" size="lg" className="mt-6" />
    </div>
  );
}
