/**
 * Text Component Tests
 *
 * Render, variant tags, alignment, truncation.
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from './Text';

describe('Text', () => {
  it('renders children text', () => {
    render(<Text>Merhaba</Text>);
    expect(screen.getByText('Merhaba')).toBeInTheDocument();
  });

  it('renders as <p> by default (body variant)', () => {
    render(<Text>Paragraf</Text>);
    expect(screen.getByText('Paragraf').tagName).toBe('P');
  });

  it('renders as <h1> for h1 variant', () => {
    render(<Text variant="h1">Başlık</Text>);
    expect(screen.getByText('Başlık').tagName).toBe('H1');
  });

  it('renders as <h2> for h2 variant', () => {
    render(<Text variant="h2">Alt Başlık</Text>);
    expect(screen.getByText('Alt Başlık').tagName).toBe('H2');
  });

  it('renders as <span> for caption variant', () => {
    render(<Text variant="caption">Küçük</Text>);
    expect(screen.getByText('Küçük').tagName).toBe('SPAN');
  });

  it('respects custom "as" prop', () => {
    render(
      <Text as="div" variant="h1">
        Div
      </Text>,
    );
    expect(screen.getByText('Div').tagName).toBe('DIV');
  });

  it('applies text-center for center alignment', () => {
    render(<Text align="center">Orta</Text>);
    expect(screen.getByText('Orta').className).toContain('text-center');
  });

  it('applies truncate class', () => {
    render(<Text truncate>Uzun metin</Text>);
    expect(screen.getByText('Uzun metin').className).toContain('truncate');
  });

  it('applies inline color style', () => {
    render(<Text color="red">Renkli</Text>);
    expect(screen.getByText('Renkli')).toHaveStyle({ color: 'red' });
  });
});
