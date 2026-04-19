/**
 * Firebase Functions — Spark Plan Compatible
 *
 * Cloud Functions mantığını client-side Firestore yazımlarıyla çalıştırır.
 * Blaze planı gerektirmez.
 */

import type { AgeGroup } from '@/types/user';
import { deleteUser as firebaseDeleteUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  calculateLessonXP,
  createSRSCard,
  generateDailyQuests,
  generateSalt,
  getNovaMood,
  getNovaStage,
  getTodayTR,
  getWeekId,
  hashPin,
  pickWheelSegment,
  reviewSRSCard,
  updateStreak,
  verifyPinHash,
  xpForLevel,
} from '../spark/gameLogic';
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

  const childData = childSnap.data() as StoredChildProfile;

  if (childData.parentUid !== uid) {
    throw new Error('Not authorized to access this child profile');
  }

  return { childRef, childSnap };
}

interface StoredChildProfile {
  parentUid?: string;
  name?: string;
  ageGroup?: AgeGroup;
  avatarId?: string;
  level?: number;
  totalXP?: number;
  currentLevelXP?: number;
  nextLevelXP?: number;
  stars?: number;
  gems?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string | null;
  streakFreezes?: number;
  leagueTier?: string;
  weeklyXP?: number;
  completedLessons?: number;
  totalPlayTimeMinutes?: number;
  wordsLearned?: number;
  novaStage?: string;
  novaHappiness?: number;
  novaOutfitId?: string | null;
  onboardingCompleted?: boolean;
}

interface StoredReward {
  type: 'stars' | 'gems' | 'xp';
  amount: number;
}

interface StoredQuest {
  claimed?: boolean;
  currentProgress?: number;
  targetProgress?: number;
  reward?: StoredReward;
}

type ShopCurrencyType = 'stars' | 'gems';

interface StoredShopItem {
  currencyType?: ShopCurrencyType;
  price?: number;
  name?: string;
}

interface StoredUserSettings {
  parentPinHash?: string;
  parentPinSalt?: string;
  parentPin?: string;
}

interface StoredUserProfile {
  isPremium?: boolean;
  activeChildId?: string | null;
  settings?: StoredUserSettings;
}

interface StoredLeaderboardEntry {
  name?: string;
  avatarId?: string;
  level?: number;
  weeklyXP?: number;
  tier?: string;
}

interface OfflineActionPayload {
  lessonId?: string;
  wordId?: string;
  stars?: number;
  accuracy?: number;
  xpEarned?: number;
  timeSpentMs?: number;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
  nextReviewDate?: string;
  activities?: SubmitLessonResultReq['activities'];
}

function buildRewardUpdate(
  child: StoredChildProfile,
  reward: StoredReward | { type: 'streak_freeze'; amount: number },
): Record<string, unknown> {
  if (reward.type === 'stars') {
    return { stars: (child.stars ?? 0) + reward.amount };
  }
  if (reward.type === 'gems') {
    return { gems: (child.gems ?? 0) + reward.amount };
  }
  if (reward.type === 'xp') {
    return { totalXP: (child.totalXP ?? 0) + reward.amount };
  }
  return { streakFreezes: (child.streakFreezes ?? 0) + reward.amount };
}

function getChildCurrencyBalance(
  child: StoredChildProfile,
  currencyType: ShopCurrencyType,
): number {
  return currencyType === 'gems' ? (child.gems ?? 0) : (child.stars ?? 0);
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
  }[];
  totalTimeMs: number;
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
    strategy: 'favorite_thing' | 'choose_thing' | 'because_reason';
    domain: 'animal' | 'descriptor' | 'free_text' | 'color' | 'food';
    slotKey: string;
    nextNodeId: string;
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

