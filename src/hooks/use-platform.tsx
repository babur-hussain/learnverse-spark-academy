
import { useState, useEffect } from 'react';

type Platform = 'web' | 'ios' | 'android';

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>('web');
  const [isNative, setIsNative] = useState<boolean>(false);
  
  useEffect(() => {
    const detectPlatform = () => {
      // Check if running in a Capacitor native app
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        setIsNative(true);
        setPlatform(window.Capacitor.getPlatform() as Platform);
      } else {
        setIsNative(false);
        setPlatform('web');
      }
    };
    
    detectPlatform();
  }, []);
  
  return {
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isNative,
    isWeb: platform === 'web'
  };
}

export default usePlatform;
