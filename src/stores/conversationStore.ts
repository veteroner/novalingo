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
  getConversationScenarioById,
  selectConversationScenario,
} from '@/features/learning/data/conversations';
import { submitConversationResult } from '@/services/firebase/functions';
import { useChildStore } from '@/stores/childStore';
import { create } from 'zustand';

// ── localStorage persistence (keyed by childId — works without login) ──
const CONV_PROGRESS_KEY = (childId: string) => `conv_progress_${childId}`;

function loadStoredProgress(childId: string): ConversationProgress {
  try {
    const raw = localStorage.getItem(CONV_PROGRESS_KEY(childId));
    if (!raw) return { ...initialProgress };
    return JSON.parse(raw) as ConversationProgress;
  } catch {
    return { ...initialProgress };
  }
}

function saveStoredProgress(childId: string, progress: ConversationProgress): void {
  try {
    localStorage.setItem(CONV_PROGRESS_KEY(childId), JSON.stringify(progress));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — ignore
  }
}

/** Mirrors SubmitConversationResultRes from functions.ts — kept local to avoid ESLint type resolution issues */
interface ConversationXpResult {
  xpEarned: number;
  streak: number;
  leveledUp: boolean;
  newLevel: number;
  isNewBest: boolean;
}

interface ConversationStoreState {
  // Active session
  session: ConversationSession | null;
  scenario: ConversationScenario | null;
  result: ConversationResult | null;
  xpResult: ConversationXpResult | null;
  isActive: boolean;
  isSaving: boolean;
  /** Set when the Firebase save fails (e.g. offline). Result is still shown locally. */
  saveError: 'offline' | 'unknown' | null;

  // Persistent progress (in-memory; can be synced to backend later)
  progress: ConversationProgress;

  // Actions
  startSession: (params: {
    worldId: string | null;
    excludeScenarioIds?: string[];
    preferredTheme?: string;
    /** Force a specific scenario by ID — bypasses random selection. */
    scenarioId?: string;
  }) => void;
  completeSession: (outcome: {
    score: number;
    accuracy: number;
    durationSeconds: number;
    attempts: number;
    targetWordsHit: number;
    targetWordsTotal: number;
  }) => ConversationResult;
  reset: () => void;
  initProgress: (childId: string) => void;
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
  xpResult: null,
  isActive: false,
  isSaving: false,
  saveError: null,
  progress: { ...initialProgress },

  startSession: ({ worldId, excludeScenarioIds, preferredTheme, scenarioId }) => {
    const progress = get().progress;

    // If a specific scenario was requested, use it directly.
    // Otherwise run the random selection algorithm.
    let scenario: ConversationScenario;
    if (scenarioId) {
      const found = getConversationScenarioById(scenarioId);
      if (!found) throw new Error(`Scenario not found: ${scenarioId}`);
      scenario = found;
    } else {
      const exclude =
        excludeScenarioIds ?? (progress.lastScenarioId ? [progress.lastScenarioId] : []);
      scenario = selectConversationScenario({
        words: [], // standalone mode — let selector use theme/world/age matching
        preferredTheme,
        excludeScenarioIds: exclude,
        recentlyCompletedIds: progress.completedScenarioIds,
        worldId, // narrows candidate pool to the correct phase for this world
      });
    }

    const session: ConversationSession = {
      id: `session-${String(++sessionCounter)}`,
      scenarioId: scenario.id,
      worldId,
      startedAt: Date.now(),
    };

    set({
      session,
      scenario,
      result: null,
      xpResult: null,
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

    // Update in-memory progress
    const prev = state.progress;
    const completedSet = new Set(prev.completedScenarioIds);
    completedSet.add(state.scenario.id);

    const bestScores = { ...prev.bestScores };
    const prevBest = bestScores[state.scenario.id] ?? 0;
    if (outcome.score > prevBest) {
      bestScores[state.scenario.id] = outcome.score;
    }

    const newProgress: ConversationProgress = {
      completedScenarioIds: [...completedSet],
      totalSessions: prev.totalSessions + 1,
      bestScores,
      lastScenarioId: state.scenario.id,
      lastPlayedAt: Date.now(),
    };

    set({
      result,
      isActive: false,
      isSaving: true,
      progress: newProgress,
    });

    // Persist to localStorage (keyed by childId — works even without login, survives reloads)
    const activeChild = useChildStore.getState().activeChild;
    if (activeChild?.id) {
      saveStoredProgress(activeChild.id, newProgress);
    }

    // Persist to Firebase asynchronously — don't block the result screen
    if (activeChild) {
      void (
        submitConversationResult({
          childId: activeChild.id,
          sessionId: result.sessionId,
          scenarioId: result.scenarioId,
          score: result.score,
          accuracy: result.accuracy,
          durationSeconds: result.durationSeconds,
          targetWordsHit: result.targetWordsHit,
          targetWordsTotal: result.targetWordsTotal,
          attempts: result.attempts,
        }) as Promise<ConversationXpResult>
      )
        .then((xpRes) => {
          set({ xpResult: xpRes, isSaving: false });
          // Update local child profile with the returned level/streak
          useChildStore.getState().updateActiveChild({
            level: xpRes.newLevel,
            currentStreak: xpRes.streak,
          });
        })
        .catch((err: unknown) => {
          console.error('[conversationStore] submitConversationResult failed:', err);
          // Detect offline vs other errors so the UI can show an appropriate message
          const isOffline =
            !navigator.onLine ||
            (err instanceof Error &&
              (err.message.includes('unavailable') ||
                err.message.includes('network') ||
                (err as { code?: string }).code === 'unavailable'));
          set({ isSaving: false, saveError: isOffline ? 'offline' : 'unknown' });
        });
    } else {
      set({ isSaving: false });
    }

    return result;
  },

  reset: () => {
    set({
      session: null,
      scenario: null,
      result: null,
      xpResult: null,
      isActive: false,
      isSaving: false,
      saveError: null,
    });
  },

  initProgress: (childId) => {
    const stored = loadStoredProgress(childId);
    set({ progress: stored });
  },
}));

/** Stable helper — safe to call outside React render (no selector resolution issues). */
export function initConversationProgress(childId: string): void {
  useConversationStore.getState().initProgress(childId);
}
