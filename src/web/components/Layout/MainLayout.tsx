
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import MobileFooter from './MobileFooter';
import { useTheme } from '@/hooks/use-theme';
import useIsMobile from '@/hooks/use-mobile';
import { useIOSHeaderFix } from '@/hooks/useIOSHeaderFix';
import SafeErrorBoundary from './SafeErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

interface MainLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  selectedClass?: any;
  setSelectedClass?: any;
  selectedCollege?: any;
  setSelectedCollege?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  isLoading = false,
  selectedClass,
  setSelectedClass,
  selectedCollege,
  setSelectedCollege
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  // Apply iOS header fix
  useIOSHeaderFix();
  
  // Get platform classes
  const getPlatformClasses = () => {
    let classes = 'layout-container transition-colors duration-300';
    
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform) {
      const isNative = window.Capacitor.isNativePlatform();
      if (isNative) {
        classes += ' capacitor';
        const platform = window.Capacitor.getPlatform();
        if (platform === 'ios') {
          classes += ' ios';
        } else if (platform === 'android') {
          classes += ' android';
        }
      }
    }
    
    if (isMobile) {
      classes += ' mobile';
    }
    
    return classes;
  };

  useEffect(() => {
    // Add dark class to html element based on theme
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege} />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner message="Loading..." />
        </main>
        {isMobile && <MobileFooter />}
      </div>
    );
  }

  // Use a single layout approach with CSS handling platform differences
  return (
    <SafeErrorBoundary>
      <div className={getPlatformClasses()}>
        <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege} />
        <main className={`main-content mt-12 ${
          isMobile 
            ? 'pb-44'
            : 'pb-16'
        }`}>
          <div className={`w-full ${isMobile ? 'px-4 py-6' : 'container mx-auto px-4 py-safe'}`}>
            {children}
          </div>
        </main>
        {isMobile && <MobileFooter />}
      </div>
    </SafeErrorBoundary>
  );
};

export default MainLayout;
