/**
 * Netlify Serverless Function — Gemini LLM evaluator for open-ended conversations.
 *
 * Replaces Firebase Cloud Functions callable so the project can stay on the
 * free Spark plan.  Set GEMINI_API_KEY in the Netlify dashboard (Site →
 * Environment variables).
 */

/* ---------- env / config ------------------------------------------------- */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_DEFAULT_MODEL?.trim() || 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-2.0-flash-lite';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/* ---------- types -------------------------------------------------------- */

interface EvaluateReq {
  rawText: string;
  scenarioId?: string;
  nodeId: string;
  nodeText?: string;
  targetWords: string[];
  targetPatterns?: string[];
  slots?: Record<string, string>;
  defaultNextNodeId?: string | null;
  responseExamples?: string[];
  config?: {
    enabled: boolean;
    strategy: string;
    domain: string;
    slotKey: string;
    nextNodeId: string;
    marksPattern?: string[];
    countCapturedValueAsTargetWord?: boolean;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

interface ModelPayload {
  accepted?: boolean;
  rationale?: string;
  matchedPattern?: boolean;
  targetWordHits?: string[];
  repairPrompt?: string;
  slotValue?: string | null;
  novaResponseText?: string | null;
  rubricDimensions?: {
    relevanceScore?: number;
    patternAccuracyScore?: number;
    vocabularyCoverageScore?: number;
    childSafetyScore?: number;
    encouragementScore?: number;
  };
}

/* ---------- helpers ------------------------------------------------------ */

function extractJson(value: string): string {
  const fenced = value.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const first = value.indexOf('{');
  const last = value.lastIndexOf('}');
  if (first >= 0 && last > first) return value.slice(first, last + 1);
  return value.trim();
}

function normalizeScore(v: number | undefined, fallback: number): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function filterTargetWordHits(candidates: string[] | undefined, targets: string[]): string[] {
  const targetMap = new Map(targets.map((w) => [w.trim().toLowerCase(), w]));
  const result: string[] = [];
  for (const hit of candidates ?? []) {
    const mapped = targetMap.get(hit.trim().toLowerCase());
    if (mapped && !result.includes(mapped)) result.push(mapped);
  }
  return result;
}

/* ---------- Gemini call -------------------------------------------------- */

const SYSTEM_PROMPT = [
  'You evaluate English speaking answers from children in a language-learning app.',
  'Accept answers that are meaningfully correct even if grammar is imperfect.',
  'Do not invent new branches. Only accept if the child answered the prompt well enough to continue.',
  'When the prompt expects an open slot, extract only the minimal slot value.',
  'Return strict JSON with keys: accepted, rationale, matchedPattern, targetWordHits, repairPrompt, slotValue, novaResponseText, rubricDimensions.',
  'rubricDimensions must contain integers 0-100 for relevanceScore, patternAccuracyScore, vocabularyCoverageScore, childSafetyScore, encouragementScore.',
  'targetWordHits must only include words from the provided targetWords list when they clearly appear.',
  'repairPrompt must be short, child-friendly English when rejected.',
  'childSafetyScore should be high only when the answer is safe, age-appropriate, and non-harmful.',
  'encouragementScore measures whether the child made enough effort to merit warm positive reinforcement.',
  'novaResponseText: when accepted=false, write a warm 1-2 sentence child-friendly English coaching response that',
  'acknowledges what the child said (use their exact words if possible), then gently models the correct answer.',
  'Example: "Çomar is such a cool name! Can you try saying: My dog is Çomar?"',
  'When accepted=true, set novaResponseText to null.',
].join(' ');

async function callGemini(data: EvaluateReq, model: string): Promise<ModelPayload> {
  const userPayload = {
    scenarioId: data.scenarioId,
    nodeId: data.nodeId,
    rawText: data.rawText,
    nodeText: data.nodeText,
    targetWords: data.targetWords.slice(0, 20),
    targetPatterns: data.targetPatterns?.slice(0, 6) ?? [],
    responseExamples: data.responseExamples?.slice(0, 6) ?? [],
    slots: data.slots ?? {},
    defaultNextNodeId: data.defaultNextNodeId ?? null,
    config: data.config
      ? {
          strategy: data.config.strategy,
          domain: data.config.domain,
          slotKey: data.config.slotKey,
          marksPattern: data.config.marksPattern ?? [],
        }
      : null,
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY!)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(userPayload) }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${model}: ${res.status} ${errText.slice(0, 200)}`);
  }

  const body = (await res.json()) as GeminiResponse;
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text) throw new Error(`Gemini ${model}: empty response`);

  return JSON.parse(extractJson(text)) as ModelPayload;
}

async function evaluateWithFallback(
  data: EvaluateReq,
): Promise<{ model: string; result: ModelPayload }> {
  const models = [DEFAULT_MODEL, FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastErr: unknown;

  for (const model of models) {
    try {
      return { model, result: await callGemini(data, model) };
    } catch (err) {
      lastErr = err;
      const isLast = model === models[models.length - 1];
      if (isLast) throw err;
      const msg = err instanceof Error ? err.message : '';
      if (!/429|500|503/.test(msg)) throw err;
    }
  }

  throw lastErr;
}

/* ---------- handler ------------------------------------------------------ */

export default async (req: Request) => {
  /* preflight */
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  /* auth — require a Firebase ID token (presence check) */
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
  }

  if (!GEMINI_API_KEY) {
    return Response.json(
      { error: 'GEMINI_API_KEY not configured on server' },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  try {
    const data = (await req.json()) as EvaluateReq;
    const rawText = data.rawText?.trim();

    if (!rawText) {
      return Response.json(
        { error: 'rawText is required' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const nextNodeId = data.config?.nextNodeId ?? data.defaultNextNodeId ?? null;
    if (!nextNodeId) {
      return Response.json(
        { error: 'A next node is required for remote evaluation' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { model, result: modelResult } = await evaluateWithFallback({
      ...data,
      rawText,
    });

    const accepted = Boolean(modelResult.accepted);
    const targetWordHits = filterTargetWordHits(modelResult.targetWordHits, data.targetWords);
    const slotValue = modelResult.slotValue?.trim() || '';

    const dims = modelResult.rubricDimensions;
    const dimensions = {
      relevanceScore: normalizeScore(dims?.relevanceScore, accepted ? 78 : 25),
      patternAccuracyScore: normalizeScore(dims?.patternAccuracyScore, accepted ? 74 : 20),
      vocabularyCoverageScore: normalizeScore(dims?.vocabularyCoverageScore, accepted ? 70 : 15),
      childSafetyScore: normalizeScore(dims?.childSafetyScore, 96),
      encouragementScore: normalizeScore(dims?.encouragementScore, accepted ? 90 : 55),
    };

    const score = Math.round(
      dimensions.relevanceScore * 0.35 +
        dimensions.patternAccuracyScore * 0.25 +
        dimensions.vocabularyCoverageScore * 0.2 +
        dimensions.childSafetyScore * 0.15 +
        dimensions.encouragementScore * 0.05,
    );

    const marksPattern = modelResult.matchedPattern
      ? ((data.config?.marksPattern?.length
          ? data.config.marksPattern
          : data.targetPatterns?.slice(0, 1)) ?? [])
      : [];

    const result = {
      accepted,
      source: 'llm' as const,
      modelUsed: model,
      resolution: accepted
        ? {
            slotKey: data.config?.slotKey ?? '',
            slotValue,
            nextNodeId,
            marksPattern,
            markedTargetWords: targetWordHits,
          }
        : null,
      rubric: {
        matchedPattern: Boolean(modelResult.matchedPattern),
        targetWordHits,
        score,
        rationale: modelResult.rationale?.trim() || 'Accepted by remote evaluator.',
        dimensions,
      },
      repairPrompt: accepted
        ? undefined
        : modelResult.repairPrompt?.trim() || 'Try answering with the target pattern.',
      novaResponseText: accepted ? undefined : modelResult.novaResponseText?.trim() || undefined,
    };

    return Response.json(result, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('[evaluateOpenEnded]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
};
