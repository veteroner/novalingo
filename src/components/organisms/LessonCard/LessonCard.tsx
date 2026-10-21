import type { Lesson } from '@/types';
import {
  BookOpenIcon,
  CheckIcon,
  CrownIcon,
  GiftIcon,
  LockKeyIcon,
  StarIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import type { LessonStatus } from '@features/home/components/learningPath';

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  stars?: number;
  index: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Inspect a stop, then launch from its lesson card. Locked stops explain the next step. */
export function LessonCard({
  lesson,
  status,
  stars = 0,
  index,
  selected = false,
  onClick,
  className,
}: LessonCardProps) {
  const { t, i18n } = useTranslation('home');
  const name = i18n.language.startsWith('en') ? lesson.nameEn : lesson.name;
  const completed = status === 'completed' || status === 'perfect';
  const Icon =
    status === 'locked'
      ? LockKeyIcon
      : completed
        ? CheckIcon
        : lesson.type === 'boss'
          ? CrownIcon
          : lesson.type === 'bonus'
            ? GiftIcon
            : lesson.type === 'review'
              ? ArrowsClockwiseIcon
              : BookOpenIcon;
  return (
    <div className={clsx('learning-stop', className)} data-status={status} data-selected={selected}>
      {status === 'active' && (
        <span className="learning-start-tag" aria-hidden="true">
          {t('path.startHere')}
        </span>
      )}
      <button
        type="button"
        className="learning-stone"
        onClick={onClick}
        aria-label={name}
        aria-expanded={selected}
        aria-controls={selected ? 'path-lesson-detail' : undefined}
        aria-current={status === 'active' ? 'step' : undefined}
        aria-describedby={`lesson-state-${index}`}
      >
        <Icon
          size={32}
          weight={completed || lesson.type === 'boss' ? 'fill' : 'bold'}
          aria-hidden="true"
        />
        <span id={`lesson-state-${index}`} className="sr-only">
          {t(`path.status.${status}`)}
        </span>
      </button>
      <span className="learning-stop-name">{name}</span>
      {completed && (
        <span className="learning-stars" aria-label={t('path.starsEarned', { count: stars })}>
          {[1, 2, 3].map((star) => (
            <StarIcon
              key={star}
              size={13}
              weight={star <= stars ? 'fill' : 'regular'}
              aria-hidden="true"
            />
          ))}
        </span>
      )}
    </div>
  );
}
