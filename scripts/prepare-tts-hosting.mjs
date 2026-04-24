import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '..');
const sourceDir = resolve(workspaceRoot, 'public/audio/tts');
const outDir = resolve(workspaceRoot, '.firebase/tts-dist');
const targetDir = resolve(outDir, 'audio/tts');

function ensureSourceExists() {
  try {
    statSync(sourceDir);
  } catch {
    throw new Error(`TTS source directory not found: ${sourceDir}`);
  }
}

function removeDotUnderscore(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      removeDotUnderscore(fullPath);
    } else if (entry.name.startsWith('._')) {
      rmSync(fullPath, { force: true });
    }
  }
}

function emptyDir(dir) {
  removeDotUnderscore(dir);
  for (const entry of readdirSync(dir)) {
    rmSync(resolve(dir, entry), { recursive: true, force: true });
  }
}

function prepareOutputDir() {
  try {
    statSync(outDir);
    emptyDir(outDir);
  } catch {
    // Output directory does not exist yet.
  }
  mkdirSync(targetDir, { recursive: true });
}

function copyTtsAssets() {
  cpSync(sourceDir, targetDir, {
    recursive: true,
    force: true,
    filter: (src) => {
      const normalized = src.replaceAll('\\', '/');
      const name = normalized.split('/').pop() ?? '';
      return !name.startsWith('._');
    },
  });
}

ensureSourceExists();
prepareOutputDir();
copyTtsAssets();

console.log(`Prepared Firebase Hosting TTS bundle at ${targetDir}`);
