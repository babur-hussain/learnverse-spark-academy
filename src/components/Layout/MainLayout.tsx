
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import MobileFooter from './MobileFooter';
import { useTheme } from '@/hooks/use-theme';
import useIsMobile from '@/hooks/use-mobile';
import ErrorBoundary from '../ErrorBoundary';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className={`flex-grow ${isMobile ? 'pt-16 pb-20' : 'pt-16 pb-8'} transition-all`}>
          <div className="container mx-auto px-4 py-safe">
            {children}
          </div>
        </main>
        {isMobile && <MobileFooter />}
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
