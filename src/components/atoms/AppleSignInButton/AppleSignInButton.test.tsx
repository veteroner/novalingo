/**
 * AppleSignInButton — App Store Yönerge 4 gereksinimleri.
 *
 * Düğme Apple'ın kendi logosunu (vektör) kullanmalı; emoji kullanılırsa
 * inceleme reddediyor (27 Eylül 2026 reddi).
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppleSignInButton } from './AppleSignInButton';

describe('AppleSignInButton', () => {
  it('etiketi gösterir ve tıklamayı iletir', () => {
    const onClick = vi.fn();
    render(<AppleSignInButton label="Apple ile Giriş Yap" onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Apple ile Giriş Yap' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('emoji değil vektör Apple logosu kullanır', () => {
    const { container } = render(
      <AppleSignInButton label="Apple ile Giriş Yap" onClick={vi.fn()} />,
    );

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.textContent).not.toMatch(/\u{1F34E}|\u{1F34F}/u);
  });

  it('devre dışıyken tıklanamaz', () => {
    const onClick = vi.fn();
    render(<AppleSignInButton label="Apple ile Giriş Yap" onClick={onClick} disabled />);

    fireEvent.click(screen.getByRole('button', { name: 'Apple ile Giriş Yap' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
