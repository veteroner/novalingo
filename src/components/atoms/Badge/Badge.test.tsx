/**
 * Badge Component Tests
 *
 * Render, variants, icon, pulse animation.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>+50 XP</Badge>);
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test').tagName).toBe('SPAN');
  });

  it('renders icon alongside text', () => {
    render(<Badge icon={<span data-testid="badge-icon">🔥</span>}>3 Gün</Badge>);
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    expect(screen.getByText('3 Gün')).toBeInTheDocument();
  });

  it('applies pulse animation class', () => {
    const { container } = render(<Badge pulse>Yeni!</Badge>);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('does not apply pulse class by default', () => {
    const { container } = render(<Badge>Normal</Badge>);
    expect(container.firstChild).not.toHaveClass('animate-pulse');
  });

  it('applies variant-specific classes for xp', () => {
    const { container } = render(<Badge variant="xp">100</Badge>);
    expect(container.firstChild).toHaveClass('text-nova-blue');
  });

  it('applies variant-specific classes for streak', () => {
    const { container } = render(<Badge variant="streak">5</Badge>);
    expect(container.firstChild).toHaveClass('text-nova-orange');
  });
});
