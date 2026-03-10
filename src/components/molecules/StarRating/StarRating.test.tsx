/**
 * StarRating Component Tests
 *
 * Star count rendering, value clamping.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders 3 star elements', () => {
    const { container } = render(<StarRating stars={2} />);
    const stars = container.querySelectorAll('span');
    // 3 motion.span elements for 3 stars
    expect(stars.length).toBe(3);
  });

  it('renders all star emojis', () => {
    render(<StarRating stars={3} />);
    expect(screen.getAllByText('⭐')).toHaveLength(3);
  });

  it('clamps stars at 3 maximum', () => {
    render(<StarRating stars={5} />);
    // Should still only render 3 stars
    expect(screen.getAllByText('⭐')).toHaveLength(3);
  });

  it('renders with 0 stars (all grayed)', () => {
    const { container } = render(<StarRating stars={0} animate={false} />);
    const grayedStars = container.querySelectorAll('.grayscale');
    expect(grayedStars).toHaveLength(3);
  });

  it('applies filled style for earned stars', () => {
    const { container } = render(<StarRating stars={2} animate={false} />);
    const grayed = container.querySelectorAll('.grayscale');
    // 3 total - 2 filled = 1 grayed
    expect(grayed).toHaveLength(1);
  });
});
