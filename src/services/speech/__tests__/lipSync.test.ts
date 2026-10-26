import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadLipSync, REST_MOUTH, sampleLipSync, type LipSyncClip } from '../lipSync';
const clip: LipSyncClip = {
  duration: 1000,
  cues: [
    [0, 100, 'X'],
    [100, 200, 'A'],
    [200, 500, 'D'],
    [500, 700, 'F'],
    [700, 1000, 'X'],
  ],
};
afterEach(() => vi.unstubAllGlobals());
describe('audio-clock visemes', () => {
  it('keeps silence and P/B/M fully closed and respects exact cue boundaries', () => {
    expect(sampleLipSync(clip, 0.099)).toBe(REST_MOUTH);
    expect(sampleLipSync(clip, 0.15)).toMatchObject({ shape: 'A', open: 0 });
    expect(sampleLipSync(clip, 0.3)).toMatchObject({ shape: 'D', open: 1 });
    expect(sampleLipSync(clip, 0.6)).toMatchObject({ shape: 'F', round: 1, wide: 0 });
    expect(sampleLipSync(clip, 0.7)).toBe(REST_MOUTH);
  });
  it('can seek backward without accumulating motion and closes outside the recording', () => {
    sampleLipSync(clip, 0.6);
    expect(sampleLipSync(clip, 0.3)).toEqual(sampleLipSync(clip, 0.3));
    for (const seconds of [-1, 1, 5, NaN, Infinity])
      expect(sampleLipSync(clip, seconds)).toBe(REST_MOUTH);
    expect(sampleLipSync(null, 0.3)).toBe(REST_MOUTH);
    expect(sampleLipSync({ duration: 1000, cues: [[500, 700, 'D']] }, 0.1)).toBe(REST_MOUTH);
  });
  it('loads the same track for bundled and CDN recordings, while rejecting unrelated paths', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1, clips: { ab00000000000001: clip } }),
    });
    vi.stubGlobal('fetch', fetcher);
    expect(await loadLipSync('/audio/tts/ab00000000000001.mp3')).toEqual(clip);
    expect(await loadLipSync('https://audio.example.com/audio/tts/ab00000000000001.mp3')).toEqual(
      clip,
    );
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('/speech-sync/ab.json');
    for (const url of [
      'data:audio/wav;base64,xx',
      'blob:https://example.com/x',
      '/other/ab00000000000001.mp3',
    ])
      expect(await loadLipSync(url)).toBeNull();
  });
  it('fails closed on malformed/overlapping cues and retries a failed fetch', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(Error('offline'))
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          version: 1,
          clips: {
            cd00000000000001: {
              duration: 1000,
              cues: [
                [0, 400, 'D'],
                [200, 500, 'F'],
              ],
            },
          },
        }),
      });
    vi.stubGlobal('fetch', fetcher);
    expect(await loadLipSync('/audio/tts/cd00000000000001.mp3')).toBeNull();
    expect(await loadLipSync('/audio/tts/cd00000000000001.mp3')).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
