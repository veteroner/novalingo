/**
 * Content Coverage Validation Tests
 *
 * Ensures every world has sufficient stories, every phase has enough conversation
 * scenarios, and that the selectors route correctly by worldId.
 */
import { describe, expect, it } from 'vitest';
import { getVocab } from '../activityGenerator';
import { ALL_CONVERSATION_SCENARIOS } from '../conversations/registry/scenarioIndex';
import { selectConversationScenario } from '../conversations/selectors/selectConversationScenario';
import { curriculum } from '../curriculum';
import { selectStoryForWords, storyBank } from '../storyBank';

// ─── Story Coverage ───────────────────────────────────────────────────────────

describe('Story bank world coverage', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12'];
  const MIN_STORIES_PER_WORLD = 5;

  for (const worldId of WORLDS) {
    it(`${worldId} has at least ${MIN_STORIES_PER_WORLD} stories`, () => {
      const count = storyBank.filter((s) => s.id.startsWith(`story-${worldId}-`)).length;
      expect(count).toBeGreaterThanOrEqual(MIN_STORIES_PER_WORLD);
    });
  }

  it('total story count is at least 80', () => {
    expect(storyBank.length).toBeGreaterThanOrEqual(80);
  });
});

describe('selectStoryForWords worldId filtering', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12'];

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

  it('total scenario count is at least 180', () => {
    expect(ALL_CONVERSATION_SCENARIOS.length).toBeGreaterThanOrEqual(180);
  });
});

describe('Expansion world scenario coverage', () => {
  const EXPANSION_WORLDS = ['w7', 'w8', 'w9', 'w10', 'w11', 'w12'];
  const MIN_SCENARIOS_PER_WORLD = 10;

  for (const worldId of EXPANSION_WORLDS) {
    it(`${worldId} has at least ${MIN_SCENARIOS_PER_WORLD} tagged scenarios`, () => {
      const count = ALL_CONVERSATION_SCENARIOS.filter((s) => s.tags.includes(worldId)).length;
      expect(count).toBeGreaterThanOrEqual(MIN_SCENARIOS_PER_WORLD);
    });
  }
});

describe('Expansion world vocabulary coverage', () => {
  const EXPANSION_WORLDS = ['w7', 'w8', 'w9', 'w10', 'w11', 'w12'];

  function getWorldVocabulary(worldId: string): string[] {
    const world = curriculum.find((item) => item.id === worldId);
    expect(world).toBeTruthy();

    const words = new Set<string>();

    for (const unit of world?.units ?? []) {
      for (const lesson of unit.lessons) {
        for (const word of lesson.vocabulary) {
          words.add(word);
        }
      }
    }

    return [...words];
  }

  for (const worldId of EXPANSION_WORLDS) {
    it(`${worldId} curriculum vocabulary avoids raw fallback sentences`, () => {
      const missing = getWorldVocabulary(worldId).filter((word) => {
        const vocab = getVocab(word);
        return vocab.sentence === `This is ${word}.` || vocab.sentenceTr === `Bu ${word}.`;
      });
      expect(missing).toEqual([]);
    });

    it(`${worldId} curriculum vocabulary has emoji support`, () => {
      const missing = getWorldVocabulary(worldId).filter((word) => getVocab(word).emoji === '📝');
      expect(missing).toEqual([]);
    });
  }
});

// ─── World → Phase Routing ────────────────────────────────────────────────────

const EXPECTED_WORLD_PHASES: Record<string, string> = {
  w1: 'phase1',
  w2: 'phase2',
  w3: 'phase3',
  w4: 'phase4',
  w5: 'phase5',
  w6: 'phase5', // intentional reuse
  w7: 'phase5',
  w8: 'phase5',
  w9: 'phase5',
  w10: 'phase5',
  w11: 'phase5',
  w12: 'phase5',
};

describe('WORLD_TO_PHASE mapping completeness', () => {
  const WORLDS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10', 'w11', 'w12'];

  for (const worldId of WORLDS) {
    it(`${worldId} maps to a valid phase`, () => {
      const phase: string | undefined = EXPECTED_WORLD_PHASES[worldId];
      expect(phase).toMatch(/^phase[1-5]$/);
    });
  }
});

describe('selectConversationScenario worldId routing', () => {
  for (const [worldId, phase] of Object.entries(EXPECTED_WORLD_PHASES)) {
    it(`${worldId} -> ${phase} scenario`, () => {
      const scenario = selectConversationScenario({ words: [], worldId });
      expect(scenario.phase).toBe(phase);
    });
  }
});
