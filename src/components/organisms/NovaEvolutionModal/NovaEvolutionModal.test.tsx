import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NovaEvolutionModal } from './NovaEvolutionModal';

vi.mock('framer-motion', async () => ({
  ...(await vi.importActual('framer-motion')),
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  useReducedMotion: vi.fn(() => false),
}));

const props = { oldStage: 'child' as const, newStage: 'teen' as const };
const button = (action: string) => screen.getByRole('button', { name: `novaEvolution.${action}` });

describe('NovaEvolutionModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <NovaEvolutionModal {...props} isOpen={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('allows skipping immediately without starting the transformation', () => {
    const onClose = vi.fn();
    render(<NovaEvolutionModal {...props} isOpen onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'novaEvolution.title' })).toHaveFocus();
    expect(button('evolve')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Nova' })).toBeInTheDocument();
    fireEvent.click(button('skip'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps skipping available while transforming and restarts cleanly after closing', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<NovaEvolutionModal {...props} isOpen onClose={onClose} />);
    fireEvent.click(button('evolve'));
    expect(screen.queryByRole('button', { name: 'novaEvolution.evolve' })).not.toBeInTheDocument();
    fireEvent.click(button('skip'));
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<NovaEvolutionModal {...props} isOpen={false} onClose={onClose} />);
    rerender(<NovaEvolutionModal {...props} isOpen onClose={onClose} />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(button('evolve')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'novaEvolution.dismiss' })).not.toBeInTheDocument();
  });

  it('finishes the celebration and dismisses with an unconditional assertion', async () => {
    const onClose = vi.fn();
    render(<NovaEvolutionModal {...props} isOpen onClose={onClose} />);
    fireEvent.click(button('evolve'));
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.queryByRole('button', { name: 'novaEvolution.skip' })).not.toBeInTheDocument();
    fireEvent.click(button('dismiss'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not make reduced-motion users wait through the transformation', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<NovaEvolutionModal {...props} isOpen onClose={vi.fn()} />);
    fireEvent.click(button('evolve'));
    expect(button('dismiss')).toBeInTheDocument();
  });

  it('disposes the old transformation when a different stage opens', async () => {
    const { rerender } = render(<NovaEvolutionModal {...props} isOpen onClose={vi.fn()} />);
    fireEvent.click(button('evolve'));
    rerender(<NovaEvolutionModal oldStage="teen" newStage="adult" isOpen onClose={vi.fn()} />);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(button('evolve')).toBeInTheDocument();
  });

  it('contains keyboard focus, supports Escape, and restores the opener', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const { unmount } = render(<NovaEvolutionModal {...props} isOpen onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(button('evolve')).toHaveFocus();
    fireEvent.keyDown(button('evolve'), { key: 'Tab', shiftKey: true });
    expect(button('skip')).toHaveFocus();
    fireEvent.keyDown(button('skip'), { key: 'Tab' });
    expect(button('evolve')).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
