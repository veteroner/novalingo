// Local visual QA entry. Vite only builds index.html; this file is not a production route.
import '../src/styles/globals.css';
import '../src/i18n';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { MotionConfig } from 'framer-motion';
import { PracticeFixture } from './visual-practice';
import ProfileScreen from '../src/features/gamification/screens/ProfileScreen';
import DailyQuestsScreen from '../src/features/gamification/screens/DailyQuestsScreen';
import ShopScreen from '../src/features/gamification/screens/ShopScreen';
import AchievementsScreen from '../src/features/gamification/screens/AchievementsScreen';
import CollectionScreen from '../src/features/gamification/screens/CollectionScreen';
import StoryLibraryScreen from '../src/features/learning/screens/StoryLibraryScreen';
import StoryViewerScreen from '../src/features/learning/screens/StoryViewerScreen';
import LessonResultScreen from '../src/features/learning/screens/LessonResultScreen';
import ReviewScreen from '../src/features/learning/screens/ReviewScreen';
import CreateProfileScreen from '../src/features/auth/screens/CreateProfileScreen';
import { AgeScreenGate } from '../src/features/auth/screens/AgeScreenGate';
import { AGE_SCREEN_STORAGE_KEY, rememberAgeBand } from '../src/services/ageScreen/ageScreenPolicy';
import { markProfileConsentPassed } from '../src/services/parentGate/parentGateSession';
import OnboardingScreen from '../src/features/auth/screens/OnboardingScreen';
import ConversationTopicsScreen from '../src/features/conversation/screens/ConversationTopicsScreen';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '../src/app/providers/ThemeProvider';
import { NovaCharacter } from '../src/components/molecules/NovaCharacter';
import HomeScreen from '../src/features/home/screens/HomeScreen';
import WorldMapScreen from '../src/features/home/screens/WorldMapScreen';
import ConversationScreen from '../src/features/conversation/screens/ConversationScreen';
import StoryTimeActivity from '../src/features/learning/components/activities/StoryTimeActivity';
import { curriculum, getWorld } from '../src/features/learning/data/curriculum';
import { getStory } from '../src/features/learning/data/storyBank';
import { getActiveEvent } from '../src/features/gamification/data/seasonalEvents';
import { useChildStore } from '../src/stores/childStore';
import { useAuthStore } from '../src/stores/authStore';

if (!import.meta.env.DEV) throw new Error('Visual fixture is only available in development');
if (Capacitor.isNativePlatform()) void SplashScreen.hide();
const params = new URLSearchParams(location.search);
const fixtureWorld = getWorld(params.get('world') ?? 'w1') ?? curriculum[0]!;
const fixtureLessons = fixtureWorld.units.flatMap((unit) => unit.lessons);
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
  currentWorldId: fixtureWorld.id,
  currentUnitId: fixtureWorld.units[0]?.id ?? 'w1_u1',
  completedLessons: 12,
  totalPlayTimeMinutes: 85,
};
useChildStore.setState({ activeChild: child, children: [child] });
useAuthStore.setState({ isLoading: false });
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onMutate: () => {
      throw new Error('Local visual fixture: server writes are disabled');
    },
  }),
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, enabled: false } },
});
queryClient.setQueryData(['worlds'], []);
queryClient.setQueryData(['vocabulary', child.id], []);
const progressMode = params.get('progress') ?? 'started';
const completedLessons =
  progressMode === 'complete'
    ? fixtureLessons
    : progressMode === 'new'
      ? []
      : fixtureLessons.slice(0, 2);
queryClient.setQueryData(
  ['lessonProgress', child.id],
  completedLessons.map((lesson, index) => ({
    lessonId: lesson.id,
    starsEarned: index % 2 === 0 ? 3 : 2,
    completedAt: Timestamp.fromMillis(1),
  })),
);
for (const world of curriculum)
  for (const unit of world.units) queryClient.setQueryData(['lessons', world.id, unit.id], []);
