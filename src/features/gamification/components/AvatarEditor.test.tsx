import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChildProfile } from '@/test/factories';
import { useChildStore } from '@stores/childStore';
import { updateChildProfile } from '@services/firebase/functions';
import { AvatarEditor } from './AvatarEditor';
import ProfileScreen from '../screens/ProfileScreen';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@services/firebase/functions', () => ({
  updateChildProfile: vi.fn(),
  createChildProfile: vi.fn(),
  deleteChildProfile: vi.fn(),
}));
vi.mock('@hooks/queries', async () => ({
  useUpdateChild: (await import('@hooks/queries/useChildQueries')).useUpdateChild,
}));

const child = createChildProfile({ id: 'child-a', avatarId: 'owl', name: 'Ada' });
const update = vi.mocked(updateChildProfile);
const onClose = vi.fn();
function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AvatarEditor
        childId={child.id}
        avatarId={child.avatarId}
        name={child.name}
        onClose={onClose}
      />
    </QueryClientProvider>,
  );
}
const selectFox = () =>
  fireEvent.click(screen.getByRole('radio', { name: 'auth:createProfile.avatar.fox' }));
const save = () => fireEvent.click(screen.getByRole('button', { name: 'profile.avatar.save' }));

describe('avatar editing with the real profile mutation', () => {
  beforeEach(() => {
    update.mockReset();
    onClose.mockReset();
    useChildStore.setState({ activeChild: child, children: [child] });
  });
  it('opens with the saved choice focused; unchanged avatar cannot be submitted', () => {
    setup();
    expect(screen.getByRole('radio', { name: 'auth:createProfile.avatar.owl' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'profile.avatar.save' })).toBeDisabled();
    expect(update).not.toHaveBeenCalled();
  });
  it('cancel discards the selection without saving or changing the stored avatar', () => {
    setup();
    selectFox();
    fireEvent.click(screen.getByRole('button', { name: 'profile.avatar.cancel' }));
    expect(onClose).toHaveBeenCalledWith(false);
    expect(update).not.toHaveBeenCalled();
    expect(useChildStore.getState().activeChild?.avatarId).toBe('owl');
  });
  it('saves only the new avatar and updates both the active profile and child list', async () => {
    update.mockResolvedValue({ childId: child.id, name: child.name, avatarId: 'fox' });
    setup();
    selectFox();
    save();
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(true);
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({ childId: child.id, avatarId: 'fox' });
    expect(useChildStore.getState().activeChild?.avatarId).toBe('fox');
    expect(useChildStore.getState().children[0]?.avatarId).toBe('fox');
  });
  it('keeps the saved avatar on failure and permits a retry with the chosen avatar', async () => {
    update
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ childId: child.id, name: child.name, avatarId: 'fox' });
    setup();
    selectFox();
    save();
    expect(await screen.findByRole('alert')).toHaveTextContent('profile.avatar.error');
    expect(useChildStore.getState().activeChild?.avatarId).toBe('owl');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'auth:createProfile.avatar.fox' })).toBeChecked();
    save();
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(true);
    });
    expect(useChildStore.getState().activeChild?.avatarId).toBe('fox');
  });
  it('blocks duplicate submissions and does not overwrite another child on a late response', async () => {
    let finish!: (value: { childId: string; name: string; avatarId: string }) => void;
    update.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    setup();
    selectFox();
    save();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'profile.avatar.cancel' })).toBeDisabled(),
    );
    expect(screen.getByRole('radio', { name: 'auth:createProfile.avatar.panda' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('profile.avatar.saving');
    const other = createChildProfile({ id: 'child-b', avatarId: 'cat' });
    useChildStore.setState({ activeChild: other, children: [child, other] });
    await act(async () => {
      finish({ childId: child.id, name: child.name, avatarId: 'fox' });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(true);
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(useChildStore.getState().activeChild?.avatarId).toBe('cat');
    expect(useChildStore.getState().children[0]?.avatarId).toBe('fox');
  });
  it('returns from profile editing with the saved artwork and a success message', async () => {
    update.mockResolvedValue({ childId: child.id, name: child.name, avatarId: 'fox' });
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ProfileScreen />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'profile.avatar.change' }));
    expect(screen.queryByText('profile.stats.totalXP')).not.toBeInTheDocument();
    selectFox();
    save();
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('profile.avatar.saved');
    });
    expect(screen.getByRole('img', { name: child.name }).querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(useChildStore.getState().activeChild?.avatarId).toBe('fox');
  });
  it('returns to the profile and restores keyboard focus after cancellation', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ProfileScreen />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'profile.avatar.change' }));
    selectFox();
    fireEvent.click(screen.getByRole('button', { name: 'profile.avatar.cancel' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'profile.avatar.change' })).toHaveFocus(),
    );
    expect(useChildStore.getState().activeChild?.avatarId).toBe('owl');
    expect(update).not.toHaveBeenCalled();
  });
});
