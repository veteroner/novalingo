/* eslint-disable @typescript-eslint/no-deprecated -- This file IS the legacy engine; internal self-references are expected. */
/**
 * @deprecated Legacy conversation matching engine.
 * New scenario-based matching: conversations/runtime/matchConversationResponse.ts
 * Kept for backward compatibility with legacy template-based conversations.
 */
export interface ConversationRuntimeOption {
  text: string;
  textTr: string;
  acceptableVariations?: string[];
  nextNodeId: string;
  emoji?: string;
}

export interface MatchConversationResponseParams {
  rawText: string;
  options: ConversationRuntimeOption[];
  targetWords: string[];
  acceptThreshold: number;
  pronunciationScorer: (
    input: string,
    expectedText: string,
    acceptableVariations?: string[],
  ) => number;
}

export interface MatchConversationResponseResult {
  matchedOption: ConversationRuntimeOption | null;
  matchType: 'pronunciation' | 'variation' | 'target-word' | 'keyword' | 'none';
  confidence: number;
}

export function matchConversationResponse(
  params: MatchConversationResponseParams,
): MatchConversationResponseResult {
  const { rawText, options, targetWords, acceptThreshold, pronunciationScorer } = params;
  const text = rawText.toLowerCase().trim();

  if (!text || options.length === 0) {
    return {
      matchedOption: null,
      matchType: 'none',
      confidence: 0,
    };
  }

  let bestOption: ConversationRuntimeOption | null = null;
  let bestScore = 0;
  for (const option of options) {
    const score = pronunciationScorer(text, option.text, option.acceptableVariations);
    if (score > bestScore) {
      bestScore = score;
      bestOption = option;
    }
  }

  if (bestOption && bestScore >= acceptThreshold) {
    return {
      matchedOption: bestOption,
      matchType: 'pronunciation',
      confidence: bestScore,
    };
  }

  for (const option of options) {
    const variations = [option.text.toLowerCase(), ...(option.acceptableVariations ?? [])];
    if (variations.some((variation) => text.includes(variation.toLowerCase()))) {
      return {
        matchedOption: option,
        matchType: 'variation',
        confidence: 0.8,
      };
    }
  }

  const foundTarget = targetWords.find((targetWord) => text.includes(targetWord.toLowerCase()));
  if (foundTarget) {
    const matchingOption =
      options.find((option) => option.text.toLowerCase().includes(foundTarget.toLowerCase())) ??
      options[0] ??
      null;

    if (matchingOption) {
      return {
        matchedOption: matchingOption,
        matchType: 'target-word',
        confidence: 0.7,
      };
    }
  }

  for (const option of options) {
    const optionWords = option.text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    if (optionWords.some((word) => text.includes(word))) {
      return {
        matchedOption: option,
        matchType: 'keyword',
        confidence: 0.6,
      };
    }
  }

  return {
    matchedOption: null,
    matchType: 'none',
    confidence: 0,
  };
}
