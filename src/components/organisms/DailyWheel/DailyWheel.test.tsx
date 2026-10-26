import type { WheelSlice } from '@/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DailyWheel } from './DailyWheel';

const controls = vi.hoisted(() => ({
  start: vi.fn<(target: { rotate: number }) => Promise<void>>().mockResolvedValue(undefined),
  subscribe: vi.fn(() => () => {}),
}));
vi.mock('framer-motion', async () => ({
  ...(await vi.importActual('framer-motion')),
  useAnimationControls: () => controls,
}));
const slices: WheelSlice[] = Array.from({ length: 8 }, (_, i) => ({
  id: `slice-${i}`,
  label: `${i + 1} XP`,
  reward: { type: 'xp', amount: i + 1 },
  weight: 1,
  color: '#4ECDC4',
  iconUrl: '',
}));

describe('DailyWheel reward display', () => {
  it.each([
    ['stars', 'reward.stars'],
    ['gems', 'reward.gems'],
    ['xp', 'reward.xp'],
    ['streak_freeze', 'reward.streakFreeze'],
    ['boost', 'reward.generic'],
  ])('announces %s with its correct unit', async (type, label) => {
    const onSpin = vi.fn().mockResolvedValue({ sliceIndex: 0, reward: { type, amount: 1 } });
    render(<DailyWheel slices={slices} canSpin onSpin={onSpin} />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByRole('status')).toHaveTextContent(`+1 ${label}`);
    expect(onSpin).toHaveBeenCalledOnce();
  });
  it('aligns the winning slice with the pointer even after a previous rotation', async () => {
    controls.start.mockClear();
    const onSpin = vi
      .fn()
      .mockResolvedValueOnce({ sliceIndex: 2, reward: { type: 'xp', amount: 3 } })
      .mockResolvedValueOnce({ sliceIndex: 0, reward: { type: 'xp', amount: 1 } });
    render(<DailyWheel slices={slices} canSpin onSpin={onSpin} />);
    fireEvent.click(screen.getByRole('button'));
    await screen.findByRole('status');
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('+1 reward.xp'));
    const first = controls.start.mock.calls[0]![0];
    const second = controls.start.mock.calls[1]![0];
    expect((first.rotate + (2 + 0.5) * 45) % 360).toBeCloseTo(270);
    expect((second.rotate + 0.5 * 45) % 360).toBeCloseTo(270);
    expect(second.rotate).toBeGreaterThan(first.rotate + 360 * 4);
  });
  it('keeps dark labels readable on every rendered wheel color', () => {
    const { container } = render(<DailyWheel slices={slices} canSpin={false} onSpin={vi.fn()} />);
    const luminance = (hex: string) => {
      const v = [1, 3, 5].map((offset) => {
        const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return v[0]! * 0.2126 + v[1]! * 0.7152 + v[2]! * 0.0722;
    };
    for (const segment of container.querySelectorAll('svg > g')) {
      const background = segment.querySelector('path')!.getAttribute('fill')!;
      const foreground = segment.querySelector('text')!.getAttribute('fill')!;
      expect(
        (luminance(background) + 0.05) / (luminance(foreground) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps empty/unavailable wheels from making a reward request', () => {
    const onSpin = vi.fn();
    const { rerender } = render(<DailyWheel slices={[]} canSpin onSpin={onSpin} />);
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(<DailyWheel slices={slices} canSpin={false} onSpin={onSpin} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSpin).not.toHaveBeenCalled();
  });
  it('recovers from a rejected spin without inventing a reward', async () => {
    const onSpin = vi.fn().mockRejectedValue(new Error('not available'));
    render(<DailyWheel slices={slices} canSpin onSpin={onSpin} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
