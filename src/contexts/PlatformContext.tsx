import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, PlatformConfig, detectPlatform } from '../utils/platform';

interface PlatformContextType {
  platform: PlatformConfig;
  isPlatform: (...platforms: Platform[]) => boolean;
  isLoading: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

interface PlatformProviderProps {
  children: React.ReactNode;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const [platform, setPlatform] = useState<PlatformConfig>(detectPlatform());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect platform on mount
    const config = detectPlatform();
    setPlatform(config);
    setIsLoading(false);

    // Listen for platform changes (orientation, resize, etc.)
    const handleResize = () => {
      const newConfig = detectPlatform();
      setPlatform(newConfig);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isPlatform = (...platforms: Platform[]): boolean => {
    return platforms.some(platform => {
      switch (platform) {
        case 'web':
          return platform.isWeb;
        case 'mobile':
          return platform.isMobile;
        case 'ios':
          return platform.isIOS;
        case 'android':
          return platform.isAndroid;
        default:
          return false;
      }
    });
  };

  const value: PlatformContextType = {
    platform,
    isPlatform,
    isLoading
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
