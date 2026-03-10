/**
 * Netlify Function — Google Cloud Text-to-Speech Proxy
 *
 * Neural2 sesleri kullanarak profesyonel kalitede İngilizce TTS sağlar.
 * Duolingo kalitesinde ses: en-US-Neural2-C (sıcak kadın sesi).
 *
 * Gereksinimler:
 *  - GCP Console'da Cloud Text-to-Speech API aktif
 *  - Netlify env: GOOGLE_CLOUD_TTS_API_KEY
 */

import type { Config } from '@netlify/functions';

const MAX_TEXT_LENGTH = 500;

const ALLOWED_ORIGINS = [
  'https://novalingo.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

function corsHeaders(origin: string): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default async (req: Request) => {
  const origin = req.headers.get('origin') ?? '';

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TTS service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }

  // Parse & validate input
  let text: string;
  let rate: number;
  let pitch: number;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    text = typeof body.text === 'string' ? body.text.trim() : '';
    rate = typeof body.rate === 'number' ? body.rate : 0.9;
    pitch = typeof body.pitch === 'number' ? body.pitch : 0;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return new Response(
      JSON.stringify({ error: text ? `Text too long (max ${MAX_TEXT_LENGTH})` : 'Text required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } },
    );
  }

  // Call Google Cloud TTS
  try {
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-C', // Warm natural female — Duolingo-level quality
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: Math.max(0.25, Math.min(4.0, rate)),
            pitch: Math.max(-20.0, Math.min(20.0, pitch)),
            sampleRateHertz: 24000,
          },
        }),
      },
    );

    if (!ttsRes.ok) {
      console.error('Google TTS error:', ttsRes.status, await ttsRes.text());
      return new Response(JSON.stringify({ error: 'TTS API error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const data = (await ttsRes.json()) as { audioContent: string };
    const raw = atob(data.audioContent);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800', // 7 days CDN cache
        ...corsHeaders(origin),
      },
    });
  } catch (err) {
    console.error('TTS function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }
};

export const config: Config = {
  path: '/api/tts',
};
