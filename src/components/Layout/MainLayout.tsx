
import React from 'react';
import Navbar from './Navbar';
import MobileFooter from './MobileFooter';
import { usePlatform } from '@/contexts/PlatformContext';

interface MainLayoutProps {
  children: React.ReactNode;
  selectedClass?: any;
  setSelectedClass?: any;
  selectedCollege?: any;
  setSelectedCollege?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  selectedClass,
  setSelectedClass,
  selectedCollege,
  setSelectedCollege
}) => {
  const { platform } = usePlatform();
  
  // Calculate bottom padding based on platform
  const getBottomPadding = () => {
    if (platform.isMobile) {
      return platform.isIOS ? 'pb-24' : 'pb-20'; // Extra padding for mobile footer
    }
    return 'pb-10';
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar 
        selectedClass={selectedClass} 
        setSelectedClass={setSelectedClass} 
        selectedCollege={selectedCollege} 
        setSelectedCollege={setSelectedCollege} 
      />
      
      {/* Content wrapper with proper spacing for fixed header and mobile footer */}
      <main className={`flex-1 main-content ${
        platform.isAndroid 
          ? 'w-full max-w-full mx-0 px-4' 
          : 'max-w-6xl mx-auto px-4'
      } py-10 mt-32 ${getBottomPadding()}`}>
        {children}
      </main>
      
      {/* Mobile footer only on mobile */}
      {platform.isMobile && <MobileFooter />}
    </div>
  );
};

export default MainLayout;
