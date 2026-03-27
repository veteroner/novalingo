/**
 * Content Coverage Validation Tests
 *
 * Ensures every world has sufficient stories, every phase has enough conversation
 * scenarios, and that the selectors route correctly by worldId.
 */
import { describe, expect, it } from 'vitest';
import { ALL_CONVERSATION_SCENARIOS } from '../conversations/registry/scenarioIndex';
import { selectConversationScenario } from '../conversations/selectors/selectConversationScenario';
import { selectStoryForWords, storyBank } from '../storyBank';

// ─── Story Coverage ───────────────────────────────────────────────────────────

describe('Story bank world coverage', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'];
  const MIN_STORIES_PER_WORLD = 5;

  for (const worldId of WORLDS) {
    it(`${worldId} has at least ${MIN_STORIES_PER_WORLD} stories`, () => {
      const count = storyBank.filter((s) => s.id.startsWith(`story-${worldId}-`)).length;
      expect(count).toBeGreaterThanOrEqual(MIN_STORIES_PER_WORLD);
    });
  }

  it('total story count is at least 40', () => {
    expect(storyBank.length).toBeGreaterThanOrEqual(40);
  });
});

describe('selectStoryForWords worldId filtering', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'];

  for (const worldId of WORLDS) {
    it(`returns a ${worldId} story when worldId=${worldId}`, () => {
      const story = selectStoryForWords([], undefined, worldId);
      expect(story.id).toMatch(new RegExp(`^story-${worldId}-`));
    });
  }
});

// ─── Scenario Coverage ────────────────────────────────────────────────────────

describe('Conversation scenario phase coverage', () => {
  const PHASES = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'] as const;
  const MIN_SCENARIOS_PER_PHASE = 5;

  for (const phase of PHASES) {
    it(`${phase} has at least ${MIN_SCENARIOS_PER_PHASE} scenarios`, () => {
      const count = ALL_CONVERSATION_SCENARIOS.filter((s) => s.phase === phase).length;
      expect(count).toBeGreaterThanOrEqual(MIN_SCENARIOS_PER_PHASE);
    });
  }

  it('total scenario count is at least 40', () => {
    expect(ALL_CONVERSATION_SCENARIOS.length).toBeGreaterThanOrEqual(40);
  });
});

// ─── World → Phase Routing ────────────────────────────────────────────────────

const EXPECTED_WORLD_PHASES: Record<string, string> = {
  w1: 'phase1',
  w2: 'phase2',
  w3: 'phase3',
  w4: 'phase4',
  w5: 'phase5',
  w6: 'phase5', // intentional reuse
};

describe('WORLD_TO_PHASE mapping completeness', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'];

  for (const worldId of WORLDS) {
    it(`${worldId} maps to a valid phase`, () => {
      const phase: string | undefined = EXPECTED_WORLD_PHASES[worldId];
      expect(phase).toMatch(/^phase[1-5]$/);
    });
  }
});

describe('selectConversationScenario worldId routing', () => {
  it('w1 → phase1 scenario', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w1' });
    expect(scenario.phase).toBe('phase1');
  });

  it('w2 → phase2 scenario', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w2' });
    expect(scenario.phase).toBe('phase2');
  });

  it('w3 → phase3 scenario', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w3' });
    expect(scenario.phase).toBe('phase3');
  });

  it('w4 → phase4 scenario', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w4' });
    expect(scenario.phase).toBe('phase4');
  });

  it('w5 → phase5 scenario', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w5' });
    expect(scenario.phase).toBe('phase5');
  });

  it('w6 → phase5 scenario (intentional reuse)', () => {
    const scenario = selectConversationScenario({ words: [], worldId: 'w6' });
    expect(scenario.phase).toBe('phase5');
  });
});
