/**
 * Cloud Functions Callable Wrapper
 *
 * Type-safe callable function çağrıları.
 * Firebase callable functions hata durumunda HttpsError fırlatır,
 * başarı durumunda direkt veriyi döndürür.
 */

import type { AgeGroup } from '@/types/user';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import { auth, db, functions } from './app';

function requireCurrentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Authentication required');
  }
  return uid;
}

function validateChildName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    throw new Error('Name must be 2-20 characters');
  }
  return trimmed;
}

function validateAgeGroup(ageGroup: string): AgeGroup {
  if (ageGroup === 'cubs' || ageGroup === 'stars' || ageGroup === 'legends') {
    return ageGroup;
  }
  throw new Error('Invalid age group');
}

function validateAvatarId(avatarId?: string): string {
  const trimmed = avatarId?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : 'nova_default';
}

async function getOwnedChild(childId: string, uid: string) {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);

  if (!childSnap.exists()) {
    throw new Error('Child profile not found');
  }

  if (childSnap.data().parentUid !== uid) {
    throw new Error('Not authorized to access this child profile');
  }

  return { childRef, childSnap };
}

interface StoredChildProfile {
  parentUid?: string;
  name?: string;
  avatarId?: string;
}

interface StoredUserProfile {
  isPremium?: boolean;
  activeChildId?: string | null;
}

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

export async function createChildProfile(
  data: CreateChildProfileReq,
): Promise<CreateChildProfileRes> {
  const uid = requireCurrentUserId();
  const name = validateChildName(data.name);
  const ageGroup = validateAgeGroup(data.ageGroup);
  const avatarId = validateAvatarId(data.avatarId);

  const userRef = doc(db, 'users', uid);
  const childrenQuery = query(collection(db, 'children'), where('parentUid', '==', uid));

  const [userSnap, childrenSnap] = await Promise.all([getDoc(userRef), getDocs(childrenQuery)]);
  const userData = userSnap.data() as StoredUserProfile | undefined;
  const isPremium = Boolean(userData?.isPremium);
  const maxChildren = isPremium ? 5 : 1;

  if (childrenSnap.size >= maxChildren) {
    throw new Error(
      isPremium ? 'Maximum 5 child profiles' : 'Upgrade to Premium for more profiles',
    );
  }

  const childRef = doc(collection(db, 'children'));
  const childData = {
    parentUid: uid,
    name,
    ageGroup,
    avatarId,
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    nextLevelXP: 100,
    stars: 0,
    gems: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    streakFreezes: 1,
    novaStage: 'egg',
    novaHappiness: 100,
    novaOutfitId: null,
    leagueId: 'bronze_default',
    leagueTier: 'bronze',
    weeklyXP: 0,
    currentWorldId: 'w1',
    currentUnitId: 'u1',
    completedLessons: 0,
    totalPlayTimeMinutes: 0,
    wordsLearned: 0,
    onboardingCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(childRef, childData);

  if (childrenSnap.empty) {
    await setDoc(
      userRef,
      {
        activeChildId: childRef.id,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return {
    childId: childRef.id,
    parentUid: uid,
    name,
    ageGroup,
    avatarId,
    level: 1,
    totalXP: 0,
    currentXP: 0,
    currency: { stars: 0, gems: 0 },
    streak: {
      current: 0,
      longest: 0,
      lastActivityDate: null,
      freezesAvailable: 1,
    },
    stats: {
      lessonsCompleted: 0,
      perfectLessons: 0,
      wordsLearned: 0,
      totalTimeSeconds: 0,
    },
    novaStage: 'egg',
    onboardingCompleted: false,
  };
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

export async function updateChildProfile(
  data: UpdateChildProfileReq,
): Promise<UpdateChildProfileRes> {
  const uid = requireCurrentUserId();
  const { childRef, childSnap } = await getOwnedChild(data.childId, uid);
  const childData = childSnap.data() as StoredChildProfile;

  const nextName = data.name !== undefined ? validateChildName(data.name) : (childData.name ?? '');
  const nextAvatarId =
    data.avatarId !== undefined
      ? validateAvatarId(data.avatarId)
      : (childData.avatarId ?? 'nova_default');

  await updateDoc(childRef, {
    ...(data.name !== undefined ? { name: nextName } : {}),
    ...(data.avatarId !== undefined ? { avatarId: nextAvatarId } : {}),
    updatedAt: serverTimestamp(),
  });

  return {
    childId: data.childId,
    name: nextName,
    avatarId: nextAvatarId,
  };
}

// --- Delete Child Profile ---
export interface DeleteChildProfileReq {
  childId: string;
}

export interface DeleteChildProfileRes {
  deletedChildId: string;
  newActiveChildId: string | null;
}

export async function deleteChildProfile(
  data: DeleteChildProfileReq,
): Promise<DeleteChildProfileRes> {
  const uid = requireCurrentUserId();
  const { childRef } = await getOwnedChild(data.childId, uid);
  const userRef = doc(db, 'users', uid);

  await deleteDoc(childRef);

  const [userSnap, remainingSnap] = await Promise.all([
    getDoc(userRef),
    getDocs(query(collection(db, 'children'), where('parentUid', '==', uid), limit(1))),
  ]);
  const userData = userSnap.data() as StoredUserProfile | undefined;

  let newActiveChildId: string | null = userData?.activeChildId ?? null;

  if (newActiveChildId === data.childId) {
    const nextActiveChild = remainingSnap.docs[0];
    newActiveChildId = nextActiveChild?.id ?? null;
    await setDoc(
      userRef,
      {
        activeChildId: newActiveChildId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return {
    deletedChildId: data.childId,
    newActiveChildId,
  };
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
