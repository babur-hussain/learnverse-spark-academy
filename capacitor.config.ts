
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.learnverse.sparkacademy',
  appName: 'LearnVerse Spark Academy',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*.lovable.app', '*.github.io'],
    cleartext: true
  },
  android: {
    useLegacyBridge: false
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#8B5CF6',
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP'
    },
    CapacitorHttp: {
      enabled: true
    },
    KeyboardPlugin: {
      resize: true,
      style: 'DARK',
      resizeOnFullScreen: true
    }
  }
};

export default config;
