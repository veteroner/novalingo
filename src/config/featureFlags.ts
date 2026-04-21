/**
 * Feature Flags
 *
 * Runtime feature toggles for gradual rollout, A/B testing,
 * and conditional feature availability.
 */

export interface FeatureFlags {
  /** Speech recognition for pronunciation activities */
  speechRecognition: boolean;
  /** AI-powered Nova companion chat */
  novaAIChat: boolean;
  /** Daily spin wheel */
  dailyWheel: boolean;
  /** Social leaderboard */
  leaderboard: boolean;
  /** In-app chat between learners */
  peerChat: boolean;
  /** Push notifications */
  pushNotifications: boolean;
  /** Offline mode with content caching */
  offlineMode: boolean;
  /** Parent dashboard */
  parentDashboard: boolean;
  /** Collection system */
  collectionSystem: boolean;
  /** Story mode activities */
  storyMode: boolean;
  /** Multiplayer mini-games */
  multiplayerGames: boolean;
  /** AR-based activities */
  arActivities: boolean;
  /** New registry-backed conversation content system */
  conversationScenarioRegistry: boolean;
}

/**
 * Default feature flags for production.
 * Override via Firebase Remote Config.
 */
export const defaultFeatureFlags: FeatureFlags = {
  speechRecognition: true, // P0 launch — main differentiator vs competitors
  novaAIChat: false, // Phase 3
  dailyWheel: true,
  leaderboard: true,
  peerChat: false, // Phase 4
  pushNotifications: true,
  offlineMode: true,
  parentDashboard: true,
  collectionSystem: true,
  storyMode: true, // Enabled — Phase 1 stories available
  multiplayerGames: false, // Phase 4
  arActivities: false, // Phase 5
  conversationScenarioRegistry: true,
};

/**
 * Development overrides — more features enabled for testing.
 */
export const devFeatureFlags: Partial<FeatureFlags> = {
  speechRecognition: true,
  novaAIChat: true,
  storyMode: true,
  conversationScenarioRegistry: true,
};

/**
 * Resolves feature flags based on environment.
 * In production, these will be overridden by Firebase Remote Config.
 */
export function resolveFeatureFlags(
  env: 'development' | 'production' | 'test' = 'production',
  remoteOverrides?: Partial<FeatureFlags>,
): FeatureFlags {
  const base = { ...defaultFeatureFlags };

  if (env === 'development' || env === 'test') {
    Object.assign(base, devFeatureFlags);
  }

  if (remoteOverrides) {
    Object.assign(base, remoteOverrides);
  }

  return base;
}
