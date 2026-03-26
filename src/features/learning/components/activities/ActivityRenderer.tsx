/**
 * ActivityRenderer
 *
 * Aktivite tipine göre doğru bileşeni render eder.
 * Her aktivite tamamlandığında onComplete callback'i çağırır.
 */

import type { Activity, ActivityData, ActivityType } from '@/types/content';
import { Text } from '@components/atoms/Text';
import ActivityErrorBoundary from './ActivityErrorBoundary';
import ConversationActivity from './ConversationActivity';
import FillBlankActivity from './FillBlankActivity';
import FlashCardActivity from './FlashCardActivity';
import GrammarTransformActivity from './GrammarTransformActivity';
import LessonSlideActivity from './LessonSlideActivity';
import ListenAndTapActivity from './ListenAndTapActivity';
import MatchPairsActivity from './MatchPairsActivity';
import MemoryGameActivity from './MemoryGameActivity';
import QuizBattleActivity from './QuizBattleActivity';
import SentenceBuilderActivity from './SentenceBuilderActivity';
import SpeakItActivity from './SpeakItActivity';
import StoryComprehensionActivity from './StoryComprehensionActivity';
import StoryTimeActivity from './StoryTimeActivity';
import type { ActivityOutcome } from './types';
import WordBuilderActivity from './WordBuilderActivity';
import WordSearchActivity from './WordSearchActivity';

interface ActivityRendererProps {
  activity: Activity;
  onComplete: (outcome: ActivityOutcome) => void;
}

export default function ActivityRenderer({ activity, onComplete }: ActivityRendererProps) {
  return (
    <ActivityErrorBoundary key={activity.id} onSkip={onComplete}>
      {renderActivity(activity, onComplete)}
    </ActivityErrorBoundary>
  );
}

function hasActivityData<TType extends ActivityType>(
  activity: Activity,
  type: TType,
): activity is Activity & { type: TType; data: Extract<ActivityData, { type: TType }> } {
  return activity.type === type && activity.data.type === type;
}

function renderUnknownActivity() {
  return (
    <div className="p-8 text-center">
      <Text variant="body" className="text-error">
        Bilinmeyen aktivite tipi
      </Text>
    </div>
  );
}

function renderActivity(activity: Activity, onComplete: (outcome: ActivityOutcome) => void) {
  switch (activity.type) {
    case 'flash-card':
      if (!hasActivityData(activity, 'flash-card')) return renderUnknownActivity();
      return <FlashCardActivity data={activity.data} onComplete={onComplete} />;

    case 'match-pairs':
      if (!hasActivityData(activity, 'match-pairs')) return renderUnknownActivity();
      return <MatchPairsActivity data={activity.data} onComplete={onComplete} />;

    case 'listen-and-tap':
      if (!hasActivityData(activity, 'listen-and-tap')) return renderUnknownActivity();
      return <ListenAndTapActivity data={activity.data} onComplete={onComplete} />;

    case 'word-builder':
      if (!hasActivityData(activity, 'word-builder')) return renderUnknownActivity();
      return <WordBuilderActivity data={activity.data} onComplete={onComplete} />;

    case 'fill-blank':
      if (!hasActivityData(activity, 'fill-blank')) return renderUnknownActivity();
      return <FillBlankActivity data={activity.data} onComplete={onComplete} />;

    case 'speak-it':
      if (!hasActivityData(activity, 'speak-it')) return renderUnknownActivity();
      return <SpeakItActivity data={activity.data} onComplete={onComplete} />;

    case 'story-time':
      if (!hasActivityData(activity, 'story-time')) return renderUnknownActivity();
      return <StoryTimeActivity data={activity.data} onComplete={onComplete} />;

    case 'memory-game':
      if (!hasActivityData(activity, 'memory-game')) return renderUnknownActivity();
      return <MemoryGameActivity data={activity.data} onComplete={onComplete} />;

    case 'word-search':
      if (!hasActivityData(activity, 'word-search')) return renderUnknownActivity();
      return <WordSearchActivity data={activity.data} onComplete={onComplete} />;

    case 'quiz-battle':
      if (!hasActivityData(activity, 'quiz-battle')) return renderUnknownActivity();
      return <QuizBattleActivity data={activity.data} onComplete={onComplete} />;

    case 'sentence-builder':
      if (!hasActivityData(activity, 'sentence-builder')) return renderUnknownActivity();
      return <SentenceBuilderActivity data={activity.data} onComplete={onComplete} />;

    case 'story-comprehension':
      if (!hasActivityData(activity, 'story-comprehension')) return renderUnknownActivity();
      return <StoryComprehensionActivity data={activity.data} onComplete={onComplete} />;

    case 'grammar-transform':
      if (!hasActivityData(activity, 'grammar-transform')) return renderUnknownActivity();
      return <GrammarTransformActivity data={activity.data} onComplete={onComplete} />;

    case 'conversation':
      if (!hasActivityData(activity, 'conversation')) return renderUnknownActivity();
      return <ConversationActivity data={activity.data} onComplete={onComplete} />;

    case 'lesson-intro':
      if (!hasActivityData(activity, 'lesson-intro')) return renderUnknownActivity();
      return <LessonSlideActivity data={activity.data} onComplete={onComplete} />;

    case 'lesson-outro':
      if (!hasActivityData(activity, 'lesson-outro')) return renderUnknownActivity();
      return <LessonSlideActivity data={activity.data} onComplete={onComplete} />;

    default:
      return renderUnknownActivity();
  }
}
