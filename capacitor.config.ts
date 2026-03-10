import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novalingo.app',
  appName: 'NovaLingo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0D8FDB',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0D8FDB',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    AdMob: {
      // Test Ad IDs — gerçek ID'ler .env'den gelecek
      androidBannerAdId: 'ca-app-pub-3940256099942544/6300978111',
      androidInterstitialAdId: 'ca-app-pub-3940256099942544/1033173712',
      androidRewardedAdId: 'ca-app-pub-3940256099942544/5224354917',
      iosBannerAdId: 'ca-app-pub-3940256099942544/2934735716',
      iosInterstitialAdId: 'ca-app-pub-3940256099942544/4411468910',
      iosRewardedAdId: 'ca-app-pub-3940256099942544/1712485313',
      isTesting: true,
      // COPPA — çocuk içerikler için zorunlu
      tagForChildDirectedTreatment: true,
      maxAdContentRating: 'G',
    },
  },
};

export default config;
