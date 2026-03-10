/**
 * Spinner Component Tests
 *
 * Render, ARIA, sizes, custom color.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Yükleniyor');
  });

  it('has sr-only text for screen readers', () => {
    render(<Spinner />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('applies animate-spin class', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  it('applies custom color via style', () => {
    render(<Spinner color="#ff0000" />);
    const spinner = screen.getByRole('status');
    expect(spinner.style.borderTopColor).toBe('#ff0000');
  });
});
