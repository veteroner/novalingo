import { FREE_TIER } from '@/config/constants';
import { Button } from '@components/atoms/Button';
import { NovaCharacter } from '@components/molecules/NovaCharacter';
import { LessonCard } from '@components/organisms/LessonCard';
import { MainLayout } from '@components/templates/MainLayout';
import { curriculum, getWorld } from '@features/learning/data/curriculum';
import type { CurriculumWorld } from '@features/learning/data/curriculum';
import { useLessonProgress, useWorldLessons } from '@hooks/queries';
import { unlockAudioPlayback } from '@services/speech/speechService';
import {
  getDailyLessonCount,
  hasReachedFreeLessonLimit,
  isWorldPremiumLocked,
} from '@services/subscription/premiumAccess';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CaretDownIcon,
  CheckIcon,
  ChatsCircleIcon,
  ClockIcon,
  CompassIcon,
  CrownIcon,
  FlagIcon,
  FlameIcon,
  DiamondIcon,
  LeafIcon,
  LockKeyIcon,
  MountainsIcon,
  SparkleIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { buildLearningPath, PATH_ROW_HEIGHT, pathOffset } from '../components/learningPath';
import type { PathLesson, PathStop } from '../components/learningPath';
import './worldMap.css';

// Dark enough for white chapter text. Each world keeps its own landscape identity.
const WORLD_COLORS: Record<string, string> = {
  w1: '#23775B',
  w2: '#6850AE',
  w3: '#316C63',
  w4: '#386C9D',
  w5: '#366D91',
  w6: '#5746AA',
  w7: '#246F82',
  w8: '#A65330',
  w9: '#97517F',
  w10: '#A6455C',
  w11: '#43703F',
  w12: '#796326',
};

function PathLandscape({ variant }: { variant: number }) {
  const Icon = variant % 3 === 0 ? LeafIcon : variant % 3 === 1 ? MountainsIcon : SparkleIcon;
  return (
    <div className="path-landscape" aria-hidden="true">
      <span className="path-landscape-island">
        <Icon size={46} weight="duotone" />
      </span>
      <span className="path-landscape-spark">✦</span>
      <span className="path-landscape-leaf">
        <LeafIcon size={24} weight="fill" />
      </span>
    </div>
  );
}

function PathConnector({ stops }: { stops: PathStop[] }) {
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
        const done = stop.kind === 'lesson' && stop.lesson.stars >= 1;
        return (
          <path
            key={stop.id}
            d={`M ${x} ${y} C ${x} ${y + 76}, ${nextX} ${nextY - 76}, ${nextX} ${nextY}`}
            className={done ? 'is-complete' : ''}
          />
        );
      })}
    </svg>
  );
}

