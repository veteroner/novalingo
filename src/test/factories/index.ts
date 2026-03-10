/**
 * Test Factories — Mock veri oluşturma yardımcıları
 */

import type { Activity, ActivityResult } from '@/types';
import type { ChildProfile } from '@/types/user';

let idCounter = 0;
function nextId(prefix = 'test') {
  return `${prefix}_${++idCounter}`;
}

export function resetFactoryIds() {
  idCounter = 0;
}

export function createChildProfile(overrides?: Partial<ChildProfile>): ChildProfile {
  return {
    id: nextId('child'),
    parentUid: 'parent_1',
    name: 'Test Çocuk',
    avatarId: 'avatar_default',
    ageGroup: 'stars',
    createdAt: {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: () => new Date(),
      toMillis: () => Date.now(),
    } as ChildProfile['createdAt'],
    level: 5,
    totalXP: 500,
    currentLevelXP: 50,
    nextLevelXP: 120,
    stars: 100,
    gems: 10,
    currentStreak: 3,
    longestStreak: 7,
    lastActivityDate: '2026-03-05',
    streakFreezes: 2,
    novaStage: 'child',
    novaHappiness: 80,
    novaOutfitId: null,
    leagueId: 'silver_default',
    leagueTier: 'silver',
    weeklyXP: 200,
    currentWorldId: 'w1',
    currentUnitId: 'u1',
    completedLessons: 12,
    totalPlayTimeMinutes: 180,
    wordsLearned: 45,
    ...overrides,
  } as ChildProfile;
}

export function createActivity(overrides?: Partial<Activity>): Activity {
  return {
    id: nextId('act'),
    type: 'flash-card',
    prompt: 'Cat',
    correctAnswer: 'Kedi',
    options: ['Kedi', 'Köpek', 'Kuş', 'Balık'],
    imageUrl: null,
    audioUrl: null,
    difficulty: 'easy',
    ...overrides,
  } as Activity;
}

export function createActivityResult(overrides?: Partial<ActivityResult>): ActivityResult {
  return {
    activityId: nextId('act'),
    activityType: 'flash-card',
    isCorrect: true,
    score: 85,
    timeSpentSeconds: 8,
    attempts: 1,
    hintsUsed: 0,
    ...overrides,
  };
}
