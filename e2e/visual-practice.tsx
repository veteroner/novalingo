// DEV-only practice flow: real activity components and scoring, with no backend submission.
import type { Activity } from '../src/types/content';
import type { ActivityOutcome } from '../src/features/learning/components/activities';
import { ActivityRenderer } from '../src/features/learning/components/activities';
import { LessonLayout } from '../src/components/templates/LessonLayout';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

const sample = (id: string, data: Activity['data']): Activity => ({
  id,
  type: data.type,
  data,
  order: 0,
  timeLimit: null,
  maxAttempts: 3,
});
const activities: Activity[] = [
  sample('intro', { type: 'lesson-intro', text: 'Hi! Let’s meet some cute pets today!' }),
  sample('word', {
    type: 'flash-card',
    word: 'dog',
    translation: 'köpek',
    imageUrl: '',
    audioUrl: '',
    exampleSentence: 'I see a dog.',
    exampleTranslation: 'Bir köpek görüyorum.',
  }),
  sample('listen', {
    type: 'listen-and-tap',
    audioUrl: '',
    correctAnswer: 'dog',
    options: ['cat', 'dog', 'fish', 'bird'],
    imageHint: null,
  }),
  sample('match', {
    type: 'match-pairs',
    pairs: [
      { id: 'dog', left: 'dog', right: 'köpek', leftType: 'text', rightType: 'text' },
      { id: 'cat', left: 'cat', right: 'kedi', leftType: 'text', rightType: 'text' },
    ],
  }),
  sample('fill', {
    type: 'fill-blank',
    sentence: 'I see a ___.',
    translation: 'Bir köpek görüyorum.',
    correctAnswer: 'dog',
    options: ['bird', 'dog', 'fish'],
    audioUrl: '',
  }),
  sample('outro', { type: 'lesson-outro', text: 'Wonderful! You know dog and cat. High five!' }),
];

export function PracticeFixture() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const outcomes = useRef<ActivityOutcome[]>([]);
  const started = useRef(Date.now());
  const busy = useRef(false);
  function complete(outcome: ActivityOutcome) {
    if (busy.current) return;
    busy.current = true;
    outcomes.current.push(outcome);
    if (index < activities.length - 1) {
      setIndex(index + 1);
      busy.current = false;
    } else {
      const graded = outcomes.current.slice(1, -1);
      const correct = graded.filter((entry) => entry.isCorrect).length;
      void navigate('/lesson-result', {
        state: {
          summary: {
            lessonId: 'visual-practice',
            totalActivities: graded.length,
            correctAnswers: correct,
            wrongAnswers: graded.length - correct,
            accuracy: correct / graded.length,
            score: Math.round(graded.reduce((sum, entry) => sum + entry.score, 0) / graded.length),
            durationSeconds: Math.round((Date.now() - started.current) / 1000),
            hintsUsed: 0,
            results: [],
          },
          vocabulary: ['dog', 'cat'],
        },
      });
    }
  }
  const activity = activities[index]!;
  return (
    <LessonLayout
      progress={index / activities.length}
      currentQuestion={index + 1}
      totalQuestions={activities.length}
      onClose={() => void navigate('/home')}
    >
      <div className="flex min-h-full items-center justify-center py-5">
        <ActivityRenderer key={activity.id} activity={activity} onComplete={complete} />
      </div>
    </LessonLayout>
  );
}
