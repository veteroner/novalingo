import { describe, expect, it } from 'vitest';
import { toConversationActivityData } from '../mappers/toConversationActivityData';
import { fruitStandOrderScenario } from '../registry/phase1/food/fruitStandOrder';

describe('toConversationActivityData', () => {
  it('maps a registry scenario into the legacy conversation activity shape', () => {
    const activityData = toConversationActivityData(fruitStandOrderScenario);

    expect(activityData.type).toBe('conversation');
    expect(activityData.title).toBe('Fruit Stand Order');
    expect(activityData.startNodeId).toBe(fruitStandOrderScenario.entryNodeId);
    expect(activityData.targetWords).toEqual(fruitStandOrderScenario.targetWords);

    const startNode = activityData.nodes.find(
      (node) => node.id === fruitStandOrderScenario.entryNodeId,
    );
    expect(startNode?.speaker).toBe('nova');
    expect(startNode?.options?.length).toBeGreaterThan(0);
    expect(startNode?.options?.[0]?.responseId).toBeTruthy();
    expect(startNode?.options?.[0]?.acceptableVariations?.length).toBeGreaterThan(0);
    expect(activityData.successCriteria).toEqual(fruitStandOrderScenario.successCriteria);
    expect(activityData.estimatedDurationSec).toBe(fruitStandOrderScenario.estimatedDurationSec);

    const echoNode = activityData.nodes.find((node) => node.id.includes('__child'));
    expect(echoNode?.speaker).toBe('child');
  });
});
