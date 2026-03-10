/**
 * Child Profile TanStack Query Hooks
 *
 * Çocuk profili CRUD operasyonları — fetch, create, update, delete.
 */

import type { ChildProfile } from '@/types/user';
import {
  collections,
  docs,
  getDocument,
  queryCollection,
  where,
} from '@services/firebase/firestore';
import {
  createChildProfile,
  deleteChildProfile,
  updateChildProfile,
  type CreateChildProfileReq,
  type DeleteChildProfileReq,
  type UpdateChildProfileReq,
} from '@services/firebase/functions';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useRef } from 'react';

// ===== QUERY KEYS =====
export const childKeys = {
  all: ['children'] as const,
  list: (parentUid: string) => ['children', 'list', parentUid] as const,
  detail: (childId: string) => ['children', 'detail', childId] as const,
};

// ===== FETCH CHILDREN =====
export function useChildren() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const setChildren = useChildStore((s) => s.setChildren);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const activeChildRef = useRef(useChildStore.getState().activeChild);

  const query = useQuery({
    queryKey: childKeys.list(uid ?? ''),
    queryFn: async () => {
      if (!uid) return [];
      const children = await queryCollection<ChildProfile>(
        collections.children(),
        where('parentUid', '==', uid),
      );
      return children;
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
  });

  // Sync query data to store (outside of select, in an effect)
  useEffect(() => {
    if (query.data) {
      setChildren(query.data);
      if (!activeChildRef.current && query.data.length > 0) {
        const first = query.data[0] ?? null;
        setActiveChild(first);
        activeChildRef.current = first;
      }
    }
  }, [query.data, setChildren, setActiveChild]);

  return query;
}

// ===== FETCH SINGLE CHILD =====
export function useChild(childId: string | undefined) {
  return useQuery({
    queryKey: childKeys.detail(childId ?? ''),
    queryFn: async () => {
      if (!childId) return null;
      return getDocument<ChildProfile>(docs.child(childId));
    },
    enabled: !!childId,
    staleTime: 2 * 60 * 1000,
  });
}

// ===== CREATE CHILD =====
export function useCreateChild() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const setActiveChild = useChildStore((s) => s.setActiveChild);

  return useMutation({
    mutationFn: (data: CreateChildProfileReq) => createChildProfile(data),
    onSuccess: (result) => {
      // Set as active child with full profile shape
      setActiveChild({
        id: result.childId,
        parentUid: result.parentUid,
        name: result.name,
        ageGroup: result.ageGroup,
        avatarId: result.avatarId,
        level: result.level,
        totalXP: result.totalXP,
        currentLevelXP: result.currentXP,
        nextLevelXP: 100,
        stars: result.currency.stars,
        gems: result.currency.gems,
        currentStreak: result.streak.current,
        longestStreak: result.streak.longest,
        lastActivityDate: result.streak.lastActivityDate ?? '',
        streakFreezes: result.streak.freezesAvailable,
        novaStage: result.novaStage as ChildProfile['novaStage'],
        novaHappiness: 100,
        novaOutfitId: null,
        leagueId: 'bronze_default',
        leagueTier: 'bronze',
        weeklyXP: 0,
        currentWorldId: 'w1',
        currentUnitId: 'u1',
        completedLessons: 0,
        totalPlayTimeMinutes: 0,
        wordsLearned: 0,
        createdAt: Timestamp.now(),
      } as ChildProfile);

      // Invalidate children list
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: childKeys.list(uid) });
      }
    },
  });
}

// ===== UPDATE CHILD =====
export function useUpdateChild() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const updateActiveChild = useChildStore((s) => s.updateActiveChild);

  return useMutation({
    mutationFn: (data: UpdateChildProfileReq) => updateChildProfile(data),
    onSuccess: (result) => {
      updateActiveChild({ name: result.name, avatarId: result.avatarId });
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: childKeys.list(uid) });
      }
      void queryClient.invalidateQueries({ queryKey: childKeys.detail(result.childId) });
    },
  });
}

// ===== DELETE CHILD =====
export function useDeleteChild() {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const setActiveChild = useChildStore((s) => s.setActiveChild);
  const children = useChildStore((s) => s.children);

  return useMutation({
    mutationFn: (data: DeleteChildProfileReq) => deleteChildProfile(data),
    onSuccess: (result) => {
      // Set new active child or null
      if (result.newActiveChildId) {
        const newActive = children.find((c) => c.id === result.newActiveChildId);
        setActiveChild(newActive ?? null);
      } else {
        setActiveChild(null);
      }
      if (uid) {
        void queryClient.invalidateQueries({ queryKey: childKeys.list(uid) });
      }
    },
  });
}
