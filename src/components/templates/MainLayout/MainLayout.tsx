/**
 * MainLayout Template
 *
 * Ana uygulama layout'u — alt navigasyon barı + safe area + scroll.
 * Ders ekranı dışında tüm sayfalarda kullanılır.
 */

import { Navigation } from '@components/organisms/Navigation';
import { clsx } from 'clsx';
import { type ReactNode } from 'react';

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
    <div className="bg-background-primary flex min-h-screen flex-col">
      <main
        className={clsx(
          'mx-auto w-full max-w-md flex-1',
          'safe-area-top safe-area-left safe-area-right',
          showNavigation && 'pb-nav', // space for bottom nav + safe area
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
