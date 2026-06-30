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
import { useSpinWheel, useStreakFreezeAction } from '@hooks/queries';
import { trackDailyWheelSpin } from '@services/analytics/analyticsService';
import { signOut } from '@services/firebase/auth';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useUIStore } from '@stores/uiStore';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

function ModalShell({
  isOpen,
  onClose,
  children,
  size = 'max-w-md',
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full ${size} rounded-3xl bg-white p-6 shadow-2xl`}>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

function ConfirmationModal({
  isOpen,
  onClose,
  modalData,
}: {
  isOpen: boolean;
  onClose: () => void;
  modalData: Record<string, unknown> | null;
}) {
  const { t } = useTranslation('common');
  const title = (modalData?.title as string | undefined) ?? t('modals.confirmTitle');
  const message = (modalData?.message as string | undefined) ?? t('modals.confirmDefault');
  const confirmText = (modalData?.confirmText as string | undefined) ?? t('modals.confirmOk');
  const cancelText = (modalData?.cancelText as string | undefined) ?? t('modals.cancel');
  const tone = (modalData?.tone as 'default' | 'danger' | undefined) ?? 'default';
  const onConfirm = modalData?.onConfirm as (() => void | Promise<void>) | undefined;
  const onCancel = modalData?.onCancel as (() => void) | undefined;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mb-3 text-4xl">{tone === 'danger' ? '⚠️' : '✅'}</div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              void onConfirm?.();
              onClose();
            }}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
              tone === 'danger' ? 'bg-red-500' : 'bg-nova-blue'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const activeLang = (i18n.resolvedLanguage ?? i18n.language).startsWith('en') ? 'en' : 'tr';
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const resetAuth = useAuthStore((s) => s.reset);
  const resetChild = useChildStore((s) => s.reset);
  const openModal = useUIStore((s) => s.openModal);

  const toggleSetting = useCallback(
    (key: 'soundEnabled' | 'musicEnabled' | 'hapticEnabled' | 'notificationsEnabled') => {
      if (!user) return;
      setUser({
        ...user,
        settings: {
          ...user.settings,
          [key]: !user.settings[key],
        },
      });
    },
    [setUser, user],
  );

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{t('modals.settingsTitle')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('modals.settingsDesc')}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {(
          [
            ['modals.toggleSound', 'soundEnabled'],
            ['modals.toggleMusic', 'musicEnabled'],
            ['modals.toggleHaptic', 'hapticEnabled'],
            ['modals.toggleNotifications', 'notificationsEnabled'],
          ] as const
        ).map(([labelKey, key]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
          >
            <span className="text-sm font-semibold text-gray-700">{t(labelKey)}</span>
            <button
              type="button"
              onClick={() => {
                toggleSetting(key);
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                user?.settings[key] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {user?.settings[key] ? t('modals.on') : t('modals.off')}
            </button>
          </div>
        ))}
      </div>

      {/* Language switcher — UI dili (öğretilen dil değil) */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">{t('modals.language')}</span>
        <div className="flex gap-2">
          {(
            [
              ['tr', 'Türkçe'],
              ['en', 'English'],
            ] as const
          ).map(([lng, label]) => (
            <button
              key={lng}
              type="button"
              onClick={() => {
                void i18n.changeLanguage(lng);
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                activeLang === lng ? 'bg-nova-blue text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            void navigate('/parent/settings');
          }}
          className="bg-nova-blue/10 text-nova-blue w-full rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          {t('modals.advancedParent')}
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            openModal('confirmation', {
              title: t('modals.signOutTitle'),
              message: t('modals.signOutMessage'),
              confirmText: t('modals.signOutConfirm'),
              cancelText: t('modals.signOutStay'),
              tone: 'danger',
              onConfirm: async () => {
                await signOut();
                resetAuth();
                resetChild();
                void navigate('/login');
              },
            });
          }}
          className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
        >
          {t('modals.signOutButton')}
        </button>
      </div>
    </ModalShell>
  );
}

function StreakLostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation('common');
  const child = useChildStore((s) => s.activeChild);
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const freezeMutation = useStreakFreezeAction();

  const streakText =
    child?.currentStreak && child.currentStreak > 0
      ? t('modals.streakActive', { count: child.currentStreak })
      : t('modals.streakAtRisk');

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mb-3 text-5xl">🔥</div>
        <h3 className="text-xl font-bold text-gray-900">{t('modals.streakTitle')}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {streakText}. {t('modals.streakDesc')}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-orange-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{child?.currentStreak ?? 0}</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">
            {t('modals.activeStreakLabel')}
          </div>
        </div>
        <div className="rounded-2xl bg-sky-50 p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">{child?.streakFreezes ?? 0}</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">{t('modals.freezeLabel')}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          disabled={!child || child.streakFreezes <= 0 || freezeMutation.isPending}
          onClick={() => {
            if (!child || child.streakFreezes <= 0) return;
            openModal('confirmation', {
              title: t('modals.useFreezeTitle'),
              message: t('modals.useFreezeMessage'),
              confirmText: t('modals.useFreezeConfirm'),
              cancelText: t('modals.cancel'),
              onConfirm: async () => {
                await freezeMutation.mutateAsync({ childId: child.id });
                showToast({
                  type: 'success',
                  title: t('modals.streakSavedTitle'),
                  message: t('modals.streakSavedMessage'),
                });
              },
            });
            onClose();
          }}
          className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          {t('modals.useFreeze')}
        </button>
        <p className="text-center text-xs text-gray-500">{t('modals.streakNoFreeze')}</p>
      </div>
    </ModalShell>
  );
}

function CollectibleModal({
  isOpen,
  onClose,
  modalData,
}: {
  isOpen: boolean;
  onClose: () => void;
  modalData: Record<string, unknown> | null;
}) {
  const { t } = useTranslation('common');
  const name = (modalData?.name as string | undefined) ?? t('modals.collectibleName');
  const emoji = (modalData?.emoji as string | undefined) ?? '✨';
  const rarity = (modalData?.rarity as string | undefined) ?? 'common';
  const description = (modalData?.description as string | undefined) ?? t('modals.collectibleDesc');
  const fact = (modalData?.fact as string | undefined) ?? t('modals.collectibleFact');

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} size="max-w-sm">
      <div className="text-center">
        <div className="mb-3 text-6xl">{emoji}</div>
        <div className="bg-nova-purple/10 text-nova-purple mb-2 inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
          {rarity}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
      </div>

      <div className="mt-5 rounded-2xl bg-amber-50 p-4">
        <div className="text-xs font-bold tracking-wide text-amber-700 uppercase">
          {t('modals.novaNote')}
        </div>
        <p className="mt-2 text-sm leading-6 text-amber-900">{fact}</p>
      </div>
    </ModalShell>
  );
}

function DailyWheelModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation('common');
  const child = useChildStore((s) => s.activeChild);
  const addXP = useChildStore((s) => s.addXP);
  const updateCurrency = useChildStore((s) => s.updateCurrency);
  const updateActiveChild = useChildStore((s) => s.updateActiveChild);
  const showToast = useUIStore((s) => s.showToast);
  const spinWheel = useSpinWheel();
  const [hasSpunThisOpen, setHasSpunThisOpen] = useState(false);

  const canSpin = Boolean(child) && !hasSpunThisOpen && !spinWheel.isPending;

  const rewardLabel = useCallback(
    (type: string) => {
      if (type === 'xp') return t('reward.xp');
      if (type === 'stars') return t('reward.stars');
      if (type === 'gems') return t('reward.gems');
      if (type === 'streak_freeze') return t('reward.streakFreeze');
      return t('reward.generic');
    },
    [t],
  );

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
        title: t('modals.wheelRewardTitle'),
        message: `+${result.reward.amount} ${rewardLabel(result.reward.type)}`,
      });

      return {
        sliceIndex: sliceIndex >= 0 ? sliceIndex : 0,
        reward: { type: result.reward.type, amount: result.reward.amount },
      };
    } catch (error) {
      showToast({
        type: 'error',
        title: t('modals.wheelErrorTitle'),
        message: error instanceof Error ? error.message : t('modals.wheelErrorMessage'),
      });
      throw error;
    }
  }, [addXP, child, rewardLabel, showToast, spinWheel, updateActiveChild, updateCurrency, t]);

  const subtitle = useMemo(() => {
    if (!child) return t('modals.wheelNoProfile');
    if (hasSpunThisOpen) return t('modals.wheelAlreadySpun');
    return t('modals.wheelPrompt');
  }, [child, hasSpunThisOpen, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('modals.wheelTitle')}</h3>
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
        level={(modalData?.level as number | undefined) ?? 1}
        rewards={{
          stars: (modalData?.rewards as { stars: number; gems: number } | undefined)?.stars ?? 0,
          gems: (modalData?.rewards as { stars: number; gems: number } | undefined)?.gems ?? 0,
        }}
        onClose={closeModal}
      />

      {/* Nova Evolution Modal */}
      <NovaEvolutionModal
        isOpen={activeModal === 'novaEvolution'}
        oldStage={(modalData?.oldStage as NovaStage | undefined) ?? 'egg'}
        newStage={(modalData?.newStage as NovaStage | undefined) ?? 'baby'}
        onClose={closeModal}
      />

      {/* Achievement Popup */}
      <AchievementPopup
        isOpen={activeModal === 'achievement'}
        achievement={(modalData?.achievement as AchievementDefinition | undefined) ?? null}
        onClose={closeModal}
      />

      <SettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} />

      <StreakLostModal isOpen={activeModal === 'streakLost'} onClose={closeModal} />

      <CollectibleModal
        isOpen={activeModal === 'collectible'}
        modalData={modalData}
        onClose={closeModal}
      />

      <ConfirmationModal
        isOpen={activeModal === 'confirmation'}
        modalData={modalData}
        onClose={closeModal}
      />

      <DailyWheelModal isOpen={activeModal === 'dailyWheel'} onClose={closeModal} />
    </>
  );
}
