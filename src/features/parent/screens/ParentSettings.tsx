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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('parent');
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
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinSaving, setPinSaving] = useState(false);
  const [deletePinInput, setDeletePinInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
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
      setEmailSuccess(false);
      setEmailMessage(t('settings.emailInvalid'));
      return;
    }

    const firebaseUser = getCurrentUser();
    if (!firebaseUser) {
      setEmailSuccess(false);
      setEmailMessage(t('settings.emailNoSession'));
      return;
    }

    setEmailSaving(true);
    setEmailMessage('');
    try {
      await verifyBeforeUpdateEmail(firebaseUser, trimmed);
      setEmailSuccess(true);
      setEmailMessage(t('settings.emailSent'));
      setNewEmail('');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setEmailSuccess(false);
      if (code === 'auth/requires-recent-login') {
        setEmailMessage(t('settings.emailRecentLogin'));
      } else if (code === 'auth/email-already-in-use') {
        setEmailMessage(t('settings.emailInUse'));
      } else {
        setEmailMessage(t('settings.emailFailed'));
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
            <Text variant="h3">{t('settings.title')}</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {t('settings.titleFor', { name: child?.name ?? '' })}
            </Text>
          </div>
        </div>

        {/* Time Limit */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            {t('settings.timeLimitTitle')}
          </Text>
          <Text variant="bodySmall" className="text-text-secondary mb-4">
            {t('settings.timeLimitDesc')}
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
                {t('settings.minutes', { count: limit })}
              </button>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            {t('settings.notificationsTitle')}
          </Text>
          <div className="space-y-1">
            <ListItem
              title={t('settings.dailyReminder')}
              subtitle={t('settings.dailyReminderDesc')}
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
              title={t('settings.weeklyReport')}
              subtitle={t('settings.weeklyReportDesc')}
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
              title={t('settings.achievementAlert')}
              subtitle={t('settings.achievementAlertDesc')}
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
              title={t('settings.inactivityAlert')}
              subtitle={t('settings.inactivityAlertDesc')}
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
            {t('settings.contentTitle')}
          </Text>
          <div className="space-y-1">
            <ListItem
              title={t('settings.socialFeatures')}
              subtitle={t('settings.socialFeaturesDesc')}
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
              title={t('settings.leaderboardItem')}
              subtitle={t('settings.leaderboardItemDesc')}
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
              title={t('settings.chat')}
              subtitle={t('settings.chatDesc')}
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
            {t('settings.accountTitle')}
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
              {hasPinSet ? t('settings.changePin') : t('settings.setPin')}
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
              {t('settings.changeEmail')}
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
              {exporting ? t('settings.exporting') : t('settings.exportData')}
            </Button>
            <Button variant="danger" size="md" fullWidth onClick={() => void handleSignOut()}>
              {t('settings.signOut')}
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
              {t('settings.deleteAccount')}
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
                  {hasPinSet ? t('settings.pinModalChange') : t('settings.pinModalSet')}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  {pinStep === 'current' && t('settings.pinStepCurrent')}
                  {pinStep === 'new' && t('settings.pinStepNew')}
                  {pinStep === 'confirm' && t('settings.pinStepConfirm')}
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
                                setPinSuccess(false);
                                setPinMessage(t('settings.pinMismatch'));
                                setConfirmPinInput('');
                              } else {
                                void (async () => {
                                  setPinSaving(true);

                                  try {
                                    await saveParentPin({
                                      pin: newPinInput,
                                      ...(hasPinSet ? { currentPin: currentPinInput } : {}),
                                    });
                                    setPinSuccess(true);
                                    setPinMessage(t('settings.pinSaved'));
                                    setTimeout(() => {
                                      setShowPinChange(false);
                                    }, 1000);
                                  } catch {
                                    setPinSuccess(false);
                                    setPinMessage(t('settings.pinSaveFailed'));
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
                    className={`mb-3 ${pinSuccess ? 'text-success' : 'text-error'}`}
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
                  {t('settings.cancel')}
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
                  {t('settings.emailModalTitle')}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-2">
                  {t('settings.emailCurrent', {
                    email: user?.email ?? t('settings.emailNotSet'),
                  })}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  {t('settings.emailModalDesc')}
                </Text>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailMessage('');
                  }}
                  placeholder={t('settings.emailPlaceholder')}
                  className="focus:border-nova-blue mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none"
                  disabled={emailSaving}
                />

                {emailMessage && (
                  <Text
                    variant="bodySmall"
                    align="center"
                    className={`mb-3 ${emailSuccess ? 'text-success' : 'text-error'}`}
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
                    {emailSaving ? t('settings.emailSending') : t('settings.emailSendCta')}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setShowEmailChange(false);
                    }}
                  >
                    {t('settings.cancel')}
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
                  {t('settings.deleteModalTitle')}
                </Text>
                <Text variant="bodySmall" align="center" className="text-text-secondary mb-4">
                  {t('settings.deleteModalDesc')}
                </Text>

                {hasPinSet && (
                  <>
                    <Text variant="bodySmall" align="center" className="text-text-secondary mb-3">
                      {t('settings.deletePinPrompt')}
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
                          setDeleteError(t('settings.deleteFailed'));
                          setDeletePinInput('');
                        } finally {
                          setDeleting(false);
                        }
                      })();
                    }}
                  >
                    {deleting ? t('settings.deleting') : t('settings.deleteConfirm')}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setShowDeleteConfirm(false);
                    }}
                  >
                    {t('settings.cancel')}
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
            {saveMutation.isPending ? t('settings.saving') : t('settings.save')}
          </Button>

          {/* Legal Links */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              className="text-xs text-gray-400 underline"
              onClick={() => {
                void navigate('/legal/privacy');
              }}
            >
              {t('settings.privacy')}
            </button>
            <span className="text-xs text-gray-300">·</span>
            <button
              className="text-xs text-gray-400 underline"
              onClick={() => {
                void navigate('/legal/terms');
              }}
            >
              {t('settings.terms')}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
