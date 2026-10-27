/** Offline phonetic alignment of the bundled recordings (Rhubarb 1.14).
 * Times are milliseconds on the recording's clock, never animation elapsed time.
 */
export type Viseme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X';
export type MouthCue = readonly [startMs: number, endMs: number, shape: Viseme];
export interface LipSyncClip {
  duration: number;
  cues: MouthCue[];
}
export interface MouthFrame {
  shape: Viseme;
  open: number;
  round: number;
  wide: number;
}
export const REST_MOUTH: Readonly<MouthFrame> = Object.freeze({
  shape: 'X',
  open: 0,
  round: 0,
  wide: 0,
});
// Owl bill articulation: closures, vowel aperture and rounded/spread bill shapes.
const SHAPES: Record<Viseme, Readonly<MouthFrame>> = {
  X: REST_MOUTH,
  A: { shape: 'A', open: 0, round: 0, wide: 0 },
  B: { shape: 'B', open: 0.22, round: 0, wide: 0.45 },
  C: { shape: 'C', open: 0.58, round: 0, wide: 0.65 },
  D: { shape: 'D', open: 1, round: 0, wide: 0.3 },
  E: { shape: 'E', open: 0.55, round: 0.7, wide: 0 },
  F: { shape: 'F', open: 0.28, round: 1, wide: 0 },
  G: { shape: 'G', open: 0.12, round: 0, wide: 0.25 },
  H: { shape: 'H', open: 0.4, round: 0, wide: 0.35 },
};

/** Seek-safe binary search. Exact closures/rest are never interpolated into sound. */
export function sampleLipSync(clip: LipSyncClip | null, seconds: number): Readonly<MouthFrame> {
  if (!clip || !Number.isFinite(seconds) || seconds < 0) return REST_MOUTH;
  const ms = seconds * 1000;
  if (ms >= clip.duration) return REST_MOUTH;
  let lo = 0,
    hi = clip.cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cue = clip.cues[mid];
    if (!cue) return REST_MOUTH;
    if (ms < cue[0]) hi = mid - 1;
    else if (ms >= cue[1]) lo = mid + 1;
    else {
      const pose = SHAPES[cue[2]];
      if (pose.open === 0) return pose;
      // Only ease within this sound; a P/B/M closure or silence stays completely shut.
      const edge = Math.min(1, (ms - cue[0]) / 18, (cue[1] - ms) / 18);
      const amount = 0.8 + 0.2 * Math.max(0, edge);
      return { shape: pose.shape, open: pose.open * amount, round: pose.round, wide: pose.wide };
    }
  }
  return REST_MOUTH;
}

/** Only our known hashed recording paths have an authored alignment.
 * Arbitrary user URLs/data/blob must not borrow another recording's mouth track. */
function recordingId(src: string): string | null {
  try {
    const url = new URL(src, 'https://novalingo.local');
    if (!['https:', 'http:', 'capacitor:'].includes(url.protocol)) return null;
    return /^\/audio\/tts\/([a-f0-9]{16})\.mp3$/.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

function parseClip(value: unknown): LipSyncClip | null {
  if (!value || typeof value !== 'object') return null;
  const clip = value as { duration?: unknown; cues?: unknown };
  if (
    typeof clip.duration !== 'number' ||
    !Number.isFinite(clip.duration) ||
    clip.duration <= 0 ||
    !Array.isArray(clip.cues) ||
    clip.cues.length > 10000
  )
    return null;
  let previousEnd = 0;
  for (const cue of clip.cues) {
    if (
      !Array.isArray(cue) ||
      cue.length !== 3 ||
      typeof cue[0] !== 'number' ||
      typeof cue[1] !== 'number' ||
      typeof cue[2] !== 'string' ||
      !Number.isFinite(cue[0]) ||
      !Number.isFinite(cue[1]) ||
      cue[0] < previousEnd ||
      cue[1] <= cue[0] ||
      cue[1] > clip.duration ||
      !Object.hasOwn(SHAPES, cue[2])
    )
      return null;
    previousEnd = cue[1];
  }
  return clip as LipSyncClip;
}

const buckets = new Map<string, Promise<Record<string, unknown> | null>>();
/** Small lazy buckets, bundled even when MP3s come from the audio CDN. No audio decoding/CORS required. */
export async function loadLipSync(src: string): Promise<LipSyncClip | null> {
  const id = recordingId(src);
  if (!id) return null;
  const prefix = id.slice(0, 2);
  let pending = buckets.get(prefix);
  if (!pending) {
    pending = fetch(`/speech-sync/${prefix}.json`)
      .then(async (response) => {
        if (!response.ok) return null;
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          !('version' in data) ||
          data.version !== 1 ||
          !('clips' in data) ||
          !data.clips ||
          typeof data.clips !== 'object'
        )
          return null;
        return data.clips as Record<string, unknown>;
      })
      .catch(() => null);
    buckets.set(prefix, pending);
    const oldest = buckets.keys().next().value;
    if (buckets.size > 32 && oldest !== undefined) buckets.delete(oldest);
    // A transient offline error must be retryable on a later playback.
    void pending.then((result) => {
      if (!result && buckets.get(prefix) === pending) buckets.delete(prefix);
    });
  }
  const data = await pending;
  return parseClip(data?.[id]);
}
