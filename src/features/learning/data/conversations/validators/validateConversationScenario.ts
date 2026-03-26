import type { ConversationScenario } from '../types/conversationScenario';

export interface ConversationScenarioValidationIssue {
  code:
    | 'missing_title'
    | 'missing_theme'
    | 'missing_entry_node'
    | 'duplicate_node_id'
    | 'missing_node_reference'
    | 'missing_terminal_node'
    | 'empty_response_variants'
    | 'missing_target_words';
  message: string;
  nodeId?: string;
}

export function validateConversationScenario(
  scenario: ConversationScenario,
): ConversationScenarioValidationIssue[] {
  const issues: ConversationScenarioValidationIssue[] = [];

  if (!scenario.title.trim() || !scenario.titleTr.trim()) {
    issues.push({
      code: 'missing_title',
      message: 'Scenario title and translation are required.',
    });
  }

  if (!scenario.theme.trim()) {
    issues.push({
      code: 'missing_theme',
      message: 'Scenario theme is required.',
    });
  }

  if (scenario.targetWords.length === 0) {
    issues.push({
      code: 'missing_target_words',
      message: 'Scenario must declare at least one target word.',
    });
  }

  const nodeIds = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const node of scenario.nodes) {
    if (nodeIds.has(node.id)) {
      duplicateIds.add(node.id);
    }
    nodeIds.add(node.id);

    for (const response of node.responses ?? []) {
      if ((response.acceptedVariants ?? []).length === 0) {
        issues.push({
          code: 'empty_response_variants',
          message: `Response rule ${response.id} must define accepted variants.`,
          nodeId: node.id,
        });
      }
    }
  }

  for (const duplicateId of duplicateIds) {
    issues.push({
      code: 'duplicate_node_id',
      message: `Duplicate node id found: ${duplicateId}`,
      nodeId: duplicateId,
    });
  }

  if (!nodeIds.has(scenario.entryNodeId)) {
    issues.push({
      code: 'missing_entry_node',
      message: `Entry node ${scenario.entryNodeId} does not exist.`,
      nodeId: scenario.entryNodeId,
    });
  }

  for (const node of scenario.nodes) {
    if (node.next && !nodeIds.has(node.next)) {
      issues.push({
        code: 'missing_node_reference',
        message: `Node ${node.id} points to missing next node ${node.next}.`,
        nodeId: node.id,
      });
    }

    for (const response of node.responses ?? []) {
      if (response.nextNodeId && !nodeIds.has(response.nextNodeId)) {
        issues.push({
          code: 'missing_node_reference',
          message: `Response ${response.id} points to missing node ${response.nextNodeId}.`,
          nodeId: node.id,
        });
      }
    }
  }

  const hasTerminalNode = scenario.nodes.some((node) => {
    if (node.next) return false;
    if (!node.responses || node.responses.length === 0) return true;
    return node.responses.every((response) => !response.nextNodeId);
  });

  if (!hasTerminalNode) {
    issues.push({
      code: 'missing_terminal_node',
      message: 'Scenario must contain at least one terminal node.',
    });
  }

  return issues;
}

export function isConversationScenarioValid(scenario: ConversationScenario): boolean {
  return validateConversationScenario(scenario).length === 0;
}
