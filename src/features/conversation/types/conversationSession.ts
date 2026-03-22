/**
 * Conversation Domain Types
 *
 * Standalone "Nova ile Konuş" oturumu için bağımsız domain modeli.
 * Lesson pipeline'ından tamamen ayrı.
 */

import type { ConversationScenario } from '@/features/learning/data/conversations';

// ===== SESSION =====

export interface ConversationSession {
  /** Unique session id (uuid) */
  id: string;
  /** Selected scenario for this session */
  scenarioId: string;
  /** Child's world context at session start — used for themed selection */
  worldId: string | null;
  /** Timestamp when the session was initiated */
  startedAt: number;
}

// ===== RESULT =====

export interface ConversationResult {
  /** Reference to session id */
  sessionId: string;
  /** Reference to scenario id */
  scenarioId: string;
  /** Score 0-100 based on target word coverage */
  score: number;
  /** Ratio of target words successfully produced */
  accuracy: number;
  /** Total seconds spent in the conversation */
  durationSeconds: number;
  /** Number of child input attempts (microphone or text) */
  attempts: number;
  /** Number of target words the child produced */
  targetWordsHit: number;
  /** Total target words in the scenario */
  targetWordsTotal: number;
  /** Timestamp when session was completed */
  completedAt: number;
}

// ===== PROGRESS (persisted across sessions) =====

export interface ConversationProgress {
  /** Scenario IDs the child has completed at least once */
  completedScenarioIds: string[];
  /** Total standalone conversation sessions completed */
  totalSessions: number;
  /** Best score per scenario */
  bestScores: Record<string, number>;
  /** Last played scenario — used for variety */
  lastScenarioId: string | null;
  /** Timestamp of last standalone conversation session */
  lastPlayedAt: number | null;
}

// ===== STORE STATE =====

export interface ConversationState {
  // Active session
  session: ConversationSession | null;
  scenario: ConversationScenario | null;
  result: ConversationResult | null;
  isActive: boolean;

  // Persistent progress
  progress: ConversationProgress;
}
