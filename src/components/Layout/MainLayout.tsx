
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import MobileFooter from './MobileFooter';
import useIsMobile from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedClass, setSelectedClass] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      <main className="pt-16 pb-20 lg:pb-0">
        {children}
      </main>
      {isMobile && user && <MobileFooter selectedClass={selectedClass} setSelectedClass={setSelectedClass} />}
    </div>
  );
};

export default MainLayout;
