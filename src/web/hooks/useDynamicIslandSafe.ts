import { useEffect, useState } from 'react';

export const useDynamicIslandSafe = () => {
  const [safeAreaTop, setSafeAreaTop] = useState(0);

  useEffect(() => {
    const updateSafeArea = () => {
      // Get safe area inset for top (Dynamic Island area)
      const safeAreaTopValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--sat') || 
        getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)') || 
        '0px';
      
      // Convert to number and add minimal padding
      const topValue = parseInt(safeAreaTopValue) || 0;
      const dynamicIslandHeight = Math.max(topValue, 30); // Set to 30px for optimal spacing below Dynamic Island
      
      setSafeAreaTop(dynamicIslandHeight);
      
      // Update CSS custom properties
      document.documentElement.style.setProperty('--safe-area-inset-top', `${topValue}px`);
      document.documentElement.style.setProperty('--dynamic-island-height', `${dynamicIslandHeight}px`);
      
      // Force update of elements that need Dynamic Island spacing
      const elements = document.querySelectorAll('.dynamic-island-safe');
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.paddingTop = `${dynamicIslandHeight}px`;
          element.style.marginTop = `${topValue}px`;
        }
      });
    };

    // Update on mount
    updateSafeArea();
    
    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    
    // Update on resize
    window.addEventListener('resize', updateSafeArea);
    
    // Update on scroll (for dynamic content) - but be more conservative
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTop = 0;
    let defaultScrollPosition = 0;
    let isDefaultPositionSet = false;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Set default position on first scroll
      if (!isDefaultPositionSet) {
        defaultScrollPosition = scrollTop;
        isDefaultPositionSet = true;
      }
      
      // Prevent scrolling up beyond default position
      if (scrollTop < defaultScrollPosition) {
        window.scrollTo(0, defaultScrollPosition);
        return;
      }
      
      // Ensure content never gets too close to Dynamic Island during scroll
      // Force minimum spacing of 30px (25px + 5px extra) during scroll animations
      const currentSafeArea = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top') || '0px';
      const topValue = parseInt(currentSafeArea) || 0;
      const minScrollSpacing = Math.max(topValue, 30); // 5px more than default
      
      // Update spacing during scroll to prevent Dynamic Island overlap
      document.documentElement.style.setProperty('--dynamic-island-height', `${minScrollSpacing}px`);
      
      // Force update of elements during scroll
      const elements = document.querySelectorAll('.dynamic-island-safe');
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.paddingTop = `${minScrollSpacing}px`;
        }
      });
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Reset to normal spacing after scroll stops
        updateSafeArea();
      }, 300); // Slightly longer delay to ensure scroll animation completes
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { safeAreaTop };
};
