/**
 * MainLayout Template
 *
 * Ana uygulama layout'u — alt navigasyon barı + safe area + scroll.
 * Ders ekranı dışında tüm sayfalarda kullanılır.
 */

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Navigation } from '@components/organisms/Navigation';

interface MainLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
  /** Extra top padding for header area */
  headerOffset?: boolean;
}

export function MainLayout({
  children,
  showNavigation = true,
  className,
  headerOffset = false,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <main
        className={clsx(
          'flex-1 w-full max-w-md mx-auto',
          'safe-area-top safe-area-left safe-area-right',
          showNavigation && 'pb-20', // space for bottom nav
          headerOffset && 'pt-16',
          className,
        )}
      >
        {children}
      </main>

      {showNavigation && <Navigation />}
    </div>
  );
}
