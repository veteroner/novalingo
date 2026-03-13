/**
 * Kokoro TTS Service
 *
 * Browser-based neural TTS using Kokoro-82M ONNX model.
 * Lazy-loads the model on first use (~169 MB quantized).
 * After initial download, HuggingFace Hub caches the model in browser storage.
 */

import type { KokoroTTS } from 'kokoro-js';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const DEFAULT_VOICE = 'af_heart';
const DEFAULT_SPEED = 0.9;
const SAMPLE_RATE = 24000;

let ttsInstance: KokoroTTS | null = null;
let loadingPromise: Promise<KokoroTTS> | null = null;
let loadFailed = false;

/**
 * Lazy-load and return Kokoro TTS instance.
 * First call downloads model files (~169 MB q8); subsequent calls are instant.
 */
async function getKokoroTTS(): Promise<KokoroTTS | null> {
  if (ttsInstance) return ttsInstance;
  if (loadFailed) return null;

  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        const { KokoroTTS: KokoroClass } = await import('kokoro-js');
        const instance = await KokoroClass.from_pretrained(MODEL_ID, {
          dtype: 'q8',
        });
        ttsInstance = instance;
        return instance;
      } catch (err) {
        console.warn('[Kokoro] Model load failed, falling back to Web Speech API:', err);
        loadFailed = true;
        loadingPromise = null;
        throw err;
      }
    })();
  }

  return loadingPromise;
}

/** Convert Float32Array PCM to WAV Blob */
function pcmToWavBlob(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bytesPerSample = 2;
  const dataLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generate speech audio as a WAV Blob.
 * Returns null if model isn't available.
 */
export async function generateSpeech(
  text: string,
  options: { voice?: string; speed?: number } = {},
): Promise<Blob | null> {
  const tts = await getKokoroTTS();
  if (!tts) return null;

  // RawAudio type from @huggingface/transformers isn't directly resolvable through pnpm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audio: any = await tts.generate(text, {
    voice: (options.voice ?? DEFAULT_VOICE) as 'af_heart',
    speed: options.speed ?? DEFAULT_SPEED,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const samples = audio.audio as Float32Array;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const sampleRate: number = (audio.sampling_rate as number) || SAMPLE_RATE;
  return pcmToWavBlob(samples, sampleRate);
}

/** Whether the model has been loaded successfully */
export function isKokoroReady(): boolean {
  return ttsInstance !== null;
}

/** Fire-and-forget preload — starts downloading model in background */
export function preloadKokoro(): void {
  getKokoroTTS().catch(() => {
    /* handled inside */
  });
}
