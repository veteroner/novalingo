export type ConversationAgeBand = '4_6' | '7_9' | '10_12';
export type ConversationDifficulty = 'starter' | 'core' | 'stretch';
export type ConversationMode = 'guided' | 'semi_open' | 'mission' | 'story';
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
  | 'sequence';

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

export interface ConversationResponseRule {
  id: string;
  expectedText: string;
  expectedTextTr: string;
  acceptedVariants: string[];
  acceptedWords?: string[];
  minimumConfidence?: number;
  nextNodeId: string;
  emoji?: string;
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
  next?: string;
}

export interface ConversationScenario {
  id: string;
  version: number;
  phase: 'phase1' | 'phase2' | 'phase3';
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
}
