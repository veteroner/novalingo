/**
 * ProfileScreen
 *
 * Çocuk profili — avatar, seviye, streak, istatistikler, başarımlar özeti.
 */

import novaMascot from '@assets/images/nova-mascot.svg';
import { Avatar } from '@components/atoms/Avatar';
import { Badge } from '@components/atoms/Badge';
import { ProgressBar } from '@components/atoms/ProgressBar';
import { Text } from '@components/atoms/Text';
import { Card } from '@components/molecules/Card';
import { CurrencyDisplay } from '@components/molecules/CurrencyDisplay';
import { XPDisplay } from '@components/molecules/XPDisplay';
import { MainLayout } from '@components/templates/MainLayout';
import { useChildStore } from '@stores/childStore';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ProfileScreen() {
  const child = useChildStore((s) => s.activeChild);
  const navigate = useNavigate();

  if (!child) return null;

  const stats = [
    { label: 'Tamamlanan Ders', value: child.completedLessons, emoji: '📚' },
    { label: 'Toplam Süre (dk)', value: child.totalPlayTimeMinutes, emoji: '📝' },
    { label: 'En Uzun Seri', value: child.longestStreak, emoji: '🔥' },
    { label: 'Toplam XP', value: child.totalXP, emoji: '⚡' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 px-4 py-6">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Avatar name={child.name} src={child.avatarId} size="xl" showLevel={child.level} />
          <Text variant="h3" className="mt-3">
            {child.name}
          </Text>
          <Badge variant="level" size="lg" className="mt-1">
            Seviye {child.level}
          </Badge>
        </motion.div>

        {/* XP Progress */}
        <XPDisplay currentXP={child.totalXP} level={child.level} />

        {/* Currency */}
        <Card variant="glass" padding="md">
          <div className="flex items-center justify-center">
            <CurrencyDisplay stars={child.stars} gems={child.gems} />
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} variant="filled" padding="md">
              <div className="text-center">
                <span className="text-2xl">{stat.emoji}</span>
                <Text variant="h4" className="mt-1">
                  {stat.value}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {stat.label}
                </Text>
              </div>
            </Card>
          ))}
        </div>

        {/* Nova Companion Status */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-4">
            <div className="bg-nova-blue/10 flex h-16 w-16 items-center justify-center rounded-full">
              <img src={novaMascot} alt="Nova" className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <Text variant="body" weight="bold">
                Nova
              </Text>
              <Text variant="caption" className="text-text-secondary">
                Aşama: {child.novaStage} · Mutluluk {child.novaHappiness}%
              </Text>
              <ProgressBar
                value={child.novaHappiness / 100}
                variant="xp"
                size="xs"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="space-y-2">
          {[
            { label: '🏆 Başarımlar', path: '/achievements' },
            { label: '📦 Koleksiyon', path: '/collection' },
            { label: '🛒 Mağaza', path: '/shop' },
            { label: '📊 Liderlik', path: '/leaderboard' },
          ].map((link) => (
            <Card
              key={link.label}
              variant="outlined"
              pressable
              padding="sm"
              onClick={() => navigate(link.path)}
            >
              <div className="flex items-center justify-between">
                <Text variant="body" weight="semibold">
                  {link.label}
                </Text>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
