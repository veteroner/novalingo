/**
 * Analytics Service
 *
 * Firebase Analytics wrapper — kullanıcı davranış takibi.
 * COPPA uyumlu: kişisel tanımlayıcı bilgi loglanmaz.
 * Child ID hash'lenir, isim/yaş gibi veriler gönderilmez.
 */

import { analytics } from '@services/firebase/app';
import { logEvent as firebaseLogEvent, setUserProperties } from 'firebase/analytics';

// ===== COPPA-SAFE HELPER =====

/**
 * Hash a child ID to avoid PII in analytics.
 */
function hashId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

// ===== CORE LOG =====

function logEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (!analytics) return;
  try {
    firebaseLogEvent(analytics, name, params);
  } catch {
    // Silent fail — analytics should never break the app
  }
}

function normalizeRawAnswerPreview(rawAnswer: string | undefined): string | undefined {
  if (!rawAnswer) return undefined;
  return rawAnswer.trim().replace(/\s+/g, ' ').slice(0, 80) || undefined;
}

// ===== USER PROPERTIES =====

/**
 * Set anonymous user properties (COPPA-safe).
 */
export function setAnalyticsUserProperties(props: {
  ageGroup?: string;
  deviceType?: 'web' | 'ios' | 'android';
  pilotCohort?: string;
}): void {
  if (!analytics) return;
  try {
    setUserProperties(analytics, {
      age_group: props.ageGroup ?? 'unknown',
      device_type: props.deviceType ?? 'web',
      // Pilot segment (Firebase Audience'da filtrelemek için). Pilot katılımcı değilse boş kalır.
      pilot_cohort: props.pilotCohort ?? '',
    });
  } catch {
    // Silent fail
  }
}

// ===== SCREEN TRACKING =====

export function trackScreenView(screenName: string): void {
  logEvent('screen_view', { screen_name: screenName });
}

// ===== AUTH EVENTS =====

export function trackSignUp(method: 'email' | 'google' | 'apple'): void {
  logEvent('sign_up', { method });
}

export function trackLogin(method: 'email' | 'google' | 'apple'): void {
  logEvent('login', { method });
}

export function trackProfileCreated(childId: string, ageGroup: string): void {
  logEvent('profile_created', {
    child_hash: hashId(childId),
    age_group: ageGroup,
  });
}

// ===== LEARNING EVENTS =====

export function trackLessonStarted(lessonId: string, worldId: string): void {
  logEvent('lesson_started', { lesson_id: lessonId, world_id: worldId });
}

export function trackLessonCompleted(params: {
  lessonId: string;
  worldId: string;
  score: number;
  stars: number;
  durationSeconds: number;
  isPerfect: boolean;
}): void {
  logEvent('lesson_completed', {
    lesson_id: params.lessonId,
    world_id: params.worldId,
    score: params.score,
    stars: params.stars,
    duration_seconds: params.durationSeconds,
    is_perfect: params.isPerfect,
  });
}

export function trackActivityCompleted(params: {
  activityType: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
}): void {
  logEvent('activity_completed', {
    activity_type: params.activityType,
    is_correct: params.isCorrect,
    time_spent_seconds: params.timeSpentSeconds,
    hints_used: params.hintsUsed,
  });
}

// ===== GAMIFICATION EVENTS =====

export function trackXPGained(amount: number, source: string): void {
  logEvent('xp_gained', { amount, source });
}

export function trackLevelUp(newLevel: number): void {
  logEvent('level_up', { level: newLevel });
}

export function trackStreakDays(days: number): void {
  logEvent('streak_milestone', { days });
}

// ===== CONVERSATION EVENTS =====

export function trackConversationStarted(params: {
  scenarioId: string;
  theme: string;
  worldId?: string | null;
}): void {
  logEvent('conversation_started', {
    scenario_id: params.scenarioId,
    theme: params.theme,
    ...(params.worldId ? { world_id: params.worldId } : {}),
  });
}

export function trackConversationTurnCompleted(params: {
  scenarioId: string;
  nodeId: string;
  matched: boolean;
  hintUsed: boolean;
  matchSource?: 'rule' | 'open_ended_local' | 'open_ended_llm';
  rawAnswer?: string;
}): void {
  logEvent('conversation_turn_completed', {
    scenario_id: params.scenarioId,
    node_id: params.nodeId,
    matched: params.matched,
    hint_used: params.hintUsed,
    ...(params.matchSource ? { match_source: params.matchSource } : {}),
    ...(normalizeRawAnswerPreview(params.rawAnswer)
      ? { raw_answer_preview: normalizeRawAnswerPreview(params.rawAnswer) as string }
      : {}),
  });
}

export function trackConversationHintShown(params: { scenarioId: string; nodeId: string }): void {
  logEvent('conversation_hint_shown', {
    scenario_id: params.scenarioId,
    node_id: params.nodeId,
  });
}

export function trackConversationRepairUsed(params: { scenarioId: string; nodeId: string }): void {
  logEvent('conversation_repair_used', {
    scenario_id: params.scenarioId,
    node_id: params.nodeId,
  });
}

export function trackConversationCompleted(params: {
  scenarioId: string;
  theme: string;
  score: number;
  passed: boolean;
  durationSeconds: number;
  acceptedTurns: number;
  hintedTurns: number;
  rawAnswerCount?: number;
  rawAnswerPreview?: string;
}): void {
  logEvent('conversation_completed', {
    scenario_id: params.scenarioId,
    theme: params.theme,
    score: params.score,
    passed: params.passed,
    duration_seconds: params.durationSeconds,
    accepted_turns: params.acceptedTurns,
    hinted_turns: params.hintedTurns,
    ...(params.rawAnswerCount != null ? { raw_answer_count: params.rawAnswerCount } : {}),
    ...(normalizeRawAnswerPreview(params.rawAnswerPreview)
      ? { raw_answer_preview: normalizeRawAnswerPreview(params.rawAnswerPreview) as string }
      : {}),
  });
}

