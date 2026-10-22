/**
 * ConversationTopicsScreen — "Nova ile Konuş" öğrenme yolu
 *
 * Çocuğun bulunduğu dünyanın konuşma senaryolarını temalara göre bölümlenmiş,
 * sıralı açılan bir yol olarak gösterir (dünya haritasıyla aynı görsel dil).
 * Durağa dokununca ayrıntı kartı açılır; konuşma oradan başlatılır.
 */

import type { ConversationScenario } from '@/features/learning/data/conversations';
import {
  ALL_CONVERSATION_SCENARIOS,
  PHASE1_CONVERSATION_SCENARIOS,
  PHASE2_CONVERSATION_SCENARIOS,
  PHASE3_CONVERSATION_SCENARIOS,
  PHASE4_CONVERSATION_SCENARIOS,
  PHASE5_CONVERSATION_SCENARIOS,
} from '@/features/learning/data/conversations';
import { WORLD_TO_PHASE } from '@/features/learning/data/conversations/selectors/selectConversationScenario';
import { Button } from '@components/atoms/Button';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { PATH_ROW_HEIGHT, pathOffset } from '@features/home/components/learningPath';
import '@features/home/screens/worldMap.css';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatsCircleIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  LockKeyIcon,
  StarIcon,
  TrophyIcon,
  XIcon,
} from '@phosphor-icons/react';
import { unlockAudioPlayback } from '@services/speech/speechService';
import { useChildStore } from '@stores/childStore';
import { initConversationProgress, useConversationStore } from '@stores/conversationStore';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { buildConversationPath } from '../components/conversationPath';
import type { ConversationStop } from '../components/conversationPath';

const PHASE_SCENARIOS: Record<string, ConversationScenario[]> = {
  phase1: PHASE1_CONVERSATION_SCENARIOS,
  phase2: PHASE2_CONVERSATION_SCENARIOS,
  phase3: PHASE3_CONVERSATION_SCENARIOS,
  phase4: PHASE4_CONVERSATION_SCENARIOS,
  phase5: PHASE5_CONVERSATION_SCENARIOS,
};

