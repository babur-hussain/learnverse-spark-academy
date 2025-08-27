import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const Cafes = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Internet Cafes</h1>
        <p className="text-lg text-muted-foreground">Discover and connect with featured internet cafes. (Coming soon!)</p>
      </main>
      {isMobile && <MobileFooter />}
    </div>
  );
};

export default Cafes; 