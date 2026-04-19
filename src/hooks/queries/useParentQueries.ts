/**
 * Parent TanStack Query Hooks
 *
 * Ebeveyn ayarları okuma/kaydetme + çocuk öğrenme çıktı metrikleri.
 */

import { curriculum, getLesson } from '@/features/learning/data/curriculum';
import {
  aggregateOutcomeTags,
  getOutcomeLabel,
  type OutcomeMetrics,
} from '@/features/learning/services/outcomeTagService';
import type { LessonProgress } from '@/types/progress';
import {
  collections,
  docs,
  getDocument,
  queryCollection,
  updateDocument,
} from '@services/firebase/firestore';
import { useAuthStore } from '@stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ParentSettings {
  dailyLimit: number;
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    achievementAlert: boolean;
    inactivityAlert: boolean;
  };
  contentFilter: {
    socialFeatures: boolean;
    leaderboard: boolean;
    chatEnabled: boolean;
  };
}

const defaultSettings: ParentSettings = {
  dailyLimit: 30,
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    achievementAlert: true,
    inactivityAlert: false,
  },
  contentFilter: {
    socialFeatures: true,
    leaderboard: true,
    chatEnabled: false,
  },
};

export const parentKeys = {
  settings: (uid: string) => ['parentSettings', uid] as const,
  outcomeMetrics: (childId: string) => ['outcomeMetrics', childId] as const,
  canDoStatements: (childId: string) => ['canDoStatements', childId] as const,
  conversationHighlights: (childId: string) => ['conversationHighlights', childId] as const,
  conversationThemeProgress: (childId: string) => ['conversationThemeProgress', childId] as const,
  weeklyProgress: (childId: string) => ['weeklyProgress', childId] as const,
  weakTopics: (childId: string) => ['weakTopics', childId] as const,
  learningStats: (childId: string) => ['learningStats', childId] as const,
  efficacyIndicators: (childId: string) => ['efficacyIndicators', childId] as const,
};

export interface CanDoStatements {
  lessonStatements: string[];
  unitStatements: string[];
  conversationStatements: string[];
  evidenceCount: number;
}

const EMPTY_CAN_DO: CanDoStatements = {
  lessonStatements: [],
  unitStatements: [],
  conversationStatements: [],
  evidenceCount: 0,
};

interface ParentConversationEvidence {
  scenarioId?: string;
  scenarioTheme?: string;
  acceptedTurns: number;
  hintedTurns: number;
  passed: boolean;
  score: number;
  targetWordsHit: string[];
  patternsHit: string[];
  rawChildResponses?: string[];
}

interface DatedConversationEvidence extends ParentConversationEvidence {
  completedAtMs: number;
}

function formatConversationEvidenceStatement(evidence: ParentConversationEvidence): string | null {
  const theme = evidence.scenarioTheme?.trim();

  if (evidence.patternsHit.length > 0) {
    const patternLabel = evidence.patternsHit.slice(0, 2).join(', ');
    return theme
      ? `${theme} konuşmasında ${patternLabel} kalıplarını kullandı.`
      : `${patternLabel} kalıplarını konuşmada kullandı.`;
  }

  if (evidence.targetWordsHit.length > 0) {
    const wordLabel = evidence.targetWordsHit.slice(0, 3).join(', ');
    return theme
      ? `${theme} konuşmasında ${wordLabel} kelimelerini doğru kullandı.`
      : `${wordLabel} kelimelerini konuşmada doğru kullandı.`;
  }

  return null;
}

function getRawAnswerPreview(rawChildResponses: string[] | undefined): string | null {
  const preview = (rawChildResponses ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' • ');

  return preview || null;
}

function getConversationEvidenceFromRecord(record: LessonProgress): DatedConversationEvidence[] {
  const evidences = (record.conversationEvidence ?? []) as ParentConversationEvidence[];

  return evidences.map((evidence) => ({
    scenarioId: evidence.scenarioId,
    scenarioTheme: evidence.scenarioTheme,
    acceptedTurns: evidence.acceptedTurns,
    hintedTurns: evidence.hintedTurns,
    passed: evidence.passed,
    score: evidence.score,
    targetWordsHit: evidence.targetWordsHit,
    patternsHit: evidence.patternsHit,
    rawChildResponses: evidence.rawChildResponses,
    completedAtMs: record.completedAt.toMillis(),
  }));
}

