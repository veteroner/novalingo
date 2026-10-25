import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatalogArtwork } from './CatalogArtwork';

describe('CatalogArtwork', () => {
  it('renders a catalog URL as an image and falls back when it fails', () => {
    const { container } = render(
      <CatalogArtwork
        source="https://media.example.test/reward.webp"
        fallback={<span>Reward artwork</span>}
      />,
    );
    const image = container.querySelector('img')!;
    expect(image).toHaveAttribute('src', 'https://media.example.test/reward.webp');
    expect(container).not.toHaveTextContent('https://');
    fireEvent.error(image);
    expect(screen.getByText('Reward artwork')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('loads a new URL after an earlier image failed', () => {
    const { container, rerender } = render(
      <CatalogArtwork source="/first.webp" fallback={<span>Fallback</span>} />,
    );
    fireEvent.error(container.querySelector('img')!);
    rerender(<CatalogArtwork source="/next.webp" fallback={<span>Fallback</span>} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/next.webp');
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
  });

  it('preserves meaningful catalog emoji and flags', () => {
    const { rerender } = render(<CatalogArtwork source="🦊" fallback="Fallback" />);
    expect(screen.getByText('🦊')).toBeInTheDocument();
    rerender(<CatalogArtwork source="🇹🇷" fallback="Fallback" />);
    expect(screen.getByText('🇹🇷')).toBeInTheDocument();
  });

  it.each(['not-an-image', 'javascript:alert(1)', '//media.example.test/item.png'])(
    'uses artwork for an unsupported catalog value: %s',
    (source) => {
      const { container } = render(<CatalogArtwork source={source} fallback="Fallback" />);
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('Fallback')).toBeInTheDocument();
    },
  );
});
