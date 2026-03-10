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

  it('renders subtitle', () => {
    renderLogin();
    expect(screen.getByText('İngilizce öğrenmenin en eğlenceli yolu!')).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    renderLogin();
    expect(screen.getByText('Google ile Giriş Yap')).toBeInTheDocument();
  });

  it('renders Apple login button', () => {
    renderLogin();
    expect(screen.getByText('Apple ile Giriş Yap')).toBeInTheDocument();
  });

  it('renders anonymous login button', () => {
    renderLogin();
    expect(screen.getByText('Hemen Başla (Kayıtsız)')).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('Google ile Giriş Yap'));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('calls signInWithApple when Apple button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('Apple ile Giriş Yap'));
    expect(signInWithApple).toHaveBeenCalledOnce();
  });

  it('calls signInAnonymousUser when anonymous button clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByText('Hemen Başla (Kayıtsız)'));
    expect(signInAnonymousUser).toHaveBeenCalledOnce();
  });

  it('disables login buttons when KVKK not accepted', () => {
    renderLogin();
    expect(screen.getByText('Google ile Giriş Yap').closest('button')).toBeDisabled();
    expect(screen.getByText('Apple ile Giriş Yap').closest('button')).toBeDisabled();
    expect(screen.getByText('Hemen Başla (Kayıtsız)').closest('button')).toBeDisabled();
  });
});
