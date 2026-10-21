/**
 * CreateProfileScreen — App Store Yönerge 4 (Apple ile Giriş).
 *
 * Apple ile Giriş kullanan kişiden ad tekrar istenmemeli (21 Ekim 2026 reddi):
 * Apple/Google hesabında ad adımı hiç gösterilmez, çocuk varsayılan adla başlar.
 * Misafir kullanımda takma ad isteğe bağlıdır.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutate = vi.fn();
vi.mock('@hooks/queries', () => ({
  useCreateChild: () => ({ mutate, isPending: false }),
}));

const authState: { firebaseUser: { isAnonymous: boolean } | null } = { firebaseUser: null };
vi.mock('@stores/authStore', () => ({
  useAuthStore: (selector: (s: typeof authState) => unknown) => selector(authState),
}));

import CreateProfileScreen from './CreateProfileScreen';

function renderScreen() {
  render(
    <MemoryRouter>
      <CreateProfileScreen />
    </MemoryRouter>,
  );
}

function continueButton() {
  return screen.getByRole('button', { name: 'createProfile.continue' });
}

function finishAgeAndAvatar() {
  fireEvent.click(screen.getByText('createProfile.age.stars'));
  fireEvent.click(continueButton());
  fireEvent.click(screen.getByText('createProfile.avatar.fox'));
  fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));
}

describe('CreateProfileScreen — ad tekrar sorulmaz', () => {
  beforeEach(() => {
    mutate.mockReset();
    authState.firebaseUser = null;
  });

  it('Apple/Google hesabında ad adımı hiç gösterilmez ve varsayılan ad kullanılır', () => {
    authState.firebaseUser = { isAnonymous: false };

    renderScreen();

    expect(screen.queryByPlaceholderText('createProfile.namePlaceholder')).not.toBeInTheDocument();
    expect(screen.queryByText('createProfile.back')).not.toBeInTheDocument();
    finishAgeAndAvatar();

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'createProfile.defaultName' }),
      expect.anything(),
    );
  });

  it('misafir takma adı boş bırakıp devam edebilir', () => {
    authState.firebaseUser = { isAnonymous: true };

    renderScreen();

    expect(continueButton()).toBeEnabled();
    fireEvent.click(continueButton());
    finishAgeAndAvatar();

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'createProfile.defaultName' }),
      expect.anything(),
    );
  });

  it('misafir geçersiz bir takma ad yazarsa devam edemez', () => {
    authState.firebaseUser = { isAnonymous: true };
    renderScreen();

    fireEvent.change(screen.getByPlaceholderText('createProfile.namePlaceholder'), {
      target: { value: 'A1' },
    });

    expect(continueButton()).toBeDisabled();
  });
});
