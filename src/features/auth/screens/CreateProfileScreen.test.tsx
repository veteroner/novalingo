/**
 * CreateProfileScreen — App Store Yönerge 4 (Apple ile Giriş).
 *
 * Apple ile Giriş kullanan kişiden ad tekrar istenmemeli (21 Ekim 2026 reddi):
 * sağlayıcının verdiği ad önceden doldurulur, ad paylaşılmamışsa takma ad
 * isteğe bağlıdır ve boş bırakılarak devam edilebilir.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
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

import { markProfileConsentPassed, resetParentGate } from '@services/parentGate/parentGateSession';
import {
  rememberAgeBand,
  getLearnerAgeGroup,
  AGE_SCREEN_STORAGE_KEY,
} from '@services/ageScreen/ageScreenPolicy';

const childState = { activeChild: null, children: [] as unknown[] };
vi.mock('@stores/childStore', () => ({
  useChildStore: (selector: (s: typeof childState) => unknown) => selector(childState),
}));

import CreateProfileScreen from './CreateProfileScreen';

function renderScreen() {
  render(
    <MemoryRouter>
      <CreateProfileScreen />
    </MemoryRouter>,
  );
}

describe('CreateProfileScreen — ad tekrar sorulmaz', () => {
  beforeEach(() => {
    mutate.mockReset();
    vi.useRealTimers();
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":0}');
    childState.children = [];
    resetParentGate();
    markProfileConsentPassed();
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

    expect(screen.getByRole('button', { name: 'createProfile.start' })).toBeDisabled();
    fireEvent.click(screen.getByText('createProfile.age.stars'));
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

    expect(screen.getByRole('button', { name: 'createProfile.start' })).toBeDisabled();
  });
});

describe('tek form ve ebeveyn koruması', () => {
  beforeEach(() => {
    mutate.mockReset();
    vi.useRealTimers();
    childState.children = [];
    authState.user = null;
    authState.firebaseUser = null;
    resetParentGate();
    localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":0}');
  });
  it('doğrudan profil adresi ebeveyn onayını atlayamaz', () => {
    renderScreen();
    expect(screen.getByText('parentalGate.title')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('createProfile.namePlaceholder')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
  it('çocuk tarihini yeniden sormadan varsayılan avatarla tek dokunuşta oluşturur', () => {
    rememberAgeBand('minor', 'stars');
    markProfileConsentPassed();
    renderScreen();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByText('createProfile.avatarTitle')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));
    expect(mutate).toHaveBeenCalledWith(
      { name: 'createProfile.defaultName', ageGroup: 'stars', avatarId: 'owl' },
      expect.anything(),
    );
  });
  it('önerilen grup istenirse aynı formda değiştirilebilir; erişim sınıfını etkilemez', () => {
    rememberAgeBand('minor', 'stars');
    markProfileConsentPassed();
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.changeGroup' }));
    fireEvent.click(screen.getByText('createProfile.age.cubs'));
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ ageGroup: 'cubs' }),
      expect.anything(),
    );
  });
  it('yetişkin hesap sahibi çocuk için grubunu seçer', () => {
    rememberAgeBand('adult');
    markProfileConsentPassed();
    renderScreen();
    expect(screen.getByText('createProfile.childAgeTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'createProfile.start' })).toBeDisabled();
  });
  it('ikinci çocuk için önceki çocuğun grubunu yeniden kullanmaz', () => {
    rememberAgeBand('minor', 'stars');
    childState.children = [{}];
    markProfileConsentPassed();
    renderScreen();
    expect(screen.getByText('createProfile.childAgeTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'createProfile.start' })).toBeDisabled();
  });
  it('onay süresi dolunca kayıt göndermez, ebeveyn kapısını tekrar açar', () => {
    rememberAgeBand('minor', 'stars');
    markProfileConsentPassed();
    renderScreen();
    resetParentGate();
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByText('parentalGate.title')).toBeInTheDocument();
  });
  it('başarısız kayıtta grup korunur; başarılı kayıttan sonra ilk profil önerisi tüketilir', () => {
    rememberAgeBand('minor', 'stars');
    markProfileConsentPassed();
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'createProfile.start' }));
    const callbacks = mutate.mock.calls[0]?.[1] as {
      onSuccess: () => void;
      onError: (error: Error) => void;
    };
    act(() => {
      callbacks.onError(new Error('retry'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('retry');
    expect(getLearnerAgeGroup()).toBe('stars');
    act(() => {
      callbacks.onSuccess();
    });
    expect(getLearnerAgeGroup()).toBeNull();
  });
});
