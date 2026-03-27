/**
 * Scenario-level completion scoring.
 *
 * Evaluates how well a child performed in a conversation scenario
 * using the scenario's success criteria and scoring rules.
 */

import type {
  ConversationScenario,
  ConversationSuccessCriteria,
} from '../types/conversationScenario';

export interface ConversationTurnResult {
  nodeId: string;
  matched: boolean;
  hintUsed: boolean;
  markedTargetWords: string[];
  markedPatterns: string[];
}

export interface ConversationScoreParams {
  scenario: ConversationScenario;
  turns: ConversationTurnResult[];
  totalTimeSeconds: number;
}

export interface ConversationScoreResult {
  score: number;
  passed: boolean;
  acceptedTurns: number;
  targetWordsHit: string[];
  patternsHit: string[];
  hintedTurns: number;
  details: {
    turnScore: number;
    wordScore: number;
    patternScore: number;
    timeBonus: number;
  };
}

export function scoreConversation(params: ConversationScoreParams): ConversationScoreResult {
  const { scenario, turns, totalTimeSeconds } = params;
  const criteria: ConversationSuccessCriteria = scenario.successCriteria;

  const acceptedTurns = turns.filter((t) => t.matched).length;
  const hintedTurns = turns.filter((t) => t.matched && t.hintUsed).length;

  // Collect unique target words & patterns hit across all turns
  const targetWordsHit = [...new Set(turns.flatMap((t) => t.markedTargetWords))];
  const patternsHit = [...new Set(turns.flatMap((t) => t.markedPatterns))];

  // ── Scoring components (0-100 each, weighted) ──

  // Turn completion: what fraction of turns were accepted
  const turnMax = Math.max(criteria.minimumAcceptedTurns, 1);
  const turnScore = Math.min(acceptedTurns / turnMax, 1) * 100;

  // Target word coverage
  const wordMax = Math.max(criteria.minimumTargetWordsHit, 1);
  const wordScore = Math.min(targetWordsHit.length / wordMax, 1) * 100;

  // Pattern coverage (optional)
  const patternMax = criteria.requiredPatterns?.length ?? 0;
  const patternScore = patternMax > 0 ? Math.min(patternsHit.length / patternMax, 1) * 100 : 100;

  // Time bonus: finishing within estimated duration
  const estimatedSec = scenario.estimatedDurationSec || 90;
  const timeBonus = totalTimeSeconds <= estimatedSec ? 10 : 0;

  // Hinted penalty: hinted answers count at 50%
  const hintPenalty = hintedTurns > 0 && !criteria.allowCompletionOnHintedAnswer ? 10 : 0;

  // Weighted composite: turns 40%, words 30%, patterns 20%, time 10%
  const raw = turnScore * 0.4 + wordScore * 0.3 + patternScore * 0.2 + timeBonus - hintPenalty;

  const score = Math.max(0, Math.min(100, Math.round(raw)));

  // Pass criteria
  const passedTurns = acceptedTurns >= criteria.minimumAcceptedTurns;
  const passedWords = targetWordsHit.length >= criteria.minimumTargetWordsHit;
  const passedPatterns =
    !criteria.requiredPatterns || criteria.requiredPatterns.length === 0
      ? true
      : criteria.requiredPatterns.every((p) => patternsHit.includes(p));
  const passedHintPolicy =
    criteria.allowCompletionOnHintedAnswer !== false || hintedTurns < acceptedTurns; // at least one non-hinted accepted turn
  const passed = passedTurns && passedWords && passedPatterns && passedHintPolicy;

  return {
    score,
    passed,
    acceptedTurns,
    targetWordsHit,
    patternsHit,
    hintedTurns,
    details: {
      turnScore: Math.round(turnScore),
      wordScore: Math.round(wordScore),
      patternScore: Math.round(patternScore),
      timeBonus,
    },
  };
}
