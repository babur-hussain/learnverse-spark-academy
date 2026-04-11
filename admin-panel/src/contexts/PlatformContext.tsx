// Simplified PlatformContext for admin panel — always desktop/web
import React, { createContext, useContext } from 'react';

interface PlatformConfig {
  isWeb: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isCapacitor: boolean;
}

interface PlatformContextType {
  platform: PlatformConfig;
  isPlatform: (...platforms: string[]) => boolean;
  isLoading: boolean;
}

const defaultPlatform: PlatformConfig = {
  isWeb: true,
  isMobile: false,
  isIOS: false,
  isAndroid: false,
  isCapacitor: false,
};

const PlatformContext = createContext<PlatformContextType>({
  platform: defaultPlatform,
  isPlatform: () => false,
  isLoading: false,
});

export const usePlatform = () => useContext(PlatformContext);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PlatformContext.Provider value={{
      platform: defaultPlatform,
      isPlatform: (...platforms) => platforms.includes('web'),
      isLoading: false,
    }}>
      {children}
    </PlatformContext.Provider>
  );
};
