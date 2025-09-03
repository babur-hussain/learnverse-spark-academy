import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'mobile' | 'ios' | 'android';

export interface PlatformConfig {
  isWeb: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isCapacitor: boolean;
  isMobileWeb: boolean;
  isTablet: boolean;
  platform: Platform;
}

/**
 * Detect if the current device is a mobile device (including web browsers)
 */
const isMobileDevice = (): boolean => {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check screen size for mobile/tablet
  const isSmallScreen = window.innerWidth <= 768;
  const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || isSmallScreen || (isTabletSize && hasTouch);
};

/**
 * Detect if the current device is a tablet
 */
const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isTabletUA = /ipad|android(?=.*\b(mobile|tablet)|.*\b(android|samsung|htc|sony|lg|motorola|nokia|blackberry|opera mini|windows phone))/i.test(userAgent);
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTabletSize = (width >= 768 && width <= 1024) || (height >= 768 && height <= 1024);
  
  return isTabletUA || isTabletSize;
};

/**
 * Detect the current platform and return configuration
 */
export const detectPlatform = (): PlatformConfig => {
  const isCapacitor = Capacitor.isNativePlatform();
  const isWeb = !isCapacitor;
  const isMobileWeb = isWeb && isMobileDevice();
  const isTablet = isTabletDevice();
  
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
  } else if (isMobileWeb) {
    // Mobile web browser
    isMobile = true;
    platform = 'mobile';
    
    // Detect iOS vs Android for web browsers
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/i.test(userAgent)) {
      isIOS = true;
    } else if (/android/i.test(userAgent)) {
      isAndroid = true;
    }
  }

  return {
    isWeb,
    isMobile: isMobile || isMobileWeb,
    isIOS,
    isAndroid,
    isCapacitor,
    isMobileWeb,
    isTablet,
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