function RouteLine({ stops }: { stops: ConversationStop[] }) {
  return (
    <svg
      className="learning-route-line"
      viewBox={`0 0 360 ${stops.length * PATH_ROW_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {stops.slice(0, -1).map((stop, index) => {
        const x = 180 + pathOffset(index);
        const nextX = 180 + pathOffset(index + 1);
        const y = index * PATH_ROW_HEIGHT + 74;
        const nextY = y + PATH_ROW_HEIGHT;
        return (
          <path
            key={stop.scenario.id}
            d={`M ${x} ${y} C ${x} ${y + 76}, ${nextX} ${nextY - 76}, ${nextX} ${nextY}`}
            className={stop.stars >= 1 ? 'is-complete' : ''}
          />
        );
      })}
    </svg>
  );
}

export default function ConversationTopicsScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const child = useChildStore((s) => s.activeChild);
  const progress = useConversationStore((s) => s.progress);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Kayıtlı ilerlemeyi yükle; yıldızlar ve açık duraklar önceki oturumları yansıtsın.
  useEffect(() => {
    if (child?.id) {
      initConversationProgress(child.id);
    }
  }, [child?.id]);

  const worldId = child?.currentWorldId ?? 'w1';
  const phase = (WORLD_TO_PHASE[worldId] as string | undefined) ?? 'phase1';
  const scenarios = PHASE_SCENARIOS[phase] ?? ALL_CONVERSATION_SCENARIOS;
  const chapters = useMemo(() => buildConversationPath(scenarios, progress), [scenarios, progress]);
  const stops = chapters.flatMap((chapter) => chapter.stops);
  const next = stops.find((stop) => stop.status === 'active');
  const selected = stops.find((stop) => stop.scenario.id === selectedId);
  const doneCount = stops.filter((stop) => stop.stars >= 1).length;
  const percent = stops.length ? Math.round((doneCount / stops.length) * 100) : 0;

  const themeLabel = (theme: string) =>
    t(`conversationTopics.themes.${theme}`, {
      defaultValue: theme.charAt(0).toUpperCase() + theme.slice(1).replace(/-/g, ' '),
    });

  function startConversation(stop: ConversationStop) {
    if (stop.status === 'locked') return;
    void unlockAudioPlayback();
    void navigate(`/conversation?scenarioId=${stop.scenario.id}`);
  }

  function findMyPlace() {
    document.getElementById('conversation-next-stop')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center',
    });
    setSelectedId(next?.scenario.id ?? null);
  }

  return (
    <div
      className="learning-map safe-area-top safe-area-bottom min-h-screen pb-10"
      style={{ '--world-color': '#5145C8' } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setSelectedId(null);
      }}
    >
      <header className="learning-topbar">
        <button
          type="button"
          className="path-icon-button"
          aria-label={t('conversationTopics.back')}
          onClick={() => void navigate(-1)}
        >
          <ArrowLeftIcon size={22} weight="bold" />
        </button>
        <div className="learning-world-title">
          <span className="font-extrabold">{t('conversationTopics.title')}</span>
        </div>
        <span className="w-10" aria-hidden="true" />
      </header>

      <div className="learning-intro">
        <div>
          <span className="learning-eyebrow">
            <CompassIcon size={17} weight="bold" aria-hidden="true" />
            {t('conversationTopics.eyebrow')}
          </span>
          <h1>{t('conversationTopics.pathTitle')}</h1>
          <p>{t('conversationTopics.subtitle')}</p>
        </div>
        {next && (
          <button type="button" className="learning-resume" onClick={findMyPlace}>
            <FlagIcon size={18} weight="fill" aria-hidden="true" />
            {t('conversationTopics.findMyPlace')}
          </button>
        )}
      </div>

      <div className="learning-world-progress">
        <span>
          {t('conversationTopics.completed', { completed: doneCount, total: stops.length })}
        </span>
        <strong>{percent}%</strong>
        <div
          role="progressbar"
          aria-label={t('conversationTopics.progress')}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      {chapters.map((chapter, chapterIndex) => {
        const allDone = chapter.completed === chapter.stops.length;
        return (
          <section
            key={chapter.theme}
            className="learning-unit"
            aria-labelledby={`chapter-${chapter.theme}`}
          >
            <header className="learning-unit-banner">
              <span className="learning-unit-index">
                {allDone ? (
                  <CheckIcon size={24} weight="bold" />
                ) : (
                  String(chapterIndex + 1).padStart(2, '0')
                )}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold tracking-wider uppercase">
                  {t('conversationTopics.chapter', { number: chapterIndex + 1 })} ·{' '}
                  {chapter.completed}/{chapter.stops.length}
                </span>
                <h2 id={`chapter-${chapter.theme}`}>{themeLabel(chapter.theme)}</h2>
              </div>
            </header>

            <div
              className="learning-route"
              style={{ minHeight: chapter.stops.length * PATH_ROW_HEIGHT }}
            >
              <RouteLine stops={chapter.stops} />
              <ol className="relative m-0 list-none p-0">
                {chapter.stops.map((stop, index) => {
                  const done = stop.status === 'completed' || stop.status === 'perfect';
                  const isSelected = selected?.scenario.id === stop.scenario.id;
                  return (
                    <li
                      key={stop.scenario.id}
                      className="learning-row"
                      id={stop.status === 'active' ? 'conversation-next-stop' : undefined}
                    >
                      <div
                        className="learning-row-stop"
                        style={{ left: `${50 + (pathOffset(index) / 360) * 100}%` }}
                      >
                        <div
                          className="learning-stop"
                          data-status={stop.status}
                          data-selected={isSelected}
                        >
                          {stop.status === 'active' && (
                            <span className="learning-start-tag" aria-hidden="true">
                              {t('conversationTopics.startHere')}
                            </span>
                          )}
                          <button
                            type="button"
                            className="learning-stone learning-conversation-stone"
                            aria-label={stop.scenario.titleTr}
                            aria-expanded={isSelected}
                            aria-current={stop.status === 'active' ? 'step' : undefined}
                            onClick={() => {
                              setSelectedId(isSelected ? null : stop.scenario.id);
                            }}
                          >
                            {stop.status === 'locked' ? (
                              <LockKeyIcon size={30} aria-hidden="true" />
                            ) : (
                              <span className="text-3xl" aria-hidden="true">
                                {stop.scenario.sceneEmoji}
                              </span>
                            )}
                          </button>
                          <span className="learning-stop-name">{stop.scenario.titleTr}</span>
                          {done && (
                            <span
                              className="learning-stars"
                              aria-label={t('conversationTopics.stars', { count: stop.stars })}
                            >
                              {[1, 2, 3].map((star) => (
                                <StarIcon
                                  key={star}
                                  size={13}
                                  weight={star <= stop.stars ? 'fill' : 'regular'}
                                  aria-hidden="true"
                                />
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      {chapterIndex === 0 && index === 1 && (
                        <div className="learning-nova-rest" aria-hidden="true">
                          <NovaCharacter size="md" decorative motionEnabled={false} />
                          <span>Nova</span>
                        </div>
                      )}
                      {isSelected && (
                        <section
                          className="learning-lesson-detail"
                          aria-label={t('conversationTopics.details')}
                        >
                          <button
                            type="button"
                            className="path-icon-button learning-detail-close"
                            onClick={() => {
                              setSelectedId(null);
                            }}
                            aria-label={t('conversationTopics.closeDetails')}
                          >
                            <XIcon size={19} />
                          </button>
                          <div className="flex items-start gap-3">
                            <span className="learning-detail-icon text-2xl" aria-hidden="true">
                              {stop.scenario.sceneEmoji}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="learning-eyebrow">{themeLabel(chapter.theme)}</span>
                              <h3>{stop.scenario.titleTr}</h3>
                              <div className="learning-lesson-meta">
                                <span>
                                  <ClockIcon size={15} aria-hidden="true" />
                                  {t('conversationTopics.minutes', {
                                    count: Math.max(
                                      1,
                                      Math.round(stop.scenario.estimatedDurationSec / 60),
                                    ),
                                  })}
                                </span>
                                <span>
                                  <ChatsCircleIcon size={15} weight="fill" aria-hidden="true" />
                                  {t('conversationTopics.turns', {
                                    count: stop.scenario.turnCount,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p>
                            {stop.status === 'locked'
                              ? t('conversationTopics.locked')
                              : stop.scenario.summaryTr}
                          </p>
                          {stop.status !== 'locked' && stop.scenario.targetWords.length > 0 && (
                            <div className="learning-word-chips">
                              {stop.scenario.targetWords.slice(0, 6).map((word) => (
                                <span lang="en" key={word}>
                                  {word}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button
                            fullWidth
                            disabled={stop.status === 'locked'}
                            onClick={() => {
                              startConversation(stop);
                            }}
                            icon={
                              stop.status === 'locked' ? (
                                <LockKeyIcon size={19} />
                              ) : (
                                <ArrowRightIcon size={19} />
                              )
                            }
                            iconPosition="right"
                          >
                            {stop.status === 'locked'
                              ? t('conversationTopics.lockedCta')
                              : done
                                ? t('conversationTopics.replay')
                                : t('conversationTopics.start')}
                          </Button>
                        </section>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="learning-unit-finish">
              <span />
              <TrophyIcon size={25} weight={allDone ? 'fill' : 'regular'} aria-hidden="true" />
              <strong>
                {t(allDone ? 'conversationTopics.chapterDone' : 'conversationTopics.chapterFinish')}
              </strong>
              <span />
            </div>
          </section>
        );
      })}
    </div>
  );
}
