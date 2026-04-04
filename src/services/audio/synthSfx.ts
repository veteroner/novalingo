/**
 * Synthetic SFX Engine
 *
 * Web Audio API ile oyun sesleri üretir.
 * Dosya indirmeye gerek yok — tüm sesler kod ile sentezlenir.
 * Çocuk uygulaması için neşeli, yumuşak tonlar.
 *
 * 23 farklı ses efekti: tap, correct, wrong, pop, whoosh, coin,
 * xp-gain, level-up, streak, star-collect, achievement, combo,
 * countdown-tick, timer-warning, button-press, card-flip,
 * match-found, lesson-complete, bonus, hint-used, nova-greeting,
 * wheel-spin, wheel-reward.
 */

export type SfxName =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'pop'
  | 'whoosh'
  | 'coin'
  | 'xp-gain'
  | 'level-up'
  | 'streak'
  | 'star-collect'
  | 'achievement'
  | 'combo'
  | 'countdown-tick'
  | 'timer-warning'
  | 'button-press'
  | 'card-flip'
  | 'match-found'
  | 'lesson-complete'
  | 'bonus'
  | 'hint-used'
  | 'nova-greeting'
  | 'wheel-spin'
  | 'wheel-reward';

let ctx: AudioContext | null = null;
let globalVolume = 0.7;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

function vol(): number {
  return muted ? 0 : globalVolume;
}

// ─── Primitive builders ──────────────────────────────────────

function tone(
  actx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.5,
  startTime = 0,
): void {
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume * vol(), actx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + startTime + duration);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start(actx.currentTime + startTime);
  osc.stop(actx.currentTime + startTime + duration);
}