queryClient.setQueryData(['eventProgress', child.id, getActiveEvent()?.id ?? ''], null);
// All explicitly-enabled screen queries use frozen fixtures; no live child data is read.
queryClient.setQueryData(
  ['quests', child.id],
  [
    {
      questId: 'visual-quest',
      progress: 1,
      target: 3,
      completed: false,
      claimed: false,
      definition: {
        id: 'visual-quest',
        type: 'complete_lessons',
        title: '3 ders tamamla',
        titleEn: 'Complete 3 lessons',
        description: '',
        target: 3,
        reward: { xp: 30, stars: 5, gems: 0 },
        difficulty: 'easy',
      },
    },
  ],
);
queryClient.setQueryData(['achievements', child.id], []);
queryClient.setQueryData(
  ['achievementCatalog'],
  [
    {
      id: 'visual-first',
      name: 'İlk keşif',
      description: 'İlk dersini tamamla',
      category: 'learning',
      rarity: 'common',
      target: 1,
      icon: '🌟',
    },
  ],
);
queryClient.setQueryData(['inventory', child.id], []);
for (const category of [
  'animals',
  'flags',
  'stickers',
  'characters',
  'landmarks',
  'foods',
  'vehicles',
])
  queryClient.setQueryData(['collectibles', category], []);
for (const category of ['avatars', 'themes', 'boosters', 'frames', 'effects', 'nova'])
  queryClient.setQueryData(['shopItems', category], []);
for (const query of queryClient.getQueryCache().getAll())
  queryClient.setQueryData(query.queryKey, query.state.data, { updatedAt: Date.now() + 86400000 });
const story = getStory('story-w2-nova-is-happy');
const setupMode = params.get('setup');
if (setupMode) {
  useChildStore.getState().reset();
  if (setupMode === 'fresh') localStorage.setItem(AGE_SCREEN_STORAGE_KEY, '{"version":0}');
  else
    rememberAgeBand(
      setupMode === 'adult' ? 'adult' : 'minor',
      setupMode === 'adult' ? undefined : 'stars',
    );
}
const view = params.get('view') ?? (setupMode ? 'onboarding' : 'home');

function Fixture() {
  const { toggleColorMode, colorMode } = useTheme();
  const { i18n } = useTranslation();
  const [mood, setMood] = useState<'idle' | 'listening' | 'celebrating'>('idle');
  return (
    <>
      <aside
        className="bg-surface border-border mx-auto flex max-w-6xl flex-wrap items-center gap-3 border-b p-3 text-xs"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <strong>Yerel test · {Capacitor.getPlatform()} · örnek profil</strong>
        <button onClick={toggleColorMode}>
          {colorMode === 'light' ? 'Koyu tema' : 'Açık tema'}
        </button>
        <button onClick={() => void i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')}>
          TR / EN
        </button>
        <Link to="/home">Ana sayfa</Link>
        <Link to={`/world/${fixtureWorld.id}`}>Dünyalar</Link>
        <Link to="/conversation">Sohbet</Link>
        <Link to="/story">Hikâye</Link>
        <Link to="/profile">Profil</Link>
        <Link to="/quests">Görevler</Link>
        <Link to="/shop">Mağaza</Link>
        <Link to="/stories">Kütüphane</Link>
        <Link to="/practice">Oyun</Link>
        <Link to="/onboarding">Tanıtım</Link>
        {setupMode && (
          <Link to="/setup-profile-preview" onClick={() => markProfileConsentPassed()}>
            Form testi (sunucuya yazılmaz)
          </Link>
        )}
      </aside>
      <Routes>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/world/:worldId" element={<WorldMapScreen />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/conversation/topics" element={<ConversationTopicsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/quests" element={<DailyQuestsScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/achievements" element={<AchievementsScreen />} />
        <Route path="/collection" element={<CollectionScreen />} />
        <Route path="/stories" element={<StoryLibraryScreen />} />
        <Route path="/stories/:storyId" element={<StoryViewerScreen />} />
        <Route path="/practice" element={<PracticeFixture />} />
        <Route path="/lesson/:lessonId" element={<PracticeFixture />} />
        <Route path="/lesson-result" element={<LessonResultScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/create-profile" element={<CreateProfileScreen key="setup-gated" />} />
        <Route
          path="/setup-profile-preview"
          element={<CreateProfileScreen key="setup-preview" />}
        />
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
          path="/poses"
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
  <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/' + view]}>
        <ThemeProvider>
          {setupMode ? (
            <AgeScreenGate>
              <Fixture />
            </AgeScreenGate>
          ) : (
            <Fixture />
          )}
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  </MotionConfig>,
);
