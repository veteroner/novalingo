import type { NovaMood } from '../NovaCharacter';
import type { NovaRig } from './novaModel';

export interface NovaPoseInput {
  mood: NovaMood;
  time: number;
  animate: boolean;
  speechActive?: boolean;
  lookX?: number;
  lookY?: number;
}

/** Absolute poses, safe to evaluate at any time; no accumulating transforms. */
export function poseNova(rig: NovaRig, input: NovaPoseInput) {
  const { mood, animate } = input;
  const t = animate ? input.time : 0;
  const lookX = animate ? (input.lookX ?? 0) : 0;
  const lookY = animate ? (input.lookY ?? 0) : 0;
  const happy = mood === 'happy' || mood === 'excited' || mood === 'celebrating';
  const sleepy = mood === 'sleeping';
  const thinking = mood === 'thinking';
  const sad = mood === 'sad';
  const listening = mood === 'listening';
  const encouraging = mood === 'encouraging';
  rig.root.rotation.set(0, -0.1 + lookX * 0.18, 0);
  rig.torso.scale.set(1, 1 + (animate ? Math.sin(t * 1.65) * 0.009 : 0), 1);
  rig.head.rotation.set(
    (sleepy ? 0.12 : sad ? 0.1 : 0) + lookY * 0.07,
    (thinking ? 0.16 : 0) + lookX * 0.1,
    (thinking ? -0.12 : listening ? 0.11 : sad ? -0.08 : encouraging ? 0.08 : -0.025) +
      (animate ? Math.sin(t * 0.9) * 0.015 : 0),
  );
  const greeting = happy ? 0.65 + (animate ? Math.sin(t * 6) * 0.16 : 0) : encouraging ? 0.48 : 0;
  rig.leftWing.rotation.z = -0.04 - (happy ? 0.37 : 0);
  rig.rightWing.rotation.z = 0.04 + greeting;
  rig.leftWing.rotation.x = happy ? -0.15 : 0;
  rig.rightWing.rotation.x = greeting ? -0.18 : 0;
  const blinkPhase = t % 4.7;
  const blink = animate && blinkPhase > 4.43 ? Math.sin(((blinkPhase - 4.43) / 0.27) * Math.PI) : 0;
  const closed = sleepy || blink > 0.82;
  for (const eye of [rig.eyeL, rig.eyeR]) {
    eye.scale.y = closed ? 0.001 : Math.max(0.08, (sad ? 0.82 : 1) * (1 - blink * 0.95));
  }
  for (const lid of rig.lids) lid.scale.setScalar(closed ? 1 : 0.001);
  rig.pupils.forEach((pupil) => {
    pupil.position.x = 0.015 + lookX * 0.035 + (thinking ? 0.045 : 0);
    pupil.position.y = -0.025 - lookY * 0.035 + (thinking ? 0.065 : 0);
  });
  // Playback state gates the jaw; a 'speaking' label alone must not fake lip sync.
  const jaw = animate && input.speechActive ? 0.3 + Math.abs(Math.sin(t * 13)) * 0.48 : 0;
  rig.lowerBeak.rotation.x = jaw;
  rig.lowerBeak.position.y = -0.36 - jaw * 0.075;
  rig.upperBeak.rotation.x = -jaw * 0.1;
}
