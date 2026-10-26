import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
const mockUnlockAudioPlayback = vi.fn();
const mockUseLessonProgress = vi.fn();
const mockUseWorldLessons = vi.fn();
const mockShowToast = vi.fn();
const authState = { user: { isPremium: true } };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock, useParams: () => ({ worldId: 'w1' }) };
});
vi.mock('@services/speech/speechService', () => ({
  unlockAudioPlayback: (...args: unknown[]) => mockUnlockAudioPlayback(...args),
}));
vi.mock('@hooks/queries', () => ({
  useLessonProgress: (...args: unknown[]) => mockUseLessonProgress(...args),
  useWorldLessons: (...args: unknown[]) => mockUseWorldLessons(...args),
}));
vi.mock('@stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));
vi.mock('@stores/uiStore', () => ({
  useUIStore: (selector: (state: { showToast: typeof mockShowToast }) => unknown) =>
    selector({ showToast: mockShowToast }),
}));
vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@features/learning/data/curriculum', () => {
  const world = {
    id: 'w1',
    name: 'Dünya 1',
    nameEn: 'World 1',
    order: 1,
    emoji: '🌍',
    isPremium: false,
    units: [
      {
        id: 'u1',
        name: 'Ünite 1',
        nameEn: 'Unit 1',
        description: 'Hayvanları tanı',
        order: 1,
        lessons: ['Animals', 'Colors', 'Numbers', 'Food'].map((name, index) => ({
          id: `lesson-${index + 1}`,
          name,
          nameEn: name,
          type: 'normal',
          difficulty: 'easy',
          order: index + 1,
          estimatedMinutes: 5,
          xpReward: 10,
          starReward: 1,
          vocabulary: ['dog', 'cat'],
          chunks: ['I see a ___'],
          activityTypes: [],
        })),
      },
    ],
  };
  return {
    getWorld: vi.fn(() => world),
    curriculum: [world, { ...world, id: 'w2', name: 'Dünya 2', order: 2 }],
  };
});
import WorldMapScreen from './WorldMapScreen';
import { curriculum, getWorld } from '@features/learning/data/curriculum';

function selectFirstLesson() {
  fireEvent.click(screen.getByRole('button', { name: 'Animals' }));
}

describe('WorldMapScreen', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mockUnlockAudioPlayback.mockReset();
    mockShowToast.mockReset();
    authState.user = { isPremium: true };
    vi.mocked(getWorld).mockReturnValue(curriculum[0]);
    mockUseLessonProgress.mockReturnValue({ data: [] });
    mockUseWorldLessons.mockReturnValue({ data: [] });
    mockUnlockAudioPlayback.mockReturnValue(new Promise(() => {}));
  });
  it('opens lesson information before starting, then navigates without waiting for audio unlock', () => {
    render(<WorldMapScreen />);
    selectFirstLesson();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByText('10 XP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'path.startLesson' }));
    expect(mockUnlockAudioPlayback).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/lesson/lesson-1');
  });
  it('closes lesson details with Escape and restores focus to the selected stop', () => {
    render(<WorldMapScreen />);
    selectFirstLesson();
    const close = screen.getByRole('button', { name: 'path.closeDetails' });
    close.focus();
    fireEvent.keyDown(close, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'path.lessonDetails' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Animals' })).toHaveFocus();
  });
  it('redirects free users to subscription when the daily lesson limit is reached', () => {
    authState.user = { isPremium: false };
    const now = Date.now();
    mockUseLessonProgress.mockReturnValue({
      data: ['a', 'b', 'c'].map((lessonId) => ({ lessonId, completedAt: { toMillis: () => now } })),
    });
    render(<WorldMapScreen />);
    selectFirstLesson();
    fireEvent.click(screen.getByRole('button', { name: 'path.dailyLimitCta' }));
    expect(mockShowToast).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/subscription');
  });
  it('explains a locked stop without allowing it to start', () => {
    render(<WorldMapScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Colors' }));
    expect(screen.getByText('path.lessonLocked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'worldMap.locked' })).toBeDisabled();
    expect(mockUnlockAudioPlayback).not.toHaveBeenCalled();
  });
  it('lets completed lessons be replayed', () => {
    mockUseLessonProgress.mockReturnValue({ data: [{ lessonId: 'lesson-1', starsEarned: 3 }] });
    render(<WorldMapScreen />);
    selectFirstLesson();
    fireEvent.click(screen.getByRole('button', { name: 'path.reviewLesson' }));
    expect(navigateMock).toHaveBeenCalledWith('/lesson/lesson-1');
  });
  it('opens speaking practice after the first three lessons', () => {
    mockUseLessonProgress.mockReturnValue({
      data: [1, 2, 3].map((index) => ({ lessonId: `lesson-${index}`, starsEarned: 1 })),
    });
    render(<WorldMapScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'conversation.title' }));
    expect(navigateMock).toHaveBeenCalledWith('/conversation?worldId=w1');
  });
  it('keeps speaking locked until all preceding lessons pass', () => {
    render(<WorldMapScreen />);
    expect(screen.getByRole('button', { name: 'conversation.title' })).toBeDisabled();
  });
  it('shows real curriculum words and chunks in the unit guide', () => {
    render(<WorldMapScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'path.guide' }));
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('I see a ___')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'path.closeGuide' }));
    expect(screen.queryByText('dog')).not.toBeInTheDocument();
  });
  it('keeps later worlds locked in the world picker', () => {
    render(<WorldMapScreen />);
    fireEvent.click(screen.getByRole('button', { name: /Dünya 1/ }));
    expect(screen.getByRole('button', { name: /Dünya 2/ })).toBeDisabled();
  });
  it('preserves the Plus gate for premium worlds', () => {
    authState.user = { isPremium: false };
    const world = getWorld('w1')!;
    vi.mocked(getWorld).mockReturnValue({ ...world, isPremium: true });
    render(<WorldMapScreen />);
    selectFirstLesson();
    fireEvent.click(screen.getByRole('button', { name: 'path.unlockPlus' }));
    expect(navigateMock).toHaveBeenCalledWith('/subscription');
    expect(mockUnlockAudioPlayback).not.toHaveBeenCalled();
  });
});
