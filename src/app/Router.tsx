import { LoadingScreen } from '@components/atoms/Spinner/LoadingScreen';
import { useAuthStore } from '@stores/authStore';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// ===== Lazy-loaded Screens =====
// Auth
const LoginScreen = lazy(() => import('@features/auth/screens/LoginScreen'));
const OnboardingScreen = lazy(() => import('@features/auth/screens/OnboardingScreen'));
const CreateProfileScreen = lazy(() => import('@features/auth/screens/CreateProfileScreen'));

// Main
const HomeScreen = lazy(() => import('@features/home/screens/HomeScreen'));
const WorldMapScreen = lazy(() => import('@features/home/screens/WorldMapScreen'));

// Learning
const LessonScreen = lazy(() => import('@features/learning/screens/LessonScreen'));
const LessonResultScreen = lazy(() => import('@features/learning/screens/LessonResultScreen'));
const ReviewScreen = lazy(() => import('@features/learning/screens/ReviewScreen'));
const StoryLibraryScreen = lazy(() => import('@features/learning/screens/StoryLibraryScreen'));
const StoryViewerScreen = lazy(() => import('@features/learning/screens/StoryViewerScreen'));

// Conversation (standalone)
const ConversationTopicsScreen = lazy(
  () => import('@features/conversation/screens/ConversationTopicsScreen'),
);
const ConversationScreen = lazy(() => import('@features/conversation/screens/ConversationScreen'));
const ConversationResultScreen = lazy(
  () => import('@features/conversation/screens/ConversationResultScreen'),
);

// Gamification
const ProfileScreen = lazy(() => import('@features/gamification/screens/ProfileScreen'));
const ShopScreen = lazy(() => import('@features/gamification/screens/ShopScreen'));
const AchievementsScreen = lazy(() => import('@features/gamification/screens/AchievementsScreen'));
const CollectionScreen = lazy(() => import('@features/gamification/screens/CollectionScreen'));
const DailyQuestsScreen = lazy(() => import('@features/gamification/screens/DailyQuestsScreen'));

// Social
const LeaderboardScreen = lazy(() => import('@features/social/screens/LeaderboardScreen'));

// Parent
const ParentDashboard = lazy(() => import('@features/parent/screens/ParentDashboard'));
const ParentSettings = lazy(() => import('@features/parent/screens/ParentSettings'));
const SubscriptionScreen = lazy(() => import('@features/parent/screens/SubscriptionScreen'));

// ===== Route Guards =====
function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/home" replace />;

  return <>{children}</>;
}

// ===== Main Router =====
export function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingScreen />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/create-profile"
          element={
            <ProtectedRoute>
              <CreateProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world/:worldId"
          element={
            <ProtectedRoute>
              <WorldMapScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/topics"
          element={
            <ProtectedRoute>
              <ConversationTopicsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation"
          element={
            <ProtectedRoute>
              <ConversationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation/result"
          element={
            <ProtectedRoute>
              <ConversationResultScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:lessonId/result"
          element={
            <ProtectedRoute>
              <LessonResultScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoryLibraryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories/:storyId"
          element={
            <ProtectedRoute>
              <StoryViewerScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <ShopScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <AchievementsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <CollectionScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <DailyQuestsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardScreen />
            </ProtectedRoute>
          }
        />
        {/* Parent Routes — Parental Gate ile korunmalı */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute>
              <ParentSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionScreen />
            </ProtectedRoute>
          }
        />

        {/* Default & 404 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
}
