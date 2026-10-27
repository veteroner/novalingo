import { MotionPolicyContext, type MotionPolicy } from '@hooks/useMotionPolicy';
import { useConversationStore } from '@stores/conversationStore';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConversationResultScreen from './ConversationResultScreen';

vi.mock('@services/ratingService', () => ({ recordSessionAndMaybePromptRating: vi.fn() }));
vi.mock('@features/learning/data/conversations', () => ({
  getConversationScenarioById: vi.fn(),
  getNextConversationScenarioId: vi.fn(),
}));
const active: MotionPolicy = { isActive: true, reducedMotion: false, canAnimate: true };
const initialEntries = [
  {
    pathname: '/conversation/result',
    state: {
      result: {
        sessionId: 'qa',
        scenarioId: 'qa',
        accuracy: 1,
        score: 100,
        durationSeconds: 12,
        attempts: 1,
        targetWordsHit: 1,
        targetWordsTotal: 1,
        completedAt: 1,
      },
      scenario: {
        id: 'qa',
        title: 'Pets',
        titleTr: 'Hayvanlar',
        sceneEmoji: '🐶',
        targetWords: ['dog'],
      },
    },
  },
];
function view(policy: MotionPolicy) {
  return (
    <MotionPolicyContext.Provider value={policy}>
      <MemoryRouter initialEntries={initialEntries}>
        <ConversationResultScreen />
      </MemoryRouter>
    </MotionPolicyContext.Provider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  useConversationStore.setState({
    xpResult: { xpEarned: 100, streak: 1, leveledUp: false, newLevel: 1, isNewBest: false },
    isSaving: false,
    saveError: null,
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  useConversationStore.setState({ xpResult: null });
});

describe('Conversation reward motion', () => {
  it('settles on the real XP when hidden midway and never replays the counter on resume', () => {
    const { rerender } = render(view(active));
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText('+10 XP ⭐')).toBeInTheDocument();
    rerender(view({ ...active, isActive: false, canAnimate: false }));
    expect(screen.getByText('+100 XP ⭐')).toBeInTheDocument();
    rerender(view(active));
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(screen.getByText('+100 XP ⭐')).toBeInTheDocument();
  });
  it('shows final XP immediately with reduced motion and keeps a zero reward accurate', () => {
    render(view({ ...active, reducedMotion: true, canAnimate: false }));
    expect(screen.getByText('+100 XP ⭐')).toBeInTheDocument();
    act(() => {
      useConversationStore.setState({
        xpResult: { xpEarned: 0, streak: 1, leveledUp: false, newLevel: 1, isNewBest: false },
      });
    });
    expect(screen.getByText('+0 XP ⭐')).toBeInTheDocument();
  });
});
