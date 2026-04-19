import { evaluateOpenEndedConversation } from '@/services/firebase/functions';
import type { ConversationOpenEndedConfig } from '../types/conversationScenario';
import { resolveOpenEndedResponse, type OpenEndedResolution } from './resolveOpenEndedResponse';

export interface OpenEndedRubricAssessment {
  matchedPattern: boolean;
  targetWordHits: string[];
  score: number;
  rationale: string;
  dimensions: {
    relevanceScore: number;
    patternAccuracyScore: number;
    vocabularyCoverageScore: number;
    childSafetyScore: number;
    encouragementScore: number;
  };
}

export interface OpenEndedTurnRequest {
  rawText: string;
  scenarioId?: string;
  nodeId: string;
  nodeText?: string;
  config?: ConversationOpenEndedConfig;
  targetWords: string[];
  targetPatterns?: string[];
  slots?: Record<string, string>;
  defaultNextNodeId?: string | null;
  responseExamples?: string[];
}

export interface OpenEndedTurnEvaluation {
  accepted: boolean;
  source: 'local_rule' | 'llm';
  resolution: OpenEndedResolution | null;
  rubric: OpenEndedRubricAssessment;
  repairPrompt?: string;
  /** Child-friendly coaching line Nova should speak when the answer is rejected. */
  novaResponseText?: string;
}

export interface OpenEndedConversationService {
  evaluateTurn(request: OpenEndedTurnRequest): Promise<OpenEndedTurnEvaluation>;
}

function buildRejectedEvaluation(rationale: string): OpenEndedTurnEvaluation {
  return {
    accepted: false,
    source: 'local_rule',
    resolution: null,
    rubric: {
      matchedPattern: false,
      targetWordHits: [],
      score: 0,
      rationale,
      dimensions: {
        relevanceScore: 0,
        patternAccuracyScore: 0,
        vocabularyCoverageScore: 0,
        childSafetyScore: 100,
        encouragementScore: 40,
      },
    },
    repairPrompt: 'Try saying it with the target pattern.',
  };
}

function buildLocalRubric(
  request: OpenEndedTurnRequest,
  resolution: OpenEndedResolution | null,
): OpenEndedRubricAssessment {
  const matchedPattern = Boolean(
    resolution && (resolution.marksPattern.length > 0 || request.config?.enabled),
  );
  const targetWordHits = resolution?.markedTargetWords ?? [];
  const score = resolution ? Math.min(100, 60 + targetWordHits.length * 20) : 0;
  const dimensions = resolution
    ? {
        relevanceScore: 82,
        patternAccuracyScore: matchedPattern ? 78 : 52,
        vocabularyCoverageScore: Math.min(100, 50 + targetWordHits.length * 25),
        childSafetyScore: 100,
        encouragementScore: 92,
      }
    : {
        relevanceScore: 18,
        patternAccuracyScore: 15,
        vocabularyCoverageScore: 10,
        childSafetyScore: 100,
        encouragementScore: 45,
      };
  return {
    matchedPattern,
    targetWordHits,
    score,
    rationale: resolution
      ? 'Accepted by local open-ended parser and rubric.'
      : 'Local open-ended parser could not safely map the answer.',
    dimensions,
  };
}

export const localOpenEndedConversationService: OpenEndedConversationService = {
  async evaluateTurn(request) {
    if (!request.config) {
      return buildRejectedEvaluation('Local evaluator requires explicit open-ended config.');
    }

    const resolution = resolveOpenEndedResponse({
      rawText: request.rawText,
      config: request.config,
    });

    return {
      accepted: Boolean(resolution),
      source: 'local_rule',
      resolution,
      rubric: buildLocalRubric(request, resolution),
      repairPrompt: resolution ? undefined : 'Try saying it with the target pattern.',
    };
  },
};

export const remoteOpenEndedConversationService: OpenEndedConversationService = {
  async evaluateTurn(request) {
    if (!request.config && !request.defaultNextNodeId) {
      return buildRejectedEvaluation('Remote evaluator requires a continuation target.');
    }

    return evaluateOpenEndedConversation({
      rawText: request.rawText,
      scenarioId: request.scenarioId,
      nodeId: request.nodeId,
      nodeText: request.nodeText,
      targetWords: request.targetWords,
      targetPatterns: request.targetPatterns,
      slots: request.slots,
      defaultNextNodeId: request.defaultNextNodeId,
      responseExamples: request.responseExamples,
      config: request.config,
    });
  },
};

const configuredProvider = (
  (import.meta.env.VITE_OPEN_ENDED_EVALUATOR as string | undefined) ?? 'local'
)
  .trim()
  .toLowerCase();

export const openEndedConversationService: OpenEndedConversationService = {
  async evaluateTurn(request) {
    const localResult = await localOpenEndedConversationService.evaluateTurn(request);
    if (localResult.accepted) {
      return localResult;
    }

    const wantsRemote = configuredProvider === 'remote' || configuredProvider === 'hybrid';
    if (!wantsRemote) {
      return localResult;
    }

    try {
      return await remoteOpenEndedConversationService.evaluateTurn(request);
    } catch (error) {
      console.warn(
        '[openEndedConversationService] Remote evaluator failed, falling back to local result.',
        {
          provider: configuredProvider,
          scenarioId: request.scenarioId,
          nodeId: request.nodeId,
          reason: error instanceof Error ? error.message : String(error),
        },
      );
      return localResult;
    }
  },
};
