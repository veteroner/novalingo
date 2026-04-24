import { describe, expect, it } from 'vitest';
import { ALL_CONVERSATION_SCENARIOS } from '../registry/scenarioIndex';
import { selectConversationScenario } from '../selectors/selectConversationScenario';

const EXPANSION_WORLD_CASES = [
  { worldId: 'w7', words: ['airport', 'hotel', 'luggage'], theme: 'travel' },
  { worldId: 'w8', words: ['recipe', 'pan', 'bowl'], theme: 'food' },
  { worldId: 'w9', words: ['song', 'sketch', 'stage'], theme: 'art' },
  { worldId: 'w10', words: ['doctor', 'medicine', 'exercise'], theme: 'health' },
  { worldId: 'w11', words: ['recycle', 'tree', 'pollution'], theme: 'nature' },
  { worldId: 'w12', words: ['calendar', 'clock', 'scoreboard'], theme: 'time' },
] as const;

describe('selectConversationScenario', () => {
  it('selects an animal scenario for animal vocabulary', () => {
    const scenario = selectConversationScenario({ words: ['dog', 'cat', 'fish'] });
    expect(scenario.theme).toBe('animals');
  });

  it('selects a food scenario for food vocabulary', () => {
    const scenario = selectConversationScenario({ words: ['apple', 'banana', 'juice'] });
    expect(scenario.theme).toBe('food');
  });

  it('honors preferred theme when provided', () => {
    const scenario = selectConversationScenario({
      words: ['red', 'blue'],
      preferredTheme: 'colors',
    });
    expect(scenario.id).toBe('phase1_colors_color_hunt');
  });

  it('falls back to another available scenario when one is excluded', () => {
    const scenario = selectConversationScenario({
      words: ['xylophone'],
      candidates: ALL_CONVERSATION_SCENARIOS,
      excludeScenarioIds: ['phase1_animals_pet_shop_pick'],
    });
    expect(scenario).toBeTruthy();
  });

  for (const { worldId, words, theme } of EXPANSION_WORLD_CASES) {
    it(`prefers ${worldId} tagged scenarios for ${theme} vocabulary`, () => {
      const scenario = selectConversationScenario({ words: [...words], worldId });
      expect(scenario.theme).toBe(theme);
      expect(scenario.tags).toContain(worldId);
    });
  }
});
