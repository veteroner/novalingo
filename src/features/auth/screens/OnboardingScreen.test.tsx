import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OnboardingScreen from './OnboardingScreen';

const profiles = vi.hoisted(() => ({
  activeChild: null as object | null,
  children: [] as object[],
}));
vi.mock('@stores/childStore', () => ({
  useChildStore: (selector: (state: typeof profiles) => unknown) => selector(profiles),
}));
function setup() {
  render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/home" element={<div>home destination</div>} />
        <Route path="/create-profile" element={<div>profile destination</div>} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('kısa karşılama', () => {
  beforeEach(() => {
    profiles.activeChild = null;
    profiles.children = [];
  });
  it('üç bilgi kartı arasında tıklatmadan doğrudan profil kurulumuna gider', () => {
    setup();
    expect(screen.getByText('onboarding.page2Desc')).toBeInTheDocument();
    expect(screen.getByText('onboarding.page3Desc')).toBeInTheDocument();
    expect(screen.queryByText('onboarding.skip')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'onboarding.start' }));
    expect(screen.getByText('profile destination')).toBeInTheDocument();
  });
  it.each(['selected', 'unselected'])('mevcut profil %s ise tanıtımı tekrarlamaz', (state) => {
    profiles.children = [{}];
    if (state === 'selected') profiles.activeChild = {};
    setup();
    expect(screen.getByText('home destination')).toBeInTheDocument();
  });
});
