import type { ConversationData, ConversationNode, ConversationOption } from '@/types/content';
import type {
  ConversationNodeV2,
  ConversationResponseRule,
  ConversationScenario,
} from '../types/conversationScenario';

function toLegacyOption(nodeId: string, response: ConversationResponseRule): ConversationOption {
  return {
    text: response.expectedText,
    textTr: response.expectedTextTr,
    acceptableVariations: response.acceptedVariants,
    acceptedWords: response.acceptedWords,
    minimumConfidence: response.minimumConfidence,
    nextNodeId: `${nodeId}__${response.id}__child`,
    emoji: response.emoji,
    responseId: response.id,
    marksTargetWords: response.marksTargetWord,
    marksPatterns: response.marksPattern,
  };
}

function toLegacyOptions(
  nodeId: string,
  responses?: ConversationResponseRule[],
): ConversationOption[] | undefined {
  if (!responses || responses.length === 0) {
    return undefined;
  }

  const legacyOptions: ConversationOption[] = [];
  for (const response of responses) {
    legacyOptions.push(toLegacyOption(nodeId, response));
  }

  return legacyOptions;
}

function toLegacyNovaNode(node: ConversationNodeV2): ConversationNode {
  return {
    id: node.id,
    speaker: 'nova',
    text: node.text,
    textTr: node.textTr,
    audioUrl: node.audioUrl,
    emoji: node.emoji,
    next: node.next,
    targetWord: node.targetWord,
    options: toLegacyOptions(node.id, node.responses),
    openEnded: node.openEnded,
  };
}

function toLegacyChildEchoNode(
  nodeId: string,
  response: ConversationResponseRule,
): ConversationNode {
  return {
    id: `${nodeId}__${response.id}__child`,
    speaker: 'child',
    text: response.expectedText,
    textTr: response.expectedTextTr,
    emoji: response.emoji,
    next: response.nextNodeId ?? undefined,
  };
}

function toLegacyNodeList(nodes: ConversationNodeV2[]): ConversationNode[] {
  const legacyNodes: ConversationNode[] = [];

  for (const node of nodes) {
    if (node.speaker === 'nova') {
      legacyNodes.push(toLegacyNovaNode(node));
      if (node.responses) {
        for (const response of node.responses) {
          legacyNodes.push(toLegacyChildEchoNode(node.id, response));
        }
      }
      continue;
    }

    legacyNodes.push({
      id: node.id,
      speaker: node.speaker === 'child' ? 'child' : 'nova',
      text: node.text,
      textTr: node.textTr,
      audioUrl: node.audioUrl,
      emoji: node.emoji,
      next: node.next,
      targetWord: node.targetWord,
    });
  }

  return legacyNodes;
}

export function toConversationActivityData(scenario: ConversationScenario): ConversationData {
  return {
    type: 'conversation',
    title: scenario.title,
    titleTr: scenario.titleTr,
    sceneEmoji: scenario.sceneEmoji,
    nodes: toLegacyNodeList(scenario.nodes),
    startNodeId: scenario.entryNodeId,
    targetWords: scenario.targetWords,
    scenarioId: scenario.id,
    scenarioTheme: scenario.theme,
    scenarioSummary: scenario.summary,
    scenarioSummaryTr: scenario.summaryTr,
    scenarioMode: scenario.mode,
    targetPatterns: scenario.targetPatterns,
    rewardType: scenario.reward.rewardType,
    rewardId: scenario.reward.rewardId,
    successCriteria: scenario.successCriteria,
    estimatedDurationSec: scenario.estimatedDurationSec,
  };
}
