/**
 * NovaLingo — Oyunlaştırma Tipleri
 *
 * XP, Level, Streak, Achievement, Quest, Shop, Collection
 */

import { type Timestamp } from 'firebase/firestore';

// ===== XP & LEVEL =====
export interface XPGain {
  base: number;
  streakBonus: number;
  accuracyBonus: number;
  speedBonus: number;
  firstTryBonus: number;
  premiumBonus: number;
  total: number;
}

export interface LevelInfo {
  level: number;
  currentXP: number;
  requiredXP: number;
  progress: number; // 0-1
}

// ===== STREAK =====
export interface StreakInfo {
  current: number;
  longest: number;
  lastDate: string; // YYYY-MM-DD
  freezesAvailable: number;
  isActive: boolean;
  multiplier: number;
}

// ===== ACHIEVEMENT =====
export type AchievementCategory = 'learning' | 'streak' | 'game' | 'collection' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementDefinition {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  iconUrl: string;
  condition: AchievementCondition;
  reward: AchievementReward;
  isHidden: boolean;
  order: number;
}

export interface AchievementCondition {
  type: string;
  target: number;
  metadata?: Record<string, unknown>;
}

export interface AchievementReward {
  xp: number;
  stars: number;
  gems: number;
  itemId?: string;
  title?: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Timestamp;
  progress: number;
  target: number;
  claimed: boolean;
}

// ===== QUEST =====
export type QuestType =
  | 'complete_lessons'
  | 'earn_xp'
  | 'perfect_score'
  | 'learn_words'
  | 'play_minutes'
  | 'streak_maintain'
  | 'activity_type';

export interface QuestDefinition {
  id: string;
  type: QuestType;
  title: string;
  titleEn: string;
  description: string;
  target: number;
  reward: QuestReward;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, unknown>;
}

export interface QuestReward {
  xp: number;
  stars: number;
  gems: number;
}

export interface DailyQuest {
  questId: string;
  definition: QuestDefinition;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  assignedAt: Timestamp | null;
}

// ===== SHOP =====
export type ShopItemCategory =
  | 'nova-outfit'
  | 'nova-accessory'
  | 'theme'
  | 'effect'
  | 'boost'
  | 'consumable';
export type ShopCurrency = 'stars' | 'gems';

export interface ShopItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: ShopItemCategory;
  imageUrl: string;
  previewUrl: string;
  currency: ShopCurrency;
  price: number;
  originalPrice?: number; // İndirim varsa
  requiredLevel: number;
  isPremium: boolean;
  isLimited: boolean;
  expiresAt?: Timestamp;
  stock?: number;
  order: number;
}

export interface InventoryItem {
  itemId: string;
  purchasedAt: Timestamp;
  isEquipped: boolean;
}

// ===== COLLECTION =====
export type CollectionCategory =
  | 'animals'
  | 'flags'
  | 'stickers'
  | 'characters'
  | 'landmarks'
  | 'foods'
  | 'vehicles';
export type CollectionRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface CollectibleItem {
  id: string;
  name: string;
  nameEn: string;
  category: CollectionCategory;
  rarity: CollectionRarity;
  imageUrl: string;
  description: string;
  englishFact: string;
}

export interface UserCollectible {
  itemId: string;
  obtainedAt: Timestamp;
  obtainedFrom: 'lesson' | 'achievement' | 'shop' | 'wheel' | 'event';
}

// ===== DAILY WHEEL =====
export interface WheelSlice {
  id: string;
  label: string;
  reward: WheelReward;
  weight: number; // Ağırlık (olasılık)
  color: string;
  iconUrl: string;
}

export interface WheelReward {
  type: 'xp' | 'stars' | 'gems' | 'streak_freeze' | 'collectible' | 'boost';
  amount: number;
  itemId?: string;
}

export interface WheelSpin {
  sliceId: string;
  reward: WheelReward;
  spunAt: Timestamp;
}

// ===== LEADERBOARD =====
export interface LeaderboardEntry {
  childId: string;
  displayName: string;
  avatarId: string;
  level: number;
  weeklyXP: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export interface LeagueInfo {
  id: string;
  tier: string;
  season: number;
  weekStart: Timestamp;
  weekEnd: Timestamp;
  promotionThreshold: number;
  relegationThreshold: number;
}

// ===== SEASONAL EVENTS =====
export type SeasonalEventId =
  | 'halloween'
  | 'winter-festival'
  | 'valentine'
  | 'spring'
  | 'summer'
  | 'back-to-school';

export interface SeasonalEvent {
  id: SeasonalEventId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  theme: string;
  /** Gradient colors for banner/card backgrounds */
  colors: [string, string];
  /** Month (1-12) and day range */
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  /** Duration label for display */
  durationDays: number;
  /** Lessons specific to this event */
  lessons: SeasonalLesson[];
  /** Limited-time collectibles obtainable only during event */
  collectibles: SeasonalCollectible[];
  /** Bonus XP multiplier during event */
  xpMultiplier: number;
}

export interface SeasonalLesson {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  order: number;
  xpReward: number;
  /** Vocabulary words taught in this lesson */
  vocabulary: string[];
}

export interface SeasonalCollectible {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  rarity: CollectionRarity;
  description: string;
  /** How to obtain: lesson completion, all lessons done, daily login during event */
  obtainMethod: 'lesson-complete' | 'event-complete' | 'daily-login';
  /** Which lesson grants it (if method is lesson-complete) */
  lessonId?: string;
}

export interface UserEventProgress {
  eventId: SeasonalEventId;
  lessonsCompleted: string[];
  collectiblesEarned: string[];
  startedAt: Timestamp;
  completedAt?: Timestamp;
}
