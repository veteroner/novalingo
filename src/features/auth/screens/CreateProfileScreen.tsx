/**
 * CreateProfileScreen
 *
 * Çocuk profili oluşturma — isim, yaş grubu seçimi, avatar.
 */

import type { AgeGroup } from '@/types';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { useCreateChild } from '@hooks/queries';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgeGroupOption {
  id: AgeGroup;
  label: string;
  range: string;
  emoji: string;
  color: string;
}

const ageGroups: AgeGroupOption[] = [
  { id: 'cubs', label: 'Yavrular', range: '4-6 yaş', emoji: '🐻', color: 'border-success' },
  { id: 'stars', label: 'Yıldızlar', range: '7-9 yaş', emoji: '⭐', color: 'border-nova-orange' },
  {
    id: 'legends',
    label: 'Efsaneler',
    range: '10-12 yaş',
    emoji: '🏆',
    color: 'border-nova-purple',
  },
];

interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
}

const avatars: AvatarOption[] = [
  { id: 'fox', emoji: '🦊', label: 'Tilki' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'lion', emoji: '🦁', label: 'Aslan' },
  { id: 'owl', emoji: '🦉', label: 'Baykuş' },
  { id: 'rabbit', emoji: '🐰', label: 'Tavşan' },
  { id: 'cat', emoji: '🐱', label: 'Kedi' },
  { id: 'dog', emoji: '🐶', label: 'Köpek' },
  { id: 'dragon', emoji: '🐉', label: 'Ejderha' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Astronot' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'star', emoji: '🌟', label: 'Yıldız' },
];

// Allow Unicode letters, spaces, and emoji only
const NAME_PATTERN = /^[\p{L}\p{Extended_Pictographic}\s]+$/u;

export default function CreateProfileScreen() {
  const navigate = useNavigate();
  const createChildMutation = useCreateChild();
  const [name, setName] = useState('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [step, setStep] = useState<'name' | 'age' | 'avatar'>('name');
  const [error, setError] = useState<string | null>(null);

  const isCreating = createChildMutation.isPending;

  const validateName = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return 'İsim en az 2 karakter olmalı';
    if (trimmed.length > 20) return 'İsim en fazla 20 karakter olabilir';
    if (!NAME_PATTERN.test(trimmed)) return 'İsimde yalnızca harf ve emoji kullanılabilir';
    return null;
  }, []);

  const nameError = name.length > 0 ? validateName(name) : null;
  const isNameValid = name.trim().length >= 2 && !nameError;

  const handleContinue = useCallback(() => {
    if (step === 'name' && isNameValid) {
      setStep('age');
      return;
    }

    if (step === 'age' && selectedAge) {
      setStep('avatar');
      return;
    }

    if (step === 'avatar' && selectedAvatar && selectedAge && !isCreating) {
      setError(null);
      createChildMutation.mutate(
        {
          name: name.trim(),
          ageGroup: selectedAge,
          avatarId: selectedAvatar,
        },
        {
          onSuccess: () => {
            void navigate('/home');
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Profil oluşturulamadı');
          },
        },
      );
    }
  }, [
    step,
    name,
    selectedAge,
    selectedAvatar,
    isNameValid,
    isCreating,
    navigate,
    createChildMutation,
  ]);

  return (
    <div className="from-nova-sky safe-area-top safe-area-bottom flex min-h-screen flex-col bg-linear-to-b to-white px-6">
      {/* Back button */}
      <div className="pt-4">
        {step !== 'name' && (
          <button
            onClick={() => {
              setStep(step === 'avatar' ? 'age' : 'name');
            }}
            className="text-nova-blue text-sm font-semibold"
          >
            ← Geri
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Text variant="h2" align="center" className="mb-2">
                Adın ne? 🎉
              </Text>
              <Text variant="body" align="center" className="text-text-secondary">
                Nova seni tanımak istiyor!
              </Text>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Adını yaz..."
              maxLength={20}
              className="focus:border-nova-blue h-14 w-full rounded-2xl border-3 border-gray-200 bg-white px-4 text-center text-xl font-bold transition-colors focus:outline-none"
              autoFocus
            />
            {nameError && (
              <Text variant="caption" align="center" className="text-error mt-1">
                {nameError}
              </Text>
            )}
          </motion.div>
        )}

        {step === 'age' && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Text variant="h2" align="center" className="mb-2">
                Yaşın kaç? 🎂
              </Text>
              <Text variant="body" align="center" className="text-text-secondary">
                Sana en uygun dersleri hazırlayalım!
              </Text>
            </div>

            <div className="space-y-3">
              {ageGroups.map((group) => (
                <Card
                  key={group.id}
                  variant="outlined"
                  pressable
                  padding="md"
                  onClick={() => {
                    setSelectedAge(group.id);
                  }}
                  className={
                    selectedAge === group.id ? `border-3 ${group.color} bg-white shadow-md` : ''
                  }
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{group.emoji}</span>
                    <div>
                      <Text variant="h4">{group.label}</Text>
                      <Text variant="bodySmall" className="text-text-secondary">
                        {group.range}
                      </Text>
                    </div>
                    {selectedAge === group.id && (
                      <motion.span
                        className="ml-auto text-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        ✅
                      </motion.span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'avatar' && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Text variant="h2" align="center" className="mb-2">
                Avatarını seç! 🎨
              </Text>
              <Text variant="body" align="center" className="text-text-secondary">
                Nova&apos;da seni temsil edecek karakteri seç!
              </Text>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatar.id);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-3 p-3 transition-all ${
                    selectedAvatar === avatar.id
                      ? 'border-nova-blue bg-nova-sky scale-105 shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-3xl">{avatar.emoji}</span>
                  <Text variant="caption" className="text-text-secondary">
                    {avatar.label}
                  </Text>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Continue Button */}
      <div className="space-y-2 pb-8">
        {error && (
          <Text variant="bodySmall" align="center" className="text-error">
            {error}
          </Text>
        )}
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={() => {
            handleContinue();
          }}
          disabled={
            isCreating ||
            (step === 'name' && !isNameValid) ||
            (step === 'age' && !selectedAge) ||
            (step === 'avatar' && !selectedAvatar)
          }
        >
          {isCreating
            ? 'Oluşturuluyor...'
            : step === 'avatar'
              ? 'Maceraya Başla! 🚀'
              : 'Devam Et →'}
        </Button>
      </div>
    </div>
  );
}
