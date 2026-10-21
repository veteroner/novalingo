// Local visual QA entry. Vite only builds index.html; this file is not a production route.
import '../src/styles/globals.css';
import '../src/i18n';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '../src/app/providers/ThemeProvider';
import { NovaCharacter } from '../src/components/molecules/NovaCharacter';
import HomeScreen from '../src/features/home/screens/HomeScreen';
import WorldMapScreen from '../src/features/home/screens/WorldMapScreen';
import ConversationScreen from '../src/features/conversation/screens/ConversationScreen';
import StoryTimeActivity from '../src/features/learning/components/activities/StoryTimeActivity';
import { getStory } from '../src/features/learning/data/storyBank';
import { getActiveEvent } from '../src/features/gamification/data/seasonalEvents';
import { useChildStore } from '../src/stores/childStore';
import { useAuthStore } from '../src/stores/authStore';

if (!import.meta.env.DEV) throw new Error('Visual fixture is only available in development');
const child = {
  id: 'visual-fixture',
  parentUid: 'visual-only',
  name: 'Kâşif',
  avatarId: 'owl',
  ageGroup: 'stars' as const,
  createdAt: Timestamp.now(),
  level: 4,
  totalXP: 420,
  currentLevelXP: 70,
  nextLevelXP: 100,
  stars: 24,
  gems: 8,
  currentStreak: 5,
  longestStreak: 5,
  lastActivityDate: '2026-10-21',
  streakFreezes: 0,
  novaStage: 'child' as const,
  novaHappiness: 90,
  novaOutfitId: null,
  leagueId: 'demo',
  leagueTier: 'bronze' as const,
  weeklyXP: 120,
  currentWorldId: 'w1',
  currentUnitId: 'w1_u1',
  completedLessons: 12,
  totalPlayTimeMinutes: 85,
};
useChildStore.setState({ activeChild: child, children: [child] });
useAuthStore.setState({ isLoading: false });
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, enabled: false } },
});
queryClient.setQueryData(['worlds'], []);
queryClient.setQueryData(['vocabulary', child.id], []);
queryClient.setQueryData(['lessonProgress', child.id], []);
queryClient.setQueryData(['eventProgress', child.id, getActiveEvent()?.id ?? ''], null);
const story = getStory('story-w2-nova-is-happy');
const view = new URLSearchParams(location.search).get('view') ?? 'home';

function Fixture() {
  const { toggleColorMode, colorMode } = useTheme();
  const { i18n } = useTranslation();
  const [mood, setMood] = useState<'idle' | 'listening' | 'celebrating'>('idle');
  return (
    <>
      <aside className="bg-surface border-border mx-auto flex max-w-md flex-wrap items-center gap-3 border-b p-3 text-xs">
        <strong>Yerel tasarım önizlemesi</strong>
        <button onClick={toggleColorMode}>
          {colorMode === 'light' ? 'Koyu tema' : 'Açık tema'}
        </button>
        <button onClick={() => void i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')}>
          TR / EN
        </button>
        <Link to="/home">Ana sayfa</Link>
        <Link to="/conversation">Sohbet</Link>
        <Link to="/story">Hikâye</Link>
        <Link to="/profile">Nova</Link>
      </aside>
      <Routes>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/world/:worldId" element={<WorldMapScreen />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/conversation/topics" element={<ConversationScreen />} />
        <Route
          path="/story"
          element={
            <div className="mx-auto max-w-md p-4">
              <h1 className="font-heading mb-4 text-2xl">Nova Mutlu!</h1>
              {story && <StoryTimeActivity data={story.data} onComplete={() => {}} />}
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="mx-auto max-w-md p-6 text-center">
              <h1 className="font-heading text-2xl">Nova</h1>
              <NovaCharacter size="hero" mood={mood} />
              <div className="flex flex-wrap justify-center gap-4">
                {(['idle', 'listening', 'celebrating'] as const).map((m) => (
                  <button
                    key={m}
                    className="border-border rounded-xl border p-3"
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <p className="p-8 text-center">
              Bu ekran görsel pilot kapsamı dışında. <Link to="/home">Ana sayfa</Link>
            </p>
          }
        />
      </Routes>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/' + view]}>
      <ThemeProvider>
        <Fixture />
      </ThemeProvider>
    </MemoryRouter>
  </QueryClientProvider>,
);
