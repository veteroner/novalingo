/**
 * LoginScreen Component Tests
 *
 * Render, button presence, login handlers.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock auth service before importing component
vi.mock('@services/firebase/auth', () => ({
  signInWithGoogle: vi.fn().mockResolvedValue({ uid: 'test' }),
  signInWithApple: vi.fn().mockResolvedValue({ uid: 'test' }),
  signInAnonymousUser: vi.fn().mockResolvedValue({ uid: 'test' }),
  // Varsayılan: iOS gibi davran (Apple butonu görünür); testler tek tek değiştirir.
  isAppleSignInAvailable: vi.fn(() => true),
  isSignInCancelled: vi.fn((err: unknown) => err instanceof Error && err.message === 'CANCELLED'),
}));

const mockSetError = vi.hoisted(() => vi.fn());
vi.mock('@stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setLoading: vi.fn(), setError: mockSetError }),
}));

// Import after mock
import {
  isAppleSignInAvailable,
  signInAnonymousUser,
  signInWithApple,
  signInWithGoogle,
} from '@services/firebase/auth';
import LoginScreen from './LoginScreen';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginScreen />
    </MemoryRouter>,
  );
}

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAppleSignInAvailable).mockReturnValue(true);
    vi.mocked(signInWithGoogle).mockResolvedValue({ uid: 'test' } as never);
  });

  it('renders app title', () => {
    renderLogin();
    expect(screen.getByText('NovaLingo')).toBeInTheDocument();
  });

  // NOTE: react-i18next is mocked in src/test/setup.ts so t(key) returns the key.
  // Assertions therefore match the i18n keys rather than the Turkish copy.
  it('renders subtitle', () => {
    renderLogin();
    expect(screen.getByText('login.tagline')).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    renderLogin();
    expect(screen.getByText('login.withGoogle')).toBeInTheDocument();
  });

  it('renders Apple login button', () => {
    renderLogin();
    expect(screen.getByText('login.withApple')).toBeInTheDocument();
  });

  it('renders anonymous login button', () => {
    renderLogin();
    expect(screen.getByText('login.asGuest')).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('login.withGoogle'));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('calls signInWithApple when Apple button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('login.withApple'));
    expect(signInWithApple).toHaveBeenCalledOnce();
  });

  it('calls signInAnonymousUser when anonymous button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('login.asGuest'));
    expect(signInAnonymousUser).toHaveBeenCalledOnce();
  });

  it('hides the Apple button where Apple sign-in is unavailable (Android / web)', () => {
    vi.mocked(isAppleSignInAvailable).mockReturnValue(false);
    renderLogin();
    expect(screen.queryByText('login.withApple')).not.toBeInTheDocument();
    expect(screen.getByText('login.withGoogle')).toBeInTheDocument();
  });

  it('does not show an error when the user closes the account picker', async () => {
    vi.mocked(signInWithGoogle).mockRejectedValue(new Error('CANCELLED'));
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('login.withGoogle'));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('shows real sign-in errors', async () => {
    vi.mocked(signInWithGoogle).mockRejectedValue(new Error('auth/network-request-failed'));
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('login.withGoogle'));
    expect(mockSetError).toHaveBeenCalledWith('auth/network-request-failed');
  });

  it('disables login buttons when KVKK not accepted', () => {
    renderLogin();
    expect(screen.getByText('login.withGoogle').closest('button')).toBeDisabled();
    expect(screen.getByText('login.withApple').closest('button')).toBeDisabled();
    expect(screen.getByText('login.asGuest').closest('button')).toBeDisabled();
  });
});
