/**
 * LoginScreen Component Tests
 *
 * Render, button presence, login handlers.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Mock auth service before importing component
vi.mock('@services/firebase/auth', () => ({
  signInWithGoogle: vi.fn().mockResolvedValue({ uid: 'test' }),
  signInWithApple: vi.fn().mockResolvedValue({ uid: 'test' }),
  signInAnonymousUser: vi.fn().mockResolvedValue({ uid: 'test' }),
}));

// Import after mock
import { signInAnonymousUser, signInWithApple, signInWithGoogle } from '@services/firebase/auth';
import LoginScreen from './LoginScreen';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginScreen />
    </MemoryRouter>,
  );
}

describe('LoginScreen', () => {
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

  it('disables login buttons when KVKK not accepted', () => {
    renderLogin();
    expect(screen.getByText('login.withGoogle').closest('button')).toBeDisabled();
    expect(screen.getByText('login.withApple').closest('button')).toBeDisabled();
    expect(screen.getByText('login.asGuest').closest('button')).toBeDisabled();
  });
});
