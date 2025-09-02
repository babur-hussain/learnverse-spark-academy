import { useEffect } from 'react';

export const useIOSHeaderFix = () => {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (!isIOS) return;

    // Try to hide the status bar separator line
    const hideStatusBarSeparator = () => {
      // Add CSS to work with full screen approach
      const style = document.createElement('style');
      style.textContent = `
        /* Full screen approach - remove all overlays */
        body::before,
        body::after,
        html::before,
        html::after,
        #root::before,
        #root::after {
          display: none !important;
          content: none !important;
        }
        
        /* Ensure full screen with safe areas */
        body {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          min-height: 100dvh !important;
        }
        
        html {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
        }
        
        #root {
          min-height: 100vh !important;
          min-height: 100dvh !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Remove any borders */
        * {
          border-top: none !important;
          border-bottom: none !important;
        }
      `;
      document.head.appendChild(style);
    };

    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Apply full screen approach after a short delay
    setTimeout(hideStatusBarSeparator, 100);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
};