export function trackConversationLegacyFallback(): void {
  logEvent('conversation_legacy_fallback');
}

export function trackAchievementUnlocked(achievementId: string): void {
  logEvent('achievement_unlocked', { achievement_id: achievementId });
}

export function trackQuestCompleted(questId: string, reward: string): void {
  logEvent('quest_completed', { quest_id: questId, reward });
}

// ===== CONTENT USAGE EVENTS =====

export function trackStoryLibraryOpened(): void {
  logEvent('story_library_opened');
}

export function trackStoryOpened(params: { storyId: string; worldId: string }): void {
  logEvent('story_opened', { story_id: params.storyId, world_id: params.worldId });
}

export function trackStoryCompleted(params: { storyId: string; worldId: string }): void {
  logEvent('story_completed', { story_id: params.storyId, world_id: params.worldId });
}

export function trackLessonContentFallbackUsed(params: {
  lessonId: string;
  word: string;
  fallbackKind: 'synthetic_vocab';
  hasEmoji: boolean;
}): void {
  logEvent('lesson_content_fallback_used', {
    lesson_id: params.lessonId,
    word: params.word.slice(0, 48),
    fallback_kind: params.fallbackKind,
    has_emoji: params.hasEmoji,
  });
}

export function trackLessonContentFallbackSummary(params: {
  lessonId: string;
  worldId: string;
  fallbackWordCount: number;
  fallbackWithEmojiCount: number;
  totalVocabularyWords: number;
}): void {
  logEvent('lesson_content_fallback_summary', {
    lesson_id: params.lessonId,
    world_id: params.worldId,
    fallback_word_count: params.fallbackWordCount,
    fallback_with_emoji_count: params.fallbackWithEmojiCount,
    total_vocabulary_words: params.totalVocabularyWords,
  });
}

// ===== MONETIZATION EVENTS =====

export function trackPurchase(params: {
  itemId: string;
  currency: 'stars' | 'gems';
  amount: number;
}): void {
  logEvent('virtual_purchase', {
    item_id: params.itemId,
    currency: params.currency,
    amount: params.amount,
  });
}

export function trackPurchaseEvent(itemId: string, currency: string): void {
  logEvent('purchase_event', { item_id: itemId, currency });
}

export function trackSubscriptionPaywallViewed(params: {
  source: string;
  isPremium: boolean;
}): void {
  logEvent('subscription_paywall_viewed', {
    source: params.source,
    is_premium: params.isPremium,
  });
}

export function trackSubscriptionTrialStarted(planId: string, platform: string): void {
  logEvent('subscription_trial_started', {
    plan_id: planId,
    platform,
  });
}

export function trackSubscriptionPurchaseCompleted(params: {
  planId: string;
  platform: string;
  status: 'success' | 'pending';
}): void {
  logEvent('subscription_purchase_completed', {
    plan_id: params.planId,
    platform: params.platform,
    status: params.status,
  });
}

export function trackSubscriptionRestoreCompleted(platform: string): void {
  logEvent('subscription_restore_completed', { platform });
}

export function trackSubscriptionRestoreFailed(platform: string, reason: string): void {
  logEvent('subscription_restore_failed', {
    platform,
    reason: reason.slice(0, 80),
  });
}

export function trackSubscriptionStatusSynced(params: {
  state: string;
  platform?: string | null;
}): void {
  logEvent('subscription_status_synced', {
    state: params.state,
    ...(params.platform ? { platform: params.platform } : {}),
  });
}

export function trackSubscriptionBillingIssue(params: {
  state: string;
  platform?: string | null;
}): void {
  logEvent('subscription_billing_issue', {
    state: params.state,
    ...(params.platform ? { platform: params.platform } : {}),
  });
}

export function trackSubscriptionChurn(params: {
  state: string;
  platform?: string | null;
  reason?: string;
}): void {
  logEvent('subscription_churn', {
    state: params.state,
    ...(params.platform ? { platform: params.platform } : {}),
    ...(params.reason ? { reason: params.reason.slice(0, 80) } : {}),
  });
}

// ===== ENGAGEMENT EVENTS =====

export function trackDailyWheelSpin(reward: string): void {
  logEvent('daily_wheel_spin', { reward });
}

export function trackNovaEvolution(oldStage: string, newStage: string): void {
  logEvent('nova_evolution', { old_stage: oldStage, new_stage: newStage });
}

export function trackOfflineSync(actionCount: number, success: boolean): void {
  logEvent('offline_sync', { action_count: actionCount, success });
}

// ===== ERROR TRACKING =====

export function trackError(error: string, context: string): void {
  logEvent('app_error', {
    error: error.slice(0, 100), // Truncate for analytics limits
    context,
  });
}

// ===== RETENTION FUNNEL =====

/**
 * Fires once when a child completes their very first lesson.
 * Funnel: Registration → first_lesson_completed → day_7_active
 */
export function trackFirstLessonCompleted(childId: string): void {
  logEvent('first_lesson_completed', { child_hash: hashId(childId) });
}

/**
 * Fires when a child is active on a key retention day (1, 3, 7, 14, 30).
 * De-duplication is handled by the caller via localStorage.
 */
export function trackRetentionDay(day: number, childId: string): void {
  logEvent('retention_day_active', { day, child_hash: hashId(childId) });
}
