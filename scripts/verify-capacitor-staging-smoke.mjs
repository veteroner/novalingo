import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadEnv } from 'vite';

const distDir = resolve('dist');
const ttsDir = resolve('dist/audio/tts');
const expectedBaseUrl = 'https://novalingo-b0c92-tts.web.app';

function listFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFiles(fullPath));
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

function getDirSize(dir) {
  return listFiles(dir).reduce((total, filePath) => total + statSync(filePath).size, 0);
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

if (!existsSync(distDir)) {
  console.error('[smoke:cap:staging] dist/ missing. Run the staging build first.');
  process.exit(1);
}

if (existsSync(ttsDir)) {
  console.error(
    '[smoke:cap:staging] dist/audio/tts exists. Native staging build is still bundling TTS assets.',
  );
  process.exit(1);
}

const env = loadEnv('staging', process.cwd(), '');

if (env.VITE_BUNDLE_TTS_AUDIO !== 'false') {
  console.error('[smoke:cap:staging] VITE_BUNDLE_TTS_AUDIO is not false for staging mode.');
  process.exit(1);
}

if (env.VITE_TTS_AUDIO_BASE_URL !== expectedBaseUrl) {
  console.error(
    `[smoke:cap:staging] VITE_TTS_AUDIO_BASE_URL mismatch. Expected ${expectedBaseUrl}, got ${env.VITE_TTS_AUDIO_BASE_URL ?? '(empty)'}.`,
  );
  process.exit(1);
}

const distSize = getDirSize(distDir);
console.log('[smoke:cap:staging] OK');
console.log(`[smoke:cap:staging] TTS origin: ${env.VITE_TTS_AUDIO_BASE_URL}/audio/tts`);
console.log(`[smoke:cap:staging] dist size: ${formatMiB(distSize)}`);
