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

  it('extracts a free-text pet name', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'Its name is Öner!',
      config: {
        enabled: true,
        strategy: 'free_text',
        domain: 'free_text',
        slotKey: 'petName',
        nextNodeId: 'next',
        marksPattern: ['Its name is...'],
      },
    });

    expect(result).toEqual({
      slotKey: 'petName',
      slotValue: 'öner',
      nextNodeId: 'next',
      marksPattern: ['Its name is...'],
      markedTargetWords: [],
    });
  });

  it('extracts a multi-word free-text value using capture prefixes', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'My favourite team is Real Madrid!',
      config: {
        enabled: true,
        strategy: 'free_text',
        domain: 'free_text',
        slotKey: 'favoriteTeam',
        nextNodeId: 'next',
        capturePrefixes: ['my favourite team is', 'my favorite team is'],
        marksPattern: ['My favourite team is ___!'],
      },
    });

    expect(result).toEqual({
      slotKey: 'favoriteTeam',
      slotValue: 'real madrid',
      nextNodeId: 'next',
      marksPattern: ['My favourite team is ___!'],
      markedTargetWords: [],
    });
  });

  it('extracts a dream career with longer capture prefixes', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'When I grow up I want to be an engineer!',
      config: {
        enabled: true,
        strategy: 'free_text',
        domain: 'free_text',
        slotKey: 'dreamCareer',
        nextNodeId: 'next',
        capturePrefixes: [
          'when i grow up i want to be a',
          'when i grow up i want to be an',
          'when i grow up i want to be',
        ],
        marksPattern: ['When I grow up I want to be ___!'],
      },
    });

    expect(result).toEqual({
      slotKey: 'dreamCareer',
      slotValue: 'engineer',
      nextNodeId: 'next',
      marksPattern: ['When I grow up I want to be ___!'],
      markedTargetWords: [],
    });
  });

  it('extracts a routine phrase with a morning prefix', () => {
    const result = resolveOpenEndedResponse({
      rawText: 'Every morning I feed my cat',
      config: {
        enabled: true,
        strategy: 'free_text',
        domain: 'free_text',
        slotKey: 'morningRoutine',
        nextNodeId: 'next',
        capturePrefixes: ['every morning i'],
        marksPattern: ['Every morning I ___'],
      },
    });

    expect(result).toEqual({
      slotKey: 'morningRoutine',
      slotValue: 'feed my cat',
      nextNodeId: 'next',
      marksPattern: ['Every morning I ___'],
      markedTargetWords: [],
    });
  });
});
