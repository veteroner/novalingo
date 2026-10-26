import type { NovaPoseInput } from './novaPose';

// The source owl was sculpted with a 3/4 yaw and a tilted eye line.
// Correct the head (not the feet/body) before adding expression or attention.
export const NOVA_HEAD_FORWARD = { pitch: -0.05, yaw: 0.25, roll: 0.24 } as const;

// Short looks with long returns to the child. Smooth transitions and holds avoid
// a metronomic left/right sway. Times and angles are absolute/seek-safe.
const attention: readonly (readonly [number, number, number, number])[] = [
  [0, 0, 0, 0],
  [1.8, 0, 0, 0],
  [2.6, -0.018, 0.13, -0.025],
  [3.2, -0.018, 0.13, -0.025],
  [4.3, 0, 0, 0],
  [7.1, 0, 0, 0],
  [8, -0.012, -0.14, 0.028],
  [8.6, -0.012, -0.14, 0.028],
  [9.7, 0, 0, 0],
  [12.4, 0, 0, 0],
  [13.2, -0.028, 0.035, -0.055],
  [13.9, -0.028, 0.035, -0.055],
  [15.1, 0, 0, 0],
  [18.7, 0, 0, 0],
];
function attentionAt(time: number): readonly number[] {
  const t = ((time % 18.7) + 18.7) % 18.7;
  for (let i = 1; i < attention.length; i++) {
    const a = attention[i - 1],
      b = attention[i];
    if (!a || !b || t > b[0]) continue;
    const x = (t - a[0]) / (b[0] - a[0]);
    const ease = x * x * (3 - 2 * x);
    return [1, 2, 3].map((axis) => (a[axis] ?? 0) + ((b[axis] ?? 0) - (a[axis] ?? 0)) * ease);
  }
  return [0, 0, 0];
}

export function novaHeadPose(input: NovaPoseInput) {
  const sleeping = input.mood === 'sleeping';
  const thinking = input.mood === 'thinking';
  const listening = input.mood === 'listening';
  const sad = input.mood === 'sad';
  const encouraging = input.mood === 'encouraging';
  const active = input.animate && !sleeping;
  const time = Number.isFinite(input.time) ? input.time : 0;
  const [pitch = 0, yaw = 0, roll = 0] = active ? attentionAt(time) : [0, 0, 0];
  const clamp = (value: number | undefined) =>
    Number.isFinite(value) ? Math.max(-1, Math.min(1, value ?? 0)) : 0;
  const lookX = active ? clamp(input.lookX) : 0;
  const lookY = active ? clamp(input.lookY) : 0;
  const talking = active && input.speechActive;
  return {
    pitch:
      NOVA_HEAD_FORWARD.pitch +
      pitch +
      lookY * 0.055 +
      (sleeping ? 0.13 : sad ? 0.075 : listening ? -0.015 : 0) +
      (talking ? Math.sin(time * 2.4) * 0.019 : 0),
    yaw:
      NOVA_HEAD_FORWARD.yaw +
      yaw +
      lookX * 0.13 +
      (thinking ? 0.045 : 0) +
      (talking ? Math.sin(time * 1.15) * 0.018 : 0),
    roll:
      NOVA_HEAD_FORWARD.roll +
      roll +
      (thinking ? -0.055 : listening ? 0.035 : encouraging ? -0.025 : 0),
  };
}
