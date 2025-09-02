
import type { CapacitorConfig } from '@capacitor/cli';

const devUrl = process.env.VITE_DEV_URL;

const config: CapacitorConfig = {
  appId: 'com.learnverse.sparkacademy',
  appName: 'LearnVerse Spark Academy',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    allowNavigation: ['*'],
    cleartext: true,
    ...(devUrl ? { url: devUrl, hostname: 'localhost' } : {})
  },
  android: {
    useLegacyBridge: false
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsInlineMediaPlayback: true
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
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      androidStyle: 'LIGHT',
      iosOverlaysWebView: false,
      androidOverlaysWebView: false,
      iosStyle: 'LIGHT',
      hideStatusBar: true,
      iosHideStatusBar: true
    }
  }
};

export default config;
