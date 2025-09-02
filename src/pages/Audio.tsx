import React from 'react';
import AudioSection from '@/components/Audio/AudioSection';
import MainLayout from '@/components/Layout/MainLayout';

const Audio = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <AudioSection />
        </main>
        <footer className="py-8 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">© 2025 LearnVerse: Spark Academy. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default Audio; 