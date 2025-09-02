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
      
      // Convert to number and add some padding
      const topValue = parseInt(safeAreaTopValue) || 0;
      const dynamicIslandHeight = Math.max(topValue, 47); // Minimum height for Dynamic Island
      
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
    
    // Update on scroll (for dynamic content)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateSafeArea, 100);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { safeAreaTop };
};
