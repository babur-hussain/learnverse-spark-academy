
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isAndroidDevice = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

export const isNativePlatform = (): boolean => {
  return window.Capacitor !== undefined && window.Capacitor.isNativePlatform();
};

export const getNativePlatform = (): 'ios' | 'android' | 'web' => {
  if (!window.Capacitor) return 'web';
  return window.Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

export const hasNotch = (): boolean => {
  // iOS notch detection
  if (isIOSDevice()) {
    // iOS 11 or later with a notch
    const iOS = parseFloat(
      `${navigator.userAgent.match(/OS (\d+)_/i)?.[1]}`
    );
    
    // iPhone X or newer
    if (iOS >= 11 && window.screen.height >= 812) {
      return true;
    }
  }
  
  // Android notch detection (rough estimate)
  if (isAndroidDevice()) {
    const ratio = window.devicePixelRatio || 1;
    const width = window.screen.width * ratio;
    const height = window.screen.height * ratio;
    
    // Most notched Android devices have an aspect ratio greater than 2:1
    return (height / width) >= 1.9;
  }
  
  return false;
};

// Add global declarations
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}
