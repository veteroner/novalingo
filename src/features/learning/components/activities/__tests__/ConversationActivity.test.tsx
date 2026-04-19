/**
 * ConversationActivity Component Tests
 *
 * Renders chat bubbles, handles option selection, computes scoring.
 */

import { toConversationActivityData } from '@/features/learning/data/conversations';
import { myFavoriteAnimalScenario } from '@/features/learning/data/conversations/registry/phase1/animals/myFavoriteAnimal';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────

const mockSpeak = vi.fn();
const mockStopSpeaking = vi.fn();
const mockComparePronunciation = vi.fn((..._args: unknown[]) => 0);
const mockOnSpeakingStateChange = vi.fn((..._args: unknown[]) => vi.fn());
let speakingStateListener: ((speaking: boolean) => void) | undefined;

vi.mock('@services/speech/speechService', () => ({
  speak: (...args: unknown[]): void => {
    mockSpeak(...args);
  },
  stopSpeaking: (...args: unknown[]): void => {
    mockStopSpeaking(...args);
  },
  comparePronunciation: (...args: unknown[]) => mockComparePronunciation(...args),
  onSpeakingStateChange: (...args: unknown[]) => mockOnSpeakingStateChange(...args),
}));

vi.mock('@assets/images/nova-mascot.svg', () => ({ default: 'nova-mascot.svg' }));

