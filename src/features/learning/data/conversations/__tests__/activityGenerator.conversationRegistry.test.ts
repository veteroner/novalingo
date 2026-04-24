import { describe, expect, it, vi } from 'vitest';
import type { CurriculumLesson } from '../../curriculum';

describe('activityGenerator conversation registry integration', () => {
  it('uses the registry-backed scenario mapper when the feature flag is enabled', async () => {
    vi.stubEnv('VITE_FEATURE_CONVERSATION_SCENARIO_REGISTRY', 'true');

    const { generateActivities } = await import('../../activityGenerator');

    const lesson = {
      id: 'test_conversation_lesson',
      worldId: 'w1',
      unitId: 'w1_u1',
      name: 'Test',
      nameEn: 'Test',
      type: 'normal',
      difficulty: 'easy',
      order: 1,
      requiredStars: 0,
      estimatedMinutes: 1,
      xpReward: 10,
      starReward: 1,
      activities: [],
      vocabulary: ['apple', 'banana', 'orange'],
      activityTypes: ['conversation'],
    } as unknown as CurriculumLesson;

    const activities = generateActivities(lesson);
    const conversation = activities.find((activity) => activity.type === 'conversation');

    expect(conversation?.data.type).toBe('conversation');
    expect(conversation?.data.type === 'conversation' ? conversation.data.title : undefined).toBe(
      'Fruit Stand Order',
    );

    vi.unstubAllEnvs();
  }, 15000);
});