function collectConversationEvidence(records: LessonProgress[]): DatedConversationEvidence[] {
  return records.flatMap(getConversationEvidenceFromRecord);
}

export interface WeeklyProgress {
  lessonsThisWeek: number;
  lessonsLastWeek: number;
  avgAccuracyThisWeek: number; // 0-1
  totalXpThisWeek: number;
  totalMinutesThisWeek: number;
  streakDays: number; // distinct calendar days with at least one lesson in last 7 days
  perfectLessonsThisWeek: number;
  speakingLessonsThisWeek: number; // lessons containing speak-it or conversation activities
}

export interface ConversationHighlight {
  id: string;
  scenarioId?: string;
  scenarioTheme?: string;
  acceptedTurns: number;
  hintedTurns: number;
  passed: boolean;
  score: number;
  targetWordsHit: string[];
  patternsHit: string[];
  rawChildResponses?: string[];
  rawAnswerPreview?: string;
  completedAtMs: number;
}

export interface ConversationThemeProgress {
  theme: string;
  attempts: number;
  successRate: number;
  averageScore: number;
  averageAcceptedTurns: number;
  averageHints: number;
  recentWords: string[];
  recentUtterances?: string[];
}

export function useParentSettings() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);

  return useQuery({
    queryKey: parentKeys.settings(uid ?? ''),
    queryFn: async (): Promise<ParentSettings> => {
      if (!uid) return defaultSettings;
      const userData = await getDocument<{ settings?: Record<string, unknown> }>(docs.user(uid));
      if (!userData?.settings) return defaultSettings;
      const s = userData.settings;
      return {
        dailyLimit: typeof s.dailyLimit === 'number' ? s.dailyLimit : defaultSettings.dailyLimit,
        notifications: {
          ...defaultSettings.notifications,
          ...(s.notifications && typeof s.notifications === 'object' ? s.notifications : {}),
        },
        contentFilter: {
          ...defaultSettings.contentFilter,
          ...(s.contentFilter && typeof s.contentFilter === 'object' ? s.contentFilter : {}),
        },
      };
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveParentSettings() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ParentSettings) => {
      if (!uid) throw new Error('Not authenticated');
      await updateDocument(docs.user(uid), { settings });
    },
    onSuccess: () => {
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: parentKeys.settings(uid) });
      }
    },
  });
}

// ===== CHILD OUTCOME METRICS =====

/**
 * Aggregates all completed lesson `outcomeTag` values for the given child into
 * an `OutcomeMetrics` object, ready for the parent dashboard.
 */
