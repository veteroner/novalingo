/**
 * StoryLibraryScreen
 *
 * Bağımsız hikaye kütüphanesi. Kullanıcı ders bağlamından çıkmadan
 * tüm micro-story'leri dünya ve tema filtresiyle keşfedebilir.
 */

import type { MicroStory } from '@/features/learning/data/storyBank';
import { storyBank } from '@/features/learning/data/storyBank';
import { getStoryCover, getStoryWorldId } from '@/features/learning/data/storyCovers';
import { Text } from '@components/atoms/Text';
import { MainLayout } from '@components/templates/MainLayout';
import { trackStoryLibraryOpened, trackStoryOpened } from '@services/analytics/analyticsService';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Etiketler i18n'den gelir (lesson.storyLibrary.worlds, id'ye göre); burada yalnızca emoji.
const WORLD_EMOJIS: Record<string, string> = {
  w1: '🌱',
  w2: '🏰',
  w3: '🌲',
  w4: '🏙️',
  w5: '🔬',
  w6: '🚀',
  w7: '🏖️',
  w8: '🍳',
  w9: '🎨',
  w10: '🏥',
  w11: '🌍',
  w12: '⏳',
};

const ALL_WORLDS = ['all', ...Object.keys(WORLD_EMOJIS)];

export default function StoryLibraryScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation('lesson');
  const [filterWorld, setFilterWorld] = useState<string>('all');

  useEffect(() => {
    trackStoryLibraryOpened();
  }, []);

  const filteredStories = useMemo(() => {
    if (filterWorld === 'all') return storyBank;
    return storyBank.filter((s) => getStoryWorldId(s.id) === filterWorld);
  }, [filterWorld]);

  return (
    <MainLayout headerOffset>
      {/* Header */}
      <motion.div
        className="from-primary-dark to-primary-dark rounded-b-3xl bg-linear-to-b px-4 py-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/home')}
          className="mb-2 text-sm font-semibold text-white/80"
        >
          {t('storyLibrary.backHome')}
        </button>
        <Text variant="h3" className="text-white">
          {t('storyLibrary.title')}
        </Text>
        <Text variant="bodySmall" className="text-white/80">
          {t('storyLibrary.subtitle', { count: storyBank.length })}
        </Text>
      </motion.div>

      {/* World Filter Chips */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3">
        {ALL_WORLDS.map((wid) => {
          const emoji = wid === 'all' ? '✨' : WORLD_EMOJIS[wid];
          if (!emoji) return null;
          const label = wid === 'all' ? t('storyLibrary.all') : t(`storyLibrary.worlds.${wid}`);
          return (
            <button
              key={wid}
              type="button"
              aria-pressed={filterWorld === wid}
              onClick={() => {
                setFilterWorld(wid);
              }}
              className={`flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                filterWorld === wid
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'bg-surface-elevated text-text-secondary hover:bg-border'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 py-2 pb-8">
        {filteredStories.length === 0 && (
          <div className="text-text-secondary col-span-2 py-10 text-center">
            <span className="text-4xl">📭</span>
            <Text variant="bodySmall" className="text-text-secondary mt-2">
              {t('storyLibrary.emptyWorld')}
            </Text>
          </div>
        )}
        {filteredStories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            index={index}
            onOpen={() => {
              trackStoryOpened({ storyId: story.id, worldId: getStoryWorldId(story.id) });
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
  const { t, i18n } = useTranslation('lesson');
  const cover = getStoryCover(story);
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const worldId = getStoryWorldId(story.id);
  const worldEmoji = WORLD_EMOJIS[worldId];
  const pageCount = story.data.pages.length;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="border-border bg-surface flex min-w-0 flex-col items-start rounded-2xl border p-3 text-left shadow-sm active:scale-95"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {/* Fixed square viewport shows one cell of the shared cover atlas. */}
      <div
        aria-hidden="true"
        className="bg-primary-soft relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl text-4xl"
      >
        {failedCover !== cover.src ? (
          <img
            src={cover.src}
            alt=""
            width={cover.tile == null ? 512 : 1536}
            height={cover.tile == null ? 512 : 1024}
            className={cover.tile == null ? 'h-full w-full object-cover' : 'absolute max-w-none'}
            style={
              cover.tile == null
                ? undefined
                : {
                    width: '300%',
                    height: '200%',
                    left: `${-(cover.tile % 3) * 100}%`,
                    top: `${-Math.floor(cover.tile / 3) * 100}%`,
                  }
            }
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onError={() => {
              setFailedCover(cover.src);
            }}
          />
        ) : (
          (worldEmoji ?? '📖')
        )}
      </div>

      {/* Title */}
      <Text variant="caption" weight="bold" className="text-text line-clamp-2">
        {i18n.language.startsWith('tr') ? story.titleTr : story.title}
      </Text>

      {/* Meta */}
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <span className="bg-primary-soft text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
          {story.theme}
        </span>
        <span className="text-text-secondary text-xs">
          {t('storyLibrary.pageCount', { count: pageCount })}
        </span>
      </div>
    </motion.button>
  );
}
