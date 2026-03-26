import { describe, expect, it } from 'vitest';
import { scoreConversation } from '../runtime/scoreConversation';

describe('scoreConversation', () => {
  it('passes when accepted turns, words, and patterns meet scenario criteria', () => {
    const result = scoreConversation({
      scenario: {
        successCriteria: {
          minimumAcceptedTurns: 2,
          minimumTargetWordsHit: 2,
          requiredPatterns: ['I want ___'],
          allowCompletionOnHintedAnswer: true,
        },
        estimatedDurationSec: 90,
      } as never,
      turns: [
        {
          nodeId: 'n1',
          matched: true,
          hintUsed: false,
          markedTargetWords: ['apple'],
          markedPatterns: ['I want ___'],
        },
        {
          nodeId: 'n2',
          matched: true,
          hintUsed: false,
          markedTargetWords: ['banana'],
          markedPatterns: [],
        },
      ],
      totalTimeSeconds: 60,
    });

    expect(result.passed).toBe(true);
    expect(result.acceptedTurns).toBe(2);
    expect(result.targetWordsHit).toEqual(['apple', 'banana']);
    expect(result.patternsHit).toEqual(['I want ___']);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});
