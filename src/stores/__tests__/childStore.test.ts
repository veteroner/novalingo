// @vitest-environment node
import { createChildProfile } from '@/test/factories';
import { beforeEach, describe, expect, it } from 'vitest';
import { useChildStore } from '../childStore';

describe('childStore', () => {
  beforeEach(() => {
    useChildStore.getState().reset();
  });

  it('starts with null activeChild', () => {
    expect(useChildStore.getState().activeChild).toBeNull();
    expect(useChildStore.getState().children).toEqual([]);
    expect(useChildStore.getState().isLoading).toBe(false);
  });

  describe('setActiveChild', () => {
    it('sets the active child', () => {
      const child = createChildProfile({ id: 'c1' });
      useChildStore.getState().setActiveChild(child);
      expect(useChildStore.getState().activeChild?.id).toBe('c1');
    });

    it('clears when set to null', () => {
      const child = createChildProfile();
      useChildStore.getState().setActiveChild(child);
      useChildStore.getState().setActiveChild(null);
      expect(useChildStore.getState().activeChild).toBeNull();
    });
  });

  describe('setChildren', () => {
    it('sets children list', () => {
      const children = [createChildProfile({ id: 'c1' }), createChildProfile({ id: 'c2' })];
      useChildStore.getState().setChildren(children);
      expect(useChildStore.getState().children).toHaveLength(2);
    });
  });

  describe('updateActiveChild', () => {
    it('merges partial updates', () => {
      useChildStore.getState().setActiveChild(createChildProfile({ name: 'Ali', level: 3 }));
      useChildStore.getState().updateActiveChild({ name: 'Ayşe' });
      expect(useChildStore.getState().activeChild?.name).toBe('Ayşe');
      expect(useChildStore.getState().activeChild?.level).toBe(3);
    });

    it('no-ops when no active child', () => {
      useChildStore.getState().updateActiveChild({ name: 'Ghost' });
      expect(useChildStore.getState().activeChild).toBeNull();
    });
  });

  describe('addXP', () => {
    it('increases totalXP and currentLevelXP', () => {
      useChildStore
        .getState()
        .setActiveChild(createChildProfile({ totalXP: 100, currentLevelXP: 20 }));
      useChildStore.getState().addXP(50);
      const child = useChildStore.getState().activeChild;
      expect(child?.totalXP).toBe(150);
      expect(child?.currentLevelXP).toBe(70);
    });

    it('no-ops when no active child', () => {
      useChildStore.getState().addXP(100);
      expect(useChildStore.getState().activeChild).toBeNull();
    });
  });

  describe('updateCurrency', () => {
    it('adds stars and gems', () => {
      useChildStore.getState().setActiveChild(createChildProfile({ stars: 50, gems: 5 }));
      useChildStore.getState().updateCurrency(10, 3);
      const child = useChildStore.getState().activeChild;
      expect(child?.stars).toBe(60);
      expect(child?.gems).toBe(8);
    });

    it('handles negative deltas (spending)', () => {
      useChildStore.getState().setActiveChild(createChildProfile({ stars: 50, gems: 5 }));
      useChildStore.getState().updateCurrency(-20, -2);
      const child = useChildStore.getState().activeChild;
      expect(child?.stars).toBe(30);
      expect(child?.gems).toBe(3);
    });
  });

  describe('updateStreak', () => {
    it('updates currentStreak', () => {
      useChildStore
        .getState()
        .setActiveChild(createChildProfile({ currentStreak: 3, longestStreak: 7 }));
      useChildStore.getState().updateStreak(5);
      expect(useChildStore.getState().activeChild?.currentStreak).toBe(5);
    });

    it('updates longestStreak when new streak is higher', () => {
      useChildStore
        .getState()
        .setActiveChild(createChildProfile({ currentStreak: 3, longestStreak: 7 }));
      useChildStore.getState().updateStreak(10);
      expect(useChildStore.getState().activeChild?.longestStreak).toBe(10);
    });

    it('keeps longestStreak when new streak is lower', () => {
      useChildStore
        .getState()
        .setActiveChild(createChildProfile({ currentStreak: 3, longestStreak: 7 }));
      useChildStore.getState().updateStreak(5);
      expect(useChildStore.getState().activeChild?.longestStreak).toBe(7);
    });
  });

  describe('reset', () => {
    it('clears everything', () => {
      useChildStore.getState().setActiveChild(createChildProfile());
      useChildStore.getState().setChildren([createChildProfile()]);
      useChildStore.getState().setLoading(true);

      useChildStore.getState().reset();

      const state = useChildStore.getState();
      expect(state.activeChild).toBeNull();
      expect(state.children).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });
});
