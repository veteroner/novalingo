import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackStoryOpened } from '@services/analytics/analyticsService';
import StoryLibraryScreen from './StoryLibraryScreen';

vi.mock('@components/templates/MainLayout', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@services/analytics/analyticsService', () => ({
  trackStoryLibraryOpened: vi.fn(),
  trackStoryOpened: vi.fn(),
}));
vi.mock('@/features/learning/data/storyBank', () => ({
  storyBank: [
    {
      id: 'story-w1-farm-visit',
      title: 'Farm story',
      titleTr: 'Çiftlik hikâyesi',
      theme: 'animals',
      data: { pages: [{ imageUrl: '/story/old-placeholder.jpg' }] },
    },
    {
      id: 'story-w1-ocean',
      title: 'Ocean story',
      titleTr: 'Deniz hikâyesi',
      theme: 'animals',
      data: { pages: [{ imageUrl: '/story/old-ocean-placeholder.jpg' }] },
    },
    {
      id: 'story-w10-doctor',
      title: 'Doctor story',
      titleTr: 'Doktor hikâyesi',
      theme: 'health',
      data: { pages: [{ imageUrl: '/story/old-doctor-placeholder.jpg' }] },
    },
    {
      id: 'story-w2-happy',
      title: 'Happy Nova',
      titleTr: 'Mutlu Nova',
      theme: 'emotions',
      data: { pages: [{ imageUrl: '/story/nova-v2/happy-1.webp' }] },
    },
  ],
}));
function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}
function setup() {
  render(
    <MemoryRouter>
      <StoryLibraryScreen />
      <Location />
    </MemoryRouter>,
  );
}

describe('illustrated story library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('shows the matching illustrations instead of the old placeholder or emoji, and keeps standalone art', () => {
    setup();
    const farm = screen.getByRole('button', { name: /Çiftlik hikâyesi/ }).querySelector('img');
    expect(farm).toHaveAttribute('src', '/story/covers-v1/early-learning.webp');
    expect(farm).toHaveAttribute('alt', '');
    const ocean = screen.getByRole('button', { name: /Deniz hikâyesi/ }).querySelector('img');
    expect(ocean).toHaveStyle({ left: '-100%', top: '0%' });
    expect(screen.getByRole('button', { name: /Mutlu Nova/ }).querySelector('img')).toHaveAttribute(
      'src',
      '/story/nova-v2/happy-1.webp',
    );
  });
  it('offers all 12 worlds and filters world 10 separately from world 1', () => {
    setup();
    expect(screen.getByRole('button', { name: /storyLibrary.worlds.w12/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /storyLibrary.worlds.w10/ }));
    expect(screen.getByRole('button', { name: /storyLibrary.worlds.w10/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Doktor hikâyesi/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Çiftlik hikâyesi/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /storyLibrary.all/ }));
    expect(screen.getByRole('button', { name: /Çiftlik hikâyesi/ })).toBeInTheDocument();
  });
  it('keeps the title and story navigation usable when an image cannot load', () => {
    setup();
    const card = screen.getByRole('button', { name: /Doktor hikâyesi/ });
    fireEvent.error(card.querySelector('img')!);
    expect(card.querySelector('img')).toBeNull();
    fireEvent.click(card);
    expect(screen.getByTestId('location')).toHaveTextContent('/stories/story-w10-doctor');
    expect(trackStoryOpened).toHaveBeenCalledWith({ storyId: 'story-w10-doctor', worldId: 'w10' });
  });
});
