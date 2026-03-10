/**
 * Navigation Organism
 *
 * Alt tab bar navigasyonu — 4 sekme: Ana Sayfa, Öğren, Görevler, Profil.
 * Çocuk-dostu ikonlar ve bounce animasyonu.
 */

import { useChildStore } from '@stores/childStore';
import type { TabType } from '@stores/uiStore';
import { useUIStore } from '@stores/uiStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  id: TabType;
  label: string;
  emoji: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Ana Sayfa', emoji: '🏠', path: '/home' },
  { id: 'learn', label: 'Öğren', emoji: '📚', path: '/world/w1' },
  { id: 'quests', label: 'Görevler', emoji: '⚔️', path: '/quests' },
  { id: 'profile', label: 'Profil', emoji: '👤', path: '/profile' },
];

/** Map pathname back to tab id so the indicator stays in sync */
function pathnameToTab(pathname: string): TabType | null {
  if (pathname === '/home') return 'home';
  if (pathname.startsWith('/world')) return 'learn';
  if (pathname === '/quests') return 'quests';
  if (pathname === '/profile') return 'profile';
  return null;
}

export function Navigation() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const child = useChildStore((s) => s.activeChild);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Dynamic Learn tab path based on child's current world
  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) =>
        item.id === 'learn' && child?.currentWorldId
          ? { ...item, path: `/world/${child.currentWorldId}` }
          : item,
      ),
    [child?.currentWorldId],
  );

  // Keep activeTab in sync when user navigates via other means (back button, links)
  useEffect(() => {
    const tab = pathnameToTab(pathname);
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [pathname, activeTab, setActiveTab]);

  return (
    <nav
      className={clsx(
        'fixed right-0 bottom-0 left-0 z-40',
        'border-t border-gray-100 bg-white/90 backdrop-blur-xl',
        'safe-area-bottom',
      )}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                void navigate(item.path);
              }}
              className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 pt-3',
                'touch-manipulation transition-colors select-none',
                isActive ? 'text-nova-blue' : 'text-gray-400',
              )}
            >
              <motion.span
                className="text-xl"
                animate={isActive ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {item.emoji}
              </motion.span>
              <span className="text-[0.625rem] font-bold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="bg-nova-blue absolute top-0 h-0.5 w-8 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
