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
      const dynamicIslandHeight = Math.max(topValue, 12); // Further reduced minimum height for Dynamic Island
      
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
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Only update if there's a significant change in safe area AND we're not scrolling up too much
        const currentSafeArea = getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-top') || '0px';
        const newSafeArea = getComputedStyle(document.documentElement)
          .getPropertyValue('env(safe-area-inset-top)') || '0px';
        
        // Only update if the difference is significant (more than 5px) and we're not going too far up
        if (Math.abs(parseInt(currentSafeArea) - parseInt(newSafeArea)) > 5 && scrollTop > 50) {
          updateSafeArea();
        }
        
        lastScrollTop = scrollTop;
      }, 300); // Increased delay further to reduce frequency
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
