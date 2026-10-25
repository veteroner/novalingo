import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SEASONAL_EVENTS } from '../data/seasonalEvents';
import SeasonalEventScreen from './SeasonalEventScreen';

const state = vi.hoisted(() => ({ active: 'halloween', language: 'tr' }));
vi.mock('@/hooks/useSeasonalEvent', () => ({
  useSeasonalEvent: () => ({
    activeEvent: { id: state.active },
    daysRemaining: 3,
    progress: { lessonsCompleted: ['winter-1'], collectiblesEarned: ['winter-snowflake'] },
    lessonsCompleted: 5,
    totalLessons: 5,
    isEventComplete: true,
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: state.language } }),
}));

function show(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/event/${id}`]}>
      <Routes>
        <Route path="/event/:eventId" element={<SeasonalEventScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SeasonalEventScreen', () => {
  it('does not show another active event’s completion or earned rewards', () => {
    state.language = 'tr';
    state.active = 'halloween';
    show('winter-festival');
    expect(screen.queryByText('event.allComplete')).not.toBeInTheDocument();
    expect(screen.getAllByText('event.lockedReward')).toHaveLength(3);
    expect(screen.queryByText(SEASONAL_EVENTS[1]!.collectibles[0]!.name)).not.toBeInTheDocument();
  });

  it('keeps the active event’s actual completion visible', () => {
    state.language = 'tr';
    state.active = 'halloween';
    show('halloween');
    expect(screen.getByText('event.allComplete')).toBeInTheDocument();
  });

  it('uses the English event and lesson names when English is selected', () => {
    state.language = 'en';
    state.active = 'halloween';
    show('halloween');
    expect(screen.getByRole('heading', { name: 'Spooky English' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Spooky Words' })).toBeInTheDocument();
    expect(screen.getByText('event.xpBonus')).toBeInTheDocument();
  });
});
