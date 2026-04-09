import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import LiveClassRoom from '@/components/LiveClass/LiveClassRoom';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const LiveClass = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <LiveClassRoom />
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default LiveClass;
