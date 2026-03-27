/**
 * StoryLibraryScreen
 *
 * Bağımsız hikaye kütüphanesi. Kullanıcı ders bağlamından çıkmadan
 * tüm micro-story'leri dünya ve tema filtresiyle keşfedebilir.
 */

import type { MicroStory } from '@/features/learning/data/storyBank';
import { storyBank } from '@/features/learning/data/storyBank';
import { Text } from '@components/atoms/Text';
import { MainLayout } from '@components/templates/MainLayout';
import { trackStoryLibraryOpened, trackStoryOpened } from '@services/analytics/analyticsService';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WORLD_LABELS: Record<string, { label: string; emoji: string }> = {
  w1: { label: 'Başlangıç Bahçesi', emoji: '🌱' },
  w2: { label: 'Gramer Kalesi', emoji: '🏰' },
  w3: { label: 'Hikaye Ormanı', emoji: '🌲' },
  w4: { label: 'Şehir Meydanı', emoji: '🏙️' },
  w5: { label: 'Bilim Adası', emoji: '🔬' },
  w6: { label: 'Macera Galaksisi', emoji: '🚀' },
};

function getWorldFromStoryId(storyId: string): string {
  const match = /^story-(w\d)/.exec(storyId);
  return match?.[1] ?? 'w1';
}

const ALL_WORLDS = ['all', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6'];

export default function StoryLibraryScreen() {
  const navigate = useNavigate();
  const [filterWorld, setFilterWorld] = useState<string>('all');

  useEffect(() => {
    trackStoryLibraryOpened();
  }, []);

  const filteredStories = useMemo(() => {
    if (filterWorld === 'all') return storyBank;
    return storyBank.filter((s) => getWorldFromStoryId(s.id) === filterWorld);
  }, [filterWorld]);

  return (
    <MainLayout headerOffset>
      {/* Header */}
      <motion.div
        className="from-nova-blue to-nova-blue/80 rounded-b-3xl bg-linear-to-b px-4 py-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/home')}
          className="mb-2 text-sm font-semibold text-white/80"
        >
          ← Ana Sayfa
        </button>
        <Text variant="h3" className="text-white">
          📖 Hikaye Kütüphanesi
        </Text>
        <Text variant="bodySmall" className="text-white/80">
          {storyBank.length} hikaye — okumaya başla!
        </Text>
      </motion.div>

      {/* World Filter Chips */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3">
        {ALL_WORLDS.map((wid) => {
          const info = wid === 'all' ? { label: 'Tümü', emoji: '✨' } : WORLD_LABELS[wid];
          if (!info) return null;
          return (
            <button
              key={wid}
              onClick={() => {
                setFilterWorld(wid);
              }}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                filterWorld === wid
                  ? 'bg-nova-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 py-2 pb-8">
        {filteredStories.length === 0 && (
          <div className="col-span-2 py-10 text-center text-gray-400">
            <span className="text-4xl">📭</span>
            <Text variant="bodySmall" className="mt-2 text-gray-400">
              Bu dünya için henüz hikaye yok.
            </Text>
          </div>
        )}
        {filteredStories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            index={index}
            onOpen={() => {
              trackStoryOpened({ storyId: story.id, worldId: getWorldFromStoryId(story.id) });
              void navigate(`/stories/${story.id}`);
            }}
          />
        ))}
      </div>
    </MainLayout>
  );
}

function StoryCard({
  story,
  index,
  onOpen,
}: {
  story: MicroStory;
  index: number;
  onOpen: () => void;
}) {
  const worldId = getWorldFromStoryId(story.id);
  const worldInfo = WORLD_LABELS[worldId];
  const pageCount = story.data.pages.length;

  return (
    <motion.button
      onClick={onOpen}
      className="flex flex-col items-start rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm active:scale-95"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {/* Theme Emoji area */}
      <div className="mb-2 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-50 text-3xl">
        {worldInfo?.emoji ?? '📖'}
      </div>

      {/* Title */}
      <Text variant="caption" weight="bold" className="line-clamp-2 text-gray-800">
        {story.titleTr}
      </Text>

      {/* Meta */}
      <div className="mt-1 flex items-center gap-1">
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
          {story.theme}
        </span>
        <span className="text-[10px] text-gray-400">{pageCount} sayfa</span>
      </div>
    </motion.button>
  );
}
