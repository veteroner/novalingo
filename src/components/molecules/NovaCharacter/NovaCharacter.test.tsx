import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NovaCharacter } from './NovaCharacter';

describe('NovaCharacter', () => {
  it('changes expression when the conversation enters a new state', () => {
    const { rerender } = render(<NovaCharacter mood="idle" />);
    expect(screen.getByRole('img', { name: 'Nova' })).toHaveAttribute('src', '/nova/nova-idle.webp');
    rerender(<NovaCharacter mood="listening" />);
    expect(screen.getByRole('img', { name: 'Nova' })).toHaveAttribute(
      'src',
      '/nova/nova-listen.webp',
    );
    rerender(<NovaCharacter mood="celebrating" />);
    expect(screen.getByRole('img', { name: 'Nova' })).toHaveAttribute(
      'src',
      '/nova/nova-celebrate.webp',
    );
  });

  it('keeps Nova visible if a downloaded image cannot load', () => {
    render(<NovaCharacter mood="listening" />);
    fireEvent.error(screen.getByRole('img', { name: 'Nova' }));
    expect(screen.getByRole('img', { name: 'Nova' }).getAttribute('src')).toContain(
      'nova-mascot.svg',
    );
  });

  it('can be decorative inside a labeled action without duplicate announcements', () => {
    render(
      <button aria-label="Visit Nova">
        <NovaCharacter decorative />
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Visit Nova' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
