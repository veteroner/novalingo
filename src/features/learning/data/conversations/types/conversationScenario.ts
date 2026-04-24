export type ConversationAgeBand = '4_6' | '7_9' | '10_12';
export type ConversationDifficulty = 'starter' | 'core' | 'stretch';
export type ConversationMode = 'guided' | 'semi_open' | 'mission' | 'story' | 'open_ended';
export type ConversationEnergy = 'calm' | 'playful' | 'exciting';
export type ConversationGoalType =
  | 'choose'
  | 'describe'
  | 'request'
  | 'answer'
  | 'ask'
  | 'react'
  | 'compare'
  | 'express_feeling'
  | 'solve'
  | 'sequence'
  | 'suggest'
  | 'identify'
  | 'report'
  | 'repeat'
  | 'direct'
  | 'introduce';

export interface ConversationSuccessCriteria {
  minimumAcceptedTurns: number;
  minimumTargetWordsHit: number;
  requiredPatterns?: string[];
  allowCompletionOnHintedAnswer: boolean;
}

export interface ConversationReward {
  rewardType: 'praise' | 'sticker' | 'badge_progress' | 'collectible' | 'none';
  rewardId?: string;
}

/** Story-series metadata — present when mode === 'story' */
export interface ConversationStoryMeta {
  seriesId: string;
  seriesTitleTr: string;
  episodeNumber: number;
  totalEpisodes: number;
}

export interface ConversationSelectionPolicy {
  priority: number;
  repeatCooldownDays?: number;
  preferredIfTagsSeen?: string[];
  avoidIfCompletedRecently?: boolean;
}

export interface ConversationVariant {
  id: string;
  label: string;
  labelTr: string;
  promptStyle: 'default' | 'short' | 'playful' | 'mission';
  swapWordSets?: string[];
}

export interface ConversationHint {
  delayMs?: number;
  text: string;
  textTr: string;
  revealPattern?: boolean;
}

export interface ConversationRepair {
  enabled: boolean;
  prompt: string;
  promptTr: string;
  maxRetries: number;
  fallbackResponse?: string;
  fallbackResponseTr?: string;
}

export interface ConversationScoringRule {
  scoreType: 'target_word' | 'pattern' | 'turn_completion' | 'mission_step';
  weight: number;
}

export interface ConversationOpenEndedConfig {
  enabled: boolean;
  strategy: 'favorite_thing' | 'choose_thing' | 'because_reason' | 'free_text';
  domain: 'animal' | 'descriptor' | 'free_text' | 'color' | 'food';
  slotKey: string;
  nextNodeId: string;
  capturePrefixes?: string[];
  marksPattern?: string[];
  countCapturedValueAsTargetWord?: boolean;
}

export interface ConversationResponseRule {
  id: string;
  expectedText: string;
  expectedTextTr: string;
  acceptedVariants?: string[];
  acceptedWords?: string[];
  minimumConfidence?: number;
  nextNodeId: string | null;
  emoji?: string;
  rewardXp?: number;
  feedbackEmoji?: string;
  feedbackText?: string;
  feedbackTextTr?: string;
  marksTargetWord?: string[];
  marksPattern?: string[];
}

export interface ConversationNodeV2 {
  id: string;
  speaker: 'nova' | 'child' | 'system';
  role?: 'guide' | 'friend' | 'shopkeeper' | 'teammate' | 'narrator';
  text: string;
  textTr: string;
  audioUrl?: string;
  emoji?: string;
  intent?: string;
  goalType?: ConversationGoalType;
  targetWord?: string;
  targetPattern?: string;
  hint?: ConversationHint;
  repair?: ConversationRepair;
  scoring?: ConversationScoringRule;
  responses?: ConversationResponseRule[];
  openEnded?: ConversationOpenEndedConfig;
  next?: string;
}

export interface ConversationScenario {
  id: string;
  version: number;
  phase: 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5';
  title: string;
  titleTr: string;
  summary: string;
  summaryTr: string;
  theme: string;
  subTheme: string;
  tags: string[];
  ageBand: ConversationAgeBand;
  difficulty: ConversationDifficulty;
  mode: ConversationMode;
  energy: ConversationEnergy;
  estimatedDurationSec: number;
  turnCount: number;
  sceneEmoji: string;
  targetWords: string[];
  targetPatterns: string[];
  learningGoals: string[];
  successCriteria: ConversationSuccessCriteria;
  reward: ConversationReward;
  /** Optional story-series data — set when mode === 'story' */
  series?: ConversationStoryMeta;
  selection: ConversationSelectionPolicy;
  variants: ConversationVariant[];
  entryNodeId: string;
  nodes: ConversationNodeV2[];
}

export interface SelectConversationScenarioParams {
  words: string[];
  ageBand?: ConversationAgeBand;
  difficulty?: ConversationDifficulty;
  preferredTheme?: string;
  excludeScenarioIds?: string[];
  candidates?: ConversationScenario[];
  /** IDs of recently completed scenarios (newest first) — used for repetition penalty */
  recentlyCompletedIds?: string[];
  /** Child's average success rate (0-1) — used for difficulty adaptation */
  averageSuccessRate?: number;
  /** Patterns the child struggled with — used for re-drilling */
  weakPatterns?: string[];
  /** Tags the child has shown preference for */
  preferredTags?: string[];
  /** Narrow candidate pool to a specific phase (e.g. 'phase3') */
  phase?: ConversationScenario['phase'];
  /** Narrow candidate pool by world ID (e.g. 'w3') — mapped to phase internally */
  worldId?: string | null;
}
