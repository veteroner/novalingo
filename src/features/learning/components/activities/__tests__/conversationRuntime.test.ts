import { describe, expect, it } from 'vitest';
import { matchConversationResponse } from '../conversationRuntime';

const options = [
  {
    text: 'I want a dog!',
    textTr: 'Bir kopek istiyorum!',
    acceptableVariations: ['dog', 'a dog', 'i want a dog'],
    nextNodeId: 'dog',
  },
  {
    text: 'I want a cat!',
    textTr: 'Bir kedi istiyorum!',
    acceptableVariations: ['cat', 'a cat', 'i want a cat'],
    nextNodeId: 'cat',
  },
];

describe('matchConversationResponse', () => {
  it('matches by pronunciation score first', () => {
    const result = matchConversationResponse({
      rawText: 'i want a dog',
      options,
      targetWords: ['dog', 'cat'],
      acceptThreshold: 0.65,
      pronunciationScorer: (input, expected) => (input === expected.toLowerCase().replace('!', '') ? 0.9 : 0.1),
    });

    expect(result.matchType).toBe('pronunciation');
    expect(result.matchedOption?.nextNodeId).toBe('dog');
  });

  it('falls back to target word matching', () => {
    const result = matchConversationResponse({
      rawText: 'dog please',
      options,
      targetWords: ['dog', 'cat'],
      acceptThreshold: 0.95,
      pronunciationScorer: () => 0.1,
    });

    expect(result.matchType).toBe('variation');
    expect(result.matchedOption?.nextNodeId).toBe('dog');
  });

  it('returns no match when nothing fits', () => {
    const result = matchConversationResponse({
      rawText: 'xylophone',
      options,
      targetWords: ['dog', 'cat'],
      acceptThreshold: 0.95,
      pronunciationScorer: () => 0.1,
    });

    expect(result.matchType).toBe('none');
    expect(result.matchedOption).toBeNull();
  });
});