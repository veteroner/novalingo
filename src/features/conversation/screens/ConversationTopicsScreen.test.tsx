import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

vi.mock('@stores/childStore', () => ({
  useChildStore: (selector: (s: unknown) => unknown) =>
    selector({ activeChild: { id: 'c1', currentWorldId: 'w1' } }),
}));

const progressState = {
  progress: { completedScenarioIds: [] as string[], bestScores: {} as Record<string, number> },
};
vi.mock('@stores/conversationStore', () => ({
  initConversationProgress: vi.fn(),
  useConversationStore: (selector: (s: typeof progressState) => unknown) => selector(progressState),
}));

vi.mock('@services/speech/speechService', () => ({ unlockAudioPlayback: vi.fn() }));

import { PHASE1_CONVERSATION_SCENARIOS } from '@/features/learning/data/conversations';
import ConversationTopicsScreen from './ConversationTopicsScreen';

const first = PHASE1_CONVERSATION_SCENARIOS[0];
const second = PHASE1_CONVERSATION_SCENARIOS.filter((s) => s.theme === first?.theme)[1];

function renderScreen() {
  render(
    <MemoryRouter>
      <ConversationTopicsScreen />
    </MemoryRouter>,
  );
}

describe('ConversationTopicsScreen — konuşma yolu', () => {
  beforeEach(() => {
    navigate.mockReset();
    progressState.progress = { completedScenarioIds: [], bestScores: {} };
  });

  it('senaryoları temalara göre bölümler hâlinde gösterir', () => {
    renderScreen();
    expect(screen.getAllByText(/conversationTopics\.chapter/).length).toBeGreaterThan(1);
  });

  it('ilk durak ayrıntıdan başlatılır', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: first?.titleTr }));
    fireEvent.click(screen.getByRole('button', { name: 'conversationTopics.start' }));
    expect(navigate).toHaveBeenCalledWith(`/conversation?scenarioId=${first?.id}`);
  });

  it('kilitli durak başlatılamaz', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: second?.titleTr }));
    expect(screen.getByRole('button', { name: 'conversationTopics.lockedCta' })).toBeDisabled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('tamamlanan konuşma tekrar oynanabilir ve sıradaki açılır', () => {
    progressState.progress = {
      completedScenarioIds: [first?.id ?? ''],
      bestScores: { [first?.id ?? '']: 90 },
    };
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: second?.titleTr }));
    expect(screen.getByRole('button', { name: 'conversationTopics.start' })).toBeEnabled();
  });
});
