import { describe, expect, it } from 'vitest';
import { PHASE1_CONVERSATION_SCENARIOS } from '../registry/scenarioIndex';
import { validateConversationScenario } from '../validators/validateConversationScenario';

describe('validateConversationScenario', () => {
  it('marks all Phase 1 scenarios as valid', () => {
    for (const scenario of PHASE1_CONVERSATION_SCENARIOS) {
      expect(validateConversationScenario(scenario)).toEqual([]);
    }
  });

  it('reports duplicate node ids and broken references', () => {
    const baseScenario = PHASE1_CONVERSATION_SCENARIOS[0];
    if (!baseScenario) {
      throw new Error('Expected at least one Phase 1 scenario');
    }

    const baseNode = baseScenario.nodes[0];
    expect(baseNode).toBeTruthy();

    const issues = validateConversationScenario({
      ...baseScenario,
      entryNodeId: 'missing-start',
      nodes: [
        {
          ...(baseNode ?? {
            id: 'fallback',
            speaker: 'nova',
            text: 'Fallback',
            textTr: 'Yedek',
          }),
          id: 'dup',
          responses: [
            {
              id: 'broken',
              expectedText: 'Hello',
              expectedTextTr: 'Merhaba',
              acceptedVariants: [],
              nextNodeId: 'missing-node',
            },
          ],
        },
        {
          ...(baseNode ?? {
            id: 'fallback-2',
            speaker: 'nova',
            text: 'Fallback',
            textTr: 'Yedek',
          }),
          id: 'dup',
        },
      ],
      targetWords: [],
    });

    expect(issues.some((issue) => issue.code === 'missing_entry_node')).toBe(true);
    expect(issues.some((issue) => issue.code === 'duplicate_node_id')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missing_node_reference')).toBe(true);
    expect(issues.some((issue) => issue.code === 'empty_response_variants')).toBe(true);
    expect(issues.some((issue) => issue.code === 'missing_target_words')).toBe(true);
  });
});
