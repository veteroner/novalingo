/**
 * matchConversationResponse — Response-rule-aware conversation matching engine.
 *
 * Uses ConversationResponseRule metadata (acceptedVariants, acceptedWords,
 * minimumConfidence) for more accurate matching than the legacy runtime.
 */

import type { ConversationResponseRule } from '../types/conversationScenario';

export interface ResponseRuleMatchParams {
  rawText: string;
  responses: ConversationResponseRule[];
  pronunciationScorer: (input: string, expected: string, variations?: string[]) => number;
  defaultThreshold?: number;
}

export type ResponseMatchType =
  | 'exact'
  | 'pronunciation'
  | 'variant'
  | 'accepted_word'
  | 'keyword'
  | 'none';

export interface ResponseRuleMatchResult {
  matched: ConversationResponseRule | null;
  matchType: ResponseMatchType;
  confidence: number;
  markedTargetWords: string[];
  markedPatterns: string[];
}

const DEFAULT_THRESHOLD = 0.65;

export function matchConversationResponseRule(
  params: ResponseRuleMatchParams,
): ResponseRuleMatchResult {
  const { rawText, responses, pronunciationScorer } = params;
  const threshold = params.defaultThreshold ?? DEFAULT_THRESHOLD;
  const text = rawText.toLowerCase().trim();

  const noMatch: ResponseRuleMatchResult = {
    matched: null,
    matchType: 'none',
    confidence: 0,
    markedTargetWords: [],
    markedPatterns: [],
  };

  if (!text || responses.length === 0) return noMatch;

  // 1. Exact match
  for (const rule of responses) {
    if (text === rule.expectedText.toLowerCase().trim()) {
      return {
        matched: rule,
        matchType: 'exact',
        confidence: 1.0,
        markedTargetWords: rule.marksTargetWord ?? [],
        markedPatterns: rule.marksPattern ?? [],
      };
    }
  }

  // 2. Pronunciation scoring (uses the same scorer as legacy)
  let bestRule: ConversationResponseRule | null = null;
  let bestScore = 0;
  for (const rule of responses) {
    const ruleThreshold = rule.minimumConfidence ?? threshold;
    const score = pronunciationScorer(text, rule.expectedText, rule.acceptedVariants);
    if (score > bestScore && score >= ruleThreshold) {
      bestScore = score;
      bestRule = rule;
    }
  }
  if (bestRule) {
    return {
      matched: bestRule,
      matchType: 'pronunciation',
      confidence: bestScore,
      markedTargetWords: bestRule.marksTargetWord ?? [],
      markedPatterns: bestRule.marksPattern ?? [],
    };
  }

  // 3. Accepted variants (includes-based) — only for rules that don't require a strict confidence
  for (const rule of responses) {
    const ruleThreshold = rule.minimumConfidence ?? threshold;
    // Skip rules with high minimumConfidence — they should only pass via pronunciation scoring
    if (ruleThreshold > 0.75) continue;
    const accVars: string[] | undefined = rule.acceptedVariants;
    const variants = [
      rule.expectedText.toLowerCase(),
      ...(accVars?.map((v) => v.toLowerCase()) ?? []),
    ];
    if (variants.some((v) => text.includes(v))) {
      return {
        matched: rule,
        matchType: 'variant',
        confidence: 0.8,
        markedTargetWords: rule.marksTargetWord ?? [],
        markedPatterns: rule.marksPattern ?? [],
      };
    }
  }

  // 4. Accepted words (single-word hits from scenario metadata) — only for rules without strict confidence
  for (const rule of responses) {
    const ruleThreshold = rule.minimumConfidence ?? threshold;
    if (ruleThreshold > 0.75) continue;
    if (rule.acceptedWords && rule.acceptedWords.length > 0) {
      if (rule.acceptedWords.some((w) => text.includes(w.toLowerCase()))) {
        return {
          matched: rule,
          matchType: 'accepted_word',
          confidence: 0.7,
          markedTargetWords: rule.marksTargetWord ?? [],
          markedPatterns: rule.marksPattern ?? [],
        };
      }
    }
  }

  // 5. Keyword fallback — any significant word from expectedText; skipped for strict-confidence rules
  for (const rule of responses) {
    const ruleThreshold = rule.minimumConfidence ?? threshold;
    if (ruleThreshold > 0.75) continue;
    const keywords = rule.expectedText
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (keywords.some((kw) => text.includes(kw))) {
      return {
        matched: rule,
        matchType: 'keyword',
        confidence: 0.6,
        markedTargetWords: rule.marksTargetWord ?? [],
        markedPatterns: rule.marksPattern ?? [],
      };
    }
  }

  return noMatch;
}
