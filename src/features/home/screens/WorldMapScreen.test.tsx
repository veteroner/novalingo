import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
const mockUnlockAudioPlayback = vi.fn();
const mockUseLessons = vi.fn();
const mockUseLessonProgress = vi.fn();
const mockUseWorldLessons = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ worldId: 'w1' }),
  };
});

vi.mock('@services/speech/speechService', () => ({
  unlockAudioPlayback: (...args: unknown[]) => mockUnlockAudioPlayback(...args),
}));

vi.mock('@hooks/queries', () => ({
  useLessons: (...args: unknown[]) => mockUseLessons(...args),
  useLessonProgress: (...args: unknown[]) => mockUseLessonProgress(...args),
  useWorldLessons: (...args: unknown[]) => mockUseWorldLessons(...args),
}));

vi.mock('@features/learning/data/curriculum', () => ({
  getWorld: vi.fn(() => ({
    id: 'w1',
    name: 'Dünya 1',
    emoji: '🌍',
    units: [
      {
        id: 'u1',
        name: 'Ünite 1',
        lessons: [
          {
            id: 'lesson-1',
            name: 'Animals',
            nameEn: 'Animals',
            type: 'normal',
            difficulty: 'easy',
            order: 1,
            estimatedMinutes: 5,
            xpReward: 10,
            starReward: 1,
            vocabulary: [],
          },
        ],
      },
    ],
  })),
}));

vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@components/organisms/LessonCard', () => ({
  LessonCard: ({ lesson, onClick }: { lesson: { name: string }; onClick: () => void }) => (
    <button onClick={onClick}>{lesson.name}</button>
  ),
}));

vi.mock('@components/atoms/ProgressBar', () => ({
  ProgressBar: () => <div>Progress</div>,
}));

vi.mock('@components/atoms/Text', () => ({
  Text: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import WorldMapScreen from './WorldMapScreen';

describe('WorldMapScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mockUnlockAudioPlayback.mockReset();
    mockUseLessons.mockReturnValue({ data: [] });
    mockUseLessonProgress.mockReturnValue({ data: [] });
    mockUseWorldLessons.mockReturnValue({ data: [] });
    mockUnlockAudioPlayback.mockReturnValue(new Promise(() => {}));
  });

  it('navigates to the lesson immediately without waiting for audio unlock', async () => {
    render(<WorldMapScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Animals' }));

    expect(mockUnlockAudioPlayback).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/lesson/lesson-1');
  });
});
