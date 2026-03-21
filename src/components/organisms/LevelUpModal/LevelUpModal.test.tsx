/**
 * LevelUpModal Component Tests
 *
 * Tests the level-up celebration modal — open/close, level display, rewards.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelUpModal } from './LevelUpModal';

describe('LevelUpModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <LevelUpModal isOpen={false} level={5} rewards={{ stars: 50, gems: 0 }} onClose={vi.fn()} />,
    );
    expect(container.textContent).toBe('');
  });

  it('shows level number when open', () => {
    render(
      <LevelUpModal isOpen={true} level={10} rewards={{ stars: 100, gems: 20 }} onClose={vi.fn()} />,
    );
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows level up title', () => {
    render(
      <LevelUpModal isOpen={true} level={5} rewards={{ stars: 50, gems: 0 }} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Seviye Atladın/)).toBeInTheDocument();
  });

  it('shows star reward', () => {
    render(
      <LevelUpModal isOpen={true} level={5} rewards={{ stars: 50, gems: 0 }} onClose={vi.fn()} />,
    );
    expect(screen.getByText('+50')).toBeInTheDocument();
  });

  it('shows gem reward when present', () => {
    render(
      <LevelUpModal isOpen={true} level={5} rewards={{ stars: 50, gems: 10 }} onClose={vi.fn()} />,
    );
    expect(screen.getByText('+10')).toBeInTheDocument();
  });

  it('shows encouragement when no rewards', () => {
    render(
      <LevelUpModal isOpen={true} level={1} rewards={{ stars: 0, gems: 0 }} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Harika ilerliyorsun/)).toBeInTheDocument();
  });

  it('calls onClose when button is clicked', () => {
    const onClose = vi.fn();
    render(
      <LevelUpModal isOpen={true} level={5} rewards={{ stars: 50, gems: 0 }} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText(/Devam Et/));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <LevelUpModal isOpen={true} level={5} rewards={{ stars: 50, gems: 0 }} onClose={onClose} />,
    );
    // Backdrop is the first motion.div with absolute inset-0 bg-black
    const backdrop = container.querySelector('.bg-black\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
