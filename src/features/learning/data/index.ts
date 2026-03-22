/**
 * Learning Data — Barrel exports
 */

export { generateActivities } from './activityGenerator';
export {
  getConversationScenarioById, isConversationScenarioValid, PHASE1_CONVERSATION_SCENARIOS, selectConversationScenario,
  toConversationActivityData,
  validateConversationScenario
} from './conversations';
export type {
  ConversationAgeBand,
  ConversationDifficulty,
  ConversationScenario,
  ConversationScenarioValidationIssue,
  SelectConversationScenarioParams
} from './conversations';
export {
  curriculum,
  getCurriculumStats,
  getLesson,
  getTotalVocabularyCount,
  getWorld,
  getWorldLessons
} from './curriculum';
export type { CurriculumLesson, CurriculumUnit, CurriculumWorld } from './curriculum';
export { getMockActivities } from './mockLessons';