vi.mock('@hooks/useHaptic', () => ({
  useHaptic: () => ({
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('@stores/childStore', () => ({
  useChildStore: (
    selector: (state: { activeChild: { avatarId: string; name: string } | null }) => unknown,
  ) => selector({ activeChild: { avatarId: 'fox', name: 'Test' } }),
}));

vi.mock('@components/atoms/Text', () => ({
  Text: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_target, tagName: string) => {
        const Component = ({ children, ...props }: Record<string, unknown>) => {
          const {
            animate: _animate,
            initial: _initial,
            exit: _exit,
            transition: _transition,
            whileTap: _whileTap,
            whileHover: _whileHover,
            whileInView: _whileInView,
            variants: _variants,
            layout: _layout,
            ...domProps
          } = props;

          return createElement(tagName, domProps, children as ReactNode);
        };

        Component.displayName = `motion.${tagName}`;
        return Component;
      },
    },
  ),
}));

import ConversationActivity from '../ConversationActivity';

// ─── Helpers ─────────────────────────────────────────────

function buildSimpleData() {
  return {
    title: 'Test Conversation',
    titleTr: 'Test Konuşma',
    sceneEmoji: '🎯',
    startNodeId: 'n1',
    targetWords: ['dog', 'cat'],
    nodes: [
      {
        id: 'n1',
        speaker: 'nova' as const,
        text: 'Which pet do you want?',
        textTr: 'Hangi hayvanı istersin?',
        emoji: '🤖',
        options: [
          {
            text: 'I want a dog!',
            textTr: 'Bir köpek istiyorum!',
            emoji: '🐶',
            nextNodeId: 'c1',
            acceptableVariations: ['dog'],
          },
          {
            text: 'I want a cat!',
            textTr: 'Bir kedi istiyorum!',
            emoji: '🐱',
            nextNodeId: 'c2',
            acceptableVariations: ['cat'],
          },
        ],
      },
      {
        id: 'c1',
        speaker: 'child' as const,
        text: 'I want a dog!',
        textTr: 'Bir köpek istiyorum!',
        emoji: '🐶',
        next: 'end',
      },
      {
        id: 'c2',
        speaker: 'child' as const,
        text: 'I want a cat!',
        textTr: 'Bir kedi istiyorum!',
        emoji: '🐱',
        next: 'end',
      },
      { id: 'end', speaker: 'nova' as const, text: 'Great choice!', textTr: 'Harika seçim!' },
    ],
  };
}

// ─── Tests ───────────────────────────────────────────────

describe('ConversationActivity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeak.mockReset();
    mockStopSpeaking.mockReset();
    speakingStateListener = undefined;
    mockOnSpeakingStateChange.mockReset().mockImplementation((listener: unknown) => {
      speakingStateListener = listener as (speaking: boolean) => void;
      return vi.fn();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the scene header', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    expect(screen.getByText('activities.conversationHeader')).toBeInTheDocument();
    expect(screen.getByText('Test Konuşma')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('renders the first Nova bubble with TTS', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    // Text appears in both subtitle card and chat bubble
    expect(screen.getAllByText('Which pet do you want?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hangi hayvanı istersin?').length).toBeGreaterThanOrEqual(1);

    // TTS fires after the 500ms thinking delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockSpeak).toHaveBeenCalledWith('Which pet do you want?', expect.any(Object));
  });

  it('renders Nova mascot hero image', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    const img = screen.getByAltText('Nova');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'nova-mascot.svg');
  });

  it('renders free-form text input instead of option buttons', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    // Text input for free-form dialogue is present
    expect(screen.getByPlaceholderText('activities.conversationTypeHere')).toBeInTheDocument();
    // Option buttons are NOT rendered
    expect(screen.queryByRole('button', { name: /I want a dog/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /I want a cat/i })).not.toBeInTheDocument();
  });

  it('handles free-form text input and tracks vocabulary', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    // Advance past the initial thinking delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Type the correct option text and press Enter
    const input = screen.getByPlaceholderText('activities.conversationTypeHere');
    fireEvent.change(input, { target: { value: 'I want a dog!' } });
    fireEvent.click(screen.getByRole('button', { name: '➤' }));

    // Child bubble should appear
    expect(screen.getAllByText('I want a dog!').length).toBeGreaterThanOrEqual(1);

    // Advance timers for feedback + echo skip + thinking delay + simulated TTS end
    act(() => {
      vi.advanceTimersByTime(800); // feedback timer (skip echo → advance to end node)
    });
    act(() => {
      vi.advanceTimersByTime(500); // thinking delay for end node
    });
    act(() => {
      speakingStateListener?.(false); // Nova finished speaking the end node
      vi.advanceTimersByTime(600); // pending post-TTS action delay
    });

    expect(onComplete).toHaveBeenCalledTimes(1);

    const result = onComplete.mock.calls[0]?.[0] as {
      score: number;
      attempts: number;
      isCorrect: boolean;
    };
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.attempts).toBe(1);
  });

  it('calls onComplete with correct scoring when all target words hit', () => {
    const data = {
      ...buildSimpleData(),
      targetWords: ['dog'],
    };
    const onComplete = vi.fn();
    render(<ConversationActivity data={data} onComplete={onComplete} />);

    // Advance past the initial thinking delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const input = screen.getByPlaceholderText('activities.conversationTypeHere');
    fireEvent.change(input, { target: { value: 'I want a dog!' } });
    fireEvent.click(screen.getByRole('button', { name: '➤' }));

    act(() => {
      vi.advanceTimersByTime(800);
    });
    act(() => {
      vi.advanceTimersByTime(500); // thinking delay
    });
    act(() => {
      speakingStateListener?.(false);
      vi.advanceTimersByTime(600);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);

    const result = onComplete.mock.calls[0]?.[0] as {
      score: number;
      attempts: number;
      isCorrect: boolean;
    };
    // "dog" is in "I want a dog!" → completedWords has "dog" → accuracy = 1/1 = 100
    expect(result.score).toBe(100);
    expect(result.isCorrect).toBe(true);
  });

  it('finishes immediately when startNodeId is invalid', () => {
    const data = {
      ...buildSimpleData(),
      startNodeId: 'nonexistent',
    };
    const onComplete = vi.fn();
    render(<ConversationActivity data={data} onComplete={onComplete} />);

    // finishConversation is called synchronously in useEffect since startNode is undefined
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up speech on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <ConversationActivity data={buildSimpleData()} onComplete={onComplete} />,
    );

    unmount();
    expect(mockStopSpeaking).toHaveBeenCalled();
  });

  it('accepts open-ended animal answers and preserves the raw child utterance', async () => {
    const onComplete = vi.fn();
    const activityData = toConversationActivityData(myFavoriteAnimalScenario);
    render(<ConversationActivity data={activityData} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const input = screen.getByPlaceholderText('activities.conversationTypeHere');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'snake' } });
      fireEvent.click(screen.getByRole('button', { name: '➤' }));
      await Promise.resolve();
    });

    expect(screen.getByText('snake')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(
      screen.getAllByText('A snake! Nice choice. That sounds interesting!').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('keeps the prompt active after timeout instead of auto-selecting the first option', () => {
    const onComplete = vi.fn();
    render(<ConversationActivity data={buildSimpleData()} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      vi.advanceTimersByTime(23000);
    });

    expect(screen.getByPlaceholderText('activities.conversationTypeHere')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
