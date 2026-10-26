// Local visual QA entry. Vite only builds index.html; this file is not a production route.
import '../src/styles/globals.css';
import '../src/i18n';
import { SeasonalEventBanner } from '../src/features/gamification/components/SeasonalEventBanner';
import { DailyWheel } from '../src/components/organisms/DailyWheel';
import { ChildNameCard } from '../src/features/parent/components/ChildNameCard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { AppMotionProvider } from '../src/app/providers/AppMotionProvider';
import { PracticeFixture } from './visual-practice';
import ProfileScreen from '../src/features/gamification/screens/ProfileScreen';
import DailyQuestsScreen from '../src/features/gamification/screens/DailyQuestsScreen';
import SeasonalEventScreen from '../src/features/gamification/screens/SeasonalEventScreen';
import { LevelUpModal } from '../src/components/organisms/LevelUpModal';
import { AchievementPopup } from '../src/components/organisms/AchievementPopup';
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
import { WorldScene } from '../src/features/home/components/WorldScene';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useMotionPolicy } from '../src/hooks/useMotionPolicy';
import FlashCardActivity from '../src/features/learning/components/activities/FlashCardActivity';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '../src/app/providers/ThemeProvider';
import { NovaEvolutionModal } from '../src/components/organisms/NovaEvolutionModal';
import { NovaCharacter, type NovaMood } from '../src/components/molecules/NovaCharacter';
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
if (params.get('shop') === 'media') {
  queryClient.setQueryData(
    ['shopItems', 'avatars'],
    [
      {
        id: 'avatar_fox',
        name: 'Tilki',
        nameEn: 'Fox',
        category: 'avatars',
        price: 100,
        currency: 'stars',
        imageUrl: '/story/farm-v2/page-1.webp',
        isPremium: false,
      },
      {
        id: 'avatar_robot',
        name: 'Robot',
        nameEn: 'Robot',
        category: 'avatars',
        price: 250,
        currency: 'stars',
        imageUrl: '/missing-test-image.webp',
        isPremium: false,
      },
    ],
  );
}

const view = params.get('view') ?? (setupMode ? 'onboarding' : 'home');

function EvolutionFixture() {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6 text-center">
      <button className="rounded-xl border p-4" onClick={() => setOpen(true)}>
        Kutlamayı tekrar aç
      </button>
      <NovaEvolutionModal
        isOpen={open}
        oldStage="child"
        newStage="teen"
        onClose={() => setOpen(false)}
      />
      {!open && <p className="mt-4">Kutlama kapandı; öğrenmeye devam edebilirsin.</p>}
    </div>
  );
}

function RewardFixture() {
  const [levelOpen, setLevelOpen] = useState(true);
  const [achievementOpen, setAchievementOpen] = useState(false);
  return (
    <div className="p-6">
      <button className="rounded-xl border p-3" onClick={() => setLevelOpen(true)}>
        Seviye ödülü
      </button>
      <button className="rounded-xl border p-3" onClick={() => setAchievementOpen(true)}>
        Başarım ödülü
      </button>
      <LevelUpModal
        isOpen={levelOpen}
        level={5}
        rewards={{ stars: 150, gems: 20 }}
        onClose={() => setLevelOpen(false)}
      />
      <AchievementPopup
        isOpen={achievementOpen}
        onClose={() => setAchievementOpen(false)}
        achievement={{
          id: 'qa',
          name: 'İlk keşif',
          nameEn: 'First discovery',
          description: 'İlk dersini tamamladın.',
          descriptionEn: 'You completed your first lesson.',
          category: 'learning',
          rarity: 'rare',
          iconUrl: '',
          condition: { type: 'lessons', target: 1 },
          reward: { xp: 50, stars: 20, gems: 5 },
          isHidden: false,
          order: 0,
        }}
      />
    </div>
  );
}

