/**
 * StoryViewerScreen
 *
 * Tek bir micro-story'yi ders bağlamından bağımsız görüntüler.
 * StoryTimeActivity bileşenini doğrudan kullanır.
 * Tamamlandığında hikaye kütüphanesine döner.
 */

import type { ActivityOutcome } from '@/features/learning/components/activities';
import StoryTimeActivity from '@/features/learning/components/activities/StoryTimeActivity';
import { getStory } from '@/features/learning/data/storyBank';
import { Button } from '@components/atoms/Button';
import { Text } from '@components/atoms/Text';
import { trackStoryCompleted } from '@services/analytics/analyticsService';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function StoryViewerScreen() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();

  const story = storyId ? getStory(storyId) : undefined;
  const worldId = storyId ? (/^story-(w\d)/.exec(storyId)?.[1] ?? 'w1') : 'w1';

  useEffect(() => {
    // story_opened is tracked in StoryLibraryScreen on card tap; here we only track completion
  }, []);

  const handleComplete = useCallback(
    (_outcome: ActivityOutcome) => {
      if (storyId) trackStoryCompleted({ storyId, worldId });
      void navigate('/stories');
    },
    [navigate, storyId, worldId],
  );

  if (!story) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <Text variant="h3" align="center">
          Hikaye bulunamadı 😕
        </Text>
        <Button variant="primary" onClick={() => navigate('/stories')}>
          Kütüphaneye Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="safe-area-top safe-area-bottom flex min-h-screen flex-col bg-white">
      {/* Minimal header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => navigate('/stories')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg"
        >
          ←
        </button>
        <div>
          <Text variant="bodySmall" weight="bold">
            {story.titleTr}
          </Text>
          <Text variant="caption" className="text-gray-400">
            {story.data.pages.length} sayfa
          </Text>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <StoryTimeActivity data={story.data} onComplete={handleComplete} />
      </div>
    </div>
  );
}
