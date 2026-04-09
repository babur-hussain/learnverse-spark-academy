import React from 'react';
import { usePlatform } from '../../contexts/PlatformContext';
import { Platform } from '../../utils/platform';

interface PlatformWrapperProps {
  children: React.ReactNode;
  platforms?: Platform[];
  fallback?: React.ReactNode;
  webOnly?: boolean;
  mobileOnly?: boolean;
  iosOnly?: boolean;
  androidOnly?: boolean;
}

/**
 * PlatformWrapper - Conditionally renders content based on platform
 * 
 * @example
 * // Show only on web
 * <PlatformWrapper webOnly>
 *   <WebOnlyComponent />
 * </PlatformWrapper>
 * 
 * // Show on mobile (iOS and Android)
 * <PlatformWrapper mobileOnly>
 *   <MobileOnlyComponent />
 * </PlatformWrapper>
 * 
 * // Show on specific platforms
 * <PlatformWrapper platforms={['ios', 'android']}>
 *   <MobileComponent />
 * </PlatformWrapper>
 * 
 * // Show on web, fallback for mobile
 * <PlatformWrapper webOnly fallback={<MobileFallback />}>
 *   <WebComponent />
 * </PlatformWrapper>
 */
export const PlatformWrapper: React.FC<PlatformWrapperProps> = ({
  children,
  platforms = [],
  fallback = null,
  webOnly = false,
  mobileOnly = false,
  iosOnly = false,
  androidOnly = false
}) => {
  const { isPlatform } = usePlatform();

  // Determine which platforms to show content on
  let targetPlatforms: Platform[] = [];

  if (webOnly) {
    targetPlatforms = ['web'];
  } else if (mobileOnly) {
    targetPlatforms = ['mobile', 'ios', 'android'];
  } else if (iosOnly) {
    targetPlatforms = ['ios'];
  } else if (androidOnly) {
    targetPlatforms = ['android'];
  } else if (platforms.length > 0) {
    targetPlatforms = platforms;
  } else {
    // Default: show on all platforms
    targetPlatforms = ['web', 'mobile', 'ios', 'android'];
  }

  // Check if current platform matches target platforms
  const shouldShow = isPlatform(...targetPlatforms);

  if (shouldShow) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Convenience components for common use cases
export const WebOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PlatformWrapper webOnly fallback={fallback}>
    {children}
  </PlatformWrapper>
);

export const MobileOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PlatformWrapper mobileOnly fallback={fallback}>
    {children}
  </PlatformWrapper>
);

export const IOSOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PlatformWrapper iosOnly fallback={fallback}>
    {children}
  </PlatformWrapper>
);

export const AndroidOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PlatformWrapper androidOnly fallback={fallback}>
    {children}
  </PlatformWrapper>
);

export default PlatformWrapper;
