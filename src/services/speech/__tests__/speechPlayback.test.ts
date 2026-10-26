import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSpeechMouthFrame,
  isSpeakingNow,
  onSpeakingStateChange,
  speak,
  stopSpeaking,
} from '../speechService';
import { REST_MOUTH, type LipSyncClip } from '../lipSync';
const mocks = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('../lipSync', async () => ({
  ...(await vi.importActual('../lipSync')),
  loadLipSync: mocks.load,
}));
vi.mock('../audioManifest', () => ({
  getPreRecordedUrl: (text: string) =>
    text === 'missing' ? undefined : '/audio/tts/ab00000000000001.mp3',
}));
class AudioMock {
  static instances: AudioMock[] = [];
  static blocked = false;
  currentTime = 0;
  duration = 1;
  paused = true;
  ended = false;
  seeking = false;
  playbackRate = 1;
  readyState = 4;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onplaying: (() => void) | null = null;
  onwaiting: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onseeking: (() => void) | null = null;
  onseeked: (() => void) | null = null;
  constructor(public src: string) {
    AudioMock.instances.push(this);
  }
  play() {
    if (AudioMock.blocked) return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.onpause?.();
  }
  removeAttribute() {}
  load() {}
}
const clip: LipSyncClip = {
  duration: 1000,
  cues: [
    [0, 100, 'X'],
    [100, 200, 'A'],
    [200, 600, 'D'],
    [600, 1000, 'X'],
  ],
};
beforeEach(() => {
  AudioMock.instances = [];
  AudioMock.blocked = false;
  vi.stubGlobal('Audio', AudioMock);
  mocks.load.mockResolvedValue(clip);
});
afterEach(() => {
  stopSpeaking();
  vi.unstubAllGlobals();
});
async function start() {
  const done = speak('hello');
  const audio = AudioMock.instances.at(-1)!;
  await Promise.resolve();
  return { done, audio };
}
describe('speech playback and face lifecycle', () => {
  it('opens only after actual playing, follows currentTime, and stops on buffering/pause/seek', async () => {
    const { done, audio } = await start();
    audio.currentTime = 0.3;
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    audio.onplaying?.();
    expect(getSpeechMouthFrame()).toMatchObject({ shape: 'D', open: 1 });
    audio.onwaiting?.();
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    audio.onplaying?.();
    audio.playbackRate = 2;
    audio.currentTime = 0.15;
    expect(getSpeechMouthFrame()).toMatchObject({ shape: 'A', open: 0 });
    audio.currentTime = 0.3;
    audio.seeking = true;
    audio.onseeking?.();
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    audio.seeking = false;
    audio.onseeked?.();
    expect(getSpeechMouthFrame().open).toBe(1);
    audio.pause();
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    audio.ended = true;
    audio.onended?.();
    expect(await done).toBe(true);
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
  });
  it('settles cancelled playback and ignores late cues from a replaced recording', async () => {
    let late!: (value: LipSyncClip) => void;
    mocks.load.mockReturnValueOnce(
      new Promise<LipSyncClip>((r) => {
        late = r;
      }),
    );
    const first = await start();
    const changes = vi.fn();
    const unsubscribe = onSpeakingStateChange(changes);
    const second = await start();
    expect(await first.done).toBe(false);
    expect(isSpeakingNow()).toBe(true);
    late({ duration: 1000, cues: [[0, 1000, 'F']] });
    await Promise.resolve();
    second.audio.currentTime = 0.3;
    second.audio.onplaying?.();
    expect(getSpeechMouthFrame().shape).toBe('D');
    expect(changes).not.toHaveBeenCalledWith(false);
    stopSpeaking();
    expect(await second.done).toBe(false);
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    unsubscribe();
  });
  it('never animates blocked, failed, unknown, or different-length recordings', async () => {
    AudioMock.blocked = true;
    expect(await speak('hello')).toBe(false);
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    AudioMock.blocked = false;
    const { done, audio } = await start();
    audio.duration = 2;
    audio.currentTime = 0.3;
    audio.onplaying?.();
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    audio.onerror?.();
    expect(await done).toBe(false);
    const playing = await start();
    expect(await speak('missing')).toBe(false);
    expect(await playing.done).toBe(false);
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
  });
  it('does not delay audio.play waiting for a timeline download', async () => {
    mocks.load.mockReturnValue(new Promise(() => {}));
    const { done, audio } = await start();
    expect(audio.paused).toBe(false);
    audio.onplaying?.();
    audio.currentTime = 0.3;
    expect(getSpeechMouthFrame()).toBe(REST_MOUTH);
    stopSpeaking();
    expect(await done).toBe(false);
  });
});
