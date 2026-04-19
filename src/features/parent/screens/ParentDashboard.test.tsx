import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();

const authState = {
  firebaseUser: null,
  user: { settings: { parentPin: null } },
};

const childState = {
  activeChild: {
    id: 'child-1',
    name: 'Ada',
    completedLessons: 10,
    totalPlayTimeMinutes: 100,
    totalXP: 350,
    currentWorldId: 'w3',
  },
};

const queryState = {
  outcomeMetrics: {
    vocabularyTopics: [],
    masteryTopics: [],
    retentionTopics: [],
    patternAcquisitions: [],
    totalLessonsCompleted: 0,
  },
  canDoStatements: {
    lessonStatements: ['Basit yönergeleri takip edebiliyor.'],
    unitStatements: [],
    conversationStatements: ['clothes konuşmasında coat ve boots kelimelerini kullandı.'],
    evidenceCount: 2,
  },
  conversationHighlights: [
    {
      id: 'conv-1',
      scenarioTheme: 'clothes',
      acceptedTurns: 2,
      hintedTurns: 1,
      passed: false,
      score: 68,
      targetWordsHit: ['coat', 'boots'],
      patternsHit: ['I wear ___'],
      rawChildResponses: ['I wear my blue coat', 'boots for rain'],
      rawAnswerPreview: 'I wear my blue coat • boots for rain',
      completedAtMs: Date.now() - 60_000,
    },
  ],
  conversationThemeProgress: [
    {
      theme: 'food',
      attempts: 4,
      successRate: 1,
      averageScore: 93,
      averageAcceptedTurns: 3.6,
      averageHints: 0.1,
      recentWords: ['juice', 'sandwich'],
      recentUtterances: ['I like apple juice', 'I want a sandwich'],
    },
    {
      theme: 'school',
      attempts: 3,
      successRate: 0.8,
      averageScore: 84,
      averageAcceptedTurns: 3,
      averageHints: 0.3,
      recentWords: ['pencil', 'book'],
      recentUtterances: ['I bring my pencil case'],
    },
    {
      theme: 'clothes',
      attempts: 3,
      successRate: 0.5,
      averageScore: 68,
      averageAcceptedTurns: 2.1,
      averageHints: 1.2,
      recentWords: ['coat', 'boots', 'hat'],
      recentUtterances: ['I wear my blue coat', 'boots for rain'],
    },
  ],
  weeklyStats: {
    lessonsThisWeek: 4,
    lessonsLastWeek: 3,
    avgAccuracyThisWeek: 0.82,
    totalXpThisWeek: 120,
    totalMinutesThisWeek: 42,
    streakDays: 4,
    perfectLessonsThisWeek: 1,
    speakingLessonsThisWeek: 2,
  },
  weakTopics: [],
  learningStats: {
    activeWordsLearned: 12,
    patternsUsed: 4,
    wordsDueForReview: 2,
    totalWordsSeen: 30,
    conversationWordsSpoken: 8,
    conversationThemesExplored: 3,
  },
  efficacy: {
    retentionTrend: 0.1,
    productiveLanguageScore: 0.72,
    speakingActivitiesCompleted: 3,
    totalSpeakingSessions: 4,
    conversationSuccessRate: 0.75,
    averageAcceptedTurns: 2.9,
    activeVocabularyRatio: 0.6,
    recentTrendDelta: 0.15,
    consistencyScore: 0.7,
    conversationCompletions: 4,
    masteredConversationPatterns: 2,
    prePostDelta: 0.2,
    skillBreakdown: {
      listening: 0.6,
      speaking: 0.7,
      reading: 0.5,
      writing: 0.4,
    },
  },
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/hooks/queries/useParentQueries', () => ({
  useOutcomeMetrics: () => ({ data: queryState.outcomeMetrics, isLoading: false }),
  useCanDoStatements: () => ({ data: queryState.canDoStatements }),
  useConversationHighlights: () => ({ data: queryState.conversationHighlights }),
  useConversationThemeProgress: () => ({ data: queryState.conversationThemeProgress }),
  useWeeklyProgress: () => ({ data: queryState.weeklyStats }),
  useWeakTopics: () => ({ data: queryState.weakTopics }),
  useLearningStats: () => ({ data: queryState.learningStats }),
  useEfficacyIndicators: () => ({ data: queryState.efficacy }),
}));

vi.mock('@stores/authStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

vi.mock('@stores/childStore', () => ({
  useChildStore: (selector: (state: typeof childState) => unknown) => selector(childState),
}));

vi.mock('@services/firebase/functions', () => ({
  verifyParentPin: vi.fn(),
}));

vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@components/atoms/Text', () => ({
  Text: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@components/molecules/ListItem', () => ({
  ListItem: ({ title, onClick }: { title: string; onClick?: () => void }) => (
    <button onClick={onClick}>{title}</button>
  ),
}));

import ParentDashboard from './ParentDashboard';

async function unlockDashboard() {
  render(<ParentDashboard />);

  fireEvent.click(screen.getByRole('button', { name: '1' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  fireEvent.click(screen.getByRole('button', { name: '4' }));

  await screen.findByText('🧭 Konuşma Temaları');
}

describe('ParentDashboard', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    authState.firebaseUser = null;
    authState.user = { settings: { parentPin: null } };
    childState.activeChild = {
      id: 'child-1',
      name: 'Ada',
      completedLessons: 10,
      totalPlayTimeMinutes: 100,
      totalXP: 350,
      currentWorldId: 'w3',
    };
  });

  it('renders conversation analytics blocks including the recommended repeat theme', async () => {
    await unlockDashboard();

    expect(screen.getByText('🎙️ Son Konuşma Oturumları')).toBeInTheDocument();
    expect(screen.getByText('Güçlü giden temalar')).toBeInTheDocument();
    expect(screen.getByText('Biraz daha destek isteyen temalar')).toBeInTheDocument();
    expect(screen.getByText('Tekrar için önerilen tema: clothes')).toBeInTheDocument();
    expect(screen.getByText(/Bu temada oturum başına ortalama 1.2 ipucu/)).toBeInTheDocument();
    expect(screen.getByText('Tema bazlı gerçek cümle örnekleri')).toBeInTheDocument();
    expect(screen.getAllByText('coat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('boots').length).toBeGreaterThan(0);
    expect(screen.getByText('I wear my blue coat • boots for rain')).toBeInTheDocument();
    expect(screen.getByText('“I like apple juice”')).toBeInTheDocument();
  });

  it('starts a conversation directly from the recommended theme CTA', async () => {
    await unlockDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Bu temayla konuşmayı başlat' }));

    expect(navigateMock).toHaveBeenCalledWith('/conversation?theme=clothes');
  });
});
