import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { LipSyncClip } from '../lipSync';

describe('complete recorded-speech facial tracks', () => {
  it('ships a continuous validated cue track for every recording, including all manifest voices', () => {
    const root = resolve('public/speech-sync');
    const names = readdirSync(resolve('public/audio/tts')).filter((name) =>
      /^[a-f0-9]{16}\.mp3$/.test(name),
    );
    const tracks: Record<string, LipSyncClip> = {};
    for (let n = 0; n < 256; n++) {
      const prefix = n.toString(16).padStart(2, '0');
      const bucket = JSON.parse(readFileSync(resolve(root, `${prefix}.json`), 'utf8')) as {
        version: number;
        clips: Record<string, LipSyncClip & { audioSha256: string }>;
      };
      expect(bucket.version).toBe(1);
      for (const [id, clip] of Object.entries(bucket.clips)) {
        expect(id.slice(0, 2)).toBe(prefix);
        expect(clip.audioSha256, id).toBe(
          createHash('sha256')
            .update(readFileSync(resolve('public/audio/tts', id + '.mp3')))
            .digest('hex'),
        );
        expect(Number.isInteger(clip.duration) && clip.duration > 0, id).toBe(true);
        expect(clip.cues.length, id).toBeGreaterThan(0);
        let end = 0;
        for (const [start, finish, shape] of clip.cues) {
          assert.equal(start, end, `${id} at ${start}`);
          assert(Number.isInteger(finish) && finish > start && finish <= clip.duration, id);
          assert('ABCDEFGHX'.includes(shape) && shape.length === 1, id);
          end = finish;
        }
        expect(end, id).toBe(clip.duration);
        tracks[id] = clip;
      }
    }
    expect(Object.keys(tracks).sort()).toEqual(names.map((name) => name.slice(0, -4)).sort());
    const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8')) as {
      recordings: number;
      cues: number;
    };
    expect(manifest.recordings).toBe(names.length);
    expect(manifest.cues).toBe(
      Object.values(tracks).reduce((sum, clip) => sum + clip.cues.length, 0),
    );
  });
});
