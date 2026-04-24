import { describe, expect, it } from 'vitest';

import { localOpenEndedConversationService } from '../runtime/openEndedConversationService';

describe('localOpenEndedConversationService', () => {
  it('returns an accepted evaluation for a supported open-ended answer', async () => {
    const result = await localOpenEndedConversationService.evaluateTurn({
      rawText: 'My favorite color is blue',
      nodeId: 'n1',
      scenarioId: 'test_scenario',
      config: {
        enabled: true,
        strategy: 'favorite_thing',
        domain: 'color',
        slotKey: 'favoriteColor',
        nextNodeId: 'n2',
        marksPattern: ['My favorite ... is ...'],
        countCapturedValueAsTargetWord: true,
      },
      targetWords: ['blue'],
      targetPatterns: ['My favorite ... is ...'],
    });

    expect(result.accepted).toBe(true);
    expect(result.source).toBe('local_rule');
    expect(result.resolution?.slotValue).toBe('blue');
    expect(result.rubric.score).toBeGreaterThan(0);
  });

  it('accepts free-text identity answers with capture prefixes', async () => {
    const result = await localOpenEndedConversationService.evaluateTurn({
      rawText: 'My hero is Spider Man!',
      nodeId: 'n1',
      scenarioId: 'hero_scenario',
      config: {
        enabled: true,
        strategy: 'free_text',
        domain: 'free_text',
        slotKey: 'heroName',
        nextNodeId: 'n2',
        capturePrefixes: ['my hero is'],
        marksPattern: ['My hero is ___!'],
      },
      targetWords: ['hero'],
      targetPatterns: ['My hero is ___!'],
    });

    expect(result.accepted).toBe(true);
    expect(result.source).toBe('local_rule');
    expect(result.resolution?.slotValue).toBe('spider man');
  });
});