export default function WorldMapScreen() {
  const { worldId = 'w1' } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('home');
  const child = useChildStore((s) => s.activeChild);
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);
  const { data: remoteLessons, isLoading } = useWorldLessons(worldId);
  const { data: lessonProgress } = useLessonProgress(child?.id);
  const world = getWorld(worldId);
  const units = useMemo(
    () => (world ? buildLearningPath(world, remoteLessons, lessonProgress) : []),
    [world, remoteLessons, lessonProgress],
  );
  const lessons = units.flatMap((entry) => entry.lessons);
  const nextLesson = lessons.find((lesson) => lesson.status === 'active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = lessons.find((lesson) => lesson.id === selectedId);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [worldPickerOpen, setWorldPickerOpen] = useState(false);
  const english = i18n.language.startsWith('en');
  const localized = (item: { name: string; nameEn: string }) => (english ? item.nameEn : item.name);
  const completedCount = lessons.filter((lesson) => lesson.stars >= 1).length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const currentOrder = getWorld(child?.currentWorldId ?? 'w1')?.order ?? 1;
  const futureWorld = !!world && world.order > currentOrder;
  const premiumLocked = !!world && isWorldPremiumLocked(user, world);
  const dailyLimit = hasReachedFreeLessonLimit(user, lessonProgress, child);
  const lessonsToday = getDailyLessonCount(child, lessonProgress);
  const color = WORLD_COLORS[worldId] ?? '#5145C8';

  function launchLesson(lesson: PathLesson) {
    if (futureWorld || lesson.status === 'locked') return;
    if (premiumLocked || dailyLimit) {
      showToast({
        type: 'info',
        title: t(premiumLocked ? 'premium.title' : 'worldMap.limitTitle'),
        message: t(premiumLocked ? 'worldMap.premiumMessage' : 'worldMap.limitMessage'),
      });
      void navigate('/subscription');
      return;
    }
    void unlockAudioPlayback();
    void navigate(`/lesson/${lesson.id}`);
  }
  function visitWorld(target: CurriculumWorld) {
    if (target.order > currentOrder) return;
    setSelectedId(null);
    setGuideId(null);
    setWorldPickerOpen(false);
    void navigate(`/world/${target.id}`);
  }
  function closeDetails() {
    document
      .querySelector<HTMLButtonElement>('.learning-stop[data-selected="true"] .learning-stone')
      ?.focus();
    setSelectedId(null);
  }
  function resumePath() {
    const target = document.getElementById('learning-next-stop');
    target?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center',
    });
    setSelectedId(nextLesson?.id ?? null);
  }

  if (!world)
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h1 className="font-heading text-2xl">{t('path.notFound')}</h1>
          <Button onClick={() => void navigate('/home')}>{t('worldMap.back')}</Button>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout wide>
      <div
        className="learning-map"
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeDetails();
        }}
        style={{ '--world-color': color } as CSSProperties}
      >
        <header className="learning-topbar">
          <button
            type="button"
            className="path-icon-button"
            aria-label={t('worldMap.back')}
            onClick={() => void navigate('/home')}
          >
            <ArrowLeftIcon size={22} weight="bold" />
          </button>
          <div className="learning-world-picker">
            <button
              type="button"
              aria-expanded={worldPickerOpen}
              aria-controls="learning-world-list"
              onClick={() => {
                setWorldPickerOpen(!worldPickerOpen);
              }}
              className="learning-world-title"
            >
              <span className="text-xs font-extrabold tracking-widest uppercase">
                {t('path.worldNumber', { number: world.order })}
              </span>
              <span className="flex items-center gap-2 font-extrabold">
                {localized(world)}
                <CaretDownIcon size={16} aria-hidden="true" />
              </span>
            </button>
          </div>
          <div className="learning-stats" aria-label={t('path.yourStats')}>
            <span title={t('streakLabel')}>
              <FlameIcon size={21} weight="fill" className="text-streak" aria-hidden="true" />
              {child?.currentStreak ?? 0}
            </span>
            <span title={t('path.gems')}>
              <DiamondIcon size={21} weight="fill" className="text-gem" aria-hidden="true" />
              {child?.gems ?? 0}
            </span>
          </div>
        </header>
        {worldPickerOpen && (
          <section
            id="learning-world-list"
            className="learning-world-list"
            aria-label={t('worldsTitle')}
          >
            {curriculum.map((target) => (
              <button
                type="button"
                key={target.id}
                disabled={target.order > currentOrder}
                aria-current={target.id === worldId ? 'page' : undefined}
                onClick={() => {
                  visitWorld(target);
                }}
              >
                <span
                  className="learning-world-number"
                  style={{ backgroundColor: WORLD_COLORS[target.id] }}
                >
                  {target.order}
                </span>
                <span className="flex-1 text-left">
                  <strong>{localized(target)}</strong>
                  <small>
                    {t(
                      target.order > currentOrder
                        ? 'path.worldLocked'
                        : target.order < currentOrder
                          ? 'path.worldFinished'
                          : 'hero.currentWorld',
                    )}
                  </small>
                </span>
                {target.order > currentOrder ? (
                  <LockKeyIcon size={18} aria-hidden="true" />
                ) : target.id === worldId ? (
                  <CheckIcon size={20} aria-hidden="true" />
                ) : (
                  <ArrowRightIcon size={18} aria-hidden="true" />
                )}
              </button>
            ))}
          </section>
        )}

        <div className="learning-columns">
          <div className="learning-main">
            <div className="learning-intro">
              <div>
                <span className="learning-eyebrow">
                  <CompassIcon size={17} weight="bold" aria-hidden="true" />
                  {t('path.eyebrow')}
                </span>
                <h1>{t('path.title')}</h1>
                <p>{t('path.subtitle')}</p>
              </div>
              {nextLesson && (
                <button type="button" className="learning-resume" onClick={resumePath}>
                  <FlagIcon size={18} weight="fill" aria-hidden="true" />
                  {t('path.findMyPlace')}
                </button>
              )}
            </div>
            <div className="learning-world-progress">
              <span>
                {t('worldMap.lessonsCompleted', {
                  completed: completedCount,
                  total: lessons.length,
                })}
              </span>
              <strong>{progress}%</strong>
              <div
                role="progressbar"
                aria-label={t('path.worldProgress')}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            {isLoading && (
              <p className="px-5 text-sm" role="status">
                {t('path.syncing')}
              </p>
            )}
            {futureWorld && (
              <p className="learning-access-note">
                <LockKeyIcon size={18} aria-hidden="true" />
                {t('path.worldLocked')}
              </p>
            )}
            {units.map(({ unit, lessons: unitLessons, stops, completed }, unitIndex) => {
              const guide = guideId === unit.id;
              const words = [...new Set(unit.lessons.flatMap((lesson) => lesson.vocabulary))].slice(
                0,
                8,
              );
              const chunks = [
                ...new Set(unit.lessons.flatMap((lesson) => lesson.chunks ?? [])),
              ].slice(0, 3);
              return (
                <section
                  className="learning-unit"
                  key={unit.id}
                  aria-labelledby={`title-${unit.id}`}
                >
                  <header className="learning-unit-banner">
                    <span className="learning-unit-index">
                      {completed === unitLessons.length ? (
                        <CheckIcon size={24} weight="bold" />
                      ) : (
                        String(unitIndex + 1).padStart(2, '0')
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-extrabold tracking-wider uppercase">
                        {t('path.unitNumber', { number: unitIndex + 1 })} · {completed}/
                        {unitLessons.length}
                      </span>
                      <h2 id={`title-${unit.id}`}>{localized(unit)}</h2>
                    </div>
                    <button
                      type="button"
                      className="learning-guide-button"
                      aria-label={t('path.guide')}
                      aria-expanded={guide}
                      aria-controls={`guide-${unit.id}`}
                      onClick={() => {
                        setGuideId(guide ? null : unit.id);
                      }}
                    >
                      <BookOpenIcon size={23} weight="bold" aria-hidden="true" />
                      <span>{t('path.guide')}</span>
                    </button>
                  </header>
                  {guide && (
                    <div id={`guide-${unit.id}`} className="learning-guide">
                      <button
                        type="button"
                        className="path-icon-button float-right"
                        onClick={() => {
                          setGuideId(null);
                        }}
                        aria-label={t('path.closeGuide')}
                      >
                        <XIcon size={20} />
                      </button>
                      <span className="learning-eyebrow">{t('path.guideEyebrow')}</span>
                      <h3>{localized(unit)}</h3>
                      <p>{english ? (unit.canDo ?? unit.nameEn) : unit.description}</p>
                      {words.length > 0 && (
                        <>
                          <h4>{t('path.keyWords')}</h4>
                          <div className="learning-word-chips">
                            {words.map((word) => (
                              <span lang="en" key={word}>
                                {word}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      {chunks.length > 0 && (
                        <>
                          <h4>{t('path.trySaying')}</h4>
                          {chunks.map((chunk) => (
                            <p key={chunk} lang="en" className="learning-chunk">
                              {chunk}
                            </p>
                          ))}
                        </>
                      )}
                      <p className="text-sm">{t('path.guideTip')}</p>
                    </div>
                  )}
                  <div
                    className="learning-route"
                    style={{ minHeight: stops.length * PATH_ROW_HEIGHT }}
                  >
                    <PathConnector stops={stops} />
                    {stops.length >= 4 && <PathLandscape variant={world.order + unitIndex} />}
                    <ol className="relative m-0 list-none p-0">
                      {stops.map((stop, index) => (
                        <li
                          key={stop.id}
                          className="learning-row"
                          id={
                            stop.kind === 'lesson' && stop.lesson.status === 'active'
                              ? 'learning-next-stop'
                              : undefined
                          }
                        >
                          <div
                            className="learning-row-stop"
                            style={{ left: `${50 + (pathOffset(index) / 360) * 100}%` }}
                          >
                            {stop.kind === 'lesson' ? (
                              <LessonCard
                                lesson={stop.lesson}
                                status={stop.lesson.status}
                                stars={stop.lesson.stars}
                                index={unitIndex * 100 + index}
                                selected={selected?.id === stop.id}
                                onClick={() => {
                                  setSelectedId(stop.id);
                                }}
                              />
                            ) : (
                              <div
                                className="learning-stop"
                                data-status={stop.unlocked ? 'conversation' : 'locked'}
                              >
                                <button
                                  type="button"
                                  className="learning-stone learning-conversation-stone"
                                  aria-label={t('conversation.title')}
                                  disabled={!stop.unlocked || futureWorld}
                                  onClick={() => {
                                    void unlockAudioPlayback();
                                    void navigate(`/conversation?worldId=${world.id}`);
                                  }}
                                >
                                  {stop.unlocked ? (
                                    <ChatsCircleIcon size={32} weight="fill" aria-hidden="true" />
                                  ) : (
                                    <LockKeyIcon size={30} aria-hidden="true" />
                                  )}
                                </button>
                                <span className="learning-stop-name">{t('path.speakingStop')}</span>
                              </div>
                            )}
                          </div>
                          {index === 1 && (
                            <div className="learning-nova-rest" aria-hidden="true">
                              <NovaCharacter size="md" decorative motionEnabled={false} />
                              <span>Nova</span>
                            </div>
                          )}
                          {selected && stop.kind === 'lesson' && selected.id === stop.id && (
                            <section
                              id="path-lesson-detail"
                              className="learning-lesson-detail"
                              aria-label={t('path.lessonDetails')}
                            >
                              <button
                                type="button"
                                className="path-icon-button learning-detail-close"
                                onClick={closeDetails}
                                aria-label={t('path.closeDetails')}
                              >
                                <XIcon size={19} />
                              </button>
                              <div className="flex items-start gap-3">
                                <span className="learning-detail-icon">
                                  {selected.type === 'boss' ? (
                                    <CrownIcon size={27} weight="fill" />
                                  ) : (
                                    <BookOpenIcon size={27} weight="duotone" />
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="learning-eyebrow">
                                    {t(`path.status.${selected.status}`)}
                                  </span>
                                  <h3>{localized(selected)}</h3>
                                  <div className="learning-lesson-meta">
                                    <span>
                                      <ClockIcon size={15} aria-hidden="true" />
                                      {t('path.minutes', { count: selected.estimatedMinutes })}
                                    </span>
                                    <span>
                                      <SparkleIcon size={15} weight="fill" aria-hidden="true" />
                                      {selected.xpReward} XP
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p>
                                {futureWorld
                                  ? t('path.worldLocked')
                                  : selected.status === 'locked'
                                    ? t('path.lessonLocked')
                                    : selected.status === 'active'
                                      ? t('path.novaEncouragement')
                                      : t('path.reviewHint')}
                              </p>
                              <Button
                                fullWidth
                                disabled={selected.status === 'locked' || futureWorld}
                                onClick={() => {
                                  launchLesson(selected);
                                }}
                                icon={
                                  selected.status === 'locked' || futureWorld ? (
                                    <LockKeyIcon size={19} />
                                  ) : (
                                    <ArrowRightIcon size={19} />
                                  )
                                }
                                iconPosition="right"
                              >
                                {futureWorld || selected.status === 'locked'
                                  ? t('worldMap.locked')
                                  : premiumLocked
                                    ? t('path.unlockPlus')
                                    : dailyLimit
                                      ? t('path.dailyLimitCta')
                                      : selected.status === 'active'
                                        ? t('path.startLesson')
                                        : t('path.reviewLesson')}
                              </Button>
                            </section>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="learning-unit-finish">
                    <span />
                    <TrophyIcon
                      size={25}
                      weight={completed === unitLessons.length ? 'fill' : 'regular'}
                      aria-hidden="true"
                    />
                    <strong>
                      {t(
                        completed === unitLessons.length ? 'path.unitCompleted' : 'path.unitFinish',
                      )}
                    </strong>
                    <span />
                  </div>
                </section>
              );
            })}
            {lessons.length > 0 && !nextLesson && (
              <section className="learning-world-finish">
                <NovaCharacter mood="happy" size="lg" decorative />
                <h2>{t('path.worldCompleted')}</h2>
                <p>{t('path.worldCompletedHint')}</p>
                <Button onClick={() => void navigate('/home')}>{t('worldMap.back')}</Button>
              </section>
            )}
            {lessons.length === 0 && !isLoading && (
              <p className="p-8 text-center">{t('path.empty')}</p>
            )}
          </div>
          <aside className="learning-sidebar" aria-label={t('path.yourJourney')}>
            <section className="learning-side-card learning-nova-card">
              <NovaCharacter size="lg" decorative />
              <span className="learning-eyebrow">{t('path.novaWithYou')}</span>
              <h2>{t('path.smallSteps')}</h2>
              <p>{t('path.novaEncouragement')}</p>
              {nextLesson && (
                <button type="button" className="learning-text-action" onClick={resumePath}>
                  {t('path.findMyPlace')}
                  <ArrowRightIcon size={18} />
                </button>
              )}
            </section>
            <section className="learning-side-card">
              <div className="flex items-center gap-2">
                <TargetIcon size={24} className="text-primary" aria-hidden="true" />
                <h2>{t('dailyGoal')}</h2>
              </div>
              <p>
                {user?.isPremium
                  ? t('dailyGoalUnlimited')
                  : t('dailyGoalProgress', {
                      current: lessonsToday,
                      target: FREE_TIER.DAILY_LESSONS,
                    })}
              </p>
              <button
                type="button"
                className="learning-text-action"
                onClick={() => void navigate('/quests')}
              >
                {t('quickActions.quests')}
                <ArrowRightIcon size={18} />
              </button>
            </section>
            <section className="learning-side-card">
              <StarIcon size={26} className="text-primary" weight="duotone" aria-hidden="true" />
              <h2>{t('path.practiceTitle')}</h2>
              <p>{t('path.practiceHint')}</p>
              <button
                type="button"
                className="learning-text-action"
                onClick={() => void navigate('/review')}
              >
                {t('review.title')}
                <ArrowRightIcon size={18} />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
