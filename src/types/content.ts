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
  | 'grammar-transform'
  | 'conversation'
  | 'lesson-intro'
  | 'lesson-outro';

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
  | GrammarTransformData
  | ConversationData
  | LessonIntroData
  | LessonOutroData;

export interface LessonIntroData {
  type: 'lesson-intro';
  /** Nova's intro line shown before lesson activities begin */
  text: string;
}

export interface LessonOutroData {
  type: 'lesson-outro';
  /** Nova's celebration line shown after all lesson activities complete */
  text: string;
}

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

// ===== CONVERSATION (Nova ile Konuş) =====

export interface ConversationNode {
  /** Unique node id within the dialogue tree */
  id: string;
  /** Who is speaking: 'nova' (mascot/NPC) or 'child' */
  speaker: 'nova' | 'child';
  /** Display text (English) */
  text: string;
  /** Turkish translation shown below */
  textTr: string;
  /** Optional pre-recorded audio URL for this line */
  audioUrl?: string;
  /** Optional emoji/image to show alongside the bubble */
  emoji?: string;
  /** Child response options — only present when speaker is 'nova' (prompting child) */
  options?: ConversationOption[];
  /** Next node id to auto-advance to (for nova lines without options) */
  next?: string;
  /** Primary target vocabulary word for this prompt — used in free-form matching */
  targetWord?: string;
  /** Optional open-ended fallback for semi-open / open-ended prompts */
  openEnded?: ConversationOpenEndedData;
}

export interface ConversationOption {
  /** The English text the child should say/tap */
  text: string;
  /** Turkish translation */
  textTr: string;
  /** Acceptable STT variations for this option */
  acceptableVariations?: string[];
  /** Accepted keyword hits used by response-rule-aware matching */
  acceptedWords?: string[];
  /** Per-option confidence threshold override */
  minimumConfidence?: number;
  /** Node id to jump to when this option is chosen */
  nextNodeId: string;
  /** Optional emoji shown on the option button */
  emoji?: string;
  /** Stable response id from the scenario registry */
  responseId?: string;
  /** Words to mark as demonstrated when this response is accepted */
  marksTargetWords?: string[];
  /** Patterns to mark as demonstrated when this response is accepted */
  marksPatterns?: string[];
}

export interface ConversationOpenEndedData {
  enabled: boolean;
  strategy: 'favorite_thing' | 'choose_thing' | 'because_reason';
  domain: 'animal' | 'descriptor' | 'free_text' | 'color' | 'food';
  slotKey: string;
  nextNodeId: string;
  marksPattern?: string[];
  countCapturedValueAsTargetWord?: boolean;
}

export interface ConversationSuccessCriteriaData {
  minimumAcceptedTurns: number;
  minimumTargetWordsHit: number;
  requiredPatterns?: string[];
  allowCompletionOnHintedAnswer: boolean;
}

export interface ConversationData {
  type: 'conversation';
  /** Scene title, e.g. "At the Pet Shop" */
  title: string;
  titleTr: string;
  /** Scene emoji/image */
  sceneEmoji: string;
  /** Dialogue tree — nodes keyed by id */
  nodes: ConversationNode[];
  /** Id of the first node to start the dialogue */
  startNodeId: string;
  /** Target vocabulary practiced in this conversation */
  targetWords: string[];
  /** Registry scenario id (set when generated from a ConversationScenario) */
  scenarioId?: string;
  /** Scenario theme (e.g. "animals", "food") */
  scenarioTheme?: string;
  /** Brief summary shown at conversation start */
  scenarioSummary?: string;
  scenarioSummaryTr?: string;
  /** Scenario mode: guided, semi_open, open_ended */
  scenarioMode?: string;
  /** Target patterns for pattern reveal UI */
  targetPatterns?: string[];
  /** Reward type and id for end screen */
  rewardType?: string;
  rewardId?: string;
  /** Scenario success rules used for conversation scoring */
  successCriteria?: ConversationSuccessCriteriaData;
  /** Scenario duration hint used for time bonus scoring */
  estimatedDurationSec?: number;
}
