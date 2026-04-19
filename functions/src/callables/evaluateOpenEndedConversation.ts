import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import type {
  EvaluateOpenEndedConversationReq,
  EvaluateOpenEndedConversationRes,
} from '../types/request';
import { callableOpts, requireAuth } from '../utils/admin';
import { checkRateLimit, RATE_LIMITS } from '../utils/rateLimit';

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_DEFAULT_MODEL?.trim() || 'gemini-3.1-flash-lite-preview';
const FALLBACK_GEMINI_MODEL = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-2.5-flash-lite';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
}

interface ModelEvaluationPayload {
  accepted?: boolean;
  rationale?: string;
  matchedPattern?: boolean;
  targetWordHits?: string[];
  repairPrompt?: string;
  slotValue?: string | null;
  rubricDimensions?: {
    relevanceScore?: number;
    patternAccuracyScore?: number;
    vocabularyCoverageScore?: number;
    childSafetyScore?: number;
    encouragementScore?: number;
  };
}

interface NormalizedRubricDimensions {
  relevanceScore: number;
  patternAccuracyScore: number;
  vocabularyCoverageScore: number;
  childSafetyScore: number;
  encouragementScore: number;
}

function extractJsonObject(value: string): string {
  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function filterTargetWordHits(
  candidateHits: string[] | undefined,
  targetWords: string[],
): string[] {
  const targetMap = new Map(targetWords.map((word) => [normalizeText(word), word]));
  const result: string[] = [];

  for (const hit of candidateHits ?? []) {
    const mapped = targetMap.get(normalizeText(hit));
    if (!mapped || result.includes(mapped)) continue;
    result.push(mapped);
  }

  return result;
}

async function callOpenAI(
  request: EvaluateOpenEndedConversationReq,
  model: string,
): Promise<ModelEvaluationPayload> {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'GEMINI_API_KEY secret is not configured');
  }

  const systemPrompt = [
    'You evaluate English speaking answers from children in a language-learning app.',
    'Accept answers that are meaningfully correct even if grammar is imperfect.',
    'Do not invent new branches. Only accept if the child answered the prompt well enough to continue.',
    'When the prompt expects an open slot, extract only the minimal slot value.',
    'Return strict JSON with keys: accepted, rationale, matchedPattern, targetWordHits, repairPrompt, slotValue, rubricDimensions.',
    'rubricDimensions must contain integers 0-100 for relevanceScore, patternAccuracyScore, vocabularyCoverageScore, childSafetyScore, encouragementScore.',
    'targetWordHits must only include words from the provided targetWords list when they clearly appear.',
    'repairPrompt must be short, child-friendly English when rejected.',
    'childSafetyScore should be high only when the answer is safe, age-appropriate, and non-harmful.',
    'encouragementScore measures whether the child made enough effort to merit warm positive reinforcement.',
  ].join(' ');

  const userPayload = {
    scenarioId: request.scenarioId,
    nodeId: request.nodeId,
    rawText: request.rawText,
    nodeText: request.nodeText,
    targetWords: request.targetWords.slice(0, 20),
    targetPatterns: request.targetPatterns?.slice(0, 6) ?? [],
    responseExamples: request.responseExamples?.slice(0, 6) ?? [],
    slots: request.slots ?? {},
    defaultNextNodeId: request.defaultNextNodeId ?? null,
    config: request.config
      ? {
          strategy: request.config.strategy,
          domain: request.config.domain,
          slotKey: request.config.slotKey,
          marksPattern: request.config.marksPattern ?? [],
        }
      : null,
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(userPayload) }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      'internal',
      `Gemini evaluator request failed for ${model}: ${response.status} ${errorText.slice(0, 200)}`,
    );
  }

  const body = (await response.json()) as GeminiGenerateContentResponse;
  const content = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
  if (!content) {
    throw new HttpsError('internal', `Gemini evaluator returned an empty response for ${model}`);
  }

  try {
    return JSON.parse(extractJsonObject(content)) as ModelEvaluationPayload;
  } catch (error) {
    throw new HttpsError('internal', `Gemini evaluator returned invalid JSON for ${model}`, {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function normalizeScore(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeRubricDimensions(
  dimensions: ModelEvaluationPayload['rubricDimensions'],
  accepted: boolean,
): NormalizedRubricDimensions {
  return {
    relevanceScore: normalizeScore(dimensions?.relevanceScore, accepted ? 78 : 25),
    patternAccuracyScore: normalizeScore(dimensions?.patternAccuracyScore, accepted ? 74 : 20),
    vocabularyCoverageScore: normalizeScore(
      dimensions?.vocabularyCoverageScore,
      accepted ? 70 : 15,
    ),
    childSafetyScore: normalizeScore(dimensions?.childSafetyScore, 96),
    encouragementScore: normalizeScore(dimensions?.encouragementScore, accepted ? 90 : 55),
  };
}

function computeRubricScore(dimensions: NormalizedRubricDimensions): number {
  return Math.round(
    dimensions.relevanceScore * 0.35 +
      dimensions.patternAccuracyScore * 0.25 +
      dimensions.vocabularyCoverageScore * 0.2 +
      dimensions.childSafetyScore * 0.15 +
      dimensions.encouragementScore * 0.05,
  );
}

async function evaluateWithRouting(
  request: EvaluateOpenEndedConversationReq,
): Promise<{ model: string; result: ModelEvaluationPayload }> {
  const models = [DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODEL].filter(
    (model, index, items) => model.length > 0 && items.indexOf(model) === index,
  );

  let lastError: unknown;

  for (const model of models) {
    try {
      const result = await callOpenAI(request, model);
      return { model, result };
    } catch (error) {
      lastError = error;
      const status = error instanceof HttpsError ? error.httpErrorCode.status : undefined;
      const canFallback =
        model !== models[models.length - 1] && (status === 429 || status === 500 || status === 503);
      if (!canFallback) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini model routing failed');
}

export const evaluateOpenEndedConversation = onCall(
  {
    ...callableOpts,
    secrets: [geminiApiKey],
  },
  async (request): Promise<EvaluateOpenEndedConversationRes> => {
    const uid = requireAuth(request);
    await checkRateLimit(uid, 'evaluateOpenEndedConversation', RATE_LIMITS.read);

    const data = request.data as EvaluateOpenEndedConversationReq;
    const rawText = data.rawText?.trim();
    if (!rawText) {
      throw new HttpsError('invalid-argument', 'rawText is required');
    }

    const nextNodeId = data.config?.nextNodeId ?? data.defaultNextNodeId ?? null;
    if (!nextNodeId) {
      throw new HttpsError('invalid-argument', 'A next node is required for remote evaluation');
    }

    const { model, result: modelResult } = await evaluateWithRouting({
      ...data,
      rawText,
    });

    const accepted = Boolean(modelResult.accepted);
    const targetWordHits = filterTargetWordHits(modelResult.targetWordHits, data.targetWords);
    const slotValue = modelResult.slotValue?.trim() || '';
    const dimensions = normalizeRubricDimensions(modelResult.rubricDimensions, accepted);
    const marksPattern = modelResult.matchedPattern
      ? ((data.config?.marksPattern?.length
          ? data.config.marksPattern
          : data.targetPatterns?.slice(0, 1)) ?? [])
      : [];

    return {
      accepted,
      source: 'llm',
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
        score: computeRubricScore(dimensions),
        rationale: modelResult.rationale?.trim() || 'Accepted by remote evaluator.',
        dimensions,
      },
      repairPrompt: accepted
        ? undefined
        : modelResult.repairPrompt?.trim() || 'Try answering with the target pattern.',
    };
  },
);
