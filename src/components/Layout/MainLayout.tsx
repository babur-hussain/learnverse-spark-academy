
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import MobileFooter from './MobileFooter';
import { useTheme } from '@/hooks/use-theme';
import useIsMobile from '@/hooks/use-mobile';
import SafeErrorBoundary from './SafeErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

interface MainLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  selectedClass?: any;
  setSelectedClass?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  isLoading = false,
  selectedClass,
  setSelectedClass
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Add dark class to html element based on theme
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    
    // Add a class to the HTML element when running in a Capacitor app
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform) {
      document.documentElement.classList.toggle('capacitor', 
        window.Capacitor.isNativePlatform());
        
      // Add platform-specific class for iOS devices
      if (window.Capacitor.getPlatform() === 'ios') {
        document.documentElement.classList.add('ios');
      }
    }
    
    // Add mobile class for specific mobile styles
    if (isMobile) {
      document.documentElement.classList.add('mobile');
    } else {
      document.documentElement.classList.remove('mobile');
    }
  }, [theme, isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner message="Loading..." />
        </main>
        {isMobile && <MobileFooter />}
      </div>
    );
  }

  return (
    <SafeErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
        <main style={{ marginTop: 'calc(56px + env(safe-area-inset-top, 32px))' }} className={`flex-grow transition-all duration-300 ${
          isMobile 
            ? 'pb-20 min-h-screen-safe' 
            : 'pb-8'
        }`}>
          <div className={`w-full ${isMobile ? 'px-4 py-2' : 'container mx-auto px-4 py-safe'}`}>
            {children}
          </div>
        </main>
        {isMobile && <MobileFooter />}
      </div>
    </SafeErrorBoundary>
  );
};

export default MainLayout;
