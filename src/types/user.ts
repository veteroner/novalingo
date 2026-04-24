/**
 * NovaLingo — Kullanıcı ve Profil Tipleri
 *
 * Firestore users/ koleksiyonu ile birebir eşleşir.
 */

import { type Timestamp } from 'firebase/firestore';

// ===== AGE GROUPS =====
export type AgeGroup = 'cubs' | 'stars' | 'legends';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  minAge: number;
  maxAge: number;
  emoji: string;
}

export const AGE_GROUPS: AgeGroupConfig[] = [
  { id: 'cubs', label: 'Cubs', minAge: 4, maxAge: 6, emoji: '🐻' },
  { id: 'stars', label: 'Stars', minAge: 7, maxAge: 9, emoji: '⭐' },
  { id: 'legends', label: 'Legends', minAge: 10, maxAge: 12, emoji: '🏆' },
];

// ===== USER (Parent Account) =====
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: 'google' | 'apple' | 'anonymous';
  isPremium: boolean;
  premiumExpiresAt: Timestamp | null;
  subscriptionState?: string | null;
  subscriptionPlatform?: string | null;
  subscriptionProductId?: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  settings: UserSettings;
  /**
   * Optional pilot cohort tag. Set by ops during pilot onboarding so
   * analytics/Firestore queries can segment the pilot group from the
   * general user base. Example values: "pilot-2026-04", "internal-qa".
   */
  pilotCohort?: string;
}

export interface UserSettings {
  language: 'tr' | 'en';
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number; // 0-1
  bgmVolume: number; // 0-1
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoalMinutes: number;
  parentPin: string | null;
}

// ===== CHILD PROFILE =====
export interface ChildProfile {
  id: string;
  parentUid: string; // parent user ID
  name: string;
  avatarId: string;
  ageGroup: AgeGroup;
  createdAt: Timestamp;

  // Progress
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;

  // Currency
  stars: number;
  gems: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  streakFreezes: number;

  // Nova Companion
  novaStage: NovaStage;
  novaHappiness: number; // 0-100
  novaOutfitId: string | null;

  // League
  leagueId: string;
  leagueTier: LeagueTier;
  weeklyXP: number;

  // Content Progress
  currentWorldId: string;
  currentUnitId: string;
  completedLessons: number;
  totalPlayTimeMinutes: number;
  wordsLearned?: number;
}

// ===== NOVA COMPANION =====
export type NovaStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'legendary';

export interface NovaState {
  stage: NovaStage;
  happiness: number;
  outfitId: string | null;
  lastInteraction: Timestamp;
  unlockedOutfits: string[];
  unlockedAbilities: string[];
}

// ===== LEAGUE =====
export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

export const LEAGUE_TIERS: LeagueTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'legend',
];
