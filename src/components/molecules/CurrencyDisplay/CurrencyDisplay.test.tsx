/**
 * CurrencyDisplay Component Tests
 *
 * Stars/gems display, formatting, delta indicator.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrencyDisplay } from './CurrencyDisplay';

describe('CurrencyDisplay', () => {
  it('renders star and gem counts', () => {
    render(<CurrencyDisplay stars={100} gems={50} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders star emoji', () => {
    render(<CurrencyDisplay stars={10} gems={5} />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('renders gem emoji', () => {
    render(<CurrencyDisplay stars={10} gems={5} />);
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('formats large numbers', () => {
    render(<CurrencyDisplay stars={1500} gems={2500} />);
    // formatNumber should format these (depends on implementation)
    expect(screen.getByText('1.5K')).toBeInTheDocument();
    expect(screen.getByText('2.5K')).toBeInTheDocument();
  });

  it('shows positive star delta', () => {
    render(<CurrencyDisplay stars={100} gems={50} starDelta={10} />);
    expect(screen.getByText('+10')).toBeInTheDocument();
  });

  it('shows negative gem delta', () => {
    render(<CurrencyDisplay stars={100} gems={50} gemDelta={-5} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });
});
