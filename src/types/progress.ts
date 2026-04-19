/**
 * NovaLingo — İlerleme ve SRS Tipleri
 */

import { type Timestamp } from 'firebase/firestore';
import { type ActivityType } from './content';

export interface ConversationEvidence {
  scenarioId?: string;
  scenarioTheme?: string;
  acceptedTurns: number;
  hintedTurns: number;
  targetWordsHit: string[];
  patternsHit: string[];
  rawChildResponses?: string[];
  passed: boolean;
  score: number;
}

export interface LessonActivityAttempt {
  activityId: string;
  activityType?: ActivityType;
  correct: boolean;
  timeSpentMs: number;
  hintsUsed?: number;
  attempts?: number;
  conversationEvidence?: ConversationEvidence;
}

// ===== LESSON PROGRESS =====
export interface LessonProgress {
  id: string;
  userId: string;
  childId: string;
  lessonId: string;
  unitId: string;
  worldId: string;
  completedAt: Timestamp;
  durationSeconds: number;

  // Skor
  score: number; // 0-100
  starsEarned: number; // 0-3
  xpEarned: number;
  accuracy: number; // 0-1

  // Detay
  activitiesCompleted: number;
  activitiesTotal: number;
  correctAnswers: number;
  wrongAnswers: number;
  hintsUsed: number;

  // Kelime
  newWordsLearned: string[];
  wordsReviewed: string[];

  // Meta
  attemptNumber: number;
  isPerfect: boolean;
  deviceType: 'web' | 'ios' | 'android';
  attempts?: LessonActivityAttempt[];
  conversationEvidence?: ConversationEvidence[];
}

// ===== ACTIVITY RESULT =====
export interface ActivityResult {
  activityId: string;
  activityType: ActivityType;
  isCorrect: boolean;
  score: number; // 0-100
  timeSpentSeconds: number;
  attempts: number;
  hintsUsed: number;
  selectedAnswer?: string;
  correctAnswer?: string;
  conversationEvidence?: ConversationEvidence;
}

// ===== SRS (Spaced Repetition System) =====
export interface VocabularyCard {
  id: string;
  userId: string;
  childId: string;
  word: string;
  translation: string;
  imageUrl: string;
  audioUrl: string;

  // SM-2 Variant
  repetitions: number;
  easeFactor: number; // 1.3 - 2.5
  interval: number; // gün cinsinden
  nextReviewAt: Timestamp;
  lastReviewedAt: Timestamp;

  // Mastery
  masteryLevel: MasteryLevel;
  correctCount: number;
  incorrectCount: number;

  // Source
  learnedInLessonId: string;
  learnedAt: Timestamp;
}

export type MasteryLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface SRSReviewResult {
  cardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 kalite puanı
  responseTimeMs: number;
}

// ===== OFFLINE SYNC =====
export interface OfflineAction {
  id: string;
  type: 'lessonComplete' | 'vocabularyReview' | 'questProgress' | 'currencyChange';
  payload: Record<string, unknown>;
  createdAt: number; // Date.now()
  synced: boolean;
  retryCount: number;
}
