/**
 * useCapacitorLifecycle
 *
 * Native uygulama yaşam döngüsü yönetimi:
 * - Android geri butonu → navigate back / confirm exit
 * - App pause/resume → audio durdur / sync tetikle
 * - SplashScreen → uygulama hazır olunca gizle
 * - StatusBar → tema rengi ayarla
 * - Deep link → URL routing
 */

import { stopSpeaking } from '@/services/speech/speechService';
import { isNative } from '@/utils/platform';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useCapacitorLifecycle(): void {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNative()) return;

    // ─── SplashScreen: uygulama hazır, splash'i gizle ───
    void SplashScreen.hide();

    // ─── StatusBar: başlangıç stili ───
    void StatusBar.setStyle({ style: Style.Light });
    void StatusBar.setBackgroundColor({ color: '#6c5ce7' });

    // ─── Android Back Button ───
    const backHandler = App.addListener('backButton', ({ canGoBack }) => {
      // Lesson ekranındaysa → confirm dialog yok, sadece geri git
      // Ana sayfadaysa → uygulamayı kapat
      if (
        location.pathname === '/home' ||
        location.pathname === '/login' ||
        location.pathname === '/'
      ) {
        void App.exitApp();
      } else if (canGoBack) {
        void navigate(-1);
      } else {
        void App.exitApp();
      }
    });

    // ─── App State: pause/resume ───
    const stateHandler = App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        stopSpeaking();
      }
    });

    // ─── Deep Links ───
    const urlHandler = App.addListener('appUrlOpen', ({ url }) => {
      try {
        const parsed = new URL(url);
        const path = parsed.pathname || parsed.hash.replace('#', '');
        if (path) {
          void navigate(path);
        }
      } catch {
        // Invalid URL — ignore
      }
    });

    return () => {
      void backHandler.then((h) => h.remove());
      void stateHandler.then((h) => h.remove());
      void urlHandler.then((h) => h.remove());
    };
  }, [navigate, location.pathname]);
}
