
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
  
  // Simple, clean layout like the working Courses page
  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar 
        selectedClass={selectedClass} 
        setSelectedClass={setSelectedClass} 
        selectedCollege={selectedCollege} 
        setSelectedCollege={selectedCollege} 
      />
      
      {/* Content wrapper with proper spacing for fixed header */}
      <div className="max-w-6xl mx-auto py-10 px-4">
        {children}
      </div>
      
      {/* Mobile footer only on mobile */}
      {platform.isMobile && <MobileFooter />}
    </div>
  );
};

export default MainLayout;
