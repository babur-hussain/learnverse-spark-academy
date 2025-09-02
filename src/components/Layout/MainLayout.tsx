
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

  // Get Android-specific classes for content centering
  const getAndroidClasses = () => {
    if (platform.isAndroid) {
      return 'android-content-fix';
    }
    return '';
  };
  
  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 flex flex-col ${getAndroidClasses()}`}>
      <Navbar 
        selectedClass={selectedClass} 
        setSelectedClass={setSelectedClass} 
        selectedCollege={selectedCollege} 
        setSelectedCollege={setSelectedCollege} 
      />
      
      {/* Content wrapper with proper spacing for fixed header and mobile footer */}
      <main className={`flex-1 main-content max-w-6xl mx-auto py-10 px-4 mt-32 ${getBottomPadding()} ${getAndroidClasses()}`}>
        <div className={platform.isAndroid ? 'android-content-wrapper' : ''}>
          {children}
        </div>
      </main>
      
      {/* Mobile footer only on mobile */}
      {platform.isMobile && <MobileFooter />}
    </div>
  );
};

export default MainLayout;
