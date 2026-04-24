import { isNative } from '@/utils/platform';

const TTS_ASSET_DIR = 'audio/tts';
const bundledTtsEnabled = import.meta.env.VITE_BUNDLE_TTS_AUDIO !== 'false';
const configuredBaseUrl = import.meta.env.VITE_TTS_AUDIO_BASE_URL?.trim();
const externalBaseUrl = configuredBaseUrl ? configuredBaseUrl.replace(/\/+$/, '') : '';

function isAbsoluteUrl(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

function normalizeTtsPath(pathOrFilename: string): string {
  const trimmed = pathOrFilename.trim();
  if (trimmed.startsWith('/')) return trimmed.slice(1);
  if (trimmed.startsWith(`${TTS_ASSET_DIR}/`)) return trimmed;
  if (trimmed.startsWith('audio/')) return trimmed;
  return `${TTS_ASSET_DIR}/${trimmed}`;
}

export function resolveTtsAudioUrl(pathOrFilename: string): string | undefined {
  if (!pathOrFilename) return undefined;
  if (isAbsoluteUrl(pathOrFilename)) return pathOrFilename;

  const normalizedPath = normalizeTtsPath(pathOrFilename);

  if (externalBaseUrl) {
    return `${externalBaseUrl}/${normalizedPath}`;
  }

  if (bundledTtsEnabled || !isNative()) {
    return `/${normalizedPath}`;
  }

  return undefined;
}

export function usesBundledTtsAudio(): boolean {
  return bundledTtsEnabled;
}
