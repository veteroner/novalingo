import { describe, expect, it } from 'vitest';

import { resolveOpenEndedResponse } from '../runtime/resolveOpenEndedResponse';

describe('resolveOpenEndedResponse', () => {
  it('extracts an open-ended animal choice', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'My favorite animal is a snake',
      config: {
        enabled: true,
        strategy: 'favorite_thing',
        domain: 'animal',
        slotKey: 'favoriteAnimal',
        nextNodeId: 'next',
        marksPattern: ['My favorite ... is ...'],
        countCapturedValueAsTargetWord: true,
      },
    });

    expect(result).toEqual({
      slotKey: 'favoriteAnimal',
      slotValue: 'snake',
      nextNodeId: 'next',
      marksPattern: ['My favorite ... is ...'],
      markedTargetWords: ['snake'],
    });
  });

  it('extracts an open-ended reason adjective', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'Because it is scary',
      config: {
        enabled: true,
        strategy: 'because_reason',
        domain: 'descriptor',
        slotKey: 'favoriteAnimalReason',
        nextNodeId: 'next',
        marksPattern: ['I like ... because ...'],
        countCapturedValueAsTargetWord: true,
      },
    });

    expect(result).toEqual({
      slotKey: 'favoriteAnimalReason',
      slotValue: 'scary',
      nextNodeId: 'next',
      marksPattern: ['I like ... because ...'],
      markedTargetWords: ['scary'],
    });
  });

  it('extracts a food choice with choose_thing strategy', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'I choose salad',
      config: {
        enabled: true,
        strategy: 'choose_thing',
        domain: 'food',
        slotKey: 'chosenFood',
        nextNodeId: 'next',
        marksPattern: ['I choose...'],
        countCapturedValueAsTargetWord: true,
      },
    });

    expect(result).toEqual({
      slotKey: 'chosenFood',
      slotValue: 'salad',
      nextNodeId: 'next',
      marksPattern: ['I choose...'],
      markedTargetWords: ['salad'],
    });
  });
});
