import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novalingo.app',
  appName: 'NovaLingo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  // Webview'deki console.* çıktısını native log'a köprüler. Varsayılan 'debug' yalnızca
  // debug build'lerde çalışır; 'production' ile Release/TestFlight build'lerinde de
  // Xcode konsolunda (ve Console.app'te) görünür. Bkz. src/utils/logger.ts
  loggingBehavior: 'production',
  ios: {
    // 'never': güvenli alan boşluklarını CSS env(safe-area-inset-*) ile kendimiz
    // yönetiyoruz (globals.css `.safe-area-*`), WKWebView otomatik inset eklerse çift boşluk olur.
    contentInset: 'never',
    allowsLinkPreview: false,
    // Sayfa kaydırması WKWebView'in scroll view'ına bağlı; false olursa
    // ekranlar (ör. Ana Sayfa → Dünyalar listesi) hiç kaydırılamaz.
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#6c5ce7',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false, // We hide manually after app is ready
      backgroundColor: '#6c5ce7',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#6c5ce7',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Native Google/Apple girişi: kimlik bilgisi native hesap seçiciden alınır,
    // oturum Firebase JS SDK'sında açılır (src/services/firebase/auth.ts).
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
