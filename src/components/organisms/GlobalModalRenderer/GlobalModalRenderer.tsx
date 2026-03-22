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
  const title = (modalData?.title as string) ?? 'Onay Gerekli';
  const message = (modalData?.message as string) ?? 'Bu işlemi yapmak istediğine emin misin?';
  const confirmText = (modalData?.confirmText as string) ?? 'Onayla';
  const cancelText = (modalData?.cancelText as string) ?? 'Vazgeç';
  const tone = (modalData?.tone as 'default' | 'danger') ?? 'default';
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
  const navigate = useNavigate();
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
          <h3 className="text-xl font-bold text-gray-900">⚙️ Hızlı Ayarlar</h3>
          <p className="mt-1 text-sm text-gray-500">Ses, titreşim ve ebeveyn ayarlarına hızlı erişim.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {[
          ['🔊 Ses efektleri', 'soundEnabled'],
          ['🎵 Arka plan müziği', 'musicEnabled'],
          ['📳 Titreşim', 'hapticEnabled'],
          ['🔔 Bildirimler', 'notificationsEnabled'],
        ].map(([label, key]) => (
          <div key={String(key)} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            <button
              type="button"
              onClick={() => {
                toggleSetting(
                  key as 'soundEnabled' | 'musicEnabled' | 'hapticEnabled' | 'notificationsEnabled',
                );
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                user?.settings[key as keyof typeof user.settings] ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {user?.settings[key as keyof typeof user.settings] ? 'Açık' : 'Kapalı'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            void navigate('/parent/settings');
          }}
          className="w-full rounded-2xl bg-nova-blue/10 px-4 py-3 text-sm font-semibold text-nova-blue"
        >
          👨‍👩‍👧 Gelişmiş ebeveyn ayarları
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            openModal('confirmation', {
              title: 'Oturumu kapat',
              message: 'Bu cihazdaki oturumu kapatıp giriş ekranına dönmek istiyor musun?',
              confirmText: 'Çıkış yap',
              cancelText: 'Kal',
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
          🚪 Oturumu kapat
        </button>
      </div>
    </ModalShell>
  );
}

function StreakLostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const child = useChildStore((s) => s.activeChild);
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const freezeMutation = useStreakFreezeAction();

  const streakText = child?.currentStreak && child.currentStreak > 0 ? `${child.currentStreak} günlük seri aktif` : 'Serin risk altında';

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mb-3 text-5xl">🔥</div>
        <h3 className="text-xl font-bold text-gray-900">Seriyi Koru</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          {streakText}. Elindeki seri korumaları kullanarak serini kaybetmeden devam edebilirsin.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-orange-50 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{child?.currentStreak ?? 0}</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">Aktif seri</div>
        </div>
        <div className="rounded-2xl bg-sky-50 p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">{child?.streakFreezes ?? 0}</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">Seri koruma</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          disabled={!child || (child.streakFreezes ?? 0) <= 0 || freezeMutation.isPending}
          onClick={() => {
            if (!child || (child.streakFreezes ?? 0) <= 0) return;
            openModal('confirmation', {
              title: 'Seri koruma kullan',
              message: '1 adet seri koruma harcanacak. Devam etmek istiyor musun?',
              confirmText: 'Kullan',
              cancelText: 'Vazgeç',
              onConfirm: async () => {
                await freezeMutation.mutateAsync({ childId: child.id });
                showToast({
                  type: 'success',
                  title: 'Seri korundu',
                  message: 'Bugünkü serin güvende.',
                });
              },
            });
            onClose();
          }}
          className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          🧊 1 seri koruma kullan
        </button>
        <p className="text-center text-xs text-gray-500">Koruman yoksa bugün bir ders tamamlayıp serini devam ettir.</p>
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
  const name = (modalData?.name as string) ?? 'Koleksiyon Öğesi';
  const emoji = (modalData?.emoji as string) ?? '✨';
  const rarity = (modalData?.rarity as string) ?? 'common';
  const description =
    (modalData?.description as string) ?? 'Bu öğeyi dersler ve görevler üzerinden kazanabilirsin.';
  const fact = (modalData?.fact as string) ?? 'Nova her koleksiyon parçasını saklamayı çok sever.';

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} size="max-w-sm">
      <div className="text-center">
        <div className="mb-3 text-6xl">{emoji}</div>
        <div className="mb-2 inline-flex rounded-full bg-nova-purple/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-nova-purple">
          {rarity}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
      </div>

      <div className="mt-5 rounded-2xl bg-amber-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-700">Nova notu</div>
        <p className="mt-2 text-sm leading-6 text-amber-900">{fact}</p>
      </div>
    </ModalShell>
  );
}

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
