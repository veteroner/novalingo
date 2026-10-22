import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '@components/atoms/Avatar';
import { Leaderboard } from './Leaderboard';

describe('leaderboard avatars', () => {
  it('shows a freshly saved self-avatar even while leaderboard data is stale; others stay anonymous', () => {
    const { container: reference } = render(<Avatar avatarId="fox" name="reference" />);
    render(
      <Leaderboard
        currentUserId="self"
        currentUserName="Ada"
        currentUserAvatarId="fox"
        entries={[
          {
            rank: 1,
            trend: 'same',
            childId: 'self',
            anonNumber: 1,
            avatarId: 'owl',
            weeklyXP: 100,
            level: 4,
          },
          {
            rank: 2,
            trend: 'same',
            childId: 'other',
            anonNumber: 2,
            avatarId: 'panda',
            weeklyXP: 80,
            level: 2,
          },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Ada' }).querySelector('svg')?.innerHTML).toBe(
      reference.querySelector('svg')?.innerHTML,
    );
    expect(
      screen.getByRole('img', { name: 'leaderboard.anonymousName' }).querySelector('svg'),
    ).not.toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });
});
