/**
 * Gamification TanStack Query Hooks
 *
 * Quest, achievement, shop, wheel, leaderboard, vocabulary operasyonları.
 */

import type { DailyQuest, LeaderboardEntry, ShopItem, UserAchievement } from '@/types/gamification';
import { collections, queryCollection, where } from '@services/firebase/firestore';
import {
  claimQuestReward,
  getLeaderboard,
  purchaseShopItem,
  spinDailyWheel,
  useStreakFreeze as streakFreezeCallable,
  updateVocabulary,
  type ClaimQuestRewardReq,
  type PurchaseShopItemReq,
  type SpinDailyWheelReq,
  type UpdateVocabularyReq,
  type UseStreakFreezeReq,
} from '@services/firebase/functions';
import { useChildStore } from '@stores/childStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ===== QUERY KEYS =====
export const gamificationKeys = {
  quests: (childId: string) => ['quests', childId] as const,
  achievements: (childId: string) => ['achievements', childId] as const,
  achievementCatalog: ['achievementCatalog'] as const,
  shopItems: (category?: string) => ['shopItems', category] as const,
  leaderboard: (leagueId: string) => ['leaderboard', leagueId] as const,
  inventory: (childId: string) => ['inventory', childId] as const,
  collectibles: (category: string) => ['collectibles', category] as const,
};

// ===== DAILY QUESTS =====
export function useDailyQuests(childId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.quests(childId ?? ''),
    queryFn: () => {
      if (!childId) return [];
      return queryCollection<DailyQuest>(collections.childQuests(childId));
    },
    enabled: !!childId,
    staleTime: 60 * 1000, // 1 min
  });
}

// ===== CLAIM QUEST REWARD =====
export function useClaimQuestReward() {
  const queryClient = useQueryClient();
  const addXP = useChildStore((s) => s.addXP);
  const updateCurrency = useChildStore((s) => s.updateCurrency);

  return useMutation({
    mutationFn: (data: ClaimQuestRewardReq) => claimQuestReward(data),
    onSuccess: (result, variables) => {
      if (result.reward.xp) addXP(result.reward.xp);
      if (result.reward.stars || result.reward.gems) {
        updateCurrency(result.reward.stars, result.reward.gems);
      }
      void queryClient.invalidateQueries({
        queryKey: gamificationKeys.quests(variables.childId),
      });
    },
  });
}

// ===== ACHIEVEMENTS =====
export function useAchievements(childId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.achievements(childId ?? ''),
    queryFn: () => {
      if (!childId) return [];
      return queryCollection<UserAchievement>(collections.childAchievements(childId));
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievementCatalog() {
  return useQuery({
    queryKey: gamificationKeys.achievementCatalog,
    queryFn: () =>
      queryCollection<{
        id: string;
        name: string;
        description: string;
        icon: string;
        category: string;
        rarity: string;
        target: number;
      }>(collections.achievementsCatalog()),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// ===== SHOP =====
export function useShopItems(category?: string) {
  return useQuery({
    queryKey: gamificationKeys.shopItems(category),
    queryFn: () => {
      if (category) {
        return queryCollection<ShopItem>(
          collections.shopItems(),
          where('category', '==', category),
        );
      }
      return queryCollection<ShopItem>(collections.shopItems());
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function usePurchaseItem() {
  const queryClient = useQueryClient();
  const updateCurrency = useChildStore((s) => s.updateCurrency);
  const child = useChildStore((s) => s.activeChild);

  return useMutation({
    mutationFn: (data: PurchaseShopItemReq) => purchaseShopItem(data),
    onSuccess: (result) => {
      if (child) {
        updateCurrency(result.newBalance.stars - child.stars, result.newBalance.gems - child.gems);
      }
      if (child?.id) {
        void queryClient.invalidateQueries({
          queryKey: gamificationKeys.inventory(child.id),
        });
      }
    },
  });
}

// ===== DAILY WHEEL =====
export function useSpinWheel() {
  return useMutation({
    mutationFn: (data: SpinDailyWheelReq) => spinDailyWheel(data),
  });
}

// ===== LEADERBOARD =====
export function useLeaderboard(leagueId: string | undefined) {
  const childId = useChildStore((s) => s.activeChild?.id);

  return useQuery({
    queryKey: gamificationKeys.leaderboard(leagueId ?? ''),
    queryFn: async () => {
      if (!childId || !leagueId) return { entries: [] as LeaderboardEntry[], myRank: 0 };
      const result = await getLeaderboard({ childId, leagueId });
      return {
        entries: result.entries.map((e, i) => ({
          childId: `c${i}`,
          displayName: e.displayName,
          avatarId: e.avatarId,
          level: e.level,
          weeklyXP: e.weeklyXP,
          rank: e.rank,
          trend: 'same' as const,
        })),
        myRank: result.myRank,
      };
    },
    enabled: !!childId && !!leagueId,
    staleTime: 60 * 1000, // 1 min
  });
}

// ===== STREAK FREEZE =====
export function useStreakFreezeAction() {
  const updateActiveChild = useChildStore((s) => s.updateActiveChild);

  return useMutation({
    mutationFn: (data: UseStreakFreezeReq) => streakFreezeCallable(data),
    onSuccess: (result) => {
      updateActiveChild({ streakFreezes: result.freezesRemaining });
    },
  });
}

// ===== VOCABULARY =====
export function useUpdateVocabulary() {
  return useMutation({
    mutationFn: (data: UpdateVocabularyReq) => updateVocabulary(data),
  });
}

// ===== COLLECTIBLES =====
export function useCollectibles(category: string) {
  return useQuery({
    queryKey: gamificationKeys.collectibles(category),
    queryFn: () =>
      queryCollection<{
        id: string;
        name: string;
        emoji: string;
        rarity: string;
        category: string;
      }>(collections.collectibles(), where('category', '==', category)),
    staleTime: 10 * 60 * 1000,
  });
}

export function useInventory(childId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.inventory(childId ?? ''),
    queryFn: () => {
      if (!childId) return [];
      return queryCollection<{ id: string }>(collections.childInventory(childId));
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
}
