/**
 * CreateProfileScreen — App Store Yönerge 4 (Apple ile Giriş).
 *
 * Apple ile Giriş kullanan kişiden ad tekrar istenmemeli (21 Ekim 2026 reddi):
 * sağlayıcının verdiği ad önceden doldurulur, ad paylaşılmamışsa takma ad
 * isteğe bağlıdır ve boş bırakılarak devam edilebilir.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutate = vi.fn();
vi.mock('@hooks/queries', () => ({
  useCreateChild: () => ({ mutate, isPending: false }),
}));

const authState: {
  user: { displayName: string } | null;
  firebaseUser: { displayName: string | null } | null;
} = { user: null, firebaseUser: null };
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

describe('CreateProfileScreen — ad tekrar sorulmaz', () => {
  beforeEach(() => {
    mutate.mockReset();
    authState.user = null;
    authState.firebaseUser = null;
  });

  it('Firestore adı boş olsa bile Apple adını önceden doldurur', () => {
    authState.user = { displayName: '' };
    authState.firebaseUser = { displayName: 'Ayşe Yılmaz' };

    renderScreen();

    expect(screen.getByPlaceholderText('createProfile.namePlaceholder')).toHaveValue('Ayşe');
  });

  it('ad paylaşılmamışsa boş bırakıp devam edilebilir ve varsayılan ad kullanılır', () => {
    authState.firebaseUser = { displayName: null };

    renderScreen();

    expect(continueButton()).toBeEnabled();
    fireEvent.click(continueButton());
    fireEvent.click(screen.getByText('createProfile.age.stars'));
    fireEvent.click(continueButton());
    fireEvent.click(screen.getByText('createProfile.avatar.fox'));
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'createProfile.defaultName' }),
      expect.anything(),
    );
  });

  it('geçersiz bir takma ad yazılırsa devam edilemez', () => {
    renderScreen();

    fireEvent.change(screen.getByPlaceholderText('createProfile.namePlaceholder'), {
      target: { value: 'A1' },
    });

    expect(continueButton()).toBeDisabled();
  });
});
