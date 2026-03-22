/**
 * Conversation Store
 *
 * Standalone "Nova ile Konuş" oturum yönetimi.
 * lessonStore'dan tamamen bağımsız — kendi session/result/progress akışı.
 */

import type {
    ConversationProgress,
    ConversationResult,
    ConversationSession,
} from '@/features/conversation/types/conversationSession';
import type { ConversationScenario } from '@/features/learning/data/conversations';
import {
    selectConversationScenario,
} from '@/features/learning/data/conversations';
import { create } from 'zustand';

interface ConversationStoreState {
  // Active session
  session: ConversationSession | null;
  scenario: ConversationScenario | null;
  result: ConversationResult | null;
  isActive: boolean;

  // Persistent progress (in-memory; can be synced to backend later)
  progress: ConversationProgress;

  // Actions
  startSession: (params: { worldId: string | null; excludeScenarioIds?: string[] }) => void;
  completeSession: (outcome: {
    score: number;
    accuracy: number;
    durationSeconds: number;
    attempts: number;
    targetWordsHit: number;
    targetWordsTotal: number;
  }) => ConversationResult;
  reset: () => void;
}

let sessionCounter = 0;

const initialProgress: ConversationProgress = {
  completedScenarioIds: [],
  totalSessions: 0,
  bestScores: {},
  lastScenarioId: null,
  lastPlayedAt: null,
};

export const useConversationStore = create<ConversationStoreState>((set, get) => ({
  session: null,
  scenario: null,
  result: null,
  isActive: false,
  progress: { ...initialProgress },

  startSession: ({ worldId, excludeScenarioIds }) => {
    const progress = get().progress;

    // Select a scenario — prefer variety by excluding recently completed
    const exclude = excludeScenarioIds ?? (progress.lastScenarioId ? [progress.lastScenarioId] : []);

    const scenario = selectConversationScenario({
      words: [], // standalone mode — let selector use theme/age matching
      excludeScenarioIds: exclude,
    });

    sessionCounter += 1;
    const session: ConversationSession = {
      id: `conv_${Date.now()}_${sessionCounter}`,
      scenarioId: scenario.id,
      worldId,
      startedAt: Date.now(),
    };

    set({
      session,
      scenario,
      result: null,
      isActive: true,
    });
  },

  completeSession: (outcome) => {
    const state = get();
    if (!state.session || !state.scenario) {
      throw new Error('No active conversation session');
    }

    const result: ConversationResult = {
      sessionId: state.session.id,
      scenarioId: state.scenario.id,
      score: outcome.score,
      accuracy: outcome.accuracy,
      durationSeconds: outcome.durationSeconds,
      attempts: outcome.attempts,
      targetWordsHit: outcome.targetWordsHit,
      targetWordsTotal: outcome.targetWordsTotal,
      completedAt: Date.now(),
    };

    // Update progress
    const prev = state.progress;
    const completedSet = new Set(prev.completedScenarioIds);
    completedSet.add(state.scenario.id);

    const bestScores = { ...prev.bestScores };
    const prevBest = bestScores[state.scenario.id] ?? 0;
    if (outcome.score > prevBest) {
      bestScores[state.scenario.id] = outcome.score;
    }

    set({
      result,
      isActive: false,
      progress: {
        completedScenarioIds: [...completedSet],
        totalSessions: prev.totalSessions + 1,
        bestScores,
        lastScenarioId: state.scenario.id,
        lastPlayedAt: Date.now(),
      },
    });

    return result;
  },

  reset: () => {
    set({
      session: null,
      scenario: null,
      result: null,
      isActive: false,
    });
  },
}));