export async function evaluateOpenEndedConversation(
  data: EvaluateOpenEndedConversationReq,
): Promise<EvaluateOpenEndedConversationRes> {
  requireCurrentUserId();
  const evaluateFn = httpsCallable<
    EvaluateOpenEndedConversationReq,
    EvaluateOpenEndedConversationRes
  >(functions, 'evaluateOpenEndedConversation');
  const result = await evaluateFn(data);
  return result.data;
}

export function submitLessonResult(data: SubmitLessonResultReq): Promise<SubmitLessonResultRes> {
  const uid = requireCurrentUserId();
  const { childId, lessonId, activities, totalTimeMs } = data;
  const childRef = doc(db, 'children', childId);
  const lessonRef = doc(db, 'children', childId, 'lessonProgress', lessonId);
  const correctCount = activities.filter((activity) => activity.correct).length;
  const hintsUsed = activities.reduce((sum, activity) => sum + activity.hintsUsed, 0);
  const conversationEvidence = activities
    .map((activity) => activity.conversationEvidence)
    .filter(
      (evidence): evidence is NonNullable<(typeof activities)[number]['conversationEvidence']> =>
        Boolean(evidence),
    );

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(childRef);
    if (!snap.exists()) throw new Error('Child not found');
    const child = snap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');

    const xp = calculateLessonXP(activities, totalTimeMs, child.currentStreak ?? 0);
    const streak = updateStreak(
      child.currentStreak ?? 0,
      child.longestStreak ?? 0,
      child.lastActivityDate || null,
    );

    let newLevel = child.level ?? 1;
    const newTotalXP = (child.totalXP ?? 0) + xp.totalXP;
    while (newLevel < 100 && newTotalXP >= xpForLevel(newLevel + 1)) newLevel++;

    const novaStage = getNovaStage(newTotalXP);
    const novaHappiness = getNovaMood((child.completedLessons ?? 0) + 1, streak.newStreak);

    tx.update(childRef, {
      totalXP: newTotalXP,
      currentLevelXP: newTotalXP - xpForLevel(newLevel),
      nextLevelXP: xpForLevel(newLevel + 1) - xpForLevel(newLevel),
      level: newLevel,
      stars: (child.stars ?? 0) + xp.starsEarned,
      currentStreak: streak.newStreak,
      longestStreak: streak.newLongest,
      lastActivityDate: getTodayTR(),
      completedLessons: (child.completedLessons ?? 0) + 1,
      totalPlayTimeMinutes: (child.totalPlayTimeMinutes ?? 0) + Math.round(totalTimeMs / 60000),
      weeklyXP: (child.weeklyXP ?? 0) + xp.totalXP,
      novaStage,
      novaHappiness,
      updatedAt: serverTimestamp(),
    });

    tx.set(lessonRef, {
      lessonId,
      score: Math.round(xp.accuracy * 100),
      stars: xp.starRating,
      starsEarned: xp.starRating,
      accuracy: xp.accuracy,
      xpEarned: xp.totalXP,
      durationSeconds: Math.round(totalTimeMs / 1000),
      timeSpentMs: totalTimeMs,
      activitiesCompleted: activities.length,
      activitiesTotal: activities.length,
      correctAnswers: correctCount,
      wrongAnswers: activities.length - correctCount,
      hintsUsed,
      isPerfect: xp.isPerfect,
      attemptNumber: 1,
      deviceType: 'web',
      completedAt: serverTimestamp(),
      attempts: activities.map((a) => ({
        activityId: a.activityId,
        activityType: a.activityType,
        correct: a.correct,
        timeSpentMs: a.timeSpentMs,
        hintsUsed: a.hintsUsed,
        attempts: a.attempts,
        conversationEvidence: a.conversationEvidence ?? null,
      })),
      conversationEvidence,
    });

    // Update leaderboard entry (inside tx for consistency)
    const weekId = getWeekId();
    const entryRef = doc(db, 'leaderboards', weekId, 'entries', childId);
    tx.set(
      entryRef,
      {
        childId,
        name: child.name ?? '',
        avatarId: child.avatarId ?? 'nova_default',
        level: newLevel,
        weeklyXP: (child.weeklyXP ?? 0) + xp.totalXP,
        tier: child.leagueTier ?? 'bronze',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return {
      xpEarned: xp.totalXP,
      baseXP: xp.baseXP,
      bonusXP: xp.bonusXP,
      starsEarned: xp.starsEarned,
      starRating: xp.starRating,
      accuracy: xp.accuracy,
      streak: streak.newStreak,
      leveledUp: newLevel > (child.level ?? 1),
      newLevel,
      isPerfect: xp.isPerfect,
    };
  });
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

export async function updateVocabulary(data: UpdateVocabularyReq): Promise<UpdateVocabularyRes> {
  const uid = requireCurrentUserId();
  await getOwnedChild(data.childId, uid);
  const today = getTodayTR();
  const batch = writeBatch(db);
  const masteryChanges: { cardId: string; oldLevel: string; newLevel: string }[] = [];

  for (const review of data.reviews) {
    const cardRef = doc(db, 'children', data.childId, 'vocabulary', review.cardId);
    const cardSnap = await getDoc(cardRef);
    const existing = cardSnap.exists()
      ? (cardSnap.data() as {
          easeFactor: number;
          interval: number;
          repetitions: number;
          nextReviewDate: string;
          status: string;
        })
      : null;
    const card = existing
      ? {
          wordId: review.cardId,
          easeFactor: existing.easeFactor,
          interval: existing.interval,
          repetitions: existing.repetitions,
          nextReviewDate: existing.nextReviewDate,
          status: existing.status as 'learning' | 'reviewing' | 'mastered',
        }
      : createSRSCard(review.cardId, today);
    const oldStatus = card.status;
    const updated = reviewSRSCard(card, review.quality, today);
    if (oldStatus !== updated.status) {
      masteryChanges.push({ cardId: review.cardId, oldLevel: oldStatus, newLevel: updated.status });
    }
    batch.set(
      cardRef,
      { ...updated, lastReviewedAt: serverTimestamp(), responseTimeMs: review.responseTimeMs },
      { merge: true },
    );
  }

  const newlyMastered = masteryChanges.filter((m) => m.newLevel === 'mastered').length;
  if (newlyMastered > 0) {
    batch.update(doc(db, 'children', data.childId), {
      wordsLearned: increment(newlyMastered),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
  return { cardsUpdated: data.reviews.length, masteryChanges };
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

export async function claimQuestReward(data: ClaimQuestRewardReq): Promise<ClaimQuestRewardRes> {
  const uid = requireCurrentUserId();
  const childRef = doc(db, 'children', data.childId);

  return runTransaction(db, async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists()) throw new Error('Child not found');
    const child = childSnap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');

    const questRef = doc(db, 'children', data.childId, 'quests', data.questId);
    const questSnap = await tx.get(questRef);
    if (!questSnap.exists()) throw new Error('Quest not found');
    const quest = questSnap.data() as StoredQuest;
    if (quest.claimed) throw new Error('Already claimed');
    if ((quest.currentProgress ?? 0) < (quest.targetProgress ?? 1))
      throw new Error('Quest not completed');

    const reward: StoredReward = quest.reward ?? { type: 'stars', amount: 0 };
    const updates = { ...buildRewardUpdate(child, reward), updatedAt: serverTimestamp() };

    tx.update(childRef, updates);
    tx.update(questRef, { claimed: true, claimedAt: serverTimestamp() });

    return {
      reward: {
        xp: reward.type === 'xp' ? reward.amount : 0,
        stars: reward.type === 'stars' ? reward.amount : 0,
        gems: reward.type === 'gems' ? reward.amount : 0,
      },
      bonusChestAvailable: false,
    };
  });
}

export interface SpinDailyWheelReq {
  childId: string;
}

export interface SpinDailyWheelRes {
  sliceId: string;
  reward: { type: string; amount: number; itemId?: string };
  animation: { targetAngle: number; duration: number };
}

export async function spinDailyWheel(data: SpinDailyWheelReq): Promise<SpinDailyWheelRes> {
  const uid = requireCurrentUserId();
  const childRef = doc(db, 'children', data.childId);
  const today = getTodayTR();
  const segment = pickWheelSegment();

  await runTransaction(db, async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists()) throw new Error('Child not found');
    const child = childSnap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');

    const spinRef = doc(db, 'children', data.childId, 'dailySpins', today);
    const spinSnap = await tx.get(spinRef);
    if (spinSnap.exists()) throw new Error('Already spun today');

    const updates = {
      ...buildRewardUpdate(child, { type: segment.type, amount: segment.amount }),
      updatedAt: serverTimestamp(),
    };

    tx.update(childRef, updates);
    tx.set(spinRef, {
      reward: { type: segment.type, amount: segment.amount },
      spunAt: serverTimestamp(),
    });
  });

  const segmentIndex =
    [0, 1, 2, 3, 4, 5, 6, 7].find(
      (_, i) =>
        ['stars_10', 'stars_25', 'stars_50', 'xp_20', 'xp_50', 'gems_5', 'gems_10', 'freeze'][i] ===
        segment.id,
    ) ?? 0;
  const targetAngle = 360 * 3 + segmentIndex * 45 + Math.random() * 40;

  return {
    sliceId: segment.id,
    reward: { type: segment.type, amount: segment.amount },
    animation: { targetAngle, duration: 3000 },
  };
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

export async function purchaseShopItem(data: PurchaseShopItemReq): Promise<PurchaseShopItemRes> {
  const uid = requireCurrentUserId();
  const childRef = doc(db, 'children', data.childId);
  const itemRef = doc(db, 'shopItems', data.itemId);
  const itemSnap = await getDoc(itemRef);
  if (!itemSnap.exists()) throw new Error('Item not found');
  const item = itemSnap.data() as StoredShopItem;

  return runTransaction(db, async (tx) => {
    const childSnap = await tx.get(childRef);
    if (!childSnap.exists()) throw new Error('Child not found');
    const child = childSnap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');

    const currencyType: ShopCurrencyType = item.currencyType ?? 'stars';
    const price: number = item.price ?? 0;
    const balance = getChildCurrencyBalance(child, currencyType);
    if (balance < price) throw new Error('Insufficient balance');

    // Check not already owned via inventory
    const invRef = doc(db, 'children', data.childId, 'inventory', data.itemId);
    const invSnap = await tx.get(invRef);
    if (invSnap.exists()) throw new Error('Already owned');

    const newBalance = balance - price;
    tx.update(childRef, {
      ...(currencyType === 'gems' ? { gems: newBalance } : { stars: newBalance }),
      updatedAt: serverTimestamp(),
    });
    tx.set(invRef, {
      itemId: data.itemId,
      itemName: item.name ?? '',
      purchasedAt: serverTimestamp(),
    });

    return {
      success: true,
      newBalance: {
        stars: currencyType === 'stars' ? newBalance : (child.stars ?? 0),
        gems: currencyType === 'gems' ? newBalance : (child.gems ?? 0),
      },
      item: { id: data.itemId, name: item.name ?? '' },
    };
  });
}

// --- Streak ---
export interface UseStreakFreezeReq {
  childId: string;
}

export interface UseStreakFreezeRes {
  freezesRemaining: number;
  streakPreserved: boolean;
}

export async function useStreakFreeze(data: UseStreakFreezeReq): Promise<UseStreakFreezeRes> {
  const uid = requireCurrentUserId();
  const childRef = doc(db, 'children', data.childId);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(childRef);
    if (!snap.exists()) throw new Error('Child not found');
    const child = snap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');
    const freezes: number = child.streakFreezes ?? 0;
    if (freezes <= 0) throw new Error('No streak freezes available');

    tx.update(childRef, { streakFreezes: freezes - 1, updatedAt: serverTimestamp() });
    return { freezesRemaining: freezes - 1, streakPreserved: true };
  });
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

export async function getLeaderboard(data: GetLeaderboardReq): Promise<GetLeaderboardRes> {
  requireCurrentUserId();
  const weekId = getWeekId();
  const entriesRef = collection(db, 'leaderboards', weekId, 'entries');
  const q = query(
    entriesRef,
    where('tier', '==', data.leagueId || 'bronze'),
    orderBy('weeklyXP', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);

  const entries = snap.docs.map((d, i) => {
    const e = d.data() as StoredLeaderboardEntry;
    return {
      displayName: e.name ?? 'NovaLearner',
      avatarId: e.avatarId ?? 'nova_default',
      level: e.level ?? 1,
      weeklyXP: e.weeklyXP ?? 0,
      rank: i + 1,
    };
  });

  const myRank = entries.findIndex((e) => e.displayName !== '') + 1 || entries.length + 1;
  return { entries, myRank, promotionLine: 3, relegationLine: Math.max(entries.length - 2, 4) };
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

export async function syncOfflineProgress(
  data: SyncOfflineProgressReq,
): Promise<SyncOfflineProgressRes> {
  const uid = requireCurrentUserId();
  await getOwnedChild(data.childId, uid);
  const batch = writeBatch(db);
  let synced = 0;
  let errors = 0;
  const sorted = [...data.actions].sort((a, b) => a.timestamp - b.timestamp).slice(0, 100);

  for (const action of sorted) {
    try {
      const p = action.payload as OfflineActionPayload;
      if (action.type === 'lessonComplete' && p.lessonId) {
        const ref = doc(db, 'children', data.childId, 'lessonProgress', p.lessonId);
        const activities = Array.isArray(p.activities) ? p.activities : [];
        const conversationEvidence = activities
          .map((activity) => activity.conversationEvidence)
          .filter(
            (
              evidence,
            ): evidence is NonNullable<(typeof activities)[number]['conversationEvidence']> =>
              Boolean(evidence),
          );
        batch.set(
          ref,
          {
            lessonId: p.lessonId,
            stars: Math.min(p.stars ?? 0, 3),
            accuracy: Math.min(p.accuracy ?? 0, 1),
            xpEarned: Math.min(p.xpEarned ?? 0, 500),
            timeSpentMs: p.timeSpentMs ?? 0,
            durationSeconds: Math.round((p.timeSpentMs ?? 0) / 1000),
            attempts: activities.map((activity) => ({
              activityId: activity.activityId,
              activityType: activity.activityType,
              correct: activity.correct,
              timeSpentMs: activity.timeSpentMs,
              hintsUsed: activity.hintsUsed,
              attempts: activity.attempts,
              conversationEvidence: activity.conversationEvidence ?? null,
            })),
            conversationEvidence,
            completedAt: serverTimestamp(),
          },
          { merge: true },
        );
        synced++;
      } else if (action.type === 'vocabularyReview' && p.wordId) {
        const ref = doc(db, 'children', data.childId, 'vocabulary', p.wordId);
        batch.set(
          ref,
          {
            interval: p.interval ?? 0,
            easeFactor: p.easeFactor ?? 2.5,
            repetitions: p.repetitions ?? 0,
            nextReviewDate: p.nextReviewDate ?? '',
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        synced++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }
  await batch.commit();
  return { synced, conflicts: errors, resolvedActions: [] };
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

export async function setParentPin(data: SetParentPinReq): Promise<SetParentPinRes> {
  const uid = requireCurrentUserId();
  if (!/^\d{4}$/.test(data.pin)) throw new Error('PIN must be 4 digits');

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as StoredUserProfile | undefined;
  const settings = userData?.settings;

  // If PIN already exists, verify current PIN first
  if (settings?.parentPinHash && settings.parentPinSalt) {
    if (!data.currentPin) throw new Error('Current PIN required');
    const valid = await verifyPinHash(
      data.currentPin,
      settings.parentPinSalt,
      settings.parentPinHash,
    );
    if (!valid) throw new Error('Current PIN is incorrect');
  }

  const salt = generateSalt();
  const pinHash = await hashPin(data.pin, salt);
  await updateDoc(userRef, {
    'settings.parentPinHash': pinHash,
    'settings.parentPinSalt': salt,
    'settings.parentPin': '****',
    updatedAt: serverTimestamp(),
  });
  return { success: true };
}

export interface VerifyParentPinReq {
  pin: string;
}

export interface VerifyParentPinRes {
  valid: boolean;
}

export async function verifyParentPin(data: VerifyParentPinReq): Promise<VerifyParentPinRes> {
  const uid = requireCurrentUserId();
  if (!/^\d{4}$/.test(data.pin)) throw new Error('PIN must be 4 digits');

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as StoredUserProfile | undefined;
  const settings = userData?.settings;

  if (!settings?.parentPinHash || !settings.parentPinSalt) {
    throw new Error('No PIN set');
  }

  const valid = await verifyPinHash(data.pin, settings.parentPinSalt, settings.parentPinHash);
  if (!valid) throw new Error('Invalid PIN');
  return { valid: true };
}

// --- Account ---
export interface DeleteAccountReq {
  pin: string;
}

export interface DeleteAccountRes {
  deleted: boolean;
}

export async function deleteAccount(data: DeleteAccountReq): Promise<DeleteAccountRes> {
  const uid = requireCurrentUserId();
  // Verify PIN first
  await verifyParentPin({ pin: data.pin });

  // Delete all children and their subcollections
  const childrenSnap = await getDocs(
    query(collection(db, 'children'), where('parentUid', '==', uid)),
  );
  const subcollections = [
    'lessonProgress',
    'vocabulary',
    'quests',
    'achievements',
    'inventory',
    'dailySpins',
    'stats',
  ];

  for (const childDoc of childrenSnap.docs) {
    for (const sub of subcollections) {
      const subSnap = await getDocs(collection(db, 'children', childDoc.id, sub));
      const batch = writeBatch(db);
      subSnap.docs.forEach((d) => batch.delete(d.ref));
      if (!subSnap.empty) await batch.commit();
    }
    await deleteDoc(childDoc.ref);
  }

  // Delete user document
  await deleteDoc(doc(db, 'users', uid));

  // Delete Firebase Auth user
  const currentUser = auth.currentUser;
  if (currentUser) {
    await firebaseDeleteUser(currentUser);
  }

  return { deleted: true };
}

// ===== LAZY SCHEDULED FUNCTIONS =====

// --- Conversation ---

export interface SubmitConversationResultReq {
  childId: string;
  sessionId: string;
  scenarioId: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  targetWordsHit: number;
  targetWordsTotal: number;
  attempts: number;
}

export interface SubmitConversationResultRes {
  xpEarned: number;
  streak: number;
  leveledUp: boolean;
  newLevel: number;
  isNewBest: boolean;
}

export function submitConversationResult(
  data: SubmitConversationResultReq,
): Promise<SubmitConversationResultRes> {
  const uid = requireCurrentUserId();
  const {
    childId,
    sessionId,
    scenarioId,
    score,
    accuracy,
    durationSeconds,
    targetWordsHit,
    targetWordsTotal,
    attempts,
  } = data;
  const childRef = doc(db, 'children', childId);
  const sessionRef = doc(db, 'children', childId, 'conversationSessions', sessionId);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(childRef);
    if (!snap.exists()) throw new Error('Child not found');
    const child = snap.data() as StoredChildProfile;
    if (child.parentUid !== uid) throw new Error('Not authorized');

    // XP: 10 base + up to 20 from score + streak bonus (capped at 50%)
    const baseXP = Math.round(10 + (score / 100) * 20);
    const streakMultiplier = Math.min(1.5, 1 + Math.floor((child.currentStreak ?? 0) / 3) * 0.1);
    const xpEarned = Math.round(baseXP * streakMultiplier);

    const streak = updateStreak(
      child.currentStreak ?? 0,
      child.longestStreak ?? 0,
      child.lastActivityDate || null,
    );

    let newLevel = child.level ?? 1;
    const newTotalXP = (child.totalXP ?? 0) + xpEarned;
    while (newLevel < 100 && newTotalXP >= xpForLevel(newLevel + 1)) newLevel++;

    const novaStage = getNovaStage(newTotalXP);
    const prevConversations =
      (child as StoredChildProfile & { totalConversations?: number }).totalConversations ?? 0;
    const novaHappiness = getNovaMood(prevConversations + 1, streak.newStreak);

    // Check if new best score for this scenario
    const bestRef = doc(db, 'children', childId, 'conversationBestScores', scenarioId);
    const bestSnap = await tx.get(bestRef);
    const prevBest: number = bestSnap.exists()
      ? ((bestSnap.data() as { score?: number }).score ?? 0)
      : 0;
    const isNewBest = score > prevBest;

    tx.update(childRef, {
      totalXP: newTotalXP,
      currentLevelXP: newTotalXP - xpForLevel(newLevel),
      nextLevelXP: xpForLevel(newLevel + 1) - xpForLevel(newLevel),
      level: newLevel,
      currentStreak: streak.newStreak,
      longestStreak: streak.newLongest,
      lastActivityDate: getTodayTR(),
      weeklyXP: (child.weeklyXP ?? 0) + xpEarned,
      totalConversations: prevConversations + 1,
      novaStage,
      novaHappiness,
      updatedAt: serverTimestamp(),
    });

    tx.set(sessionRef, {
      sessionId,
      scenarioId,
      score,
      accuracy,
      durationSeconds,
      targetWordsHit,
      targetWordsTotal,
      attempts,
      xpEarned,
      completedAt: serverTimestamp(),
    });

    if (isNewBest) {
      tx.set(bestRef, { scenarioId, score, completedAt: serverTimestamp() });
    }

    const weekId = getWeekId();
    const entryRef = doc(db, 'leaderboards', weekId, 'entries', childId);
    tx.set(
      entryRef,
      {
        childId,
        name: child.name ?? '',
        avatarId: child.avatarId ?? 'nova_default',
        level: newLevel,
        weeklyXP: (child.weeklyXP ?? 0) + xpEarned,
        tier: child.leagueTier ?? 'bronze',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return {
      xpEarned,
      streak: streak.newStreak,
      leveledUp: newLevel > (child.level ?? 1),
      newLevel,
      isNewBest,
    };
  });
}

// --- World Progression ---
export interface AdvanceToNextWorldReq {
  childId: string;
  nextWorldId: string;
}

export async function advanceToNextWorld(data: AdvanceToNextWorldReq): Promise<void> {
  const uid = requireCurrentUserId();
  const { childRef } = await getOwnedChild(data.childId, uid);
  await updateDoc(childRef, { currentWorldId: data.nextWorldId, updatedAt: serverTimestamp() });
}

export async function ensureDailyQuests(childId: string): Promise<void> {
  const uid = requireCurrentUserId();
  await getOwnedChild(childId, uid);
  const today = getTodayTR();
  const questsRef = collection(db, 'children', childId, 'quests');
  const todayQuests = await getDocs(query(questsRef, where('id', '>=', today), limit(1)));
  if (!todayQuests.empty) return;

  const quests = generateDailyQuests(today);
  const batch = writeBatch(db);
  for (const q of quests) {
    batch.set(doc(questsRef, q.id), { ...q, updatedAt: serverTimestamp() });
  }
  await batch.commit();
}
