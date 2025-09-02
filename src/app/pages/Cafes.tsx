import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';

const Cafes = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Internet Cafes</h1>
        <p className="text-lg text-muted-foreground">Discover and connect with featured internet cafes. (Coming soon!)</p>
      </div>
    </MainLayout>
  );
};

export default Cafes; 