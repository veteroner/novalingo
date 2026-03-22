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
    nextNodeId: `${nodeId}__${response.id}__child`,
    emoji: response.emoji,
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

  // ESLint infers this array as any[] here despite the explicit local type and TS success.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    next: response.nextNodeId,
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
  };
}
