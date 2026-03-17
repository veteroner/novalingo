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
  correct: boolean;
  timeSpentMs: number;
  hintsUsed: number;
  attempts: number;
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
