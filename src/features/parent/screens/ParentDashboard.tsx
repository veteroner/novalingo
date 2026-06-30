/**
 * ParentDashboard
 *
 * Ebeveyn paneli — çocuğun istatistikleri, süre limitleri, içerik kontrolü.
 * PIN ile korumalı (4 haneli).
 */

import { getOutcomeLabel } from '@/features/learning/services/outcomeTagService';
import { getRecommendedConversationTheme } from '@/features/parent/utils/conversationRecommendations';
import {
  useCanDoStatements,
  useConversationHighlights,
  useConversationThemeProgress,
  useEfficacyIndicators,
  useLearningStats,
  useOutcomeMetrics,
  useWeakTopics,
  useWeeklyProgress,
  type ConversationHighlight,
  type ConversationThemeProgress,
  type WeakTopic,
} from '@/hooks/queries/useParentQueries';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { ListItem } from '@components/molecules/ListItem';
import { MainLayout } from '@components/templates/MainLayout';
import { verifyParentPin } from '@services/firebase/functions';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation('parent');
  const child = useChildStore((s) => s.activeChild);
  const user = useAuthStore((s) => s.user);
  const hasPinSet = user?.settings.parentPin != null;
  const hasDetailedReports = Boolean(user?.isPremium);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { data: outcomeMetrics, isLoading: metricsLoading } = useOutcomeMetrics(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: canDoStatements } = useCanDoStatements(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: conversationHighlights } = useConversationHighlights(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: conversationThemeProgress } = useConversationThemeProgress(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: weeklyStats } = useWeeklyProgress(isUnlocked ? child?.id : undefined);
  const { data: weakTopics } = useWeakTopics(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: learningStats } = useLearningStats(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const { data: efficacy } = useEfficacyIndicators(
    isUnlocked && hasDetailedReports ? child?.id : undefined,
  );
  const strongestConversationThemes = conversationThemeProgress?.slice(0, 2) ?? [];
  const supportConversationThemes = [...(conversationThemeProgress ?? [])]
    .reverse()
    .filter((item) => !strongestConversationThemes.some((strong) => strong.theme === item.theme))
    .slice(0, 2);
  const recommendedConversationTheme = getRecommendedConversationTheme(
    conversationThemeProgress ?? [],
  );

  // PIN gate
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <Text variant="h3" align="center" className="mb-2">
          {t('dashboard.gateTitle')}
        </Text>
        <Text variant="bodySmall" align="center" className="text-text-secondary mb-6">
          {t('dashboard.gatePrompt')}
        </Text>

        <div className="mb-6 flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-3 text-2xl font-bold ${pin.length > i ? 'border-nova-blue bg-nova-blue/5' : 'border-gray-200'}`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid max-w-xs grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key) => (
            <button
              key={String(key)}
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${key === null ? 'invisible' : 'bg-gray-100 transition-colors active:bg-gray-200'}`}
              onClick={() => {
                if (key === 'del') {
                  setPin((p) => p.slice(0, -1));
                  setPinError('');
                } else if (key !== null && pin.length < 4 && !verifying) {
                  const newPin = pin + String(key);
                  setPin(newPin);
                  setPinError('');
                  if (newPin.length === 4) {
                    if (!hasPinSet) {
                      // No PIN set yet — allow access, prompt to set PIN in settings
                      setIsUnlocked(true);
                      return;
                    }
                    setVerifying(true);
                    verifyParentPin({ pin: newPin })
                      .then(() => {
                        setIsUnlocked(true);
                      })
                      .catch(() => {
                        setPinError(t('dashboard.wrongPin'));
                        setPin('');
                      })
                      .finally(() => {
                        setVerifying(false);
                      });
                  }
                }
              }}
            >
              {key === 'del' ? '⌫' : key !== null ? String(key) : ''}
            </button>
          ))}
        </div>

        {pinError && (
          <Text variant="bodySmall" align="center" className="text-error mt-4">
            {pinError}
          </Text>
        )}

        {verifying && (
          <Text variant="bodySmall" align="center" className="text-text-secondary mt-4">
            {t('dashboard.verifying')}
          </Text>
        )}
      </div>
    );
  }

  if (!child) return null;

  return (
    <MainLayout showNavigation={false}>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h3">{t('dashboard.title')}</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {t('dashboard.subtitle', { name: child.name })}
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            {t('dashboard.close')}
          </Button>
        </div>

        {/* Weekly Stats */}
        <Card variant="elevated" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <Text variant="h4">{t('dashboard.thisWeek')}</Text>
            {weeklyStats && weeklyStats.streakDays > 0 && (
              <Text variant="caption" className="text-nova-orange font-semibold">
                {t('dashboard.daysActive', { count: weeklyStats.streakDays })}
              </Text>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Text variant="h3" className="text-nova-blue">
                {weeklyStats?.lessonsThisWeek ?? child.completedLessons}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {t('dashboard.lessons')}
              </Text>
              {weeklyStats && weeklyStats.lessonsLastWeek > 0 && (
                <Text
                  variant="caption"
                  className={
                    weeklyStats.lessonsThisWeek >= weeklyStats.lessonsLastWeek
                      ? 'text-success'
                      : 'text-error'
                  }
                >
                  {weeklyStats.lessonsThisWeek >= weeklyStats.lessonsLastWeek ? '▲' : '▼'}{' '}
                  {t('dashboard.weekTrend', { count: weeklyStats.lessonsLastWeek })}
                </Text>
              )}
            </div>
            <div>
              <Text variant="h3" className="text-success">
                {weeklyStats?.totalMinutesThisWeek != null
                  ? `${weeklyStats.totalMinutesThisWeek}dk`
                  : `${child.totalPlayTimeMinutes}dk`}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {t('dashboard.time')}
              </Text>
            </div>
            <div>
              <Text variant="h3" className="text-nova-orange">
                {weeklyStats?.totalXpThisWeek != null
                  ? `+${weeklyStats.totalXpThisWeek}`
                  : child.totalXP}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                XP
              </Text>
            </div>
          </div>
          {weeklyStats && weeklyStats.avgAccuracyThisWeek > 0 && (
            <div className="bg-surface-50 mt-3 rounded-xl px-4 py-2 text-center">
              <Text variant="bodySmall" className="text-text-secondary">
                {t('dashboard.avgAccuracy')}{' '}
                <span className="text-nova-blue font-semibold">
                  %{Math.round(weeklyStats.avgAccuracyThisWeek * 100)}
                </span>
                {weeklyStats.perfectLessonsThisWeek > 0 && (
                  <span className="text-nova-orange ml-2">
                    {t('dashboard.perfectLessons', { count: weeklyStats.perfectLessonsThisWeek })}
                  </span>
                )}
                {weeklyStats.speakingLessonsThisWeek > 0 && (
                  <span className="text-nova-blue ml-2">
                    {t('dashboard.speakingLessons', { count: weeklyStats.speakingLessonsThisWeek })}
                  </span>
                )}
              </Text>
            </div>
          )}
        </Card>

        {!hasDetailedReports && (
          <Card variant="outlined" padding="md">
            <div className="space-y-2 text-center">
              <Text variant="h4">{t('dashboard.lockedTitle')}</Text>
              <Text variant="bodySmall" className="text-text-secondary">
                {t('dashboard.lockedDesc')}
              </Text>
              <Button variant="primary" size="sm" onClick={() => navigate('/subscription')}>
                {t('dashboard.goPlus')}
              </Button>
            </div>
          </Card>
        )}

        {/* Concrete skill evidence */}
        {hasDetailedReports &&
          canDoStatements &&
          (canDoStatements.lessonStatements.length > 0 ||
            canDoStatements.unitStatements.length > 0 ||
            canDoStatements.conversationStatements.length > 0) && (
            <Card variant="elevated" padding="md">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <Text variant="h4">{t('dashboard.canDoTitle')}</Text>
                  <Text variant="caption" className="text-text-secondary mt-1 block">
                    {t('dashboard.canDoDesc')}
                  </Text>
                </div>
                <Text variant="caption" className="text-nova-green font-semibold">
                  {t('dashboard.evidenceCount', { count: canDoStatements.evidenceCount })}
                </Text>
              </div>

              {canDoStatements.lessonStatements.length > 0 && (
                <div className="mb-4">
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.recentSkills')}
                  </Text>
                  <div className="space-y-2">
                    {canDoStatements.lessonStatements.map((statement) => (
                      <div
                        key={statement}
                        className="bg-surface-50 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        {statement}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canDoStatements.unitStatements.length > 0 && (
                <div>
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.unitSkills')}
                  </Text>
                  <div className="space-y-2">
                    {canDoStatements.unitStatements.slice(0, 3).map((statement) => (
                      <div
                        key={statement}
                        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                      >
                        {statement}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canDoStatements.conversationStatements.length > 0 && (
                <div className="mt-4">
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.conversationEvidence')}
                  </Text>
                  <div className="space-y-2">
                    {canDoStatements.conversationStatements.map((statement) => (
                      <div
                        key={statement}
                        className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900"
                      >
                        {statement}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

        {/* Outcome Metrics */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            {t('dashboard.outcomesTitle')}
          </Text>
          {metricsLoading ? (
            <Text variant="bodySmall" className="text-text-secondary">
              {t('dashboard.loading')}
            </Text>
          ) : !outcomeMetrics || outcomeMetrics.totalLessonsCompleted === 0 ? (
            <Text variant="bodySmall" className="text-text-secondary">
              {t('dashboard.noLessons')}
            </Text>
          ) : (
            <div className="space-y-4">
              {outcomeMetrics.vocabularyTopics.length > 0 && (
                <OutcomeSection
                  emoji="📚"
                  label={t('dashboard.vocabTopics')}
                  tags={outcomeMetrics.vocabularyTopics.map((v) =>
                    getOutcomeLabel(`vocabulary:${v}`),
                  )}
                />
              )}
              {outcomeMetrics.patternAcquisitions.length > 0 && (
                <OutcomeSection
                  emoji="🧩"
                  label={t('dashboard.learnedPatternsLabel')}
                  tags={outcomeMetrics.patternAcquisitions.map((p) =>
                    getOutcomeLabel(`pattern:${p}`),
                  )}
                />
              )}
              {outcomeMetrics.masteryTopics.length > 0 && (
                <OutcomeSection
                  emoji="🏆"
                  label={t('dashboard.masteryTopics')}
                  tags={outcomeMetrics.masteryTopics.map((m) => getOutcomeLabel(`mastery:${m}`))}
                />
              )}
              {outcomeMetrics.retentionTopics.length > 0 && (
                <OutcomeSection
                  emoji="🔁"
                  label={t('dashboard.retentionTopics')}
                  tags={outcomeMetrics.retentionTopics.map((r) =>
                    getOutcomeLabel(`retention:${r}`),
                  )}
                />
              )}
            </div>
          )}
        </Card>

        {conversationHighlights && conversationHighlights.length > 0 && (
          <Card variant="elevated" padding="md">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <Text variant="h4">{t('dashboard.sessionsTitle')}</Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.sessionsDesc')}
                </Text>
              </div>
              <Text variant="caption" className="font-semibold text-sky-700">
                {t('dashboard.sessionsCount', { count: conversationHighlights.length })}
              </Text>
            </div>

            <div className="space-y-3">
              {conversationHighlights.map((item) => (
                <ConversationHighlightCard key={item.id} item={item} />
              ))}
            </div>
          </Card>
        )}

        {conversationThemeProgress && conversationThemeProgress.length > 0 && (
          <Card variant="elevated" padding="md">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <Text variant="h4">{t('dashboard.themesTitle')}</Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.themesDesc')}
                </Text>
              </div>
            </div>

            {recommendedConversationTheme && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Text variant="bodySmall" weight="bold" className="text-amber-900">
                      {t('dashboard.recommendedTheme', {
                        theme: recommendedConversationTheme.theme,
                      })}
                    </Text>
                    <Text variant="caption" className="mt-1 block text-amber-800">
                      {recommendedConversationTheme.reason}
                    </Text>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                    %{recommendedConversationTheme.averageScore}
                  </span>
                </div>

                {recommendedConversationTheme.focusWords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendedConversationTheme.focusWords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/conversation?theme=${encodeURIComponent(recommendedConversationTheme.theme)}`,
                      )
                    }
                  >
                    {t('dashboard.startThemeConversation')}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {strongestConversationThemes.length > 0 && (
                <div>
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.strongThemes')}
                  </Text>
                  <div className="space-y-3">
                    {strongestConversationThemes.map((item) => (
                      <ConversationThemeProgressCard
                        key={item.theme}
                        item={item}
                        variant="strong"
                      />
                    ))}
                  </div>
                </div>
              )}

              {supportConversationThemes.length > 0 && (
                <div>
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.supportThemes')}
                  </Text>
                  <div className="space-y-3">
                    {supportConversationThemes.map((item) => (
                      <ConversationThemeProgressCard
                        key={item.theme}
                        item={item}
                        variant="support"
                      />
                    ))}
                  </div>
                </div>
              )}

              {conversationThemeProgress.some(
                (item) => (item.recentUtterances?.length ?? 0) > 0,
              ) && (
                <div>
                  <Text variant="label" className="text-text-secondary mb-2">
                    {t('dashboard.themeExamples')}
                  </Text>
                  <div className="grid gap-3 md:grid-cols-2">
                    {conversationThemeProgress
                      .filter((item) => (item.recentUtterances?.length ?? 0) > 0)
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={`${item.theme}-utterances`}
                          className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3"
                        >
                          <Text variant="bodySmall" weight="bold" className="text-violet-950">
                            {item.theme}
                          </Text>
                          <div className="mt-2 space-y-2">
                            {(item.recentUtterances ?? []).slice(0, 2).map((utterance, index) => (
                              <div
                                key={`${item.theme}-${utterance}-${index}`}
                                className="rounded-xl bg-white px-3 py-2 text-sm text-violet-900 shadow-sm"
                              >
                                “{utterance}”
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Weak Topics — only shown when there is at least one weak area */}
        {weakTopics && weakTopics.length > 0 && (
          <Card variant="outlined" padding="md">
            <Text variant="h4" className="mb-4">
              {t('dashboard.weakTitle')}
            </Text>
            <Text variant="caption" className="text-text-secondary mb-3 block">
              {t('dashboard.weakDesc')}
            </Text>
            <div className="flex flex-col gap-3">
              {weakTopics.map((topic: WeakTopic) => (
                <div key={topic.tag} className="flex items-center justify-between">
                  <Text variant="body" className="flex-1">
                    {topic.label}
                  </Text>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${Math.round(topic.avgAccuracy * 100)}%` }}
                      />
                    </div>
                    <Text variant="caption" className="w-10 text-right font-semibold text-red-500">
                      {Math.round(topic.avgAccuracy * 100)}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Learning Stats — vocabulary count, patterns, review queue */}
        {learningStats && learningStats.totalWordsSeen > 0 && (
          <Card variant="elevated" padding="md">
            <Text variant="h4" className="mb-4">
              {t('dashboard.statsTitle')}
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-green">
                  {learningStats.activeWordsLearned}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.activeWords')}
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-blue">
                  {learningStats.patternsUsed}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.learnedPatternsStat')}
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-orange">
                  {learningStats.wordsDueForReview}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.dueReview')}
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-text-primary">
                  {learningStats.totalWordsSeen}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.totalWordsSeen')}
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-sky-700">
                  {learningStats.conversationWordsSpoken}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.conversationWords')}
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-sky-900">
                  {learningStats.conversationThemesExplored}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  {t('dashboard.themesExplored')}
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Efficacy Indicators */}
        {efficacy &&
          (efficacy.retentionTrend !== 0 ||
            efficacy.speakingActivitiesCompleted > 0 ||
            efficacy.productiveLanguageScore > 0) && (
            <Card variant="elevated" padding="md">
              <Text variant="h4" className="mb-4">
                {t('dashboard.efficacyTitle')}
              </Text>
              <div className="space-y-4">
                {/* Retention Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🔁</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.retentionTrend')}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {t('dashboard.retentionTrendDesc')}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text
                      variant="body"
                      weight="bold"
                      className={efficacy.retentionTrend >= 0 ? 'text-success' : 'text-error'}
                    >
                      {efficacy.retentionTrend >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(Math.round(efficacy.retentionTrend * 100))}%
                    </Text>
                  </div>
                </div>

                {/* Productive Language Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>💬</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.productiveScore')}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {t('dashboard.productiveScoreDesc')}
                      </Text>
                    </div>
                  </div>
                  <Text variant="body" weight="bold" className="text-nova-blue">
                    %{Math.round(efficacy.productiveLanguageScore * 100)}
                  </Text>
                </div>

                {/* Speaking Progression */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🎤</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.speakingProgress')}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {t('dashboard.speakingProgressDesc')}
                      </Text>
                    </div>
                  </div>
                  <Text variant="body" weight="bold" className="text-nova-orange">
                    {efficacy.speakingActivitiesCompleted}/{efficacy.totalSpeakingSessions}
                  </Text>
                </div>

                {efficacy.totalSpeakingSessions > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🧠</span>
                      <div>
                        <Text variant="bodySmall" weight="bold">
                          {t('dashboard.conversationSuccess')}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t('dashboard.conversationSuccessDesc')}
                        </Text>
                      </div>
                    </div>
                    <Text variant="body" weight="bold" className="text-sky-700">
                      %{Math.round(efficacy.conversationSuccessRate * 100)}
                    </Text>
                  </div>
                )}

                {efficacy.averageAcceptedTurns > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>↔️</span>
                      <div>
                        <Text variant="bodySmall" weight="bold">
                          {t('dashboard.dialogDepth')}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t('dashboard.dialogDepthDesc')}
                        </Text>
                      </div>
                    </div>
                    <Text variant="body" weight="bold" className="text-nova-blue">
                      {t('dashboard.turns', { value: efficacy.averageAcceptedTurns.toFixed(1) })}
                    </Text>
                  </div>
                )}

                {/* Active Vocabulary Ratio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.activeVocabRatio')}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {t('dashboard.activeVocabRatioDesc')}
                      </Text>
                    </div>
                  </div>
                  <Text variant="body" weight="bold" className="text-success">
                    %{Math.round(efficacy.activeVocabularyRatio * 100)}
                  </Text>
                </div>

                {/* Recent Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.recentTrend')}
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        {t('dashboard.recentTrendDesc')}
                      </Text>
                    </div>
                  </div>
                  <Text
                    variant="body"
                    weight="bold"
                    className={efficacy.recentTrendDelta >= 0 ? 'text-success' : 'text-error'}
                  >
                    {efficacy.recentTrendDelta >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(Math.round(efficacy.recentTrendDelta * 100))}%
                  </Text>
                </div>

                {/* Consistency */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.consistency')}
                      </Text>
                    </div>
                    <Text variant="caption" className="text-text-secondary font-semibold">
                      %{Math.round(efficacy.consistencyScore * 100)}
                    </Text>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="bg-nova-blue h-full rounded-full transition-all"
                      style={{ width: `${Math.round(efficacy.consistencyScore * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Conversation Completions */}
                {efficacy.conversationCompletions > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🎭</span>
                      <div>
                        <Text variant="bodySmall" weight="bold">
                          {t('dashboard.conversationPractice')}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t('dashboard.conversationPracticeDesc')}
                        </Text>
                      </div>
                    </div>
                    <Text variant="body" weight="bold" className="text-nova-purple">
                      {efficacy.conversationCompletions}
                    </Text>
                  </div>
                )}

                {efficacy.masteredConversationPatterns > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🧩</span>
                      <div>
                        <Text variant="bodySmall" weight="bold">
                          {t('dashboard.masteredPatterns')}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t('dashboard.masteredPatternsDesc')}
                        </Text>
                      </div>
                    </div>
                    <Text variant="body" weight="bold" className="text-emerald-700">
                      {efficacy.masteredConversationPatterns}
                    </Text>
                  </div>
                )}

                {/* Pre/Post Delta */}
                {efficacy.prePostDelta !== 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      <div>
                        <Text variant="bodySmall" weight="bold">
                          {t('dashboard.startToNow')}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {t('dashboard.startToNowDesc')}
                        </Text>
                      </div>
                    </div>
                    <Text
                      variant="body"
                      weight="bold"
                      className={efficacy.prePostDelta >= 0 ? 'text-success' : 'text-error'}
                    >
                      {efficacy.prePostDelta >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(Math.round(efficacy.prePostDelta * 100))}%
                    </Text>
                  </div>
                )}

                {/* Skill Breakdown */}
                {(efficacy.skillBreakdown.listening > 0 ||
                  efficacy.skillBreakdown.speaking > 0 ||
                  efficacy.skillBreakdown.reading > 0 ||
                  efficacy.skillBreakdown.writing > 0) && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span>🧩</span>
                      <Text variant="bodySmall" weight="bold">
                        {t('dashboard.skillBreakdown')}
                      </Text>
                    </div>
                    <div className="space-y-2">
                      {(
                        [
                          {
                            key: 'listening' as const,
                            label: t('dashboard.skillListening'),
                            emoji: '👂',
                          },
                          {
                            key: 'speaking' as const,
                            label: t('dashboard.skillSpeaking'),
                            emoji: '🗣️',
                          },
                          {
                            key: 'reading' as const,
                            label: t('dashboard.skillReading'),
                            emoji: '📖',
                          },
                          {
                            key: 'writing' as const,
                            label: t('dashboard.skillWriting'),
                            emoji: '✏️',
                          },
                        ] as const
                      ).map(({ key, label, emoji }) => {
                        const val = Math.round(efficacy.skillBreakdown[key] * 100);
                        return (
                          <div key={key}>
                            <div className="mb-0.5 flex justify-between">
                              <Text variant="caption">
                                {emoji} {label}
                              </Text>
                              <Text variant="caption" weight="bold">
                                %{val}
                              </Text>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="bg-nova-blue h-full rounded-full transition-all"
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

        {/* Settings */}
        <Card variant="outlined" padding="none">
          <ListItem
            leading={<span>⏰</span>}
            title={t('dashboard.settingsTimeLimit')}
            subtitle={t('dashboard.timeLimit30')}
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>🔔</span>}
            title={t('dashboard.settingsNotifications')}
            subtitle={t('dashboard.notificationsOn')}
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>💳</span>}
            title={t('dashboard.settingsSubscription')}
            subtitle={t('dashboard.freePlan')}
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/subscription')}
            divider
          />
          <ListItem
            leading={<span>👤</span>}
            title={t('dashboard.settingsAccount')}
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

// ===== HELPERS =====

interface OutcomeSectionProps {
  emoji: string;
  label: string;
  tags: string[];
}

function formatRelativeConversationDate(
  timestampMs: number,
  t: (key: string, options?: { count?: number }) => string,
) {
  const diffMs = Date.now() - timestampMs;
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) return t('dashboard.relMinutes', { count: minutes });

  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('dashboard.relHours', { count: hours });

  const days = Math.round(hours / 24);
  if (days < 7) return t('dashboard.relDays', { count: days });

  return new Date(timestampMs).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

function ConversationHighlightCard({ item }: { item: ConversationHighlight }) {
  const { t } = useTranslation('parent');
  const theme = item.scenarioTheme?.trim() || t('dashboard.freeTalk');
  const scoreTone = item.passed ? 'text-emerald-700' : 'text-amber-700';
  const scoreBadgeTone = item.passed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <Text variant="bodySmall" weight="bold">
            {theme}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {formatRelativeConversationDate(item.completedAtMs, t)}
          </Text>
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreBadgeTone}`}>
          %{item.score}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            {t('dashboard.acceptedTurns')}
          </Text>
          <Text variant="bodySmall" weight="bold" className="text-slate-800">
            {item.acceptedTurns}
          </Text>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            {t('dashboard.hints')}
          </Text>
          <Text variant="bodySmall" weight="bold" className="text-slate-800">
            {item.hintedTurns}
          </Text>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            {t('dashboard.status')}
          </Text>
          <Text variant="bodySmall" weight="bold" className={scoreTone}>
            {item.passed ? t('dashboard.passed') : t('dashboard.supported')}
          </Text>
        </div>
      </div>

      {item.targetWordsHit.length > 0 && (
        <div className="mb-2">
          <Text variant="caption" className="text-text-secondary mb-1 block">
            {t('dashboard.usedWords')}
          </Text>
          <div className="flex flex-wrap gap-2">
            {item.targetWordsHit.slice(0, 4).map((word) => (
              <span
                key={word}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.patternsHit.length > 0 && (
        <div>
          <Text variant="caption" className="text-text-secondary mb-1 block">
            {t('dashboard.builtPatterns')}
          </Text>
          <div className="flex flex-wrap gap-2">
            {item.patternsHit.slice(0, 3).map((pattern) => (
              <span
                key={pattern}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {item.rawAnswerPreview && (
        <div className="mt-2 rounded-xl bg-violet-50 px-3 py-2">
          <Text variant="caption" className="text-text-secondary mb-1 block">
            {t('dashboard.childSaid')}
          </Text>
          <Text variant="caption" className="text-violet-900">
            {item.rawAnswerPreview}
          </Text>
        </div>
      )}
    </div>
  );
}

function ConversationThemeProgressCard({
  item,
  variant,
}: {
  item: ConversationThemeProgress;
  variant: 'strong' | 'support';
}) {
  const { t } = useTranslation('parent');
  const score = Math.round(item.averageScore);
  const successRate = Math.round(item.successRate * 100);
  const progressTone =
    variant === 'strong'
      ? score >= 85
        ? 'bg-emerald-500'
        : 'bg-sky-500'
      : score >= 65
        ? 'bg-amber-500'
        : 'bg-rose-500';
  const badgeTone =
    variant === 'strong'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  const containerTone =
    variant === 'strong'
      ? 'border-emerald-100 bg-emerald-50/40'
      : 'border-amber-100 bg-amber-50/40';

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-sm ${containerTone}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <Text variant="bodySmall" weight="bold">
            {item.theme}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {t('dashboard.themeStats', {
              attempts: item.attempts,
              turns: item.averageAcceptedTurns.toFixed(1),
              hints: item.averageHints.toFixed(1),
            })}
          </Text>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeTone}`}>
          %{score}
        </span>
      </div>

      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${progressTone}`} style={{ width: `${score}%` }} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <Text variant="caption" className="text-text-secondary">
          {t('dashboard.successRate')}
        </Text>
        <Text variant="caption" weight="bold" className="text-slate-700">
          %{successRate}
        </Text>
      </div>

      {item.recentWords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.recentWords.map((word) => (
            <span
              key={word}
              className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function OutcomeSection({ emoji, label, tags }: OutcomeSectionProps) {
  return (
    <div>
      <Text variant="label" className="text-text-secondary mb-2">
        {emoji} {label}
      </Text>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-nova-blue/10 text-nova-blue rounded-full px-3 py-1 text-xs font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
