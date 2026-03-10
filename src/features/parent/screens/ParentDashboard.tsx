/**
 * ParentDashboard
 *
 * Ebeveyn paneli — çocuğun istatistikleri, süre limitleri, içerik kontrolü.
 * PIN ile korumalı (4 haneli).
 */

import { Button } from '@components/atoms/Button';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { ListItem } from '@components/molecules/ListItem';
import { MainLayout } from '@components/templates/MainLayout';
import { verifyParentPin } from '@services/firebase/functions';
import { useAuthStore } from '@stores/authStore';
import { useChildStore } from '@stores/childStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const child = useChildStore((s) => s.activeChild);
  const user = useAuthStore((s) => s.user);
  const hasPinSet = user?.settings.parentPin != null;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // PIN gate
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <Text variant="h3" align="center" className="mb-2">
          🔒 Ebeveyn Paneli
        </Text>
        <Text variant="bodySmall" align="center" className="text-text-secondary mb-6">
          Devam etmek için PIN kodunuzu girin
        </Text>

        <div className="mb-6 flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-3 text-2xl font-bold ${pin.length > i ? 'border-nova-blue bg-nova-blue/5' : 'border-gray-200'}`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid max-w-xs grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key) => (
            <button
              key={String(key)}
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${key === null ? 'invisible' : 'bg-gray-100 transition-colors active:bg-gray-200'}`}
              onClick={() => {
                if (key === 'del') {
                  setPin((p) => p.slice(0, -1));
                  setPinError('');
                } else if (key !== null && pin.length < 4 && !verifying) {
                  const newPin = pin + String(key);
                  setPin(newPin);
                  setPinError('');
                  if (newPin.length === 4) {
                    if (!hasPinSet) {
                      // No PIN set yet — allow access, prompt to set PIN in settings
                      setIsUnlocked(true);
                      return;
                    }
                    setVerifying(true);
                    verifyParentPin({ pin: newPin })
                      .then(() => {
                        setIsUnlocked(true);
                      })
                      .catch(() => {
                        setPinError('Yanlış PIN kodu');
                        setPin('');
                      })
                      .finally(() => {
                        setVerifying(false);
                      });
                  }
                }
              }}
            >
              {key === 'del' ? '⌫' : key !== null ? String(key) : ''}
            </button>
          ))}
        </div>

        {pinError && (
          <Text variant="bodySmall" align="center" className="text-error mt-4">
            {pinError}
          </Text>
        )}

        {verifying && (
          <Text variant="bodySmall" align="center" className="text-text-secondary mt-4">
            Doğrulanıyor...
          </Text>
        )}
      </div>
    );
  }

  if (!child) return null;

  return (
    <MainLayout showNavigation={false}>
      <div className="space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h3">👨‍👩‍👧 Ebeveyn Paneli</Text>
            <Text variant="bodySmall" className="text-text-secondary">
              {child.name}&apos;in ilerleme raporu
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            Kapat
          </Button>
        </div>

        {/* Weekly Stats */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            Bu Hafta
          </Text>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Text variant="h3" className="text-nova-blue">
                {child.completedLessons}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Ders
              </Text>
            </div>
            <div>
              <Text variant="h3" className="text-success">
                {child.totalPlayTimeMinutes}dk
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Süre
              </Text>
            </div>
            <div>
              <Text variant="h3" className="text-nova-orange">
                {child.totalXP}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                XP
              </Text>
            </div>
          </div>
        </Card>

        {/* Learning Progress */}
        <Card variant="elevated" padding="md">
          <Text variant="h4" className="mb-3">
            Öğrenme İlerlemesi
          </Text>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">Kelime Bilgisi</span>
                <span className="text-text-secondary">{child.wordsLearned}/500</span>
              </div>
              <ProgressBar value={(child.wordsLearned || 0) / 500} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">Dinleme</span>
                <span className="text-text-secondary">
                  {Math.round(child.completedLessons * 3.75)}/200
                </span>
              </div>
              <ProgressBar value={Math.min((child.completedLessons * 3.75) / 200, 1)} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">Konuşma</span>
                <span className="text-text-secondary">
                  {Math.round(child.completedLessons * 1.67)}/100
                </span>
              </div>
              <ProgressBar value={Math.min((child.completedLessons * 1.67) / 100, 1)} />
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card variant="outlined" padding="none">
          <ListItem
            leading={<span>⏰</span>}
            title="Günlük Süre Limiti"
            subtitle="30 dakika"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>🔔</span>}
            title="Bildirimler"
            subtitle="Açık"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
            divider
          />
          <ListItem
            leading={<span>💳</span>}
            title="Abonelik"
            subtitle="Ücretsiz Plan"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/subscription')}
            divider
          />
          <ListItem
            leading={<span>👤</span>}
            title="Hesap Ayarları"
            trailing={<span className="text-gray-400">→</span>}
            onClick={() => navigate('/parent/settings')}
          />
        </Card>
      </div>
    </MainLayout>
  );
}
