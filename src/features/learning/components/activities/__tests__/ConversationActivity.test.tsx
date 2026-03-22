/**
 * ConversationActivity Component Tests
 *
 * Renders chat bubbles, handles option selection, computes scoring.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────

const mockSpeak = vi.fn();
const mockStopSpeaking = vi.fn();
const mockComparePronunciation = vi.fn((..._args: unknown[]) => 0);
const mockOnSpeakingStateChange = vi.fn((..._args: unknown[]) => vi.fn());

vi.mock('@services/speech/speechService', () => ({
  speak: (...args: unknown[]): void => { mockSpeak(...args); },
  stopSpeaking: (...args: unknown[]): void => { mockStopSpeaking(...args); },
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
  motion: {
    div: ({ children, className, ...props }: Record<string, unknown>) => (
      <div className={className as string} {...(props as Record<string, unknown>)}>
        {children as ReactNode}
      </div>
    ),
    button: ({ children, className, onClick, disabled, ...props }: Record<string, unknown>) => (
      <button
        className={className as string}
        onClick={onClick as () => void}
        disabled={disabled as boolean}
        {...(props as Record<string, unknown>)}
      >
        {children as ReactNode}
      </button>
    ),
    span: ({ children, className, ...props }: Record<string, unknown>) => (
      <span className={className as string} {...(props as Record<string, unknown>)}>
        {children as ReactNode}
      </span>
    ),
    p: ({ children, className, ...props }: Record<string, unknown>) => (
      <p className={className as string} {...(props as Record<string, unknown>)}>
        {children as ReactNode}
      </p>
    ),
    ellipse: (props: Record<string, unknown>) => <ellipse {...(props as Record<string, string>)} />,
  },
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
    mockOnSpeakingStateChange.mockReset().mockReturnValue(vi.fn());
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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Child bubble should appear
    expect(screen.getAllByText('I want a dog!').length).toBeGreaterThanOrEqual(1);

    // Advance timers for feedback + echo skip + thinking delay + auto-advance
    act(() => {
      vi.advanceTimersByTime(800); // feedback timer (skip echo → advance to end node)
    });
    act(() => {
      vi.advanceTimersByTime(500); // thinking delay for end node
    });
    act(() => {
      vi.advanceTimersByTime(1500); // end node → finishConversation timer
    });

    expect(onComplete).toHaveBeenCalledTimes(1);

    const result = onComplete.mock.calls[0]?.[0] as { score: number; attempts: number; isCorrect: boolean };
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
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    act(() => {
      vi.advanceTimersByTime(500); // thinking delay
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);

    const result = onComplete.mock.calls[0]?.[0] as { score: number; attempts: number; isCorrect: boolean };
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
});
