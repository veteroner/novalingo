/**
 * Cloud Functions Callable Wrapper
 *
 * Type-safe callable function çağrıları.
 * Firebase callable functions hata durumunda HttpsError fırlatır,
 * başarı durumunda direkt veriyi döndürür.
 */

import { httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import { functions } from './app';

// ===== GENERIC CALLER =====
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
async function callFunction<TReq, TRes>(name: string, data: TReq): Promise<TRes> {
  const fn = httpsCallable<TReq, TRes>(functions, name);
  const result: HttpsCallableResult<TRes> = await fn(data);
  return result.data;
}

// ===== TYPED FUNCTION CALLS =====

// --- Auth & Profile ---
export interface CreateChildProfileReq {
  name: string;
  ageGroup: 'cubs' | 'stars' | 'legends';
  avatarId?: string;
}

export interface CreateChildProfileRes {
  childId: string;
  parentUid: string;
  name: string;
  ageGroup: 'cubs' | 'stars' | 'legends';
  avatarId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  currency: { stars: number; gems: number };
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string | null;
    freezesAvailable: number;
  };
  stats: {
    lessonsCompleted: number;
    perfectLessons: number;
    wordsLearned: number;
    totalTimeSeconds: number;
  };
  novaStage: string;
  onboardingCompleted: boolean;
}

export function createChildProfile(data: CreateChildProfileReq) {
  return callFunction<CreateChildProfileReq, CreateChildProfileRes>('createChildProfile', data);
}

// --- Progress ---
export interface SubmitLessonResultReq {
  childId: string;
  lessonId: string;
  activities: {
    activityId: string;
    correct: boolean;
    timeSpentMs: number;
    hintsUsed: number;
    attempts: number;
  }[];
  totalTimeMs: number;
}

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

export function submitLessonResult(data: SubmitLessonResultReq) {
  return callFunction<SubmitLessonResultReq, SubmitLessonResultRes>('submitLessonResult', data);
}

// --- Vocabulary ---
export interface UpdateVocabularyReq {
  childId: string;
  reviews: Array<{
    cardId: string;
    quality: 0 | 1 | 2 | 3 | 4 | 5;
    responseTimeMs: number;
  }>;
}

export interface UpdateVocabularyRes {
  cardsUpdated: number;
  masteryChanges: Array<{ cardId: string; oldLevel: string; newLevel: string }>;
}

export function updateVocabulary(data: UpdateVocabularyReq) {
  return callFunction<UpdateVocabularyReq, UpdateVocabularyRes>('updateVocabulary', data);
}

// --- Gamification ---
export interface ClaimQuestRewardReq {
  childId: string;
  questId: string;
}

export interface ClaimQuestRewardRes {
  reward: { xp: number; stars: number; gems: number };
  bonusChestAvailable: boolean;
}

export function claimQuestReward(data: ClaimQuestRewardReq) {
  return callFunction<ClaimQuestRewardReq, ClaimQuestRewardRes>('claimQuestReward', data);
}

export interface SpinDailyWheelReq {
  childId: string;
}

export interface SpinDailyWheelRes {
  sliceId: string;
  reward: { type: string; amount: number; itemId?: string };
  animation: { targetAngle: number; duration: number };
}

export function spinDailyWheel(data: SpinDailyWheelReq) {
  return callFunction<SpinDailyWheelReq, SpinDailyWheelRes>('spinDailyWheel', data);
}

// --- Shop ---
export interface PurchaseShopItemReq {
  childId: string;
  itemId: string;
}

export interface PurchaseShopItemRes {
  success: boolean;
  newBalance: { stars: number; gems: number };
  item: { id: string; name: string };
}

export function purchaseShopItem(data: PurchaseShopItemReq) {
  return callFunction<PurchaseShopItemReq, PurchaseShopItemRes>('purchaseShopItem', data);
}

// --- Streak ---
export interface UseStreakFreezeReq {
  childId: string;
}

export interface UseStreakFreezeRes {
  freezesRemaining: number;
  streakPreserved: boolean;
}

export function useStreakFreeze(data: UseStreakFreezeReq) {
  return callFunction<UseStreakFreezeReq, UseStreakFreezeRes>('useStreakFreeze', data);
}

// --- Leaderboard ---
export interface GetLeaderboardReq {
  childId: string;
  leagueId: string;
}

export interface GetLeaderboardRes {
  entries: Array<{
    displayName: string;
    avatarId: string;
    level: number;
    weeklyXP: number;
    rank: number;
  }>;
  myRank: number;
  promotionLine: number;
  relegationLine: number;
}

export function getLeaderboard(data: GetLeaderboardReq) {
  return callFunction<GetLeaderboardReq, GetLeaderboardRes>('getLeaderboard', data);
}

// --- Offline Sync ---
export interface SyncOfflineProgressReq {
  childId: string;
  actions: Array<{
    type: string;
    payload: Record<string, unknown>;
    timestamp: number;
  }>;
}

export interface SyncOfflineProgressRes {
  synced: number;
  conflicts: number;
  resolvedActions: string[];
}

export function syncOfflineProgress(data: SyncOfflineProgressReq) {
  return callFunction<SyncOfflineProgressReq, SyncOfflineProgressRes>('syncOfflineProgress', data);
}

// --- Update Child Profile ---
export interface UpdateChildProfileReq {
  childId: string;
  name?: string;
  avatarId?: string;
}

export interface UpdateChildProfileRes {
  childId: string;
  name: string;
  avatarId: string;
}

export function updateChildProfile(data: UpdateChildProfileReq) {
  return callFunction<UpdateChildProfileReq, UpdateChildProfileRes>('updateChildProfile', data);
}

// --- Delete Child Profile ---
export interface DeleteChildProfileReq {
  childId: string;
}

export interface DeleteChildProfileRes {
  deletedChildId: string;
  newActiveChildId: string | null;
}

export function deleteChildProfile(data: DeleteChildProfileReq) {
  return callFunction<DeleteChildProfileReq, DeleteChildProfileRes>('deleteChildProfile', data);
}

// --- Parent PIN ---
export interface SetParentPinReq {
  pin: string;
  currentPin?: string;
}

export interface SetParentPinRes {
  success: boolean;
}

export function setParentPin(data: SetParentPinReq): Promise<SetParentPinRes> {
  return callFunction<SetParentPinReq, SetParentPinRes>('setParentPin', data);
}

export interface VerifyParentPinReq {
  pin: string;
}

export interface VerifyParentPinRes {
  valid: boolean;
}

export function verifyParentPin(data: VerifyParentPinReq): Promise<VerifyParentPinRes> {
  return callFunction<VerifyParentPinReq, VerifyParentPinRes>('verifyParentPin', data);
}

// --- Account ---
export interface DeleteAccountReq {
  pin: string;
}

export interface DeleteAccountRes {
  deleted: boolean;
}

export function deleteAccount(data: DeleteAccountReq): Promise<DeleteAccountRes> {
  return callFunction<DeleteAccountReq, DeleteAccountRes>('deleteAccount', data);
}
