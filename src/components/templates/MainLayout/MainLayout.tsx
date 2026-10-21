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
  /** Let learning maps use a journey sidebar on larger screens. */
  wide?: boolean;
}

export function MainLayout({
  children,
  showNavigation = true,
  className,
  headerOffset = false,
  wide = false,
}: MainLayoutProps) {
  return (
    <div className="bg-background-primary flex min-h-screen flex-col">
      <main
        className={clsx(
          'mx-auto w-full flex-1',
          wide ? 'max-w-6xl' : 'max-w-md',
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
