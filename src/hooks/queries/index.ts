/**
 * TanStack Query Hooks — Barrel Export
 */

// Child profile hooks
export {
  childKeys,
  useChild,
  useChildren,
  useCreateChild,
  useDeleteChild,
  useUpdateChild,
} from './useChildQueries';

// Lesson hooks
export {
  lessonKeys,
  useLessonProgress,
  useLessonProgressDetail,
  useLessons,
  useSubmitLesson,
  useVocabularyCards,
  useWorldLessons,
  useWorlds,
} from './useLessonQueries';

// Gamification hooks
export {
  gamificationKeys,
  useAchievementCatalog,
  useAchievements,
  useClaimQuestReward,
  useCollectibles,
  useDailyQuests,
  useInventory,
  useLeaderboard,
  usePurchaseItem,
  useShopItems,
  useSpinWheel,
  useStreakFreezeAction,
  useUpdateVocabulary,
} from './useGamificationQueries';

// Parent hooks
export { parentKeys, useParentSettings, useSaveParentSettings } from './useParentQueries';
