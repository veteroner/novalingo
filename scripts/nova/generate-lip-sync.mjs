/** Generate portable viseme tracks locally. No uploaded audio, API keys or paid services.
 * Requires ffmpeg and Rhubarb Lip Sync 1.14 (https://github.com/DanielSWolf/rhubarb-lip-sync).
 * Usage: node scripts/nova/generate-lip-sync.mjs --rhubarb /path/to/rhubarb
 * --recognizer pocketSphinx optionally uses English dialog hints (slower).
 */
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import ts from 'typescript';
const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const rhubarb = option('--rhubarb', 'rhubarb');
const ffmpeg = option('--ffmpeg', 'ffmpeg');
const workers = Number(option('--workers', '4'));
const recognizer = option('--recognizer', 'phonetic');
if (
  !['phonetic', 'pocketSphinx'].includes(recognizer) ||
  !Number.isInteger(workers) ||
  workers < 1 ||
  workers > 8
)
  throw Error('Invalid generator options');
const source = resolve('public/audio/tts'),
  output = resolve('public/speech-sync');
const cache = resolve('e2e/.local-assets/lip-sync-cache');
await mkdir(cache, { recursive: true });
const texts = {};
const manifest = ts.createSourceFile(
  'manifest.ts',
  await readFile('src/services/speech/audioManifest.ts', 'utf8'),
  ts.ScriptTarget.Latest,
  true,
);
function visit(node) {
  if (
    ts.isPropertyAssignment(node) &&
    ts.isStringLiteral(node.name) &&
    ts.isStringLiteral(node.initializer)
  )
    texts[node.initializer.text.slice(0, -4)] = node.name.text;
  ts.forEachChild(node, visit);
}
visit(manifest);
function run(bin, parameters) {
  return new Promise((ok, bad) => {
    const p = spawn(bin, parameters, { stdio: ['ignore', 'ignore', 'pipe'] });
    let error = '';
    p.stderr.on('data', (chunk) => {
      error = (error + chunk).slice(-4000);
    });
    p.on('error', bad);
    p.on('close', (code) => (code === 0 ? ok() : bad(Error(`${bin} exited ${code}: ${error}`))));
  });
}
let next = 0,
  complete = 0;
const files = (await readdir(source)).filter((name) => /^[a-f0-9]{16}\.mp3$/.test(name)).sort();
const clips = {};
const started = Date.now();
async function worker() {
  const temp = await mkdtemp(join(tmpdir(), 'nova-align-'));
  try {
    while (next < files.length) {
      const filename = files[next++],
        id = filename.slice(0, -4),
        path = join(source, filename);
      const mode = recognizer === 'pocketSphinx' && texts[id] ? 'pocketSphinx' : 'phonetic';
      const audioBytes = await readFile(path);
      const audioSha256 = createHash('sha256').update(audioBytes).digest('hex');
      const hash = createHash('sha256')
        .update(audioBytes)
        .update(mode === 'pocketSphinx' ? texts[id] : '')
        .update(`rhubarb-1.14.0-${mode}-1`)
        .digest('hex');
      const cached = join(cache, id + '.json');
      let data;
      try {
        const item = JSON.parse(await readFile(cached, 'utf8'));
        if (item.hash === hash) data = item;
      } catch {}
      if (!data) {
        const wav = join(temp, 'audio.wav'),
          cues = join(temp, 'cues.json'),
          dialog = join(temp, 'dialog.txt');
        await run(ffmpeg, ['-v', 'error', '-y', '-i', path, '-ac', '1', '-ar', '16000', wav]);
        const params = [
          '--threads',
          '1',
          '--quiet',
          '--recognizer',
          mode,
          '--exportFormat',
          'json',
          '--output',
          cues,
        ];
        if (mode === 'pocketSphinx') {
          await writeFile(dialog, texts[id]);
          params.push('--dialogFile', dialog);
        }
        await run(rhubarb, [...params, wav]);
        const result = JSON.parse(await readFile(cues, 'utf8'));
        const duration = Math.round(result.metadata.duration * 1000);
        const track = result.mouthCues.map((cue) => [
          Math.round(cue.start * 1000),
          Math.round(cue.end * 1000),
          cue.value,
        ]);
        if (
          !duration ||
          !track.length ||
          track.some(
            ([a, b, v], i) =>
              a < 0 ||
              b <= a ||
              b > duration ||
              !/^[A-HX]$/.test(v) ||
              (i > 0 && a < track[i - 1][1]),
          )
        )
          throw Error(`Invalid track: ${id}`);
        data = { hash, duration, cues: track };
        await writeFile(cached, JSON.stringify(data));
      }
      clips[id] = { duration: data.duration, cues: data.cues, audioSha256 };
      complete++;
      if (complete % 100 === 0)
        console.log(
          `${complete}/${files.length} recordings (${Math.round((Date.now() - started) / 1000)}s)`,
        );
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
await Promise.all(Array.from({ length: workers }, worker));
await mkdir(output, { recursive: true });
let totalBytes = 0,
  totalCues = 0,
  durationMs = 0;
const orderedClips = Object.entries(clips).sort(([a], [b]) => a.localeCompare(b));
for (let i = 0; i < 256; i++) {
  const prefix = i.toString(16).padStart(2, '0');
  const bucket = Object.fromEntries(orderedClips.filter(([id]) => id.startsWith(prefix)));
  const json = JSON.stringify({ version: 1, clips: bucket }) + '\n';
  totalBytes += Buffer.byteLength(json);
  const dest = join(output, prefix + '.json');
  await writeFile(dest + '.tmp', json);
  await rename(dest + '.tmp', dest);
}
for (const clip of Object.values(clips)) {
  totalCues += clip.cues.length;
  durationMs += clip.duration;
}
const report = {
  generator: 'Rhubarb Lip Sync 1.14.0',
  recognizer,
  recordings: files.length,
  cues: totalCues,
  durationMs,
  bytes: totalBytes,
};
await writeFile(join(output, 'manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
