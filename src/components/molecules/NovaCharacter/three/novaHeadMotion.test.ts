import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { NOVA_HEAD_FORWARD, novaHeadPose } from './novaHeadMotion';
const base = { mood: 'idle' as const, time: 0, animate: true };
describe('Nova forward attention and head gestures', () => {
  it('levels the sculpted eye line and faces the child without tilting the feet/body', () => {
    // Named landmarks measured from the source model, in exported glTF axes.
    const eyeLine = new THREE.Vector3(0.744, -0.195, 0.294);
    const head = novaHeadPose({ ...base, animate: false });
    eyeLine
      .applyEuler(new THREE.Euler(head.pitch, head.yaw, head.roll))
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.12);
    expect(Math.abs(Math.atan2(eyeLine.y, eyeLine.x))).toBeLessThan(THREE.MathUtils.degToRad(2));
    expect(Math.abs(eyeLine.z)).toBeLessThan(0.02);
  });
  it('makes short looks in both directions and returns to long centered holds', () => {
    expect(novaHeadPose({ ...base, time: 2.9 }).yaw).toBeGreaterThan(NOVA_HEAD_FORWARD.yaw + 0.1);
    expect(novaHeadPose({ ...base, time: 8.3 }).yaw).toBeLessThan(NOVA_HEAD_FORWARD.yaw - 0.1);
    for (const time of [0, 1, 5, 6, 10.5, 11.5, 16, 18.7])
      expect(novaHeadPose({ ...base, time })).toEqual(NOVA_HEAD_FORWARD);
    const tilt = novaHeadPose({ ...base, time: 13.5 });
    expect(tilt.roll).toBeLessThan(NOVA_HEAD_FORWARD.roll - 0.05);
  });
  it('is continuous at holds and cycle boundaries, bounded, and independent of evaluation history', () => {
    for (const t of [1.8, 2.6, 3.2, 4.3, 7.1, 8, 8.6, 9.7, 12.4, 13.2, 13.9, 15.1, 18.7]) {
      const a = novaHeadPose({ ...base, time: t - 0.0001 }),
        b = novaHeadPose({ ...base, time: t + 0.0001 });
      for (const key of ['pitch', 'yaw', 'roll'] as const)
        expect(Math.abs(a[key] - b[key])).toBeLessThan(0.0001);
    }
    for (let t = 0; t < 38; t += 0.1) {
      const pose = novaHeadPose({ ...base, time: t });
      expect(Math.abs(pose.yaw - NOVA_HEAD_FORWARD.yaw)).toBeLessThanOrEqual(0.141);
      expect(Math.abs(pose.roll - NOVA_HEAD_FORWARD.roll)).toBeLessThanOrEqual(0.056);
    }
    novaHeadPose({ ...base, time: 8 });
    expect(novaHeadPose({ ...base, time: 0 })).toEqual(NOVA_HEAD_FORWARD);
  });
  it('keeps reduced motion and sleeping still, clamps pointers, and gates speech gestures on real playback', () => {
    expect(
      novaHeadPose({ ...base, time: 13, animate: false, lookX: 1, lookY: 1, speechActive: true }),
    ).toEqual(NOVA_HEAD_FORWARD);
    expect(novaHeadPose({ ...base, mood: 'sleeping', time: 1 })).toEqual(
      novaHeadPose({ ...base, mood: 'sleeping', time: 13, speechActive: true, lookX: 1 }),
    );
    expect(novaHeadPose({ ...base, time: 1, speechActive: true })).not.toEqual(
      novaHeadPose({ ...base, time: 1 }),
    );
    expect(novaHeadPose({ ...base, lookX: 1e6, lookY: -1e6 })).toEqual(
      novaHeadPose({ ...base, lookX: 1, lookY: -1 }),
    );
    expect(novaHeadPose({ ...base, time: NaN, lookX: NaN })).toEqual(NOVA_HEAD_FORWARD);
  });
});
