/**
 * Synthesized Sound Effects
 *
 * AudioContext-based sound effects that work without any audio files.
 * Generates correct/incorrect/tap/levelUp/xpGain sounds programmatically.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

/** Happy ascending two-tone chime */
export function sfxCorrect(): void {
  playTone(523, 0.15, 'sine', 0.25); // C5
  setTimeout(() => {
    playTone(784, 0.25, 'sine', 0.25);
  }, 100); // G5
}

/** Descending buzz */
export function sfxIncorrect(): void {
  playTone(220, 0.15, 'square', 0.12); // A3
  setTimeout(() => {
    playTone(165, 0.2, 'square', 0.1);
  }, 100); // E3
}

/** Quick click/pop */
export function sfxTap(): void {
  playTone(880, 0.05, 'sine', 0.15);
}

/** Ascending arpeggio for XP gain */
export function sfxXpGain(): void {
  playTone(523, 0.1, 'sine', 0.2); // C5
  setTimeout(() => {
    playTone(659, 0.1, 'sine', 0.2);
  }, 80); // E5
  setTimeout(() => {
    playTone(784, 0.15, 'sine', 0.2);
  }, 160); // G5
}

/** Triumphant fanfare for level up */
export function sfxLevelUp(): void {
  playTone(523, 0.12, 'sine', 0.25); // C5
  setTimeout(() => {
    playTone(659, 0.12, 'sine', 0.25);
  }, 100); // E5
  setTimeout(() => {
    playTone(784, 0.12, 'sine', 0.25);
  }, 200); // G5
  setTimeout(() => {
    playTone(1047, 0.35, 'sine', 0.3);
  }, 300); // C6
}

/** Star collect sparkle */
export function sfxStarCollect(): void {
  playTone(1047, 0.08, 'sine', 0.2);
  setTimeout(() => {
    playTone(1319, 0.08, 'sine', 0.2);
  }, 60);
  setTimeout(() => {
    playTone(1568, 0.12, 'sine', 0.2);
  }, 120);
}

/** Lesson complete — celebratory */
export function sfxLessonComplete(): void {
  sfxLevelUp();
  setTimeout(() => {
    sfxStarCollect();
  }, 450);
}

/** Gem collect — higher sparkle */
export function sfxGemCollect(): void {
  playTone(1319, 0.06, 'triangle', 0.2);
  setTimeout(() => {
    playTone(1568, 0.06, 'triangle', 0.2);
  }, 50);
  setTimeout(() => {
    playTone(2093, 0.1, 'triangle', 0.25);
  }, 100);
}

/** Achievement unlock — fanfare with shimmer */
export function sfxAchievementUnlock(): void {
  sfxLevelUp();
  setTimeout(() => {
    sfxGemCollect();
  }, 400);
}

/** Streak complete — ascending pulse */
export function sfxStreakComplete(): void {
  playTone(440, 0.1, 'sine', 0.2);
  setTimeout(() => {
    playTone(554, 0.1, 'sine', 0.2);
  }, 80);
  setTimeout(() => {
    playTone(659, 0.1, 'sine', 0.2);
  }, 160);
  setTimeout(() => {
    playTone(880, 0.2, 'sine', 0.25);
  }, 240);
}

/** Wheel spin — ratchet clicks */
export function sfxWheelSpin(): void {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      playTone(600 + i * 40, 0.04, 'square', 0.08);
    }, i * 60);
  }
}

/** Purchase — coin ka-ching */
export function sfxPurchase(): void {
  playTone(1047, 0.06, 'sine', 0.2);
  setTimeout(() => {
    playTone(1568, 0.1, 'sine', 0.25);
  }, 60);
}

/** Unified SFX lookup — play any manifest key via synth */
export type SfxName =
  | 'correct'
  | 'incorrect'
  | 'tap'
  | 'xpGain'
  | 'levelUp'
  | 'starCollect'
  | 'gemCollect'
  | 'achievementUnlock'
  | 'streakComplete'
  | 'wheelSpin'
  | 'purchase'
  | 'lessonComplete';

const SFX_MAP: Record<SfxName, () => void> = {
  correct: sfxCorrect,
  incorrect: sfxIncorrect,
  tap: sfxTap,
  xpGain: sfxXpGain,
  levelUp: sfxLevelUp,
  starCollect: sfxStarCollect,
  gemCollect: sfxGemCollect,
  achievementUnlock: sfxAchievementUnlock,
  streakComplete: sfxStreakComplete,
  wheelSpin: sfxWheelSpin,
  purchase: sfxPurchase,
  lessonComplete: sfxLessonComplete,
};

/** Play a named SFX — resolves to synth, no file needed */
export function playSfx(name: SfxName): void {
  SFX_MAP[name]();
}
