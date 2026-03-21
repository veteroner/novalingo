import { createActivity, createChildProfile } from '@/test/factories';
import { useLessonStore } from '@stores/lessonStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseVocabularyCards = vi.fn();
const mockGenerateReviewLesson = vi.fn();
const mockChild = createChildProfile({ id: 'child-1', level: 4 });

vi.mock('@stores/childStore', () => ({
  useChildStore: (selector: (state: { activeChild: typeof mockChild }) => unknown) =>
    selector({ activeChild: mockChild }),
}));

vi.mock('@hooks/queries', () => ({
  useVocabularyCards: (...args: unknown[]) => mockUseVocabularyCards(...args),
}));

vi.mock('@/services/learning/learningEngine', () => ({
  generateReviewLesson: (...args: unknown[]) => mockGenerateReviewLesson(...args),
}));

vi.mock('@services/srs/srsEngine', () => ({
  calculateSRSStats: vi.fn(() => ({
    dueToday: 3,
    totalCards: 3,
    learningCards: 2,
    masteredCards: 1,
  })),
}));

vi.mock('@/features/learning/components/activities', () => ({
  ActivityRenderer: () => <div>Activity Renderer</div>,
}));

import ReviewScreen from './ReviewScreen';

describe('ReviewScreen', () => {
  beforeEach(() => {
    useLessonStore.getState().reset();

    mockUseVocabularyCards.mockReturnValue({
      data: [
        {
          id: 'card-1',
          childId: 'child-1',
          word: 'cat',
          translation: 'kedi',
        },
      ],
    });

    mockGenerateReviewLesson.mockReturnValue({
      lessonId: 'review',
      activities: [createActivity({ id: 'review-activity-1' })],
      difficulty: {
        level: 'easy',
        distractorCount: 2,
        timeMultiplier: 1,
        autoHints: true,
        maxHints: 3,
        activitiesPerLesson: 1,
        newWordRatio: 0,
        xpMultiplier: 1,
      },
      startedAt: Date.now(),
      vocabulary: [],
    });
  });

  it('resets the lesson store when leaving an in-progress review', async () => {
    const view = render(
      <MemoryRouter>
        <ReviewScreen />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Tekrar Başla/i }));

    expect(useLessonStore.getState().isActive).toBe(true);
    expect(useLessonStore.getState().lessonId).toBe('review');

    view.unmount();

    expect(useLessonStore.getState().isActive).toBe(false);
    expect(useLessonStore.getState().lessonId).toBeNull();
    expect(useLessonStore.getState().activities).toEqual([]);
  });
});