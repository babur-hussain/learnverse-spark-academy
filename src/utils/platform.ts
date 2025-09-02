import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'mobile' | 'ios' | 'android';

export interface PlatformConfig {
  isWeb: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isCapacitor: boolean;
  platform: Platform;
}

/**
 * Detect the current platform and return configuration
 */
export const detectPlatform = (): PlatformConfig => {
  const isCapacitor = Capacitor.isNativePlatform();
  const isWeb = !isCapacitor;
  
  let platform: Platform = 'web';
  let isMobile = false;
  let isIOS = false;
  let isAndroid = false;

  if (isCapacitor) {
    isMobile = true;
    if (Capacitor.getPlatform() === 'ios') {
      platform = 'ios';
      isIOS = true;
    } else if (Capacitor.getPlatform() === 'android') {
      platform = 'android';
      isAndroid = true;
    } else {
      platform = 'mobile';
    }
  }

  return {
    isWeb,
    isMobile,
    isIOS,
    isAndroid,
    isCapacitor,
    platform
  };
};

/**
 * Check if current platform matches any of the provided platforms
 */
export const isPlatform = (...platforms: Platform[]): boolean => {
  const config = detectPlatform();
  return platforms.some(platform => {
    switch (platform) {
      case 'web':
        return config.isWeb;
      case 'mobile':
        return config.isMobile;
      case 'ios':
        return config.isIOS;
      case 'android':
        return config.isAndroid;
      default:
        return false;
    }
  });
};

/**
 * Get platform-specific configuration
 */
export const getPlatformConfig = () => {
  const config = detectPlatform();
  
  return {
    ...config,
    // Platform-specific features
    features: {
      pushNotifications: config.isMobile,
      biometricAuth: config.isMobile,
      camera: config.isMobile,
      fileSystem: config.isMobile,
      // Web-specific features
      localStorage: config.isWeb,
      serviceWorker: config.isWeb,
      // iOS specific
      faceID: config.isIOS,
      // Android specific
      fingerprint: config.isAndroid,
    }
  };
};

// Export default platform detection
export const platform = detectPlatform();
export default platform;


