import { describe, expect, it } from 'vitest';
import { themes } from './theme';

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Shared buttons and body copy must remain readable at every supported age/mode.
for (const age of ['cubs', 'stars', 'legends'] as const) {
  for (const mode of ['light', 'dark'] as const) {
    describe(`${age} ${mode} contrast`, () => {
      const colors = themes[age][mode].colors;
      it.each(['primaryDark', 'success', 'error'] as const)(
        '%s supports white button text',
        (role) => {
          expect(contrast(colors[role], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
        },
      );
      it('supports dark text on the reward button', () => {
        expect(contrast(colors.accent, '#25314C')).toBeGreaterThanOrEqual(4.5);
      });
      it.each(['text', 'textSecondary'] as const)('%s remains readable on the page', (role) => {
        expect(contrast(colors[role], colors.background)).toBeGreaterThanOrEqual(4.5);
      });
    });
  }
}
