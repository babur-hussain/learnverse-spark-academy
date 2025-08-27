import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import NotesSection from '@/components/Notes/NotesSection';
import useIsMobile from '@/hooks/use-mobile';
import MobileFooter from '@/components/Layout/MobileFooter';

const Notes = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <NotesSection />
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

export default Notes;
