import { describe, expect, it } from 'vitest';
import { EVENT_SHADE_ALPHA } from './eventAppearance';
import { SEASONAL_EVENTS } from './seasonalEvents';

function luminance(rgb: number[]) {
  const linear = rgb.map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}
// Sample the rendered two-color sRGB gradient, its shared black shade, and
// the brightest white/20 status pill used by the banner (not just endpoints).
describe('event white copy contrast', () => {
  it.each(SEASONAL_EVENTS)(
    '$id remains readable on the shaded gradient and status pill',
    (event) => {
      const colors = event.colors.map((hex) =>
        [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)),
      );
      for (let step = 0; step <= 100; step++) {
        const base = colors[0]!.map(
          (value, channel) =>
            (value * (1 - step / 100) + (colors[1]![channel]! * step) / 100) *
            (1 - EVENT_SHADE_ALPHA),
        );
        expect(1.05 / (luminance(base) + 0.05)).toBeGreaterThanOrEqual(4.5);
        expect(
          1.05 / (luminance(base.map((v) => v * 0.8 + 255 * 0.2)) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});
