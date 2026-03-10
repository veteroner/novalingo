/**
 * NovaLingo — İçerik Tipleri
 *
 * Dünya (World) → Ünite (Unit) → Ders (Lesson) → Aktivite (Activity)
 */

import { type Timestamp } from 'firebase/firestore';

// ===== WORLD =====
export interface World {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  order: number;
  themeColor: string;
  iconUrl: string;
  backgroundUrl: string;
  requiredLevel: number;
  isPremium: boolean;
  units: string[]; // unit IDs
}

// ===== UNIT =====
export interface Unit {
  id: string;
  worldId: string;
  name: string;
  nameEn: string;
  description: string;
  order: number;
  iconUrl: string;
  lessons: string[]; // lesson IDs
  bossLessonId: string | null;
}

// ===== LESSON =====
export type LessonType = 'normal' | 'boss' | 'review' | 'bonus';
export type LessonDifficulty = 'easy' | 'medium' | 'hard';

export interface Lesson {
  id: string;
  unitId: string;
  worldId: string;
  name: string;
  nameEn: string;
  type: LessonType;
  difficulty: LessonDifficulty;
  order: number;
  requiredStars: number; // önceki ders gereksinimi
  estimatedMinutes: number;
  xpReward: number;
  starReward: number;
  activities: Activity[];
  vocabulary: string[]; // kelime ID'leri
  createdAt?: Timestamp;
}

// ===== ACTIVITY =====
export type ActivityType =
  | 'flash-card'
  | 'match-pairs'
  | 'listen-and-tap'
  | 'word-builder'
  | 'fill-blank'
  | 'speak-it'
  | 'story-time'
  | 'memory-game'
  | 'word-search'
  | 'quiz-battle'
  | 'sentence-builder'
  | 'story-comprehension'
  | 'grammar-transform';

export interface Activity {
  id: string;
  type: ActivityType;
  order: number;
  data: ActivityData;
  timeLimit: number | null; // saniye
  maxAttempts: number;
}

// ===== ACTIVITY DATA VARIANTS =====
export type ActivityData =
  | FlashCardData
  | MatchPairsData
  | ListenAndTapData
  | WordBuilderData
  | FillBlankData
  | SpeakItData
  | StoryTimeData
  | MemoryGameData
  | WordSearchData
  | QuizBattleData
  | SentenceBuilderData
  | StoryComprehensionData
  | GrammarTransformData;

export interface FlashCardData {
  type: 'flash-card';
  word: string;
  translation: string;
  imageUrl: string;
  audioUrl: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface MatchPairsData {
  type: 'match-pairs';
  pairs: Array<{
    id: string;
    left: string;
    right: string;
    leftType: 'text' | 'image' | 'audio';
    rightType: 'text' | 'image' | 'audio';
  }>;
}

export interface ListenAndTapData {
  type: 'listen-and-tap';
  audioUrl: string;
  correctAnswer: string;
  options: string[];
  imageHint: string | null;
}

export interface WordBuilderData {
  type: 'word-builder';
  word: string;
  translation: string;
  imageUrl: string;
  audioUrl: string;
  scrambledLetters: string[];
  hintLetters: number[]; // gösterilecek harf indeksleri
}

export interface FillBlankData {
  type: 'fill-blank';
  sentence: string;
  translation: string;
  correctAnswer: string;
  options: string[];
  audioUrl: string;
}

export interface SpeakItData {
  type: 'speak-it';
  word: string;
  translation: string;
  audioUrl: string;
  imageUrl: string;
  acceptableVariations: string[]; // speech recognition toleransı
  /** Kid-friendly phonetic hint, e.g. "dög" for "dog". Shown after failed attempt. */
  phonemeHint?: string;
}

export interface StoryTimeData {
  type: 'story-time';
  title: string;
  pages: Array<{
    text: string;
    translation: string;
    imageUrl: string;
    audioUrl: string;
    highlightWords: string[];
    interactionType: 'tap-word' | 'choose-image' | 'drag-item' | 'none';
    interactionData?: Record<string, unknown>;
  }>;
}

export interface MemoryGameData {
  type: 'memory-game';
  cards: Array<{
    id: string;
    matchId: string;
    content: string;
    contentType: 'text' | 'image' | 'audio';
  }>;
  gridSize: { rows: number; cols: number };
}

export interface WordSearchData {
  type: 'word-search';
  grid: string[][];
  words: Array<{
    word: string;
    translation: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
    startRow: number;
    startCol: number;
  }>;
  gridSize: number;
}

export interface QuizBattleData {
  type: 'quiz-battle';
  questions: Array<{
    id: string;
    question: string;
    questionType: 'text' | 'audio' | 'image';
    questionMediaUrl?: string;
    options: string[];
    correctIndex: number;
    timeLimit: number;
    points: number;
  }>;
}

export interface SentenceBuilderData {
  type: 'sentence-builder';
  /** Target English sentence to construct */
  sentence: string;
  /** Turkish translation shown as hint */
  translation: string;
  /** Scrambled words for the user to arrange */
  words: string[];
  /** Correct word order */
  correctOrder: string[];
}

export interface StoryComprehensionData {
  type: 'story-comprehension';
  /** Short passage to read */
  passage: string;
  /** Turkish translation of the passage */
  passageTranslation: string;
  /** Comprehension questions about the passage */
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}

export interface GrammarTransformData {
  type: 'grammar-transform';
  /** Instruction for the transformation, e.g. "Make it plural" */
  instruction: string;
  /** Turkish translation of the instruction */
  instructionTr: string;
  /** The source sentence to transform */
  sourceSentence: string;
  /** The correct transformed sentence */
  correctAnswer: string;
  /** Multiple choice options */
  options: string[];
}
