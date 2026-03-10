/**
 * Response types for all Cloud Functions callables.
 * Single source of truth — callables import from here.
 */

// ── Auth ────────────────────────────────────────────────

export interface CreateChildProfileRes {
  childId: string;
  name: string;
  ageGroup: 'cubs' | 'stars' | 'legends';
  avatarId: string;
  level: number;
  totalXP: number;
}

export interface UpdateChildProfileRes {
  childId: string;
  updated: Record<string, unknown>;
}

export interface DeleteChildProfileRes {
  childId: string;
  deleted: true;
}

// ── Progress ────────────────────────────────────────────

export interface SubmitLessonResultRes {
  xpEarned: number;
  baseXP: number;
  bonusXP: number;
  starsEarned: number;
  starRating: number;
  accuracy: number;
  streak: number;
  leveledUp: boolean;
  newLevel: number;
  isPerfect: boolean;
}

export interface UpdateVocabularyRes {
  updated: number;
  mastered: string[];
}

// ── Offline ─────────────────────────────────────────────

export interface SyncOfflineProgressRes {
  synced: number;
  errors: number;
  total: number;
}

// ── Gamification ────────────────────────────────────────

export interface ClaimQuestRewardRes {
  reward: { type: string; amount: number };
  questId: string;
}

export interface SpinDailyWheelRes {
  segmentId: string;
  reward: { type: string; amount: number };
}

export interface PurchaseShopItemRes {
  itemId: string;
  itemName: string;
  spent: number;
  currencyType: string;
}

export interface UseStreakFreezeRes {
  freezesRemaining: number;
}

// ── Social ──────────────────────────────────────────────

export interface LeaderboardEntry {
  childId: string;
  name: string;
  avatarId: string;
  level: number;
  weeklyXP: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface GetLeaderboardRes {
  weekId: string;
  tier: string;
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  promotionSlots: number;
  relegationSlots: number;
}

// ── Purchase ────────────────────────────────────────────

export interface ValidateReceiptRes {
  valid: boolean;
  entitlements: string[];
  expiresAt: number | null;
  productId: string;
}

export interface RestorePurchasesRes {
  entitlements: string[];
  isPremium: boolean;
  expiresAt: number | null;
}

// ── Account ─────────────────────────────────────────────

export interface SetParentPinRes {
  success: boolean;
}

export interface VerifyParentPinRes {
  valid: boolean;
}

export interface DeleteAccountRes {
  deleted: boolean;
}

// ── SRS Card ────────────────────────────────────────────

export interface SRSCard {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  status: 'learning' | 'reviewing' | 'mastered';
}
