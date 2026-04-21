/**
 * ParentSettings
 *
 * Ebeveyn ayarları — bildirimler, günlük limitler, içerik filtreleri, hesap yönetimi.
 */

import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { ListItem } from '@components/molecules/ListItem';
import { MainLayout } from '@components/templates/MainLayout';
import { useChildren, useParentSettings, useSaveParentSettings } from '@hooks/queries';
import { getCurrentUser, signOut } from '@services/firebase/auth';
import {
  deleteAccount as deleteAccountCallable,
  setParentPin as setParentPinCallable,
  type DeleteAccountReq,
  type SetParentPinReq,
} from '@services/firebase/functions';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Toggle switch component
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => {
        onChange(!value);
      }}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        value ? 'bg-nova-blue' : 'bg-gray-300'
      }`}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow"
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function ParentSettings() {
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);

  const { data: settingsData } = useParentSettings();
  const saveMutation = useSaveParentSettings();

  // Settings state — hydrated from query
  const [dailyLimit, setDailyLimit] = useState(30);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievementAlert: true,
    inactivityAlert: false,
  });
  const [contentFilter, setContentFilter] = useState({
    socialFeatures: true,
    leaderboard: true,
    chatEnabled: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [pinStep, setPinStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [deletePinInput, setDeletePinInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  // Data export state
  const [exporting, setExporting] = useState(false);

  const { data: childrenData } = useChildren();

  const saveParentPin = async (data: SetParentPinReq): Promise<void> => {
    const callable = setParentPinCallable as (request: SetParentPinReq) => Promise<unknown>;
    await callable(data);
  };

  const removeAccount = async (data: DeleteAccountReq): Promise<void> => {
    const callable = deleteAccountCallable as (request: DeleteAccountReq) => Promise<unknown>;
    await callable(data);
  };

  const handleEmailChange = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailMessage('Geçerli bir e-posta adresi girin.');
      return;
    }

    const firebaseUser = getCurrentUser();
    if (!firebaseUser) {
      setEmailMessage('Oturum bulunamadı. Tekrar giriş yapın.');
      return;
    }

    setEmailSaving(true);
    setEmailMessage('');
    try {
      await verifyBeforeUpdateEmail(firebaseUser, trimmed);
      setEmailMessage('Doğrulama e-postası gönderildi! Yeni adresinizi onaylayın.');
      setNewEmail('');
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/requires-recent-login') {
        setEmailMessage('Güvenlik nedeniyle tekrar giriş yapmanız gerekiyor.');
      } else if (code === 'auth/email-already-in-use') {
        setEmailMessage('Bu e-posta adresi zaten kullanımda.');
      } else {
        setEmailMessage('E-posta değiştirilemedi. Tekrar deneyin.');
      }
    } finally {
      setEmailSaving(false);
    }
  };

  const handleDataExport = () => {
    setExporting(true);
    try {
      const exportData: Record<string, unknown> = {
        exportDate: new Date().toISOString(),
        account: {
          email: user?.email,
          displayName: user?.displayName,
          provider: user?.provider,
          isPremium: user?.isPremium,
          createdAt: user?.createdAt,
          settings: user?.settings,
        },
        children: (childrenData ?? []).map((c) => ({
          name: c.name,
          ageGroup: c.ageGroup,
          level: c.level,
          totalXP: c.totalXP,
          stars: c.stars,
          gems: c.gems,
          currentStreak: c.currentStreak,
          longestStreak: c.longestStreak,
          wordsLearned: c.wordsLearned,
          completedLessons: c.completedLessons,
          totalPlayTimeMinutes: c.totalPlayTimeMinutes,
          novaStage: c.novaStage,
        })),
        parentSettings: settingsData ?? null,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novalingo-veriler-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const user = useAuthStore((s) => s.user);
  const hasPinSet = user?.settings.parentPin != null;

  // Hydrate local state from query data
  useEffect(() => {
    if (!settingsData) return;
    setDailyLimit(settingsData.dailyLimit);
    setNotifications(settingsData.notifications);
    setContentFilter(settingsData.contentFilter);
  }, [settingsData]);

  const timeLimits = [15, 30, 45, 60, 90, 120];

  const handleSave = () => {
    saveMutation.mutate(
      { dailyLimit, notifications, contentFilter },
      { onSettled: () => void navigate('/parent') },
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      useAuthStore.getState().reset();
      useChildStore.getState().reset();
      void navigate('/onboarding');
    } catch {
      // silently fail, user can retry
    }
  };

  return (
    <MainLayout showNavigation={false}>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parent')}>
            ←
          </Button>
          <div>
            <Text variant="h3">⚙️ Ayarlar</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {child?.name} için ayarlar
            </Text>
          </div>
        </div>

        {/* Time Limit */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            ⏰ Günlük Süre Limiti
          </Text>
          <Text variant="bodySmall" className="text-text-secondary mb-4">
            Çocuğunuzun günlük uygulama kullanım süresi
          </Text>
          <div className="grid grid-cols-3 gap-2">
            {timeLimits.map((limit) => (
              <button
                key={limit}
                className={`rounded-xl py-3 text-sm font-bold transition-all ${
                  dailyLimit === limit
                    ? 'bg-nova-blue text-white shadow-md'
                    : 'text-text-secondary bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setDailyLimit(limit);
                }}
              >
                {limit} dk
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            🔔 Bildirimler
          </Text>
          <div className="space-y-1">
            <ListItem
              title="Günlük Hatırlatma"
              subtitle="Her gün öğrenme zamanı bildirimi"
              trailing={
                <Toggle
                  value={notifications.dailyReminder}
                  onChange={(v) => {
                    setNotifications((n) => ({ ...n, dailyReminder: v }));
                  }}
                />
              }
              divider
            />
            <ListItem
              title="Haftalık Rapor"
              subtitle="İlerleme raporunu e-posta ile al"
              trailing={
                <Toggle
                  value={notifications.weeklyReport}
                  onChange={(v) => {
                    setNotifications((n) => ({ ...n, weeklyReport: v }));
                  }}
                />
              }
              divider
            />
            <ListItem
              title="Başarı Bildirimleri"
              subtitle="Yeni başarı kazanıldığında bilgilendir"
              trailing={
                <Toggle
                  value={notifications.achievementAlert}
                  onChange={(v) => {
                    setNotifications((n) => ({ ...n, achievementAlert: v }));
                  }}
                />
              }
              divider
            />
            <ListItem
              title="Hareketsizlik Uyarısı"
              subtitle="3 gün giriş yapılmazsa bilgilendir"
              trailing={
                <Toggle
                  value={notifications.inactivityAlert}
                  onChange={(v) => {
                    setNotifications((n) => ({ ...n, inactivityAlert: v }));
                  }}
                />
              }
            />
          </div>
        </Card>

        {/* Content Filters */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            🛡️ İçerik Kontrolü
          </Text>
          <div className="space-y-1">
            <ListItem
              title="Sosyal Özellikler"
              subtitle="Liderlik tablosu ve sıralama"
              trailing={
                <Toggle
                  value={contentFilter.socialFeatures}
                  onChange={(v) => {
                    setContentFilter((c) => ({ ...c, socialFeatures: v }));
                  }}
                />
              }
              divider
            />
            <ListItem
              title="Sıralama Tablosu"
              subtitle="Diğer öğrencilerle karşılaştırma"
              trailing={
                <Toggle
                  value={contentFilter.leaderboard}
                  onChange={(v) => {
                    setContentFilter((c) => ({ ...c, leaderboard: v }));
                  }}
                />
              }
              divider
            />
            <ListItem
              title="Sohbet"
              subtitle="Ders içi sohbet (devre dışı)"
              trailing={
                <Toggle
                  value={contentFilter.chatEnabled}
                  onChange={(v) => {
                    setContentFilter((c) => ({ ...c, chatEnabled: v }));
                  }}
                />
              }
            />
          </div>
        </Card>

        {/* Account */}
        <Card variant="outlined" padding="md">
          <Text variant="h4" className="mb-3">
            👤 Hesap
          </Text>
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                setShowPinChange(true);
                setPinStep(hasPinSet ? 'current' : 'new');
                setCurrentPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
                setPinMessage('');
              }}
            >
              {hasPinSet ? 'PIN Kodunu Değiştir' : 'PIN Kodu Belirle'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                setShowEmailChange(true);
                setNewEmail('');
                setEmailMessage('');
              }}
            >
              E-posta Değiştir
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={exporting}
              onClick={() => {
                handleDataExport();
              }}
            >
              {exporting ? 'Dışa Aktarılıyor...' : 'Verileri Dışa Aktar'}
            </Button>
            <Button variant="danger" size="md" fullWidth onClick={() => void handleSignOut()}>
              Çıkış Yap
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setShowDeleteConfirm(true);
                setDeletePinInput('');
                setDeleteError('');
              }}
              className="text-error!"
            >
              Hesabı Sil
            </Button>
          </div>
        </Card>

        {/* PIN Change Modal */}
        <AnimatePresence>
          {showPinChange && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
              onClick={() => {
                setShowPinChange(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Text variant="h4" align="center" className="mb-2">
                  🔑 {hasPinSet ? 'PIN Değiştir' : 'PIN Belirle'}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  {pinStep === 'current' && 'Mevcut PIN kodunuzu girin'}
                  {pinStep === 'new' && 'Yeni 4 haneli PIN kodunuzu girin'}
                  {pinStep === 'confirm' && 'Yeni PIN kodunuzu tekrar girin'}
                </Text>

                {/* PIN dots */}
                <div className="mb-4 flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => {
                    const activePin =
                      pinStep === 'current'
                        ? currentPinInput
                        : pinStep === 'new'
                          ? newPinInput
                          : confirmPinInput;
                    return (
                      <div
                        key={i}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-xl font-bold ${
                          activePin.length > i
                            ? 'border-nova-blue bg-nova-blue/5'
                            : 'border-gray-200'
                        }`}
                      >
                        {activePin.length > i ? '●' : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Number pad */}
                <div className="mx-auto mb-4 grid max-w-50 grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key) => (
                    <button
                      key={String(key)}
                      disabled={pinSaving}
                      className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
                        key === null
                          ? 'invisible'
                          : 'bg-gray-100 transition-colors active:bg-gray-200'
                      }`}
                      onClick={() => {
                        const setter =
                          pinStep === 'current'
                            ? setCurrentPinInput
                            : pinStep === 'new'
                              ? setNewPinInput
                              : setConfirmPinInput;
                        const current =
                          pinStep === 'current'
                            ? currentPinInput
                            : pinStep === 'new'
                              ? newPinInput
                              : confirmPinInput;

                        if (key === 'del') {
                          setter((p) => p.slice(0, -1));
                          setPinMessage('');
                        } else if (key !== null && current.length < 4) {
                          const newVal = current + String(key);
                          setter(newVal);
                          setPinMessage('');

                          if (newVal.length === 4) {
                            if (pinStep === 'current') {
                              setPinStep('new');
                            } else if (pinStep === 'new') {
                              setPinStep('confirm');
                            } else {
                              if (newVal !== newPinInput) {
                                setPinMessage('PIN kodları eşleşmiyor');
                                setConfirmPinInput('');
                              } else {
                                void (async () => {
                                  setPinSaving(true);

                                  try {
                                    await saveParentPin({
                                      pin: newPinInput,
                                      ...(hasPinSet ? { currentPin: currentPinInput } : {}),
                                    });
                                    setPinMessage('PIN başarıyla kaydedildi!');
                                    setTimeout(() => {
                                      setShowPinChange(false);
                                    }, 1000);
                                  } catch {
                                    setPinMessage('PIN kaydedilemedi. Tekrar deneyin.');
                                    setCurrentPinInput('');
                                    setNewPinInput('');
                                    setConfirmPinInput('');
                                    setPinStep(hasPinSet ? 'current' : 'new');
                                  } finally {
                                    setPinSaving(false);
                                  }
                                })();
                              }
                            }
                          }
                        }
                      }}
                    >
                      {key === 'del' ? '⌫' : key !== null ? String(key) : ''}
                    </button>
                  ))}
                </div>

                {pinMessage && (
                  <Text
                    variant="bodySmall"
                    align="center"
                    className={`mb-3 ${pinMessage.includes('başarı') ? 'text-success' : 'text-error'}`}
                  >
                    {pinMessage}
                  </Text>
                )}

                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowPinChange(false);
                  }}
                >
                  Vazgeç
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Change Modal */}
        <AnimatePresence>
          {showEmailChange && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
              onClick={() => {
                setShowEmailChange(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Text variant="h4" align="center" className="mb-2">
                  ✉️ E-posta Değiştir
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-2">
                  Mevcut: {user?.email ?? 'Belirtilmemiş'}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  Yeni e-posta adresinize doğrulama bağlantısı gönderilecektir.
                </Text>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailMessage('');
                  }}
                  placeholder="Yeni e-posta adresi"
                  className="focus:border-nova-blue mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none"
                  disabled={emailSaving}
                />

                {emailMessage && (
                  <Text
                    variant="bodySmall"
                    align="center"
                    className={`mb-3 ${emailMessage.includes('gönderildi') ? 'text-success' : 'text-error'}`}
                  >
                    {emailMessage}
                  </Text>
                )}

                <div className="space-y-2">
                  <Button
                    fullWidth
                    disabled={emailSaving || !newEmail.trim()}
                    onClick={() => void handleEmailChange()}
                  >
                    {emailSaving ? 'Gönderiliyor...' : 'Doğrulama E-postası Gönder'}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setShowEmailChange(false);
                    }}
                  >
                    Vazgeç
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
              onClick={() => {
                setShowDeleteConfirm(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Text variant="h4" align="center" className="mb-2">
                  ⚠️ Hesabı Sil
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                </Text>

                {hasPinSet && (
                  <>
                    <Text variant="bodySmall" align="center" className="text-text-secondary mb-3">
                      Onaylamak için PIN kodunuzu girin
                    </Text>
                    <div className="mb-4 flex justify-center gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-xl font-bold ${
                            deletePinInput.length > i
                              ? 'border-error bg-error/5'
                              : 'border-gray-200'
                          }`}
                        >
                          {deletePinInput.length > i ? '●' : ''}
                        </div>
                      ))}
                    </div>
                    <div className="mx-auto mb-4 grid max-w-50 grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key) => (
                        <button
                          key={String(key)}
                          disabled={deleting}
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${
                            key === null
                              ? 'invisible'
                              : 'bg-gray-100 transition-colors active:bg-gray-200'
                          }`}
                          onClick={() => {
                            if (key === 'del') {
                              setDeletePinInput((p) => p.slice(0, -1));
                              setDeleteError('');
                            } else if (key !== null && deletePinInput.length < 4) {
                              const newVal = deletePinInput + String(key);
                              setDeletePinInput(newVal);
                              setDeleteError('');
                            }
                          }}
                        >
                          {key === 'del' ? '⌫' : key !== null ? String(key) : ''}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {deleteError && (
                  <Text variant="bodySmall" align="center" className="text-error mb-3">
                    {deleteError}
                  </Text>
                )}

                <div className="space-y-2">
                  <Button
                    fullWidth
                    className="bg-error! text-white!"
                    disabled={deleting || (hasPinSet && deletePinInput.length !== 4)}
                    onClick={() => {
                      void (async () => {
                        setDeleting(true);
                        setDeleteError('');

                        try {
                          await removeAccount({ pin: deletePinInput || '0000' });
                          useAuthStore.getState().reset();
                          useChildStore.getState().reset();
                          void navigate('/onboarding');
                        } catch {
                          setDeleteError('Hesap silinemedi. PIN kodunu kontrol edin.');
                          setDeletePinInput('');
                        } finally {
                          setDeleting(false);
                        }
                      })();
                    }}
                  >
                    {deleting ? 'Siliniyor...' : 'Evet, Hesabı Sil'}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setShowDeleteConfirm(false);
                    }}
                  >
                    Vazgeç
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save */}
        <div className="pb-6">
          <Button
            fullWidth
            onClick={() => {
              handleSave();
            }}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>

          {/* Legal Links */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              className="text-xs text-gray-400 underline"
              onClick={() => { void navigate('/legal/privacy'); }}
            >
              Gizlilik Politikası
            </button>
            <span className="text-xs text-gray-300">·</span>
            <button
              className="text-xs text-gray-400 underline"
              onClick={() => { void navigate('/legal/terms'); }}
            >
              Kullanım Koşulları
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
