/** Deterministic closures with a quick downstroke and a softer reopening. */
export function novaBlinkAt(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  const phase = seconds % 15.1;
  for (const start of [2.8, 6.4, 6.72, 11.5]) {
    const t = phase - start;
    if (t < 0 || t >= 0.25) continue;
    const ease = (x: number) => x * x * (3 - 2 * x);
    if (t < 0.07) return ease(t / 0.07);
    if (t < 0.1) return 1;
    return 1 - ease((t - 0.1) / 0.15);
  }
  return 0;
}

/** Adjacent conformed shells blend locally; no long straight line through the eye. */
export function lidWeights(closed: number): readonly number[] {
  const level = Math.min(1, Math.max(0, closed)) * 4;
  return [1, 2, 3, 4].map((key) => Math.max(0, 1 - Math.abs(level - key)));
}
