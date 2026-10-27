import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));
vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@components/molecules/NovaCharacter', () => ({
  NovaCharacter: () => <span data-testid="nova" />,
}));

import DailyLimitScreen from './DailyLimitScreen';

function renderScreen() {
  render(
    <MemoryRouter>
      <DailyLimitScreen />
    </MemoryRouter>,
  );
}

describe('DailyLimitScreen — günlük ders hakkı doldu', () => {
  beforeEach(() => {
    navigate.mockReset();
  });

  it('çocuğu ücretsiz kalan etkinliklere yönlendirir', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'dailyLimit.stories' }));
    expect(navigate).toHaveBeenLastCalledWith('/stories');
    fireEvent.click(screen.getByRole('button', { name: 'dailyLimit.conversation' }));
    expect(navigate).toHaveBeenLastCalledWith('/conversation/topics');
  });

  it('Plus düğmesi ebeveyn kapısının arkasındaki abonelik rotasına gider', () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'dailyLimit.parentCta' }));
    expect(navigate).toHaveBeenLastCalledWith('/subscription');
  });
});