export function useOutcomeMetrics(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.outcomeMetrics(childId ?? ''),
    queryFn: async (): Promise<OutcomeMetrics> => {
      if (!childId) return aggregateOutcomeTags([]);
      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );
      const tags = records
        .map((r) => getLesson(r.lessonId)?.outcomeTag)
        .filter((tag): tag is string => !!tag);
      return aggregateOutcomeTags(tags);
    },
    enabled: !!childId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCanDoStatements(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.canDoStatements(childId ?? ''),
    queryFn: async (): Promise<CanDoStatements> => {
      if (!childId) return EMPTY_CAN_DO;

      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );

      if (records.length === 0) return EMPTY_CAN_DO;

      const sorted = records
        .slice()
        .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis());

      const completedLessonIds = new Set(sorted.map((record) => record.lessonId));
      const masteredLessonIds = new Set(
        sorted.filter((record) => record.accuracy >= 0.75).map((record) => record.lessonId),
      );

      const lessonStatements: string[] = [];
      for (const record of sorted) {
        if (!masteredLessonIds.has(record.lessonId)) continue;

        const canDo = getLesson(record.lessonId)?.canDo?.trim();
        if (!canDo || lessonStatements.includes(canDo)) continue;

        lessonStatements.push(canDo);
        if (lessonStatements.length >= 4) break;
      }

      const unitStatements: string[] = [];
      for (const world of curriculum) {
        for (const unit of world.units) {
          const completedWholeUnit = unit.lessons.every((lesson) =>
            completedLessonIds.has(lesson.id),
          );
          if (!completedWholeUnit) continue;

          const statement = unit.exitSkill?.trim() || unit.canDo?.trim();
          if (!statement || unitStatements.includes(statement)) continue;

          unitStatements.push(statement);
        }
      }

      const conversationStatements: string[] = [];
      for (const record of sorted) {
        const evidences = (record.conversationEvidence ?? []) as ParentConversationEvidence[];

        for (const evidence of evidences) {
          if (!evidence.passed || evidence.acceptedTurns < 2) continue;

          const statement = formatConversationEvidenceStatement(evidence);
          if (!statement || conversationStatements.includes(statement)) continue;

          conversationStatements.push(statement);
          if (conversationStatements.length >= 3) break;
        }

        if (conversationStatements.length >= 3) break;
      }

      return {
        lessonStatements,
        unitStatements,
        conversationStatements,
        evidenceCount: masteredLessonIds.size + conversationStatements.length,
      };
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversationHighlights(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.conversationHighlights(childId ?? ''),
    queryFn: async (): Promise<ConversationHighlight[]> => {
      if (!childId) return [];

      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );

      return collectConversationEvidence(records)
        .sort((a, b) => b.completedAtMs - a.completedAtMs)
        .slice(0, 4)
        .map((evidence, index) => ({
          id: `${evidence.scenarioId ?? evidence.scenarioTheme ?? 'conversation'}-${evidence.completedAtMs}-${index}`,
          scenarioId: evidence.scenarioId,
          scenarioTheme: evidence.scenarioTheme,
          acceptedTurns: evidence.acceptedTurns,
          hintedTurns: evidence.hintedTurns,
          passed: evidence.passed,
          score: evidence.score,
          targetWordsHit: evidence.targetWordsHit,
          patternsHit: evidence.patternsHit,
          rawChildResponses: evidence.rawChildResponses,
          rawAnswerPreview: getRawAnswerPreview(evidence.rawChildResponses) ?? undefined,
          completedAtMs: evidence.completedAtMs,
        }));
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversationThemeProgress(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.conversationThemeProgress(childId ?? ''),
    queryFn: async (): Promise<ConversationThemeProgress[]> => {
      if (!childId) return [];

      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );

      const grouped = new Map<
        string,
        {
          attempts: number;
          passedCount: number;
          totalScore: number;
          totalAcceptedTurns: number;
          totalHints: number;
          words: string[];
          utterances: string[];
        }
      >();

      for (const evidence of collectConversationEvidence(records)) {
        const theme = evidence.scenarioTheme?.trim() || 'Serbest konuşma';
        const current = grouped.get(theme) ?? {
          attempts: 0,
          passedCount: 0,
          totalScore: 0,
          totalAcceptedTurns: 0,
          totalHints: 0,
          words: [],
          utterances: [],
        };

        current.attempts += 1;
        current.passedCount += evidence.passed ? 1 : 0;
        current.totalScore += evidence.score;
        current.totalAcceptedTurns += evidence.acceptedTurns;
        current.totalHints += evidence.hintedTurns;
        current.words.push(...evidence.targetWordsHit);
        current.utterances.push(...(evidence.rawChildResponses ?? []).slice(0, 2));

        grouped.set(theme, current);
      }

      return [...grouped.entries()]
        .map(([theme, stats]) => ({
          theme,
          attempts: stats.attempts,
          successRate: stats.attempts > 0 ? stats.passedCount / stats.attempts : 0,
          averageScore: stats.attempts > 0 ? stats.totalScore / stats.attempts : 0,
          averageAcceptedTurns: stats.attempts > 0 ? stats.totalAcceptedTurns / stats.attempts : 0,
          averageHints: stats.attempts > 0 ? stats.totalHints / stats.attempts : 0,
          recentWords: [...new Set(stats.words)].slice(0, 4),
          recentUtterances: [...new Set(stats.utterances)].slice(0, 2),
        }))
        .sort((a, b) => b.averageScore - a.averageScore);
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

// ===== WEEKLY PROGRESS =====

const EMPTY_WEEKLY: WeeklyProgress = {
  lessonsThisWeek: 0,
  lessonsLastWeek: 0,
  avgAccuracyThisWeek: 0,
  totalXpThisWeek: 0,
  totalMinutesThisWeek: 0,
  streakDays: 0,
  perfectLessonsThisWeek: 0,
  speakingLessonsThisWeek: 0,
};

/**
 * Aggregates the last 14 days of LessonProgress records into a weekly
 * summary (this week vs last week) for the parent dashboard.
 */
export function useWeeklyProgress(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.weeklyProgress(childId ?? ''),
    queryFn: async (): Promise<WeeklyProgress> => {
      if (!childId) return EMPTY_WEEKLY;
      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );
      const now = Date.now();
      const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;
      const weekStart = now - MS_7_DAYS;
      const lastWeekStart = now - 2 * MS_7_DAYS;

      const thisWeek = records.filter((r) => r.completedAt.toMillis() >= weekStart);
      const lastWeek = records.filter(
        (r) => r.completedAt.toMillis() >= lastWeekStart && r.completedAt.toMillis() < weekStart,
      );

      const avgAccuracy =
        thisWeek.length > 0
          ? thisWeek.reduce((sum, r) => sum + r.accuracy, 0) / thisWeek.length
          : 0;

      const daySet = new Set(
        thisWeek.map((r) => {
          const d = new Date(r.completedAt.toMillis());
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      );

      return {
        lessonsThisWeek: thisWeek.length,
        lessonsLastWeek: lastWeek.length,
        avgAccuracyThisWeek: avgAccuracy,
        totalXpThisWeek: thisWeek.reduce((sum, r) => sum + r.xpEarned, 0),
        totalMinutesThisWeek: Math.round(
          thisWeek.reduce((sum, r) => sum + r.durationSeconds, 0) / 60,
        ),
        streakDays: daySet.size,
        perfectLessonsThisWeek: thisWeek.filter((r) => r.isPerfect).length,
        speakingLessonsThisWeek: thisWeek.filter((r) => {
          const types = getLesson(r.lessonId)?.activityTypes;
          return types?.some((t) => t === 'speak-it' || t === 'conversation') ?? false;
        }).length,
      };
    },
    enabled: !!childId,
    staleTime: 2 * 60 * 1000,
  });
}

// ===== WEAK TOPICS =====

export interface WeakTopic {
  /** Raw outcome tag string e.g. "vocab:animals" */
  tag: string;
  /** Human-readable label e.g. "Animals Vocabulary" */
  label: string;
  /** Average accuracy across all lessons with this tag (0-1) */
  avgAccuracy: number;
  /** Number of lessons attempted for this tag */
  lessonCount: number;
}

const WEAK_ACCURACY_THRESHOLD = 0.65;
const WEAK_TOPICS_SAMPLE = 30; // look at last N lessons
const MAX_WEAK_TOPICS = 3;

/**
 * Identifies the child's weakest outcome-tag categories by analysing the last
 * WEAK_TOPICS_SAMPLE LessonProgress records. A topic is "weak" when its average
 * accuracy falls below WEAK_ACCURACY_THRESHOLD (65%).
 *
 * Returns up to MAX_WEAK_TOPICS topics sorted ascending by avgAccuracy (worst
 * first), so the parent sees their child's biggest struggles at a glance.
 */
export function useWeakTopics(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.weakTopics(childId ?? ''),
    queryFn: async (): Promise<WeakTopic[]> => {
      if (!childId) return [];
      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );

      // Take the most recent WEAK_TOPICS_SAMPLE records
      const recent = records
        .slice()
        .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis())
        .slice(0, WEAK_TOPICS_SAMPLE);

      // Group by outcomeTag
      const tagMap = new Map<string, { totalAccuracy: number; count: number }>();
      for (const r of recent) {
        const tag = getLesson(r.lessonId)?.outcomeTag;
        if (!tag) continue;
        const existing = tagMap.get(tag) ?? { totalAccuracy: 0, count: 0 };
        tagMap.set(tag, {
          totalAccuracy: existing.totalAccuracy + r.accuracy,
          count: existing.count + 1,
        });
      }

      const weak: WeakTopic[] = [];
      for (const [tag, { totalAccuracy, count }] of tagMap.entries()) {
        const avgAccuracy = totalAccuracy / count;
        if (avgAccuracy < WEAK_ACCURACY_THRESHOLD) {
          weak.push({ tag, label: getOutcomeLabel(tag), avgAccuracy, lessonCount: count });
        }
      }

      return weak.sort((a, b) => a.avgAccuracy - b.avgAccuracy).slice(0, MAX_WEAK_TOPICS);
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

// ===== LIFETIME LEARNING STATS =====

export interface LearningStats {
  /** Unique vocabulary words from lessons completed with accuracy >= 0.7 */
  activeWordsLearned: number;
  /** Unique words from lessons older than 7 days with accuracy < 0.85 (due for review) */
  wordsDueForReview: number;
  /** Unique grammar patterns/chunks used across all completed lessons */
  patternsUsed: number;
  /** Total unique vocabulary words seen across all completed lessons */
  totalWordsSeen: number;
  /** Unique words used successfully in conversation evidence */
  conversationWordsSpoken: number;
  /** Unique conversation themes attempted */
  conversationThemesExplored: number;
}

const EMPTY_STATS: LearningStats = {
  activeWordsLearned: 0,
  wordsDueForReview: 0,
  patternsUsed: 0,
  totalWordsSeen: 0,
  conversationWordsSpoken: 0,
  conversationThemesExplored: 0,
};

/**
 * Lifetime learning statistics: active vocabulary, review queue, patterns used.
 * Derivable from LessonProgress records + curriculum lesson data.
 */
export function useLearningStats(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.learningStats(childId ?? ''),
    queryFn: async (): Promise<LearningStats> => {
      if (!childId) return EMPTY_STATS;
      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );
      const now = Date.now();
      const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

      const activeWords = new Set<string>();
      const reviewWords = new Set<string>();
      const allWords = new Set<string>();
      const patterns = new Set<string>();
      const conversationWords = new Set<string>();
      const conversationThemes = new Set<string>();

      for (const r of records) {
        const lesson = getLesson(r.lessonId);
        if (!lesson) continue;

        const vocab: string[] = lesson.vocabulary;
        const chunks: string[] = lesson.chunks ?? [];
        const ageMs = now - r.completedAt.toMillis();

        for (const word of vocab) {
          allWords.add(word);
          if (r.accuracy >= 0.7) activeWords.add(word);
          if (ageMs > MS_7_DAYS && r.accuracy < 0.85) reviewWords.add(word);
        }
        for (const chunk of chunks) {
          patterns.add(chunk);
        }
      }

      for (const evidence of collectConversationEvidence(records)) {
        const isStrongConversation = evidence.passed || evidence.score >= 70;

        for (const word of evidence.targetWordsHit) {
          allWords.add(word);
          conversationWords.add(word);
          if (isStrongConversation) activeWords.add(word);
          if (now - evidence.completedAtMs > MS_7_DAYS && evidence.score < 85) {
            reviewWords.add(word);
          }
        }

        for (const pattern of evidence.patternsHit) {
          patterns.add(pattern);
        }

        const theme = evidence.scenarioTheme?.trim();
        if (theme && evidence.acceptedTurns > 0) {
          conversationThemes.add(theme);
        }
      }

      return {
        activeWordsLearned: activeWords.size,
        wordsDueForReview: reviewWords.size,
        patternsUsed: patterns.size,
        totalWordsSeen: allWords.size,
        conversationWordsSpoken: conversationWords.size,
        conversationThemesExplored: conversationThemes.size,
      };
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

// ===== EFFICACY INDICATORS =====

export interface SkillBreakdown {
  listening: number; // 0-1 accuracy
  speaking: number;
  reading: number;
  writing: number;
}

export interface EfficacyIndicators {
  /** Retention trend: accuracy change comparing first-half vs second-half of completed lessons */
  retentionTrend: number; // positive = improving, negative = declining
  /** Productive language score: % of lessons where child achieved >70% accuracy on output tasks */
  productiveLanguageScore: number; // 0-1
  /** Speaking progression: count of successful evidence-backed speaking sessions */
  speakingActivitiesCompleted: number;
  /** Total speaking sessions attempted */
  totalSpeakingSessions: number;
  /** Active vocabulary ratio: words actively recalled / total words seen */
  activeVocabularyRatio: number; // 0-1
  /** Recent trend: avg accuracy of last 5 lessons vs prior 5 lessons */
  recentTrendDelta: number;
  /** Weekly lesson completion consistency (0-1, 1 = every day active) */
  consistencyScore: number;
  /** Conversation activities completed */
  conversationCompletions: number;
  /** Successful conversation sessions / total sessions */
  conversationSuccessRate: number;
  /** Mean number of accepted turns in conversation sessions */
  averageAcceptedTurns: number;
  /** Unique conversation patterns used successfully */
  masteredConversationPatterns: number;
  /** Per-skill accuracy breakdown */
  skillBreakdown: SkillBreakdown;
  /** Pre/post delta: first 5 lessons accuracy vs last 5 */
  prePostDelta: number;
}

const EMPTY_EFFICACY: EfficacyIndicators = {
  retentionTrend: 0,
  productiveLanguageScore: 0,
  speakingActivitiesCompleted: 0,
  totalSpeakingSessions: 0,
  activeVocabularyRatio: 0,
  recentTrendDelta: 0,
  consistencyScore: 0,
  conversationCompletions: 0,
  conversationSuccessRate: 0,
  averageAcceptedTurns: 0,
  masteredConversationPatterns: 0,
  skillBreakdown: { listening: 0, speaking: 0, reading: 0, writing: 0 },
  prePostDelta: 0,
};

/**
 * Efficacy indicators for the parent dashboard — pre/post comparison,
 * retention trend, productive language score, speaking progression.
 */
export function useEfficacyIndicators(childId: string | undefined) {
  return useQuery({
    queryKey: parentKeys.efficacyIndicators(childId ?? ''),
    queryFn: async (): Promise<EfficacyIndicators> => {
      if (!childId) return EMPTY_EFFICACY;
      const records = await queryCollection<LessonProgress>(
        collections.childLessonProgress(childId),
      );
      if (records.length === 0) return EMPTY_EFFICACY;

      // Sort chronologically
      const sorted = records
        .slice()
        .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());

      // Retention trend: first half vs second half accuracy
      const mid = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, Math.max(mid, 1));
      const secondHalf = sorted.slice(mid);
      const avgFirst = firstHalf.reduce((sum, r) => sum + r.accuracy, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, r) => sum + r.accuracy, 0) / secondHalf.length;
      const retentionTrend = avgSecond - avgFirst;

      const conversationEvidence = collectConversationEvidence(sorted);
      const passedConversationEvidence = conversationEvidence.filter((evidence) => evidence.passed);

      // Productive language score: productive lessons + conversation sessions with >70% accuracy
      const productiveLessons = sorted.filter((r) => {
        const lesson = getLesson(r.lessonId);
        const types = lesson?.activityTypes ?? [];
        const isProductive = types.some(
          (t) =>
            t === 'speak-it' || t === 'sentence-build' || t === 'fill-blank' || t === 'write-it',
        );
        return isProductive;
      });

      const productiveLessonSuccesses = productiveLessons.filter((r) => r.accuracy >= 0.7);
      const productiveOpportunities = productiveLessons.length + conversationEvidence.length;
      const productiveLanguageScore =
        productiveOpportunities > 0
          ? (productiveLessonSuccesses.length + passedConversationEvidence.length) /
            productiveOpportunities
          : 0;

      // Speaking progression
      const speakingLessons = sorted.filter((r) => {
        const types = getLesson(r.lessonId)?.activityTypes ?? [];
        return types.some((t) => t === 'speak-it');
      });

      // Conversation completions
      const conversationLessons = sorted.filter((r) => {
        const types = getLesson(r.lessonId)?.activityTypes ?? [];
        return types.includes('conversation');
      });

      // Skill breakdown: map activity types → 4 skills
      const SKILL_MAP: Record<string, keyof SkillBreakdown> = {
        'flash-card': 'reading',
        'match-pairs': 'reading',
        'listen-and-tap': 'listening',
        'word-builder': 'writing',
        'fill-blank': 'writing',
        'speak-it': 'speaking',
        'story-time': 'reading',
        'memory-game': 'reading',
        'word-search': 'reading',
        'quiz-battle': 'reading',
        'sentence-builder': 'writing',
        'story-comprehension': 'reading',
        'grammar-transform': 'writing',
      };
      const skillTotals: Record<keyof SkillBreakdown, number[]> = {
        listening: [],
        speaking: [],
        reading: [],
        writing: [],
      };
      for (const r of sorted) {
        const types = getLesson(r.lessonId)?.activityTypes ?? [];
        const skills = new Set(
          types.map((t) => SKILL_MAP[t]).filter((s): s is keyof SkillBreakdown => !!s),
        );
        for (const skill of skills) {
          skillTotals[skill].push(r.accuracy);
        }
      }
      for (const evidence of conversationEvidence) {
        skillTotals.speaking.push(evidence.score / 100);
      }
      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
      const skillBreakdown: SkillBreakdown = {
        listening: avg(skillTotals.listening),
        speaking: avg(skillTotals.speaking),
        reading: avg(skillTotals.reading),
        writing: avg(skillTotals.writing),
      };

      // Pre/post delta: first 5 vs last 5 lessons
      const first5 = sorted.slice(0, 5);
      const last5ForPrePost = sorted.slice(-5);
      const avgFirst5 =
        first5.length > 0 ? first5.reduce((sum, r) => sum + r.accuracy, 0) / first5.length : 0;
      const avgLast5ForPrePost =
        last5ForPrePost.length > 0
          ? last5ForPrePost.reduce((sum, r) => sum + r.accuracy, 0) / last5ForPrePost.length
          : 0;
      const prePostDelta = sorted.length >= 10 ? avgLast5ForPrePost - avgFirst5 : 0;

      // Active vocabulary ratio
      const allWords = new Set<string>();
      const activeWords = new Set<string>();
      for (const r of sorted) {
        const vocab = getLesson(r.lessonId)?.vocabulary ?? [];
        for (const w of vocab) {
          allWords.add(w);
          if (r.accuracy >= 0.7) activeWords.add(w);
        }
      }
      const activeVocabularyRatio = allWords.size > 0 ? activeWords.size / allWords.size : 0;

      // Recent trend: last 5 vs prior 5
      const last5 = sorted.slice(-5);
      const prior5 = sorted.slice(-10, -5);
      const avgLast5 =
        last5.length > 0 ? last5.reduce((sum, r) => sum + r.accuracy, 0) / last5.length : 0;
      const avgPrior5 =
        prior5.length > 0 ? prior5.reduce((sum, r) => sum + r.accuracy, 0) / prior5.length : 0;
      const recentTrendDelta = prior5.length > 0 ? avgLast5 - avgPrior5 : 0;

      // Consistency: distinct active days in last 28 days
      const MS_28_DAYS = 28 * 24 * 60 * 60 * 1000;
      const recentRecords = sorted.filter(
        (r) => Date.now() - r.completedAt.toMillis() < MS_28_DAYS,
      );
      const activeDays = new Set(
        recentRecords.map((r) => {
          const d = new Date(r.completedAt.toMillis());
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      );
      const consistencyScore = activeDays.size / 28;

      const totalSpeakingSessions =
        conversationEvidence.length > 0 ? conversationEvidence.length : speakingLessons.length;
      const speakingActivitiesCompleted =
        conversationEvidence.length > 0
          ? passedConversationEvidence.length
          : speakingLessons.filter((record) => record.accuracy >= 0.7).length;
      const conversationCompletions =
        conversationEvidence.length > 0 ? conversationEvidence.length : conversationLessons.length;
      const conversationSuccessRate =
        totalSpeakingSessions > 0 ? speakingActivitiesCompleted / totalSpeakingSessions : 0;
      const averageAcceptedTurns =
        conversationEvidence.length > 0
          ? conversationEvidence.reduce((sum, evidence) => sum + evidence.acceptedTurns, 0) /
            conversationEvidence.length
          : 0;
      const masteredConversationPatterns = new Set(
        passedConversationEvidence.flatMap((evidence) => evidence.patternsHit),
      ).size;

      return {
        retentionTrend,
        productiveLanguageScore,
        speakingActivitiesCompleted,
        totalSpeakingSessions,
        activeVocabularyRatio,
        recentTrendDelta,
        consistencyScore,
        conversationCompletions,
        conversationSuccessRate,
        averageAcceptedTurns,
        masteredConversationPatterns,
        skillBreakdown,
        prePostDelta,
      };
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}
