import { describe, expect, it } from 'vitest';
import { PHASE1_CONVERSATION_SCENARIOS } from '../registry/scenarioIndex';
import { selectConversationScenario } from '../selectors/selectConversationScenario';

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
      candidates: PHASE1_CONVERSATION_SCENARIOS,
      excludeScenarioIds: ['phase1_animals_pet_shop_pick'],
    });
    expect(scenario).toBeTruthy();
  });
});
