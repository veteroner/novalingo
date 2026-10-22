import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AVATAR_IDS } from '@/config/avatars';
import { Avatar } from './Avatar';

describe('profile avatar artwork', () => {
  it.each(AVATAR_IDS)('renders %s locally, without using its ID as an image URL', (id) => {
    const { container } = render(<Avatar avatarId={id} name="Ada" showLevel={4} />);
    expect(screen.getByRole('img', { name: 'Ada' })).toContainElement(
      container.querySelector('svg'),
    );
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
  it.each(['nova_default', 'avatar_default', 'removed-avatar'])(
    'resolves legacy/unknown %s to the default owl',
    (id) => {
      const { container: expected } = render(<Avatar avatarId="owl" name="Ada" />);
      const { container } = render(<Avatar avatarId={id} name="Ege" />);
      expect(container.querySelector('svg')?.innerHTML).toBe(
        expected.querySelector('svg')?.innerHTML,
      );
    },
  );
  it('updates the artwork when a saved avatar changes', () => {
    const { container, rerender } = render(<Avatar avatarId="owl" name="Ada" />);
    const owl = container.querySelector('svg')?.innerHTML;
    rerender(<Avatar avatarId="fox" name="Ada" />);
    expect(container.querySelector('svg')?.innerHTML).not.toBe(owl);
  });
  it('preserves photo fallback and recovers when the source changes', () => {
    const { rerender } = render(<Avatar src="/missing.png" name="Ada Ege" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('AE')).toBeInTheDocument();
    rerender(<Avatar src="/valid.png" name="Ada Ege" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/valid.png');
  });
});
