/** Shared darkening keeps white event copy readable across all six palettes. */
export const EVENT_SHADE_ALPHA = 8 / 15;

export function eventBackground(colors: readonly string[]): string {
  const shade = `rgba(0, 0, 0, ${EVENT_SHADE_ALPHA})`;
  return `linear-gradient(${shade}, ${shade}), linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}
