/**
 * Learning Data — Barrel exports
 */

export { generateActivities } from './activityGenerator';
export {
  ALL_CHUNKS,
  CORE_CHUNKS,
  STARTER_CHUNKS,
  STRETCH_CHUNKS,
  getChunksByBand,
  getChunksByFunction,
  getChunksByWorld,
} from './chunkBank';
export type { Chunk } from './chunkBank';
export {
  ALL_CONVERSATION_SCENARIOS,
  PHASE1_CONVERSATION_SCENARIOS,
  PHASE2_CONVERSATION_SCENARIOS,
  PHASE3_CONVERSATION_SCENARIOS,
  PHASE4_CONVERSATION_SCENARIOS,
  PHASE5_CONVERSATION_SCENARIOS,
  getConversationScenarioById,
  isConversationScenarioValid,
  selectConversationScenario,
  toConversationActivityData,
  validateConversationScenario,
} from './conversations';
export type {
  ConversationAgeBand,
  ConversationDifficulty,
  ConversationScenario,
  ConversationScenarioValidationIssue,
  SelectConversationScenarioParams,
} from './conversations';
export {
  curriculum,
  getCurriculumStats,
  getLesson,
  getTotalVocabularyCount,
  getWorld,
  getWorldLessons,
} from './curriculum';
export type { CurriculumLesson, CurriculumUnit, CurriculumWorld } from './curriculum';
export { getMockActivities } from './mockLessons';
