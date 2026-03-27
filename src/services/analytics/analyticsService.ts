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

// ===== USER PROPERTIES =====

/**
 * Set anonymous user properties (COPPA-safe).
 */
export function setAnalyticsUserProperties(props: {
  ageGroup?: string;
  deviceType?: 'web' | 'ios' | 'android';
}): void {
  if (!analytics) return;
  try {
    setUserProperties(analytics, {
      age_group: props.ageGroup ?? 'unknown',
      device_type: props.deviceType ?? 'web',
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
}): void {
  logEvent('conversation_turn_completed', {
    scenario_id: params.scenarioId,
    node_id: params.nodeId,
    matched: params.matched,
    hint_used: params.hintUsed,
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
}): void {
  logEvent('conversation_completed', {
    scenario_id: params.scenarioId,
    theme: params.theme,
    score: params.score,
    passed: params.passed,
    duration_seconds: params.durationSeconds,
    accepted_turns: params.acceptedTurns,
    hinted_turns: params.hintedTurns,
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
