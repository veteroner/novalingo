/**
 * ConversationScreen — Standalone "Nova ile Konuş"
 *
 * Lesson pipeline'ından bağımsız konuşma ekranı.
 * Registry'den senaryo seçer, ConversationActivity bileşenini kullanır.
 */

import type { ActivityOutcome } from '@/features/learning/components/activities';
import ConversationActivity from '@/features/learning/components/activities/ConversationActivity';
import { toConversationActivityData } from '@/features/learning/data/conversations';
import { Text } from '@components/atoms/Text';
import { unlockAudioPlayback } from '@services/speech/speechService';
import { useChildStore } from '@stores/childStore';
import { initConversationProgress, useConversationStore } from '@stores/conversationStore';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ConversationScreen() {
  const { t } = useTranslation('lesson');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const child = useChildStore((s) => s.activeChild);
  const { session, scenario, isActive, startSession, completeSession, reset } =
    useConversationStore();
  const hasStartedRef = useRef(false);
  // On mobile browsers audio is blocked until a direct user gesture.
  // We show a tap-to-start overlay first; the tap itself unlocks audio.
  const [audioReady, setAudioReady] = useState(false);
  const preferredTheme = searchParams.get('theme')?.trim() || undefined;
  // worldId param (from WorldMapScreen) takes priority; fall back to child's current world
  const worldIdParam = searchParams.get('worldId')?.trim() || null;
  const activeWorldId = worldIdParam ?? child?.currentWorldId ?? null;
  // Optional: start with a specific scenario selected from the topics screen
  const scenarioIdParam = searchParams.get('scenarioId')?.trim() || undefined;

  // Cleanup only on unmount — session start is triggered by user tap
  useEffect(() => {
    return () => {
      reset();
      hasStartedRef.current = false;
    };
  }, [reset]);

  // Load persisted conversation progress for the active child (survives app restarts)
  useEffect(() => {
    if (child?.id) {
      initConversationProgress(child.id);
    }
  }, [child?.id]);

  const handleTapToStart = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    // Run inside user-gesture context so mobile browsers allow audio playback
    void unlockAudioPlayback();
    startSession({ worldId: activeWorldId, preferredTheme, scenarioId: scenarioIdParam });
    setAudioReady(true);
  }, [activeWorldId, preferredTheme, scenarioIdParam, startSession]);

  const handleComplete = useCallback(
    (outcome: ActivityOutcome) => {
      if (!scenario) return;

      const result = completeSession({
        score: outcome.score,
        accuracy: outcome.score / 100,
        durationSeconds: outcome.timeSpentSeconds,
        attempts: outcome.attempts,
        targetWordsHit:
          outcome.conversationEvidence?.targetWordsHit.length ??
          Math.round((outcome.score / 100) * scenario.targetWords.length),
        targetWordsTotal: scenario.targetWords.length,
      });

      void navigate('/conversation/result', {
        state: {
          result,
          scenario: {
            id: scenario.id,
            title: scenario.title,
            titleTr: scenario.titleTr,
            sceneEmoji: scenario.sceneEmoji,
            targetWords: scenario.targetWords,
            rewardType: scenario.reward.rewardType,
            rewardId: scenario.reward.rewardId,
            series: scenario.series,
          },
        },
      });
    },
    [scenario, completeSession, navigate],
  );

  const handleClose = useCallback(() => {
    reset();
    void navigate('/home');
  }, [navigate, reset]);

  // Tap-to-start overlay — ensures audio is unlocked via direct user gesture on mobile
  if (!audioReady) {
    return (
      <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-indigo-50 to-white px-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 text-7xl"
        >
          🎭
        </motion.div>
        <Text variant="h3" align="center" className="mb-2">
          {t('activities.conversationScreenTitle')}
        </Text>
        <Text variant="bodySmall" align="center" className="mb-8 text-gray-500">
          {t('activities.conversationScreenSubtitle')}
        </Text>
        <button
          onClick={handleTapToStart}
          className="rounded-2xl bg-indigo-500 px-8 py-4 text-lg font-bold text-white shadow-lg active:bg-indigo-600"
        >
          {t('activities.conversationScreenStart')}
        </button>
      </div>
    );
  }

  // Loading state — session started but scenario not yet ready
  if (!session || !scenario || !isActive) {
    return (
      <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mb-4 text-6xl"
        >
          🎭
        </motion.div>
        <Text variant="h3" align="center">
          {t('activities.conversationScreenLoading')}
        </Text>
      </div>
    );
  }

  // Convert scenario to legacy ConversationData for the existing component
  // TODO: Phase 4 — ConversationActivity should consume ConversationScenario directly

  const conversationData = toConversationActivityData(scenario);

  return (
    <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          onClick={handleClose}
        >
          <span className="text-lg">✕</span>
        </button>
        <div className="flex flex-col items-center text-center">
          <Text variant="bodySmall" weight="bold">
            {scenario.sceneEmoji} {t('activities.conversationScreenTitle')}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {scenario.titleTr}
          </Text>
          {scenario.series && (
            <div className="mt-0.5 flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5">
              <Text variant="caption" className="text-[10px] font-semibold text-purple-600">
                📖 {scenario.series.seriesTitleTr} ·{' '}
                {t('activities.conversationScreenEpisode', {
                  episode: scenario.series.episodeNumber,
                  total: scenario.series.totalEpisodes,
                })}
              </Text>
            </div>
          )}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Conversation Activity */}
      <div className="flex flex-1 flex-col">
        <ConversationActivity
          data={conversationData}
          onComplete={handleComplete}
          worldId={activeWorldId}
        />
      </div>
    </div>
  );
}
