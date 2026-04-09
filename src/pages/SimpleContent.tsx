import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';
import ContentManager from '@/components/SimpleContent/ContentManager';
import AuthGuard from '@/components/Layout/AuthGuard';

const SimpleContent: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <ContentManager />
        </main>
        
        {isMobile && <MobileFooter />}
      </div>
    </AuthGuard>
  );
};

export default SimpleContent;
