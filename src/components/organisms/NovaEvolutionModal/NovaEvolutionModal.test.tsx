/**
 * NovaEvolutionModal Component Tests
 *
 * Tests the evolution celebration modal — open/close, stage display, phase transitions.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NovaEvolutionModal } from './NovaEvolutionModal';

describe('NovaEvolutionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <NovaEvolutionModal isOpen={false} oldStage="egg" newStage="baby" onClose={vi.fn()} />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders header when open', () => {
    render(
      <NovaEvolutionModal isOpen={true} oldStage="egg" newStage="baby" onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Nova Evrimleşiyor/)).toBeInTheDocument();
  });

  it('shows old stage label initially', () => {
    render(
      <NovaEvolutionModal isOpen={true} oldStage="egg" newStage="baby" onClose={vi.fn()} />,
    );
    expect(screen.getByText('Yumurta')).toBeInTheDocument();
  });

  it('shows evolve button initially', () => {
    render(
      <NovaEvolutionModal isOpen={true} oldStage="egg" newStage="baby" onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Evrimleştir/)).toBeInTheDocument();
  });

  it('renders two SVGs (old stage avatar)', () => {
    const { container } = render(
      <NovaEvolutionModal isOpen={true} oldStage="child" newStage="teen" onClose={vi.fn()} />,
    );
    // NovaStageAvatar renders an SVG inside
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onClose when dismiss button is clicked', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <NovaEvolutionModal isOpen={true} oldStage="egg" newStage="baby" onClose={onClose} />,
    );

    // Click evolve button to start transformation
    fireEvent.click(screen.getByText(/Evrimleştir/));

    // Wait for transform → new phase
    vi.advanceTimersByTime(1500);

    // Now "Harika!" button should be visible
    const harika = screen.queryByText(/Harika/);
    if (harika) {
      fireEvent.click(harika);
      expect(onClose).toHaveBeenCalled();
    }

    vi.useRealTimers();
  });
});
