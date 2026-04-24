/**
 * NovaLingo Cloud Functions — Entry Point
 *
 * Firebase Cloud Functions v2, europe-west1 region.
 * All callable, trigger, and scheduled functions exported here.
 */

// Callable functions (client-invoked)
export { claimQuestReward } from './callables/claimQuestReward';
export { createChildProfile } from './callables/createChildProfile';
export { deleteAccount } from './callables/deleteAccount';
export { deleteChildProfile } from './callables/deleteChildProfile';
export { evaluateOpenEndedConversation } from './callables/evaluateOpenEndedConversation';
export { getLeaderboard } from './callables/getLeaderboard';
export { purchaseShopItem } from './callables/purchaseShopItem';
export { registerAndroidPurchase } from './callables/registerAndroidPurchase';
export { setParentPin } from './callables/setParentPin';
export { spinDailyWheel } from './callables/spinDailyWheel';
export { submitLessonResult } from './callables/submitLessonResult';
export { syncOfflineProgress } from './callables/syncOfflineProgress';
export { updateChildProfile } from './callables/updateChildProfile';
export { updateVocabulary } from './callables/updateVocabulary';
export { useStreakFreeze } from './callables/useStreakFreeze';
export { verifyParentPin } from './callables/verifyParentPin';

// Firestore triggers
export { onAchievementUnlocked } from './triggers/onAchievementUnlocked';
export { onLessonCompleted } from './triggers/onLessonCompleted';
export { onStreakUpdate } from './triggers/onStreakUpdate';
export { onUserCreated } from './triggers/onUserCreated';

// Scheduled functions
export { cleanupExpiredCache } from './scheduled/cleanup';
export { resetDailyQuests } from './scheduled/resetDailyQuests';
export { srsReviewReminder } from './scheduled/srsReviewReminder';
export { streakCheckMidnight } from './scheduled/streakCheck';
export { streakDangerReminder } from './scheduled/streakDangerReminder';
export { updateLeaderboards } from './scheduled/updateLeaderboards';
export { weeklyReport } from './scheduled/weeklyReport';

// HTTP endpoints
export { appleNotification } from './http/appleNotification';
export { googleNotification } from './http/googleNotification';
export { healthCheck } from './http/healthCheck';
