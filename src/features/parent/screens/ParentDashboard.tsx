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
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const navigate = useNavigate();
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
          🔒 Ebeveyn Paneli
        </Text>
        <Text variant="bodySmall" align="center" className="text-text-secondary mb-6">
          Devam etmek için PIN kodunuzu girin
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
                        setPinError('Yanlış PIN kodu');
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
            Doğrulanıyor...
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
            <Text variant="h3">👨‍👩‍👧 Ebeveyn Paneli</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {child.name}&apos;in ilerleme raporu
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Kapat
          </Button>
        </div>

        {/* Weekly Stats */}
        <Card variant="elevated" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <Text variant="h4">Bu Hafta</Text>
            {weeklyStats && weeklyStats.streakDays > 0 && (
              <Text variant="caption" className="text-nova-orange font-semibold">
                🔥 {weeklyStats.streakDays} gün aktif
              </Text>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Text variant="h3" className="text-nova-blue">
                {weeklyStats?.lessonsThisWeek ?? child.completedLessons}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Ders
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
                  {weeklyStats.lessonsThisWeek >= weeklyStats.lessonsLastWeek ? '▲' : '▼'} geçen
                  hafta {weeklyStats.lessonsLastWeek}
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
                Süre
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
                Ortalama doğruluk:{' '}
                <span className="text-nova-blue font-semibold">
                  %{Math.round(weeklyStats.avgAccuracyThisWeek * 100)}
                </span>
                {weeklyStats.perfectLessonsThisWeek > 0 && (
                  <span className="text-nova-orange ml-2">
                    ⭐ {weeklyStats.perfectLessonsThisWeek} mükemmel ders
                  </span>
                )}
                {weeklyStats.speakingLessonsThisWeek > 0 && (
                  <span className="text-nova-blue ml-2">
                    🎤 {weeklyStats.speakingLessonsThisWeek} konuşma dersi
                  </span>
                )}
              </Text>
            </div>
          )}
        </Card>

        {!hasDetailedReports && (
          <Card variant="outlined" padding="md">
            <div className="space-y-2 text-center">
              <Text variant="h4">🔒 Detaylı Raporlar Plus&apos;ta</Text>
              <Text variant="bodySmall" className="text-text-secondary">
                Haftalık analizler, konuşma öne çıkanları ve zayıf konu önerileri NovaLingo Plus
                aboneleri için açılır.
              </Text>
              <Button variant="primary" size="sm" onClick={() => navigate('/subscription')}>
                Plus&apos;a Geç
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
                  <Text variant="h4">🗣️ Şu An Yapabiliyor</Text>
                  <Text variant="caption" className="text-text-secondary mt-1 block">
                    Yüksek doğrulukla tamamlanan derslerden, biten ünitelerden ve konuşma
                    kanıtlarından türetildi.
                  </Text>
                </div>
                <Text variant="caption" className="text-nova-green font-semibold">
                  {canDoStatements.evidenceCount} kanıtlı ders
                </Text>
              </div>

              {canDoStatements.lessonStatements.length > 0 && (
                <div className="mb-4">
                  <Text variant="label" className="text-text-secondary mb-2">
                    Son gösterdiği beceriler
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
                    Tamamlanan ünite becerileri
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
                    Son konuşma kanıtları
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
            📊 Öğrenme Çıktıları
          </Text>
          {metricsLoading ? (
            <Text variant="bodySmall" className="text-text-secondary">
              Yükleniyor...
            </Text>
          ) : !outcomeMetrics || outcomeMetrics.totalLessonsCompleted === 0 ? (
            <Text variant="bodySmall" className="text-text-secondary">
              Henüz tamamlanan ders yok.
            </Text>
          ) : (
            <div className="space-y-4">
              {outcomeMetrics.vocabularyTopics.length > 0 && (
                <OutcomeSection
                  emoji="📚"
                  label="Kelime Konuları"
                  tags={outcomeMetrics.vocabularyTopics.map((v) =>
                    getOutcomeLabel(`vocabulary:${v}`),
                  )}
                />
              )}
              {outcomeMetrics.patternAcquisitions.length > 0 && (
                <OutcomeSection
                  emoji="🧩"
                  label="Öğrenilen Kalıplar"
                  tags={outcomeMetrics.patternAcquisitions.map((p) =>
                    getOutcomeLabel(`pattern:${p}`),
                  )}
                />
              )}
              {outcomeMetrics.masteryTopics.length > 0 && (
                <OutcomeSection
                  emoji="🏆"
                  label="Ustalaşılan Konular"
                  tags={outcomeMetrics.masteryTopics.map((m) => getOutcomeLabel(`mastery:${m}`))}
                />
              )}
              {outcomeMetrics.retentionTopics.length > 0 && (
                <OutcomeSection
                  emoji="🔁"
                  label="Tekrar Edilen Konular"
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
                <Text variant="h4">🎙️ Son Konuşma Oturumları</Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  Son diyaloglarda kaç tur sürdüğü, ne kadar yardımla tamamlandığı ve hangi
                  kelime-kalıpların kullanıldığı.
                </Text>
              </div>
              <Text variant="caption" className="font-semibold text-sky-700">
                {conversationHighlights.length} oturum
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
                <Text variant="h4">🧭 Konuşma Temaları</Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  Hangi temalarda daha rahat ilerlediği ve hangi temalarda daha çok destek aldığı.
                </Text>
              </div>
            </div>

            {recommendedConversationTheme && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Text variant="bodySmall" weight="bold" className="text-amber-900">
                      Tekrar için önerilen tema: {recommendedConversationTheme.theme}
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
                    Bu temayla konuşmayı başlat
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {strongestConversationThemes.length > 0 && (
                <div>
                  <Text variant="label" className="text-text-secondary mb-2">
                    Güçlü giden temalar
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
                    Biraz daha destek isteyen temalar
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
                    Tema bazlı gerçek cümle örnekleri
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
              🎯 Zorlanılan Konular
            </Text>
            <Text variant="caption" className="text-text-secondary mb-3 block">
              Doğruluk oranı %65'in altında olan alanlar. Bu konulara biraz daha odaklanmak yardımcı
              olabilir.
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
              📊 Öğrenme İstatistikleri
            </Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-green">
                  {learningStats.activeWordsLearned}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  aktif kelime
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-blue">
                  {learningStats.patternsUsed}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  öğrenilen kalıp
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-nova-orange">
                  {learningStats.wordsDueForReview}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  tekrar bekliyor
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-text-primary">
                  {learningStats.totalWordsSeen}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  görülen toplam kelime
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-sky-700">
                  {learningStats.conversationWordsSpoken}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  konuşmada kullanılan kelime
                </Text>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 text-center">
                <Text variant="h3" className="text-sky-900">
                  {learningStats.conversationThemesExplored}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1 block">
                  konuşulan tema
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
                📈 Etkinlik Göstergeleri
              </Text>
              <div className="space-y-4">
                {/* Retention Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>🔁</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        Kalıcılık Trendi
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        İlk dersler vs son dersler
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
                        Üretken Dil Puanı
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        Cümle kurma, yazma, konuşma başarısı
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
                        Konuşma İlerlemesi
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        Başarılı oturum / toplam oturum
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
                          Konuşma Başarı Oranı
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          Kanıtlanan başarılı konuşma oturumları
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
                          Ortalama Diyalog Derinliği
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          Oturum başına kabul edilen tur sayısı
                        </Text>
                      </div>
                    </div>
                    <Text variant="body" weight="bold" className="text-nova-blue">
                      {efficacy.averageAcceptedTurns.toFixed(1)} tur
                    </Text>
                  </div>
                )}

                {/* Active Vocabulary Ratio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <div>
                      <Text variant="bodySmall" weight="bold">
                        Aktif Kelime Oranı
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        Doğru hatırlanan / toplam görülen
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
                        Son 5 Ders Trendi
                      </Text>
                      <Text variant="caption" className="text-text-secondary">
                        Önceki 5 derse kıyasla
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
                        Tutarlılık (son 28 gün)
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
                          Konuşma Pratiği
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          Kayıt altına alınan diyalog oturumu
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
                          Konuşmada Ustalaşan Kalıp
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          Başarılı diyaloglarda tekrar kullanılan kalıplar
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
                          Başlangıç → Şimdi
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          İlk 5 ders vs son 5 ders
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
                        Beceri Dağılımı
                      </Text>
                    </div>
                    <div className="space-y-2">
                      {(
                        [
                          { key: 'listening' as const, label: 'Dinleme', emoji: '👂' },
                          { key: 'speaking' as const, label: 'Konuşma', emoji: '🗣️' },
                          { key: 'reading' as const, label: 'Okuma', emoji: '📖' },
                          { key: 'writing' as const, label: 'Yazma', emoji: '✏️' },
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
            title="Günlük Süre Limiti"
            subtitle="30 dakika"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>🔔</span>}
            title="Bildirimler"
            subtitle="Açık"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>💳</span>}
            title="Abonelik"
            subtitle="Ücretsiz Plan"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/subscription')}
            divider
          />
          <ListItem
            leading={<span>👤</span>}
            title="Hesap Ayarları"
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

function formatRelativeConversationDate(timestampMs: number) {
  const diffMs = Date.now() - timestampMs;
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) return `${minutes} dk önce`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} gün önce`;

  return new Date(timestampMs).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

function ConversationHighlightCard({ item }: { item: ConversationHighlight }) {
  const theme = item.scenarioTheme?.trim() || 'Serbest konuşma';
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
            {formatRelativeConversationDate(item.completedAtMs)}
          </Text>
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreBadgeTone}`}>
          %{item.score}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            Kabul edilen tur
          </Text>
          <Text variant="bodySmall" weight="bold" className="text-slate-800">
            {item.acceptedTurns}
          </Text>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            İpucu
          </Text>
          <Text variant="bodySmall" weight="bold" className="text-slate-800">
            {item.hintedTurns}
          </Text>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-2">
          <Text variant="caption" className="text-text-secondary block">
            Durum
          </Text>
          <Text variant="bodySmall" weight="bold" className={scoreTone}>
            {item.passed ? 'Başardı' : 'Destekli'}
          </Text>
        </div>
      </div>

      {item.targetWordsHit.length > 0 && (
        <div className="mb-2">
          <Text variant="caption" className="text-text-secondary mb-1 block">
            Kullanılan kelimeler
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
            Oturumda kurduğu kalıplar
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
            Çocuğun söylediği
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
            {item.attempts} oturum • ort. {item.averageAcceptedTurns.toFixed(1)} tur • ort.{' '}
            {item.averageHints.toFixed(1)} ipucu
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
          Başarı oranı
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