function noise(actx: AudioContext, duration: number, volume = 0.3, startTime = 0): void {
  const bufferSize = Math.max(1, Math.floor(actx.sampleRate * duration));
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = actx.createBufferSource();
  src.buffer = buffer;
  const gain = actx.createGain();
  const filter = actx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  gain.gain.setValueAtTime(volume * vol(), actx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + startTime + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(actx.destination);
  src.start(actx.currentTime + startTime);
  src.stop(actx.currentTime + startTime + duration);
}

// ─── Sound definitions (23 effects) ─────────────────────────

const sfxGenerators: Record<SfxName, () => void> = {
  /** Light tap click */
  tap() {
    const a = getCtx();
    tone(a, 800, 0.06, 'sine', 0.3);
    tone(a, 1200, 0.04, 'sine', 0.15, 0.01);
  },

  /** Correct answer — happy ascending arpeggio */
  correct() {
    const a = getCtx();
    tone(a, 523, 0.12, 'sine', 0.4); // C5
    tone(a, 659, 0.12, 'sine', 0.4, 0.08); // E5
    tone(a, 784, 0.18, 'sine', 0.45, 0.16); // G5
  },

  /** Wrong answer — gentle descending */
  wrong() {
    const a = getCtx();
    tone(a, 350, 0.15, 'triangle', 0.35);
    tone(a, 280, 0.2, 'triangle', 0.3, 0.1);
  },

  /** Bubble pop */
  pop() {
    const a = getCtx();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, a.currentTime + 0.08);
    gain.gain.setValueAtTime(0.4 * vol(), a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.1);
  },

  /** Quick whoosh/swipe */
  whoosh() {
    const a = getCtx();
    noise(a, 0.2, 0.25);
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, a.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08 * vol(), a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.2);
  },

  /** Coin/gem collect — metallic ding */
  coin() {
    const a = getCtx();
    tone(a, 1568, 0.08, 'sine', 0.35); // G6
    tone(a, 2093, 0.15, 'sine', 0.3, 0.05); // C7
    tone(a, 2637, 0.2, 'sine', 0.2, 0.1); // E7
  },

  /** XP gain — rising shimmer */
  'xp-gain'() {
    const a = getCtx();
    tone(a, 880, 0.08, 'sine', 0.3);
    tone(a, 1100, 0.08, 'sine', 0.3, 0.06);
    tone(a, 1320, 0.12, 'sine', 0.35, 0.12);
  },

  /** Level up — triumphant fanfare */
  'level-up'() {
    const a = getCtx();
    tone(a, 523, 0.12, 'sine', 0.4); // C5
    tone(a, 659, 0.12, 'sine', 0.4, 0.1); // E5
    tone(a, 784, 0.12, 'sine', 0.4, 0.2); // G5
    tone(a, 1047, 0.3, 'sine', 0.5, 0.3); // C6 (hold)
    tone(a, 1319, 0.25, 'sine', 0.3, 0.35); // E6 harmony
  },

  /** Streak — warm glow pulse */
  streak() {
    const a = getCtx();
    tone(a, 440, 0.15, 'sine', 0.3);
    tone(a, 554, 0.15, 'sine', 0.3, 0.1);
    tone(a, 659, 0.15, 'sine', 0.35, 0.2);
    tone(a, 880, 0.25, 'sine', 0.4, 0.3);
  },

  /** Star collect — bright sparkle */
  'star-collect'() {
    const a = getCtx();
    tone(a, 2000, 0.06, 'sine', 0.3);
    tone(a, 2400, 0.06, 'sine', 0.25, 0.04);
    tone(a, 2800, 0.06, 'sine', 0.2, 0.08);
    tone(a, 3200, 0.1, 'sine', 0.15, 0.12);
  },

  /** Achievement unlock — epic chord */
  achievement() {
    const a = getCtx();
    tone(a, 523, 0.4, 'sine', 0.35); // C5
    tone(a, 659, 0.35, 'sine', 0.3, 0.05); // E5
    tone(a, 784, 0.3, 'sine', 0.3, 0.1); // G5
    tone(a, 1047, 0.5, 'sine', 0.4, 0.15); // C6
    tone(a, 2093, 0.1, 'sine', 0.15, 0.2);
    tone(a, 2637, 0.1, 'sine', 0.1, 0.25);
  },

  /** Combo — rapid ascending pips */
  combo() {
    const a = getCtx();
    const notes = [700, 900, 1100, 1400];
    notes.forEach((freq, i) => {
      tone(a, freq, 0.06, 'sine', 0.3, i * 0.04);
    });
  },

  /** Countdown tick */
  'countdown-tick'() {
    const a = getCtx();
    tone(a, 600, 0.05, 'sine', 0.25);
  },

  /** Timer warning — urgent double beep */
  'timer-warning'() {
    const a = getCtx();
    tone(a, 1000, 0.08, 'square', 0.2);
    tone(a, 1000, 0.08, 'square', 0.2, 0.12);
  },

  /** Soft button press */
  'button-press'() {
    const a = getCtx();
    tone(a, 500, 0.05, 'sine', 0.25);
    tone(a, 700, 0.04, 'sine', 0.15, 0.02);
  },

  /** Card flip */
  'card-flip'() {
    const a = getCtx();
    noise(a, 0.08, 0.15);
    tone(a, 400, 0.06, 'sine', 0.2, 0.02);
  },

  /** Match found — happy double chime */
  'match-found'() {
    const a = getCtx();
    tone(a, 784, 0.1, 'sine', 0.35); // G5
    tone(a, 1047, 0.15, 'sine', 0.4, 0.08); // C6
  },

  /** Lesson complete — victory jingle */
  'lesson-complete'() {
    const a = getCtx();
    tone(a, 523, 0.1, 'sine', 0.35);
    tone(a, 659, 0.1, 'sine', 0.35, 0.1);
    tone(a, 784, 0.1, 'sine', 0.35, 0.2);
    tone(a, 1047, 0.15, 'sine', 0.4, 0.3);
    tone(a, 784, 0.08, 'sine', 0.3, 0.42);
    tone(a, 1047, 0.3, 'sine', 0.45, 0.48);
  },

  /** Bonus — playful boing */
  bonus() {
    const a = getCtx();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, a.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(600, a.currentTime + 0.2);
    gain.gain.setValueAtTime(0.4 * vol(), a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.25);
  },

  /** Hint used — soft descending note */
  'hint-used'() {
    const a = getCtx();
    tone(a, 800, 0.1, 'triangle', 0.25);
    tone(a, 600, 0.15, 'triangle', 0.2, 0.08);
  },

  /** Nova greeting — friendly chirp */
  'nova-greeting'() {
    const a = getCtx();
    tone(a, 800, 0.08, 'sine', 0.3);
    tone(a, 1000, 0.06, 'sine', 0.3, 0.06);
    tone(a, 1200, 0.06, 'sine', 0.25, 0.1);
    tone(a, 1000, 0.1, 'sine', 0.3, 0.14);
  },

  /** Wheel spin — rising whirr */
  'wheel-spin'() {
    const a = getCtx();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, a.currentTime);
    osc.frequency.linearRampToValueAtTime(800, a.currentTime + 0.6);
    gain.gain.setValueAtTime(0.08 * vol(), a.currentTime);
    gain.gain.linearRampToValueAtTime(0.15 * vol(), a.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.7);
  },

  /** Wheel reward — celebratory ding */
  'wheel-reward'() {
    const a = getCtx();
    tone(a, 1047, 0.1, 'sine', 0.4);
    tone(a, 1319, 0.1, 'sine', 0.4, 0.08);
    tone(a, 1568, 0.2, 'sine', 0.45, 0.16);
    tone(a, 3000, 0.06, 'sine', 0.12, 0.2);
    tone(a, 3500, 0.06, 'sine', 0.1, 0.24);
  },
};

// ─── Public API ──────────────────────────────────────────────

/** Play a synthesised sound effect by name */
export function playSfx(name: SfxName): void {
  if (muted) return;
  const gen = sfxGenerators[name];
  if (gen) gen();
}

/** Set master volume (0–1) */
export function setSfxVolume(v: number): void {
  globalVolume = Math.max(0, Math.min(1, v));
}

/** Mute / unmute */
export function setSfxMuted(m: boolean): void {
  muted = m;
}

/** Unlock AudioContext on first user gesture (mobile requirement) */
export function unlockAudioContext(): void {
  const a = getCtx();
  if (a.state === 'suspended') {
    void a.resume();
  }
}
