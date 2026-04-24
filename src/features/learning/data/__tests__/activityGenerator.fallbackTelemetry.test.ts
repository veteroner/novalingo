import { beforeEach, describe, expect, it, vi } from 'vitest';

const { trackLessonContentFallbackUsed, trackLessonContentFallbackSummary } = vi.hoisted(() => ({
  trackLessonContentFallbackUsed: vi.fn(),
  trackLessonContentFallbackSummary: vi.fn(),
}));

vi.mock('@/services/analytics/analyticsService', async () => {
  const actual = await vi.importActual<typeof import('@/services/analytics/analyticsService')>(
    '@/services/analytics/analyticsService',
  );

  return {
    ...actual,
    trackConversationLegacyFallback: vi.fn(),
    trackLessonContentFallbackUsed,
    trackLessonContentFallbackSummary,
  };
});

import { generateActivities } from '../activityGenerator';
import type { CurriculumLesson } from '../curriculum';

describe('activityGenerator fallback telemetry', () => {
  beforeEach(() => {
    trackLessonContentFallbackUsed.mockClear();
    trackLessonContentFallbackSummary.mockClear();
  });

  it('tracks synthetic vocab fallback only once per lesson-word pair', () => {
    const lesson: CurriculumLesson = {
      id: 'w12_u4_l3',
      name: 'Fallback Telemetry',
      nameEn: 'Fallback Telemetry',
      type: 'normal',
      difficulty: 'medium',
      order: 1,
      xpReward: 20,
      starReward: 3,
      estimatedMinutes: 3,
      vocabulary: ['movie time'],
      activityTypes: ['flash-card', 'word-builder', 'fill-blank', 'speak-it'],
    };

    generateActivities(lesson);

    expect(trackLessonContentFallbackUsed).toHaveBeenCalledTimes(1);
    expect(trackLessonContentFallbackUsed).toHaveBeenCalledWith({
      lessonId: 'w12_u4_l3',
      word: 'movie time',
      fallbackKind: 'synthetic_vocab',
      hasEmoji: true,
    });
    expect(trackLessonContentFallbackSummary).toHaveBeenCalledTimes(1);
    expect(trackLessonContentFallbackSummary).toHaveBeenCalledWith({
      lessonId: 'w12_u4_l3',
      worldId: 'w12',
      fallbackWordCount: 1,
      fallbackWithEmojiCount: 1,
      totalVocabularyWords: 1,
    });
  });

  it('does not track analytics for explicit vocab entries', () => {
    const lesson: CurriculumLesson = {
      id: 'w1_u1_l1',
      name: 'Explicit Vocab',
      nameEn: 'Explicit Vocab',
      type: 'normal',
      difficulty: 'easy',
      order: 1,
      xpReward: 20,
      starReward: 3,
      estimatedMinutes: 3,
      vocabulary: ['dog'],
      activityTypes: ['flash-card', 'word-builder'],
    };

    generateActivities(lesson);

    expect(trackLessonContentFallbackUsed).not.toHaveBeenCalled();
    expect(trackLessonContentFallbackSummary).not.toHaveBeenCalled();
  });
});
