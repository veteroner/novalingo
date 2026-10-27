import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SEASONAL_EVENTS } from '../data/seasonalEvents';
import { SeasonalEventBanner } from './SeasonalEventBanner';

const state = vi.hoisted(() => ({ active: true, upcoming: true, language: 'tr' }));
vi.mock('@/hooks/useSeasonalEvent', () => ({
  useSeasonalEvent: () => ({
    activeEvent: state.active ? SEASONAL_EVENTS[0] : undefined,
    nextEvent: state.upcoming ? SEASONAL_EVENTS[1] : undefined,
    daysRemaining: 3,
    lessonsCompleted: 2,
    totalLessons: 5,
    isEventComplete: false,
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      options?.name ? `${key}: ${options.name}` : key,
    i18n: { language: state.language },
  }),
}));
function Location() {
  return <output aria-label="route">{useLocation().pathname}</output>;
}
function show() {
  return render(
    <MemoryRouter>
      <SeasonalEventBanner />
      <Location />
    </MemoryRouter>,
  );
}
beforeEach(() => {
  state.active = true;
  state.upcoming = true;
  state.language = 'tr';
});

describe('SeasonalEventBanner', () => {
  it('exposes the active event as a focusable button and navigates to the right event', () => {
    show();
    const button = screen.getByRole('button', { name: /Cadılar Bayramı/ });
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(screen.getByLabelText('route')).toHaveTextContent('/event/halloween');
  });
  it('uses the English active name, description and XP copy', () => {
    state.language = 'en';
    show();
    expect(screen.getByRole('button', { name: /Spooky English/ })).toBeInTheDocument();
    expect(screen.getByText('Learn spooky words and collect candy!')).toBeInTheDocument();
    expect(screen.getByText('event.xpBonus')).toBeInTheDocument();
    expect(screen.queryByText('Cadılar Bayramı')).not.toBeInTheDocument();
  });
  it('localizes the upcoming preview without making it an active event action', () => {
    state.active = false;
    state.language = 'en';
    show();
    expect(screen.getByText(`event.upcoming: ${SEASONAL_EVENTS[1]!.nameEn}`)).toBeInTheDocument();
    expect(screen.getByText(SEASONAL_EVENTS[1]!.descriptionEn)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('does not invent an event when neither event exists', () => {
    state.active = false;
    state.upcoming = false;
    show();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/event.upcoming/)).not.toBeInTheDocument();
  });
});
