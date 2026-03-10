/**
 * Child Profile Store
 *
 * Aktif çocuk profili ve ilerleme durumu.
 */

import { type ChildProfile } from '@/types/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChildState {
  // State
  activeChild: ChildProfile | null;
  children: ChildProfile[];
  isLoading: boolean;

  // Actions
  setActiveChild: (child: ChildProfile | null) => void;
  setChildren: (children: ChildProfile[]) => void;
  updateActiveChild: (updates: Partial<ChildProfile>) => void;
  addXP: (amount: number) => void;
  updateCurrency: (stars: number, gems: number) => void;
  updateStreak: (streak: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      activeChild: null,
      children: [],
      isLoading: false,

      setActiveChild: (activeChild) => {
        set({ activeChild });
      },

      setChildren: (children) => {
        set({ children });
      },

      updateActiveChild: (updates) => {
        const current = get().activeChild;
        if (!current) return;
        const updated = { ...current, ...updates };
        set({
          activeChild: updated,
          children: get().children.map((c) => (c.id === current.id ? updated : c)),
        });
      },

      addXP: (amount) => {
        const child = get().activeChild;
        if (!child) return;

        const newTotalXP = child.totalXP + amount;
        const newCurrentLevelXP = child.currentLevelXP + amount;

        set({
          activeChild: {
            ...child,
            totalXP: newTotalXP,
            currentLevelXP: newCurrentLevelXP,
          },
        });
      },

      updateCurrency: (stars, gems) => {
        const child = get().activeChild;
        if (!child) return;

        set({
          activeChild: {
            ...child,
            stars: Math.max(0, child.stars + stars),
            gems: Math.max(0, child.gems + gems),
          },
        });
      },

      updateStreak: (streak) => {
        const child = get().activeChild;
        if (!child) return;

        set({
          activeChild: {
            ...child,
            currentStreak: streak,
            longestStreak: Math.max(child.longestStreak, streak),
          },
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      reset: () => {
        set({ activeChild: null, children: [], isLoading: false });
      },
    }),
    {
      name: 'nova-child-store',
      partialize: (s) => ({ activeChild: s.activeChild, children: s.children }),
    },
  ),
);