function ReadabilityFixture() {
  const rewards = [
    ['10 ⭐', 'stars', 10],
    ['25 ⭐', 'stars', 25],
    ['50 ⭐', 'stars', 50],
    ['20 XP', 'xp', 20],
    ['50 XP', 'xp', 50],
    ['5 💎', 'gems', 5],
    ['10 💎', 'gems', 10],
    ['1 🧊', 'streak_freeze', 1],
  ] as const;
  const [spins, setSpins] = useState(0);
  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <SeasonalEventBanner />
      <section className="bg-surface border-border rounded-2xl border p-4">
        <p className="text-text-secondary mb-3 text-sm">Yerel çark testi · bakiye değişmez</p>
        <DailyWheel
          slices={rewards.map(([label, type, amount], i) => ({
            id: String(i),
            label,
            reward: { type, amount },
            weight: 1,
            color: '#4ECDC4',
            iconUrl: '',
          }))}
          canSpin
          onSpin={async () => {
            const index = spins % 2 === 0 ? 7 : 0;
            setSpins((count) => count + 1);
            return {
              sliceIndex: index,
              reward: { type: rewards[index]![1], amount: rewards[index]![2] },
            };
          }}
        />
      </section>
      <ChildNameCard childId="visual-fixture" currentName="Kâşif" />
    </div>
  );
}

function MotionFixture() {
  const policy = useMotionPolicy();
  const [history, setHistory] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setHistory((current) => [
      ...current.slice(-5),
      `${new Date().toLocaleTimeString()} active=${policy.isActive} reduced=${policy.reducedMotion}`,
    ]);
  }, [policy.isActive, policy.reducedMotion]);
  return (
    <div className="p-4">
      <div className="bg-surface border-border mb-4 rounded-xl border p-3 text-sm">
        <p>
          Gerçek yaşam döngüsü · active={String(policy.isActive)} · reduced=
          {String(policy.reducedMotion)} · animate={String(policy.canAnimate)}
        </p>
        <pre className="my-2 text-xs">{history.join('\n')}</pre>
        <div className="flex items-center gap-3">
          <NovaCharacter mood="celebrating" size="sm" />
          <span className="border-primary h-6 w-6 animate-spin rounded-full border-4 border-t-transparent" />
          <span>{done ? 'Kart tamamlandı' : 'Kart tamamlanmadı'}</span>
        </div>
      </div>
      <FlashCardActivity
        data={{
          type: 'flash-card',
          word: 'dog',
          translation: 'köpek',
          exampleSentence: 'A dog runs.',
          exampleTranslation: 'Bir köpek koşar.',
          audioUrl: '',
          imageUrl: '',
        }}
        onComplete={() => setDone(true)}
      />
    </div>
  );
}

function Fixture() {
  const { toggleColorMode, colorMode } = useTheme();
  const { i18n } = useTranslation();
  const [mood, setMood] = useState<NovaMood>('idle');
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
        <Route
          path="/scenes"
          element={
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 p-3">
              {curriculum.map((world) => (
                <section
                  key={world.id}
                  className="border-border bg-surface overflow-hidden rounded-2xl border"
                >
                  <WorldScene worldId={world.id} className="aspect-[3/2] w-full" />
                  <p className="text-text p-2 text-xs">
                    {world.order}. {i18n.language.startsWith('en') ? world.nameEn : world.name}
                  </p>
                </section>
              ))}
            </div>
          }
        />
        <Route path="/readability" element={<ReadabilityFixture />} />
        <Route path="/motion" element={<MotionFixture />} />
        <Route path="/rewards" element={<RewardFixture />} />
        <Route path="/event/:eventId" element={<SeasonalEventScreen />} />
        <Route path="/evolution" element={<EvolutionFixture />} />
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
                {(
                  [
                    'idle',
                    'listening',
                    'thinking',
                    'speaking',
                    'encouraging',
                    'sleeping',
                    'sad',
                    'celebrating',
                  ] as const
                ).map((m) => (
                  <button
                    key={m}
                    aria-label={m}
                    className="border-border flex flex-col items-center rounded-xl border p-2 text-xs"
                    aria-pressed={mood === m}
                    onClick={() => setMood(m)}
                  >
                    <NovaCharacter mood={m} size="sm" motionEnabled={false} decorative />
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
  <AppMotionProvider>
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
  </AppMotionProvider>,
);
