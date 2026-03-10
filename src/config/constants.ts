/**
 * App Constants
 *
 * Magic numbers, limits, durations, and system-wide configuration values.
 */

// ─── App ─────────────────────────────────────────────────────────
export const APP_NAME = 'NovaLingo';
export const APP_VERSION = '1.0.0';
export const APP_BUNDLE_ID = 'com.novalingo.app';
export const SUPPORT_EMAIL = 'support@novalingo.app';
export const PRIVACY_POLICY_URL = 'https://novalingo.app/privacy';
export const TERMS_OF_SERVICE_URL = 'https://novalingo.app/terms';

// ─── Age Groups ──────────────────────────────────────────────────
export const AGE_GROUPS = {
  cubs: { min: 4, max: 6, label: 'Minikler' },
  stars: { min: 7, max: 9, label: 'Yıldızlar' },
  legends: { min: 10, max: 12, label: 'Efsaneler' },
} as const;

// ─── XP & Leveling ──────────────────────────────────────────────
export const XP = {
  BASE_PER_ACTIVITY: 10,
  PERFECT_MULTIPLIER: 1.5,
  SPEED_BONUS_THRESHOLD: 0.7, // complete in <70% of time limit
  SPEED_MULTIPLIER: 1.2,
  STREAK_BONUS_PER_DAY: 0.05, // +5% per day, max 50%
  STREAK_BONUS_MAX: 0.5,
  FIRST_TRY_BONUS: 5,
  NO_HINT_BONUS: 3,
  LEVEL_BASE: 100,
  LEVEL_GROWTH: 1.5,
  MAX_LEVEL: 100,
} as const;

// ─── Currency ────────────────────────────────────────────────────
export const CURRENCY = {
  STARS_PER_LESSON: 5,
  STARS_PERFECT_BONUS: 10,
  GEMS_DAILY_QUEST: 5,
  GEMS_ACHIEVEMENT: 10,
  GEMS_WEEKLY_BONUS: 25,
} as const;

// ─── Streaks ─────────────────────────────────────────────────────
export const STREAK = {
  FREEZE_MAX: 3,
  MILESTONE_DAYS: [7, 14, 30, 60, 90, 180, 365],
  GRACE_PERIOD_HOURS: 6, // extra hours before streak resets
} as const;

// ─── Lessons ─────────────────────────────────────────────────────
export const LESSON = {
  ACTIVITIES_PER_LESSON: 8,
  MIN_STARS_TO_PASS: 1,
  MAX_STARS: 3,
  STAR_THRESHOLDS: [0.6, 0.8, 1.0], // 1 star: 60%, 2 stars: 80%, 3 stars: 100%
  TIME_PER_ACTIVITY_SEC: 30,
  MAX_HINTS: 3,
  PERFECT_ACCURACY: 1.0,
  RETRY_DELAY_MS: 1500,
} as const;

// ─── Daily Limits (Free tier) ────────────────────────────────────
export const FREE_TIER = {
  DAILY_LESSONS: 3,
  DAILY_AD_REWARDS: 5,
  MAX_CHILD_PROFILES: 1,
} as const;

export const PREMIUM_TIER = {
  DAILY_LESSONS: Infinity,
  DAILY_AD_REWARDS: 0,
  MAX_CHILD_PROFILES: 5,
} as const;

// ─── Ads ─────────────────────────────────────────────────────────
export const ADS = {
  INTERSTITIAL_COOLDOWN_SEC: 300, // 5 minutes between interstitials
  INTERSTITIAL_AFTER_LESSONS: 3,
  REWARD_COOLDOWN_SEC: 120,
  MAX_INTERSTITIALS_PER_SESSION: 6,
  MAX_REWARDS_PER_DAY: 10,
} as const;

// ─── Cache & Sync ────────────────────────────────────────────────
export const CACHE = {
  STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
  GC_TIME_MS: 30 * 60 * 1000, // 30 minutes
  CONTENT_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  SYNC_DEBOUNCE_MS: 5000,
  SYNC_BATCH_SIZE: 50,
} as const;

// ─── Animation ───────────────────────────────────────────────────
export const ANIMATION = {
  SPRING_STIFF: 400,
  SPRING_DAMP: 25,
  SPRING_MASS: 1,
  PAGE_TRANSITION_MS: 300,
  REWARD_CELEBRATION_MS: 2000,
  TOAST_DURATION_MS: 3000,
  MODAL_BACKDROP_OPACITY: 0.5,
} as const;

// ─── SRS (Spaced Repetition) ────────────────────────────────────
export const SRS = {
  INITIAL_INTERVAL: 1, // days
  EASY_FACTOR: 2.5,
  HARD_FACTOR: 1.3,
  MIN_FACTOR: 1.3,
  MAX_FACTOR: 3.0,
  DAILY_REVIEW_LIMIT: 20,
} as const;

// ─── Leaderboard ─────────────────────────────────────────────────
export const LEADERBOARD = {
  PROMOTION_SLOTS: 3,
  RELEGATION_SLOTS: 3,
  SAFE_ZONE_BONUS: 0,
  REFRESH_INTERVAL_MS: 60_000, // 1 minute
  ENTRIES_PER_PAGE: 20,
} as const;

// ─── Daily Wheel ─────────────────────────────────────────────────
export const DAILY_WHEEL = {
  SEGMENT_COUNT: 8,
  SPIN_DURATION_MS: 4000,
  MIN_ROTATIONS: 3,
} as const;

// ─── Quests ──────────────────────────────────────────────────────
export const QUESTS = {
  DAILY_QUEST_COUNT: 4,
  REFRESH_HOUR: 5, // 05:00 local time
} as const;
