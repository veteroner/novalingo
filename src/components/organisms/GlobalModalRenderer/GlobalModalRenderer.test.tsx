/**
 * GlobalModalRenderer Component Tests
 *
 * Tests that the renderer dispatches modals based on uiStore state.
 */

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalModalRenderer } from './GlobalModalRenderer';

const mockState = {
  activeModal: null as string | null,
  modalData: null as Record<string, unknown> | null,
  closeModal: vi.fn(),
};

vi.mock('@stores/uiStore', () => ({
  useUIStore: (selector: (s: typeof mockState) => unknown) => selector(mockState),
}));

describe('GlobalModalRenderer', () => {
  beforeEach(() => {
    mockState.activeModal = null;
    mockState.modalData = null;
    mockState.closeModal.mockClear();
  });

  it('renders without crashing when no modal is active', () => {
    const { container } = render(<GlobalModalRenderer />);
    // Both modals should be closed, so minimal DOM
    expect(container).toBeTruthy();
  });

  it('renders LevelUpModal when activeModal is levelUp', () => {
    mockState.activeModal = 'levelUp';
    mockState.modalData = { level: 7, rewards: { stars: 70, gems: 0 } };

    render(<GlobalModalRenderer />);
    expect(screen.getByText(/Seviye Atladın/)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders NovaEvolutionModal when activeModal is novaEvolution', () => {
    mockState.activeModal = 'novaEvolution';
    mockState.modalData = { oldStage: 'egg', newStage: 'baby' };

    render(<GlobalModalRenderer />);
    expect(screen.getByText(/Nova Evrimleşiyor/)).toBeInTheDocument();
  });

  it('does not show level modal when evolution modal is active', () => {
    mockState.activeModal = 'novaEvolution';
    mockState.modalData = { oldStage: 'child', newStage: 'teen' };

    render(<GlobalModalRenderer />);
    expect(screen.queryByText(/Seviye Atladın/)).not.toBeInTheDocument();
  });
});
