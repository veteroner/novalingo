/**
 * Request types for all Cloud Functions callables.
 * Single source of truth — callables import from here.
 */

// ── Auth ────────────────────────────────────────────────

export interface CreateChildProfileReq {
  name: string;
  ageGroup: 'cubs' | 'stars' | 'legends';
  avatarId?: string;
}

export interface UpdateChildProfileReq {
  childId: string;
  name?: string;
  avatarId?: string;
}

export interface DeleteChildProfileReq {
  childId: string;
}

// ── Progress ────────────────────────────────────────────

export interface ActivityResult {
  activityId: string;
  activityType?: string;
  correct: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attempts: number;
  conversationEvidence?: {
    scenarioId?: string;
    scenarioTheme?: string;
    acceptedTurns: number;
    hintedTurns: number;
    targetWordsHit: string[];
    patternsHit: string[];
    rawChildResponses?: string[];
    passed: boolean;
    score: number;
  };
}

export interface EvaluateOpenEndedConversationReq {
  rawText: string;
  scenarioId?: string;
  nodeId: string;
  nodeText?: string;
  targetWords: string[];
  targetPatterns?: string[];
  slots?: Record<string, string>;
  defaultNextNodeId?: string | null;
  responseExamples?: string[];
  config?: {
    enabled: boolean;
    strategy: 'favorite_thing' | 'choose_thing' | 'because_reason' | 'free_text';
    domain: 'animal' | 'descriptor' | 'free_text' | 'color' | 'food';
    slotKey: string;
    nextNodeId: string;
    capturePrefixes?: string[];
    marksPattern?: string[];
    countCapturedValueAsTargetWord?: boolean;
  };
}

export interface EvaluateOpenEndedConversationRes {
  accepted: boolean;
  source: 'llm';
  modelUsed?: string;
  resolution: {
    slotKey: string;
    slotValue: string;
    nextNodeId: string;
    marksPattern: string[];
    markedTargetWords: string[];
  } | null;
  rubric: {
    matchedPattern: boolean;
    targetWordHits: string[];
    score: number;
    rationale: string;
    dimensions: {
      relevanceScore: number;
      patternAccuracyScore: number;
      vocabularyCoverageScore: number;
      childSafetyScore: number;
      encouragementScore: number;
    };
  };
  repairPrompt?: string;
  /** Child-friendly coaching line Nova speaks when the answer is rejected. */
  novaResponseText?: string;
}

export interface SubmitLessonResultReq {
  childId: string;
  lessonId: string;
  activities: ActivityResult[];
  totalTimeMs: number;
}

export interface UpdateVocabularyReq {
  childId: string;
  reviews: VocabReview[];
}

export interface VocabReview {
  wordId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  responseTimeMs: number;
}

// ── Offline ─────────────────────────────────────────────

export interface OfflineAction {
  type: 'lessonComplete' | 'vocabularyReview' | 'questProgress' | 'currencyChange';
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface SyncOfflineProgressReq {
  childId: string;
  actions: OfflineAction[];
  lastSyncTimestamp: number;
}

// ── Gamification ────────────────────────────────────────

export interface ClaimQuestRewardReq {
  childId: string;
  questId: string;
}

export interface SpinDailyWheelReq {
  childId: string;
}

export interface PurchaseShopItemReq {
  childId: string;
  itemId: string;
}

export interface UseStreakFreezeReq {
  childId: string;
}

// ── Social ──────────────────────────────────────────────

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

export interface GetLeaderboardReq {
  childId: string;
  tier?: LeagueTier;
  limit?: number;
}

// ── Account ─────────────────────────────────────────────

export interface SetParentPinReq {
  pin: string;
  currentPin?: string;
}

export interface VerifyParentPinReq {
  pin: string;
}

export interface DeleteAccountReq {
  pin: string;
}
