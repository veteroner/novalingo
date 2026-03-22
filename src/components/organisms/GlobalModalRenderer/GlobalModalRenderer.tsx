/**
 * GlobalModalRenderer Organism
 *
 * uiStore'daki activeModal durumuna göre doğru modal bileşenini render eder.
 * AppProviders içinde tek bir yerde kullanılır.
 */

import type { AchievementDefinition, WheelSlice } from '@/types';
import type { NovaStage } from '@/types/user';
import { AchievementPopup } from '@components/organisms/AchievementPopup';
import { DailyWheel } from '@components/organisms/DailyWheel';
import { LevelUpModal } from '@components/organisms/LevelUpModal';
import { NovaEvolutionModal } from '@components/organisms/NovaEvolutionModal';
import { useSpinWheel } from '@hooks/queries';
import { trackDailyWheelSpin } from '@services/analytics/analyticsService';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import { useCallback, useMemo, useState } from 'react';

const DAILY_WHEEL_SLICES: WheelSlice[] = [
  {
    id: 'stars_10',
    label: '10 ⭐',
    reward: { type: 'stars', amount: 10 },
    weight: 25,
    color: '#4ECDC4',
    iconUrl: '',
  },
  {
    id: 'stars_25',
    label: '25 ⭐',
    reward: { type: 'stars', amount: 25 },
    weight: 20,
    color: '#FF6B6B',
    iconUrl: '',
  },
  {
    id: 'stars_50',
    label: '50 ⭐',
    reward: { type: 'stars', amount: 50 },
    weight: 10,
    color: '#45B7D1',
    iconUrl: '',
  },
  {
    id: 'xp_20',
    label: '20 XP',
    reward: { type: 'xp', amount: 20 },
    weight: 15,
    color: '#FFA07A',
    iconUrl: '',
  },
  {
    id: 'xp_50',
    label: '50 XP',
    reward: { type: 'xp', amount: 50 },
    weight: 10,
    color: '#98D8C8',
    iconUrl: '',
  },
  {
    id: 'gems_5',
    label: '5 💎',
    reward: { type: 'gems', amount: 5 },
    weight: 10,
    color: '#F7DC6F',
    iconUrl: '',
  },
  {
    id: 'gems_10',
    label: '10 💎',
    reward: { type: 'gems', amount: 10 },
    weight: 5,
    color: '#BB8FCE',
    iconUrl: '',
  },
  {
    id: 'freeze',
    label: '1 🧊',
    reward: { type: 'streak_freeze', amount: 1 },
    weight: 5,
    color: '#85C1E9',
    iconUrl: '',
  },
];

function DailyWheelModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const child = useChildStore((s) => s.activeChild);
  const addXP = useChildStore((s) => s.addXP);
  const updateCurrency = useChildStore((s) => s.updateCurrency);
  const updateActiveChild = useChildStore((s) => s.updateActiveChild);
  const showToast = useUIStore((s) => s.showToast);
  const spinWheel = useSpinWheel();
  const [hasSpunThisOpen, setHasSpunThisOpen] = useState(false);

  const canSpin = Boolean(child) && !hasSpunThisOpen && !spinWheel.isPending;

  const rewardLabel = useCallback((type: string) => {
    if (type === 'xp') return 'XP';
    if (type === 'stars') return 'yıldız';
    if (type === 'gems') return 'elmas';
    if (type === 'streak_freeze') return 'seri koruma';
    return 'ödül';
  }, []);

  const handleSpin = useCallback(async () => {
    if (!child) {
      throw new Error('Child profile is required');
    }

    try {
      const result = await spinWheel.mutateAsync({ childId: child.id });
      const sliceIndex = DAILY_WHEEL_SLICES.findIndex((slice) => slice.id === result.sliceId);

      if (result.reward.type === 'xp') {
        addXP(result.reward.amount);
      } else if (result.reward.type === 'stars') {
        updateCurrency(result.reward.amount, 0);
      } else if (result.reward.type === 'gems') {
        updateCurrency(0, result.reward.amount);
      } else if (result.reward.type === 'streak_freeze') {
        updateActiveChild({ streakFreezes: child.streakFreezes + result.reward.amount });
      }

      setHasSpunThisOpen(true);
      trackDailyWheelSpin(`${result.reward.type}:${result.reward.amount}`);
      showToast({
        type: 'success',
        title: 'Günlük ödül kazanıldı',
        message: `+${result.reward.amount} ${rewardLabel(result.reward.type)}`,
      });

      return {
        sliceIndex: sliceIndex >= 0 ? sliceIndex : 0,
        reward: { type: result.reward.type, amount: result.reward.amount },
      };
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Çark çevrilemedi',
        message: error instanceof Error ? error.message : 'Lütfen biraz sonra tekrar dene.',
      });
      throw error;
    }
  }, [addXP, child, rewardLabel, showToast, spinWheel, updateActiveChild, updateCurrency]);

  const subtitle = useMemo(() => {
    if (!child) return 'Çarkı çevirmek için önce bir profil seç.';
    if (hasSpunThisOpen) return 'Bugünkü ödülünü aldın. Yarın tekrar gel.';
    return 'Her gün bir kez çevir ve sürpriz ödül kazan.';
  }, [child, hasSpunThisOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">🎰 Günlük Çark</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500"
          >
            Kapat
          </button>
        </div>

        <DailyWheel slices={DAILY_WHEEL_SLICES} canSpin={canSpin} onSpin={handleSpin} />
      </div>
    </div>
  );
}

export function GlobalModalRenderer() {
  const activeModal = useUIStore((s) => s.activeModal);
  const modalData = useUIStore((s) => s.modalData);
  const closeModal = useUIStore((s) => s.closeModal);

  return (
    <>
      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={activeModal === 'levelUp'}
        level={(modalData?.level as number) ?? 1}
        rewards={{
          stars: (modalData?.rewards as { stars: number; gems: number })?.stars ?? 0,
          gems: (modalData?.rewards as { stars: number; gems: number })?.gems ?? 0,
        }}
        onClose={closeModal}
      />

      {/* Nova Evolution Modal */}
      <NovaEvolutionModal
        isOpen={activeModal === 'novaEvolution'}
        oldStage={(modalData?.oldStage as NovaStage) ?? 'egg'}
        newStage={(modalData?.newStage as NovaStage) ?? 'baby'}
        onClose={closeModal}
      />

      {/* Achievement Popup */}
      <AchievementPopup
        isOpen={activeModal === 'achievement'}
        achievement={(modalData?.achievement as AchievementDefinition) ?? null}
        onClose={closeModal}
      />

      <DailyWheelModal isOpen={activeModal === 'dailyWheel'} onClose={closeModal} />
    </>
  );
}
