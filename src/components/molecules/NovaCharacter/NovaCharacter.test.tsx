import fallbackNova from '@assets/images/nova-fallback-v2.png?inline';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NovaCharacter, type NovaMood } from './NovaCharacter';

const nova = () => screen.getByRole('img', { name: 'Nova' });

describe('NovaCharacter', () => {
  it('changes expression as a conversation listens, thinks, speaks and celebrates', () => {
    const { rerender } = render(<NovaCharacter mood="idle" />);
    const seen = new Set([nova().getAttribute('src')]);
    for (const mood of ['listening', 'thinking', 'speaking', 'celebrating'] as const) {
      rerender(<NovaCharacter mood={mood} />);
      const src = nova().getAttribute('src');
      expect(seen.has(src)).toBe(false);
      seen.add(src);
    }
  });

  it('has separate sleeping, supportive and sad expressions', () => {
    const { rerender } = render(<NovaCharacter mood="listening" />);
    const seen = new Set([nova().getAttribute('src')]);
    for (const mood of ['sleeping', 'encouraging', 'sad'] as const) {
      rerender(<NovaCharacter mood={mood} />);
      const src = nova().getAttribute('src');
      expect(seen.has(src)).toBe(false);
      seen.add(src);
    }
  });

  it('shows the bundled current Nova if a pose fails, without repeatedly requesting it', () => {
    render(<NovaCharacter mood="thinking" />);
    fireEvent.error(nova());
    expect(nova()).toHaveAttribute('src', fallbackNova);
    fireEvent.error(nova());
    expect(nova()).toHaveAttribute('src', fallbackNova);
  });

  it('tries the next expression after an image failure and retries a revisited pose', () => {
    const { rerender } = render(<NovaCharacter mood="thinking" />);
    const firstSource = nova().getAttribute('src');
    fireEvent.error(nova());
    expect(nova()).toHaveAttribute('src', fallbackNova);
    rerender(<NovaCharacter mood="speaking" />);
    expect(nova()).not.toHaveAttribute('src', fallbackNova);
    expect(nova().getAttribute('src')).not.toBe(firstSource);
    rerender(<NovaCharacter mood="thinking" />);
    expect(nova()).toHaveAttribute('src', firstSource);
  });

  it.each<NovaMood>(['happy', 'excited'])('uses the celebration expression for %s', (mood) => {
    const { rerender } = render(<NovaCharacter mood="celebrating" />);
    const celebration = nova().getAttribute('src');
    rerender(<NovaCharacter mood={mood} />);
    expect(nova()).toHaveAttribute('src', celebration);
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
