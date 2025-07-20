import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import AudioSection from '@/components/Audio/AudioSection';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const Audio = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">
        <AudioSection />
      </main>
      {isMobile ? (
        <MobileFooter />
      ) : (
        <footer className="py-8 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Audio; 