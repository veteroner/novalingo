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
import { useConversationStore } from '@stores/conversationStore';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConversationScreen() {
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);
  const {
    session,
    scenario,
    isActive,
    startSession,
    completeSession,
    reset,
  } = useConversationStore();
  const hasStartedRef = useRef(false);

  // Start a conversation session on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    void unlockAudioPlayback();

    startSession({
      worldId: child?.currentWorldId ?? null,
    });

    return () => {
      reset();
      hasStartedRef.current = false;
    };
  }, [child?.currentWorldId, startSession, reset]);

  const handleComplete = useCallback(
    (outcome: ActivityOutcome) => {
      if (!scenario) return;

      const result = completeSession({
        score: outcome.score,
        accuracy: outcome.score / 100,
        durationSeconds: outcome.timeSpentSeconds,
        attempts: outcome.attempts,
        targetWordsHit: Math.round((outcome.score / 100) * scenario.targetWords.length),
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

  // Loading state
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
          Senaryo hazırlanıyor...
        </Text>
      </div>
    );
  }

  // Convert scenario to legacy ConversationData for the existing component
  // TODO: Phase 4 — ConversationActivity should consume ConversationScenario directly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        <div className="text-center">
          <Text variant="bodySmall" weight="bold">
            {scenario.sceneEmoji} Nova ile Konuş
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {scenario.titleTr}
          </Text>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Conversation Activity */}
      <div className="flex flex-1 flex-col">
        <ConversationActivity
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data={conversationData}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
