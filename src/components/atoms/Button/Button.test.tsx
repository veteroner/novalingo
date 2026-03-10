/**
 * Button Component Tests
 *
 * Render, variants, disabled state, loading state, icon positions.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Başla</Button>);
    expect(screen.getByText('Başla')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tıkla</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Kapalı</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Yükleniyor</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button isLoading>Yükleniyor</Button>);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    // Text should NOT be visible while loading
    expect(screen.queryByText('Yükleniyor')).not.toBeInTheDocument();
  });

  it('renders icon on the left by default', () => {
    render(<Button icon={<span data-testid="icon">⭐</span>}>İkon</Button>);
    const icon = screen.getByTestId('icon');
    const text = screen.getByText('İkon');
    // icon should come before text in DOM order
    expect(icon.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders icon on the right when iconPosition is right', () => {
    render(
      <Button icon={<span data-testid="icon">⭐</span>} iconPosition="right">
        İkon
      </Button>,
    );
    const icon = screen.getByTestId('icon');
    const text = screen.getByText('İkon');
    // text should come before icon
    expect(text.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Kapalı
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Tam</Button>);
    expect(screen.getByRole('button').className).toContain('w-full');
  });
});
