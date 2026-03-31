/**
 * ConversationTopicsScreen — "Nova ile Konuş" konu seçici
 *
 * Çocuğun bulunduğu dünyaya ait senaryoları grid halinde listeler.
 * Her kart: senaryo emoji'si, tamamlama yıldızları ve Türkçe başlık gösterir.
 */

import type { ConversationScenario } from '@/features/learning/data/conversations';
import {
  ALL_CONVERSATION_SCENARIOS,
  PHASE1_CONVERSATION_SCENARIOS,
  PHASE2_CONVERSATION_SCENARIOS,
  PHASE3_CONVERSATION_SCENARIOS,
  PHASE4_CONVERSATION_SCENARIOS,
  PHASE5_CONVERSATION_SCENARIOS,
} from '@/features/learning/data/conversations';
import { WORLD_TO_PHASE } from '@/features/learning/data/conversations/selectors/selectConversationScenario';
import { Text } from '@components/atoms/Text';
import { StarRating } from '@components/molecules/StarRating';
import { useChildStore } from '@stores/childStore';
import { initConversationProgress, useConversationStore } from '@stores/conversationStore';
import { calculateStars } from '@utils/xp';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Phase → scenario list ────────────────────────────────────────────────────

const PHASE_SCENARIOS: Record<string, ConversationScenario[]> = {
  phase1: PHASE1_CONVERSATION_SCENARIOS,
  phase2: PHASE2_CONVERSATION_SCENARIOS,
  phase3: PHASE3_CONVERSATION_SCENARIOS,
  phase4: PHASE4_CONVERSATION_SCENARIOS,
  phase5: PHASE5_CONVERSATION_SCENARIOS,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConversationTopicsScreen() {
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);
  const progress = useConversationStore((s) => s.progress);

  // Load persisted progress so star ratings reflect previous sessions
  useEffect(() => {
    if (child?.id) {
      initConversationProgress(child.id);
    }
  }, [child?.id]);

  const worldId = child?.currentWorldId ?? 'w1';
  const phase = (WORLD_TO_PHASE[worldId] as string | undefined) ?? 'phase1';
  const scenarios = PHASE_SCENARIOS[phase] ?? ALL_CONVERSATION_SCENARIOS;

  return (
    <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col bg-linear-to-b from-indigo-50 to-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Geri"
        >
          <span className="text-lg">←</span>
        </button>
        <div>
          <Text variant="h3">Nova ile Konuş 🎭</Text>
          <Text variant="caption" className="text-text-secondary">
            Bir konu seç ve konuşmaya başla!
          </Text>
        </div>
      </div>

      {/* ── Scenario grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-6 overflow-y-auto px-4 pb-10">
        {scenarios.map((scenario, i) => {
          const bestScore = progress.bestScores[scenario.id] ?? 0;
          // Convert score (0-100) → accuracy (0-1) → stars (0-3)
          // Uses the same LESSON.STAR_THRESHOLDS as the rest of the app
          const stars = calculateStars(bestScore / 100);
          const isCompleted = progress.completedScenarioIds.includes(scenario.id);

          return (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => navigate(`/conversation?scenarioId=${scenario.id}`)}
              className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
            >
              {/* Circle icon */}
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-md ${
                  isCompleted ? 'bg-teal-400' : 'bg-indigo-400'
                }`}
              >
                {scenario.sceneEmoji}
              </div>

              {/* Stars — driven by real best-score for this child */}
              <StarRating stars={stars} size="sm" animate={false} />

              {/* Title */}
              <Text
                variant="caption"
                align="center"
                className="line-clamp-2 w-full text-center text-[11px] leading-tight font-semibold text-gray-700"
              >
                {scenario.titleTr}
              </Text>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
