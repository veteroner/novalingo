/**
 * ProgressBar Component Tests
 *
 * Value clamping, label, ARIA attributes.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders progressbar role', () => {
    render(<ProgressBar value={0.5} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow to percentage', () => {
    render(<ProgressBar value={0.75} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps value at 0', () => {
    render(<ProgressBar value={-0.5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value at 100', () => {
    render(<ProgressBar value={1.5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows percentage label when showLabel is true', () => {
    render(<ProgressBar value={0.6} showLabel />);
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('İlerleme')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<ProgressBar value={0.6} />);
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  it('has min/max ARIA attributes', () => {
    render(<ProgressBar value={0.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});
