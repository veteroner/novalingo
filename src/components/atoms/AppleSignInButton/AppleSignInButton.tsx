/**
 * AppleSignInButton
 *
 * "Apple ile Giriş Yap" düğmesi — Apple'ın Human Interface Guidelines'taki
 * Sign in with Apple kurallarına göre: siyah zemin, beyaz Apple logosu,
 * sistem yazı tipi ve düğme yüksekliğinin %43'ü kadar logo yüksekliği.
 *
 * App Store incelemesi (Yönerge 4, 27 Eylül 2026) emoji logoyu reddetti;
 * burada emoji veya üçüncü taraf ikon KULLANILMAZ.
 */

import { forwardRef } from 'react';

export interface AppleSignInButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const AppleSignInButton = forwardRef<HTMLButtonElement, AppleSignInButtonProps>(
  function AppleSignInButton({ label, onClick, disabled = false, className = '' }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 text-white transition-opacity disabled:opacity-40 ${className}`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Apple logosu — Sign in with Apple düğmesi için beyaz, metin yüksekliğiyle orantılı */}
        <svg
          width="20"
          height="24"
          viewBox="0 0 14 17"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M11.62 8.99c-.02-1.82 1.49-2.7 1.56-2.74-.85-1.24-2.17-1.41-2.64-1.43-1.12-.11-2.19.66-2.76.66-.57 0-1.45-.64-2.38-.63-1.22.02-2.35.71-2.98 1.8-1.27 2.2-.32 5.46.91 7.24.6.87 1.32 1.85 2.26 1.81.91-.04 1.25-.59 2.35-.59 1.09 0 1.41.59 2.37.57.98-.02 1.6-.89 2.2-1.76.69-1.01.98-1.98 1-2.03-.02-.01-1.91-.74-1.93-2.9zM9.83 3.64c.5-.61.84-1.45.75-2.29-.72.03-1.6.48-2.12 1.08-.46.54-.87 1.4-.76 2.22.8.06 1.62-.41 2.13-1.01z"
            fill="currentColor"
          />
        </svg>
        <span className="text-[19px] leading-none font-medium">{label}</span>
      </button>
    );
  },
);
